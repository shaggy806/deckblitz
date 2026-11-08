/**
 * How long an effect lasts (rules 611.2, 514.2): the one vocabulary every
 * effect that lasts is written in, and the one form the game keeps it in once
 * it has begun. See docs/plans/need-key-themes.md, theme 3's design note.
 *
 * - {@link Duration} is what a card says: "until your next turn", "for as
 *   long as you control this", "during that player's next turn". Each word
 *   means one thing wherever it's used.
 * - {@link Expiry} is what the state keeps: players resolved to ids, sources
 *   to the stint the effect refers to.
 *
 * Each store takes the part of `Duration` its expiry pass can end — the
 * subsets below, each an `Extract` of `Duration`, never a union of its own.
 * Teaching a store a member is widening its subset and its resolver.
 */

import type { PlayerRef, ObjectRef } from "./effects.js";
import type { ObjectId, PlayerId } from "./primitives.js";

/** A player a duration is anchored to other than the effect's controller,
 * whose own forms are `Duration`'s strings: "until **that player's** next
 * turn" is `{ untilTurnOf: "that-player" }`, never `{ untilTurnOf: "you" }`. */
export type DurationPlayer = Exclude<PlayerRef, "you">;

/**
 * How long an effect lasts, as a card says it. `you` is the effect's
 * controller throughout.
 *
 * The turn:
 * - `"end-of-turn"`: "until end of turn", "this turn" — over in the cleanup
 *   step (rule 514.2).
 * - `"until-end-of-combat"`: "this combat", "until end of combat" (rules
 *   500.5a, 511.2): as the combat phase under way or next to come ends, or at
 *   this turn's cleanup with no combat to end.
 * - `"permanent"`: no end of its own — on an object, for as long as it is
 *   that object (rule 400.7); on a player, the rest of the game.
 *
 * A later turn — `you`'s with the strings, another player's with the objects
 * (each read as the effect begins; one naming a player who has left the game
 * ends as their turn would have begun, rule 800.4m):
 * - `"until-your-next-turn"`, `{ untilTurnOf }`: as that turn begins.
 * - `"until-end-of-your-next-turn"`, `{ throughTurnOf }`: that turn's
 *   cleanup step (Stilt-Man, Towering Terror; an impulse draw's "until the end
 *   of your next turn").
 * - `"during-your-next-turn"`, `{ duringTurnOf }`: only within that turn —
 *   nothing until it begins, over at its cleanup ("that player can't attack
 *   you during their next turn" — Willie Lumpkin, Postman; Taunt).
 * - `"during-its-controllers-next-turn"`: the same, of whoever controls the
 *   object the effect is on as it begins (Wall of Dust, Gideon,
 *   Battle-Forged); `"during-its-controllers-next-combat"` that player's next
 *   combat phase (Trench Behemoth).
 * - `"until-your-next-upkeep"`: as it begins (Xenic Poltergeist);
 *   `"until-end-of-your-next-upkeep"` as it ends (Halfdane).
 * - `"until-its-controllers-next-untap-step"`: as the next untap step of the
 *   permanent's controller then begins (Orcish Farmer). A skipped one doesn't
 *   count (rule 614.10a), which is where it differs from "until your next
 *   turn".
 * - `"until-your-next-end-step"`: as it begins (Rocco, Street Chef);
 *   `"until-next-end-step"` anyone's (a copy "until the next end step").
 * - `"until-end-of-combat-your-next-turn"`: Brazen Cannonade's.
 *
 * The source, in the stint the effect refers to — each does nothing if it
 * isn't true as the effect would begin (rule 611.2b), and ends for good the
 * first moment it stops being true:
 * - `"while-source"`: "for as long as [this] remains on the battlefield"
 *   (Opportunistic Dragon).
 * - `"while-source-tapped"`: "for as long as [this] remains tapped"
 *   (Ashnod's Battle Gear).
 * - `"while-you-control-source"`: "for as long as you control [this]"
 *   (Aegis Angel; Lightning, Security Sergeant's permission).
 * - `"while-you-control-source-tapped"`: both (Rubinia Soulsinger).
 * - `"while-its-controller-controls-source"`: "for as long as **they**
 *   control it", said just after someone else gained control of the source
 *   (Vislor Turlough).
 * - `"while-source-attached"`: "for as long as this Equipment remains
 *   attached to it" (Blade of Shared Souls).
 * - `{ whileTapped }`: for as long as that object remains tapped (Zygon
 *   Infiltrator).
 * - `{ whileCounter }`: "for as long as it has a [kind] counter on it"
 *   (Ultima, Origin of Oblivion): ends as the last one is removed, and isn't
 *   brought back by a new one.
 * - `"until-source-cast"`: "until this card is cast from exile" (Glamorous
 *   Outlaw): the source, in the exile stint it's in as the effect begins,
 *   has been cast (601.2g's ruling). Leaving exile any other way ends nothing.
 *
 * A permission over one card (`GameObject.playPermission`), whose every
 * permission ends anyway once the card moves:
 * - `"while-exiled"`: "for as long as it remains exiled".
 * - `"until-next-exile"`: "until you exile another card with this"
 *   (Unstable Amulet), ending when this stint of the source next does.
 */
