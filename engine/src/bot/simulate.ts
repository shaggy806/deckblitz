/**
 * "What would the board look like if I did this?"
 *
 * The engine makes this nearly free: `GameState` is one plain
 * `structuredClone`-able tree, `Game.fromSnapshot` rebuilds a working `Game`
 * from one, and `dispatch` is the only writer — so a candidate move can be
 * played out against a throwaway copy with no risk to the real game and no
 * per-card special-casing. Measured at roughly 0.3ms per candidate mid-game.
 *
 * Two things here are load-bearing and easy to get wrong:
 *
 * 1. **Every seat in the simulation gets a non-searching stand-in.**
 *    `Game.tick()` invokes `controllers[holder].act()`, so a simulation that
 *    inherited the searching bot's own controller would recurse forever. The
 *    stand-ins also do the useful work of passing priority, which is what
 *    drains the stack. Which stand-in is the `RolloutPolicy`.
 *
 * 2. **The horizon has to be past the stack.** Dispatching `cast-spell`
 *    leaves the spell *on the stack* with nothing resolved, so scoring there
 *    reads every spell as "one fewer card in hand" and the bot never casts
 *    anything. See `docs/plans/smarter-bots.md`.
 */

import { Game } from "../game.js";
import type { Action } from "../actions.js";
import type { CardRegistry } from "../cards.js";
import { HeuristicBotController } from "../controller.js";
import type { ControllerView, PlayerController } from "../controller.js";
import type { PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import { resolveToPriority } from "./untap-plans.js";

/**
 * How far past the candidate action to run before scoring.
 *
 * - `"stack"` — until the stack is empty, i.e. the action and everything it
 *   put on the stack has resolved. Cheap, and enough to see what a spell did.
 * - `"turn"` — until the turn number changes. Puts every candidate, including
 *   `pass-priority`, on a common footing so they can be compared directly
 *   instead of against a "better than doing nothing" threshold. 2-3x dearer.
 * - `"round"` — on through every opponent's turn until ours begins again, so
 *   what they do with the board a candidate leaves them (an attack, a burn
 *   spell, our Fog in answer) is inside it. Experimental and far dearer —
 *   the lookahead benchmarks (`benchmarks.ts`) are what it's measured on —
 *   and meaningful only under the `"playing"` policy, the one where the other
 *   seats cast and attack on their own turns.
 * - `"next-turn"` — `"round"`, then our next turn played out too: a setup
 *   whose payoff is next turn's (a tapped land, a second Bolt, a commander
 *   left in the graveyard for a reanimation spell).
 */
export type Horizon = "stack" | "turn" | "round" | "next-turn";

/** Whether a horizon runs past the end of the current turn. */
export const isDeepHorizon = (horizon: Horizon): boolean => horizon === "round" || horizon === "next-turn";

/**
 * The test that ends a rollout at `horizon`, for `me`, from `startingTurn`,
 * with its step ceiling: `MAX_STEPS` within a turn, and as many again for
 * every player turn a deep horizon may cross. The returned test keeps state
 * (it counts steps, and for `"next-turn"` remembers our turn starting), so
 * each rollout makes its own.
 */
function horizonTest(
  horizon: Horizon,
  state: GameState,
  me: PlayerId,
  startingTurn: number,
): (s: GameState) => boolean {
  const players = state.turnOrder.length;
  const ceiling = isDeepHorizon(horizon) ? MAX_STEPS * (2 * players + 1) : MAX_STEPS;
  let steps = 0;
  let ourTurn: number | null = null;
  const activeIsMe = (s: GameState): boolean => s.turnOrder[s.turn.activePlayerIndex] === me;
  return (s) => {
    steps += 1;
    if (steps > ceiling) return true;
    switch (horizon) {
      // "stack" also waits out any decision the resolution left open: an
      // overloaded Cyclonic Rift has resolved with the stack empty while its
      // bounced commanders still sit on the battlefield, waiting on their
      // owners' 903.9a answers.
      case "stack":
        return s.zones.shared.stack.length === 0 && s.awaiting === null;
      case "turn":
        return s.turn.number !== startingTurn;
      case "round":
        return s.players[me]?.hasLost === true || (s.turn.number !== startingTurn && activeIsMe(s));
      case "next-turn":
        if (s.players[me]?.hasLost === true) return true;
        if (ourTurn === null && s.turn.number !== startingTurn && activeIsMe(s)) ourTurn = s.turn.number;
        return ourTurn !== null && s.turn.number !== ourTurn;
    }
  };
}

/**
 * How the stand-in seats play a priority rollout out.
 *
 * - `"passive"` — `AutomaticController` everywhere: pass, never attack, never
 *   block. Cheapest, but no rollout ever contains combat, so casting a
 *   creature before combat looks the same as after it, and a decision on an
 *   opponent's turn never sees their attack coming.
 * - `"combat"` — `CombatRolloutController` everywhere: still pass at every
 *   priority window, but attack and block as v1 does.
 * - `"defensive"` — v1's blocks everywhere, but only opponents attack; our
 *   own seat never does. v1 swings with everything, which is a poor stand-in
 *   for the bot's own, far more careful attacks.
 * - `"playing"` — every seat plays its whole turn as v1 does (what the retired
 *   v3 planned with, and what `bot:audit --rollout` prices a card by),
 *   casting and activating rather than only fighting combat. The three above
 *   all pass at every priority window for *every* seat including our own, so a
 *   candidate is scored as "I do this, and then nobody does anything else all
 *   turn" — mana is never spent, cards in hand are inert, and nothing can be
 *   valued for what it enables. Measured: eight untapped Forests and two
 *   creatures in hand, rolled to end of turn, leaves an empty board under all
 *   three, and a board with both creatures under this one, for 1.7x the cost
 *   (1.26ms to 2.18ms). See `docs/plans/bot-v3-search.md`.
 * - `"acting"` — `"combat"` for everyone else, but our own seat plays the
 *   rest of the turn as v1: the mana a candidate spends now is then weighed
 *   against the spells v1 would have cast with it later in the turn, which
 *   every other policy's rollouts never cast. Passing is scored with those
 *   later spells too, so it can tie with casting one now — the search breaks
 *   such ties toward acting (`EvalBotController`), or the bot would put its
 *   plays off.
 */
export type RolloutPolicy = "passive" | "combat" | "defensive" | "playing" | "acting";

/**
 * How far past the candidate action a `simulateTurns` rollout runs, counted in
 * *player turns* rather than rounds.
 *
 * `players + 1` is the meaningful default: far enough to come back round to
 * ourselves, so a play, every opponent's answer, and our own follow-up all sit
 * inside the horizon. At two players that is three turns.
 */
export interface Depth {
  readonly turns: number;
}

/** A hard ceiling on one rollout, so a pathological line can't stall a room. */
const MAX_STEPS = 400;

/**
 * Play `action` against a copy of `state` and return the resulting state, or
 * `null` if the engine refused it.
 *
 * A refusal is expected, not exceptional: `legalActions` enumerates a *shape*
 * ("cast this, here are the legal targets"), and a specific concrete filling
 * of that shape can still be illegal. The caller just skips the candidate.
 */
export function simulateAction(
  state: GameState,
  registry: CardRegistry,
  action: Action,
  horizon: Horizon,
  policy: RolloutPolicy = "passive",
  self?: PlayerController,
): GameState | null {
  return simulateRepeated(state, registry, action, horizon, policy, self, 1)?.state ?? null;
}

/** The most activations one batch simulates — a bound on a free, untapped
 * ability that could otherwise be activated forever. */
export const MAX_BATCH = 20;

/**
 * `simulateAction` for an activated ability dispatched up to `repeat` times
 * in a row before anyone else acts — "give my Dragons +1/+0" six times with
 * twelve spare mana, as one candidate. Activating hands priority straight
 * back to the activator (rule 117.3c), so a batch is the next activation
 * dispatched again for as long as there is one: by default the same action
 * while the engine still offers it (`canRepeat`), or whatever `next` says —
 * the same ability re-aimed, when the target the last one took is gone.
 * `times` is how many went on the stack.
 */
export function simulateRepeated(
  state: GameState,
  registry: CardRegistry,
  action: Action,
  horizon: Horizon,
  policy: RolloutPolicy,
  self: PlayerController | undefined,
  repeat: number,
  next: (game: Game, previous: Action) => Action | null = (game, previous) =>
    canRepeat(game, previous) ? previous : null,
): { readonly state: GameState; readonly times: number } | null {
  // The event log is roughly half the bytes of a mid-game state and nothing
  // downstream of here reads it — dropping it before the clone takes the copy
  // from ~0.46ms to ~0.27ms.
  const seed: GameState = { ...state, eventLog: [] };
  const startingTurn = state.turn.number;

  try {
    const sim = Game.fromSnapshot(seed, {
      registry,
      controllers: rolloutControllers(state, registry, action.player, policy, self),
    });
    sim.dispatch(action);
    let times = 1;
    let previous = action;
    while (times < Math.min(repeat, MAX_BATCH)) {
      const following = next(sim, previous);
      if (following === null) break;
      sim.dispatch(following);
      previous = following;
      times += 1;
    }
    sim.advanceUntil(horizonTest(horizon, state, action.player, startingTurn));
    return { state: sim.state, times };
  } catch {
    return null;
  }
}

/**
 * `simulateAction` for an untap plan (`untap-plans.ts`): `prefix` (tap a
 * land for mana, untap it) dispatched, everyone passing until it has
 * resolved and we hold priority again with the mana still in the pool, then
 * `finish` (the cast the extra mana pays for, aimed on that board), then the
 * usual rollout to `horizon`. `null` if any step is refused or the plan
 * doesn't get back to us.
 */
export function simulatePlan(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  prefix: readonly Action[],
  finish: (game: Game) => Action | null,
  horizon: Horizon,
  policy: RolloutPolicy,
  self: PlayerController | undefined,
): GameState | null {
  const startingTurn = state.turn.number;
  try {
    const sim = Game.fromSnapshot(
      { ...state, eventLog: [] },
      { registry, controllers: rolloutControllers(state, registry, me, policy, self) },
    );
    for (const action of prefix) sim.dispatch(action);
    if (!resolveToPriority(sim, me)) return null;
    const last = finish(sim);
    if (last === null) return null;
    sim.dispatch(last);
    sim.advanceUntil(horizonTest(horizon, state, me, startingTurn));
    return sim.state;
  } catch {
    return null;
  }
}

/**
 * Play `action` against a copy of `state` until it has resolved and `me` has
 * priority again in the same step with an empty stack — the board a follow-up
 * would be played on — and return that copy, or `null` if it never gets back
 * there (the step ends, the engine refuses the action, the game ends). Every
 * seat passes while it resolves, and what's asked on the way is answered as
 * the `"combat"` policy's stand-ins answer it (v1), our own seat's too unless
 * `self` says otherwise. A land, which doesn't use the stack, is back at once.
 */
export function simulateSettled(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  action: Action,
  self?: PlayerController,
): Game | null {
  const { number, step } = state.turn;
  try {
    const sim = Game.fromSnapshot(
      { ...state, eventLog: [] },
      { registry, controllers: rolloutControllers(state, registry, me, "combat", self) },
    );
    sim.dispatch(action);
    let steps = 0;
    let back = false;
    sim.advanceUntil((s) => {
      if (s.result.over || s.turn.number !== number || s.turn.step !== step) return true;
      // A trigger the action set off (landfall from a land, which never uses
      // the stack) waits in `pendingTriggers` until the next tick puts it on
      // the stack: not back until that has resolved too.
      if (
        s.zones.shared.stack.length === 0 &&
        s.pendingTriggers.length === 0 &&
        s.awaiting === null &&
        s.priority.holder === me
      ) {
        back = true;
        return true;
      }
      steps += 1;
      return steps > MAX_STEPS;
    });
    return back ? sim : null;
  } catch {
    return null;
  }
}

/**
 * `simulateAction` for an action put off until after combat: from our first
 * main phase, we pass, the rollout plays our combat (our seat attacking as
 * the policy has it), and at our second main phase, with priority back and
 * nothing on the stack, `action` is dispatched as it was given; then the
 * usual rollout to `horizon`. Read for a cast that taps a vigilance creature
 * for mana (`EvalBotController.holdsTapForCombat`): put off, it gets its
 * attack in first. `null` if it never gets back to us, or the engine
 * refuses the action then.
 */
export function simulateAfterCombat(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  action: Action,
  horizon: Horizon,
  policy: RolloutPolicy,
  self: PlayerController | undefined,
): GameState | null {
  const startingTurn = state.turn.number;
  try {
    const sim = Game.fromSnapshot(
      { ...state, eventLog: [] },
      { registry, controllers: rolloutControllers(state, registry, me, policy, self) },
    );
    sim.dispatch({ type: "pass-priority", player: me });
    let steps = 0;
    sim.advanceUntil((s) => {
      steps += 1;
      if (steps > MAX_STEPS) return true;
      return (
        s.turn.number !== startingTurn ||
        (s.turn.step === "postcombat-main" &&
          s.priority.holder === me &&
          s.awaiting === null &&
          s.zones.shared.stack.length === 0)
      );
    });
    if (sim.state.turn.number !== startingTurn || sim.state.turn.step !== "postcombat-main") return null;
    sim.dispatch(action);
    sim.advanceUntil(horizonTest(horizon, state, me, startingTurn));
    return sim.state;
  } catch {
    return null;
  }
}

/** Whether `action`, an activation just dispatched, can be dispatched again
 * right now: its player still holds priority with nothing to answer, and the
 * engine still offers that ability. */
export function canRepeat(game: Game, action: Action): boolean {
  if (action.type !== "activate-ability") return false;
  const state = game.state;
  if (state.awaiting !== null || state.priority.holder !== action.player) return false;
  return game
    .legalActivationsOf(action.player, action.source)
    .some(
      (l) =>
        l.kind === "activate-ability" &&
        l.source === action.source &&
        l.abilityIndex === action.abilityIndex,
    );
}

/**
 * The stand-in for every seat in a *combat* simulation: v1's answer to
 * anything the engine is waiting on — above all, how to block — and a pass at
 * every priority window. The priority search's stand-ins never block
 * (`AutomaticController`), which would make every attack look free. Never a
 * searching bot, or the simulation would recurse.
 *
 * It takes any trade, where v1 wants the attacker worth 2 more: the bots
 * seated in live rooms are v2, whose block search trades and double-blocks
 * freely — counting the damage a block stops, it traded a Colossal Dreadmaw
 * for a Craw Wurm — and predicted with v1's blocks a Centaur Courser sent at
 * a Hill Giant read as 3 unblocked damage (reported from a live game,
 * 2026-10-10: "bots keep sending attackers in when they will die").
 */
export class CombatRolloutController extends HeuristicBotController {
  protected override readonly tradeMargin: number = -Infinity;

  act(view: ControllerView): Action {
    if (view.state.awaiting !== null) return super.act(view);
    return { type: "pass-priority", player: this.playerId };
  }
}

const COMBAT_STEPS: ReadonlySet<string> = new Set([
  "declare-attackers",
  "declare-blockers",
  "combat-damage",
]);

/**
 * Play a `declare-attackers` or `declare-blockers` action against a copy of
 * `state` through the end of combat — blocks and damage included, every seat
 * answering as v1 would — and return the state after it, or `null` if the
 * engine refused the declaration.
 */
export function simulateCombat(
  state: GameState,
  registry: CardRegistry,
  action: Action,
): GameState | null {
  const seed: GameState = { ...state, eventLog: [] };
  const controllers: Record<PlayerId, PlayerController> = {};
  for (const player of state.turnOrder) {
    controllers[player] = new CombatRolloutController(player, registry);
  }
  const startingTurn = state.turn.number;
  try {
    const sim = Game.fromSnapshot(seed, { registry, controllers });
    sim.dispatch(action);
    let steps = 0;
    sim.advanceUntil((s) => {
      steps += 1;
      return (
        steps > MAX_STEPS ||
        s.turn.number !== startingTurn ||
        (!COMBAT_STEPS.has(s.turn.step) && s.zones.shared.stack.length === 0)
      );
    });
    return sim.state;
  } catch {
    return null;
  }
}

/** Holds back from attacking; otherwise v1's answers, like its parent. */
export class DefendingRolloutController extends CombatRolloutController {
  declareAttackers(): readonly [] {
    return [];
  }
}

/**
 * Plain v1, playing its whole turn — the stand-in of a `"playing"` rollout.
 *
 * It exists as a named class rather than using `HeuristicBotController`
 * directly so the policy table reads uniformly, and so there is one place to
 * hang the warning: this is the only stand-in that *acts*, and therefore the
 * only one whose own mistakes end up inside the measurement. Three turns of v1
 * making mediocre decisions can drown the thing being measured, which is
 * exactly what killed v2's sibling-pair labels. Averaging over sampled worlds
 * is the mitigation; if it isn't enough, a better rollout policy is the fix,
 * not more samples.
 */
export class PlayingRolloutController extends HeuristicBotController {}

/**
 * Play `action` against a copy of `state` and run `depth.turns` player turns of
 * `policy` past it, returning the resulting state — the rollout `bot:audit`
 * prices a card with (and the one the retired v3 planned over).
 *
 * The caller is expected to hand in an already-determinized `state` (see
 * `determinize.ts`) and to reuse the same sampled worlds across every candidate
 * at one decision.
 */
export function simulateTurns(
  state: GameState,
  registry: CardRegistry,
  action: Action,
  depth: Depth,
  policy: RolloutPolicy = "playing",
  self?: PlayerController,
): GameState | null {
  const seed: GameState = { ...state, eventLog: [] };
  const until = state.turn.number + Math.max(1, depth.turns);
  try {
    const sim = Game.fromSnapshot(seed, {
      registry,
      controllers: rolloutControllers(state, registry, action.player, policy, self),
    });
    sim.dispatch(action);
    let steps = 0;
    sim.advanceUntil((s) => {
      steps += 1;
      // A deeper rollout runs many more ticks than a one-turn one, so the step
      // ceiling scales with the depth rather than staying at `MAX_STEPS` and
      // silently truncating every rollout at the same place.
      return steps > MAX_STEPS * depth.turns || s.turn.number >= until;
    });
    return sim.state;
  } catch {
    return null;
  }
}

function rolloutControllers(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  policy: RolloutPolicy,
  self: PlayerController | undefined,
): Record<PlayerId, PlayerController> | undefined {
  // `fromSnapshot` fills any seat left out with an AutomaticController.
  if (policy === "passive") return self === undefined ? undefined : { [me]: self };
  const controllers: Record<PlayerId, PlayerController> = {};
  for (const player of state.turnOrder) {
    controllers[player] =
      policy === "playing" || (policy === "acting" && player === me)
        ? new PlayingRolloutController(player, registry)
        : policy === "defensive" && player === me
          ? new DefendingRolloutController(player, registry)
          : new CombatRolloutController(player, registry);
  }
  if (self !== undefined) controllers[me] = self;
  return controllers;
}
