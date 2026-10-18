/**
 * Planning our own turn: which moves, in which order, across both main phases
 * — and, for a close call, our next turn after it.
 *
 * v2 scores one move at a time, each rolled out with our seat passing, so a
 * line whose worth only shows several moves in — Dark Ritual, Dark Ritual,
 * Grave Titan; Act of Treason, the attack, then the sacrifice — scores its
 * first move as mana spent for nothing. `followUps` looks one move further.
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
 * As `followUps` does, it never plans with a card that was in our library
 * when it began: the rollout knows what a draw finds, and we don't.
 */

import type { Action } from "../actions.js";
import type { CardRegistry } from "../cards.js";
import type { ControllerView, PlayerController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import { CombatRolloutController, DefendingRolloutController, simulateAction, simulateSettled } from "./simulate.js";

/** A step of a plan: a move, or passing on to our second main phase through
 * combat. */
export type PlanStep = Action | "combat";

export interface PlannedLine {
  readonly steps: readonly PlanStep[];
  /** The board each step is played on (`boardKey`), in order: what a replay
   * checks before playing it. */
  readonly boards: readonly string[];
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
  /** A state, scored for us. */
  value(state: GameState): number;
}

export interface TurnPlanLimits {
  /** Most moves in a line, a step through combat included. */
  readonly depth: number;
  /** Lines kept at each depth. */
  readonly beam: number;
  /** Most simulations — a move resolved, a step through combat, a turn
   * passed out — the whole plan may spend. */
  readonly simulations: number;
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

/** The ids of the cards a move uses, for the library check. */
const usedCard = (action: Action): ObjectId | undefined =>
  action.type === "cast-spell" || action.type === "play-land"
    ? action.card
    : action.type === "activate-ability"
      ? action.source
      : undefined;

/** Every seat passing at priority and fighting combat as v1. */
function combatSeats(state: GameState, registry: CardRegistry): Record<PlayerId, PlayerController> {
  const seats: Record<PlayerId, PlayerController> = {};
  for (const player of state.turnOrder) seats[player] = new CombatRolloutController(player, registry);
  return seats;
}

const CEILING = 2_000;

/** From our first main phase, pass on through combat — our attack as v1's —
 * to our second, with priority back and nothing on the stack; `null` if the
 * turn ends first. */
function throughCombat(state: GameState, registry: CardRegistry, me: PlayerId): Game | null {
  try {
    const sim = Game.fromSnapshot({ ...state, eventLog: [] }, { registry, controllers: combatSeats(state, registry) });
    const turn = state.turn.number;
    sim.dispatch({ type: "pass-priority", player: me });
    let steps = 0;
    sim.advanceUntil(
      (s) =>
        (steps += 1) > CEILING ||
        s.turn.number !== turn ||
        (s.turn.step === "postcombat-main" &&
          s.priority.holder === me &&
          s.awaiting === null &&
          s.zones.shared.stack.length === 0),
    );
    return sim.state.turn.number === turn && sim.state.turn.step === "postcombat-main" && !sim.state.result.over
      ? sim
      : null;
  } catch {
    return null;
  }
}

/** Pass the rest of the turn out — our attack as v1's, if it's still to come
 * — to the start of the next player's turn. */
function passOut(state: GameState, registry: CardRegistry, me: PlayerId): GameState | null {
  try {
    const sim = Game.fromSnapshot({ ...state, eventLog: [] }, { registry, controllers: combatSeats(state, registry) });
    const turn = state.turn.number;
    sim.dispatch({ type: "pass-priority", player: me });
    let steps = 0;
    sim.advanceUntil((s) => (steps += 1) > CEILING || s.turn.number !== turn);
    return sim.state;
  } catch {
    return null;
  }
}

/**
 * From where a turn of ours was passed out, on through the opponents' turns
 * — each passing, attacking no one — to our next first main phase, with
 * priority and nothing on the stack. `null` if the game ends or we never get
 * there.
 */
function toOurNextTurn(state: GameState, registry: CardRegistry, me: PlayerId): Game | null {
  try {
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
    sim.advanceUntil((s) => (steps += 1) > CEILING * state.turnOrder.length || ours(s));
    return ours(sim.state) && !sim.state.result.over ? sim : null;
  } catch {
    return null;
  }
}

interface Node {
  readonly game: Game;
  readonly steps: readonly PlanStep[];
  readonly boards: readonly string[];
  readonly combatDone: boolean;
}

/**
 * The best lines for our turn from `state` (our priority, a main phase,
 * nothing on the stack), best first; `firsts` are the moves to start from,
 * as the caller listed them. Every line is at least one step long, so the
 * caller's own answer — a single move, or passing — is weighed beside them
 * by its own score.
 */
export function planTurn(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  firsts: readonly Action[],
  hooks: TurnPlanHooks,
  limits: TurnPlanLimits,
  /** Cards no line may use: what was in our library when planning began. */
  unknown: ReadonlySet<ObjectId> = new Set(state.zones.perPlayer[me]?.library ?? []),
): PlannedLine[] {
  let left = limits.simulations;
  const lines: PlannedLine[] = [];
  const scoreLine = (node: Node): PlannedLine | null => {
    if (left <= 0) return null;
    left -= 1;
    const end = passOut(node.game.state, registry, me);
    if (end === null) return null;
    const line = { steps: node.steps, boards: node.boards, value: hooks.value(end), end };
    lines.push(line);
    return line;
  };
  const known = (action: Action): boolean => {
    const id = usedCard(action);
    return id === undefined || !unknown.has(id);
  };

  let frontier: Node[] = [
    {
      game: Game.fromSnapshot(state, { registry }),
      steps: [],
      boards: [],
      combatDone: state.turn.step !== "precombat-main",
    },
  ];
  for (let depth = 0; depth < limits.depth && frontier.length > 0 && left > 0; depth += 1) {
    const children: { node: Node; value: number }[] = [];
    for (const node of frontier) {
      const moves = (depth === 0 ? firsts : hooks.moves(node.game.controllerView(me))).filter(known);
      const board = boardKey(node.game.state, me);
      for (const move of moves) {
        if (left <= 0) break;
        left -= 1;
        const settled = simulateSettled(node.game.state, registry, me, move);
        // A move that ends the game is a finished line, scored as it ended —
        // a win, never expanded or passed out. `simulateSettled` answers
        // `null` for it, priority never coming back, so a `null` is asked
        // once more how the move resolves.
        const ended = settled === null ? simulateAction(node.game.state, registry, move, "stack", "combat") : settled.state;
        if (ended?.result.over === true) {
          lines.push({ steps: [...node.steps, move], boards: [...node.boards, board], value: hooks.value(ended), end: ended });
          continue;
        }
        if (settled === null) continue;
        const child: Node = {
          game: settled,
          steps: [...node.steps, move],
          boards: [...node.boards, board],
          combatDone: node.combatDone,
        };
        const line = scoreLine(child);
        if (line !== null) children.push({ node: child, value: line.value });
      }
      // Through combat, when something is still to do in the second main
      // phase: a line that only passes is the caller's own "pass".
      if (!node.combatDone && left > 0) {
        left -= 1;
        const after = throughCombat(node.game.state, registry, me);
        if (after !== null && hooks.moves(after.controllerView(me)).filter(known).length > 0) {
          const child: Node = {
            game: after,
            steps: [...node.steps, "combat"],
            boards: [...node.boards, board],
            combatDone: true,
          };
          const line = scoreLine(child);
          if (line !== null) children.push({ node: child, value: line.value });
        }
      }
    }
    children.sort((a, b) => b.value - a.value);
    frontier = children.slice(0, limits.beam).map((c) => c.node);
  }
  return lines.sort((a, b) => b.value - a.value);
}

/** Passing, as a line of no steps: the turn passed out from `state`. `null`
 * if the rollout fell over. */
export function passLine(state: GameState, registry: CardRegistry, me: PlayerId, hooks: TurnPlanHooks): PlannedLine | null {
  const end = passOut(state, registry, me);
  return end === null ? null : { steps: [], boards: [], value: hooks.value(end), end };
}

/**
 * What a line's turn is worth once our next turn is played on from it: the
 * opponents' turns passed through without attacks (`toOurNextTurn`), then
 * the best line for that turn by `planTurn`, never with a card we don't know
 * of yet. Falls back on the end of the turn itself when we never get there —
 * a won game, a lost one.
 */
export function nextTurnValue(
  line: PlannedLine,
  registry: CardRegistry,
  me: PlayerId,
  hooks: TurnPlanHooks,
  limits: TurnPlanLimits,
  unknown: ReadonlySet<ObjectId>,
): number {
  if (line.end.result.over) return hooks.value(line.end);
  const next = toOurNextTurn(line.end, registry, me);
  if (next === null) return hooks.value(line.end);
  const view = next.controllerView(me);
  const firsts = hooks.moves(view).filter((a) => {
    const id = usedCard(a);
    return id === undefined || !unknown.has(id);
  });
  const passed = passOut(next.state, registry, me);
  const idle = passed === null ? hooks.value(next.state) : hooks.value(passed);
  const best = planTurn(next.state, registry, me, firsts, hooks, limits, unknown)[0];
  return Math.max(idle, best?.value ?? -Infinity);
}