export type Duration =
  | "end-of-turn"
  | "until-end-of-combat"
  | "permanent"
  | "until-your-next-turn"
  | "until-end-of-your-next-turn"
  | "during-your-next-turn"
  | { readonly untilTurnOf: DurationPlayer }
  | { readonly throughTurnOf: DurationPlayer }
  | { readonly duringTurnOf: DurationPlayer }
  | "during-its-controllers-next-turn"
  | "during-its-controllers-next-combat"
  | "until-your-next-upkeep"
  | "until-end-of-your-next-upkeep"
  | "until-its-controllers-next-untap-step"
  | "until-your-next-end-step"
  | "until-next-end-step"
  | "until-end-of-combat-your-next-turn"
  | "while-source"
  | "while-source-tapped"
  | "while-you-control-source"
  | "while-you-control-source-tapped"
  | "while-its-controller-controls-source"
  | "while-source-attached"
  | { readonly whileTapped: ObjectRef }
  | { readonly whileCounter: string }
  | "until-source-cast"
  | "while-exiled"
  | "until-next-exile";

/** The points in a later turn of the controller's — or, for the untap step,
 * of the permanent's controller — that a permanent's effect can last until
 * (`UntilPoint` once begun). */
export type PointDuration = Extract<
  Duration,
  | "until-your-next-upkeep"
  | "until-end-of-your-next-upkeep"
  | "until-end-of-your-next-turn"
  | "until-its-controllers-next-untap-step"
>;

/** What an effect on a permanent can last (a `PtModifier`'s fields, a
 * `ControlEffect`'s — see `durationFields`): `"permanent"` is for as long as
 * it stays (rule 611.2a). */
export type PermanentDuration = Extract<
  Duration,
  | "end-of-turn"
  | "permanent"
  | "until-source-cast"
  | "until-your-next-turn"
  | "until-end-of-combat"
  | PointDuration
  | { readonly whileCounter: string }
  | "while-source"
  | "while-source-tapped"
  | "while-you-control-source"
  | "while-you-control-source-tapped"
  | "while-its-controller-controls-source"
>;

/** What an effect on a player, or a timed static, can last (`PlayerEffect`,
 * `EmblemState.expires` — see {@link resolvePlayerDuration}). */
export type PlayerDuration = Extract<
  Duration,
  | "end-of-turn"
  | "until-end-of-combat"
  | "permanent"
  | "until-your-next-turn"
  | "until-end-of-your-next-turn"
  | "during-your-next-turn"
  | "until-your-next-upkeep"
  | "until-end-of-your-next-upkeep"
  | { readonly untilTurnOf: DurationPlayer }
  | { readonly throughTurnOf: DurationPlayer }
  | { readonly duringTurnOf: DurationPlayer }
>;

/** What a copy effect with a duration can last (`become-copy`'s `until`,
 * `TemporaryCopy.ends`). */
export type CopyDuration = Extract<
  Duration,
  | "end-of-turn"
  | "until-next-end-step"
  | "until-your-next-turn"
  | "while-source"
  | "while-source-attached"
  | { readonly whileTapped: ObjectRef }
>;

/** What a permission over an exiled card can last (`ImpulseGrant`,
 * `GameObject.impulse`'s `expiry`), read from the side of the player it's
 * given to ("until the end of **their** next turn"). */
export type PermissionDuration = Extract<
  Duration,
  | "end-of-turn"
  | "until-your-next-turn"
  | "until-your-next-upkeep"
  | "until-end-of-your-next-turn"
  | "during-your-next-turn"
  | "until-your-next-end-step"
  | "until-end-of-combat-your-next-turn"
  | "until-next-exile"
  | "while-source"
  | "while-you-control-source"
  | "while-exiled"
>;

/** How long a damage rule lasts (`DamageRule`): the turn, until your next
 * turn, or for as long as its source stays on the battlefield (Old Fat
 * Spider Can't See Me). */
export type DamageRuleDuration = Extract<Duration, "end-of-turn" | "until-your-next-turn" | "while-source">;

/** How long a "whenever" watch lasts (`DelayedWhenever`): this turn when
 * omitted. */
export type WatchDuration = Extract<Duration, "until-your-next-turn" | "until-end-of-combat" | "permanent">;


/**
 * How long an effect lasts, as the game keeps it once it has begun:
 * `"end-of-turn"`, `"permanent"` (no end of its own), until a given player's
 * next turn begins, until an {@link UntilPoint}, for as long as a counter or
 * a source (`null` when the source had already gone as the effect would
 * begin, so the effect doesn't — rule 611.2b), until end of combat, or until
 * a card is cast.
 */
export type Expiry =
  | "end-of-turn"
  | "permanent"
  | { readonly untilTurnOf: PlayerId }
  | { readonly untilPoint: UntilPoint }
  | { readonly whileCounter: string }
  /** "This combat" / "until end of combat" (rules 500.5a, 511.2). */
  | { readonly untilEndOfCombat: true }
  | { readonly whileSource: WhileSource | null }
  /** Until that card, in that stint, is cast — `"until-source-cast"`. */
  | { readonly untilCast: UntilCast }
  /** A permission's "until you exile another card with [this]": ends when
   * that stint of the source next does (Unstable Amulet). */
  | { readonly untilNextExile: { readonly source: ObjectId; readonly stint: number } };

