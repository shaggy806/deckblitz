/**
 * A searching bot: at each priority window, enumerate the concrete actions
 * available, play each one out against a throwaway copy of the game, score
 * the result, and take the best — and, in its own main phase, plan the rest
 * of the turn from the best of them (`planLines`, `turn-plan.ts`; the
 * default since 2026-10-18), so it is no longer one move deep there.
 *
 * It extends {@link HeuristicBotController} rather than replacing it. Decisions
 * the engine waits on mid-resolution — a trigger's targets, modes, "you may",
 * sacrifices, discards, tutors, scry — are searched the same way as priority
 * moves (`decisions.ts`), with v1's answer as the candidate to beat; the few
 * that aren't searched (mulligans, combat damage order) keep it outright.
 *
 * Combat is searched separately, because one-ply is blind to it: attacks are
 * declared *before* blocks, so the state right after "declare attackers" shows
 * only tapped creatures. Attacks and blocks are built one pair at a time, each
 * candidate simulated through blocks and damage (`simulateCombat`), and never
 * enumerated — a ten-creature board against three opponents has about a
 * million attack declarations. Two checks frame every attack (see
 * `combat-math.ts`): swing with everything when that's lethal through the
 * best blocks, and never leave too little home to survive the crackback.
 *
 * See `docs/plans/smarter-bots.md` for the measurements and for why the
 * evaluation's feature list is shaped the way it is.
 */

import type { Action, AttackerDeclaration, BlockerDeclaration, ChosenTargets, LegalAction } from "../actions.js";
import type { CardRegistry } from "../cards.js";
import { withRequiredAttackers } from "../combat/attacking.js";
import { defaultRegistry } from "../cards/default-registry.js";
import { HeuristicBotController, StandInController, compareReach, isCastPayoff, isLandfallPermanent, payoffFirst } from"../controller.js";
import type { ControllerView, LandReach, PlayerController } from "../controller.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf, rulesTextName } from "../state.js";
import type { GameState } from "../state.js";
import { matchesFilter } from "../filter.js";
import type { CardFilter } from "../filter.js";
import { manaValue, parseManaCost } from "../mana.js";
import { delayedDeadlineToPay } from "./delayed-deadline.js";
import { computeCharacteristics, lethalDamageLeft, playerProtectedFrom, withComputedCache } from "../characteristics.js";
import { whyCannotAttack } from "../combat/eligibility.js";
import { Game } from "../game.js";
import { withHiddenCards } from "./determinize.js";
import { knownEnds, observe, seatMemory } from "./seat-memory.js";
import { hiddenCardsInSight } from "../view.js";
import { phaseOfStep } from "../turn.js";
import { polarityBias } from "../deck-bias.js";
import { newColorsFirst } from "../land-colors.js";
import { onlyUntilEndOfTurn } from "../effect-worth.js";
import { goadersOf } from "../goad.js";
import {
  modalPolarities,
  offerDamage,
  offerPolarities,
  pendingTargetPolarities,
  rankTargets,
  sideOf,
  specSide,
  targetValue,
} from "../target-polarity.js";
import { ActivationCap, isFreeCost } from "./activation-cap.js";
import { candidateActions } from "./candidates.js";
import { aimPremium } from "./aim.js";
import { withDivisions } from "./divisions.js";
import { findUntapPlans } from "./untap-plans.js";
import { collapseTwins } from "./twins.js";
import type { TargetRef } from "../target.js";
import type { Polarity } from "../target-polarity.js";
import { decisionCandidates } from "./decisions.js";
import {
  canBlock,
  combatCreatures,
  crackback,
  damageThrough,
  isLethal,
  opponentsLethalAlone,
  swingFrom,
  opponentsOutlived,
} from "./combat-math.js";
import type { CombatCreature } from "./combat-math.js";
import { goneAtEndStep } from "./gone-at-end-step.js";
import { DEFAULT_WEIGHTS, aimedOutcome, evaluateState, normalizeWeights, outcomeOf, scoreOutcome } from "./evaluate.js";
import type { EvalOutcome } from "./evaluate.js";
import { aimedAt, aimedByLine } from "./interaction.js";
import type { Aimed } from "./interaction.js";
import {
  engineScore,
  isAnswer,
  libraryTopOf,
  lifeCost,
  withHandReadForKeeps,
  withLibraryTop,
  withTrackRecordEvidence,
  worthKeeping,
  readAsOf,
} from "./features.js";
import type { LibraryTop } from "./features.js";
import { mostWorthKeepingFirst } from "./hand-worth.js";
import type { EvalWeights } from "./evaluate.js";
import {
  CombatRolloutController,
  DefendingRolloutController,
  isDeepHorizon,
  MAX_BATCH,
  rolloutAborted,
  simulateAction,
  simulateCombat,
  simulatePlan,
  simulateRepeated,
  simulateSwingBack,
  simulateWithoutOwnTriggers,
  withRolloutDeadline,
} from "./simulate.js";
import type { Horizon, RolloutPolicy } from "./simulate.js";
import { digOf, namedDigIn, nameToDigFor, offeredByDig } from "./dig.js";
import { winningName, winningOffer, winsByDigging } from "./dig-win.js";
import { withEnoughX } from "./enough-x.js";
import { isNameableAs } from "../card-names.js";
import {
  boardKey,
  nextTurnValue,
  passLine,
  planTurn,
  replayLine,
  restOfTurnValue,
  sameKnownEnd,
  unknownCards,
  withOurAttackSeat,
} from "./turn-plan.js";
import type { PlanStep, PlannedLine, ScoredFirst, TurnPlanHooks, TurnPlanLimits } from "./turn-plan.js";

export interface EvalBotOptions {
  readonly weights?: EvalWeights;
  /** `"turn"` by default. A deep horizon (`"round"`, `"next-turn"`) is an
   * experiment measured on the lookahead benchmarks, not something a room
   * seats. */
  readonly horizon?: Horizon;
  /** How the other seats (and our own, after the candidate move) play a
   * priority rollout out. See `RolloutPolicy`. `"combat"` by default, and
   * `"playing"` under a deep horizon, the one policy whose opponents cast
   * and attack on their own turns. */
  readonly rollout?: RolloutPolicy;
  /**
   * Whether priority rollouts search our own decisions one level deep too
   * (a {@link DecisionRolloutController} in our seat), rather than taking
   * v1's answers. Without it, casting a creature whose "enters" trigger says
   * "you may" is scored as if we'd decline. Decisions the engine actually
   * asks us are always searched this way.
   */
  readonly rolloutDecisions?: boolean;
  /**
   * Plan our own turn (`turn-plan.ts`): lines of
   * moves across both main phases, the opponents only blocking. `"turn"` by
   * default (since 2026-10-18: lookahead benchmarks 7 to 9 of 17, every gate
   * scenario, no cost a decision; head to head with the bot before it, level,
   * 24.9% [21.3, 28.5] over 546 four-player games); `"next-turn"` also plays our next turn on from the best line
   * of each of the best few first moves, an experiment; `"off"` plays the
   * one-move search alone (the follow-up search it used to fall back on was
   * deleted 2026-11-10, unreachable since the plan became the default).
   */
  readonly plan?: "turn" | "next-turn" | "off";
  /** Whether a window like one already searched and passed on this turn
   * passes without a search (`EvalBotController.passMemo`); on by default
   * (checked over 12 four-player games at count budgets, 2026-11-10: 355
   * hits, the search agreeing at every one). `"check"`
   * searches anyway and counts the memo's hits and misses
   * (`passMemoChecks`), a measurement. */
  readonly passMemo?: "on" | "off" | "check";
  /** Simulations one plan may spend (`TurnPlanLimits.simulations`); 48 by
   * default, and as many again for each next-turn look. */
  readonly planSimulations?: number;
  /**
   * What the bot's simulations know of the cards the seat can't see.
   * `"hidden"`, the default: the libraries' order and the other players'
   * hands dealt afresh each turn, but for what the seat knows or remembers
   * (`withHiddenCards`, `seat-memory.ts`), which is all a player knows.
   * `"real"`: the game's own state and random numbers, as every decision
   * read them until 2026-11-17 — for measuring what the knowledge was worth.
   */
  readonly libraryOrder?: "hidden" | "real";
  /** With `libraryOrder: "hidden"`, `"real"` leaves the other players' hands
   * as they are: only how the libraries lie is hidden (2026-11-17's first
   * step, kept to measure the second against). */
  readonly opponentHands?: "hidden" | "real";
  /**
   * Ceiling on simulations per decision. The action space is small in
   * practice (median 2 concrete actions per window, 99th percentile around 9),
   * but a wide four-player board has been measured at 211 — this bounds the
   * worst case rather than letting it grow with the board. Attack and block
   * declarations get the same budget each.
   */
  readonly maxSimulations?: number;
  /**
   * Who makes our own attack in the rollouts of our own turn — a priority
   * rollout before attackers are declared, and the turn plan's step through
   * combat and its passing out: `"v1"` (the default, v1's attack) or `"v2"`,
   * a small attack search of our own (`RealAttacksController`,
   * `REAL_ATTACK_SIMULATIONS`). An experiment (2026-11-27): v1's attack is
   * what a line that sets up an attack is scored by, and it held a menace
   * Slicer home from a lone blocker at 20 commander damage, so the Beamtown
   * Beatstick equip that won read as two mana for nothing.
   */
  readonly rolloutAttacks?: "v1" | "v2" | "v2-when-v1-holds" | "v2-full";
  /** Our attack searched alone, without the checks against the defenders'
   * own blocks and the swing back (`declareAttackersSearched`): the attack a
   * rollout makes under `rolloutAttacks: "v2"`, cheap enough to sit inside
   * one. */
  readonly lightAttacks?: boolean;
  /**
   * Score our own turn's priority moves with the swing back in them: where
   * a move's rollout (or a planned line's passing out) ends, as the next
   * player's turn begins, the opponents' turns are played on from that board
   * to our next turn, attacking and blocking as v1, and what they change is
   * added to the move's score (`EvalBotController.swingBack`). On unless
   * `false` (2026-11-27, `docs/plans/bot-next-steps.md` 1c): without it an
   * attack a line sets up, or a board it clears, is scored with none of what
   * it opens us to.
   */
  readonly rolloutSwingBack?: boolean;
  /**
   * Wall-clock ceiling on one decision, in milliseconds. **Off by default**,
   * and that default is deliberate.
   *
   * Counting simulations does not bound time, because a simulation's cost
   * grows with the board: on a four-player board of 200+ permanents a single
   * end-of-turn rollout costs ~400ms, so ten candidates is 4s and the
   * 200-simulation ceiling is over a minute. Measured worst cases were 2s at
   * two players and 14s at four, against a room's 350ms think pause.
   *
   * A clock fixes that, at the cost of the engine's determinism guarantee —
   * same seed plus same controllers no longer replays identically, because a
   * busier machine searches less. So it stays off for tests, the fuzzer and
   * the tuner, which need reproducibility, and `Room.addBot` turns it on for
   * live play, where a bounded response matters more than a reproducible one.
   *
   * When it expires the search returns the best candidate found *so far*, and
   * candidates are ordered so that "so far" is worth something: passing and
   * v1's own choice are scored first. A rollout still running at the deadline
   * is stopped there (`withRolloutDeadline`), and a priority search stopped
   * with no candidate scored plays v1's cast, unscored, or passes
   * (`unscoredCast`); a board where one rollout doesn't fit is then answered
   * that way for the rest of the turn without simulating at all (`tooSlow`).
   */
  readonly timeBudgetMs?: number;
  /**
   * The clock `timeBudgetMs` is read on, in milliseconds; `Date.now` when
   * omitted. For tests and scenarios: one that jumps during the first
   * simulation is a board whose single rollout outlasts the budget, through
   * the same path a live room's slow board takes (`maxSimulations: 1` stops
   * on the count instead, a different branch).
   */
  readonly now?: () => number;
  /**
   * Told every candidate a priority window or a decision simulates, with the
   * state its rollout ended in (`null` when the engine refused it), in the
   * order they were scored; the first of any tie is the one played, and a
   * window answered without a simulation reports nothing. For measurement: a
   * priority window's rollouts never read the weights, so `bot:fit-scenarios`
   * can replay its choice under any vector from these states alone. A
   * decision's rollouts can (a further decision inside one is searched with
   * them), and combat declarations aren't reported at all: that search is
   * steered by the weights as it goes. `scoredAs` is given when the answer
   * wasn't scored as `after` plainly reads: an interaction, on the opponent
   * it hit (`aimedOutcome`).
   */
  readonly trace?: (action: Action, after: GameState | null, scoredAs?: EvalOutcome) => void;
}

/**
 * What a search may still spend: simulations, and time.
 *
 * `until` is a `Date.now()` stamp rather than `performance.now()` — this module
 * is bundled into the client as well as run in the server, and millisecond
 * resolution is ample for a budget measured in hundreds of them.
 *
 * `simulations` and `ms` are what it has spent so far, every simulation
 * counted whether or not it came out of `left` (the passing baseline and v1's
 * attack are scored outside the count, so that count-bounded searches replay
 * exactly as they always have). `simulations` and `longest` feed the
 * predictive stop in {@link outOfTime}.
 */
interface SearchBudget {
  left: number;
  readonly until: number;
  /** The clock `until` is a stamp on (`EvalBotOptions.now`). */
  readonly now: () => number;
  /** Simulations the clock lets start whatever they're predicted to cost —
   * the search's baselines ({@link outOfTime}). */
  readonly baselines: number;
  simulations: number;
  ms: number;
  /** The longest single simulation so far, in milliseconds. */
  longest: number;
  /** The latest simulation's length, with what was charged on to it
   * ({@link timedOn}). */
  last: number;
  /** {@link spent} said stop at least once: something was left unscored. */
  cut: boolean;
  /** The deadline stopped the search's *first* simulation in flight: one
   * rollout doesn't fit this board's budget (`EvalBotController.tooSlow`). */
  stalled: boolean;
}

const newBudget = (left: number, until: number, baselines = 2, now: () => number = Date.now): SearchBudget => ({
  left,
  until,
  now,
  baselines,
  simulations: 0,
  ms: 0,
  longest: 0,
  last: 0,
  cut: false,
  stalled: false,
});

/**
 * Whether the search must stop: out of simulations, or out of time for
 * another *whole* one.
 *
 * The time test predicts rather than reacts. Checking only that the deadline
 * hasn't passed lets a simulation start a millisecond before it and run its
 * full length after — on a wide four-player board that is hundreds of
 * milliseconds, and it put 7% of priority searches, 15% of attack and block
 * declarations and 10% of other decisions over the room's 300ms budget (the
 * worst at 640ms). Stopping once the running mean no longer fits keeps the
 * overshoot to the variance of one simulation instead of its whole length.
 *
 * Predicted from the longest simulation so far, not the mean: a search mixes
 * full rollouts with crackback checks a fraction of their length
 * (`tapsIntoCrackback`, resolving one spell), so the mean undersold the next
 * rollout, and on wide boards a 300ms one started 120ms before the deadline
 * (16 four-player games at the live 1s, 2026-10-18). A search cut a
 * simulation early this way only ever loses its last candidate.
 *
 * **Except for its baselines.** A priority search scores two first — passing
 * and v1's move, as an attack declaration scores v1's swing and the empty
 * attack — so that a search cut short has v1's play weighed against doing
 * nothing. Predicted from one expensive baseline, the second never ran:
 * measured, 79 windows in 24 four-player games passed where v1 would have
 * acted in 65 of them. So the prediction waits for both, and only the
 * deadline itself can stop the second. A search with one baseline — v1's
 * land, blocks or answer, the rest compared with it — waits for that one only.
 */
const spent = (budget: SearchBudget): boolean => {
  const stop = budget.left <= 0 || outOfTime(budget);
  if (stop) budget.cut = true;
  return stop;
};

/** {@link spent}'s clock alone: past the deadline, or predicted not to fit
 * another simulation before it. Never true without a clock, so a check on it
 * leaves count-bounded searches exactly as they were. */
const outOfTime = (budget: SearchBudget): boolean => {
  if (budget.until === Infinity) return false;
  const now = budget.now();
  if (now >= budget.until) return true;
  if (budget.simulations < budget.baselines) return false;
  return now + budget.longest >= budget.until;
};

/** What each activation past the first costs a batch's score: a tenth of a
 * card. Small beside what a batch is for — six firebreathing activations for
 * six damage are worth three — and enough that one which only ties a single
 * activation loses to it. */
const BATCH_STEP_COST = 0.1;

/** How many deals of our own library a move that reveals from it is weighed
 * over (`typicalDeal`): the median of five. */
const OWN_LIBRARY_DEALS = 5;

/** Whether `effect` reveals cards from the top of its controller's own
 * library until one is found, anywhere in its tree: a `reveal-until` of our
 * library, or discover (rule 701.57a). */
function revealsOwnLibrary(effect: unknown): boolean {
  if (effect === null || typeof effect !== "object") return false;
  if (Array.isArray(effect)) return effect.some(revealsOwnLibrary);
  const kind = (effect as { readonly kind?: unknown }).kind;
  if (kind === "discover") return true;
  if (kind === "reveal-until" && (effect as { readonly whose?: unknown }).whose === undefined) return true;
  return Object.values(effect).some((value) => value !== null && typeof value === "object" && revealsOwnLibrary(value));
}

/** Whether `effect` makes something a copy of something else, anywhere in
 * its tree ("becomes a copy of that card until end of turn"). */
function makesACopy(effect: unknown): boolean {
  if (effect === null || typeof effect !== "object") return false;
  if (Array.isArray(effect)) return effect.some(makesACopy);
  if ((effect as { readonly kind?: unknown }).kind === "become-copy") return true;
  return Object.values(effect).some((value) => value !== null && typeof value === "object" && makesACopy(value));
}

/**
 * Whether every target a planned step chose is still among `offer`'s options.
 * A plan is made in rollouts, and a rollout's choices aren't the real game's:
 * Goblin Engineer's search put one artifact in the graveyard there and
 * another here, and the plan's step, replayed, aimed at the card still in the
 * library — which the engine refused, ending the game (2026-11-09). The
 * graveyard isn't in `boardKey`, so the board check doesn't catch it.
 */
function targetsStillOffered(step: Action, offer: LegalAction): boolean {
  const chosen = "targets" in step && Array.isArray(step.targets) ? (step.targets as ChosenTargets) : [];
  if (chosen.length === 0) return true;
  const options = "targetOptions" in offer ? offer.targetOptions.flat() : [];
  const open = new Set(options.map((t) => JSON.stringify(t)));
  return chosen.every((t) => t === null || open.has(JSON.stringify(t)));
}

/** Run one simulation, charging its time to `budget`. */
function timed<T>(budget: SearchBudget, simulate: () => T): T {
  const started = budget.now();
  try {
    return simulate();
  } finally {
    const ms = budget.now() - started;
    if (budget.simulations === 0 && budget.until !== Infinity && rolloutAborted()) budget.stalled = true;
    budget.simulations += 1;
    budget.ms += ms;
    budget.last = ms;
    if (ms > budget.longest) budget.longest = ms;
  }
}

/** Run a simulation that is the rest of the one before it (a rollout's
 * swing back, `EvalBotController.swingBack`): its time is charged to
 * `budget` as more of that one, so the two are one simulation to the count
 * the clock's baselines wait for and one length to its prediction. */
function timedOn<T>(budget: SearchBudget, simulate: () => T): T {
  const started = budget.now();
  try {
    return simulate();
  } finally {
    const ms = budget.now() - started;
    budget.ms += ms;
    budget.last += ms;
    if (budget.last > budget.longest) budget.longest = budget.last;
  }
}

/**
 * What the most recent decision cost — diagnostics only, never read by the
 * bot itself. It is how a test can tell that a window was answered without a
 * simulation (this suite may not spy on module functions), and what a
 * behaviour measurement reads instead of patching the class.
 */
export interface DecisionAudit {
  readonly kind: "priority" | "decision" | "attackers" | "blockers";
  readonly simulations: number;
  readonly ms: number;
  /** Which path answered: `"search"`, or the shortcut taken instead of one
   * (`"batch replay"`, `"held pass"`, `"plan resolving"`, `"no candidates"`, `"payoff first"`, `"dig for the win"`,
   * `"reducer first"`, `"landfall first"`, `"fetch"`, `"only land"`, `"land search"`,
   * `"v1's answer"`; under a clock `"v1's cast"` and `"no time"`, an expired
   * search's unscored answer — `unscoredCast`). A capture records it (`server/src/capture.ts`), so a
   * decision the saved position can't reproduce says which branch it took. */
  readonly via: string;
  /** The wall-clock budget ran out before the search finished. */
  readonly expired: boolean;
  /** The search stopped with something left unscored — out of simulations,
   * past the deadline, or predicted not to fit another simulation before it
   * (which `expired` misses). */
  readonly cut: boolean;
}

const audit = (kind: DecisionAudit["kind"], budget: SearchBudget | null, via = "search"): DecisionAudit => ({
  kind,
  simulations: budget?.simulations ?? 0,
  ms: budget?.ms ?? 0,
  via,
  expired: budget !== null && budget.until !== Infinity && budget.now() >= budget.until,
  cut: budget?.cut ?? false,
});

/** Structural equality, for spotting v1's chosen action among the enumerated
 * candidates. An `Action` is a plain JSON-able record whose keys are built in
 * a fixed order by `candidateActions`, so comparing serialisations is exact
 * here and far simpler than a per-variant comparison. */
const sameAction = (a: Action, b: Action): boolean => JSON.stringify(a) === JSON.stringify(b);

const DEFAULT_MAX_SIMULATIONS = 200;

/** The wall-clock budget a live room gives each bot decision
 * (`timeBudgetMs`), in milliseconds: the one figure `server/src/room.ts`
 * seats bots with and the measuring scripts default to (`bot:behaviour`,
 * `bot:timings`), so a measurement "at the live budget" can't drift from it. */
export const LIVE_BOT_BUDGET_MS = 1000;

type DeclareAttackersLegal = Extract<LegalAction, { kind: "declare-attackers" }>;

/** What a priority decision on our own turn must not spend
 * (`crackbackGuard`): blockers the crackback needs home, read with or
 * without `crackbackGrowth` (`grown`), or, dead on the board whatever stays
 * home, the out it holds in hand (`outs`). */
interface TapGuard {
  readonly grown: boolean;
  readonly outs?: true;
}
type DeclareBlockersLegal = Extract<LegalAction, { kind: "declare-blockers" }>;

/** An attack that would leave us dead to the crackback scores below every safe
 * one, while still ordering the unsafe ones among themselves. */
export const UNSAFE = -1e8;

/** Menace blocker pairs tried per attacker — pairs are quadratic in the
 * blockers, and the first few cover what matters. */
const MAX_MENACE_PAIRS = 6;

/** Double blocks tried per attacker, for the same reason — see
 * `declareBlockers`. */
const MAX_GANG_PAIRS = 6;

/** Whether every player `action` targets is `player` (no player targets
 * counts) — a cantrip aimed at its caster. */
function aimedOnlyAt(action: Action, player: PlayerId): boolean {
  const targets = action.type === "cast-spell" ? (action.targets ?? []) : [];
  return targets.every((t) => t === null || t.kind !== "player" || t.player === player);
}

/**
 * Moves simulated per round of a combat climb. A combat simulation is far
 * dearer than a priority one — it runs blocks, damage and every trigger on
 * what is often the widest board of the game — and a four-player block with
 * 19 attackers and 5 blockers took 4s simulating every pair. Moves are ranked
 * by cheap arithmetic first and only the most promising are simulated.
 */
const MOVES_PER_ROUND = 8;

/** Simulations each defender's own block search gets where a wide attack is
 * checked against it (`declareAttackersSearched`): enough for its climb from
 * v1's blocks on a board of a dozen attackers. */
const REAL_BLOCK_SIMULATIONS = 24;
/** The steps of our own turn before our attack is declared. */
const OUR_ATTACK_TO_COME: ReadonlySet<string> = new Set(["untap", "upkeep", "draw", "precombat-main", "begin-combat"]);
/** The attack search our own seat makes in a rollout under
 * `rolloutAttacks: "v2"` (`RealAttacksController`). */
const REAL_ATTACK_SIMULATIONS = 12;

/** How many fillings (targets, modes) of each spell our own seat tries as an
 * answer in a simulated swing back (`AnsweringSeat`), in the order the
 * candidates come: the ones aimed best first. */
const ANSWER_FILLINGS = 3;

/** How far below its predicted score an attack may come out against the real
 * blocks and still be declared unasked (`declareAttackersSearched`): the
 * evaluation's points, about a fifth of a card. */
const REAL_BLOCK_SLACK = 1;

/** When the real blocks beat the prediction, how many "the same attack
 * without this attacker" are tried beside no attack: the attackers the
 * estimate likes least. Each is a block search per defender. */
const REAL_BLOCK_VARIANTS = 4;

/** What an attack scores for each opponent past the first it sends attackers
 * at (the user, 2026-10-07: "Bot should attempt to spread out attackers").
 * Small: it decides a near tie — two open opponents, or commander damage
 * tipping it by a fraction (capture HB5MR t20) — and loses to a real
 * difference, damage that puts a player in danger or a blow at the leader. */
const SPREAD_BONUS = 0.5;

/** The share of each of our creatures an attack loses that the players left
 * out of the combat gain on us, at a table of `players` still in the game:
 * none head to head, half at three, two-thirds at four — the opponents
 * outside the fight, over all of them. */
export function bystanderShare(players: number): number {
  return players <= 2 ? 0 : (players - 2) / (players - 1);
}

/** Two scores this close are a tie: the same end state reached by a
 * different order of floating-point sums. */
export const TIE = 1e-9;

/** The most sacrifices tried for one offer whose effect reads the sacrifice
 * (`withSacrificeChoices`): each is a simulation. */
const MAX_SACRIFICE_CHOICES = 5;

/** How many of the planner's best lines are checked against the crackback
 * (`lineSafe`) before the one-move answer stands: each check is a simulation
 * a step, paid only where a tap could be lethal. */
const PLAN_SAFE_LINES = 6;

/** What a creature is worth to the evaluation, roughly: its creature, power
 * and toughness terms. Only used to rank moves, never to choose one. The
 * `power` term counts combat damage (`features.ts`), so this does too: under
 * Felothar the Steadfast a 0/5 wall is worth its 5. */
const creatureValue = (c: CombatCreature, w: EvalWeights): number =>
  w.creatures + w.power * Math.max(0, c.damage) + w.toughness * Math.max(0, c.toughness);

/** Up to this many attackers able to hit one opponent, `alphaStrike` tries
 * every subset for the cheapest kill (2^10 lethality checks); past it, a
 * greedy pick. */
const EXACT_KILL_POOL = 10;

/** Every order of `items` — few: the opponents at one table. */
function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  return items.flatMap((item, i) =>
    permutations(items.filter((_, j) => j !== i)).map((rest) => [item, ...rest]),
  );
}

/**
 * Greedy local search: from `start`, repeatedly simulate the most promising
 * neighbours (by `estimate`) and move to the best one that beats where we are,
 * until none does or `budget` simulations are spent. Returns the best
 * declaration found and its score.
 */
function hillClimb<T>(
  start: readonly T[],
  neighbours: (current: readonly T[]) => { next: T[]; estimate: number }[],
  score: (declaration: readonly T[]) => number | null,
  budget: SearchBudget,
): [T[], number] {
  let current = [...start];
  budget.left -= 1;
  let currentScore = timed(budget, () => score(current)) ?? -Infinity;
  while (!spent(budget)) {
    const ranked = neighbours(current)
      .sort((a, b) => b.estimate - a.estimate)
      .slice(0, MOVES_PER_ROUND);
    let step: T[] | null = null;
    let stepScore = currentScore;
    for (const { next } of ranked) {
      if (spent(budget)) break;
      budget.left -= 1;
      const value = timed(budget, () => score(next));
      if (value !== null && value > stepScore) {
        step = next;
        stepScore = value;
      }
    }
    if (step === null) break;
    current = step;
    currentScore = stepScore;
  }
  return [current, currentScore];
}

/**
 * Rollouts one top-level decision may spend, and — separately — what every one
 * of those rollouts may spend on decisions *inside* it. Both are small because
 * they multiply: Windreader Sphinx ("whenever a creature with flying attacks,
 * you may draw a card") on a board of flyers raised a "you may" per attacker,
 * each rollout contained the rest of them, and with a 200-rollout budget and
 * 16 per nested decision one of those answers took 11.5s. Two nested rollouts
 * is exactly enough to accept or decline a "you may", the case the nesting is
 * for; Flameblast Dragon (a target, then "you may pay {X}{R}") still took
 * 4.9s on a four-player board at 16 and 4.
 */
const DECISION_ROLLOUTS = 12;
const NESTED_DECISION_ROLLOUTS = 2;

/**
 * How much better paying has to score than v1's "decline, the mana is a
 * spell's" (`payingCostsASpell`) for the search to pay anyway
 * (`EvalBotController.decide`), for each mana of the spells declining keeps
 * castable (`manaDeclinedFor`): a point and a half, about what a spell on
 * the battlefield scores over one in hand (a Rumbling Baloth, 5.2 for four).
 * The rollouts pass our own seat, so they never see those spells and price
 * the payment as free; what they do see is what declining costs. Under the
 * margin v1's answer stands (Smothering Tithe's Treasure for an opponent,
 * half a point); over it, declining costs more than the spells' delay (a 4/4
 * sacrificed to its echo for a two-drop, 12 against 3).
 *
 * By the mana and not a flat margin: at three points whatever the spell, a
 * bot at 13 life paid Mana Vault's {4} to be spared its 1 damage (which the
 * opponents' boards made 4 points) and had its nine-mana commander left in
 * the command zone (a strong-deck game judged against the old answer,
 * 2026-11-15).
 */
const KEPT_PER_MANA = 1.5;

/** `TurnPlanLimits` for a plan (`planLines`): moves in a line, lines kept at
 * each depth, and simulations by default (`EvalBotOptions.planSimulations`). */
const PLAN_DEPTH = 5;
const PLAN_BEAM = 3;
const DEFAULT_PLAN_SIMULATIONS = 48;

/** Under `plan: "next-turn"`, the first moves whose best lines are played on
 * through our next turn: the best few. A margin on this turn's score was
 * tried first and was wrong: Bolting the face of a player at 6 scored 15
 * under Bolting his Grizzly Bears (they still threaten us at 3), and the
 * second Bolt next turn made it the win. */
const PLAN_REFINE_LINES = 3;

/** Whether a plan step is `action`. */
function sameStep(step: PlanStep | undefined, action: Action): boolean {
  if (step === undefined) return false;
  if (step === "combat") return action.type === "pass-priority";
  return JSON.stringify(step) === JSON.stringify(action);
}

/**
 * The decisions a rollout searches when it meets them (`DecisionRolloutController`):
 * a "you may" — a modal choice, which is how the engine asks one — and a "you
 * may cast", the yes-or-no answers the nesting is for. Anything else inside a
 * rollout (a trigger's target, a card from a zone, a sacrifice) takes v1's
 * answer, as every priority rollout's decisions do. Searched, they were the
 * dearer half of decision search: a Mayhem Devil ping inside each of a ping's
 * rollouts was searched again, and nested decisions took 23% of one
 * four-player game's bot time against the top-level ones' 19% (2026-10-14).
 */
const NESTED_DECISION_KINDS: ReadonlySet<string> = new Set(["choose-modes", "cast-now"]);

/** How much better leaving a commander in the graveyard must score than the
 * command zone (`commanderToGraveyard`): a whole point, against the 0.05 a
 * graveyard card is worth. */
const COMMANDER_STAYS_MARGIN = 1;

/**
 * `ids` in the order a decision's candidates are drawn from, most valuable
 * first: as given (by mana value) but for a discard from our own hand, which
 * is tried from the cards least worth keeping (`hand-worth.ts`'s
 * `mostWorthKeepingFirst`, the hand read as `withHandReadForKeeps` has the
 * search read it).
 */
function keepFirst(
  state: GameState,
  cards: CardRegistry,
  weights: EvalWeights,
  me: PlayerId,
  ids: ObjectId[],
): ObjectId[] {
  // Our own things to exile from several zones (`exile-from-zones`): the
  // permanents first, the card asking first of them (Lich's Mastery), then
  // the hand as a discard reads it, the graveyard last — so the candidates,
  // tried least valuable first, give up the graveyard, then the hand.
  if (state.awaiting?.kind === "choose-from-zone" && state.awaiting.acrossZones === true) {
    const zone = (id: ObjectId): string | undefined => state.objects[id]?.zone;
    const source = state.decisionSource?.object;
    const hand = ids.filter((id) => zone(id) === "hand");
    return [
      ...ids.filter((id) => id === source),
      ...ids.filter((id) => zone(id) === "battlefield" && id !== source),
      ...(hand.length > 0 ? keepFirstInHand(state, cards, weights, me, hand) : []),
      ...ids.filter((id) => zone(id) !== "battlefield" && zone(id) !== "hand"),
    ];
  }
  if (state.awaiting?.kind !== "discard") return ids;
  return keepFirstInHand(state, cards, weights, me, ids);
}

