/**
 * Which step a delayed triggered ability waits for (rule 603.7): one shape in
 * place of a fixed list of step, player and "which one" combinations. See
 * docs/plans/need-key-themes.md, theme 15's design note.
 *
 * - {@link DelayedAt} is what a card says: "at the beginning of **that
 *   player's next** end step" is `{ step: "end", whose: "that-player" }`.
 * - {@link DelayedStepWatch} is what the state keeps once the players are
 *   read.
 */

import type { WatchExpiry } from "./duration.js";
import type { PlayerId } from "./primitives.js";
import type { PlayerRef } from "./refs.js";
import type { Step } from "./turn.js";

/**
 * A step a delayed ability can wait for: one in which a player gets priority,
 * so the ability can go on the stack as it begins. Never the untap step (rule
 * 502.4). `"main"` is either main phase, the first of them to begin.
 */
export type DelayedStep =
  | Extract<
      Step,
      | "upkeep"
      | "draw"
      | "precombat-main"
      | "begin-combat"
      | "end-combat"
      | "postcombat-main"
      | "end"
      | "cleanup"
    >
  | "main";

/**
 * - `"next"`: the next such step to begin, never one already under way.
 * - `"this-turn"`: as `"next"`, but with none left this turn it lapses with
 *   the turn, never firing (Venomous Breath, Feral Encounter).
 * - `"next-turn"`: only in a turn of `whose` that hasn't begun yet, never this
 *   one (Kav Landseeker). One whose step never comes lets it lapse, unfired.
 */
export type DelayedWhich = "next" | "this-turn" | "next-turn";

/**
 * "At the beginning of the next end step" is `{ step: "end" }`; "of your next
 * upkeep" `{ step: "upkeep", whose: "you" }`; "of that player's next end step"
 * `{ step: "end", whose: "that-player" }`; "of the next main phase this turn"
 * `{ step: "main", which: "this-turn" }`.
 *
 * `whose` is whose turn it must be: `"any"` by default. `"you"` is the delayed
 * ability's controller, who is what "you" means in its text (rule 603.7d-e),
 * and who needn't be the player who set it up (`controller` on the effect).
 * Anything else is read as it's set up.
 */
export interface DelayedAt {
  readonly step: DelayedStep;
  readonly whose?: PlayerRef | "any";
  readonly which?: DelayedWhich;
}

/** A {@link DelayedAt} as the state keeps it, with its player read. */
export interface DelayedStepWatch {
  readonly step: DelayedStep;
  readonly whose: PlayerId | "any";
  readonly which: DelayedWhich;
  /** `"next-turn"`: that turn has begun, and is this one. */
  readonly turnBegan?: true;
}

/** The engine's own delayed abilities, and a card's once its player is read. */
export function delayedStep(
  step: DelayedStep,
  whose: PlayerId | "any" = "any",
  which: DelayedWhich = "next",
): DelayedStepWatch {
  return { step, whose, which };
}

/**
 * Read a card's {@link DelayedAt} as the ability is set up. `controller` is
 * the delayed ability's, and `read` reads any other player: with none, or one
 * it can't read, there is no such turn to wait for and nothing is set up.
 */
export function readDelayedAt(
  at: DelayedAt,
  controller: PlayerId,
  read?: (ref: Exclude<PlayerRef, "you">) => PlayerId | undefined,
): DelayedStepWatch | undefined {
  const whose = at.whose ?? "any";
  const player = whose === "any" ? "any" : whose === "you" ? controller : read?.(whose);
  return player === undefined ? undefined : { step: at.step, whose: player, which: at.which ?? "next" };
}

/** Is `at` a step timing, rather than one of the event watches? The others
 * are objects too, so `typeof at === "object"` can't tell them apart. */
export function isStepWatch(at: object | string): at is DelayedStepWatch {
  return typeof at === "object" && "step" in at;
}

/** Whether a "whenever" watch lives past the turn it was made in. */
export function watchOutlastsItsTurn(until: WatchExpiry): boolean {
  return until !== "end-of-turn" && until !== "until-end-of-combat";
}

/** What {@link delayedStepFires} needs to know about the turn. */
export interface DelayedStepTurn {
  readonly active: PlayerId;
  /** A later turn than the one it was made in. */
  readonly laterTurn: boolean;
  /** Made during this end step, and no additional end step has begun since. */
  readonly madeInThisEndStep: boolean;
  /** This turn has had an additional upkeep step (rule 500.10). */
  readonly addedUpkeep: boolean;
}

/**
 * Does a step beginning now fire this? Called only as a step begins, so a step
 * already under way when the ability was made is never one it waits for.
 */
export function delayedStepFires(at: DelayedStepWatch, step: Step, turn: DelayedStepTurn): boolean {
  const matches =
    at.step === step || (at.step === "main" && (step === "precombat-main" || step === "postcombat-main"));
  if (!matches) return false;
  if (at.whose !== "any" && at.whose !== turn.active) return false;
  if (at.which === "next-turn") return at.turnBegan === true;
  // No guard below applies: an extra turn's "that turn's end step" is set up
  // as the turn begins, while the step is still the last turn's.
  if (at.which === "this-turn") return !turn.laterTurn;
  // Made during the end step (or cleanup), "the next end step" is next turn's,
  // or an additional end step that begins after it (rule 500.9, Y'shtola
  // Rhul's ruling).
  if (step === "end") return !turn.madeInThisEndStep;
  // A turn's own upkeep is over by the time anything could make one of these,
  // so the next upkeep to begin is a later turn's, or an additional upkeep
  // step this turn (Obeka, Splitter of Seconds; rule 500.10).
  if (step === "upkeep") return turn.laterTurn || turn.addedUpkeep;
  return true;
}