/** The card a `"until-source-cast"` effect waits on, in its exile stint. */
export interface UntilCast {
  readonly card: ObjectId;
  readonly stint: number;
}

/**
 * The moment an effect lasts until, when it's a point in a later turn rather
 * than that turn's beginning — a {@link PointDuration}, read for the player
 * it names as the effect begins. Each waits for an occurrence that isn't
 * skipped (rule 614.10a); one naming a player who leaves the game ends as
 * their turn would have begun (rule 800.4m).
 *
 * - `upkeep-begins`, `upkeep-ends`: that player's next upkeep (rules 500.4, 500.5).
 * - `this-upkeep-ends`: `upkeep-ends` once that upkeep has begun, so an effect
 *   made during an upkeep waits for the next one.
 * - `turn-ends`: the cleanup step of that player's next turn (rule 514.2).
 * - `end-step-begins`: that player's next end step, as it begins.
 * - `next-combat-ends`: that player's first combat after a given turn.
 * - `controllers-untap-begins`: the next untap step of whoever then controls
 *   the permanent, read then, like "doesn't untap during its controller's
 *   next untap step".
 */
export type UntilPoint =
  | { readonly point: "upkeep-begins" | "upkeep-ends" | "this-upkeep-ends" | "turn-ends" | "end-step-begins"; readonly player: PlayerId }
  /** At the end of `player`'s first combat after turn `afterTurn`, or as that
   * turn ends if it had none (Brazen Cannonade). */
  | { readonly point: "next-combat-ends"; readonly player: PlayerId; readonly afterTurn: number }
  | { readonly point: "controllers-untap-begins" };

/** The source an effect lasts "for as long as": that permanent in that
 * stint, remaining on the battlefield — and, with `tapped`, remaining tapped
 * ("for as long as ~ remains tapped"; rule 611.2b), so it ends as the source
 * untaps too. */
export interface WhileSource {
  readonly id: ObjectId;
  readonly zoneChangeCount: number;
  readonly tapped?: true;
  /** "For as long as **you control** ~": it ends as ~ stops being this
   * player's, too. */
  readonly controller?: PlayerId;
  /** "For as long as this Equipment **remains attached to it**" (Blade of
   * Shared Souls): it ends as ~ comes off this permanent, too. */
  readonly attachedTo?: ObjectId;
}

/** The moment a {@link PointDuration} ends at, for the effect's controller
 * `you`. */
export function untilPointOf(duration: PointDuration, you: PlayerId): UntilPoint {
  switch (duration) {
    case "until-your-next-upkeep":
      return { point: "upkeep-begins", player: you };
    case "until-end-of-your-next-upkeep":
      return { point: "upkeep-ends", player: you };
    case "until-end-of-your-next-turn":
      return { point: "turn-ends", player: you };
    case "until-its-controllers-next-untap-step":
      return { point: "controllers-untap-begins" };
  }
}

/**
 * A {@link PlayerDuration} as a player-side store keeps it, for an effect
 * `you` control: `{ expires }`, or `{ during }` for one that begins only with
 * that player's next turn and lasts through it. `playerOf` reads a
 * {@link DurationPlayer} as the effect resolves; `undefined` when it names
 * nobody (an illegal target, a player who has left), and the effect then
 * does nothing.
 */
export function resolvePlayerDuration(
  duration: PlayerDuration,
  you: PlayerId,
  playerOf: (ref: DurationPlayer) => PlayerId | undefined,
): { readonly expires: Expiry } | { readonly during: PlayerId } | undefined {
  switch (duration) {
    case "end-of-turn":
    case "permanent":
      return { expires: duration };
    case "until-end-of-combat":
      return { expires: { untilEndOfCombat: true } };
    case "until-your-next-turn":
      return { expires: { untilTurnOf: you } };
    case "until-end-of-your-next-turn":
    case "until-your-next-upkeep":
    case "until-end-of-your-next-upkeep":
      return { expires: { untilPoint: untilPointOf(duration, you) } };
    case "during-your-next-turn":
      return { during: you };
  }
  if ("untilTurnOf" in duration) {
    const player = playerOf(duration.untilTurnOf);
    return player === undefined ? undefined : { expires: { untilTurnOf: player } };
  }
  if ("throughTurnOf" in duration) {
    const player = playerOf(duration.throughTurnOf);
    return player === undefined ? undefined : { expires: { untilPoint: { point: "turn-ends", player } } };
  }
  const player = playerOf(duration.duringTurnOf);
  return player === undefined ? undefined : { during: player };
}

/** Whether an effect kept as `expiry` lasts only to this turn's cleanup — a
 * pump, a "this turn" rule — so it does nothing once the turn is over. */
export function endsThisTurn(expiry: Expiry): boolean {
  return expiry === "end-of-turn" || (typeof expiry === "object" && "untilEndOfCombat" in expiry);
}