/** `ids`, cards in our hand, the ones most worth keeping first — see
 * `keepFirst`. */
function keepFirstInHand(
  state: GameState,
  cards: CardRegistry,
  weights: EvalWeights,
  me: PlayerId,
  ids: ObjectId[],
): ObjectId[] {
  const hand = new Set(state.zones.perPlayer[me]?.hand ?? []);
  if (!ids.every((id) => hand.has(id))) return ids;
  const lands = state.zones.shared.battlefield.filter((id) => {
    const object = state.objects[id];
    return (
      object !== undefined &&
      object.controller === me &&
      cards.has(object.cardName) &&
      cards.get(object.cardName).types.includes("land")
    );
  }).length;
  const opponents = state.turnOrder.filter((p) => p !== me && !state.players[p].hasLost).length;
  return mostWorthKeepingFirst(state, cards, me, ids, lands, weights.landCap, (def) =>
    worthKeeping(cards, def, opponents),
  );
}

/**
 * The best answer to the decision pending in `view`, by playing each candidate
 * out to `horizon` and scoring it. Ties keep `inherited` — v1's answer — so a
 * search only ever changes an answer it can see is better.
 *
 * `selfFor` plays our own seat in each rollout (a fresh one per candidate, so
 * every candidate gets the same nested budget). At the top level it's a
 * {@link DecisionRolloutController}, so a decision that leads straight into
 * another is judged by what we'd really answer next: a trigger's target is
 * worth nothing if the "you may" after it is declined, which is exactly what
 * v1 would do.
 *
 * `keptBy` is how much better than `inherited` another answer has to score
 * to replace it: 0 for a search, and a margin where v1's answer rests on
 * something the rollouts can't see (`KEPT_PER_MANA`, `EvalBotController.decide`).
 */
/** `legal` without the players who have protection from `me` as defenders
 * (`playerProtectedFrom`): nothing `me` controls can damage them. A
 * planeswalker of theirs is still one. */
function reachableDefenders(state: GameState, me: PlayerId, legal: DeclareAttackersLegal): DeclareAttackersLegal {
  const shut = (d: PlayerId | ObjectId): boolean =>
    state.players[d as PlayerId] !== undefined && playerProtectedFrom(state, d as PlayerId, me);
  if (!legal.defenders.some(shut)) return legal;
  return {
    ...legal,
    defenders: legal.defenders.filter((d) => !shut(d)),
    defendersFor: Object.fromEntries(
      Object.entries(legal.defendersFor).map(([attacker, options]) => [attacker, options.filter((d) => !shut(d))]),
    ) as DeclareAttackersLegal["defendersFor"],
  };
}

/** What an answer that leaves us dead to the swing back scores below every
 * answer that doesn't (`bestDecision`). Half a lost game, and so still above
 * one: exposed next turn beats dead this turn. (An attack's `UNSAFE` is a
 * hundred lost games, among declarations none of which loses on the spot.) */
export const OPEN_ANSWER = -5e5;

/** What a priority candidate that takes us out of a board we are dead on
 * scores above every one that doesn't (`EvalBotController.score`): half a
 * won game, so below a win and above any position. */
export const ESCAPES = 5e5;

/** Whether `me`, still in a game still going, is dead to the opponents'
 * swing back on `state` as it shows: the crackback with its weights and
 * margin, without `crackbackGrowth` (`EvalBotController.crackbackLethal`,
 * ungrown, for a caller that is no controller). Not in a turn of our own:
 * a rollout that has come round to it has played the opponents' attacks,
 * and what they could do after our turn is that turn's to answer. */
function openToCrackback(state: GameState, cards: CardRegistry, me: PlayerId, weights: EvalWeights): boolean {
  if (state.result.over || state.players[me]?.hasLost !== false) return false;
  if (state.turnOrder[state.turn.activePlayerIndex] === me) return false;
  const through = crackback(state, cards, me, weights.crackbackParanoia, undefined, {
    weight: weights.crackbackKillShot,
    margin: weights.crackbackMargin,
  });
  return isLethal(state, me, through, -weights.crackbackMargin);
}

function bestDecision(
  view: ControllerView,
  inherited: Action,
  cards: CardRegistry,
  weights: EvalWeights,
  horizon: Horizon,
  rollout: RolloutPolicy,
  budget: SearchBudget,
  selfFor?: () => PlayerController,
  trace?: EvalBotOptions["trace"],
  keptBy = 0,
  /** Another measure of an answer, in place of the rollout to `horizon`;
   * `undefined` leaves that answer to the rollout
   * (`EvalBotController.byTheTurnItLeaves`). */
  scoreBy?: (action: Action) => number | null | undefined,
  /** Filled with the answers scored as leaving us dead to the swing back
   * (`OPEN_ANSWER`), for the replay (`EvalBotController.lastOpenAnswers`). */
  opened?: Action[],
  /** The answers to play out for a decision whose module lists none (a
   * "you may cast": `HeuristicBotController.castNowAnswers`). */
  answers?: () => readonly Action[],
): Action {
  const me = view.player;
  if (inherited.player !== me || budget.left <= 1 || spent(budget)) return inherited;
  // A guess about a card we can't see: playing both answers out would read
  // the card itself. v1's answer is made from what we could know.
  if (view.state.awaiting?.kind === "choose-modes" && view.state.awaiting.guess !== undefined) return inherited;
  const legal = view.legalActions().find((l) => l.kind !== "pass-priority");
  const listed =
    legal === undefined
      ? null
      : decisionCandidates(
          withComputedCache(() => aimOffer(view.state, cards, me, legal)),
          me,
          (ids) => keepFirst(view.state, cards, weights, me, byManaValue(view.state, cards, ids, me)),
          (id) => view.state.objects[id]?.controller,
          // Poison and rad counters are both bad to have (rad mills and
          // drains its player, rule 728.1): proliferate them only onto opponents.
          (player) => (view.state.players[player]?.counters.poison ?? 0) + (view.state.players[player]?.counters.rad ?? 0),
        );
  // A trigger's divided amount (Dragonlord Atarka's 5): each choice of two
  // targets or more with the shares worth trying, not the even split an
  // answer without a `division` is given.
  const candidates =
    listed === null || legal === undefined
      ? (answers?.() ?? listed)
      : withComputedCache(() => withDivisions(view.state, cards, legal, listed));
  if (candidates === null || candidates.length === 0) return inherited;

  const score = (action: Action): number | null => {
    budget.left -= 1;
    const other = scoreBy?.(action);
    if (other !== undefined) return other;
    const after = timed(budget, () =>
      simulateAction(view.state, cards, action, horizon, rollout, selfFor?.()),
    );
    trace?.(action, after);
    if (after === null) return null;
    // An answer is checked against the swing back as an attack or a tap is:
    // one that leaves us dead to the crackback on the board it ends on
    // scores below every answer that doesn't (`OPEN_ANSWER`). A creature
    // that enters unable to block, the blocker sacrificed, the removal aimed
    // past the attacker that kills us: a rollout that ends with our own turn
    // saw none of it. Where every answer leaves us dead it sorts nothing.
    const value = evaluateState(after, cards, me, weights);
    if (!openToCrackback(after, cards, me, weights)) return value;
    opened?.push(action);
    return OPEN_ANSWER + value;
  };
  // Where the answer is a removal's targets, what its aim is worth past the
  // evaluation (`aimPremium`): every candidate here is the same removal.
  const aim = (action: Action): number =>
    legal !== undefined && legal.kind === "choose-targets" && action.type === "choose-targets"
      ? aimPremium(view.state, cards, weights, me, legal.cardName, action.targets)
      : 0;
  let best = inherited;
  const inheritedScore = score(inherited);
  let bestScore = inheritedScore === null ? -Infinity : inheritedScore + keptBy + aim(inherited);
  const seen = JSON.stringify(inherited);
  for (const candidate of candidates) {
    if (spent(budget)) break;
    if (JSON.stringify(candidate) === seen) continue;
    const scored = score(candidate);
    const value = scored === null ? null : scored + aim(candidate);
    if (value !== null && value > bestScore) {
      best = candidate;
      bestScore = value;
    }
  }
  return best;
}

/** What a card a round of engine adds to a target's rank, on
 * `targetValue`'s scale (a vanilla 3/3 for three is 9, a 4/4 for five 12):
 * an Archivist (4.5 by its stats) then ranks above a 3/3 and below a 4/4.
 * The search, not this, chooses between them; this only has to put an engine
 * among the combinations it plays out. */
const RANK_ENGINE = 6;

/**
 * How v2 prices a target when ranking an offer: {@link targetValue}'s stats,
 * plus how much of an engine a permanent is (`engineScore`: its printed draw
 * and token rates and its track record). By stats alone an Archivist that has
 * drawn three cards ranked below a vanilla Grizzly Bears, and on a wide board
 * fell outside the combinations the search ever plays out.
 */
function rankValue(state: GameState, cards: CardRegistry, ref: TargetRef): number {
  const stats = targetValue(state, cards, ref);
  return ref.kind === "object" ? stats + RANK_ENGINE * engineScore(state, cards, ref.object) : stats;
}

/**
 * `legal` with each target slot's options in the order worth simulating:
 * the side the slot's effect belongs on first, most valuable first
 * (`target-polarity.ts`), then the rest, least valuable first.
 *
 * Candidates are capped — `MAX_TARGET_COMBOS` (8) combinations of a spell or
 * ability, a dozen rollouts for a decision — and `legalTargets` lists the
 * players in turn order, then the battlefield oldest-first. So on a wide
 * four-player board the eight combinations v2 simulated for "destroy target
 * permanent" were the eight oldest permanents, lands from turn one, and the
 * threat worth destroying was never considered: measured, 27% of targeted
 * offers had more combinations than the cap, and 1,266 of those had an
 * opponent's target beyond it. Ranking first makes the cap cut the least
 * likely targets instead.
 *
 * Wrong-side options go last rather than away: Brash Taunter fighting its
 * own creature is a real play, and only the search can tell. A slot the
 * polarity can't read keeps the offer's order.
 */
export function aimOffer(
  state: GameState,
  cards: CardRegistry,
  me: PlayerId,
  legal: LegalAction,
): LegalAction {
  // A delve spell a player pays {X} to stop (Logic Knot) at no more X than
  // that player could pay: the candidates are cast at the offer's largest.
  return aimTargets(state, cards, me, legal.kind === "cast-spell" ? withEnoughX(state, cards, legal) : legal);
}

function aimTargets(state: GameState, cards: CardRegistry, me: PlayerId, legal: LegalAction): LegalAction {
  // Each slot's side as this deck reads it (`deck-bias.ts`).
  const bias = polarityBias(state, me);
  // Ranked, then twins cut to as many as there are slots (`bot/twins.ts`):
  // seven identical Scute Swarms are one option, not seven simulations.
  // A commander by the damage it has already dealt us, on top: the one
  // three points from our 21 comes before a bigger creature that isn't. A
  // modal spell's slots are tried at their first target alone, and by
  // stats and engine a token maker outranked the Slicer that then killed us
  // (a kept live game, 2026-11-22).
  const clock = (ref: TargetRef): number =>
    ref.kind === "object" ? (state.players[me]?.commanderDamageTaken[ref.object] ?? 0) : 0;
  const value = (s: GameState, registry: CardRegistry, ref: TargetRef): number => rankValue(s, registry, ref) + clock(ref);
  const aim = (options: readonly TargetRef[], polarity: Polarity | undefined, slots: number, damage?: number) =>
    collapseTwins(state, rankTargets(state, cards, me, options, polarity ?? "either", value, damage), slots);
  if (legal.kind === "choose-targets") {
    const polarities = pendingTargetPolarities(state, cards, bias);
    return {
      ...legal,
      options: legal.options.map((options, i) => aim(options, polarities?.[i], legal.options.length)),
    };
  }
  if (legal.kind !== "cast-spell" && legal.kind !== "activate-ability") return legal;
  if (legal.kind === "cast-spell" && legal.castModal !== undefined) {
    // A targeted modal spell's modes carry targets of their own.
    const modal = legal.castModal;
    const byMode = modalPolarities(cards, legal, bias);
    const slots = modal.modes.reduce((n, mode) => n + mode.targetOptions.length, 0);
    return {
      ...legal,
      castModal: {
        ...modal,
        modes: modal.modes.map((mode, m) => ({
          ...mode,
          targetOptions: mode.targetOptions.map((options, i) => aim(options, byMode?.[m]?.[i], slots)),
        })),
      },
    };
  }
  if (legal.targetOptions.length === 0) return legal;
  const polarities = offerPolarities(cards, legal, bias);
  // What each slot's damage comes to, so what it kills is tried first.
  const damages = offerDamage(cards, legal);
  return {
    ...legal,
    targetOptions: legal.targetOptions.map((options, i) =>
      aim(options, polarities?.[i], legal.targetOptions.length, damages[i]),
    ),
  };
}

/** Highest mana value first — the order a capped tutor or discard search
 * tries cards in, so the cap cuts the least likely picks. A choice among
 * lands alone (all mana value 0) puts a colour we can't make yet first
 * (`land-colors.ts`), as v1 does. */
function byManaValue(
  state: GameState,
  cards: CardRegistry,
  ids: readonly ObjectId[],
  me: PlayerId,
): ObjectId[] {
  const ranked = newColorsFirst(state, cards, me, ids);
  const mv = (id: ObjectId): number => {
    const name = state.objects[id]?.cardName;
    return name !== undefined && cards.has(name)
      ? manaValue(parseManaCost(cards.get(name).manaCost))
      : 0;
  };
  return ranked.sort((a, b) => mv(b) - mv(a));
}

/**
 * Our own seat inside a decision's rollout: passes priority, fights combat
 * the way the rollout policy says, and searches a further "you may" one level
 * deep (`NESTED_DECISION_KINDS`) — with plain v1 answers beneath that, so it
 * can't recurse — out of one small budget for the whole rollout.
 */
class DecisionRolloutController extends CombatRolloutController {
  private readonly cards: CardRegistry;
  private readonly weights: EvalWeights;
  private readonly horizon: Horizon;
  private readonly rollout: RolloutPolicy;
  private readonly budget: SearchBudget = newBudget(NESTED_DECISION_ROLLOUTS, Infinity);

  constructor(
    playerId: PlayerId,
    cards: CardRegistry,
    weights: EvalWeights,
    horizon: Horizon,
    rollout: RolloutPolicy,
  ) {
    super(playerId, cards);
    this.cards = cards;
    this.weights = weights;
    this.horizon = horizon;
    this.rollout = rollout;
  }

  act(view: ControllerView): Action {
    const inherited = super.act(view);
    if (view.state.awaiting === null || !NESTED_DECISION_KINDS.has(view.state.awaiting.kind)) return inherited;
    return bestDecision(
      view,
      inherited,
      this.cards,
      this.weights,
      this.horizon,
      this.rollout,
      this.budget,
    );
  }

  declareAttackers(view: ControllerView): readonly AttackerDeclaration[] {
    return this.rollout === "combat" || this.rollout === "acting" || this.rollout === "playing"
      ? super.declareAttackers(view)
      : [];
  }

  declareBlockers(view: ControllerView): readonly BlockerDeclaration[] {
    return this.rollout === "passive" ? [] : super.declareBlockers(view);
  }
}

/**
 * Our own seat inside a priority rollout on an opponent's turn, before blocks
 * are declared: v1's answers, as the rollout's stand-in gives, but our blocks
 * by v2's own block search (`REAL_BLOCK_SIMULATIONS`). v1 chumps only to stay
 * alive, so under it creatures left home often block nothing, and whatever a
 * candidate taps or sacrifices of them costs nothing in the rollout: at 15
 * life in front of 16 power, four of five lifelink Soldiers went to Nullmage
 * Shepherd for a Talisman (a watched game, 2026-11-15). Every candidate of
 * the decision, the pass included, is rolled out with the same seat, so what
 * differs between them is the blocks each leaves us able to make.
 * `docs/plans/bot-next-steps.md`, step 1b.
 */
class RealBlocksController extends CombatRolloutController {
  private readonly cards: CardRegistry;
  private readonly weights: EvalWeights;

  constructor(playerId: PlayerId, cards: CardRegistry, weights: EvalWeights) {
    super(playerId, cards);
    this.cards = cards;
    this.weights = weights;
  }

  declareBlockers(view: ControllerView): readonly BlockerDeclaration[] {
    return new EvalBotController(this.playerId, this.cards, {
      weights: this.weights,
      maxSimulations: REAL_BLOCK_SIMULATIONS,
      plan: "off",
    }).declareBlockers(view);
  }
}

/**
 * Our own seat in a rollout of our own turn under `rolloutAttacks: "v2"`:
 * v1's answers, but our attack by a small attack search of v2's own
 * (`REAL_ATTACK_SIMULATIONS`, `lightAttacks`: against v1's blocks, no check
 * of its own). The attacking mirror of {@link RealBlocksController}.
 */
class RealAttacksController extends CombatRolloutController {
  private readonly cards: CardRegistry;
  private readonly weights: EvalWeights;
  private readonly memo: Map<string, readonly AttackerDeclaration[]>;
  private readonly onlyWhenHeld: boolean;
  private readonly full: boolean;

  /** `memo` is shared by every rollout of one decision: most of its
   * candidates come to the same combat (`combatBoardKey`), and one attack
   * search each is the cost of this seat. */
  constructor(
    playerId: PlayerId,
    cards: CardRegistry,
    weights: EvalWeights,
    memo: Map<string, readonly AttackerDeclaration[]>,
    onlyWhenHeld = false,
    full = false,
  ) {
    super(playerId, cards);
    this.cards = cards;
    this.weights = weights;
    this.memo = memo;
    this.onlyWhenHeld = onlyWhenHeld;
    this.full = full;
  }

  declareAttackers(view: ControllerView): readonly AttackerDeclaration[] {
    // `"v2-when-v1-holds"`: v1's attack wherever it sends something; the
    // search only where v1 would send nothing (the timid case: a menace
    // Slicer held home from a lone blocker at 20 commander damage).
    if (this.onlyWhenHeld) {
      const v1 = super.declareAttackers(view);
      if (v1.length > 0) return v1;
    }
    const key = combatBoardKey(view.state, this.cards);
    const known = this.memo.get(key);
    if (known !== undefined) return known;
    const attack = new EvalBotController(this.playerId, this.cards, {
      weights: this.weights,
      maxSimulations: REAL_ATTACK_SIMULATIONS,
      plan: "off",
      // `"v2-full"`: the whole search, its answer checked against the
      // defenders' own blocks and the swing back (1a), as a real attack is.
      lightAttacks: !this.full,
    }).declareAttackers(view);
    this.memo.set(key, attack);
    return attack;
  }
}

/** What an attack declaration is decided on: each player's life, poison and
 * commander damage taken, and every creature as combat reads it (power,
 * toughness, damage, keywords, tapped, able to attack and block). Two boards
 * with the same key get the same attack from `RealAttacksController`. */
function combatBoardKey(state: GameState, cards: CardRegistry): string {
  return withComputedCache(() =>
    JSON.stringify(
      state.turnOrder.map((player) => {
        const p = state.players[player];
        const creatures = combatCreatures(state, cards, player, false, player === state.turnOrder[state.turn.activePlayerIndex]).map((c) => [
          c.id,
          state.objects[c.id]?.tapped === true,
          state.objects[c.id]?.stackCount ?? 1,
          c.power,
          c.toughness,
          c.damage,
          [...c.keywords].sort().join(" "),
          c.canAttack,
          c.canBlock,
        ]);
        return [p?.life, p?.counters.poison ?? 0, p?.commanderDamageTaken, p?.hasLost === true, creatures];
      }),
    ),
  );
}

/**
 * The board a swing back is played from (`EvalBotController.swingBack`), as
 * much of it as decides what the opponents' turns do to it with every seat
 * passing and fighting combat as v1: the combat board (`combatBoardKey`),
 * and every permanent that isn't a land, by controller, name and counters.
 * Not hands, libraries, graveyards, lands or mana: nobody casts in a swing
 * back, so two lines that differ only there are swung back at alike, and
 * one simulation answers for both.
 */
function swingBoardKey(state: GameState, cards: CardRegistry): string {
  return withComputedCache(() => {
    const permanents: string[] = [];
    for (const id of state.zones.shared.battlefield) {
      const object = state.objects[id];
      if (object === undefined) continue;
      if (computeCharacteristics(state, cards, id).types.includes("land")) continue;
      permanents.push(`${object.controller}:${object.cardName}:${JSON.stringify(object.counters ?? null)}`);
    }
    return `${combatBoardKey(state, cards)}|${permanents.sort().join(";")}`;
  });
}

/**
 * The opponents whose creatures the evaluation counts in full against `me`
 * on `state` (`features.ts`' `threat`): the only opponent left, or one who
 * attacked us within the last round (`PlayerState.lastAttackedBy`). They are
 * who attacks us in a swing back (`EvalBotController.swingBack`).
 */
function aimedAtUs(state: GameState, me: PlayerId): Set<PlayerId> {
  const living = state.turnOrder.filter((p) => state.players[p]?.hasLost !== true);
  const opponents = living.filter((p) => p !== me);
  if (opponents.length <= 1) return new Set(opponents);
  const record = state.players[me]?.lastAttackedBy ?? {};
  return new Set(
    opponents.filter((p) => {
      const last = record[p];
      return last !== undefined && state.turn.number - last < living.length;
    }),
  );
}

/**
 * An opponent aimed at us in a swing back (`aimedAtUs`): v1's rollout
 * stand-in, attacking as v1 does with `target` and its planeswalkers the
 * only defenders there are — what is safe to send at us comes, the rest
 * stays home.
 */
class AimedSwingController extends CombatRolloutController {
  private readonly target: PlayerId;

  constructor(playerId: PlayerId, cards: CardRegistry, target: PlayerId) {
    super(playerId, cards);
    this.target = target;
  }

  declareAttackers(view: ControllerView): readonly AttackerDeclaration[] {
    const ours = (defender: PlayerId | ObjectId): boolean =>
      defender === this.target || view.state.objects[defender as ObjectId]?.controller === this.target;
    const narrowed: ControllerView = {
      ...view,
      legalActions: () =>
        view.legalActions().map((offer) =>
          offer.kind !== "declare-attackers"
            ? offer
            : {
                ...offer,
                defenders: offer.defenders.filter(ours),
                defendersFor: Object.fromEntries(
                  Object.entries(offer.defendersFor).map(([attacker, defenders]) => [attacker, defenders.filter(ours)]),
                ),
              },
        ),
    };
    return super.declareAttackers(narrowed);
  }
}

/** What a line we don't live through the swing back of loses
 * (`EvalBotController.swingBack`): the evaluation's price of being out of
 * the game, flat, so lines that all die are still told apart by what each
 * was worth as our turn ended. */
const SWING_DEAD = 1e4;

/** Two swing backs this close in what they change are taken as the same one
 * (`EvalBotController.swingBack`): a twentieth of a card. */
const SWING_SAME = 0.05;

/**
 * An opponent in the swing back (`survivesSwing`): v1's rollout stand-in,
 * attacking `target` with everything that can. The worst case the crackback
 * arithmetic counts, played out.
 */
class SwingAtController extends CombatRolloutController {
  private readonly target: PlayerId;

  constructor(playerId: PlayerId, cards: CardRegistry, target: PlayerId) {
    super(playerId, cards);
    this.target = target;
  }

  declareAttackers(view: ControllerView): readonly AttackerDeclaration[] {
    const legal = view.legalActions().find((o): o is DeclareAttackersLegal => o.kind === "declare-attackers");
    if (legal === undefined) return [];
    return legal.eligible
      .filter((attacker) => (legal.defendersFor[attacker] ?? []).includes(this.target))
      .map((attacker) => ({ attacker, defender: this.target }));
  }
}

/**
 * Our own seat in the swing back: v1's rollout stand-in that does nothing
 * more with its own turn (what the candidate left is what it has) and, once
 * attackers are declared at it, casts the spell in its hand that leaves it
 * alive at the end of that turn, if one does — each castable spell tried in
 * its first few fillings (`ANSWER_FILLINGS`), one combat rollout each, the
 * best board among the ones it lives through.
 *
 * Not a whole v2 on the opponents' turns: that searched every window of
 * them, each candidate a rollout with a block search inside, and one turn of
 * the scenario this is for took 21 seconds.
 */
class AnsweringSeat extends DefendingRolloutController {
  private readonly cards: CardRegistry;
  private readonly weights: EvalWeights;

  constructor(playerId: PlayerId, cards: CardRegistry, weights: EvalWeights) {
    super(playerId, cards);
    this.cards = cards;
    this.weights = weights;
  }

  act(view: ControllerView): Action {
    const s = view.state;
    const me = this.playerId;
    if (
      s.awaiting === null &&
      s.priority.holder === me &&
      s.turn.step === "declare-attackers" &&
      s.turnOrder[s.turn.activePlayerIndex] !== me &&
      s.zones.shared.stack.length === 0
    ) {
      const answer = this.answer(view);
      if (answer !== null) return answer;
    }
    return super.act(view);
  }

  private answer(view: ControllerView): Action | null {
    const s = view.state;
    const me = this.playerId;
    const attacked = s.zones.shared.battlefield.some((id) => {
      const target = s.objects[id]?.attacking ?? null;
      return target !== null && (target === me || s.objects[target as ObjectId]?.controller === me);
    });
    if (!attacked) return null;
    let best: { readonly action: Action; readonly value: number } | null = null;
    for (const legal of view.legalActions()) {
      if (legal.kind !== "cast-spell") continue;
      for (const action of candidateActions(aimOffer(s, this.cards, me, legal), me).slice(0, ANSWER_FILLINGS)) {
        const after = simulateAction(s, this.cards, action, "turn", "combat");
        if (after === null || after.players[me]?.hasLost === true) continue;
        const value = evaluateState(after, this.cards, me, this.weights);
        if (best === null || value > best.value) best = { action, value };
      }
    }
    return best?.action ?? null;
  }
}

/** The steps of our own turn in which a main phase is still to come, or is
 * here: where an answer can be priced by the turn planned after it. */
const PLANNABLE_STEPS: ReadonlySet<string> = new Set(["upkeep", "draw", "precombat-main", "postcombat-main"]);

/** The steps of a turn before its blocks are declared. */
const BEFORE_BLOCKS: ReadonlySet<string> = new Set([
  "untap",
  "upkeep",
  "draw",
  "precombat-main",
  "begin-combat",
  "declare-attackers",
]);

/** The casts and activations a bot has a player it controls make in one turn,
 * at most: each must leave the board better for the bot than the one before
 * (`EvalStandIn.play`), so they end by themselves, and this bounds an ability
 * that could be paid for ever. */
const STAND_IN_PLAYS = 20;

/** How many fillings of one cast or activation (its targets, best first for
 * the bot) a stand-in tries. */
const STAND_IN_FILLINGS = 4;

/**
 * A searching bot making another player's decisions (rule 723, Mindslaver),
 * for the bot's good and from its seat's evaluation:
 *
 * - each decision the player is told to make gets the answer that leaves the
 *   board best for the bot, read one step ahead. Which is the worst for the
 *   player, near enough;
 * - at each of the player's priority windows on an empty stack, the cast or
 *   activation of theirs that leaves the board best for the bot once it has
 *   resolved, where one beats passing (`play`): their removal at their own
 *   best creature, their burn at their own face, a pump on the bot's. Until
 *   2026-11-17 it passed every window, and a bot's Mindslaver turn was legal
 *   and wasted;
 * - their combat stays `StandInController`'s: no attack, and no block the
 *   rules don't require. Sending their creatures at another opponent, or into
 *   the bot's blockers, would need the attack search run from the bot's seat
 *   on another player's creatures, which nothing here does yet.
 *
 * All of it on the view the bot's seat may plan on (`fair`,
 * `EvalBotController.fairView`): the controlled player's hand, which a
 * controller sees, and no library's order.
 */
class EvalStandIn extends StandInController {
  private readonly forPlayer: PlayerId;
  private readonly cards: CardRegistry;
  private readonly weights: EvalWeights;
  private readonly fair: (view: ControllerView) => ControllerView;
  private readonly plays: { turn: number; made: number };

  constructor(
    player: PlayerId,
    forPlayer: PlayerId,
    cards: CardRegistry,
    weights: EvalWeights,
    fair: (view: ControllerView) => ControllerView,
    plays: { turn: number; made: number },
  ) {
    super(player);
    this.forPlayer = forPlayer;
    this.cards = cards;
    this.weights = weights;
    this.fair = fair;
    this.plays = plays;
  }

  act(real: ControllerView): Action {
    const view = this.fair(real);
    if (view.state.awaiting !== null && view.viewAfter !== undefined) {
      let best: Action | null = null;
      let bestScore = -Infinity;
      for (const candidate of view.legalActions().flatMap((o) => decisionCandidates(o, view.player) ?? [])) {
        const after = view.viewAfter(candidate);
        if (after === null) continue;
        const score = evaluateState(after.state, this.cards, this.forPlayer, this.weights);
        if (score > bestScore) {
          best = candidate;
          bestScore = score;
        }
      }
      if (best !== null) return best;
    }
    if (view.state.awaiting === null) {
      const play = this.play(view);
      if (play !== null) return play;
    }
    return super.act(real);
  }

  /**
   * The cast or activation of the controlled player's that leaves the board
   * best for the bot, or `null` when none beats passing. Each offer's targets
   * are aimed from the bot's seat (`aimOffer`: harm at anyone but the bot,
   * the dearest first, which is the player's own as soon as theirs is the
   * dearest; help at the bot's), each filling is played to the end of its
   * resolution with every seat passing, and the board it leaves is scored as
   * the bot scores its own (`evaluateState`, from the bot's seat). Passing is
   * the board as it stands, so a spell that only helps its caster stays in
   * their hand, and a turn's plays end once nothing more improves on it.
   *
   * Not a mana ability (mana empties with the step, and tapping their lands
   * for nothing is worth nothing a later window can't still take), and not a
   * land: a land drop is theirs to keep.
   */
  private play(view: ControllerView): Action | null {
    const state = view.state;
    const them = this.playerId;
    if (state.zones.shared.stack.length > 0 || state.priority.holder !== them) return null;
    if (this.plays.turn !== state.turn.number) {
      this.plays.turn = state.turn.number;
      this.plays.made = 0;
    }
    if (this.plays.made >= STAND_IN_PLAYS) return null;
    let best: Action | null = null;
    let bestScore = evaluateState(state, this.cards, this.forPlayer, this.weights);
    for (const legal of view.legalActions()) {
      if (legal.kind !== "cast-spell" && legal.kind !== "activate-ability") continue;
      if (legal.kind === "activate-ability" && legal.manaAbility === true) continue;
      const aimed = withComputedCache(() => aimOffer(state, this.cards, this.forPlayer, legal));
      for (const action of candidateActions(aimed, them).slice(0, STAND_IN_FILLINGS)) {
        const after = simulateAction(state, this.cards, action, "stack", "passive");
        if (after === null) continue;
        const score = evaluateState(after, this.cards, this.forPlayer, this.weights);
        if (score > bestScore) {
          best = action;
          bestScore = score;
        }
      }
    }
    if (best !== null) this.plays.made += 1;
    return best;
  }
}

