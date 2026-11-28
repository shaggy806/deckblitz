/**
 * Planning our own turn: which moves, in which order, across both main phases
 * — and, for a close call, our next turn after it.
 *
 * v2 scores one move at a time, each rolled out with our seat passing, so a
 * line whose worth only shows several moves in — Dark Ritual, Dark Ritual,
 * Grave Titan; Act of Treason, the attack, then the sacrifice — scores its
 * first move as mana spent for nothing.
 * This looks as far as `depth`, by a beam search over our own moves, each
 * played until it has resolved and we have priority again
 * (`simulateSettled`), and a step through combat to our second main phase
 * (our attack as v1 makes it); every partial line is scored by passing out
 * the turn from there, as v2 scores a single move.
 *
 * **The opponents barely figure.** Within our turn they pass and block as v1
 * does; through their own turns, when the plan looks at our next one, they
 * pass and never attack. That keeps a line's worth about our own sequencing,
 * which is what this is for, and keeps it cheap: the retired deep horizons
 * spent their time playing the opponents' turns out.
 *
 * **It runs only where it could change the answer.** The caller asks it only
 * when some first move, once resolved, leaves another move to make (a
 * chain); a lone spell's best order is itself. A plan once made is replayed
 * window by window (`EvalBotController`'s `turnPlan`) while the board is the
 * one it was planned on, rather than searched again.
 *
 * It never plans with a card that was in our library
 * when it began: the rollout knows what a draw finds, and we don't. The one
 * exception is the top card where the seat can see it (`unknownCards`): a
 * card shown there and playable from there is known, as a card in hand is.
 */

