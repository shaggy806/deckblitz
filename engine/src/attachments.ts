/**
 * Attachments: what an `attach` or `unattach` moves, and where to. See
 * `docs/plans/need-key-themes.md`, theme 14's design note (step 7).
 *
 * Types and pure reads only. The effect is applied in `effects.ts`
 * (`applyAttach`), and whether something may go somewhere is `Game`'s
 * (`attachmentKind`, `canEnchant`, `canEquip`).
 */

import type { CardFilter } from "./filter.js";
import type { ChooserRef } from "./effects.js";
import type { ObjectRef, PlayerRef } from "./refs.js";
import type { TargetRef } from "./target.js";

/** Every permanent matching `all`, a group that moves together: "attach all
 * Equipment you control to it", "the Auras and Equipment that were attached
 * to it" (an `inSet: { attachmentsOf }` clause). A token stack is woken, each
 * token its own attachment. */
export interface AttachAll {
  readonly all: CardFilter;
}

/** The permanents matching `choose`, picked as this resolves and not
 * targeted (rule 608.2c). `upTo`: at most that many ("you may attach an
 * Equipment" is `upTo: 1`). `min`: at least that many while there are as many
 * (default 0). Absent, any number. */
export interface AttachChoice {
  readonly choose: CardFilter;
  readonly prompt: string;
  readonly upTo?: number;
  readonly min?: number;
}

/** Engine-built: what's attached, settled already, carried past a choice
 * that rebinds slot 0. Never authored. */
export interface AttachResolved {
  readonly resolved: readonly TargetRef[];
}

/**
 * What an `attach` moves, or an `unattach` takes off:
 *
 * - absent on an `attach`: this permanent (an equip ability), not once it has
 *   left and come back as a new object (rule 400.7);
 * - an `ObjectRef`: that one object;
 * - `{ all }`, `{ choose }`: see {@link AttachAll} and {@link AttachChoice}.
 */
export type AttachmentsRef = ObjectRef | AttachAll | AttachChoice | AttachResolved;

/** A host picked as this resolves, not targeted (rule 608.2c), among the
 * permanents matching `among` that everything being attached could legally go
 * on (rules 301.5, 301.6, 303.4j, 701.3a). Exactly one, or with `optional`
 * none ("you may attach it"). With none possible, nothing moves.
 *
 * `another`: not the one it's on already. `chooser`: who picks, the effect's
 * controller when absent ("that player attaches this Aura to a land of their
 * choice"); `among` is read from their side. */
export interface AttachHostChoice {
  readonly among: CardFilter;
  readonly prompt: string;
  readonly optional?: true;
  readonly another?: true;
  readonly chooser?: ChooserRef;
}

/** Engine-built: the host, settled already, carried past a choice that
 * rebinds slot 0. Never authored. */
export interface AttachHostResolved {
  readonly resolved: TargetRef;
}

/** Where an `attach` puts it: an object, a player (a Curse, rule 303.4), or a
 * host chosen as it resolves. */
export type AttachTarget = ObjectRef | { readonly player: PlayerRef } | AttachHostChoice | AttachHostResolved;

export function isAttachAll(ref: unknown): ref is AttachAll {
  return typeof ref === "object" && ref !== null && "all" in ref;
}

export function isAttachChoice(ref: unknown): ref is AttachChoice {
  return typeof ref === "object" && ref !== null && "choose" in ref;
}

export function isAttachResolved(ref: unknown): ref is AttachResolved {
  return typeof ref === "object" && ref !== null && "resolved" in ref && Array.isArray(ref.resolved);
}

export function isHostChoice(ref: unknown): ref is AttachHostChoice {
  return typeof ref === "object" && ref !== null && "among" in ref;
}

export function isHostResolved(ref: unknown): ref is AttachHostResolved {
  return typeof ref === "object" && ref !== null && "resolved" in ref && !Array.isArray(ref.resolved);
}