export class EvalBotController extends HeuristicBotController {
  private readonly cards: CardRegistry;
  readonly weights: EvalWeights;
  private readonly horizon: Horizon;
  private readonly rollout: RolloutPolicy;
  /** The rollout this priority decision is scored with: `rollout`, or
   * `"acting"` while we have a cast payoff (`castPayoff`). */
  private decisionRollout: RolloutPolicy;
  /** This priority decision's `crackbackGuard`: null when nothing a cast or
   * activation taps or sacrifices could make the crackback lethal. */
  private tapGuard: TapGuard | null = null;
  /** Whether, in this priority decision on our own turn, the board as it
   * stands has us dead to one opponent's swing back alone (`score`'s
   * `ESCAPES`). Read once a decision, when the first candidate is scored. */
  private deadAsItStands: boolean | null = null;
  /** This decision's swing backs, by the board each started from
   * (`survivesSwing`): a decision asks the same board more than once.
   * Emptied as each decision's guard is read (`crackbackGuard`). */
  private swings = new WeakMap<GameState, boolean | null>();
  /** A play held for after combat this turn (`holdsWipeForCombat`, or a
   * planned line's move after combat): our combat steps keep its mana
   * (`spendsHeldMana`). */
  private heldPlay: { readonly turn: number; readonly action: Action } | null = null;
  private readonly rolloutDecisions: boolean;
  private readonly maxSimulations: number;
  private readonly rolloutAttacks: "v1" | "v2" | "v2-when-v1-holds" | "v2-full";
  /** The current decision's rollout attacks by combat board (`RealAttacksController`). */
  private attackMemo = new Map<string, readonly AttackerDeclaration[]>();
  private readonly lightAttacks: boolean;
  private readonly rolloutSwingBack: boolean;
  /** Under `rolloutSwingBack`, the turn this priority search is made in when
   * it is our own: a rollout that ends as the next turn begins has its swing
   * back added (`swingBack`). `null` for every other decision. */
  private swingTurn: number | null = null;
  /** This decision's swing backs by the board each was played from
   * (`swingBoardKey`): what the opponents' turns changed in the evaluation,
   * `-SWING_DEAD` where we didn't live through them. */
  private readonly swingBacks = new Map<string, number>();
  /** The opponents who attack us in this decision's swing backs
   * (`swingBack`, `aimedAtUs`). */
  private swingAimed: ReadonlySet<PlayerId> = new Set();
  private readonly timeBudgetMs: number;
  private readonly now: () => number;
  /** When the decision under way was asked, under a clock (`onClock`). */
  private askedAt: number | null = null;
  private readonly trace: EvalBotOptions["trace"];
  /** The stack this bot last passed on, and on which turn — see
   * `holdPass`. */
  private passedOn: { readonly turn: number; readonly stack: readonly ObjectId[] } | null = null;
  /**
   * The last empty-stack window, outside our own main phases, whose whole
   * search passed: its `passMemoKey` — the candidates and everything in the
   * state but the step and who holds priority. A later window of the same
   * turn with the same key passes without a search or v1's `act` (the bot
   * audit's S3, 2026-11-10: a seat holding an instant searched every step of
   * every turn, and acted at 1.1% of an opponent's empty-stack windows). The
   * key holds the turn's number, so it never outlives the turn. What depends
   * on the step still runs first, in `listCandidates`: a held fetch or
   * creature released changes the candidates, and a cantrip that came due is
   * played on a hit.
   */
  private passMemo: string | null = null;
  private readonly passMemoMode: "on" | "off" | "check";
  /** Under `passMemo: "check"`: the memo's hits, the simulations a skip
   * would have saved, and each hit the search answered differently. */
  readonly passMemoChecks: { hits: number; saved: number; wrong: string[] } = { hits: 0, saved: 0, wrong: [] };
  /** The stack a searched action (not a pass) was chosen on — see
   * `holdPass`. */
  private actedOn: { readonly turn: number; readonly stack: readonly ObjectId[] } | null = null;
  /** A batch of activations under way — see `act` and `continueBatch`. */
  private batch: {
    readonly action: Action;
    /** Each activation at a target none before it took — see
     * `nextInBatch`. */
    readonly spread: boolean;
    readonly remaining: number;
    readonly turn: number;
    /** The stack's size before the first activation. */
    readonly base: number;
    /** The stack's size once our last activation went on it — or, while
     * the batch resolves, the last time we passed. */
    readonly stack: number;
  } | null = null;
  /** An untap plan under way (`untap-plans.ts`): its mana tap was played,
   * and `continuePlan` plays the untap, passes while it resolves, then casts
   * `cast` — or drops the plan the moment anything else happens. */
  private plan: {
    readonly untap: Action;
    readonly cast: ObjectId;
    readonly turn: number;
    readonly step: string;
    stage: "untap" | "resolve";
  } | null = null;
  /** See {@link DecisionAudit}. Written, never read. */
  lastDecision: DecisionAudit | null = null;
  /** When the last priority search's move won by what it lets us do next
   * (`planLines`): the move, the line's next step and the line's value. `null`
   * when no line beat the moves scored alone. Written, never read. */
  lastFollowUp: { readonly action: Action; readonly score: number; readonly then: Action } | null = null;
  private readonly planMode: "turn" | "next-turn" | null;
  private readonly planSimulations: number;
  private readonly libraryOrder: "hidden" | "real";
  private readonly opponentHands: "hidden" | "real";
  /** What this seat has seen of the hidden cards (`seat-memory.ts`), taken
   * in at every decision the real game asks it (`fairView`). */
  private readonly memory = seatMemory();
  /** How many answers the real game refused on a copy, so v1 answered
   * (`act`): each one is a place the dealt state and the table disagreed
   * that nothing caught earlier. Written, never read; zero is the aim. */
  refusedAnswers = 0;
  /**
   * The rest of the line the last plan chose (`planLines`), replayed window
   * by window (`continueTurnPlan`) while each step's board is the one it was
   * planned on.
   */
  private turnPlan: { readonly turn: number; steps: PlanStep[]; boards: string[] } | null = null;
  /** How often each ability has been activated this turn (`activation-cap.ts`). */
  readonly activationCap = new ActivationCap();
  /** The turn on which one rollout didn't fit the clock (`noteCost`), or -1. */
  private tooSlow = -1;
  /** What the last priority search played in place of passing, when the
   * search's best was to pass (a due play — `isSacrificeForCardsDue`, `isSuspendDue`), so a replay
   * of its scores can do the same (`scenario-fit.ts`). Written, never read. */
  lastPassFallback: Action | null = null;
  /** The wipes the last priority search held for after combat
   * (`holdsWipeForCombat`): scored like any candidate, but one that scores
   * best is played as a pass. For `scenario-fit.ts`'s replay. */
  lastHeldForCombat: readonly Action[] = [];
  /** Whether the last priority search broke a tie with passing toward
   * acting (the `"acting"` rollout), for `scenario-fit.ts`'s replay. */
  lastTiesAct = false;
  /** The candidates that tied with passing but weren't worth acting on alone
   * (`scoreAlone`), so the tie stayed with passing — for the replay. */
  lastRefusedTies: Action[] = [];
  /** The counterspells the last priority search scored and then left out,
   * worth casting only for what the cast triggers (`castForItsTriggers`):
   * for the replay, which would otherwise pick them by their score. */
  lastHeldForTriggers: Action[] = [];
  /** The payoff the last turn plan moved to the front of its line
   * (`planLines`), the move that line began with, and whether the two orders
   * ended the same but for cards the seat can't know (`sameKnownEnd`) — for
   * the replay, which otherwise plays the first of the best. */
  lastPayoffAhead: { readonly action: Action; readonly over: Action; readonly same: boolean } | null = null;
  /** The candidates the last priority search ranked unsafe for the
   * crackback (`tapsIntoCrackback`), for the replay. */
  lastUnsafe: Action[] = [];
  /** v1's answer to the last decision searched, where another had to beat it
   * by a margin (`KEPT_PER_MANA`), and that margin — for the replay. */
  lastKept: { readonly action: Action; readonly by: number } | null = null;
  /** The answers to the last decision searched that left us dead to the
   * swing back (`OPEN_ANSWER`), for the replay. */
  lastOpenAnswers: Action[] = [];
  /**
   * Where the last priority search's rollout of each candidate ended, when
   * that rollout is the one a plan scores a line by — our seat passing to
   * the end of the turn (`score`) — so the plan takes its one-step lines
   * from here and rolls none of them out again (`planTurn`'s `scored`; the
   * bot audit's S4).
   */
  private lastEnds = new Map<Action, ScoredFirst>();
  /** How this decision's pass came out, and its pass scored alone
   * (`scoreAlone`): what an interaction's outcome is read against
   * (`valueAimed`). `null` until that pass is scored. */
  private passOutcome: EvalOutcome | null = null;
  private passAloneOutcome: EvalOutcome | null = null;
  /** Whether this decision's pass ends the turn dead to the crackback while
   * a tap could matter (`tapGuard`): then that is the rollout's doing (the
   * attack v1 makes for our seat in it), and a batch that ends the same way
   * isn't blamed for it. */
  private passEndsOpen = false;

  constructor(
    playerId: PlayerId,
    registry: CardRegistry = defaultRegistry(),
    options: EvalBotOptions = {},
  ) {
    super(playerId, registry);
    this.cards = registry;
    // Every vector the bot ever runs on goes through this, so the land-drop
    // invariant holds for hand-written champions and tuner mutations alike
    // rather than depending on each of them to get it right.
    this.weights = normalizeWeights(options.weights ?? DEFAULT_WEIGHTS);
    this.horizon = options.horizon ?? "turn";
    this.rollout = options.rollout ?? (isDeepHorizon(this.horizon) ? "playing" : "combat");
    this.decisionRollout = this.rollout;
    this.rolloutDecisions = options.rolloutDecisions ?? false;
    const plan = options.plan ?? "turn";
    this.planMode = plan === "off" ? null : plan;
    this.planSimulations = options.planSimulations ?? DEFAULT_PLAN_SIMULATIONS;
    this.libraryOrder = options.libraryOrder ?? "hidden";
    this.opponentHands = options.opponentHands ?? "hidden";
    this.maxSimulations = options.maxSimulations ?? DEFAULT_MAX_SIMULATIONS;
    this.rolloutAttacks = options.rolloutAttacks ?? "v1";
    this.lightAttacks = options.lightAttacks ?? false;
    this.rolloutSwingBack = options.rolloutSwingBack ?? true;
    this.timeBudgetMs = options.timeBudgetMs ?? Infinity;
    this.now = options.now ?? Date.now;
    this.trace = options.trace;
    this.passMemoMode = options.passMemo ?? "on";
  }

  /** Whether this window is one `passMemo` covers: an empty stack, nothing
   * to answer, outside our own main phases, and not the last window before
   * our turn, where the end-of-turn rules release what they held. */
  private passMemoWindow(state: GameState): boolean {
    if (this.passMemoMode === "off" || state.awaiting !== null || state.zones.shared.stack.length > 0) return false;
    const step = state.turn.step;
    const ours = state.turnOrder[state.turn.activePlayerIndex] === this.playerId;
    if (ours && (step === "precombat-main" || step === "postcombat-main")) return false;
    return !this.isEndOfTurnBeforeOurs(state);
  }

  /** The casts and activations this bot has had each player it controls make,
   * and in which turn (`STAND_IN_PLAYS`). */
  private readonly standInPlays = new Map<PlayerId, { turn: number; made: number }>();

  /** Another player's decisions (rule 723) are answered for this bot's good,
   * on what this seat may know (`fairView`: that player's hand, which it
   * sees, and no library's order). */
  standIn(player: PlayerId): PlayerController {
    let plays = this.standInPlays.get(player);
    if (plays === undefined) this.standInPlays.set(player, (plays = { turn: -1, made: 0 }));
    return new EvalStandIn(player, this.playerId, this.cards, this.weights, (view) => this.fairView(view), plays);
  }

  /** Every decision reads a permanent's track record off the real board in
   * front of it, never off a position its own search only simulated — see
   * `withTrackRecordEvidence`. */
  act(real: ControllerView): Action {
    const view = this.fairView(real);
    const memo = new Map<string, readonly AttackerDeclaration[]>();
    const onlyWhenHeld = this.rolloutAttacks === "v2-when-v1-holds";
    const seat =
      this.rolloutAttacks === "v1"
        ? null
        : () => new RealAttacksController(this.playerId, this.cards, this.weights, memo, onlyWhenHeld, this.rolloutAttacks === "v2-full");
    this.attackMemo = memo;
    // A swing back is its own decision's (`swingBack`): the priority search
    // says when one is wanted.
    this.swingTurn = null;
    this.swingBacks.clear();
    const action = withOurAttackSeat(seat, () => withLibraryTop(this.libraryTopAt(view), () => this.answer(view)));
    // The answer was reached on cards dealt for the seat (`fairView`), and
    // is played at the real table: tried there first on a copy, so nothing
    // the two disagree on is ever thrown mid-game. Refused, the plan goes
    // and v1 answers, from what the real game offers.
    if (view === real || action.type === "pass-priority" || real.legalActionsAfter === undefined) return action;
    if (real.legalActionsAfter(action) !== null) return action;
    this.turnPlan = null;
    this.refusedAnswers += 1;
    const instead = super.act(view);
    if (real.legalActionsAfter(instead) !== null || real.state.awaiting !== null) return instead;
    return { type: "pass-priority", player: this.playerId };
  }

  /**
   * The `libraryTop` feature's context for a decision in `view` (`fairView`'s,
   * where the cards the seat can place lie where they are): the run of our
   * library's top it knows. `null` when the bot reads the real library order,
   * or holds no library.
   */
  private libraryTopAt(view: ControllerView): LibraryTop | null {
    if (this.libraryOrder === "real") return null;
    const me = this.playerId;
    const library = view.state.zones.perPlayer[me]?.library;
    if (library === undefined || library.length === 0) return null;
    const sight = hiddenCardsInSight(view.state, this.cards, me);
    const { top } = knownEnds(library, this.memory.placed[me], sight.tops[me] ?? null);
    return libraryTopOf(view.state, this.cards, me, library.slice(0, top));
  }

  /** `act`'s answer, on the view the seat may plan on. */
  private answer(view: ControllerView): Action {
    const action = this.onClock(() =>
      this.deferToPlan(view, withTrackRecordEvidence(view.state, () => this.actSearched(view))),
    );
    if (action.type !== "activate-ability") return action;
    // The search leaves out what the cap has reached; v1's pick and a turn
    // plan's step come by other roads.
    if (!this.mayActivate(view.state, action.source, action.abilityIndex)) {
      return { type: "pass-priority", player: this.playerId };
    }
    this.activationCap.note(view.state.turn.number, action.source, action.abilityIndex);
    // v1's own count too (`MAX_ACTIVATIONS_PER_TURN`): of what is played, not
    // of what v1 proposed and the search turned down.
    this.noteActivation(view.state.turn.number, action.source, action.abilityIndex);
    return action;
  }

  /**
   * `view` with nothing in it the seat can't know of the cards it can't see
   * (`withHiddenCards`): the state every search of this decision reads and
   * copies, and the looks ahead a view offers, taken from that state too.
   * What is legal now is the real game's (where an unseen card lies changes
   * none of it; a card the seat can see or the decision names is left where
   * it is). The seat's memory takes in the real game first (`observe`). The
   * view itself under `libraryOrder: "real"`.
   */
  private fairView(view: ControllerView): ControllerView {
    if (this.libraryOrder === "real") return view;
    observe(this.memory, view.state, this.cards, this.playerId);
    const state = withHiddenCards(view.state, this.cards, this.playerId, {
      memory: this.memory,
      hands: this.opponentHands,
    });
    const registry = this.cards;
    const player = view.player;
    const after = (action: Action | readonly Action[], keepEvents: boolean): Game => {
      const copy = Game.fromSnapshot(keepEvents ? state : { ...state, eventLog: [] }, { registry });
      for (const each of Array.isArray(action) ? action : [action]) copy.dispatch(each as Action);
      return copy;
    };
    const tried = <T>(look: () => T): T | null => {
      try {
        return look();
      } catch {
        // A refusal means "nothing learned", as the game's own looks say.
        return null;
      }
    };
    return {
      ...view,
      state,
      ...(view.legalActionsAfter === undefined
        ? {}
        : { legalActionsAfter: (action) => tried(() => after(action, false).legalActions(player)) }),
      ...(view.viewAfter === undefined
        ? {}
        : { viewAfter: (action) => tried(() => after(action, false).controllerView(player)) }),
      ...(view.continueAfter === undefined
        ? {}
        : { continueAfter: (action) => tried(() => after(action, true).controllerView(player)) }),
    };
  }

  /** Whether activating `action` again replaces what the last activation
   * did instead of adding to it: its effect makes something a copy
   * (`makesACopy`), and only the last copy to resolve stands. */
  private replacesItself(state: GameState, action: Action): boolean {
    if (action.type !== "activate-ability") return false;
    const name = state.objects[action.source]?.cardName;
    if (name === undefined || !this.cards.has(name)) return false;
    return makesACopy(this.cards.get(name).activated?.[action.abilityIndex]?.effect);
  }

  /** Whether `activationCap` still allows this ability this turn. */
  private mayActivate(state: GameState, source: ObjectId, abilityIndex: number): boolean {
    const name = state.objects[source]?.cardName;
    const cost = name !== undefined && this.cards.has(name) ? this.cards.get(name).activated?.[abilityIndex]?.cost : undefined;
    return this.activationCap.allows(state.turn.number, source, abilityIndex, cost !== undefined && isFreeCost(cost));
  }

  /**
   * Runs one decision with its clock (`timeBudgetMs`) started as it's asked:
   * every search it makes (`budget`) shares the one deadline, counted from
   * here — an attack declaration reached through `act` included — and not
   * from whenever the search itself begins. A priority search starts after
   * v1's own pick (`super.act`), its baseline, and v1 looking at each land
   * on offer took up to 1.9s on a wide board with Ramunap Excavator's 26 —
   * after which the land search spent its whole second as well, 3s in all
   * (2026-10-18). Counted from the ask, that search is out of time already
   * and plays v1's land.
   */
  private onClock<T>(decide: () => T): T {
    if (this.timeBudgetMs === Infinity || this.askedAt !== null) return decide();
    this.askedAt = this.now();
    try {
      // The same deadline inside every rollout the decision runs.
      return withRolloutDeadline(this.askedAt + this.timeBudgetMs, this.now, decide);
    } finally {
      this.askedAt = null;
    }
  }

  /**
   * Passes instead of `action` when it's a move the turn plan has for later
   * (`turnPlan`), searched in a window the plan has no step for — one of our
   * combat steps, between a step through combat and what comes after it.
   * Act of Treason's plan sacrifices the stolen Craw Wurm in the second main
   * phase, after it has attacked; the beginning of combat's search, seeing
   * the Wurm go home at the end of the turn, sacrificed it there.
   */
  private deferToPlan(view: ControllerView, action: Action): Action {
    const plan = this.turnPlan;
    const state = view.state;
    if (plan === null || state.turn.number !== plan.turn || state.awaiting !== null) return action;
    if (state.turn.step === "precombat-main" || state.turn.step === "postcombat-main") return action;
    const key = (a: Action): string | null =>
      a.type === "cast-spell" || a.type === "play-land"
        ? `${a.type}:${a.card}`
        : a.type === "activate-ability"
          ? `ability:${a.source}:${a.abilityIndex}`
          : null;
    const mine = key(action);
    if (mine === null || !plan.steps.some((step) => step !== "combat" && key(step) === mine)) return action;
    return { type: "pass-priority", player: this.playerId };
  }

  private actSearched(view: ControllerView): Action {
    this.lastDecision = null;
    this.lastFollowUp = null;
    this.lastPassFallback = null;
    this.lastHeldForCombat = [];
    const fromTurnPlan = this.continueTurnPlan(view);
    if (fromTurnPlan !== null) {
      this.lastDecision = audit("priority", null, "turn plan replay");
      return this.acted(view, fromTurnPlan);
    }
    if (this.planResolving(view.state)) {
      this.lastDecision = audit("priority", null, "plan resolving");
      this.rememberPass(view);
      return { type: "pass-priority", player: this.playerId };
    }
    const fromPlan = this.continuePlan(view);
    if (fromPlan !== null) {
      this.lastDecision = audit("priority", null, "plan replay");
      return fromPlan;
    }
    const fromBatch = this.continueBatch(view);
    const continued = fromBatch ?? this.holdPass(view);
    this.passedOn = null;
    this.actedOn = null;
    if (continued !== null) {
      this.lastDecision = audit("priority", null, fromBatch !== null ? "batch replay" : "held pass");
      if (continued.type === "pass-priority") this.rememberPass(view);
      return continued;
    }
    // **A window already searched, and passed on** (`passMemo`): the same
    // candidates on the same board at a later step of the turn.
    const early = this.passMemoWindow(view.state) ? this.listCandidates(view) : null;
    const memoKey = early !== null && early.candidates.length > 0 ? passMemoKey(view.state, early) : null;
    if (early !== null && memoKey !== null && this.passMemo === memoKey) {
      const answer = early.cantrip ?? ({ type: "pass-priority", player: this.playerId } as const);
      if (this.passMemoMode === "on") {
        this.lastUnsafe = [];
        this.lastRefusedTies = [];
        this.lastHeldForTriggers = [];
        this.lastPayoffAhead = null;
        this.lastPassFallback = early.cantrip;
        this.lastDecision = audit("priority", null, "pass memo");
        return this.settle(view, answer);
      }
      // `"check"`: search anyway, and count whether the memo was right.
      const searched = this.searchWindow(view, early, memoKey);
      this.passMemoChecks.hits += 1;
      this.passMemoChecks.saved += (this.lastDecision as DecisionAudit | null)?.simulations ?? 0;
      if (!sameAction(searched, answer)) {
        this.passMemoChecks.wrong.push(
          `turn ${view.state.turn.number} ${view.state.turn.step}: searched ${describeMove(view.state, searched)}`,
        );
      }
      return searched;
    }
    return this.searchWindow(view, early, memoKey);
  }