import type { Action } from "../actions.js";
import type { CardRegistry } from "../cards.js";
import type { ControllerView, PlayerController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import { ownLibraryTopSeen } from "../view.js";
import { knownEnds } from "./seat-memory.js";
import {
  CombatRolloutController,
  DefendingRolloutController,
  rollout,
  rolloutAborted,
  simulateAction,
  simulateSettled,
  untilDeadline,
} from "./simulate.js";

/** A step of a plan: a move, or passing on to our second main phase through
 * combat. */
export type PlanStep = Action | "combat";

export interface PlannedLine {
  readonly steps: readonly PlanStep[];
  /** The board each step is played on (`boardKey`), in order: what a replay
   * checks before playing it. */
  readonly boards: readonly string[];
  /** The state each step is played on, in order: what a check of one step
   * (the crackback guard) reads. */
  readonly before: readonly GameState[];
  /** The line, then the turn passed out, scored. */
  readonly value: number;
  /** Where passing out the turn after it ended — the start of the next
   * player's turn — for a look at our next turn. */
  readonly end: GameState;
}

export interface TurnPlanHooks {
  /** The moves the search would consider on `view`'s board: our priority, a
   * main phase, nothing on the stack. */
  moves(view: ControllerView): readonly Action[];
  /** A state, scored for us; `line`, when the state is where a line of
   * moves ended, is those moves and the board each was made from, so an
   * interaction among them is scored as one (`interaction.ts`). */
  value(state: GameState, line?: { readonly steps: readonly PlanStep[]; readonly before: readonly GameState[] }): number;
  /** Whether a creature of ours could attack this turn on `state`'s board:
   * without one, passing through combat changes nothing a move after it is
   * worth, and the step isn't tried. */
  mayAttack(state: GameState): boolean;
  /** For a move whose outcome is the order of our own library (a reveal
   * from it), `state` dealt again that many more ways: the move is resolved
   * on each and the line goes on from the median one
   * (`EvalBotController.typicalDeal`'s reading, here). `null` for any other
   * move. */
  redeals?(state: GameState, move: Action): readonly GameState[] | null;
}

export interface TurnPlanLimits {
  /** Most moves in a line, a step through combat included. */
  readonly depth: number;
  /** Lines kept at each depth. */
  readonly beam: number;
  /** Most simulations — a move resolved, a step through combat, a turn
   * passed out — the whole plan may spend. */
  readonly simulations: number;
  /**
   * The clock of the decision the plan serves (`EvalBotOptions.timeBudgetMs`):
   * the plan stops with what it has scored so far once `out` says no other
   * simulation fits, and runs each one through `timed`, which charges it to
   * the decision's own tally (`EvalBotController.lastDecision`) and its
   * prediction. Absent, there's no clock, and a plan replays identically.
   */
  readonly clock?: PlanClock;
}

export interface PlanClock {
  out(): boolean;
  timed<T>(simulate: () => T): T;
}

/** The board a step is played on, as much of it as decides what the step
 * does: whose permanents and cards are where, life totals, our floating
 * mana. A replay that finds another board plans again. */
export function boardKey(state: GameState, me: PlayerId): string {
  const battlefield = [...state.zones.shared.battlefield].sort().join(",");
  const hand = [...(state.zones.perPlayer[me]?.hand ?? [])].sort().join(",");
  const life = state.turnOrder.map((p) => state.players[p]?.life ?? 0).join(",");
  const pool = state.players[me]?.manaPool.length ?? 0;
  return `${state.turn.number}|${state.turn.step}|${battlefield}|${hand}|${life}|${pool}`;
}

/**
 * The cards no planned line may use: our library as planning begins, since
 * the simulation knows its order and we don't — but for its top card when
 * the seat can see it (Future Sight, Oracle of Mul Daya, Glarb:
 * `ownLibraryTopSeen`). That one the seat knows, and a plan that left it out
 * priced a payment by a turn with no use for the mana while a spell it
 * could cast sat in plain sight (the gate's "pays a shock land's life to
 * cast the spell it sees on top of its library"; several of the bots' decks
 * carry such a permanent). The card under it stays unknown: the plan turns
 * it up, the seat hasn't yet. So do the cards the seat knows lie on top
 * because it put them there (`placed`, `SeatMemory.placed` for its own
 * library: a scry kept, a Brainstorm's two, a tutor's find): the run it can
 * name from the top (`knownEnds`) is its to plan with.
 */
export function unknownCards(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  placed?: ReadonlySet<ObjectId>,
): Set<ObjectId> {
  const library = state.zones.perPlayer[me]?.library ?? [];
  const unknown = new Set(library);
  const known = knownEnds(library, placed, ownLibraryTopSeen(state, registry, me)).top;
  for (let at = 0; at < known; at += 1) unknown.delete(library[at]);
  return unknown;
}

/** The ids of the cards a move uses, for the library check. */
const usedCard = (action: Action): ObjectId | undefined =>
  action.type === "cast-spell" || action.type === "play-land"
    ? action.card
    : action.type === "activate-ability"
      ? action.source
      : undefined;

/** Who makes our own attack in a plan's rollouts while a decision runs
 * (`withOurAttackSeat`): `null`, v1's. */
let ourAttackSeat: (() => PlayerController) | null = null;

/** Run `body` with `seat` making our own attack in every plan rollout it
 * runs (`EvalBotOptions.rolloutAttacks`); the one before is restored after. */
export function withOurAttackSeat<T>(seat: (() => PlayerController) | null, body: () => T): T {
  const before = ourAttackSeat;
  ourAttackSeat = seat;
  try {
    return body();
  } finally {
    ourAttackSeat = before;
  }
}

/** Every seat passing at priority and fighting combat as v1 — but for our
 * own, where `withOurAttackSeat` names one. */
function combatSeats(state: GameState, registry: CardRegistry, me?: PlayerId): Record<PlayerId, PlayerController> {
  const seats: Record<PlayerId, PlayerController> = {};
  for (const player of state.turnOrder) {
    seats[player] = player === me && ourAttackSeat !== null ? ourAttackSeat() : new CombatRolloutController(player, registry);
  }
  return seats;
}

const CEILING = 2_000;

/** From our first main phase, pass on through combat — our attack as v1's —
 * to our second, with priority back and nothing on the stack; `null` if the
 * turn ends first. */
function throughCombat(state: GameState, registry: CardRegistry, me: PlayerId): Game | null {
  return rollout(() => {
    const sim = Game.fromSnapshot({ ...state, eventLog: [] }, { registry, controllers: combatSeats(state, registry, me) });
    const turn = state.turn.number;
    sim.dispatch({ type: "pass-priority", player: me });
    let steps = 0;
    sim.advanceUntil(
      untilDeadline(
        (s) =>
          (steps += 1) > CEILING ||
          s.turn.number !== turn ||
          (s.turn.step === "postcombat-main" &&
            s.priority.holder === me &&
            s.awaiting === null &&
            s.zones.shared.stack.length === 0),
      ),
    );
    return sim.state.turn.number === turn && sim.state.turn.step === "postcombat-main" && !sim.state.result.over
      ? sim
      : null;
  });
}

/** Pass the rest of the turn out — our attack as v1's, if it's still to come
 * — to the start of the next player's turn. (What the opponents' turns then
 * do to that board is the caller's to add, in `TurnPlanHooks.value`:
 * `EvalBotOptions.rolloutSwingBack`.) */
function passOut(state: GameState, registry: CardRegistry, me: PlayerId): GameState | null {
  return rollout(() => {
    const sim = Game.fromSnapshot({ ...state, eventLog: [] }, { registry, controllers: combatSeats(state, registry, me) });
    const turn = state.turn.number;
    sim.dispatch({ type: "pass-priority", player: me });
    let steps = 0;
    sim.advanceUntil(untilDeadline((s) => (steps += 1) > CEILING || s.turn.number !== turn));
    return sim.state;
  });
}

/**
 * From where a turn of ours was passed out, on through the opponents' turns
 * — each passing, attacking no one — to our next first main phase, with
 * priority and nothing on the stack. `null` if the game ends or we never get
 * there.
 */
function toOurNextTurn(state: GameState, registry: CardRegistry, me: PlayerId): Game | null {
  return rollout(() => {
    const seats: Record<PlayerId, PlayerController> = {};
    for (const player of state.turnOrder) {
      seats[player] =
        player === me ? new CombatRolloutController(player, registry) : new DefendingRolloutController(player, registry);
    }
    const sim = Game.fromSnapshot({ ...state, eventLog: [] }, { registry, controllers: seats });
    let steps = 0;
    const ours = (s: GameState): boolean =>
      s.turnOrder[s.turn.activePlayerIndex] === me &&
      s.turn.step === "precombat-main" &&
      s.priority.holder === me &&
      s.awaiting === null &&
      s.zones.shared.stack.length === 0;
    sim.advanceUntil(untilDeadline((s) => (steps += 1) > CEILING * state.turnOrder.length || ours(s)));
    return ours(sim.state) && !sim.state.result.over ? sim : null;
  });
}

interface Node {
  readonly game: Game;
  /** The moves on this node's board, once asked. */
  moves?: readonly Action[];
  readonly steps: readonly PlanStep[];
  readonly boards: readonly string[];
  readonly before: readonly GameState[];
  readonly combatDone: boolean;
}

/** A first move the caller has already rolled out to the end of the turn
 * with our seat passing: where it ended, and that state's value. */
export interface ScoredFirst {
  readonly end: GameState;
  readonly value: number;
}

/**
 * The best lines for our turn from `state` (our priority, a main phase,
 * nothing on the stack), best first; `firsts` are the moves to start from,
 * as the caller listed them. Every line is at least one step long, so the
 * caller's own answer — a single move, or passing — is weighed beside them
 * by its own score.
 *
 * **A cut keeps what it paid for** (the bot audit's S4, 2026-11-10). Past
 * the first moves, a move is passed out and scored as soon as it has
 * resolved, the best line's moves before the next best's, so a plan the
 * simulations or the clock stop has every line it resolved; a level used to
 * resolve every move of every kept line before scoring any, and a cut level
 * scored none. And a kept line is one that can go on: a line with no step
 * left takes no place among the `beam`.
 *
 * **First moves the caller scored cost nothing** (`scored`): the one-move
 * search's rollout of a move, our seat passing to the end of the turn, is
 * the move resolved and then passed out, so its end is the one-step line's.
 * When every first move has one, they're resolved best first and only until
 * `beam` of them can go on; otherwise all of them, as before, since their
 * order isn't known until each is passed out.
 */
export function planTurn(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  firsts: readonly Action[],
  hooks: TurnPlanHooks,
  limits: TurnPlanLimits,
  /** Cards no line may use: what was in our library when planning began,
   * unseen (`unknownCards`). */
  unknown: ReadonlySet<ObjectId> = unknownCards(state, registry, me),
  /** Score nothing unless some first move, once resolved, leaves another
   * to make: then every line is one move the caller already weighed, and
   * finding that out costs only the moves resolved. Finished games are
   * still returned. */
  onlyIfChained = false,
  scored?: ReadonlyMap<Action, ScoredFirst>,
  /**
   * The caller's own answer, when it wasn't chosen by a line's measure (the
   * `"acting"` rollout): the first move whose line is kept among the `beam`
   * whatever passing out after it scored, so the lines it begins are weighed
   * beside the rest. Opt before Shiko's copied Bolt is worth nothing passed
   * out, and without this no line began with it.
   */
  lead?: Action,
): PlannedLine[] {
  let left = limits.simulations;
  const clock = limits.clock;
  const out = (): boolean => left <= 0 || (clock?.out() ?? false);
  // One simulation, counted against the plan's own ceiling and the clock's.
  const spend = <T>(simulate: () => T): T => {
    left -= 1;
    return clock === undefined ? simulate() : clock.timed(simulate);
  };
  const lines: PlannedLine[] = [];
  const done = (): PlannedLine[] => lines.sort((a, b) => b.value - a.value);
  const scoreLine = (node: Node): PlannedLine | null => {
    if (out()) return null;
    const end = spend(() => passOut(node.game.state, registry, me));
    if (end === null) return null;
    const line = { steps: node.steps, boards: node.boards, before: node.before, value: hooks.value(end, node), end };
    lines.push(line);
    return line;
  };
  const usable = (action: Action): boolean => {
    const id = usedCard(action);
    return id === undefined || !unknown.has(id);
  };
  const movesOf = (node: Node): readonly Action[] =>
    (node.moves ??= hooks.moves(node.game.controllerView(me)).filter(usable));
  /** `node` with `step` after it, on the board `game`. */
  const after = (node: Node, step: PlanStep, board: string, game: Game, combatDone = node.combatDone): Node => ({
    game,
    steps: [...node.steps, step],
    boards: [...node.boards, board],
    before: [...node.before, node.game.state],
    combatDone,
  });
  /**
   * `move` resolved on `node`'s board: the line so far, or `null` when it
   * never comes back to us. A move that ends the game is a finished line,
   * scored as it ended — a win, never expanded or passed out.
   * `simulateSettled` answers `null` for it, priority never coming back, so
   * a `null` is asked once more how the move resolves.
   */
  const settle = (node: Node, move: Action, board: string): Node | null => {
    const resolve = (from: GameState) =>
      spend(() => {
        const s = simulateSettled(from, registry, me, move);
        return [s, s === null ? simulateAction(from, registry, move, "stack", "combat") : s.state] as const;
      });
    let [settled, ended] = resolve(node.game.state);
    // A reveal from our own library: resolved on each deal, and the one
    // whose line passed out comes to the median goes on.
    const deals = settled === null || ended?.result.over === true ? null : (hooks.redeals?.(node.game.state, move) ?? null);
    if (settled !== null && deals !== null && deals.length > 0) {
      const tried: { readonly game: Game; readonly value: number }[] = [];
      for (const game of [settled, ...deals.map((deal) => (out() ? null : resolve(deal)[0]))]) {
        if (game === null || game.state.result.over || out()) continue;
        const end = spend(() => passOut(game.state, registry, me));
        if (end !== null) tried.push({ game, value: hooks.value(end) });
      }
      tried.sort((a, b) => a.value - b.value);
      const typical = tried[Math.floor((tried.length - 1) / 2)];
      if (typical !== undefined) {
        settled = typical.game;
        ended = typical.game.state;
      }
    }
    if (ended?.result.over === true) {
      const line = after(node, move, board, node.game);
      lines.push({ steps: line.steps, boards: line.boards, before: line.before, value: hooks.value(ended, line), end: ended });
      return null;
    }
    return settled === null ? null : after(node, move, board, settled);
  };
  /**
   * Through combat, when something is still to do in the second main phase
   * and a creature of ours could attack first: a line that only passes is
   * the caller's own "pass", and with nothing to attack with, a move after
   * combat is the same move before it.
   */
  const combat = (node: Node, board: string): Node | null => {
    if (node.combatDone || out() || !hooks.mayAttack(node.game.state)) return null;
    const fought = spend(() => throughCombat(node.game.state, registry, me));
    if (fought === null) return null;
    const child = after(node, "combat", board, fought, true);
    return movesOf(child).length > 0 ? child : null;
  };
  /** Whether a line has a step left to try. */
  const goesOn = (node: Node): boolean =>
    movesOf(node).length > 0 || (!node.combatDone && hooks.mayAttack(node.game.state));
  /** The best `beam` of `children` that can go on, best first. */
  const keep = (children: { node: Node; value: number }[]): Node[] => {
    const kept: Node[] = [];
    for (const child of children.sort((a, b) => b.value - a.value)) {
      if (kept.length >= limits.beam) break;
      if (goesOn(child.node)) kept.push(child.node);
    }
    return kept;
  };

  if (limits.depth <= 0) return lines;
  const root: Node = {
    game: Game.fromSnapshot(state, { registry }),
    steps: [],
    boards: [],
    before: [],
    combatDone: state.turn.step !== "precombat-main",
  };
  const rootBoard = boardKey(state, me);

  // The first moves. One the caller scored is a line already; the rest are
  // lines once resolved and passed out.
  const starts = firsts.filter(usable);
  const given = (move: Action): ScoredFirst | undefined => scored?.get(move);
  const allGiven = starts.every((move) => given(move) !== undefined);
  for (const move of starts) {
    const first = given(move);
    if (first !== undefined) {
      lines.push({ steps: [move], boards: [rootBoard], before: [state], value: first.value, end: first.end });
    }
  }
  const ordered = allGiven
    ? [...starts].sort((a, b) => (given(b)?.value ?? 0) - (given(a)?.value ?? 0))
    : starts;
  const pending: Node[] = [];
  let open = 0;
  for (const move of ordered) {
    if (out() || (allGiven && open >= limits.beam)) break;
    // A game the caller's rollout ended is a finished line, already in.
    if (given(move)?.end.result.over === true) continue;
    const child = settle(root, move, rootBoard);
    if (child === null) continue;
    pending.push(child);
    if (allGiven && goesOn(child)) open += 1;
  }
  const fought = combat(root, rootBoard);
  if (fought !== null) pending.push(fought);
  if (onlyIfChained && !pending.some((n) => n.steps[0] === "combat" || movesOf(n).length > 0)) return done();
  const children: { node: Node; value: number }[] = [];
  for (const child of pending) {
    const move = child.steps[0];
    const first = move === undefined || move === "combat" ? undefined : given(move);
    const value = first?.value ?? scoreLine(child)?.value;
    if (value !== undefined) children.push({ node: child, value });
  }
  let frontier = limits.depth > 1 ? keep(children) : [];
  const led = lead === undefined ? undefined : children.find((c) => c.node.steps[0] === lead)?.node;
  if (limits.depth > 1 && led !== undefined && !frontier.includes(led) && goesOn(led)) {
    frontier = [led, ...frontier.slice(0, Math.max(0, limits.beam - 1))];
  }

  for (let depth = 1; depth < limits.depth && frontier.length > 0 && !out(); depth += 1) {
    const next: { node: Node; value: number }[] = [];
    const score = (child: Node | null): void => {
      const line = child === null ? null : scoreLine(child);
      if (child !== null && line !== null) next.push({ node: child, value: line.value });
    };
    for (const node of frontier) {
      const board = boardKey(node.game.state, me);
      for (const move of movesOf(node)) {
        if (out()) break;
        score(settle(node, move, board));
      }
      score(combat(node, board));
    }
    frontier = depth + 1 < limits.depth ? keep(next) : [];
  }
  return done();
}

/**
 * `steps` played in order from `state` as `planTurn` plays a line — each move
 * resolved, `"combat"` passed through — then the turn passed out and scored:
 * the line those steps make. `null` when the engine refuses one of them
 * there, one never comes back to us, or the game ends on the way. For an
 * order of a line's moves `planTurn` never tried: its beam starts from the
 * best few first moves, and a payoff alone is seldom one of them
 * (`EvalBotController.planLines` moves it to the front).
 */
export function replayLine(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  steps: readonly PlanStep[],
  hooks: TurnPlanHooks,
): PlannedLine | null {
  let game = Game.fromSnapshot(state, { registry });
  const boards: string[] = [];
  const before: GameState[] = [];
  for (const step of steps) {
    boards.push(boardKey(game.state, me));
    before.push(game.state);
    const next =
      step === "combat" ? throughCombat(game.state, registry, me) : simulateSettled(game.state, registry, me, step);
    if (next === null || next.state.result.over) return null;
    game = next;
  }
  const end = passOut(game.state, registry, me);
  return end === null ? null : { steps, boards, before, value: hooks.value(end, { steps, before }), end };
}

/**
 * Whether two ends of the same turn differ only in what the seat can't know
 * as it plans: which cards of its library went where. Every player's life
 * and counters, every permanent (its controller, name, counters, how many a
 * stack stands for, and for ours whether it's tapped) and the size of every
 * hand, library and graveyard and of exile are the same.
 *
 * A plan's rollouts turn the library up in its real order, which the seat
 * doesn't know. Two orders of the same moves — a draw before an exile, or
 * after it — then end with different cards in hand and score a little apart
 * (a land for a spell: 0.4) for no reason the seat could act on.
 */
export function sameKnownEnd(a: GameState, b: GameState, me: PlayerId): boolean {
  if (a.result.over || b.result.over) return false;
  const permanents = (state: GameState): string =>
    state.zones.shared.battlefield
      .map((id) => {
        const o = state.objects[id];
        if (o === undefined) return "";
        const tapped = o.controller === me ? o.tapped : "";
        return `${o.controller}|${o.cardName}|${JSON.stringify(o.counters)}|${o.stackCount ?? 1}|${tapped}`;
      })
      .sort()
      .join(";");
  const players = (state: GameState): string =>
    state.turnOrder
      .map((p) => {
        const player = state.players[p];
        const zones = state.zones.perPlayer[p];
        const sizes = `${zones?.hand.length}|${zones?.library.length}|${zones?.graveyard.length}`;
        return `${player?.life}|${player?.hasLost}|${JSON.stringify(player?.counters)}|${sizes}`;
      })
      .join(";");
  return (
    a.zones.shared.exile.length === b.zones.shared.exile.length &&
    a.zones.shared.stack.length === b.zones.shared.stack.length &&
    players(a) === players(b) &&
    permanents(a) === permanents(b)
  );
}

/** Passing, as a line of no steps: the turn passed out from `state`. `null`
 * if the rollout fell over. */
export function passLine(state: GameState, registry: CardRegistry, me: PlayerId, hooks: TurnPlanHooks): PlannedLine | null {
  const end = passOut(state, registry, me);
  return end === null ? null : { steps: [], boards: [], before: [], value: hooks.value(end), end };
}

/**
 * What a line's turn is worth once our next turn is played on from it: the
 * opponents' turns passed through without attacks (`toOurNextTurn`), then
 * the best line for that turn by `planTurn`, never with a card we don't know
 * of yet. Falls back on the end of the turn itself when we never get there —
 * a won game, a lost one. `null` when the decision's deadline stopped one of
 * its rollouts (`rolloutAborted`): the turn's own end, or a turn half
 * planned, is another state's value and not this line's (the bot audit's S2).
 */
export function nextTurnValue(
  line: PlannedLine,
  registry: CardRegistry,
  me: PlayerId,
  hooks: TurnPlanHooks,
  limits: TurnPlanLimits,
  unknown: ReadonlySet<ObjectId>,
): number | null {
  if (line.end.result.over) return hooks.value(line.end);
  const next = toOurNextTurn(line.end, registry, me);
  if (next === null) return rolloutAborted() ? null : hooks.value(line.end);
  const view = next.controllerView(me);
  const firsts = hooks.moves(view).filter((a) => {
    const id = usedCard(a);
    return id === undefined || !unknown.has(id);
  });
  const passed = passOut(next.state, registry, me);
  if (passed === null && rolloutAborted()) return null;
  const idle = passed === null ? hooks.value(next.state) : hooks.value(passed);
  const best = planTurn(next.state, registry, me, firsts, hooks, limits, unknown)[0];
  if (limits.clock?.out() === true && rolloutAborted()) return null;
  return Math.max(idle, best?.value ?? -Infinity);
}

/**
 * From `state`, in our own turn, on to our next main-phase priority of the
 * same turn with nothing on the stack and nothing asked: the stack resolved,
 * the steps before the main phase passed through, v1 answering what comes up.
 * `{ ended }` where the turn ends first — every main phase left skipped
 * (Fatespinner's "main phase"), our attack played as v1's on the way, as
 * `passOut` plays it — with the state the next turn begins on, or the game's
 * end. `null` past the step ceiling or the deadline.
 */
function toOurMainPhase(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
): { readonly main: Game } | { readonly ended: GameState } | null {
  return rollout(() => {
    const sim = Game.fromSnapshot({ ...state, eventLog: [] }, { registry, controllers: combatSeats(state, registry, me) });
    const turn = state.turn.number;
    let steps = 0;
    const ours = (s: GameState): boolean =>
      s.turn.number === turn &&
      (s.turn.step === "precombat-main" || s.turn.step === "postcombat-main") &&
      s.priority.holder === me &&
      s.awaiting === null &&
      s.zones.shared.stack.length === 0;
    sim.advanceUntil(untilDeadline((s) => (steps += 1) > CEILING || s.turn.number !== turn || ours(s)));
    if (sim.state.result.over || sim.state.turn.number !== turn) return { ended: sim.state };
    return ours(sim.state) ? { main: sim } : null;
  });
}

/**
 * What the rest of our turn is worth from `state`: an answer given in our own
 * turn, before or in a main phase, priced by the turn it leaves us. On to
 * our next main-phase priority (`toOurMainPhase`), then the better of passing
 * the turn out and the best line `planTurn` finds there, never with a card
 * that was in our library when the question was asked (`unknown`: the draw
 * step's card, when the question came in our upkeep).
 *
 * This is what a rollout that passes our seat can't say: mana an answer
 * spends is mana the turn's plan doesn't have, and here the plan is made
 * without it. Nor can it see a main phase an answer skips (Fatespinner's
 * choice: 2026-11-25, bots skipped their main phase 29 times in one game,
 * holding lands and a full hand, since passing our seat it cost nothing): an
 * answer that leaves no main phase this turn is priced by the turn played
 * out without one. `null` when the decision's deadline stopped it, or the
 * turn ran past the step ceiling (the caller's own rollout then stands for
 * the answer).
 */
export function restOfTurnValue(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  hooks: TurnPlanHooks,
  limits: TurnPlanLimits,
  unknown: ReadonlySet<ObjectId>,
): number | null {
  if (state.result.over) return hooks.value(state);
  const reached = toOurMainPhase(state, registry, me);
  if (reached === null) return null;
  if ("ended" in reached) return hooks.value(reached.ended);
  const main = reached.main;
  const firsts = hooks.moves(main.controllerView(me)).filter((a) => {
    const id = usedCard(a);
    return id === undefined || !unknown.has(id);
  });
  const passed = passOut(main.state, registry, me);
  if (passed === null && rolloutAborted()) return null;
  const idle = passed === null ? hooks.value(main.state) : hooks.value(passed);
  const best = planTurn(main.state, registry, me, firsts, hooks, limits, unknown)[0];
  if (limits.clock?.out() === true && rolloutAborted()) return null;
  return Math.max(idle, best?.value ?? -Infinity);
}
