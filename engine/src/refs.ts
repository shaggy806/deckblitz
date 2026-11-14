/**
 * References — one way to name an object or a player a card refers to. See
 * `docs/plans/need-key-themes.md`, theme 7's design note (step 7).
 *
 * Types only: both are resolved over the resolution context in `effects.ts`
 * (`objectRefAct`, `objectRefRead`, `resolvePlayerRef`).
 *
 * A reference is either **read** or **acted on**, because the rules treat the
 * two differently:
 * - a read takes the object's current information if it's in the public zone
 *   it was expected to be in, and otherwise its last known information (rules
 *   608.2h, 113.7a);
 * - an action needs it to be the same object still (rule 400.7), and an
 *   illegal target slot names nothing (rule 608.2b).
 */

import type { ObjectSetRef } from "./object-sets.js";

/**
 * One object.
 *
 * - a number: the object in that target slot.
 * - `"source"`: the spell or ability's source. Not a target.
 * - `"trigger-object"`: the object behind the trigger. Not a target.
 * - `"attached"`: what the source is attached to, in the stint the resolution
 *   recorded; a Curse's host is a player. Not a target.
 * - `"chosen"`: the permanent chosen for the source (rule 607.2d).
 * - `"granter"`: the permanent whose static granted this ability (rule 201.5a).
 * - `"trigger-recipient"`: what the triggering event was aimed at — the
 *   permanent or player dealt damage, or the one an attacker is attacking.
 * - `"created"` / `"put-this-way"` / `"amassed"`: what an earlier step of this
 *   resolution made, put onto the battlefield, or amassed (rule 701.47a).
 * - `"priced"`: the spell, or the source of the ability, whose cost is being
 *   worked out (rules 601.2f, 602.2b): only a cost modifier's amount reads it.
 * - any `ObjectSetRef`: **the** one member of that set ("the sacrificed
 *   creature", "the tapped creature"), nothing with none or several.
 * - `{ hostOf }`: what that object is attached to — "the creature that
 *   Equipment was attached to" (Unforge), read through its last known
 *   information if it has left. A player host is that player.
 * - `{ pairedWith }`: the creature it's paired with (rule 702.95b).
 */
export type ObjectRef =
  | number
  | "source"
  | "trigger-object"
  | "attached"
  | "chosen"
  | "granter"
  | "trigger-recipient"
  | "created"
  | "put-this-way"
  | "amassed"
  | "priced"
  | ObjectSetRef
  | { readonly hostOf: ObjectRef }
  | { readonly pairedWith: ObjectRef };

/**
 * One player. Naming nobody — an empty or illegal slot (rule 608.2b), a player
 * who has left the game — the effect does nothing.
 *
 * - `"you"`: the effect's controller.
 * - `"active-player"`: whoever's turn it is.
 * - `"trigger-controller"`: the player behind the event — who drew the card,
 *   who cast the spell (still them once it's been countered), who last
 *   controlled the permanent. An event with no object has one too, which is
 *   why this isn't `{ controllerOf: "trigger-object" }`. Not a target.
 * - `"trigger-player"`: the player the triggering event names — the player
 *   dealt damage, the defending player of an attack. Not a target.
 * - `"that-player"`: "that player" of an `each-player-may`'s follow-up, or a
 *   `for-each-player`'s body; elsewhere the same as `"trigger-player"`.
 * - `"chosen-player"`: the player chosen for the source (Black Vise), as the
 *   source last existed if it has left (rule 608.2h).
 * - `"player-to-your-left"` / `"player-to-your-right"`: the next player in
 *   turn order from the controller, or the one before (rule 101.4). In a
 *   two-player game the other player is both.
 * - `{ target }`: the player in that slot.
 * - `{ controllerOf }`: its controller, as it last was if it has left (a
 *   countered spell's controller there, Counterbore's ruling). A card with no
 *   controller is read as its owner (rules 108.4a, 109.4). Not a target.
 * - `{ ownerOf }`: its owner, which never changes (rule 108.3), so it's known
 *   wherever the object is. Not a target.
 * - `{ defendingPlayerOf }`: the player it's attacking, the controller of the
 *   planeswalker it's attacking, or the protector of the battle it's attacking;
 *   no longer attacking, the same as it was before it was removed from combat
 *   (rules 508.5, 310.9d).
 */
export type PlayerRef =
  | "you"
  | "active-player"
  | "trigger-controller"
  | "trigger-player"
  | "that-player"
  | "chosen-player"
  /** Of the two players chosen as the source entered (`chosenPlayer`,
   * `otherChosenPlayer`), the one that isn't the trigger's player — Sower of
   * Discord's "the other chosen player". Nobody when that player isn't one
   * of them. */
  | "other-chosen-player"
  /** The player the source (a Curse) is attached to, as it last existed if
   * it has left (rule 608.2h) — Curse of Misfortunes' "put it onto the
   * battlefield attached to **that player**" at the beginning of *your*
   * upkeep. Nobody when it enchants no player. */
  | "enchanted-player"
  | "player-to-your-left"
  | "player-to-your-right"
  | { readonly target: number }
  | { readonly controllerOf: ObjectRef }
  | { readonly ownerOf: ObjectRef }
  | { readonly defendingPlayerOf: ObjectRef }
  /** The player who helped pay for that spell through assist (rule
   * 702.132a) — Yume, Chronicler of Valor's "you and **that player** each
   * draw a card". Nobody when nobody did. */
  | { readonly assistantOf: ObjectRef };