  /**
   * A priority window's search: `actSearched` once no replay, held pass or
   * memo has answered. `early` is the window's candidates when they were
   * listed for the memo, and `memoKey` what a pass is remembered under.
   */
  private searchWindow(
    view: ControllerView,
    early: ReturnType<EvalBotController["listCandidates"]> | null,
    memoKey: string | null,
  ): Action {
    const inherited = super.propose(view);
    // `super.propose` has already routed anything the engine is waiting on
    // through `answerAwaited`, which calls back into this class's own
    // `declareAttackers`/`declareBlockers`. The rest are searched here.
    if (view.state.awaiting !== null) return this.decide(view, inherited);

    // **A delayed harm paid off at its last window** (`delayed-deadline.ts`):
    // it lands past what the search plays out.
    const deadline = delayedDeadlineToPay(view.state, this.playerId, view.legalActions());
    if (deadline !== null) {
      this.lastDecision = audit("priority", null, "delayed deadline paid");
      return deadline;
    }

    // **Mana a card in hand makes** (`handManaLine`: Simian Spirit Guide, with
    // a free rock cast first). The candidates leave mana abilities out and
    // the payer never reaches into a hand, so no search could find the spell
    // it pays for. The line's steps are played as v1 lays them out, and the
    // spell itself as soon as its mana is there: searched, a pass could win
    // with the card already exiled.
    const goal = this.handManaGoal;
    if (goal !== null && goal.turn === view.state.turn.number) {
      if (inherited.type === "cast-spell" && inherited.card === goal.card) {
        this.handManaGoal = null;
        this.lastDecision = audit("priority", null, "hand mana");
        return inherited;
      }
    } else {
      this.handManaGoal = null;
    }
    const handMana = this.handManaLine(view);
    if (handMana !== null) {
      this.lastDecision = audit("priority", null, "hand mana");
      return handMana;
    }
    // **A dig for the card that wins this turn** (`dig-win.ts`): cast now,
    // whatever the library is down to. The search would cast it as a tutor
    // only where `dig.ts` has a safe name to price it by.
    const forTheWin = this.digForTheWin(view);
    if (forTheWin !== null) {
      this.lastDecision = audit("priority", null, "dig for the win");
      return forTheWin;
    }

    const player = this.playerId;
    const pass: Action = { type: "pass-priority", player };
    this.tapGuard = null;
    this.deadAsItStands = null;
    this.lastUnsafe = [];
    this.lastEnds = new Map();
    this.passOutcome = null;
    this.passEndsOpen = false;
    this.passAloneOutcome = null;
    this.lastRefusedTies = [];
    this.lastHeldForTriggers = [];
    this.lastPayoffAhead = null;
    // A cast payoff in play or about to be (Shiko and Narset's Flurry, a
    // prowess creature, Young Pyromancer): the rollouts play the rest of our
    // turn (`"acting"`), or a cheap first spell is never worth the second
    // spell it sets up — they'd pass our seat and never cast that one. Set
    // before anything is scored: the pass baseline and the land search were
    // scored under the previous decision's policy, and the batches under the
    // bot's own, so with a payoff out a candidate was compared with a pass
    // rolled out differently (a diagnosis, 2026-10-07).
    this.decisionRollout =
      this.rollout !== "acting" && castPayoff(view, this.cards, this.playerId) ? "acting" : this.rollout;

    const listed = early ?? this.listCandidates(view);
    const { candidates, mustKill, heldForCombat } = listed;
    let cantrip = listed.cantrip;

    // **Nothing to choose between, nothing to simulate.** Passing used to be
    // rolled out to the end of the turn *before* the candidates were listed,
    // so a window whose only other options were mana abilities — most of the
    // windows in a game, since every seat gets priority at every step — paid a
    // full rollout to learn nothing. Measured over 40 four-player games: 71k
    // of 91k windows, a third of all the bot's CPU, and in a live room all of
    // it on the server's one thread.
    if (candidates.length === 0) {
      this.lastDecision = audit("priority", null, "no candidates");
      return pass;
    }
    // Whether a cast or activation could leave us dead to the crackback by
    // what it taps or sacrifices (`crackbackGuard`), read once per decision,
    // and only for one with something to choose: it is asked in every
    // player's turn, and most windows there have nothing.
    this.tapGuard = this.crackbackGuard(view.state);
    // Under `rolloutSwingBack`, on our own turn, every move of this search
    // is scored with the swing back at the board it leaves (`swingBack`).
    this.swingTurn =
      this.rolloutSwingBack &&
      this.horizon === "turn" &&
      view.state.turnOrder[view.state.turn.activePlayerIndex] === this.playerId
        ? view.state.turn.number
        : null;
    if (this.swingTurn !== null) {
      // With nobody aimed at us, or no creature among those who are, no
      // swing back has an attack in it: none is played, and the search is
      // the one made without the option.
      this.swingAimed = aimedAtUs(view.state, this.playerId);
      const aimed = this.swingAimed;
      const armed =
        aimed.size > 0 &&
        withComputedCache(() =>
          view.state.zones.shared.battlefield.some((id) => {
            const object = view.state.objects[id];
            return (
              object !== undefined &&
              aimed.has(object.controller) &&
              computeCharacteristics(view.state, this.cards, id).types.includes("creature")
            );
          }),
        );
      if (!armed) this.swingTurn = null;
    }

    // **A land drop is not weighed against passing.** Playing a land costs
    // nothing but the card, doesn't use the turn, and leaves another priority
    // window to spend afterwards, so declining one is never right — and the
    // evaluation gets it wrong far too easily, because `hand` prices a land in
    // hand like any other card (see `normalizeWeights`). v1 has always played
    // a land first; the search must not be a way to lose that.
    //
    // *Which* land is a real decision, though, so several are still searched
    // against each other — just never against doing nothing. A land drop
    // carrying a `face` is excluded: that's an MDFC, where taking the land
    // side means giving up a spell, which is exactly the trade the search is
    // for.
    // A cast payoff goes before the turn's other spells, so it sees them —
    // Shiko from the command zone first, the Bolt after her copied
    // (`payoffFirst`). The search, even rolling our turn out, found "something
    // now, Shiko later" and lost the Flurry.
    //
    // It used to be played here, before any search, and so could not be
    // overruled: Beast Whisperer went first with Opt castable behind it, and
    // Murder's mana went with it under a Shivan Dragon that then killed us
    // (the bot audit's Q7, 2026-11-10). Now it is the first candidate
    // scored (`preferred`, below), which wins every tie.
    const payoff = payoffFirst(view, this.cards, candidates);
    // A cost reducer before what it reduces (Urza's Incubator, then Miirym)
    // is the turn planner's to find: v1's `reducerFirst` is not asked here
    // (the bot audit's Q1, retired 2026-11-10).
    // Nor is `hideawayFirst` (Mosswort Bridge's free card before the spell
    // that would tap the land): the capture it was written for (AN5SU t22)
    // gates, and passes by the plan.
    const lands = candidates.filter((a) => a.type === "play-land" && a.face === undefined);
    const fetches = candidates.filter(
      (a) =>
        a.type === "activate-ability" &&
        (this.isFreeFetch(view.state, a.source, a.abilityIndex) ||
          this.isCreatureFetchDue(view.state, a.source, a.abilityIndex) ||
          this.isManaLandFetchDue(view.state, a.source, a.abilityIndex)),
    );
    // A landfall permanent this window would cast goes before the land drop,
    // so the land triggers it — the same mana either way (`isLandfallPermanent`).
    // And before a fetch, for the land it finds: a fetch costs no mana, so the
    // payoff is as castable after it as before (a live misplay, 2026-10-07:
    // Kresh cracked five fetches, then cast Omnath, Locus of Rage).
    //
    // Not played here either (Q7: Jaddi Offshoot took the Forest Murder
    // needed): with one to cast, the land drop and the fetch wait for the
    // search, which scores it first, the land beside it.
    const landfall =
      lands.length > 0 || fetches.length > 0
        ? candidates.find(
            (a) =>
              a.type === "cast-spell" &&
              a.face === undefined &&
              isLandfallPermanent(this.cards, view.state.objects[a.card]?.cardName ?? ""),
          )
        : undefined;
    // **Nor is cracking a fetch** (`isFreeFetch`): it makes no mana, so
    // holding it gains nothing, and the evaluation scores a land traded for a
    // tapped land as a wash and passed. Which land to find is still searched,
    // as the decision the search raises. After a land drop, which comes first.
    // A creature that fetches by sacrificing itself (Sakura-Tribe Elder) joins
    // them at the end of the turn before ours (`isCreatureFetchDue`): the
    // evaluation kept the 0/2 over the land and never ramped.
    // The land rules, as one answer: asked here unless a landfall permanent
    // waits for the search, and after that search if it passed — a land
    // drop is never weighed against passing, whichever way it got there
    // (seen in `bot:diff`, 2026-11-10: a play held for combat turned the
    // answer to a pass, and two lands stayed in hand beside Hedron Crab).
    const landRule = (): Action | null => {
    const fetch = lands.length === 0 ? fetches[0] : undefined;
    if (fetch !== undefined) {
      this.lastDecision = audit("priority", null, "fetch");
      return fetch;
    }
    // Load-bearing (the bot audit's Q1, tried off 2026-11-10): searched
    // against the turn's spells, a land was played after them or not at
    // all. Scenario: "plays its only land before the turn's spell".
    if (lands.length === 1) {
      this.lastDecision = audit("priority", null, "only land");
      return lands[0];
    }
    if (lands.length > 1) {
      // v1's pick goes first, so it wins every tie: the rollouts pass our own
      // seat for the rest of the turn, so a land that lets us cast a spell now
      // scores no better than one that doesn't, and every basic ties. v1
      // weighs exactly that (`bestLand`). For the same reason a land that
      // casts fewer of our spells this turn isn't searched against one that
      // casts more: a shock land paid for a turn-one Birds of Paradise scored
      // as 2 life for nothing and lost to a Mountain (reported from a live
      // game, 2026-10-07).
      // And a land that casts two of this turn's spells together beats one
      // that casts either alone (`LandReach`; a live misplay, 2026-10-10: a
      // Mountain over the Forest that cast Sakura-Tribe Elder beside Temur
      // Battlecrier).
      //
      // One look and one search per land *name*: two Forests in hand reach the
      // same spells and score the same, and each look is several board clones
      // and a simulation one spell deep, run outside the search budget — with a
      // few basics in hand, most of a land decision's time (~380 ms on the live
      // box, 2026-10-13; `docs/plans/scaling-rooms.md`).
      const nameOf = (land: Action): string =>
        land.type === "play-land" ? (view.state.objects[land.card]?.cardName ?? land.card) : "";
      const reachByName = new Map<string, LandReach>();
      const reach = lands.map((land) => {
        const name = nameOf(land);
        let landReach = reachByName.get(name);
        if (landReach === undefined) {
          landReach = this.castableAfterPlay(view, land);
          reachByName.set(name, landReach);
        }
        return { land, reach: landReach };
      });
      const most = reach.reduce((a, b) => (compareReach(b.reach, a.reach) > 0 ? b : a)).reach;
      const fits = reach.filter((r) => compareReach(r.reach, most) === 0).map((r) => r.land);
      const seen = new Set<string>();
      const order = [
        ...fits.filter((l) => sameLand(l, inherited)),
        ...fits.filter((l) => !sameLand(l, inherited)),
      ].filter((l) => {
        const name = nameOf(l);
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
      // v1's land, first, is the one baseline: the rest are compared with it.
      const landBudget = this.budget(this.maxSimulations, 1);
      let bestLand = order[0];
      let bestLandScore = -Infinity;
      // Lands are compared with each other alone, and with every seat
      // passing the opponents' turns go the same whichever was played: no
      // swing back is added (`swingBack`).
      const swingTurn = this.swingTurn;
      this.swingTurn = null;
      for (const land of order) {
        if (spent(landBudget)) break;
        landBudget.left -= 1;
        const score = this.scoreLandDrop(view, land, landBudget);
        if (score !== null && score > bestLandScore) {
          bestLandScore = score;
          bestLand = land;
        }
      }
      this.swingTurn = swingTurn;
      this.lastDecision = audit("priority", landBudget, "land search");
      return bestLand;
    }
    return null;
    };
    if (landfall === undefined) {
      const land = landRule();
      if (land !== null) return land;
    }

    // Passing is a candidate like any other, rolled out to the same horizon.
    // Scoring against "is this better than the current state" instead would
    // make the bot inactive-by-default and turn the zero point into an extra
    // implicit weight — a land drop sits almost exactly on it.
    const budget = this.budget();
    let best: Action = pass;
    // **No time to score anything** (the bot audit's S1): v1's cast,
    // unscored, or a pass (`unscoredCast`), then what a pass falls to anyway
    // — the land a landfall permanent was waiting on, a due cantrip.
    const unsearched = (): Action => {
      const cast = this.unscoredCast(view, inherited, candidates, mustKill, heldForCombat);
      if (cast === null && landfall !== undefined) {
        const land = landRule();
        if (land !== null) return land;
      }
      this.lastPassFallback = cast === null ? cantrip : null;
      this.lastDecision = audit("priority", budget, cast !== null ? "v1's cast" : "no time");
      this.noteCost(view.state, budget);
      return this.settle(view, cast ?? cantrip ?? pass);
    };
    // A rollout already didn't fit this turn: none is started.
    if (this.tooSlow === view.state.turn.number && budget.until !== Infinity) return unsearched();
    // Passing is always legal at a priority window, so a `null` here means the
    // simulation itself fell over, or the deadline stopped it; treat it as "no
    // baseline" rather than letting it veto every alternative.
    budget.left -= 1;
    let bestScore = this.score(view, pass, budget) ?? -Infinity;
    const passScore = bestScore;

    // v1's own pick goes first, because under a wall-clock budget the search
    // may not reach the end of this list — and what it has scored by then is
    // what it plays. Enumeration order is an accident of `legalActions`, so
    // without this an early cutoff would leave the bot choosing between
    // passing and whichever card happened to be enumerated first. Scoring v1's
    // choice first makes the floor "v1's move, or passing, whichever actually
    // measured better" — once it *has* been scored. When the clock stops the
    // search before that (the pass baseline alone took the budget, or was
    // stopped in flight), nothing was measured, and `unsearched` answers.
    const inheritedFirst = candidates.findIndex((a) => sameAction(a, inherited));
    if (inheritedFirst > 0) {
      const [preferred] = candidates.splice(inheritedFirst, 1);
      candidates.unshift(preferred);
    }
    // Ahead of that, the payoff or the landfall permanent to cast before
    // the turn's other plays (above): scored first, it wins every tie.
    const first = payoff ?? landfall;
    const firstAt = first === undefined || first === null ? -1 : candidates.indexOf(first);
    if (firstAt > 0) candidates.unshift(...candidates.splice(firstAt, 1));

    // Under the `"acting"` rollout, passing is scored with the spells our own
    // seat casts later in the turn, so it ties with casting the first of them
    // now; the tie goes to acting — to passing, the bot would put every play
    // off until the last window of its turn. But an action that does nothing
    // ties with passing too, the rollout after the pass doing the same
    // nothing, so each is also scored as if nobody acted after it
    // (`scoreAlone`). A spell mustn't lose half a card on its own: a
    // Magmaquake at X=0 throws one away (2.05 under, capture KEYZZ t6), where
    // Opt before Shiko's copied Bolt is a card for a card (0.05 under, which
    // card it draws) and the chain shows only in the rollouts. An activation must be better on its own, as nothing
    // limits a free one: Lightning Greaves' equip {0} moved from creature to
    // creature for ever (capture WAMFR t54). Against each other, candidates
    // still need to be strictly better.
    // A deep horizon's rollouts play our seat through the opponents' turns
    // (`DeepRolloutController`), so an instant passed on now is cast there
    // and ties with casting it now: the same tie, the same break.
    const tiesAct = this.decisionRollout === "acting" || isDeepHorizon(this.horizon);
    this.lastTiesAct = tiesAct;
    let passAlone: number | null | undefined;
    // Each move's own score, for the turn plan's first moves (`planLines`).
    const scored = new Map<Action, number>();
    for (const action of candidates) {
      if (spent(budget)) break;
      budget.left -= 1;
      const victim = mustKill.get(action);
      const score = this.score(view, action, budget, victim);
      if (score === null) continue;
      // A counterspell that only beats passing for what casting it triggers
      // (`castForItsTriggers`): held, as the trigger is there for a later cast.
      if (this.castForItsTriggers(view, action, budget, passScore)) {
        this.lastHeldForTriggers.push(action);
        continue;
      }
      scored.set(action, score);
      const tiesPass = best.type === "pass-priority" && Math.abs(score - bestScore) <= TIE;
      if (tiesPass) {
        if (!tiesAct) continue;
        passAlone ??= this.scoreAlone(view, pass, budget);
        const alone = this.scoreAlone(view, action, budget);
        if (alone === null || passAlone === null) continue;
        if (action.type === "cast-spell" ? alone < passAlone - this.weights.hand / 2 : alone <= passAlone + TIE) {
          this.lastRefusedTies.push(action);
          continue;
        }
      } else if (!(score > bestScore)) continue;
      bestScore = score;
      best = action;
    }
    if (scored.size === 0 && outOfTime(budget)) return unsearched();

    // **Batches.** An ability that can be activated again at once — a pump,
    // firebreathing, "{R}: Dragons you control get +1/+0" — is also tried as
    // many times in a row as the mana allows, as one candidate: twelve mana
    // for +6/+0 is weighed as a whole, where one activation at a time asks
    // twelve times whether two mana for +1/+0 is worth a search (Lathliss on a
    // pile of Treasures: a dozen activations, each a full search, one game
    // past a bench's time limit). Scored after every single move, so under a
    // clock they're the first thing dropped.
    // One batch per ability, from its best-ranked candidate — two for a
    // targeted one: every activation at the same target (a ping at a
    // two-toughness creature, a pump on one attacker) and each at a new one
    // (Scavenging Ooze eating a graveyard), for the simulation to choose
    // between.
    let batch: { readonly times: number; readonly spread: boolean } | null = null;
    // Not an ability that makes something a copy (`replacesItself`): the
    // last copy to resolve is the only one that stands. And each activation
    // past the first costs the batch `BATCH_STEP_COST`: the evaluation counts
    // spare Treasures and untapped mana for nothing, so twenty activations
    // scored the same as one and whichever came out ahead by an accident of
    // the rollout was played. Jodah's bot activated Scion of the Ur-Dragon
    // 19 times at once, for 16 Dragons in its graveyard and one copy
    // (reported from a live game, 2026-11-14).
    const batched = new Set<string>();
    for (const action of candidates) {
      if (action.type !== "activate-ability" || mustKill.has(action)) continue;
      const key = `${action.source}:${action.abilityIndex}`;
      if (batched.has(key)) continue;
      batched.add(key);
      if (this.replacesItself(view.state, action)) continue;
      // Not an activation the search just marked unsafe (`lastUnsafe`): what
      // one of them taps into the crackback, several tap further. A batch is
      // scored by the plain evaluation, which has no such term, so Nullmage
      // Shepherd activated twice was taken where each activation alone had
      // been refused (a watched game, 2026-11-15) — as the planner's lines
      // once were.
      if (this.lastUnsafe.includes(action)) continue;
      const targeted = (action.targets ?? []).some((t) => t !== null);
      for (const spread of targeted ? [false, true] : [false]) {
        if (spent(budget)) break;
        budget.left -= 1;
        const result = timed(budget, () =>
          simulateRepeated(
            view.state,
            this.cards,
            action,
            this.horizon,
            this.decisionRollout,
            this.selfInPriorityRollouts(view.state),
            MAX_BATCH,
            (game, previous) =>
              this.nextInBatch(
                game.state,
                // Only this ability's offers: the whole list plans a mana
                // payment for every ability on the board, per activation.
                previous.type === "activate-ability"
                  ? game.legalActivationsOf(this.playerId, previous.source)
                  : [],
                previous,
                spread,
              ),
          ),
        );
        if (result === null || result.times < 2) continue;
        // Not one we don't live through, even where passing reads as lost
        // too: among lines all scored as lost, the order means nothing.
        if (result.state.players[this.playerId]?.hasLost === true) continue;
        // Nor one whose activations together leave us dead to the crackback
        // where one alone didn't: read on the board the batch ends the turn
        // on, only while a tap could matter (`tapGuard`), and not when
        // passing ends the turn just as open (`passEndsOpen`: Lathliss's
        // pump before combat was dropped for the attack the rollout made).
        if (this.tapGuard !== null && !this.passEndsOpen && this.crackbackLethal(result.state, this.tapGuard.grown)) {
          continue;
        }
        const swing = this.swingBack(result.state, budget);
        if (swing === null) continue;
        const score = evaluateState(result.state, this.cards, this.playerId, this.weights) + swing;
        // The cost decides whether the batch is taken, and isn't kept in the
        // score: the turn plan's lines are compared with it after this, and
        // one a step cost had lowered lost to "activate once, then again".
        if (score - BATCH_STEP_COST * (result.times - 1) <= bestScore) continue;
        bestScore = score;
        best = action;
        batch = { times: result.times, spread };
      }
    }
    // **Untap plans** (`untap-plans.ts`): tap a land for mana, untap it with
    // an ability (Kiora's −1), let that resolve, cast what the extra mana
    // pays for — a line one action deep never sees, since the untap alone
    // reads as loyalty spent for nothing. Scored whole, after every single
    // move and batch, so under a clock they're the first thing dropped.
    let plan: { readonly untap: Action; readonly cast: ObjectId } | null = null;
    for (const p of findUntapPlans(view.state, this.cards, player, view.legalActions())) {
      if (spent(budget)) break;
      budget.left -= 1;
      const after = timed(budget, () =>
        simulatePlan(
          view.state,
          this.cards,
          player,
          [p.tap, p.untap],
          (game) => {
            const offer = game.legalActions(player).find((l) => l.kind === "cast-spell" && l.card === p.cast.card);
            return offer === undefined
              ? null
              : (candidateActions(aimOffer(game.state, this.cards, player, offer), player)[0] ?? null);
          },
          this.horizon,
          this.decisionRollout,
          this.selfInPriorityRollouts(view.state),
        ),
      );
      if (after === null) continue;
      const swing = this.swingBack(after, budget);
      if (swing === null) continue;
      const score = evaluateState(after, this.cards, player, this.weights) + swing;
      if (score <= bestScore) continue;
      bestScore = score;
      best = p.tap;
      batch = null;
      plan = { untap: p.untap, cast: p.cast.card };
    }
    // **The turn plan**: a move is also worth what it lets us do next this
    // turn (`planLines`) — the cost reducer before what it reduces, the
    // ramp before what it pays for. Last of all, so under a clock it spends
    // only the time every single move, batch and untap plan has left.
    const followed =
      this.planMode !== null
        ? this.planLines(view, candidates, scored, mustKill, heldForCombat, best, bestScore, budget, payoff)
        : null;
    if (followed !== null) {
      best = followed.action;
      bestScore = followed.score;
      batch = null;
      plan = null;
    }
    // The removal chosen, aimed again among its own targets (`reaimed`): not
    // a batch's or an untap plan's first activation, which stand as scored.
    if (batch === null && plan === null) best = this.reaimed(view.state, best, scored);
    if (plan !== null && best.type === "activate-ability") {
      this.plan = {
        ...plan,
        turn: view.state.turn.number,
        step: view.state.turn.step,
        stage: "untap",
      };
    }
    if (batch !== null && best.type === "activate-ability") {
      const base = view.state.zones.shared.stack.length;
      this.batch = {
        action: best,
        spread: batch.spread,
        remaining: batch.times - 1,
        turn: view.state.turn.number,
        base,
        stack: base + 1,
      };
    }
    // A sacrifice for cards or a suspend scores a wash against passing — see
    // `isSacrificeForCardsDue` and `isSuspendDue`.
    // A held wipe that scored best waits for the second main phase, and
    // nothing else spends its mana now (not even a cantrip). A play that
    // taps a vigilance creature that could attack first (Faeburrow Elder's
    // mana) is the turn planner's: its lines pass to combat and play after
    // (the rule that held it here, `holdsTapForCombat`, was retired
    // 2026-11-10, the bot audit's Q1).
    this.lastHeldForCombat = [...heldForCombat];
    if (heldForCombat.has(best)) this.heldPlay = { turn: view.state.turn.number, action: best };
    if (heldForCombat.has(best)) {
      best = pass;
      cantrip = null;
    }
    // A "dies" payoff before the wipe that feeds it (Colfenor's Urn, then
    // Citywide Bust) is a line the turn planner finds: v1's
    // `payoffBeforeWipe` is not asked here (the bot audit's Q1, retired
    // 2026-11-10).
    if (best.type === "pass-priority" && landfall !== undefined) {
      const land = landRule();
      if (land !== null) return land;
    }
    // A whole search that passed is remembered for the turn (`passMemo`):
    // not one the count or the clock cut, nor a pass that stands for a play
    // held for combat.
    if (memoKey !== null) {
      const whole = !budget.cut && (budget.until === Infinity || budget.now() < budget.until);
      this.passMemo = best.type === "pass-priority" && whole && heldForCombat.size === 0 ? memoKey : null;
    }
    this.lastPassFallback = cantrip;
    if (best.type === "pass-priority" && cantrip !== null) best = cantrip;
    this.lastDecision = audit("priority", budget);
    this.noteCost(view.state, budget);
    return this.settle(view, best);
  }

  /** A priority search's answer on its way out: a pass remembered
   * (`rememberPass`), a play noted for the window after it (`actedOn`). */
  private settle(view: ControllerView, best: Action): Action {
    if (best.type === "pass-priority") this.rememberPass(view);
    else if (this.batch === null && view.state.awaiting === null) {
      this.actedOn = { turn: view.state.turn.number, stack: [...view.state.zones.shared.stack] };
    }
    return best;
  }

  /**
   * What a priority search plays when its clock stopped it with no candidate
   * scored: v1's pick (`inherited`) if that is a cast the search would have
   * weighed — still among `candidates`, so past every hold and filter of
   * `listCandidates`, and not one kept only on a condition a rollout has to
   * show (`mustKill`) or held for after combat. `null` is "pass".
   *
   * It used to pass, whatever v1 wanted: with the clock made to expire during
   * the first rollout, 180 of 180 windows passed where v1 cast in 64 (the bot
   * audit's S1, 2026-11-10). A cast only, never v1's activation: searched in
   * full, v2 passes at 20 of 22 windows where v1 wants to activate and acts
   * at 19 of 24 where it wants to cast.
   *
   * Matched by offer — the card, how it's cast and which face — and not by
   * the whole action: v1 and the search aim the same spell differently, and
   * the search's own filling (its best-ranked, listed first) is the one that
   * passed its filters.
   *
   * **Never a cast that only a rollout could have shown to do something**
   * (a live game, 2026-11-21, on a board too big for one rollout): a spell
   * with targets to choose and none chosen, an X spell at too small an X
   * (`xTooSmall`; the candidates try an X paid in life across its range, the
   * least first, so Fire Covenant went out for X=1 at no target), or one
   * that would run our library out (`runsLibraryOut`: v1 holds it since, and
   * this asks again for the search's own filling).
   */
  private unscoredCast(
    view: ControllerView,
    inherited: Action,
    candidates: readonly Action[],
    mustKill: ReadonlyMap<Action, PlayerId>,
    heldForCombat: ReadonlySet<Action>,
  ): Action | null {
    if (inherited.type !== "cast-spell") return null;
    const sameOffer = (a: Action): boolean =>
      a.type === "cast-spell" &&
      a.card === inherited.card &&
      a.face === inherited.face &&
      JSON.stringify(a.via) === JSON.stringify(inherited.via);
    const offered = candidates.filter((a) => sameOffer(a) && !mustKill.has(a) && !heldForCombat.has(a));
    const cast = offered.find((a) => sameAction(a, inherited)) ?? offered[0] ?? null;
    if (cast === null || cast.type !== "cast-spell") return cast;
    const legal = view.legalActions().find(
      (l) =>
        l.kind === "cast-spell" &&
        l.card === cast.card &&
        l.face === cast.face &&
        JSON.stringify(l.via) === JSON.stringify(cast.via),
    );
    if (legal === undefined || legal.kind !== "cast-spell") return cast;
    const aimed = (cast.targets ?? []).flat().some((target) => target !== null && target !== undefined);
    if (legal.targetOptions.length > 0 && legal.castModal === undefined && !aimed) return null;
    if (this.xTooSmall(view.state, legal, cast) || this.runsLibraryOut(view.state, legal)) return null;
    // A counter at a spell it can't counter (`countersNothing`): the live
    // misplay this check was written for was made here, out of time.
    if (this.countersNothing(view.state, legal, cast)) return null;
    return cast;
  }

  /**
   * Remembers, for the rest of the turn, that one rollout doesn't fit the
   * clock on this board (`tooSlow`): the search's first simulation was
   * stopped by the deadline, or some simulation alone outlasted the whole
   * budget. Every later window this turn would spend its budget the same way
   * to learn nothing — 1-3.6 s each, measured — so it is answered at once
   * (`unsearched`, `decide`). A new turn tries again: the board may have
   * shrunk, or the turn be a cheaper one to play out.
   */
  private noteCost(state: GameState, budget: SearchBudget): void {
    if (budget.until === Infinity) return;
    if (budget.stalled || budget.longest > this.timeBudgetMs) this.tooSlow = state.turn.number;
  }

  /**
   * The moves a priority window searches: every legal action but the ones a
   * hold or a filter says aren't worth a simulation now, each concrete
   * filling of its targets and sacrifices (`aimOffer`, `withSacrificeChoices`).
   * Read on the real board for the window itself, and on a rollout's board
   * after one of them has resolved for the turn plan (`planHooks`).
   */
  private listCandidates(view: ControllerView): {
    readonly candidates: Action[];
    /** Candidates that help an opponent's attacker with something lasting:
     * kept only if the defending player dies (`opponentPump`). */
    readonly mustKill: Map<Action, PlayerId>;
    /** A play due now that the evaluation scores a wash — a sacrifice for
     * cards (`isSacrificeForCardsDue`), a suspend (`isSuspendDue`), a tutor
     * to the top of the library (`isTopTutorDue`) — played if the search
     * would pass. Named for the cantrips it used to hold, which
     * `hand-worth.ts` prices now. */
    readonly cantrip: Action | null;
    /** Wipes held for after combat: chosen, they mean "pass to combat". */
    readonly heldForCombat: Set<Action>;
  } {
    const player = this.playerId;
    const candidates: Action[] = [];
    const mustKill = new Map<Action, PlayerId>();
    let cantrip: Action | null = null;
    const heldForCombat = new Set<Action>();
    // A read-only region: ranking targets folds every option's
    // characteristics, and nothing changes the state until the simulations
    // after, which run outside it.
    withComputedCache(() => {
      for (const legal of view.legalActions()) {
        // Mana abilities are never worth a simulation: casting auto-pays, so
        // tapping for mana on its own gains nothing the evaluation could see,
        // and on a wide board they're nearly every candidate there is — 27 of
        // 30 on one 38-permanent board, which made a single decision a 2s search.
        if (legal.kind === "activate-ability" && this.isManaOnlyAbility(legal)) continue;
        if (legal.kind === "activate-ability" && !this.mayActivate(view.state, legal.source, legal.abilityIndex)) continue;
        // An {X} ability affordable only at X = 0, whose effect is all X
        // (`inertAtZeroX`): Necropolis Fiend's -0/-0.
        if (legal.kind === "activate-ability" && this.inertAtZeroX(legal)) continue;
        // A copy of the next instant or sorcery with none to cast (Adaptive
        // Training Post's counters) is left to the search: spent for nothing
        // it scores no better than passing, which keeps every tie (v1's
        // `holdsForNextSpell` is not asked here; its scenario gates).
        // An until-end-of-turn pump where it can't matter (`wastedNow`): the
        // rollout plays our own seat passively, so mana it would have cast
        // spells with looks free to spend, and v2 pumped away its upkeep.
        if (this.wastedNow(view.state, legal)) continue;
        // A creature that counters a spell as it enters, with no opponent's
        // spell to counter (`holdsForASpell`): the body alone outscores the
        // card in hand, so the search would cast it and waste the counter.
        if (this.holdsForASpell(view.state, legal)) continue;
        // A board wipe that would take our own would-be attackers, before
        // combat (`holdsWipeForCombat`): cast after the attack instead. It
        // stays a candidate, so that if it's the best play the bot passes to
        // combat with its mana intact — left out, something cheaper spent the
        // mana and the wipe was never affordable after combat (the Sultai
        // autopsy: Blood Money in hand 61 turn starts, never cast).
        const heldWipe = this.holdsWipeForCombat(view.state, legal);
        // Mana our own main phase could cast a spell with, spent in our upkeep
        // (`holdsManaForMain`): the rollouts never show that spell.
        if (this.holdsManaForMain(view.state, legal)) continue;
        // A life cost that would be our last life (`lifeCostWouldKill`).
        if (this.lifeCostWouldKill(view.state, legal)) continue;
        // A Clone with nothing worth copying yet (`holdsCloneForMore`), and a
        // tutor to the top of the library before the end of the turn before
        // ours (`holdsTopTutor`): what waiting gains is nothing a rollout shows.
        if (this.holdsCloneForMore(view.state, legal)) continue;
        if (this.holdsTopTutor(view.state, legal)) continue;
        // Mass land destruction with nothing out to win the game it leaves
        // (`holdsLandWipe`): three opponents' lands for ours scores well, and
        // who is ahead once nobody can cast anything no rollout shows.
        if (this.holdsLandWipe(view.state, legal)) continue;
        // Teferi's Protection with nothing to save the board from
        // (`holdsOwnPhaseOut`): the rollout shows an attack it turns away,
        // and cast before one is declared that attack only goes elsewhere.
        if (this.holdsOwnPhaseOut(view.state, legal)) continue;
        // A land that taps for mana and fetches (Bountiful Landscape) waits
        // for the end of the turn before ours (`holdsManaLandFetch`).
        if (this.holdsManaLandFetch(view.state, legal)) continue;
        // So does a creature's (Sakura-Tribe Elder), outside a combat or a
        // spell to answer (`holdsCreatureFetch`): sooner only gives up blocks.
        if (this.holdsCreatureFetch(view.state, legal)) continue;
        // And a tutor to the top of the library at the one window it is
        // held for (`isTopTutorDue`): cast, it scores as a card lost, the
        // card it found lying where the evaluation doesn't look.
        const ourTop = view.state.zones.perPlayer[player]?.library[0];
        const due =
          this.isSacrificeForCardsDue(view.state, legal) ||
          this.isSuspendDue(legal) ||
          this.isTopTutorDue(
            view.state,
            legal,
            ourTop !== undefined && this.memory.placed[player]?.has(ourTop) === true ? ourTop : undefined,
          );
        // A divided amount's candidates each carry their shares (`withDivisions`).
        const aimed = withDivisions(view.state, this.cards, legal, candidateActions(aimOffer(view.state, this.cards, player, legal), player));
        for (const action of this.withSacrificeChoices(view.state, legal, aimed)) {
          // A draw aimed at a player is a cantrip aimed at us (Compulsive
          // Research's "target player draws three").
          if (due && cantrip === null && aimedOnlyAt(action, player)) cantrip = action;
          // Beast Within and kin wait for the target's controller's turn
          // (`holdsCompensationFor`), when their token can't attack.
          if (this.holdsCompensationFor(view.state, action)) continue;
          // A reanimation spell at a card not worth it yet (`takesTooLittle`):
          // nothing in a rollout dies and comes back, so the better target
          // it would have had is something only this rule knows of.
          if (this.takesTooLittle(view.state, legal, action)) continue;
          // And removal at a creature not worth the card (`removesTooLittle`),
          // priced as the search ranks targets, so an engine counts.
          // Unless it is a blocker in the way of an attack that ends its
          // controller this turn (`clearsTheWayToKill`): kept only if it does.
          let cleared: PlayerId | null = null;
          if (this.removesTooLittle(view.state, legal, action, rankValue)) {
            cleared = this.clearsTheWayToKill(view.state, action);
            if (cleared === null) continue;
          }
          // An X spell at too small an X (`xTooSmall`).
          if (this.xTooSmall(view.state, legal, action)) continue;
          // A counter at a spell that can't be countered (`countersNothing`).
          if (this.countersNothing(view.state, legal, action)) continue;
          const verdict = this.opponentPump(view.state, legal, action);
          if (verdict === "drop") continue;
          if (verdict !== "ok") mustKill.set(action, verdict.kills);
          // Mana a play held for after combat needs, spent on a combat trick:
          // kept only if it kills the player it's aimed at this combat.
          const spends = this.spendsHeldMana(view.state, action);
          if (spends === "drop") continue;
          if (spends !== "ok" && !mustKill.has(action)) mustKill.set(action, spends.kills);
          if (cleared !== null && !mustKill.has(action)) mustKill.set(action, cleared);
          // Not a wipe that ends the game as it resolves (`winsAsItResolves`):
          // held, it tied with passing to combat and casting it after, and
          // the combat between spent its mana.
          if (heldWipe && !this.winsAsItResolves(view.state, action)) heldForCombat.add(action);
          candidates.push(action);
        }
      }
    });
    return { candidates, mustKill, cantrip, heldForCombat };
  }

  /**
   * The rest of an untap plan the search chose (see `act`): the untap, aimed
   * at the land just tapped for mana; a pass while it resolves; then the
   * cast, aimed on the board as it is. `null`, dropping the plan, once
   * anything else has happened — a decision, another step, the untap or the
   * spell no longer on offer.
   */
  private continuePlan(view: ControllerView): Action | null {
    const plan = this.plan;
    if (plan === null) return null;
    const state = view.state;
    const player = this.playerId;
    if (state.awaiting !== null || state.turn.number !== plan.turn || state.turn.step !== plan.step) {
      this.plan = null;
      return null;
    }
    if (plan.stage === "untap") {
      const untap = plan.untap;
      const offered =
        untap.type === "activate-ability" &&
        view
          .legalActions()
          .some((l) => l.kind === "activate-ability" && l.source === untap.source && l.abilityIndex === untap.abilityIndex);
      if (!offered) {
        this.plan = null;
        return null;
      }
      plan.stage = "resolve";
      return untap;
    }
    // The untap is on the stack: everyone passes until it resolves, the mana
    // staying in the pool (rule 106.4).
    if (state.zones.shared.stack.length > 0) return { type: "pass-priority", player };
    this.plan = null;
    const offer = view.legalActions().find((l) => l.kind === "cast-spell" && l.card === plan.cast);
    if (offer === undefined) return null;
    return candidateActions(aimOffer(state, this.cards, player, offer), player)[0] ?? null;
  }

  /**
   * `action`, recorded as the searched actions are (`actedOn`): a spell of
   * ours one of `act`'s shortcuts casts — a payoff, a reducer, a landfall
   * permanent — is passed on while it resolves (`holdPass`), as a searched
   * cast is. Without it the window after was searched afresh, and an
   * instant there was cast in response to our own Archmage Emeritus or
   * Guttersnipe, missing its trigger (live misplays, 2026-10-06 and -08).
   */
  private acted(view: ControllerView, action: Action): Action {
    if (view.state.awaiting === null) {
      this.actedOn = { turn: view.state.turn.number, stack: [...view.state.zones.shared.stack] };
    }
    return action;
  }

  /**
   * `actions` again, once per sacrifice the search should weigh, when the
   * offer's effect reads what was sacrificed (`{ toughnessOf: "sacrificed" }`
   * and kin: Felothar's draw and discard, Fling's damage). A candidate names
   * one sacrifice, the last eligible (`candidates.ts`), so the search never
   * saw another: Felothar fed Seedborn Muse (draw 4, discard 2) with Tree of
   * Redemption (draw 13) beside it (a live misplay, 2026-10-06). Up to
   * `MAX_SACRIFICE_CHOICES` choices told apart by name and P/T — identical
   * tokens are one — largest power plus toughness first, the default kept;
   * an effect that doesn't read the sacrifice keeps one candidate, paying
   * with the cheapest thing it can (`cheapestPermanents`).
   */
  /**
   * `best`, or the same cast or activation at other targets where its aim
   * is worth more there (`aimPremium`: an opponent's commander, its token
   * makers). Only among the fillings of that one spell or ability that the
   * search scored, each by its own score and its premium: which removal to
   * fire, and whether to, were decided without it.
   */
  private reaimed(state: GameState, best: Action, scored: ReadonlyMap<Action, number>): Action {
    const w = this.weights;
    if (w.opposingCommander === 0 && w.opposingTokenEngines === 0) return best;
    if (best.type !== "cast-spell" && best.type !== "activate-ability") return best;
    const base = scored.get(best);
    if (base === undefined) return best;
    const sourceOf = (a: Action): string | undefined =>
      a.type === "cast-spell" ? state.objects[a.card]?.cardName : a.type === "activate-ability" ? state.objects[a.source]?.cardName : undefined;
    const targetsOf = (a: Action) => (a.type === "cast-spell" || a.type === "activate-ability" ? a.targets : undefined);
    /** The move with its targets and their shares left out: equal for two
     * fillings of one spell or ability. */
    const shape = (a: Action): string => JSON.stringify({ ...a, targets: undefined, division: undefined });
    const mine = shape(best);
    const premium = (a: Action): number => aimPremium(state, this.cards, w, this.playerId, sourceOf(a), targetsOf(a));
    let top = best;
    let topValue = base + premium(best);
    for (const [action, score] of scored) {
      if (action === best || action.type !== best.type || shape(action) !== mine) continue;
      const value = score + premium(action);
      if (value > topValue) [top, topValue] = [action, value];
    }
    return top;
  }

  private withSacrificeChoices(state: GameState, legal: LegalAction, actions: readonly Action[]): Action[] {
    if (legal.kind !== "cast-spell" && legal.kind !== "activate-ability") return [...actions];
    const choices = legal.sacrifice?.choices ?? [];
    if (choices.length < 2) return [...actions];
    if (!JSON.stringify(this.offerEffect(legal) ?? null).includes('"sacrificed"')) {
      // Paid with the cheapest, as v1 pays (`cheapestPermanents`: least
      // valuable first, a tapped land before an untapped one). A candidate
      // named the last eligible, which could be the commander: Viscera Seer's
      // scry 1 paid with Zurgo Stormrender while Twilight Drover and the Seer
      // itself sat beside it (capture AN5SU t13). Cheapest of all is one we
      // control but don't own, going back at the end of the turn anyway:
      // Act of Treason's Craw Wurm, not the Seer.
      const borrowed = choices.find((id) => (state.objects[id]?.owner ?? this.playerId) !== this.playerId);
      // Not the ability's own source or a permanent that watches the
      // sacrifice while something plain is there (`cheapestFodder`); and
      // where that isn't the cheapest of all, the cheapest is a second
      // candidate, for the search to tell apart.
      const source = legal.kind === "activate-ability" ? legal.source : undefined;
      const fodder = borrowed ?? this.cheapestFodder(state, choices, source);
      const cheapest = borrowed ?? this.cheapestPermanents(state, choices, 1)[0];
      return actions.flatMap((action) =>
        (action.type === "cast-spell" || action.type === "activate-ability") && action.sacrifice !== undefined
          ? fodder === cheapest
            ? [{ ...action, sacrifice: fodder }]
            : [{ ...action, sacrifice: fodder }, { ...action, sacrifice: cheapest }]
          : [action],
      );
    }
    const seen = new Set<string>();
    const distinct = withComputedCache(() =>
      choices.map((id) => {
        const c = computeCharacteristics(state, this.cards, id);
        return { id, key: `${state.objects[id]?.cardName}:${c.power}/${c.toughness}`, size: c.power + c.toughness };
      }),
    )
      .filter((choice) => (seen.has(choice.key) ? false : (seen.add(choice.key), true)))
      .sort((a, b) => b.size - a.size)
      .map((choice) => choice.id);
    const out: Action[] = [];
    for (const action of actions) {
      if (action.type !== "cast-spell" && action.type !== "activate-ability") {
        out.push(action);
        continue;
      }
      const picks =
        action.sacrifice === undefined ? distinct : [action.sacrifice, ...distinct.filter((id) => id !== action.sacrifice)];
      for (const sacrifice of picks.slice(0, MAX_SACRIFICE_CHOICES)) out.push({ ...action, sacrifice });
    }
    return out;
  }

  /** After passing with something on the stack, what that stack was — see
   * `holdPass`. */
  private rememberPass(view: ControllerView): void {
    const stack = view.state.zones.shared.stack;
    this.passedOn =
      stack.length > 0 && view.state.awaiting === null
        ? { turn: view.state.turn.number, stack: [...stack] }
        : null;
  }

  /**
   * Pass again, without a search, when all that has happened since this bot
   * last passed is that the stack it passed on has been resolving: the stack
   * now is the bottom of that one, with nothing added. Passing was scored as
   * everyone passing until that stack resolved, so the answer is already
   * made — the same "resolve all" as a batch's own (`continueBatch`), for a
   * bot watching someone else's. Without it, nine stacked pumps meant nine
   * more searches for every seat at the table, several seconds each on a big
   * board. Anything new on the stack — a response, a trigger — or a decision
   * or a new turn is searched as usual.
   */
  private holdPass(view: ControllerView): Action | null {
    const state = view.state;
    const stack = state.zones.shared.stack;
    // Just after a searched action: the stack it was chosen on plus the one
    // spell or ability it put there, ours. The action was scored as that and
    // then everyone passing until it resolved, so this window is already
    // decided — a cast used to cost a second full search here, before its
    // caster passed on its own spell.
    const acted = this.actedOn;
    if (
      acted !== null &&
      state.awaiting === null &&
      state.turn.number === acted.turn &&
      stack.length === acted.stack.length + 1 &&
      acted.stack.every((id, i) => stack[i] === id) &&
      state.objects[stack[stack.length - 1]]?.controller === this.playerId &&
      // Unless it's our own wipe taking a creature of ours: the cast was
      // scored with nothing done in answer to it, and something may save
      // the creature (Yahenni sacrificing into its indestructibility).
      !this.ownWipeOnStack(state)
    ) {
      return { type: "pass-priority", player: this.playerId };
    }
    const held = this.passedOn;
    if (held === null) return null;
    if (
      state.awaiting !== null ||
      state.turn.number !== held.turn ||
      stack.length === 0 ||
      stack.length >= held.stack.length ||
      stack.some((id, i) => held.stack[i] !== id)
    ) {
      return null;
    }
    return { type: "pass-priority", player: this.playerId };
  }

  /**
   * The rest of a batch the search chose (see `act`), without searching
   * again: the next activation, and once they're all on the stack, a pass at
   * every window while they resolve — "resolve all" — since the candidate
   * that won was scored as exactly that, the batch activated and then
   * passed through. Searching those windows again cost a full search each
   * on a big board: nine pumps resolving one at a time were nine more.
   *
   * `null`, dropping the batch, once anything but the batch has happened
   * since: another object on the stack (an opponent's response, a trigger),
   * a decision, a new turn, the ability no longer on offer, or the batch
   * resolved.
   */
  private continueBatch(view: ControllerView): Action | null {
    const batch = this.batch;
    this.batch = null;
    if (batch === null || batch.action.type !== "activate-ability") return null;
    const state = view.state;
    if (state.awaiting !== null || state.turn.number !== batch.turn) return null;
    const action = batch.action;
    const stack = state.zones.shared.stack;
    if (batch.remaining <= 0) {
      // Resolving: pass while everything above where the batch began is
      // still one of its own activations.
      const above = stack.slice(batch.base);
      const onlyOurs =
        above.length > 0 &&
        above.every((id) => {
          const object = state.objects[id];
          return (
            object?.kind === "ability" &&
            object.abilityKind === "activated" &&
            object.controller === this.playerId &&
            object.sourceObjectId === action.source &&
            object.abilityIndex === action.abilityIndex
          );
        });
      if (!onlyOurs || stack.length > batch.stack) return null;
      this.batch = { ...batch, stack: stack.length };
      return { type: "pass-priority", player: this.playerId };
    }
    if (stack.length !== batch.stack) return null;
    const following = this.nextInBatch(state, view.legalActions(), action, batch.spread);
    if (following === null) return null;
    this.batch = {
      ...batch,
      action: following,
      remaining: batch.remaining - 1,
      stack: batch.stack + 1,
    };
    return following;
  }

  /**
   * The next activation of a batch. Unspread, `previous` again while its
   * targets are still legal. Spread, the same ability aimed at the best
   * target that none of the batch's activations already on the stack has
   * taken (the ranking the search uses) — Scavenging Ooze eating one
   * graveyard card after another, each its own full search before; a target
   * stays legal until the activation aimed at it resolves, so repeating the
   * action would only fizzle. `null` once the ability isn't offered, nothing
   * is left to aim at, or the best of it is on the wrong side of the table
   * (the Ooze with only our own graveyard left).
   */
  /**
   * Whether the damage this ability's activations already on the stack deal
   * to `previous`'s one creature target is lethal to it (rule 120.6,
   * `lethalDamageLeft`; any of it from a deathtouch source, 702.2c): each
   * one's share by its `division`, or the ability's printed damage.
   */
  private lethalAlreadyStacked(state: GameState, previous: Extract<Action, { type: "activate-ability" }>): boolean {
    const refs = (previous.targets ?? []).filter((t) => t !== null && t !== undefined);
    if (refs.length !== 1 || refs[0].kind !== "object") return false;
    const target = refs[0].object;
    const creature = state.objects[target];
    if (creature === undefined || creature.zone !== "battlefield") return false;
    const chars = computeCharacteristics(state, this.cards, target);
    if (!chars.types.includes("creature")) return false;
    const source = state.objects[previous.source];
    if (source === undefined || !this.cards.has(rulesTextName(source))) return false;
    const ability = this.cards.get(rulesTextName(source)).activated[previous.abilityIndex];
    if (ability === undefined) return false;
    const effect = ability.effect as { kind?: string; amount?: unknown } | null;
    const printed =
      effect?.kind === "damage" && typeof effect.amount === "number"
        ? effect.amount
        : effect?.kind === "damage-divided" && typeof ability.divided?.total === "number"
          ? ability.divided.total
          : null;
    if (printed === null) return false;
    let pending = 0;
    for (const id of state.zones.shared.stack) {
      const object = state.objects[id];
      if (object?.kind !== "ability" || object.sourceObjectId !== previous.source || object.abilityIndex !== previous.abilityIndex) continue;
      const slot = (object.targets ?? []).findIndex((t) => t?.kind === "object" && t.object === target);
      if (slot < 0) continue;
      pending += object.division?.[slot] ?? printed;
    }
    if (pending === 0) return false;
    const deathtouch = computeCharacteristics(state, this.cards, previous.source).keywords.has("deathtouch");
    return deathtouch || pending >= lethalDamageLeft(chars, creature.damageMarked ?? 0);
  }

  private nextInBatch(
    state: GameState,
    legal: readonly LegalAction[],
    previous: Action,
    spread: boolean,
  ): Action | null {
    if (previous.type !== "activate-ability") return null;
    if (state.awaiting !== null || state.priority.holder !== this.playerId) return null;
    const offer = legal.find(
      (l): l is Extract<LegalAction, { kind: "activate-ability" }> =>
        l.kind === "activate-ability" &&
        l.source === previous.source &&
        l.abilityIndex === previous.abilityIndex,
    );
    if (offer === undefined) return null;
    // Never the activation that pays our last life (`lifeCostWouldKill`): a
    // batch of Necropotence stops while we're still alive.
    if (this.lifeCostWouldKill(state, offer)) return null;
    const targeted = (previous.targets ?? []).some((t) => t !== null);
    if (!spread || !targeted) {
      const stillLegal = (previous.targets ?? []).every(
        (target, i) =>
          target === null ||
          (offer.targetOptions[i] ?? []).some(
            (option) => JSON.stringify(option) === JSON.stringify(target),
          ),
      );
      // A target stays legal until the first activation aimed at it
      // resolves, so "while legal" stacked every activation the mana paid
      // for: five Skarrgan Hellkite pings at a 5/7 Dragonlord Dromoka, the
      // first fizzling under the four that killed it (bot:flags, 2026-11-26).
      // Not once the damage already on the stack at it is lethal.
      if (stillLegal && this.lethalAlreadyStacked(state, previous)) return null;
      return stillLegal ? previous : null;
    }
    // What this ability's activations on the stack are already aimed at.
    const taken = new Set<string>();
    for (const id of state.zones.shared.stack) {
      const object = state.objects[id];
      if (
        object?.kind !== "ability" ||
        object.sourceObjectId !== previous.source ||
        object.abilityIndex !== previous.abilityIndex
      ) {
        continue;
      }
      for (const target of object.targets ?? []) {
        if (target !== undefined) taken.add(JSON.stringify(target));
      }
    }
    const fresh = {
      ...offer,
      targetOptions: offer.targetOptions.map((options) =>
        options.filter((option) => !taken.has(JSON.stringify(option))),
      ),
    };
    if (fresh.targetOptions.some((options, i) => options.length === 0 && offer.targetOptions[i].length > 0)) {
      return null;
    }
    const polarities = offerPolarities(this.cards, offer, polarityBias(state, this.playerId));
    const aimed = withComputedCache(() => aimOffer(state, this.cards, this.playerId, fresh));
    const [following] = candidateActions(aimed, this.playerId);
    if (following === undefined || following.type !== "activate-ability") return null;
    const wrongSide = (following.targets ?? []).some((target, i) => {
      const polarity = polarities?.[i];
      if (target === null || (polarity !== "harm" && polarity !== "help")) return false;
      if (specSide(offer.targetSpecs[i]) !== "any") return false;
      return sideOf(state, target, this.playerId) !== (polarity === "harm" ? "opponent" : "own");
    });
    return wrongSide ? null : following;
  }

  /** A fresh budget for one search, on the clock of the decision it serves
   * (`onClock`), with `baselines` simulations started whatever they cost. */
  private budget(left: number = this.maxSimulations, baselines = 2): SearchBudget {
    return newBudget(
      left,
      this.timeBudgetMs === Infinity ? Infinity : (this.askedAt ?? this.now()) + this.timeBudgetMs,
      baselines,
      this.now,
    );
  }

  /**
   * Answer a pending decision: every candidate answer played out like a
   * priority move, v1's (`inherited`) the one to beat.
   */
  private decide(view: ControllerView, inherited: Action): Action {
    // Tainted Pact's offer where a card wins the turn (`dig-win.ts`): the
    // card taken, or every other turned down until it comes.
    const dug = offeredByDig(view.state, this.cards, this.playerId);
    if (dug !== null) {
      const dig = `${view.state.turn.number}:${dug.source}`;
      const sought = this.digSeeks?.dig === dig ? this.digSeeks.sought : undefined;
      const forTheWin = winningOffer(view.state, this.cards, this.playerId, dug, sought);
      this.digSeeks = { dig, sought: forTheWin.sought };
      if (forTheWin.answer !== null) {
        this.lastDecision = audit("decision", null, "dig for the win");
        return { type: "choose-modes", player: this.playerId, modes: forTheWin.answer === "take" ? [0] : [] };
      }
    }
    // A shock land's 2 life is v1's call (`payLifeForUntapped`): it pays only
    // for a spell the untapped land casts this turn, and the rollouts pass our
    // own seat for the rest of the turn, so they never see that spell and
    // price paying as 2 life for nothing — as with a land drop. Except where
    // the turn can be planned from each answer (`byTheTurnItLeaves`), which
    // does see the spell — unless only mana left to the player finishes it
    // (Gemstone Mine's counters, `paidForByHand`): the plan's moves are the
    // payer's casts, so that spell is in neither plan and paying read as 2
    // life for nothing again.
    const byTurn = this.byTheTurnItLeaves(view);
    if (
      view.state.awaiting?.kind === "pay-life-for-untapped" &&
      (byTurn === undefined || this.paidForByHand === view.state)
    ) {
      this.lastDecision = audit("decision", null, "v1's answer");
      return inherited;
    }
    // Declining an optional mana payment to keep a spell castable this turn
    // (`payingCostsASpell` — Smothering Tithe's {2} at the draw step) is
    // v1's too, for the same reason: the rollouts never cast that spell, so
    // paying looks free and the search took it every time. But v1 declines
    // whenever a spell is lost, whatever declining costs, and what declining
    // costs the rollouts do see: so the search still runs, and v1's answer
    // stands unless paying beats it by `KEPT_PER_MANA` for each mana of the
    // spells it was declined for. Kept outright, it let a 4/4 go to its echo
    // so as to cast a Grizzly Bears.
    //
    // Where the turn's plan can be made from each answer (`byTheTurnItLeaves`:
    // our own turn, an optional payment, before combat), the plan is the
    // price and no margin is needed: the spell declining keeps is in the
    // plan made without the payment, and missing from the one made with it.
    const keptBy =
      byTurn === undefined && view.state.awaiting?.kind === "choose-modes"
        ? KEPT_PER_MANA * this.manaDeclinedFor(view.state)
        : 0;
    this.lastKept = keptBy > 0 ? { action: inherited, by: keptBy } : null;
    this.lastOpenAnswers = [];
    if (view.state.awaiting?.kind === "commander-replacement" && this.horizon === "next-turn") {
      return this.commanderToGraveyard(view, inherited);
    }
    // A rollout already didn't fit this turn (`noteCost`): v1's answer, which
    // is what the search would come back with after spending its budget.
    if (this.tooSlow === view.state.turn.number && this.timeBudgetMs !== Infinity) {
      this.lastDecision ??= audit("decision", null, "v1's answer");
      return inherited;
    }
    // One baseline: v1's answer, which every other is compared with.
    const budget = this.budget(Math.min(DECISION_ROLLOUTS, this.maxSimulations), 1);
    const search = (): Action =>
      bestDecision(
        view,
        inherited,
        this.cards,
        this.weights,
        this.horizon,
        this.rollout,
        budget,
        () => this.selfInRollouts(),
        this.trace,
        keptBy,
        byTurn === undefined ? undefined : (action) => byTurn(action, budget),
        this.lastOpenAnswers,
        () => this.castNowCandidates(view),
      );
    // Which card to discard: every answer keeps as many, so the hand is read
    // for which are worth keeping (`withHandReadForKeeps`) — an engine above
    // a fifth land, where the evaluation at large has them the other way.
    const answer = view.state.awaiting?.kind === "discard" ? withHandReadForKeeps(search) : search();
    // A combat declaration reaches here too, already searched — and recorded —
    // by its own method on the way through `super.act`; `bestDecision` has no
    // candidates for it, so that record is the one worth keeping.
    this.lastDecision ??= audit("decision", budget);
    this.noteCost(view.state, budget);
    return answer;
  }

  /**
   * **Mana priced by the turn it leaves** (`docs/plans/bot-next-steps.md`,
   * step 2). For a choice of modes asked in our own turn, before or in a
   * main phase — an optional payment (Mana Vault's {4} in the upkeep, an
   * echo, "you may pay {2}" as a spell of ours resolves), and since
   * 2026-11-25 any other (Fatespinner's step or phase to skip) — a measure of
   * each answer: the answer resolved, then the best turn the planner finds
   * from the board it leaves (`restOfTurnValue`), or the turn played out
   * where the answer leaves it no main phase. `undefined` where it doesn't
   * apply, and for an answer it can't follow (the rollout scores that one).
   *
   * A rollout passes our own seat, so mana an answer spends is never missed:
   * paying always looked free. v1's look ahead was the stand-in (it declines
   * when a castable spell is lost), with a margin per mana on the search
   * (`KEPT_PER_MANA`). But v1 uses less mana than v2 does, and the margin is
   * a guess at what the spell is worth; the planner is the bot's own account
   * of what it does with the mana.
   */
  /**
   * A "you may cast"'s answers to play out (the decision lists none of its
   * own — `decisions/cast-now.ts`): each card cast as v1 builds the cast,
   * each land played, and declining. Before this v2 took v1's answer, which
   * casts whatever it can: a discovered Deflecting Swat aimed at the discover
   * itself (2026-11-26), a cascaded wipe of its own board.
   */
  private castNowCandidates(view: ControllerView): Action[] {
    const offer = view.legalActions().find((l): l is Extract<LegalAction, { kind: "cast-now" }> => l.kind === "cast-now");
    if (offer === undefined) return [];
    // Only an instant or sorcery is searched. A free permanent is cast, as v1
    // casts it: searched, the first cut declined Titania, Overlord of the
    // Hauntwoods and Topiary Stomper (bot:diff, 2026-11-26) on two shallow
    // playouts each, and a Monstrous Vortex chain of 27 casts took 3 s a cast.
    const permanent = (name: string): boolean =>
      this.cards.has(name) && this.cards.get(name).types.some((t) => t !== "instant" && t !== "sorcery");
    if (offer.casts.length > 0 && offer.casts.every((c) => permanent(c.cardName))) return [];
    return this.castNowAnswers(view, offer).map((cast) => ({ type: "cast-now", player: this.playerId, cast }));
  }

  private byTheTurnItLeaves(
    view: ControllerView,
  ): ((action: Action, budget: SearchBudget) => number | null | undefined) | undefined {
    const state = view.state;
    const me = this.playerId;
    const asked = state.awaiting;
    if (this.planMode === null || this.horizon !== "turn") return undefined;
    // Any choice of modes, not only a payment: the rollout is as blind to
    // what an answer takes from the rest of our turn as to the mana it
    // spends (Fatespinner's "main phase", skipped for nothing, 2026-11-25).
    const modes = asked?.kind === "choose-modes" && asked.guess === undefined;
    if (!modes && asked?.kind !== "pay-life-for-untapped") return undefined;
    if (state.turnOrder[state.turn.activePlayerIndex] !== me || !PLANNABLE_STEPS.has(state.turn.step)) return undefined;
    const unknown = unknownCards(state, this.cards, me, this.memory.placed[me]);
    const hooks = this.planHooks();
    // The hooks read the last priority decision's pass for an interaction's
    // score; these lines are valued plainly.
    this.passOutcome = null;
    return (action, budget) => {
      // Our seat answers what the answer goes on to ask (a search's lands,
      // a target) as v1, not as the passive stand-in, which takes nothing
      // from an "up to two": Springbloom Druid's land sacrificed to find
      // none read as a loss, and was declined (2026-11-25).
      const resolved = timed(budget, () =>
        simulateAction(state, this.cards, action, "stack", "passive", this.selfInRollouts()),
      );
      if (resolved === null) return rolloutAborted() ? null : undefined;
      const limits = {
        ...this.planLimits(),
        clock: { out: () => outOfTime(budget), timed: <T>(simulate: () => T): T => timed(budget, simulate) },
      };
      const value = restOfTurnValue(resolved, this.cards, me, hooks, limits, unknown);
      return value === null ? (rolloutAborted() ? null : undefined) : value;
    };
  }

  /**
   * Rule 903.9a under the `"next-turn"` horizon: leave a commander in the
   * graveyard (or exile) when playing our next turn out shows it back —
   * Zombify, Living Death — by more than `COMMANDER_STAYS_MARGIN`. Not
   * searched otherwise (`decisions/commander-replacement.ts` says why: with
   * no command-zone term, a graveyard card's 0.05 wins every time), and the
   * margin is that trap's guard here: a commander left in the graveyard for
   * nothing scores a hair better, never a whole point.
   */
  private commanderToGraveyard(view: ControllerView, inherited: Action): Action {
    const budget = this.budget(2);
    const me = this.playerId;
    const score = (toCommandZone: boolean): number | null => {
      budget.left -= 1;
      const action: Action = { type: "commander-replacement", player: me, toCommandZone };
      const after = timed(budget, () =>
        simulateAction(view.state, this.cards, action, this.horizon, this.rollout, this.selfInPriorityRollouts(view.state)),
      );
      return after === null ? null : evaluateState(after, this.cards, me, this.weights);
    };
    const commandZone = score(true);
    const stays = score(false);
    this.lastDecision = audit("decision", budget);
    if (stays === null || (commandZone !== null && stays <= commandZone + COMMANDER_STAYS_MARGIN)) {
      return inherited;
    }
    return { type: "commander-replacement", player: me, toCommandZone: false };
  }

  /**
   * Our own seat in a priority rollout: under a deep horizon a
   * {@link DeepRolloutController}, which answers opponents' turns with a
   * small search of its own; otherwise a {@link DecisionRolloutController}
   * when `rolloutDecisions` asks for one, and the policy's stand-in when not
   * — blocking for real (`RealBlocksController`) where an attack on us is
   * still to be blocked this turn.
   */
  private selfInPriorityRollouts(state: GameState): PlayerController | undefined {
    if (isDeepHorizon(this.horizon) && this.rollout === "playing") {
      return new DeepRolloutController(this.playerId, this.cards, this.weights, state.turn.number);
    }
    if (this.rolloutDecisions) return this.selfInRollouts();
    if (this.blocksToCome(state)) return new RealBlocksController(this.playerId, this.cards, this.weights);
    return this.rolloutAttacks !== "v1" && this.attackToCome(state)
      ? new RealAttacksController(
          this.playerId,
          this.cards,
          this.weights,
          this.attackMemo,
          this.rolloutAttacks === "v2-when-v1-holds",
          this.rolloutAttacks === "v2-full",
        )
      : undefined;
  }

  /**
   * **The swing back** (`rolloutSwingBack`). What the opponents' turns do
   * with the board our turn ends on, as a number to add to a move's score:
   * `end` — where a rollout of this search's stopped, the next player's turn
   * beginning — is played on to our next turn, every seat passing at
   * priority and attacking and blocking as v1, and the answer is the
   * evaluation there less the evaluation at `end`. 0 for an `end` that isn't
   * one (the game over, another turn, a decision that isn't our own turn's
   * priority search); `null` when the clock stopped it.
   *
   * **A correction, not another horizon.** As first built (2026-11-27) the
   * rollouts themselves ran to our next turn, and three things went wrong.
   * Everything that reads a rollout's end as the board our turn ends on (the
   * tap guard's `passEndsOpen`, the way out, an interaction's score against
   * the pass) read a board three turns later. Every line paid for its own
   * opponents' turns. And where v1's attacks killed us whatever we did,
   * "a move we don't live through never beats passing" (`score`) dropped
   * every cast and the bot passed: Ureni of the Unwritten and Scion of
   * Calamity each left in hand for a turn, 223 and 685 points played on (the
   * kept seed 4 of Edgar Markov, Giada, Ureni and Pantlaza, turns 27 and 32).
   *
   * **Who attacks whom is the evaluation's own reading** (`swingAimed`), not
   * v1's. v1 sends every attacker at the player lowest on life, ties to the
   * first seat, and taken as fact at a table of four that made a line's
   * worth turn on whom it steered the table at: Explosion went at a
   * player's face so that the rollout's attackers chased the life total, a
   * Vow of Duty went on a creature that had never attacked us, and Swords to
   * Plowshares went at a two-mana commander on turn three for the two damage
   * the seat order sent our way. So: an opponent the evaluation counts in
   * full against us (`threat`: the only one left, or one who attacked us
   * within the last round) attacks us as v1 would with nobody else to
   * attack; every other opponent holds, and what its creatures might do
   * stays the split estimate `threat` makes of it. Both ends are read as of
   * `end` (`readAsOf`), so a simulated attack isn't read back as a record.
   *
   * **One per board.** Nobody casts in a swing back, so what it does depends
   * on the permanents and the life totals alone (`swingBoardKey`), and the
   * lines of one decision mostly end on a few boards: a land, a ramp spell
   * and a card drawn leave the pass's, and a plan's orders of the same casts
   * leave one. Each board is played once (`swingBacks`).
   *
   * **Dead in it is a flat `SWING_DEAD`, and only where passing lives.** A
   * move that dies in the swing back where doing nothing doesn't has walked
   * into it, and loses to every move that lives (flat, since past our own
   * death the evaluation says nothing about the line). **Where passing dies
   * too, no swing back is added this decision** (`score`): every aimed
   * opponent sending all it safely can is the worst case, not a forecast,
   * and the way out of a board that has us dead is `escapes`' to find, by
   * its stricter reading (dead to one opponent alone). Taken as certain, it
   * dropped every cast that died with the pass (above), and then made the
   * one line that lived the answer whatever it cost: Dragonlord Atarka over
   * Ureni of the Unwritten, 108 points played on, in a round where neither
   * opponent attacked at all (the same game's turn 27, judged again).
   */
  private swingBack(end: GameState | null, budget?: SearchBudget): number | null {
    const me = this.playerId;
    if (this.swingTurn === null || end === null || end.result.over) return 0;
    if (end.turn.number !== this.swingTurn + 1 || end.turnOrder[end.turn.activePlayerIndex] === me) return 0;
    if (end.players[me]?.hasLost === true) return 0;
    const key = swingBoardKey(end, this.cards);
    const known = this.swingBacks.get(key);
    if (known !== undefined) return known;
    const aimed = this.swingAimed;
    // Played as far as the last of them has had its turn: the turns after
    // it, of players who hold, are the same on every line.
    const play = (): GameState | null =>
      simulateSwingBack(
        end,
        this.cards,
        me,
        (player) =>
          player === me
            ? new CombatRolloutController(player, this.cards)
            : aimed.has(player)
              ? new AimedSwingController(player, this.cards, me)
              : new DefendingRolloutController(player, this.cards),
        aimed,
      );
    const after = budget === undefined ? play() : timedOn(budget, play);
    // Stopped by the deadline: not scored. Refused by the engine: no swing
    // back to add, as a rollout the engine refuses is no candidate.
    if (after === null && rolloutAborted() && budget !== undefined && budget.until !== Infinity) return null;
    const lost = after !== null && (after.players[me]?.hasLost === true || (after.result.over && after.result.winner !== me));
    // Both boards are read as of `end` (`readAsOf`: its round, its record of
    // who attacks whom): the difference is what the opponents' turns did.
    let change =
      after === null
        ? 0
        : lost
          ? -SWING_DEAD
          : readAsOf(end, () => evaluateState(after, this.cards, me, this.weights)) -
            evaluateState(end, this.cards, me, this.weights);
    // The same swing back from two boards comes to a hair's difference (the
    // evaluation isn't a sum of independent parts), and a hair would decide
    // between moves the turn's own rollouts score exactly alike: an equip
    // moved for nothing no longer tied with passing. Within `SWING_SAME` of
    // one already played this decision, it is that one.
    for (const seen of this.swingBacks.values()) {
      if (Math.abs(seen - change) < SWING_SAME) {
        change = seen;
        break;
      }
    }
    this.swingBacks.set(key, change);
    return change;
  }

  /** Our own turn, before attackers are declared, with a creature of ours
   * able to attack: an attack a rollout would make for us. */
  private attackToCome(state: GameState): boolean {
    if (state.turnOrder[state.turn.activePlayerIndex] !== this.playerId) return false;
    if (!OUR_ATTACK_TO_COME.has(state.turn.step)) return false;
    return combatCreatures(state, this.cards, this.playerId, true, true).length > 0;
  }

  /**
   * Whether this turn may still ask us to block: an opponent's turn, before
   * blocks, under the `"combat"` rollout (the one whose stand-ins fight),
   * with a creature of ours able to block and either attackers already
   * declared at us or a creature of theirs able to attack.
   */
  private blocksToCome(state: GameState): boolean {
    if (this.decisionRollout !== "combat") return false;
    const me = this.playerId;
    const active = state.turnOrder[state.turn.activePlayerIndex];
    if (active === undefined || active === me || !BEFORE_BLOCKS.has(state.turn.step)) return false;
    if (!combatCreatures(state, this.cards, me, true).some((c) => c.canBlock)) return false;
    if (state.turn.step === "declare-attackers") {
      return state.zones.shared.battlefield.some((id) => {
        const target = state.objects[id]?.attacking ?? null;
        return target !== null && (target === me || state.objects[target as ObjectId]?.controller === me);
      });
    }
    return combatCreatures(state, this.cards, active, false).some((c) => c.canAttack);
  }

  private selfInRollouts(): DecisionRolloutController {
    return new DecisionRolloutController(
      this.playerId,
      this.cards,
      this.weights,
      this.horizon,
      this.rollout,
    );
  }

  // --- combat -------------------------------------------------------------

  declareAttackers(view: ControllerView): readonly AttackerDeclaration[] {
    return this.onClock(() => withTrackRecordEvidence(view.state, () => this.declareAttackersSearched(view)));
  }

  /**
   * The attack the search chose, unless the swing back played out says it
   * costs us a turn the arithmetic had written off.
   *
   * The block arithmetic is greedy and knows only creatures, so it can read
   * a board as dead to one opponent's swing (`deadAnyway`, and so "race")
   * that real blocks, or a spell in hand, live through. Where that is so with
   * everything home (`survivesSwing`, the tap guard's own question), the
   * chosen attack is played out the same way, and one that doesn't live is
   * dropped for the least attack the rules allow. Keen Engineering, on 20
   * life in front of Giada's Angels: the arithmetic had it dead, its tap
   * guard's simulation had it alive on 3 with every creature blocking, and
   * the attack declaration, told only "dead anyway", sent two of them at a
   * third player. It died by 8 (the tooling precons, 2026-11-16).
   *
   * Only against an opponent who has us dead alone on paper: dead to the sum
   * of the table is `diesSooner`'s, where the played-out swing (the others
   * at v1's attacks) would call nearly every board safe.
   */
  private declareAttackersSearched(view: ControllerView): readonly AttackerDeclaration[] {
    const state = view.state;
    const me = this.playerId;
    const legal = view.legalActions().find((o): o is DeclareAttackersLegal => o.kind === "declare-attackers");
    if (this.lightAttacks || legal === undefined || legal.eligible.length === 0 || legal.defenders.length === 0) return this.attackersSearched(view);
    this.swings = new WeakMap();
    const declared = (attackers: readonly AttackerDeclaration[]): GameState | null =>
      simulateCombat(state, this.cards, { type: "declare-attackers", player: me, attackers: withRequiredAttackers(attackers, legal) });
    const held = declared([]);
    const livesHeld =
      held !== null &&
      !held.result.over &&
      this.crackbackLethal(held, false) &&
      opponentsLethalAlone(held, this.cards, me).length > 0 &&
      this.survivesSwing(held) === true;
    const chosen = this.attackersSearched(view);
    if (!livesHeld || chosen.length === 0) return chosen;
    const after = declared(chosen);
    // An attack that ends the game, or that the swing back played out from
    // still lives through (an out in hand answers it either way), stands.
    if (after === null || after.result.over || this.survivesSwing(after) === true) return chosen;
    this.lastDecision = audit("attackers", null, "held for the swing");
    return [];
  }

  private attackersSearched(view: ControllerView): readonly AttackerDeclaration[] {
    const offered = view
      .legalActions()
      .find((o): o is DeclareAttackersLegal => o.kind === "declare-attackers");
    // A player with protection from us (rule 702.16k) is no defender to
    // weigh: all of it is prevented, which the block arithmetic doesn't read
    // (`reachableDefenders`). v1's attack, the fallback, leaves them out too.
    const legal = offered === undefined ? undefined : reachableDefenders(view.state, this.playerId, offered);
    const fallback = super.declareAttackers(view);
    if (legal === undefined || legal.eligible.length === 0 || legal.defenders.length === 0) {
      return fallback;
    }
    const state = view.state;
    const me = this.playerId;
    const w = this.weights;
    // One budget for the whole declaration — the alpha check, v1's swing and
    // the climb — so the deadline covers everything the declaration simulates,
    // not just the climb. Only the climb draws on its simulation count, as it
    // always has.
    const budget = this.budget();

    // **Holding back, as far as the rules let us.** Creatures that must attack
    // (goaded, "attacks each combat if able") are in every declaration, so
    // the board to measure the others against is the one their attack leaves,
    // not the one with everything home. Read on the board as it stood, a
    // seat can look safe holding back when the least attack it may make
    // already isn't, and then every declaration scores as unsafe and the
    // safety check sorts nothing. Doom Prevails, on 8 life: its goaded 5/5
    // died attacking, and with it went the flying its tokens blocked with
    // (found watching the tooling precons, 2026-11-16; `onLastPoints` below
    // is the rest of that game).
    const forced = withRequiredAttackers([], legal);
    const held =
      forced.length === 0
        ? state
        : (timed(budget, () => simulateCombat(state, this.cards, { type: "declare-attackers", player: me, attackers: forced })) ??
          state);

    // If the crackback kills us even when we hold everything back, holding
    // back buys nothing: drop the constraint and race. Read on the board as
    // it shows, without `crackbackGrowth`: scaled, a merely threatening board
    // would read as lost and turn the caution into an all-in race.
    const deadAnyway = this.crackbackLethal(held, false);
    // Dead to the table is not dead to each player at it (`diesSooner`): the
    // opponents it lives through with everything home still have their turns
    // to play before the one whose swing kills it. Racing is for when the
    // next swing kills it either way.
    const spared = deadAnyway ? this.outlives(held) : [];
    // The opponents who have it dead alone. With some who don't, there is a
    // swing it lives through and an attack can still cost it that.
    const killers = deadAnyway ? opponentsLethalAlone(held, this.cards, me) : [];
    const toAct = held.turnOrder.filter((p) => p !== me && !held.players[p].hasLost).length;
    const somethingToLose = spared.length > 0 || killers.length < toAct;
    const others = held.turnOrder.filter((p) => p !== me && !held.players[p].hasLost);
    const diesSooner = (after: GameState): boolean =>
      somethingToLose &&
      this.diesSooner(
        after,
        spared,
        killers,
        // An attack that takes a player out is held to the opponents before
        // the killer alone: the table it leaves is another table. Judged
        // (2026-11-16), the kill on a player at 3 life that the wider
        // reading forbade was the better line.
        others.some((p) => after.players[p]?.hasLost === true),
      );
    // `crackbackGrowth` only sorts attacks while holding back passes it. When
    // even no attack reads as unsafe scaled up (but not plainly — that's
    // `deadAnyway`), every candidate would score `UNSAFE`, ranked by board
    // value alone, and the climb could take a swing the plain check calls
    // lethal: measured, 25 such swings in 119 four-player games, 19 of them
    // deaths. Then the plain check sorts them, as it did before the scaling.
    const grown = !this.crackbackLethal(held, true);
    // **Dead by the reserve is not dead.** `deadAnyway` keeps `crackbackMargin`
    // life back, which is right for calling a board safe and wrong for
    // calling it lost: on 8 life with 6.5 coming through, a bot is on its
    // last points, not out. Then holding back still buys a turn, and the one
    // attack to refuse is the one that leaves it dead to the last point. The
    // same game as `held`'s: read as dead anyway, the bot raced, and each
    // race it could pick left it dead outright.
    const onLastPoints = deadAnyway && !this.crackbackLethal(held, false, undefined, 0);
    // **No race for nothing.** Dead to one opponent's whole swing whatever
    // stays home, an attack is free only if that reading is right, and it
    // is the cautious one: every creature they have, all at us. An attack
    // that kills nobody and lets more of that swing through pays for the
    // times they split it. On 47 life in front of 29 Zombies, a seat sent
    // its three creatures at a third player for no kill; the Zombies split
    // between two players, 48 came at it, and two blockers were the game (a
    // kept live game, FU89K-1 turn 33, 2026-11-22).
    const swingOf = (board: GameState, killer: PlayerId): number => {
      const through = swingFrom(board, this.cards, me, killer);
      return through.damage - (through.gained ?? 0);
    };
    const heldSwings = new Map<PlayerId, number>();
    // Only where they have someone else to send it at: in a duel the whole
    // swing comes, and holding back buys nothing.
    const racesForNothing = (after: GameState): boolean =>
      killers.length > 0 &&
      others.length > 1 &&
      !others.some((p) => after.players[p]?.hasLost === true) &&
      killers.some((killer) => {
        let before = heldSwings.get(killer);
        if (before === undefined) {
          before = swingOf(held, killer);
          heldSwings.set(killer, before);
        }
        return swingOf(after, killer) > before;
      });
    const loses = (after: GameState): boolean =>
      (onLastPoints && this.crackbackLethal(after, false, undefined, 0)) || diesSooner(after) || racesForNothing(after);

    const alpha = this.alphaStrike(
      state,
      legal,
      deadAnyway,
      grown,
      budget,
      somethingToLose || onLastPoints ? loses : undefined,
    );
    if (alpha !== null && alpha.all) {
      this.lastDecision = audit("attackers", budget);
      return alpha.declaration;
    }

    // A creature that must attack is in every declaration the engine takes,
    // so a candidate is scored with it (at its first defender, where `ask`
    // puts it) unless the candidate already sends it somewhere.
    // `seatFor` seats the defenders (`simulateCombat`): left out, v1's blocks.
    const score = (
      attackers: readonly AttackerDeclaration[],
      seatFor?: (player: PlayerId) => PlayerController | undefined,
    ): number | null => {
      const after = simulateCombat(
        state,
        this.cards,
        { type: "declare-attackers", player: me, attackers: withRequiredAttackers(attackers, legal) },
        seatFor,
      );
      if (after === null) return null;
      const players = new Set(attackers.map((d) => defendingPlayer(d.defender)));
      const value = evaluateState(after, this.cards, me, w) + SPREAD_BONUS * Math.max(0, players.size - 1);
      if (after.result.over) return value;
      if (deadAnyway) return loses(after) ? UNSAFE + value : value;
      return lessBystanders(after, this.crackbackLethal(after, grown) ? UNSAFE + value : value);
    };

    // What the players left out of the combat gain on us for each creature it
    // costs us: `bystanderShare` of its value, over what the evaluation
    // already counts. A 1-for-1 with the leading opponent otherwise scored
    // +1.5 at four players — the leader is subtracted in full, so their loss
    // paid for ours — and the bots traded into every block (reported from a
    // live game, 2026-10-10: "in a 4 player format you and the opponent you
    // are trading with are just falling behind the other two players"). Only
    // here, not in the evaluation: removal leans on the leader counting in
    // full. Counted as the value of our creatures before less after — not by
    // id, since combat splits the tokens it sends off a stack as new objects
    // (`combatCreatures` lists a stack once per token).
    const share = bystanderShare(state.turnOrder.filter((p) => !state.players[p].hasLost).length);
    // One the end step takes either way (`goneAtEndStep`) is no loss.
    const creaturesWorth = (s: GameState): number =>
      combatCreatures(s, this.cards, me, false).reduce((sum, c) => {
        const object = s.objects[c.id];
        return object !== undefined && goneAtEndStep(s, this.cards, object) ? sum : sum + creatureValue(c, w);
      }, 0);
    const worthBefore = share === 0 ? 0 : creaturesWorth(state);
    const lessBystanders = (after: GameState, value: number): number =>
      share === 0 ? value : value - share * Math.max(0, worthBefore - creaturesWorth(after));

    const mine = new Map(combatCreatures(state, this.cards, me, false).map((c) => [c.id, c]));
    const blockersOf = new Map<PlayerId, CombatCreature[]>();
    const defendingPlayer = (defender: PlayerId | ObjectId): PlayerId =>
      state.players[defender as PlayerId] !== undefined
        ? (defender as PlayerId)
        : state.objects[defender as ObjectId].controller;
    const blockersFor = (player: PlayerId): CombatCreature[] => {
      let list = blockersOf.get(player);
      if (list === undefined) {
        list = combatCreatures(state, this.cards, player, true);
        blockersOf.set(player, list);
      }
      return list;
    };

    // Cheap arithmetic to decide which moves are worth a simulation: the
    // damage it would deal, less the attacker if something there can block
    // and kill it. Damage to a player is priced at their life, with the
    // evaluation's bend below `LIFE_DANGER_AT`; to a planeswalker, flat.
    const estimate = (d: AttackerDeclaration): number => {
      const attacker = mine.get(d.attacker);
      if (attacker === undefined) return -Infinity;
      const blockers = blockersFor(defendingPlayer(d.defender)).filter((b) => canBlock(b, attacker));
      const dies = blockers.some(
        (b) => b.damage >= attacker.lethal || b.keywords.has("deathtouch"),
      );
      const player = state.players[d.defender as PlayerId];
      const unblocked =
        blockers.length > 0
          ? 0
          : player !== undefined
            ? lifeCost(player.life, attacker.damage, w)
            : attacker.damage * w.life;
      return unblocked + attacker.damage - (dies ? creatureValue(attacker, w) : 0);
    };

    // v1's swing is scored first, for the reason v1's move is at a priority
    // window: under a deadline, what has been scored is what can be played,
    // and it is the one alternative worth having in hand. It is compared with
    // the climb's result at the end, which catches attacks that only work
    // together; it costs nothing from the climb's simulation count.
    const fallbackScore = fallback.length > 0 ? timed(budget, () => score(fallback)) : null;

    // A token stack is sent in parts: one token more, the fewest that finish
    // off a planeswalker, or all it has left. Sent whole, thirteen stacked
    // 1/1s went at a five-loyalty planeswalker, eight more than it took, with
    // none kept home (reported from a live game, 2026-10-05).
    const stackSize = (id: ObjectId): number => state.objects[id]?.stackCount ?? 1;
    const sentOf = (current: readonly AttackerDeclaration[], id: ObjectId): number =>
      current.filter((d) => d.attacker === id).reduce((n, d) => n + (d.count ?? stackSize(id)), 0);
    const withMore = (
      current: readonly AttackerDeclaration[],
      attacker: ObjectId,
      defender: PlayerId | ObjectId,
      more: number,
    ): AttackerDeclaration[] => {
      const size = stackSize(attacker);
      const existing = current.find((d) => d.attacker === attacker && d.defender === defender);
      const count = (existing === undefined ? 0 : (existing.count ?? size)) + more;
      return [
        ...current.filter((d) => d !== existing),
        count >= size ? { attacker, defender } : { attacker, defender, count },
      ];
    };
    // Tokens of `attacker` it takes to finish off planeswalker `defender`,
    // counting the damage already sent at it; Infinity at a player.
    const toFinish = (current: readonly AttackerDeclaration[], attacker: ObjectId, defender: PlayerId | ObjectId): number => {
      if (state.players[defender as PlayerId] !== undefined) return Infinity;
      const loyalty = state.objects[defender as ObjectId]?.counters.loyalty ?? 0;
      const sent = current
        .filter((d) => d.defender === defender)
        .reduce((n, d) => n + (mine.get(d.attacker)?.damage ?? 0) * (d.count ?? stackSize(d.attacker)), 0);
      return Math.max(1, Math.ceil((loyalty - sent) / (mine.get(attacker)?.damage ?? 1)));
    };

    // An attacker already sent, sent at another opponent instead: the climb
    // only ever added attackers, so once every one was aimed at one player a
    // spread between two could never be reached.
    const reaims = (current: readonly AttackerDeclaration[]) =>
      current.flatMap((d) =>
        (legal.defendersFor[d.attacker] ?? [])
          .filter((other) => defendingPlayer(other) !== defendingPlayer(d.defender))
          .map((other) => ({
            next: current.map((x) => (x === d ? { ...d, defender: other } : x)),
            estimate: estimate({ attacker: d.attacker, defender: other }),
          })),
      );

    // One more attacker, or part of a stack, at each defender it may attack.
    const additions = (current: readonly AttackerDeclaration[]) =>
      legal.eligible
        .filter((id) => (mine.get(id)?.damage ?? 0) > 0)
        .flatMap((attacker) => {
          const left = stackSize(attacker) - sentOf(current, attacker);
          if (left <= 0) return [];
          return (legal.defendersFor[attacker] ?? []).flatMap((defender) => {
            const each = estimate({ attacker, defender });
            const finish = toFinish(current, attacker, defender);
            // Smallest first: `hillClimb` keeps the first of equal scores,
            // and a token that adds nothing is better kept home.
            const parts = new Set([1, ...(finish < left ? [finish] : []), left]);
            return [...parts].map((more) => ({
              next: withMore(current, attacker, defender, more),
              estimate: each * Math.min(more, finish),
            }));
          });
        });
    // **A kill, and what's left.** A kill is the attackers it needs and a
    // margin where the player could answer it (`alphaStrike`), and each
    // attacker left over is added only where the simulated result is better for it, the
    // crackback check in every score: at another player it can hurt, or not
    // at all. They were all piled onto the player being killed. Under Smoke,
    // a Zombie deck sent two more creatures at a player with no creature and
    // no untapped land, whom a borrowed Slicer killed alone, and with one
    // untap a turn had nothing home for the same Slicer two turns running (a
    // kept live game, D75RS-3 turn 21, 2026-11-22).
    if (alpha !== null) {
      const [withTheRest] = hillClimb<AttackerDeclaration>(alpha.declaration, additions, score, budget);
      this.lastDecision = audit("attackers", budget);
      return withTheRest;
    }
    // Built one attacker (or part of a stack) at a time, keeping each only if
    // it improves the simulated result, or re-aimed.
    const [built, builtScore] = hillClimb<AttackerDeclaration>(
      [],
      (current) => [...reaims(current), ...additions(current)],
      score,
      budget,
    );
    // **The wide attack.** The climb above adds one attacker at a time, and
    // an attacker that is good only in company never gets in: one 3/3 sent
    // at four untapped blockers is blocked and killed, ten of them have six
    // go through. Token Triumph's bot, with seven 3/3 lifelink Soldiers, a
    // 4/4 commander and two more creatures against four untapped blockers
    // and an opponent on 30, attacked with the commander alone, turn after
    // turn (watched in a bot game, 2026-11-14; rebuilt, that attack ends the
    // turn at 63.5 by this evaluation and everything attacking at 98.2, the
    // opponent on 7). So everything is tried too, each attacker at the
    // defender its estimate likes best, and climbed down from: the attackers
    // that do worst are dropped one at a time while that scores better. The
    // crackback check is in every score, as it is in the climb's.
    //
    // It is taken only if it still beats the built attack against the
    // defenders' own block search (`REAL_BLOCK_SIMULATIONS` each): every
    // score here is against v1's blocks, and the more creatures an attack
    // sends, the more that prediction can be wrong about. World Shaper's bot
    // sent Braids and an Insect token in beside Multani, which v1's blocks
    // let through; v2 double-blocked Braids and ate the token, and the round
    // ended 26 points worse than Multani alone (a judged two-player game,
    // 2026-11-15).
    const wide: AttackerDeclaration[] = legal.eligible
      .filter((id) => (mine.get(id)?.damage ?? 0) > 0)
      .flatMap((attacker) => {
        const defenders = legal.defendersFor[attacker] ?? [];
        if (defenders.length === 0) return [];
        const defender = defenders.reduce((best, d) =>
          estimate({ attacker, defender: d }) > estimate({ attacker, defender: best }) ? d : best,
        );
        return [{ attacker, defender }];
      });
    // An attack scored against the defenders' own block search, once each.
    // Their blocks only (`RealBlocksController`): a whole v2 seated there
    // also casts and activates in the combat it is given, which an attack
    // then pays for and no attack doesn't. And our own seat deciding what
    // the attack asks of it (`selfInRollouts`: an exert, a trigger's target),
    // as it will: with v1 answering those, Glorybringer's exert went
    // elsewhere, a 2/5 flyer blocked it for nothing, and the attack was
    // called off that the real table let through for 4 (a judged game,
    // 2026-11-15: three attacks worse of eleven changed, one of ten with
    // this).
    const defenders = (player: PlayerId): PlayerController | undefined =>
      player === me ? this.selfInRollouts() : new RealBlocksController(player, this.cards, w);
    const realScores = new Map<readonly AttackerDeclaration[], number | null>();
    const real = (attackers: readonly AttackerDeclaration[]): number | null => {
      let value = realScores.get(attackers);
      if (value === undefined) {
        budget.left -= 1;
        value = timed(budget, () => score(attackers, defenders));
        realScores.set(attackers, value);
      }
      return value;
    };
    let [chosen, chosenScore] = [built, builtScore];
    if (wide.length > built.length + 1 && !spent(budget)) {
      const [swing, swingScore] = hillClimb<AttackerDeclaration>(
        wide,
        (current) => current.map((d) => ({ next: current.filter((x) => x !== d), estimate: -estimate(d) })),
        score,
        budget,
      );
      if (swingScore > chosenScore) {
        const realSwing = real(swing);
        const realBuilt = realSwing === null ? null : real(built);
        if (realSwing !== null && realBuilt !== null && realSwing > realBuilt) [chosen, chosenScore] = [swing, swingScore];
      }
    }
    // The deadline stopped the declaration's first simulation in flight, so
    // nothing was scored and the climb never left its start: v1's swing, as
    // every other search falls to v1's answer — not no attack at all, which
    // is what an unscored climb returns.
    if (budget.stalled) {
      this.lastDecision = audit("attackers", budget);
      return fallback;
    }
    let [picked, pickedScore] =
      fallbackScore !== null && fallbackScore > chosenScore ? [fallback, fallbackScore] : [chosen, chosenScore];
    // **Checked against the real blocks.** Every score above is against v1's
    // blocks, which are a narrow policy (a kill it survives, a trade up, a
    // gang block that pays, chumps to stay alive); v2's own defenders block
    // differently, and an attacker sent into a block v1 never makes is a
    // creature thrown away (Mentor of the Meek beside Emmara, double-blocked:
    // a watched game, 2026-11-14). So the attack picked is scored once more
    // with each defender seated as its own block search. If that holds up to
    // what was predicted, it is declared. If it doesn't, the same attack with
    // each attacker left out, and no attack, are scored the same way, and the
    // best of them is declared. Only where a defender has something to block
    // with; `docs/plans/bot-next-steps.md`, step 1a.
    const blockable = picked.some((d) => blockersFor(defendingPlayer(d.defender)).length > 0);
    if (!this.lightAttacks && picked.length > 0 && blockable && Number.isFinite(pickedScore)) {
      const realPicked = real(picked);
      if (realPicked !== null && realPicked < pickedScore - REAL_BLOCK_SLACK) {
        let bestReal = realPicked;
        const without = [...picked]
          .sort((x, y) => estimate(x) - estimate(y))
          .slice(0, REAL_BLOCK_VARIANTS)
          .map((d) => picked.filter((x) => x !== d));
        for (const variant of [[], ...without]) {
          const value = real(variant);
          if (value !== null && value > bestReal) [picked, bestReal] = [variant, value];
        }
      }
    }
    this.lastDecision = audit("attackers", budget);
    return picked;
  }

  declareBlockers(view: ControllerView): readonly BlockerDeclaration[] {
    return this.onClock(() => withTrackRecordEvidence(view.state, () => this.declareBlockersSearched(view)));
  }

  private declareBlockersSearched(view: ControllerView): readonly BlockerDeclaration[] {
    const legal = view
      .legalActions()
      .find((o): o is DeclareBlockersLegal => o.kind === "declare-blockers");
    const fallback = super.declareBlockers(view);
    if (legal === undefined || legal.eligible.length === 0) return fallback;
    const state = view.state;
    const me = this.playerId;
    const w = this.weights;

    // To the end of combat — or, under a deep horizon, on to it: a trade
    // that looks even when the combat ends can cost the attack that wins
    // next turn.
    // The declarations scored that left us out of the game (`wideBlock`).
    const diedWith = new WeakSet<readonly BlockerDeclaration[]>();
    const score = (blocks: readonly BlockerDeclaration[]): number | null => {
      const action: Action = { type: "declare-blockers", player: me, blocks };
      const after = isDeepHorizon(this.horizon)
        ? simulateAction(state, this.cards, action, this.horizon, this.rollout, this.selfInPriorityRollouts(view.state))
        : simulateCombat(state, this.cards, action);
      if (after === null) return null;
      if (after.players[me]?.hasLost === true) diedWith.add(blocks);
      return evaluateState(after, this.cards, me, w);
    };

    const creatures = new Map<ObjectId, CombatCreature>();
    for (const player of state.turnOrder) {
      for (const c of combatCreatures(state, this.cards, player, false)) creatures.set(c.id, c);
    }
    const kills = (x: CombatCreature, y: CombatCreature): boolean =>
      x.damage >= y.lethal || x.keywords.has("deathtouch");

    // Everything attacking us or our planeswalkers, as if unblocked — what a
    // block's stopped damage comes off the end of.
    const hitsUs = (id: ObjectId): boolean => {
      const target = state.objects[id]?.attacking ?? null;
      if (target === null) return false;
      return target === me || state.objects[target as ObjectId]?.controller === me;
    };
    let incoming = 0;
    for (const c of creatures.values()) {
      if (hitsUs(c.id)) incoming += c.damage * (c.keywords.has("double-strike") ? 2 : 1);
    }
    const life = state.players[me].life;

    // Cheap arithmetic to decide which moves are worth a simulation: the damage
    // a block stops, plus the attacker if the blockers kill it, less each
    // blocker the attacker kills. Stopped damage is priced as the last of
    // what's coming in, with the evaluation's bend below `LIFE_DANGER_AT`, so
    // at 8 life a block that keeps us out of single digits ranks high.
    const estimate = (move: readonly BlockerDeclaration[]): number => {
      const attacker = creatures.get(move[0].attacker);
      const blockers = move.map((b) => creatures.get(b.blocker));
      if (attacker === undefined || blockers.some((b) => b === undefined)) return -Infinity;
      const damage = attacker.damage * (attacker.keywords.has("double-strike") ? 2 : 1);
      // A trampler is held back only by what's lethal to the blockers.
      const holds = blockers.reduce((sum, b) => sum + (b?.lethal ?? 0), 0);
      const stopped = attacker.keywords.has("trample") ? Math.min(damage, holds) : damage;
      const power = blockers.reduce((sum, b) => sum + (b?.damage ?? 0), 0);
      let value =
        lifeCost(life, incoming, w) - lifeCost(life, Math.max(0, incoming - stopped), w);
      if (power >= attacker.lethal || blockers.some((b) => b?.keywords.has("deathtouch"))) {
        value += creatureValue(attacker, w);
      }
      // The attacker's damage kills what it can of the blockers, the most
      // valuable first, as its controller would assign it — a 4/4 double
      // blocked by two 3/3s kills one of them, not both.
      let left = damage;
      const deathtouch = attacker.keywords.has("deathtouch");
      const byValue = blockers
        .filter((b): b is CombatCreature => b !== undefined)
        .sort((x, y) => creatureValue(y, w) - creatureValue(x, w));
      for (const b of byValue) {
        const needs = deathtouch ? 1 : b.lethal;
        if (left < needs) continue;
        left -= needs;
        value -= creatureValue(b, w);
      }
      return value;
    };

    // A move adds one blocker — or, against menace, two at once, since one
    // alone is illegal — or takes one block back, so a climb that starts from
    // v1's blocks can undo a chump it didn't need.
    // A compacted token stack is one entry standing for `copies` blockers
    // (rule 509.1a: each token blocks on its own), so it stays free until
    // every token is declared, and each block names one of them. Counted as
    // one blocker, a stack of ten Soldiers blocked one attacker of seventeen.
    const tokensOf = new Map(legal.eligible.map((e) => [e.blocker, e.copies ?? 1]));
    const one = (blocker: ObjectId, attacker: ObjectId): BlockerDeclaration =>
      (tokensOf.get(blocker) ?? 1) > 1 ? { blocker, attacker, count: 1 } : { blocker, attacker };
    const neighbours = (current: readonly BlockerDeclaration[]) => {
      const out: { next: BlockerDeclaration[]; estimate: number }[] = [];
      const declared = new Map<ObjectId, number>();
      for (const b of current) {
        declared.set(b.blocker, (declared.get(b.blocker) ?? 0) + (b.count ?? tokensOf.get(b.blocker) ?? 1));
      }
      const free = legal.eligible.filter((e) => (declared.get(e.blocker) ?? 0) < (e.copies ?? 1));
      // "Can't be blocked by more than one creature": one blocker, never a
      // second (Challenger Troll).
      const single = new Set(legal.singleBlockerAttackers ?? []);
      const blockedNow = new Set(current.map((b) => b.attacker));
      for (const entry of free) {
        for (const attacker of entry.canBlock) {
          if (legal.menaceAttackers.includes(attacker)) continue;
          if (single.has(attacker) && blockedNow.has(attacker)) continue;
          // One token of a stack per move (see v1's `declareBlockers`).
          const move = [one(entry.blocker, attacker)];
          out.push({ next: [...current, ...move], estimate: estimate(move) });
        }
      }
      for (const attacker of legal.menaceAttackers) {
        // A pair is too few for "except by three or more" (Pathrazer).
        if (single.has(attacker) || legal.minBlockers?.[attacker] !== undefined) continue;
        const able = free.filter((e) => e.canBlock.includes(attacker));
        let pairs = 0;
        for (let i = 0; i < able.length && pairs < MAX_MENACE_PAIRS; i += 1) {
          for (let j = i + 1; j < able.length && pairs < MAX_MENACE_PAIRS; j += 1) {
            const move = [one(able[i].blocker, attacker), one(able[j].blocker, attacker)];
            out.push({ next: [...current, ...move], estimate: estimate(move) });
            pairs += 1;
          }
        }
      }
      // Two blockers onto one attacker that neither kills alone: added one at
      // a time, the first is just a creature lost, so the climb never got to
      // the second (two 3/3s let a 4/4 through rather than trade one for it).
      const blocked = new Set(current.map((b) => b.attacker));
      const attackersHere = new Set(free.flatMap((e) => e.canBlock));
      for (const attacker of attackersHere) {
        if (blocked.has(attacker) || legal.menaceAttackers.includes(attacker) || single.has(attacker)) continue;
        const target = creatures.get(attacker);
        if (target === undefined) continue;
        const able = free.filter((e) => {
          const b = creatures.get(e.blocker);
          return e.canBlock.includes(attacker) && b !== undefined && !kills(b, target);
        });
        let pairs = 0;
        for (let i = 0; i < able.length && pairs < MAX_GANG_PAIRS; i += 1) {
          for (let j = i + 1; j < able.length && pairs < MAX_GANG_PAIRS; j += 1) {
            const x = creatures.get(able[i].blocker);
            const y = creatures.get(able[j].blocker);
            if (x === undefined || y === undefined || x.damage + y.damage < target.lethal) continue;
            const move = [one(able[i].blocker, attacker), one(able[j].blocker, attacker)];
            out.push({ next: [...current, ...move], estimate: estimate(move) });
            pairs += 1;
          }
        }
      }
      for (const attacker of new Set(current.map((b) => b.attacker))) {
        const move = current.filter((b) => b.attacker === attacker);
        out.push({
          next: current.filter((b) => b.attacker !== attacker),
          estimate: -estimate(move),
        });
      }
      return out;
    };

    // Starting from v1's blocks matters: v1 already chump-blocks when facing
    // lethal, a position a one-blocker-at-a-time climb from nothing can't get
    // out of when no single chump is enough by itself. They're its one
    // baseline.
    const budget = this.budget(this.maxSimulations, 1);
    const [built, builtScore] = hillClimb(fallback, neighbours, score, budget);
    // The wide block, when the blocks built one at a time still lose the
    // game: every attacker a blocker can take, taken. One block more leaves
    // us just as dead until enough are made, so the climb never gets there —
    // seventeen 2/2s into ten 1/1 lifelink Soldiers at 12 life needs eight
    // of them blocking, each gaining a life, before any of it shows (a
    // watched game, 2026-11-15). The same shape as the wide attack.
    //
    // Tried whenever it is a different declaration, not only a longer one:
    // five blockers each on a 1/1 Warrior they kill, and a 17/17 Yahenni
    // through for the game at 16 life, is as many blocks as the wide one
    // makes, on the wrong attackers. Taking a block off is just as dead and
    // putting it on Yahenni is a second step, so the climb never moved one
    // (found by `bot:losses`, 2026-11-15).
    let best = built;
    if (diedWith.has(built) && !budget.stalled) {
      const wide = this.wideBlock(legal, creatures, w);
      const same =
        wide.length === built.length &&
        wide.every((b) => built.some((x) => x.blocker === b.blocker && x.attacker === b.attacker && x.count === b.count));
      if (wide.length > 0 && !same) {
        // Scored even with the count spent: it is the one start that may live.
        budget.left = Math.max(budget.left, 1);
        const [swung, swungScore] = hillClimb(wide, neighbours, score, budget);
        if (swungScore > builtScore && !diedWith.has(swung)) best = swung;
      }
    }
    this.lastDecision = audit("blockers", budget);
    return best;
  }

  /**
   * Every attacker blocked that can be, the ones dealing the most first, each
   * by the least valuable creature able to block it, one token of a stack at
   * a time. Menace attackers and declarations with rules of their own (a cap
   * on blockers, a tax, blockers that need company, all-or-none) are left to
   * the climb: the engine refuses a declaration that breaks one, and a
   * refused start scores nothing.
   */
  private wideBlock(
    legal: DeclareBlockersLegal,
    creatures: ReadonlyMap<ObjectId, CombatCreature>,
    w: EvalWeights,
  ): BlockerDeclaration[] {
    if (legal.blockMost !== undefined || legal.blockTax !== undefined || legal.blockCompany !== undefined) return [];
    const left = new Map(legal.eligible.map((e) => [e.blocker, e.copies ?? 1]));
    const skipped = new Set<ObjectId>([...legal.menaceAttackers, ...(legal.blockedByAll ?? [])]);
    const worth = (id: ObjectId): number => {
      const c = creatures.get(id);
      return c === undefined ? Infinity : creatureValue(c, w);
    };
    const attackers = [...new Set(legal.eligible.flatMap((e) => e.canBlock))]
      .filter((a) => !skipped.has(a) && (creatures.get(a)?.damage ?? 0) > 0)
      .sort((x, y) => (creatures.get(y)?.damage ?? 0) - (creatures.get(x)?.damage ?? 0));
    const blocks: BlockerDeclaration[] = [];
    for (const attacker of attackers) {
      const able = legal.eligible
        .filter((e) => (left.get(e.blocker) ?? 0) > 0 && e.canBlock.includes(attacker))
        .sort((x, y) => worth(x.blocker) - worth(y.blocker))[0];
      if (able === undefined) continue;
      left.set(able.blocker, (left.get(able.blocker) ?? 0) - 1);
      blocks.push((able.copies ?? 1) > 1 ? { blocker: able.blocker, attacker, count: 1 } : { blocker: able.blocker, attacker });
    }
    return blocks;
  }

  /**
   * Attack for the kill when some opponent is dead through their best
   * blocks — as many opponents as the attackers can kill at once. Each order
   * of the killable opponents is tried (at most six, at four players), each
   * taking the fewest attackers its kill needs from what the ones before it
   * left: sending everything at the first opponent in reach killed one player
   * when the same creatures, split, killed two. Killing one player doesn't
   * end a multiplayer game, so a plan still has to leave us alive to the
   * crackback of whoever survives it; the most kills that does is played,
   * with a margin against a trick at each player being killed who could
   * still answer (`marginFor`: enough more attackers that the kill survives
   * losing its biggest), unless keeping them home is what survives. `all`
   * says whether the plan kills everyone, and then everything goes.
   */
  private alphaStrike(
    state: GameState,
    legal: DeclareAttackersLegal,
    deadAnyway: boolean,
    grown: boolean,
    budget: SearchBudget,
    /** Dead whatever stays home, but not to every opponent, or not to the
     * last point of life: whether the board after an attack is dead to one
     * it lived through before, or dead outright where holding back wasn't
     * (the attack decision's `loses`). Left out, a kill is taken as it comes. */
    diesSooner?: (after: GameState) => boolean,
  ): { readonly declaration: AttackerDeclaration[]; readonly all: boolean } | null {
    const me = this.playerId;
    // Every token of a compacted stack is its own attacker here, cloned so
    // the sets below tell the copies apart (`combatCreatures` lists one
    // object once per token): deduped by id, a stack of ten 1/1s was one
    // 1/1, and the Mardu autopsy saw ten tokens sent at a player on 40 while
    // the one on 8 had nothing to block with.
    const mine = combatCreatures(state, this.cards, me, false)
      .filter((c) => c.damage > 0 && legal.eligible.includes(c.id))
      .map((c) => ({ ...c }));
    const stackSize = (id: ObjectId): number => state.objects[id]?.stackCount ?? 1;
    // Units sent at defenders, as declarations: one entry per stack and
    // defender, with a `count` unless it's every token of the stack.
    const declare = (units: readonly { readonly c: CombatCreature; readonly defender: PlayerId }[]): AttackerDeclaration[] => {
      const groups = new Map<string, { attacker: ObjectId; defender: PlayerId; count: number }>();
      for (const { c, defender } of units) {
        const key = `${c.id}>${defender}`;
        const group = groups.get(key) ?? { attacker: c.id, defender, count: 0 };
        group.count += 1;
        groups.set(key, group);
      }
      return [...groups.values()].map(({ attacker, defender, count }) =>
        count >= stackSize(attacker) ? { attacker, defender } : { attacker, defender, count },
      );
    };
    const living = state.turnOrder.filter((p) => p !== me && !state.players[p].hasLost);
    const blockersOf = new Map(
      living.map((p) => [p, combatCreatures(state, this.cards, p, true)] as const),
    );
    const canAttack = (c: CombatCreature, defender: PlayerId): boolean =>
      (legal.defendersFor[c.id] ?? []).includes(defender);
    // The attackers of `pool` that kill `defender` through their best blocks
    // spending the least damage, so as much as possible is left for the next
    // opponent: 3+3 on one opponent at 5 leaves 2+2 short of the other, where
    // 3+2 and 3+2 kill both. With `exact`, every subset of a small pool is
    // tried; otherwise it takes the biggest first until it's lethal, then
    // drops each one, smallest first, that it stays lethal without. `null`
    // when all of them don't.
    const killWith = (
      defender: PlayerId,
      pool: readonly CombatCreature[],
      exact = false,
    ): CombatCreature[] | null => {
      const blockers = blockersOf.get(defender) ?? [];
      const lethal = (attackers: readonly CombatCreature[]): boolean =>
        isLethal(state, defender, damageThrough(attackers, blockers));
      const able = pool.filter((c) => canAttack(c, defender)).sort((a, b) => b.damage - a.damage);
      if (exact && able.length <= EXACT_KILL_POOL) {
        let best: { readonly set: CombatCreature[]; readonly damage: number } | null = null;
        for (let mask = 1; mask < 1 << able.length; mask += 1) {
          const set = able.filter((_, i) => (mask & (1 << i)) !== 0);
          const damage = set.reduce((sum, c) => sum + c.damage, 0);
          if (
            best !== null &&
            (damage > best.damage || (damage === best.damage && set.length >= best.set.length))
          ) {
            continue;
          }
          if (lethal(set)) best = { set, damage };
        }
        return best?.set ?? null;
      }
      const chosen: CombatCreature[] = [];
      for (const c of able) {
        chosen.push(c);
        if (lethal(chosen)) break;
      }
      if (chosen.length === 0 || !lethal(chosen)) return null;
      for (let i = chosen.length - 1; i >= 0; i -= 1) {
        const without = chosen.filter((_, j) => j !== i);
        if (without.length > 0 && lethal(without)) chosen.splice(i, 1);
      }
      return chosen;
    };

    const killable = living.filter(
      (p) => legal.defenders.includes(p) && killWith(p, mine) !== null,
    );
    // The fewest of `spare`, biggest first, that added to `kill` leave
    // `defender` dead even with the kill's hardest hitter taken out of it;
    // none when no number of them does.
    const marginFor = (
      defender: PlayerId,
      kill: readonly CombatCreature[],
      spare: readonly CombatCreature[],
    ): CombatCreature[] => {
      const blockers = blockersOf.get(defender) ?? [];
      const hits = (c: CombatCreature): number => c.damage * (c.keywords.has("double-strike") ? 2 : 1);
      const survivesATrick = (attackers: readonly CombatCreature[]): boolean => {
        if (attackers.length < 2) return false;
        const biggest = attackers.reduce((a, c) => (hits(c) > hits(a) ? c : a));
        return isLethal(state, defender, damageThrough(attackers.filter((c) => c !== biggest), blockers));
      };
      const added: CombatCreature[] = [];
      for (const c of [...spare].sort((a, c2) => hits(c2) - hits(a))) {
        if (survivesATrick([...kill, ...added])) break;
        added.push(c);
      }
      if (!survivesATrick([...kill, ...added])) return [];
      for (let i = added.length - 1; i >= 0; i -= 1) {
        const without = added.filter((_, j) => j !== i);
        if (survivesATrick([...kill, ...without])) added.splice(i, 1);
      }
      return added;
    };
    // Whether `p` could still stop a kill the arithmetic calls lethal: a
    // creature of theirs able to block, or mana open with a card in hand to
    // spend it on. With neither (tapped out, or an empty hand, and nothing
    // to block with) there is no trick to keep a margin against.
    const canAnswer = (p: PlayerId): boolean => {
      if ((blockersOf.get(p) ?? []).some((b) => b.canBlock)) return true;
      if ((state.zones.perPlayer[p]?.hand.length ?? 0) === 0) return false;
      return state.zones.shared.battlefield.some((id) => {
        const object = state.objects[id];
        if (object === undefined || object.controller !== p || object.tapped) return false;
        if (computeCharacteristics(state, this.cards, id).types.includes("land")) return true;
        const name = rulesTextName(object);
        return this.cards.has(name) && this.cards.get(name).activated.some((a) => a.effect?.kind === "add-mana");
      });
    };
    if (killable.length === 0) return null;
    // The subset search only matters when more than one kill could fit: the
    // attackers' damage covers the life of every opponent they could kill
    // alone. Short of that, no split kills two, and the greedy pick stands.
    const totalDamage = mine.reduce(
      (sum, c) => sum + c.damage * (c.keywords.has("double-strike") ? 2 : 1),
      0,
    );
    const killableLife = killable.reduce((sum, p) => sum + state.players[p].life, 0);
    const exact = killable.length > 1 && totalDamage >= killableLife;

    interface Plan {
      readonly kills: number;
      readonly used: number;
      readonly declaration: AttackerDeclaration[];
      /** The players it kills, sorted: two plans with the same `who` differ
       * only in what is piled on. */
      readonly who: string;
    }
    const plans: Plan[] = [];
    const seen = new Set<string>();
    const add = (declaration: AttackerDeclaration[], killed: readonly PlayerId[], used: number): void => {
      const key = declaration
        .map((d) => `${d.attacker}>${d.defender}x${d.count ?? "all"}`)
        .sort()
        .join(",");
      if (seen.has(key)) return;
      seen.add(key);
      plans.push({ kills: killed.length, used, declaration, who: [...killed].sort().join(",") });
    };
    for (const order of permutations(killable)) {
      let pool = [...mine];
      const killed: PlayerId[] = [];
      const units: { c: CombatCreature; defender: PlayerId }[] = [];
      for (const defender of order) {
        const set = killWith(defender, pool, exact);
        if (set === null) continue;
        killed.push(defender);
        for (const c of set) units.push({ c, defender });
        pool = pool.filter((c) => !set.includes(c));
      }
      // **A margin, not everything.** A plan that ends the game takes every
      // attacker along: nothing is left to keep them home for. Short of
      // that, a player being killed who could still do something about it
      // (`canAnswer`) gets the fewest more attackers that make the kill
      // survive losing its biggest one: a removal spell, a fog on one
      // creature, a blocker the arithmetic missed. Where no number of them
      // does (a kill by one commander's damage), or the player can't answer,
      // the kill is what it needs. The attackers left over are the
      // declaration's to weigh one at a time (`attackersSearched`). Every
      // one of them used to go: 25 Elf tokens beside the one attacker that
      // killed a player on 3 (the user, 2026-11-22: an excess swing, not a
      // ridiculous one).
      const margined = [...units];
      if (killed.length === living.length) {
        for (const c of pool) {
          const target = killed.find((p) => canAttack(c, p));
          if (target !== undefined) margined.push({ c, defender: target });
        }
      } else {
        const spare = new Set(pool);
        for (const defender of killed) {
          if (!canAnswer(defender)) continue;
          const extra = marginFor(
            defender,
            units.filter((u) => u.defender === defender).map((u) => u.c),
            [...spare].filter((c) => canAttack(c, defender)),
          );
          for (const c of extra) {
            spare.delete(c);
            margined.push({ c, defender });
          }
        }
      }
      add(declare(margined), killed, units.length);
      add(declare(units), killed, units.length);
    }
    // Most kills first; among equals, the fewest attackers the kills need,
    // then the piled-on plan before the lean one (the order they were added).
    const ranked = plans
      .map((plan, index) => ({ plan, index }))
      .sort((a, b) => b.plan.kills - a.plan.kills || a.plan.used - b.plan.used || a.index - b.index)
      .map(({ plan }) => plan);

    const played = (plan: Plan): GameState | null =>
      timed(budget, () =>
        simulateCombat(state, this.cards, {
          type: "declare-attackers",
          player: me,
          attackers: withRequiredAttackers(plan.declaration, legal),
        }),
      );
    // Whether a plan may be declared, and the board it leaves if it was
    // played out to find that out.
    const allowed = (plan: Plan): { readonly ok: boolean; readonly after: GameState | null } => {
      if (plan.kills === living.length || (deadAnyway && diesSooner === undefined)) return { ok: true, after: null };
      const after = played(plan);
      // Dead anyway: a kill that doesn't cost it a turn of life it had.
      if (deadAnyway) return { ok: after !== null && diesSooner?.(after) !== true, after };
      return { ok: after !== null && !this.crackbackLethal(after, grown), after };
    };
    for (const [i, plan] of ranked.entries()) {
      const first = allowed(plan);
      if (!first.ok) continue;
      // **Which player the kill takes.** The plans come in turn order, so
      // with one kill to make and two players it could take, the first
      // seated was the one killed: Ghalta, a 24/24 trampler, went at a seat
      // with no board and three lands in hand while the leader (64 life,
      // seven cards, tapped out, its creatures just destroyed) stood as open
      // to the same 24 commander damage, untapped, killed Ghalta and won (a
      // kept live game, 2026-11-22). Among the plans with as many kills that
      // take other players, the board each leaves is scored, and the best
      // of them declared; a plan that kills the same players is this one
      // with attackers piled on, which the order has settled.
      const rivals =
        plan.kills === living.length
          ? []
          : ranked.slice(i + 1).filter((other) => other.kills === plan.kills && other.who !== plan.who);
      if (rivals.length === 0) return { declaration: plan.declaration, all: plan.kills === living.length };
      const worth = (after: GameState | null): number =>
        after === null ? -Infinity : evaluateState(after, this.cards, me, this.weights);
      let best = plan;
      let bestWorth = worth(first.after ?? played(plan));
      const tried = new Set([plan.who]);
      for (const rival of rivals) {
        if (tried.has(rival.who)) continue;
        const verdict = allowed(rival);
        if (!verdict.ok) continue;
        tried.add(rival.who);
        const value = worth(verdict.after ?? played(rival));
        if (value > bestWorth + TIE) {
          best = rival;
          bestWorth = value;
        }
      }
      return { declaration: best.declaration, all: false };
    }
    return null;
  }

  /** The opponents we live through before we untap, in the order they act
   * (`opponentsOutlived`), on the board as it shows: the crackback's weights
   * and margin, without `crackbackGrowth`, as `deadAnyway` is read. */
  private outlives(state: GameState): PlayerId[] {
    return opponentsOutlived(
      state,
      this.cards,
      this.playerId,
      this.weights.crackbackParanoia,
      undefined,
      { weight: this.weights.crackbackKillShot, margin: this.weights.crackbackMargin },
      -this.weights.crackbackMargin,
    );
  }

  /** Would every opponent swinging at us before we untap again be lethal,
   * keeping `crackbackMargin` life in reserve — and, when `grown`, with the
   * damage through scaled up by `crackbackGrowth`? With `lost`, as though
   * those blockers (or all of them) weren't home. `reserve` is the life
   * kept back: 0 asks whether it is dead to the last point. */
  private crackbackLethal(
    state: GameState,
    grown = true,
    lost?: ReadonlySet<ObjectId> | "all",
    reserve: number = this.weights.crackbackMargin,
  ): boolean {
    const through = crackback(state, this.cards, this.playerId, this.weights.crackbackParanoia, lost, {
      weight: this.weights.crackbackKillShot,
      margin: this.weights.crackbackMargin,
    });
    const scale = grown ? 1 + this.weights.crackbackGrowth : 1;
    const scaled =
      scale === 1
        ? through
        : {
            ...through,
            damage: through.damage * scale,
            commanderDamage: new Map([...through.commanderDamage].map(([c, n]) => [c, n * scale] as const)),
            ...(through.poison !== undefined ? { poison: through.poison * scale } : {}),
          };
    return isLethal(state, this.playerId, scaled, -reserve);
  }

  /** `null` when the engine refused this concrete filling of a legal shape. */
  /**
   * Whether `action` may help an opponent's creature, by the rule the user
   * set (2026-09-27): helping an opponent's creature is only worth it while
   * it attacks someone else — never one at home, never one attacking us —
   * and then when the help ends at end of turn, or the creature is goaded by
   * us (it can't turn on us), or, for anything lasting (a +1/+1 counter, an
   * Aura), when it kills the player being attacked. `ok`, `drop`, or the
   * player whose death the candidate is kept for.
   */
  private opponentPump(
    state: GameState,
    legal: LegalAction,
    action: Action,
  ): "ok" | "drop" | { readonly kills: PlayerId } {
    if (legal.kind !== "cast-spell" && legal.kind !== "activate-ability") return "ok";
    if (legal.kind === "cast-spell" && legal.castModal !== undefined) return "ok";
    if (action.type !== "cast-spell" && action.type !== "activate-ability") return "ok";
    const polarities = offerPolarities(this.cards, legal, polarityBias(state, this.playerId));
    if (polarities === null) return "ok";
    const me = this.playerId;
    let kills: PlayerId | null = null;
    for (const [i, target] of (action.targets ?? []).entries()) {
      if (polarities[i] !== "help" || target === null || target.kind !== "object") continue;
      const object = state.objects[target.object];
      if (object === undefined || object.zone !== "battlefield" || object.controller === me) continue;
      if (!computeCharacteristics(state, this.cards, target.object).types.includes("creature")) continue;
      const attacking = object.attacking;
      if (attacking === null) return "drop";
      const defender =
        state.players[attacking as PlayerId] !== undefined
          ? (attacking as PlayerId)
          : state.objects[attacking as ObjectId]?.controller;
      if (defender === undefined || defender === me) return "drop";
      if (goadersOf(state, this.cards, target.object).includes(me)) continue;
      if (onlyUntilEndOfTurn(this.offerEffect(legal))) continue;
      kills = defender;
    }
    return kills === null ? "ok" : { kills };
  }

  /**
   * A land drop's score, and for a fetch this bot cracks at once
   * (`crackedOnPlay`) the land drop *and* the crack, as one plan: the
   * rollouts pass our seat, so scored alone the fetch was never cracked in
   * them — a land making no mana, its search's land never entering, a
   * landfall payoff's second trigger never seen (the user, 2026-10-08:
   * Evolving Wilds lost to a tapped Jungle Hollow's life with Rampaging
   * Baloths out).
   */
  private scoreLandDrop(view: ControllerView, land: Action, budget: SearchBudget): number | null {
    if (land.type !== "play-land") return this.score(view, land, budget);
    const offer = view
      .legalActions()
      .find((l): l is Extract<LegalAction, { kind: "play-land" }> => l.kind === "play-land" && l.card === land.card);
    if (offer === undefined || !this.crackedOnPlay(view, offer)) return this.score(view, land, budget);
    const player = this.playerId;
    const after = timed(budget, () =>
      simulatePlan(
        view.state,
        this.cards,
        player,
        [land],
        (game) => {
          const crack = game
            .legalActions(player)
            .find((l) => l.kind === "activate-ability" && l.source === land.card);
          return crack === undefined
            ? null
            : (candidateActions(aimOffer(game.state, this.cards, player, crack), player)[0] ?? null);
        },
        this.horizon,
        this.decisionRollout,
        this.selfInPriorityRollouts(view.state),
      ),
    );
    if (after === null) return this.score(view, land, budget);
    // Recorded as `score` records a rollout, so `bot:fit-scenarios`'
    // replay scores the land drop by the board the crack reached.
    this.trace?.(land, after);
    return evaluateState(after, this.cards, player, this.weights);
  }

  /**
   * The player a removal spell held for a better target (`removesTooLittle`)
   * may still be cast at: the controller of the creature it is aimed at, on
   * our own turn before the attack, when our creatures ready to attack have
   * the power to end that player. The spell stays a candidate that counts
   * only if they are dead by the end of its rollout (`mustKill`), so a
   * blocker in the way of the kill is still removed and nothing else is.
   */
  private clearsTheWayToKill(state: GameState, action: Action): PlayerId | null {
    if (action.type !== "cast-spell" || activePlayerOf(state) !== this.playerId) return null;
    if (state.turn.step !== "precombat-main" && state.turn.step !== "begin-combat") return null;
    let victim: PlayerId | null = null;
    for (const target of action.targets ?? []) {
      if (target === null || target === undefined || target.kind !== "object") continue;
      const object = state.objects[target.object];
      if (object === undefined || object.zone !== "battlefield" || object.controller === this.playerId) continue;
      victim = object.controller;
      break;
    }
    if (victim === null) return null;
    let power = 0;
    for (const id of state.zones.shared.battlefield) {
      const object = state.objects[id];
      if (object === undefined || object.controller !== this.playerId || object.tapped) continue;
      const c = computeCharacteristics(state, this.cards, id);
      if (!c.types.includes("creature")) continue;
      if (object.summoningSick === true && !c.keywords.has("haste")) continue;
      power += Math.max(0, c.power) * (object.stackCount ?? 1);
    }
    return power >= (state.players[victim]?.life ?? Infinity) ? victim : null;
  }

  /** Where the last move `score` played out ended, or `null` if its rollout
   * fell over: what `castForItsTriggers` reads a kill off. */
  private lastAfter: GameState | null = null;

  /**
   * Whether `action`, a counterspell just scored, beats passing only for
   * what casting it triggers for us: with those triggers taken off the stack
   * (`simulateWithoutOwnTriggers`) the same cast scores no better than the
   * pass. With Y'shtola, Night's Blessed out, Force of Will with a card
   * pitched, Fierce Guardianship and Rewind went at a Cultivate and a
   * Harmonize that the same board without her let by: her trigger's 2 at
   * each opponent outscored the card and the reserve (`answers`). The
   * trigger is no reason to counter this spell, since any later cast brings
   * it too, at a spell worth the card; no rollout shows that later cast (a
   * player's report, 2026-11-25: counters fired "as soon as she draws them").
   *
   * One more rollout, and only for a counterspell (`isAnswer`) cast while a
   * permanent of ours has a "whenever you cast" trigger. Not held when the
   * triggers end an opponent the bare cast leaves alive: that is a reason.
   */
  private castForItsTriggers(view: ControllerView, action: Action, budget: SearchBudget, passScore: number): boolean {
    if (action.type !== "cast-spell" || passScore === -Infinity) return false;
    const state = view.state;
    const card = state.objects[action.card];
    if (card === undefined || !this.cards.has(card.cardName) || !isAnswer(this.cards.get(card.cardName))) return false;
    const me = this.playerId;
    const payoff = state.zones.shared.battlefield.some((id) => {
      const object = state.objects[id];
      return object !== undefined && object.controller === me && isCastPayoff(this.cards, rulesTextName(object));
    });
    if (!payoff) return false;
    const real = this.lastAfter;
    if (spent(budget)) return false;
    budget.left -= 1;
    const bare = timed(budget, () =>
      simulateWithoutOwnTriggers(state, this.cards, action, this.horizon, this.decisionRollout, this.selfInPriorityRollouts(state)),
    );
    if (bare === null) return false;
    const dead = (after: GameState): number =>
      state.turnOrder.filter((p) => p !== me && after.players[p]?.hasLost === true).length;
    if (real !== null && dead(real) > dead(bare)) return false;
    const outcome = this.outcomeAimed(bare, aimedAt(state, this.cards, me, action), this.passOutcome);
    const swing = this.swingBack(bare, budget);
    if (swing === null) return false;
    return scoreOutcome(outcome, this.weights) + swing <= passScore + TIE;
  }

  private score(
    view: ControllerView,
    action: Action,
    budget: SearchBudget,
    /** Kept only if this player has lost by the end of the rollout. */
    mustKill?: PlayerId,
  ): number | null {
    const rollout = (state: GameState): GameState | null =>
      timed(budget, () =>
        simulateAction(state, this.cards, action, this.horizon, this.decisionRollout, this.selfInPriorityRollouts(state)),
      );
    const after = this.revealsOwnLibrary(view.state, action) ? this.typicalDeal(view, action, budget, rollout) : rollout(view.state);
    this.lastAfter = after;
    if (after === null) {
      this.trace?.(action, after);
      return null;
    }
    // A move we don't live through never beats passing. Where the rollout
    // has us dead whatever we do (an opponent's attack next turn), every
    // line scores as lost and their order means nothing: a life payment came
    // out a hair ahead of passing, three times, to 0 life (watched in a bot
    // game, 2026-11-14: Necropotence at 3). The attack is a prediction; the
    // life paid isn't.
    if (action.type !== "pass-priority" && after.players[this.playerId]?.hasLost === true) {
      this.trace?.(action, after);
      return null;
    }
    const outcome = this.outcomeAimed(
      after,
      action.type === "pass-priority" ? null : aimedAt(view.state, this.cards, this.playerId, action),
      this.passOutcome,
    );
    if (action.type === "pass-priority") {
      this.passOutcome = outcome;
      this.passEndsOpen = this.tapGuard !== null && this.crackbackLethal(after, this.tapGuard.grown);
    }
    this.trace?.(action, after, outcome.hit === undefined ? undefined : outcome);
    if (mustKill !== undefined && after.players[mustKill]?.hasLost !== true) return null;
    // The opponents' turns from the board this leaves, under
    // `rolloutSwingBack` (`swingBack`); stopped by the clock, it's unscored.
    let swing = this.swingBack(after, budget);
    if (swing === null) return null;
    // Dead in it even passing (the pass is the first move scored): the swing
    // back decides nothing this decision (`swingBack`).
    if (action.type === "pass-priority" && swing === -SWING_DEAD) {
      this.swingTurn = null;
      swing = 0;
    }
    const value = scoreOutcome(outcome, this.weights) + swing;
    // The plan's own rollout of this move — it resolved, then our seat
    // passing through v1's combat to the end of the turn — and so its
    // one-step line (`lastEnds`). Not a kill that had to land, which no plan
    // starts from.
    if (this.plansAsScored() && mustKill === undefined) this.lastEnds.set(action, { end: after, value });
    if (this.tapsIntoCrackback(view.state, action, budget)) {
      this.lastUnsafe.push(action);
      return UNSAFE + value;
    }
    // **The way out.** Dead as the board stands to one opponent's swing back,
    // whatever stays home, a move whose turn ends with us no longer dead to
    // the crackback comes before every move that leaves us dead: the removal
    // aimed at the creature that kills us, the blocker, the attack tax. The
    // evaluation prices a kill by what the permanent is worth, and at 18
    // commander damage from a Slicer it held, Clan Defiance went at another
    // player's commander, worth more as a card, where Slicer's next 3 were
    // the game (a kept live game, D75RS-9 turn 15, 2026-11-22).
    if (this.escapes(view.state, after)) return ESCAPES + value;
    return value;
  }

  /**
   * Whether `action` reveals cards from the top of our own library until one
   * is found (`reveal-until`, discover), in its effect or, for a spell, in a
   * trigger of the card's (an enters trigger): what it brings is whichever
   * card of the library's order comes first, and that order is the one thing
   * here the seat can't know. Not under `libraryOrder: "real"`, which reads it.
   */
  private revealsOwnLibrary(state: GameState, action: Action): boolean {
    if (this.libraryOrder === "real") return false;
    if (action.type !== "activate-ability" && action.type !== "cast-spell") return false;
    const name = state.objects[action.type === "cast-spell" ? action.card : action.source]?.cardName;
    if (name === undefined || !this.cards.has(name)) return false;
    const def = this.cards.get(name);
    if (action.type === "activate-ability") return revealsOwnLibrary(def.activated?.[action.abilityIndex]?.effect);
    return revealsOwnLibrary(def.effect) || revealsOwnLibrary(def.castModal) || revealsOwnLibrary(def.triggered);
  }

  /**
   * The rollout of `action` over {@link OWN_LIBRARY_DEALS} deals of our own
   * library (`withHiddenCards`' `ownLibraryDeal`: the turn's own deal first,
   * every other zone as it is), and the one that ends at the median score:
   * the reveal as it typically comes out, rather than as the turn's one deal
   * has it. Reported from a live game (2026-11-25): Jace, Multiverse
   * Architect's −3 at a token, from a library of big creatures, read as a
   * disaster whenever the deal put Dack Fayden, Helping Hand first — his
   * enters trigger gives three creatures away — and in three deals of ten on
   * one board it scored 15 under passing, so the bot passed its turn.
   * `null` as the first deal's rollout is (the clock).
   */
  private typicalDeal(
    view: ControllerView,
    action: Action,
    budget: SearchBudget,
    rollout: (state: GameState) => GameState | null,
  ): GameState | null {
    const me = this.playerId;
    const aimed = aimedAt(view.state, this.cards, me, action);
    const ends: { readonly after: GameState; readonly value: number }[] = [];
    for (let deal = 0; deal < OWN_LIBRARY_DEALS; deal += 1) {
      if (deal > 0) {
        if (spent(budget)) break;
        budget.left -= 1;
      }
      const state =
        deal === 0 ? view.state : withHiddenCards(view.state, this.cards, me, { memory: this.memory, ownLibraryDeal: deal });
      const after = rollout(state);
      if (after === null) {
        if (deal === 0) return null;
        break;
      }
      const lost = after.players[me]?.hasLost === true;
      ends.push({ after, value: lost ? -Infinity : scoreOutcome(this.outcomeAimed(after, aimed, this.passOutcome), this.weights) });
    }
    ends.sort((a, b) => a.value - b.value);
    // The lower of two middles, when the clock cut the deals to an even count.
    return ends[Math.floor((ends.length - 1) / 2)]?.after ?? null;
  }

  /** Whether `after`, the board a candidate's turn ends on, is the way out
   * of a board that has us dead (`score`): our own turn, dead as it stands
   * to some opponent alone with everything home, and not dead to the
   * crackback after. */
  private escapes(state: GameState, after: GameState): boolean {
    const me = this.playerId;
    if (state.turnOrder[state.turn.activePlayerIndex] !== me) return false;
    this.deadAsItStands ??=
      this.crackbackLethal(state, false) && opponentsLethalAlone(state, this.cards, me, undefined, -this.weights.crackbackMargin).length > 0;
    if (!this.deadAsItStands) return false;
    return !after.result.over && after.players[me]?.hasLost === false && !this.crackbackLethal(after, false);
  }

  /**
   * A priority candidate scored as if nobody acted after it (the `"passive"`
   * rollout): what it's worth on its own. Under the `"acting"` rollout an
   * action that does nothing ties with passing, the rollout after the pass
   * doing the same nothing; scored alone, passing keeps what the action would
   * have spent (a card, a mana's worth of tapped land), so a pointless action
   * loses and one that does something still wins.
   */
  private scoreAlone(view: ControllerView, action: Action, budget: SearchBudget): number | null {
    budget.left -= 1;
    const after = timed(budget, () =>
      simulateAction(
        view.state,
        this.cards,
        action,
        this.horizon,
        "passive",
        this.rolloutDecisions ? this.selfInRollouts() : undefined,
      ),
    );
    if (after === null) return null;
    const outcome = this.outcomeAimed(
      after,
      action.type === "pass-priority" ? null : aimedAt(view.state, this.cards, this.playerId, action),
      this.passAloneOutcome,
    );
    if (action.type === "pass-priority") this.passAloneOutcome = outcome;
    return scoreOutcome(outcome, this.weights);
  }

  /**
   * How `after` reads for us, marked as an interaction's outcome when what
   * led to it was `aimed` at an opponent (`interaction.ts`): a counterspell,
   * removal or a wipe is scored on the player it hit, against how they stood
   * in `passed`, this decision's pass (the bot audit's Q4; `scoreOutcome`).
   */
  private outcomeAimed(after: GameState, aimed: Aimed, passed: EvalOutcome | null): EvalOutcome {
    const outcome = outcomeOf(after, this.cards, this.playerId, this.weights.landCap);
    return aimed === null || passed === null ? outcome : aimedOutcome(outcome, passed, aimed);
  }

  /** The hooks `turn-plan.ts` plans with: the moves the search would list on
   * a board, and the evaluation. */
  private planHooks(budget?: SearchBudget): TurnPlanHooks {
    // A line's end is scored with the swing back at its board, as a single
    // move's is (`swingBack`; `budget` is charged for it): stopped by the
    // clock, the line is worth nothing.
    const swung = (end: GameState, value: number): number => {
      const swing = this.swingBack(end, budget);
      return swing === null ? -Infinity : value + swing;
    };
    return {
      moves: (board) => {
        const listed = this.listCandidates(board);
        return listed.candidates.filter(
          (a) => a.type !== "pass-priority" && !listed.mustKill.has(a) && !listed.heldForCombat.has(a),
        );
      },
      // A line with an interaction in it is scored as the one-move search
      // scores that move, against the same pass.
      value: (state, line) =>
        swung(
          state,
          line === undefined || this.passOutcome === null
            ? evaluateState(state, this.cards, this.playerId, this.weights)
            : scoreOutcome(
                this.outcomeAimed(
                  state,
                  aimedByLine(this.cards, this.playerId, line.steps, line.before),
                  this.passOutcome,
                ),
                this.weights,
              ),
        ),
      // A reveal from our own library, as the one-move search weighs it
      // (`typicalDeal`): the turn's deal and four more. Cast Jace, then his
      // −3, was a line on the turn's deal alone, and the plan played the +1.
      redeals: (state, move) =>
        this.revealsOwnLibrary(state, move)
          ? Array.from({ length: OWN_LIBRARY_DEALS - 1 }, (_, i) =>
              withHiddenCards(state, this.cards, this.playerId, { memory: this.memory, ownLibraryDeal: i + 1 }),
            )
          : null,
      mayAttack: (state) => {
        const me = this.playerId;
        const opponents = state.turnOrder.filter((p) => p !== me && !state.players[p].hasLost);
        return withComputedCache(() =>
          state.zones.shared.battlefield.some((id) => {
            const object = state.objects[id];
            if (object === undefined || object.controller !== me || object.tapped) return false;
            if (!computeCharacteristics(state, this.cards, id).types.includes("creature")) return false;
            return opponents.some((p) => whyCannotAttack(state, this.cards, me, id, p) === null);
          }),
        );
      },
    };
  }

  /**
   * Whether this decision's one-move rollouts are the plan's: to the end of
   * the turn, under the `"combat"` policy, our seat answered by its
   * stand-in. Under `"acting"` they play our turn on, and a line passed out
   * is on another scale (about half differ, by up to 60 points: the bot
   * audit's S4), so there the plan scores its own first moves and is
   * compared with its own line for the one-move answer (`planLines`).
   */
  private plansAsScored(): boolean {
    return this.horizon === "turn" && this.decisionRollout === "combat" && !this.rolloutDecisions;
  }

  private planLimits(): TurnPlanLimits {
    return { depth: PLAN_DEPTH, beam: PLAN_BEAM, simulations: this.planSimulations };
  }

  /**
   * What a move lets us do next, as a whole plan (`plan`): the best line for our turn
   * (`planTurn`), its first step played if the line beats `bestScore`, the
   * one-move search's best, and the rest kept for `continueTurnPlan`. Under
   * `"next-turn"` the best line for each of the best `PLAN_REFINE_LINES`
   * first moves — and the one-move answer, as a line of its own — are each
   * played on through our next turn (`nextTurnValue`), and that decides
   * between them.
   *
   * Asked only where a plan could differ from the one-move search: in our
   * own main phase with nothing on the stack, when some first move, once
   * resolved, leaves another to make. `null` when the one-move answer
   * stands.
   */
  private planLines(
    view: ControllerView,
    candidates: readonly Action[],
    scored: ReadonlyMap<Action, number>,
    mustKill: ReadonlyMap<Action, PlayerId>,
    heldForCombat: ReadonlySet<Action>,
    best: Action,
    bestScore: number,
    budget: SearchBudget,
    payoff: Action | null = null,
  ): { readonly action: Action; readonly score: number } | null {
    this.lastFollowUp = null;
    const state = view.state;
    const me = this.playerId;
    if (state.turnOrder[state.turn.activePlayerIndex] !== me) return null;
    if (state.turn.step !== "precombat-main" && state.turn.step !== "postcombat-main") return null;
    if (state.zones.shared.stack.length > 0 || state.awaiting !== null) return null;
    // A window the plan has a step for was replayed (`continueTurnPlan`)
    // before any search; one searched here plans afresh.
    this.turnPlan = null;
    // Not a move the one-move search just marked unsafe (`lastUnsafe`): a
    // line is valued by the plain evaluation, which has no such term, so the
    // planner returned the stationing the search had refused (the bot
    // audit's Q6, 2026-11-10).
    const firsts = candidates.filter(
      (a) =>
        a.type !== "pass-priority" &&
        scored.has(a) &&
        !mustKill.has(a) &&
        !heldForCombat.has(a) &&
        !this.lastUnsafe.includes(a),
    );
    if (firsts.length === 0) return null;
    const hooks = this.planHooks(budget);
    // Under a clock, the plan has what the one-move search left of it, on
    // the search's own predictive stop: past the deadline it scores nothing,
    // and the one-move answer stands.
    const limits = {
      ...this.planLimits(),
      clock: { out: () => outOfTime(budget), timed: <T>(simulate: () => T): T => timed(budget, simulate) },
    };
    const unknown = unknownCards(state, this.cards, me, this.memory.placed[me]);
    const asScored = this.plansAsScored();
    const lines = planTurn(
      state,
      this.cards,
      me,
      firsts,
      hooks,
      limits,
      unknown,
      this.planMode === "turn",
      asScored ? this.lastEnds : undefined,
      asScored || best.type === "pass-priority" ? undefined : best,
    );
    // Each line traced as an answer for its first move, so
    // `scenario-fit.ts`' replay weighs what the plan weighed.
    for (const line of lines) {
      const step = line.steps[0];
      if (step !== undefined) this.trace?.(step === "combat" ? { type: "pass-priority", player: me } : step, line.end);
    }
    const chains = lines.some((line) => line.steps.length > 1);
    let chosen = lines[0];
    if (chosen === undefined) return null;
    // The best line for each of the best few first moves, twins (two Bolts
    // at the same target) counted once.
    const firstKey = (line: PlannedLine): string => {
      const step = line.steps[0];
      if (step === undefined || step === "combat") return "combat";
      const id = step.type === "cast-spell" || step.type === "play-land" ? step.card : undefined;
      return JSON.stringify({ ...step, card: id === undefined ? undefined : state.objects[id]?.cardName });
    };
    const close: PlannedLine[] = [];
    const firstsSeen = new Set<string>();
    for (const line of lines) {
      if (close.length >= PLAN_REFINE_LINES) break;
      const key = firstKey(line);
      if (firstsSeen.has(key)) continue;
      firstsSeen.add(key);
      close.push(line);
    }
    // The one-move answer as a line: its first step, then the turn passed —
    // or, for passing, the turn passed with no step at all.
    const alone =
      best.type === "pass-priority"
        ? undefined
        : lines.find((line) => line.steps.length === 1 && sameStep(line.steps[0], best));
    // Where a plan can't differ from the one-move search, nothing more is
    // spent: no line chains, so each is one move it already weighed — unless,
    // under "next-turn", our next turn might tell the first moves apart:
    // there are two, it isn't already won, and some line leaves a card in
    // hand for it (a second Bolt to come).
    const leavesACard = close.some((line) => (line.end.zones.perPlayer[me]?.hand.length ?? 0) > 0);
    const nextTurn =
      this.planMode === "next-turn" && close.length > 1 && leavesACard && !chosen.end.result.over;
    if (!chains && !nextTurn) return null;
    if (nextTurn) {
      // The one-move answer is weighed first and keeps every tie: a line
      // replaces it only by playing our next turn strictly better.
      const baseline = alone ?? passLine(state, this.cards, me, hooks);
      const order = baseline === null ? close : [baseline, ...close.filter((line) => line !== baseline)];
      let top = -Infinity;
      for (const line of order) {
        const later = nextTurnValue(line, this.cards, me, hooks, limits, unknown);
        // Stopped by the deadline: the one-move answer stands.
        if (later === null) return null;
        // Our next turn is scored plainly; what an interaction in this line
        // took from the player it hit is still this line's.
        const value = later + (hooks.value(line.end, line) - hooks.value(line.end));
        if (value > top + (line === order[0] ? 0 : TIE)) {
          top = value;
          chosen = line;
        }
      }
      if (chosen.steps.length === 0 || !this.lineSafe(chosen, budget)) return null;
    } else {
      // What a line must beat: the one-move answer, on the lines' own scale.
      // That is its score when the search rolled it out as a line is
      // (`plansAsScored`). When it didn't (`"acting"` plays our turn on
      // after the move, so a line passed out was held to a bar it mostly
      // couldn't reach, and now and then cleared one it shouldn't have: the
      // bot audit's S4), it's the plan's own line for that move, or for
      // passing. An answer that isn't one plain move (a batch, an untap
      // plan, a land with its crack) has no such line and keeps its score,
      // as does one no line may begin with (a wipe held for combat).
      let bar = bestScore;
      if (!asScored && scored.get(best) === bestScore) {
        bar = alone?.value ?? bestScore;
      } else if (!asScored && best.type === "pass-priority") {
        if (outOfTime(budget)) return null;
        const passed = timed(budget, () => passLine(state, this.cards, me, hooks));
        if (passed === null) return null;
        bar = passed.value;
      }
      // The best line that beats it and taps nothing into the crackback
      // along the way (`lineSafe`).
      const safe = lines.find((line, i) => {
        if (!(line.value > bar + TIE)) return true;
        return i < PLAN_SAFE_LINES && this.lineSafe(line, budget);
      });
      if (safe === undefined || !(safe.value > bar + TIE)) return null;
      chosen = safe;
    }
    // **The payoff first, when that costs nothing.** A payoff the line casts
    // after its first move (`payoffFirst`'s: Garruk's Uprising behind the
    // Dragon it would see enter) is moved to the front and the line played
    // again; it replaces the line when it scores no worse. The planner
    // itself seldom tries that order: its lines start from the best few
    // first moves (`PLAN_BEAM`), and a payoff alone is an enchantment that
    // does nothing yet. And when it does, the two orders can tie (the
    // Uprising's own enters-draw sees the Dragon cast before it, on an
    // empty board: a card either way), and the tie went to the creature —
    // which the draw then depends on staying alive (a live misplay,
    // 2026-11-17). The one-move search has always given the payoff its
    // ties (`preferred`, above).
    const payoffAt =
      payoff?.type === "cast-spell"
        ? chosen.steps.findIndex((step) => step !== "combat" && step.type === "cast-spell" && step.card === payoff.card)
        : -1;
    if (payoff !== null && payoffAt > 0 && !outOfTime(budget)) {
      const steps = [payoff, ...chosen.steps.slice(0, payoffAt), ...chosen.steps.slice(payoffAt + 1)];
      const moved = timed(budget, () => replayLine(state, this.cards, me, steps, hooks));
      // "No worse" is also an end that differs only in which cards of our
      // library went where (`sameKnownEnd`): the two orders draw and exile
      // in a different order, the rollouts know the library's and the seat
      // doesn't, and a land drawn where the other order drew a spell is 0.4
      // either way — which sent the Dragon first again on the live game's
      // own library.
      const same = moved !== null && sameKnownEnd(moved.end, chosen.end, me);
      const over = chosen.steps[0];
      if (
        moved !== null &&
        over !== undefined &&
        over !== "combat" &&
        (same || moved.value >= chosen.value - TIE) &&
        this.lineSafe(moved, budget)
      ) {
        this.trace?.(payoff, moved.end);
        this.lastPayoffAhead = { action: payoff, over, same };
        chosen = moved;
      }
    }
    const [first, ...rest] = chosen.steps;
    if (first === undefined) return null;
    if (sameStep(first, best) && rest.length === 0) return null;
    this.turnPlan = { turn: state.turn.number, steps: rest, boards: chosen.boards.slice(1) };
    // A line that passes to combat to make a move after it holds that move's
    // mana through combat, as a wipe held for combat does (`heldPlay`).
    const after = rest[0];
    if (first === "combat" && after !== undefined && after !== "combat") {
      this.heldPlay = { turn: state.turn.number, action: after };
    }
    const action: Action = first === "combat" ? { type: "pass-priority", player: me } : first;
    const then = rest.find((step): step is Action => step !== "combat");
    if (then !== undefined) this.lastFollowUp = { action, score: chosen.value, then };
    return { action, score: Math.max(chosen.value, bestScore) };
  }

  /**
   * Whether no step of a planned line leaves us dead to the crackback where
   * we weren't before it (`tapsIntoCrackback`, on the board the step is
   * played on): the one-move search's check, for every step of a line, which
   * is valued by the plain evaluation. Free while no tap could matter
   * (`tapGuard`). A step after a planned attack that already left us open
   * isn't blamed for it: the attack declaration holds back what it must.
   */
  private lineSafe(line: PlannedLine, budget: SearchBudget): boolean {
    const guard = this.tapGuard;
    if (guard === null) return true;
    return line.steps.every((step, i) => {
      const state = line.before[i];
      if (step === "combat" || state === undefined) return true;
      // With an out in hand the board reads lethal at every step, so each is
      // asked outright whether it keeps the out.
      if (guard.outs === true) return !this.tapsIntoCrackback(state, step, budget);
      return this.crackbackLethal(state, guard.grown) || !this.tapsIntoCrackback(state, step, budget);
    });
  }

  /**
   * The next step of the plan `planLines` chose, if this window is the one it
   * planned for: our own turn, nothing on the stack, nothing asked, the board
   * the step was planned on (`boardKey`), and the move still on offer.
   * Anything else drops the plan, and the window is searched as usual.
   */
  private continueTurnPlan(view: ControllerView): Action | null {
    const plan = this.turnPlan;
    if (plan === null) return null;
    const state = view.state;
    const me = this.playerId;
    if (state.turn.number !== plan.turn || state.turnOrder[state.turn.activePlayerIndex] !== me) {
      this.turnPlan = null;
      return null;
    }
    // Our own spell resolving, or a decision it raised: not a window the plan
    // has a step for, and not a reason to drop it.
    if (state.awaiting !== null || state.zones.shared.stack.length > 0) return null;
    if (state.turn.step !== "precombat-main" && state.turn.step !== "postcombat-main") return null;
    const step = plan.steps[0];
    const board = plan.boards[0];
    if (step === undefined || board !== boardKey(state, me)) {
      this.turnPlan = null;
      return null;
    }
    plan.steps.shift();
    plan.boards.shift();
    if (step === "combat") {
      if (state.turn.step === "precombat-main") return { type: "pass-priority", player: me };
      this.turnPlan = null;
      return null;
    }
    const offered = view.legalActions().some(
      (l) =>
        (step.type === "cast-spell" || step.type === "play-land"
          ? l.kind === step.type && l.card === step.card
          : step.type === "activate-ability"
            ? l.kind === "activate-ability" && l.source === step.source && l.abilityIndex === step.abilityIndex
            : false) && targetsStillOffered(step, l),
    );
    if (!offered) {
      this.turnPlan = null;
      return null;
    }
    // The line was played out over cards dealt for the plan (`fairView`): a
    // step after a mill or a draw may name a card the game put somewhere
    // else (a Treasure Cruise delving the Putrefy the plan's own mill turned
    // up, `bot:ab` seed 18, 2026-11-17: thrown at the table). The offer above
    // says the spell can be cast, not that this way of casting it can: the
    // step is tried on a copy, and a refusal drops the plan.
    if (view.legalActionsAfter !== undefined && view.legalActionsAfter(step) === null) {
      this.turnPlan = null;
      return null;
    }
    // The step was checked when the line was chosen (`lineSafe`), on the
    // board the plan foresaw; this is the board it is played on, read as a
    // fresh decision would read it. Unsafe now, the plan is dropped and the
    // window searched.
    this.tapGuard = this.crackbackGuard(state);
    if (this.tapGuard !== null && this.tapsIntoCrackback(state, step, this.budget())) {
      this.turnPlan = null;
      return null;
    }
    return step;
  }

  /**
   * Whether this window is a step of the turn plan resolving with more of
   * the plan to come: our own main phase, nothing asked, and a stack of
   * nothing but our own spells and abilities — the step and whatever it
   * triggered. The line was scored with each step resolved before the next
   * (`simulateSettled`), so the window is passed, not searched: a search
   * here can't see the plan, and spends its mana.
   *
   * `holdPass` already passes on a searched cast alone on the stack. A cast
   * trigger beside it made the window a searched one: Aligned Heart, moved
   * ahead of Caldera Pyremaw as the payoff (`planLines`), went on the stack
   * under a cast trigger, and the search there cast Abrade in response and
   * cracked five Lander tokens — no mana for the Dragon the plan still held
   * (the bench decks' seed 2, turn 30, read off `bot:diff`, 2026-11-17).
   * The Dragon first had hidden it: the dear spell was paid for before any
   * window opened.
   *
   * An opponent's spell or ability on the stack is a new question, searched
   * as ever, and so is our own wipe taking a creature of ours (`holdPass`'s
   * exception). The plan's last step is searched as before: nothing is left
   * to protect.
   */
  private planResolving(state: GameState): boolean {
    const plan = this.turnPlan;
    const me = this.playerId;
    if (plan === null || plan.steps.length === 0 || state.turn.number !== plan.turn) return false;
    if (state.turnOrder[state.turn.activePlayerIndex] !== me || state.awaiting !== null) return false;
    if (state.turn.step !== "precombat-main" && state.turn.step !== "postcombat-main") return false;
    const stack = state.zones.shared.stack;
    return (
      stack.length > 0 &&
      stack.every((id) => state.objects[id]?.controller === me) &&
      !this.ownWipeOnStack(state)
    );
  }

  /**
   * Whether a priority candidate's own resolution — what it taps or
   * sacrifices to pay for itself, a mana creature its payment taps, a
   * creature it convokes with or stations — leaves us dead to the crackback
   * where we weren't, read on the board right after it resolves (horizon
   * `"stack"`, everyone passing). A tapped creature is a blocker gone until
   * our next untap step, just as an attacker is, and the attack declaration
   * has always held back what the crackback needs (`declareAttackers`); a
   * main-phase tap never did (the user, 2026-10-07: World Shaper stationed
   * Hearthhull with practically every creature it had and couldn't block).
   * The rollouts end with our turn, so they never see the swing back.
   */
  private tapsIntoCrackback(state: GameState, action: Action, budget: SearchBudget): boolean {
    const guard = this.tapGuard;
    if (guard === null || (action.type !== "cast-spell" && action.type !== "activate-ability")) return false;
    const resolved = timed(budget, () => simulateAction(state, this.cards, action, "stack", "passive"));
    // Stopped by the deadline, it wasn't shown safe: unsafe (it read as safe).
    if (resolved === null) return budget.until !== Infinity && rolloutAborted();
    if (resolved.result.over) return false;
    if (guard.outs === true) {
      // Dead on the board with an out in hand: unsafe is spending what the
      // out needs, read by playing the swing back from the board it leaves.
      const alive = timed(budget, () => this.survivesSwing(resolved));
      return alive === null ? budget.until !== Infinity && rolloutAborted() : !alive;
    }
    return this.crackbackLethal(resolved, guard.grown);
  }

  /**
   * Dead to the table is not dead to each player at it. `spared` are the
   * opponents we lived through with our creatures home, who act before the
   * one whose swing kills us; this is whether, on `state`, one of them still
   * in the game now has us dead. An attack that makes it so dies a turn or
   * two sooner than it had to, with other people's turns unplayed:
   * Sultai Arisen, dead on paper to twelve Zombies two turns on, tapped out
   * for a kill and died next turn to a board its creatures would have held
   * (`bot:losses`, 2026-11-15).
   *
   * And "dead to the table" is a sum: three opponents' swings, the later
   * ones at a weight, with life kept in reserve. `killers` are the opponents
   * who had us dead alone, each by its own creatures and to the last point
   * of life (`opponentsLethalAlone`); an attack after which another one
   * does dies to a single swing it would have lived through. Sultai Arisen
   * again, on 26: dead by one point to three boards added up, to none of
   * them alone, it sent its 6/6 and the one board that then swung at it
   * dealt 27 (`bot:losses`, 2026-11-16).
   *
   * `tookOut`: the attack eliminated a player. That is not held to the
   * second reading while two opponents are left, who have each other to
   * swing at. **With one left it is**: that player has nobody else to
   * attack, so a kill that leaves us dead to them alone wins the kill and
   * loses the game. Doom Prevails, on 8 with one creature goaded, sent
   * everything to finish the third player and died to the fourth's 11 power
   * with no blocker; with the rest home it was on 2 after the same swing
   * (watching the tooling precons, 2026-11-16).
   */
  private diesSooner(state: GameState, spared: readonly PlayerId[], killers: readonly PlayerId[], tookOut: boolean): boolean {
    const me = this.playerId;
    const left = state.turnOrder.filter((p) => p !== me && state.players[p]?.hasLost !== true).length;
    if ((!tookOut || left === 1) && opponentsLethalAlone(state, this.cards, me).some((p) => !killers.includes(p))) {
      return true;
    }
    const still = spared.filter((p) => state.players[p]?.hasLost !== true);
    if (still.length === 0) return false;
    const now = this.outlives(state);
    return still.some((p) => !now.includes(p));
  }

  /**
   * Whether `action` ends the game in our favour as it resolves: played out
   * to an empty stack with nobody answering, the game is over and ours. A
   * board wipe that takes our attackers is held for after combat
   * (`holdsWipeForCombat`) — but not Deadly Tempest with the last opponent
   * on 14 life and fifteen creatures, where there is no combat to wait for
   * (a kept live game, 2026-11-22: held, and never cast).
   */
  private winsAsItResolves(state: GameState, action: Action): boolean {
    const resolved = simulateAction(state, this.cards, action, "stack", "passive");
    return resolved !== null && resolved.result.over && resolved.result.winner === this.playerId;
  }

  /** The turn and hand `digForTheWin` last played out: asked again with
   * the same hand that turn, the answer is taken to be the same. */
  private digWinAsked: string | null = null;
  /** The Tainted Pact resolving (its turn and source) and the card its
   * earlier offers found to dig on for (`winningOffer`'s `sought`). */
  private digSeeks: { readonly dig: string; readonly sought: string | null } | null = null;

  /**
   * The cast of a dig in our hand (Demonic Consultation, Spoils of the
   * Vault, Tainted Pact) that finds a card which wins the game this turn
   * (`dig-win.ts`),
   * or `null`. In our own main phase with the stack empty, where what it
   * finds can be cast whatever it is; the name is chosen again as the dig
   * resolves (`chooseCardName`), by the same playout.
   */
  private digForTheWin(view: ControllerView): Action | null {
    const state = view.state;
    const me = this.playerId;
    if (state.turnOrder[state.turn.activePlayerIndex] !== me || state.zones.shared.stack.length > 0) return null;
    if (state.turn.step !== "precombat-main" && state.turn.step !== "postcombat-main") return null;
    const hand = state.zones.perPlayer[me].hand;
    const asked = `${state.turn.number}:${hand.join(",")}`;
    if (this.digWinAsked === asked) return null;
    this.digWinAsked = asked;
    for (const card of hand) {
      const name = state.objects[card]?.cardName;
      if (name === undefined || !this.cards.has(name)) continue;
      const def = this.cards.get(name);
      const dig = digOf(def.effect);
      if (dig === null || def.targets.length > 0 || def.additionalCost !== null) continue;
      if (!view.legalActions().some((legal) => legal.kind === "cast-spell" && legal.card === card)) continue;
      const cast: Action = { type: "cast-spell", player: me, card, targets: [] };
      const cost = manaValue(parseManaCost(def.manaCost));
      if (dig.kind === "until-taken") {
        if (winsByDigging(state, this.cards, me, cast, cost)) return cast;
        continue;
      }
      const usual = nameToDigFor(state, me, dig, this.wantedInHand(state))?.name ?? null;
      if (winningName(state, this.cards, me, dig, () => cast, usual, cost) !== null) return cast;
    }
    return null;
  }

  /**
   * The name a dig of ours chooses: the card that wins the game this turn
   * when there is one it finds more often than not (`dig-win.ts`), whatever
   * the dig leaves of the library; otherwise v1's, the tutor's pick among
   * the safe names (`dig.ts`).
   */
  chooseCardName(
    view: ControllerView,
    source: ObjectId,
    options: readonly string[],
    suggested: readonly string[],
  ): string {
    const usual = super.chooseCardName(view, source, options, suggested);
    const awaiting = view.state.awaiting;
    const me = this.playerId;
    if (awaiting?.kind !== "choose-card-name" || awaiting.player !== me || awaiting.options !== undefined) return usual;
    const dig = namedDigIn(awaiting.then);
    if (dig?.kind !== "named") return usual;
    const winner = winningName(
      view.state,
      this.cards,
      me,
      dig,
      (name) => ({ type: "choose-card-name", player: me, name }),
      usual,
    );
    return winner !== null && isNameableAs(this.cards, winner, awaiting.filter) ? winner : usual;
  }

  /**
   * Whether `action`, in one of our own combat steps, spends mana the play
   * held for after combat this turn needs (`heldPlay`): played out to an
   * empty stack, the held play is no longer on offer in our second main
   * phase (asked of the engine on that board, the pool emptied as the step
   * ends). A combat pump spent the wipe's mana and the wipe never came (from
   * capture 9M59N t17, 2026-10-07). `"drop"` it, or keep it only if it kills
   * the attacked player with the least life; `"ok"` otherwise.
   */
  private spendsHeldMana(state: GameState, action: Action): "ok" | "drop" | { readonly kills: PlayerId } {
    const held = this.heldPlay;
    const me = this.playerId;
    if (held === null || held.turn !== state.turn.number) return "ok";
    if (state.turnOrder[state.turn.activePlayerIndex] !== me) return "ok";
    if (phaseOfStep(state.turn.step) !== "combat") return "ok";
    if (action.type !== "cast-spell" && action.type !== "activate-ability") return "ok";
    if (sameAction(action, held.action)) return "ok";
    const offered = (board: GameState): boolean => heldOnOffer(board, this.cards, me, held.action);
    // Under a stack (a trigger of ours from this combat), the held play is
    // read on the board that stack leaves: a sorcery is never on offer over
    // one, which read as "not castable anyway" and let Stensia Bloodhall
    // spend a held Deadly Tempest's mana under Kardur's three triggers (a
    // kept live game, 2026-11-22).
    const settled =
      state.zones.shared.stack.length === 0
        ? state
        : simulateAction(state, this.cards, { type: "pass-priority", player: me }, "stack", "passive");
    if (settled === null || !offered(settled)) return "ok";
    const resolved = simulateAction(state, this.cards, action, "stack", "passive");
    if (resolved === null || offered(resolved)) return "ok";
    const attacked = [
      ...new Set(
        state.zones.shared.battlefield
          .map((id) => state.objects[id]?.attacking)
          .filter((d): d is PlayerId => d != null && state.players[d as PlayerId] !== undefined),
      ),
    ];
    if (attacked.length === 0) return "drop";
    const weakest = attacked.reduce((a, b) => (state.players[b].life < state.players[a].life ? b : a));
    return { kills: weakest };
  }

  /**
   * Read once per priority decision: whether anything we tap or sacrifice
   * this turn could leave us dead to the crackback. Only on our own turn
   * (what we tap then stays tapped through every opponent's turn), and as
   * the attack declaration reads it: not when we're dead to it already,
   * holding everything (then holding back buys nothing), with the plain
   * check standing in for the scaled one when the scaled one fails even now
   * (`grown`), and not when even nothing left home isn't lethal — then no
   * tap can matter, and no candidate pays for the extra simulation.
   */
  private crackbackGuard(state: GameState): TapGuard | null {
    // A decision's swing backs are its own: the game's state is one object
    // changed in place, so a board remembered across decisions is whatever
    // the game has since become (a turn-34 answer was read back on turn 37,
    // and the bot held its mana for an out it no longer had).
    this.swings = new WeakMap();
    // In another player's turn too: the players still to attack before we
    // untap are who the crackback counts there (`crackback`). Grave Danger's
    // bot, on 30 life, blocked Mardu Surge's tokens with its last three
    // untapped Zombies and then tapped them to Cryptbreaker for a card; the
    // next player sacrificed a 12/12 to Jarad and swung 20 power into no
    // blockers (found by `bot:losses`, 2026-11-15). The guard was our own
    // turn's alone.
    const ours = state.turnOrder[state.turn.activePlayerIndex] === this.playerId;
    if (this.crackbackLethal(state, false)) {
      // Dead on the board whatever stays home: holding creatures back buys
      // nothing, but an answer in hand may (`survivesSwing`). If passing
      // lives through the swing back, that is the out, and what a candidate
      // spends is checked against it. Our own turn only: the swing back is
      // played from a turn of ours.
      return ours && this.holdsAnAnswer(state) && this.survivesSwing(state) === true ? { grown: false, outs: true } : null;
    }
    const grown = !this.crackbackLethal(state, true);
    if (!this.crackbackLethal(state, grown, "all")) return null;
    return { grown };
  }

  /** A card in our hand that can be cast in an opponent's turn: an instant,
   * or one with flash. The cheap test before a swing back is simulated. */
  private holdsAnAnswer(state: GameState): boolean {
    return (state.zones.perPlayer[this.playerId]?.hand ?? []).some((id) => {
      const name = state.objects[id]?.cardName;
      if (name === undefined || !this.cards.has(name)) return false;
      const def = this.cards.get(name);
      return def.types.includes("instant") || def.keywords.includes("flash");
    });
  }

  /**
   * **Playing to its outs** (`docs/plans/bot-next-steps.md`, step 5). Whether
   * we are alive when our next turn begins, from `state` as it stands: the
   * opponents whose creatures alone have us dead each attack us with
   * everything (`SwingAtController`), the others play v1's combat, and our
   * own seat answers with what it holds and the mana it has left
   * (`AnsweringSeat`). `null` when the simulation was refused or stopped.
   *
   * The block arithmetic knows only creatures, so a bot dead on the board
   * raced and tapped out: at 10 life in front of ten 6/4s, with Aetherize in
   * hand and ten lands, it cast three creatures that couldn't save it and
   * died with one land open (found by `bot:outs`, 2026-11-15, after the user
   * asked whether the bots play to their outs). With the mana open it casts
   * Aetherize as the attackers are declared and lives.
   */
  private survivesSwing(state: GameState): boolean | null {
    const known = this.swings.get(state);
    if (known !== undefined) return known;
    const me = this.playerId;
    const blockers = combatCreatures(state, this.cards, me, true);
    const seatFor = (player: PlayerId): PlayerController => {
      if (player === me) return new AnsweringSeat(me, this.cards, this.weights);
      const attackers = combatCreatures(state, this.cards, player, false).filter((c) => c.canAttack);
      return isLethal(state, me, damageThrough(attackers, blockers))
        ? new SwingAtController(player, this.cards, me)
        : new CombatRolloutController(player, this.cards);
    };
    const after = simulateSwingBack(state, this.cards, me, seatFor);
    const alive = after === null ? null : after.players[me]?.hasLost !== true;
    this.swings.set(state, alive);
    return alive;
  }
}

/**
 * Whether `held` — a cast or activation put off until our second main phase
 * — would be on offer there, with `board` as it is: the board read as our
 * second main phase with nothing on the stack and our pool emptied (mana
 * empties as each step ends), and asked of the engine, so its payment
 * planner says whether the mana left still pays for it, colours and all.
 */
function heldOnOffer(board: GameState, cards: CardRegistry, me: PlayerId, held: Action): boolean {
  if (held.type !== "cast-spell" && held.type !== "activate-ability") return false;
  try {
    const game = Game.fromSnapshot(
      {
        ...board,
        eventLog: [],
        awaiting: null,
        turn: { ...board.turn, step: "postcombat-main" },
        priority: { ...board.priority, holder: me },
        players: { ...board.players, [me]: { ...board.players[me], manaPool: [] } },
      },
      { registry: cards },
    );
    return game.legalActions(me).some((legal: LegalAction) =>
      held.type === "cast-spell"
        ? legal.kind === "cast-spell" && legal.card === held.card
        : legal.kind === "activate-ability" && legal.source === held.source && legal.abilityIndex === held.abilityIndex,
    );
  } catch {
    return false;
  }
}

/**
 * Whether, on `player`'s own turn, they have a payoff for casting spells with
 * a spell castable now that it would see — a "whenever you cast"
 * trigger (Shiko and Narset's Flurry, prowess, Young Pyromancer) — on the
 * battlefield, on the stack about to be, or in hand or the command zone and
 * castable now: Shiko cast from the command zone is the turn's first spell
 * herself, so the next one is the second. On the stack too, or a window
 * searched with Guttersnipe there rolled our seat out passive, the Bolt in
 * hand never cast after it, and casting it in response won (a live misplay,
 * 2026-10-08).
 */
function castPayoff(view: ControllerView, cards: CardRegistry, player: PlayerId): boolean {
  const state = view.state;
  // Our own turn only: "play out the rest of our turn" is not what a rollout
  // from an opponent's turn is for, and it costs about twice a passive one
  // (the bot audit's S5, 2026-11-10: on from turn one for a third of seats).
  if (state.turnOrder[state.turn.activePlayerIndex] !== player) return false;
  const own = state.zones.perPlayer[player];
  const inPlay = [
    ...state.zones.shared.battlefield.filter((id) => state.objects[id]?.controller === player),
    ...state.zones.shared.stack.filter(
      (id) => state.objects[id]?.kind === "card" && state.objects[id]?.controller === player,
    ),
  ];
  const held = [...own.hand, ...state.zones.shared.command.filter((id) => state.objects[id]?.owner === player)];
  /** The filters of `id`'s "whenever you cast" triggers (`undefined`: any spell). */
  const filtersOf = (id: ObjectId): readonly (CardFilter | undefined)[] => {
    const object = state.objects[id];
    if (object === undefined || !cards.has(object.cardName)) return [];
    return cards.get(object.cardName).triggered.flatMap((ability) => {
      const trigger = ability.trigger as { readonly on?: unknown; readonly who?: unknown; readonly filter?: CardFilter };
      return trigger.on === "cast-spell" && trigger.who === "you" ? [trigger.filter] : [];
    });
  };
  if (![...inPlay, ...held].some((id) => filtersOf(id).length > 0)) return false;
  // The spells castable now: a payoff with nothing to pay off (a commander
  // with such a trigger and an empty hand, a hand of lands) changes nothing
  // a passive rollout doesn't show.
  const castable = new Set<ObjectId>();
  for (const legal of view.legalActions()) if (legal.kind === "cast-spell") castable.add(legal.card);
  if (castable.size === 0) return false;
  const seenBy = (payoff: ObjectId): boolean =>
    filtersOf(payoff).some((filter) =>
      [...castable].some(
        (card) => card !== payoff && (filter === undefined || matchesFilter(state, cards, card, filter, { you: player })),
      ),
    );
  return inPlay.some(seenBy) || held.some((id) => castable.has(id) && seenBy(id));
}

/**
 * What `EvalBotController.passMemo` remembers a passed window under: its
 * candidates and due cantrip, and the whole state but the event log and its
 * counter, the step and who holds priority. The whole state, not a list of what a rollout
 * reads: combat declared, tapped state, damage, counters, life, every zone,
 * effects that last the turn and the journal are all in it, and so is
 * anything added later. A few milliseconds on a big board, against a search.
 */
function passMemoKey(
  state: GameState,
  listed: { readonly candidates: readonly Action[]; readonly cantrip: Action | null },
): string {
  return JSON.stringify([
    listed.candidates,
    listed.cantrip,
    {
      ...state,
      eventLog: undefined,
      // Counts every event, a pass of priority among them.
      eventSeq: undefined,
      priority: undefined,
      // The step, and the turn's counts of the phases begun, which say no
      // more than the step does.
      turn: { ...state.turn, step: undefined, mainPhases: undefined, combatPhases: undefined, endSteps: undefined },
    },
  ]);
}

/** A move in a few words, for a diagnostic line. */
function describeMove(state: GameState, action: Action): string {
  if (action.type === "cast-spell") return `cast ${state.objects[action.card]?.cardName}`;
  if (action.type === "activate-ability") return `activate ${state.objects[action.source]?.cardName} #${action.abilityIndex}`;
  return action.type;
}

/** Whether a land-drop candidate is the one `inherited` plays. */
function sameLand(candidate: Action, inherited: Action): boolean {
  return (
    candidate.type === "play-land" &&
    inherited.type === "play-land" &&
    candidate.card === inherited.card &&
    candidate.face === inherited.face
  );
}

/** Simulations the nested search may spend on one window of an opponent's
 * turn inside a deep rollout (`DeepRolloutController`). */
const DEEP_RESPONSE_SIMULATIONS = 8;

/**
 * Our own seat inside a deep-horizon rollout (`"round"`, `"next-turn"`).
 *
 * On an opponent's turn, a small v2 search — the end of the turn its horizon,
 * a few simulations a window, no follow-ups — so the line a candidate leaves
 * open is played with the answers we'd really give: the Fog kept up for
 * their attack, the Counterspell for their Lava Axe, the block. v1 is no
 * stand-in there: it holds neither.
 *
 * For the rest of the turn the candidate is played in, on our own turn, it
 * passes, attacking and blocking as v1 (the `"combat"` policy's stand-in),
 * so a candidate is scored as "this, and nothing more this turn" — as every
 * rollout to the end of the turn scores it. Anything that plays that turn on
 * undoes what the candidate meant: with v1 there, the Fog we passed to keep
 * was cast at our own beginning of combat, and with the small search there,
 * the Courser we passed on was cast in our second main phase, so passing
 * rolled out the same as tapping out. Each real window of it is searched
 * again anyway. Our next turn (`"next-turn"`) the small search plays: it's
 * where the second Bolt and the reanimation spell are cast.
 *
 * It can't recurse, the search's own horizon being the turn, and a window
 * where we have nothing to cast costs it nothing.
 */
export class DeepRolloutController extends CombatRolloutController {
  private readonly responder: EvalBotController;
  /** The turn the candidate is played in. */
  private readonly turn: number;

  constructor(playerId: PlayerId, registry: CardRegistry, weights: EvalWeights, turn: number) {
    super(playerId, registry);
    this.turn = turn;
    this.responder = new EvalBotController(playerId, registry, {
      weights,
      maxSimulations: DEEP_RESPONSE_SIMULATIONS,
      plan: "off",
    });
  }

  override act(view: ControllerView): Action {
    return view.state.turn.number === this.turn ? super.act(view) : this.responder.act(view);
  }
}
