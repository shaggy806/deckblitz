/**
 * Object sets — one way to name a set of objects a card refers to ("the
 * sacrificed creatures", "the cards exiled with it", "those creatures", "the
 * creatures exiled this way") and how each one was then. See
 * `docs/plans/need-key-themes.md`, theme 1's design note (step 5).
 *
 * Pure: the types, the one writer of the sets a stack object keeps
 * (`addToSet`), and the source-relative sets a static ability can read
 * without a resolution (`staticSetMembers`). The sets only a resolution knows
 * — what it did this way, what its cost took, its trigger's batch, what a
 * delayed trigger remembered — are resolved by `ResolutionContext.objectSet`.
 */

import type { PlayerScope, ThisWayKind } from "./effects.js";
import type { ObjectRef } from "./refs.js";
import type { CardFilter } from "./filter.js";
import type { ObjectId } from "./primitives.js";
import type { GameState, LastKnownInfo } from "./state.js";

/**
 * One object of a set, the journal entry's spelling (step 3): plain data.
 *
 * `stint` is the object's `zoneChangeCount` **where the set found it** — on
 * the battlefield for a permanent sacrificed, tapped, attacking, entering or
 * dealing damage; in the graveyard for a card discarded or put there; in the
 * hand for one revealed; in exile for one exiled. An effect acts on it only
 * while it's still in that stint (rules 400.7, 603.7c). A read of it takes it
 * as it is while it is, and otherwise as it was (608.2h): `was` when the set
 * holds a snapshot (a card revealed from a hand has no last-known information
 * of its own), else its last-known information for that stint.
 *
 * `count` is how many permanents it stood for — a token stack that went
 * whole is every token in it (engine/CLAUDE.md). Default 1.
 */
export interface SetMember {
  readonly object: ObjectId;
  readonly stint: number;
  readonly count?: number;
  readonly was?: LastKnownInfo;
  /** Shown to everyone in a hidden zone (a card revealed this way, or
   * revealed for a cost): what it is can be read there too. Any other member
   * in a library or a hand is unknown to a read (rule 701.17c's public-zone
   * reading). */
  readonly shown?: true;
}

/** What a spell's or ability's cost can take (rules 601.2h, 602.2b): the
 * objects `{ paid }` names. `"unattached"` is the Equipment an "unattach an
 * Equipment" cost moved (rule 701.3d — Captain America's "that Equipment's
 * mana value"). `"exiled-self"` is the card a graveyard ability's own "exile
 * this card from your graveyard" took, kept as it last was there (the card
 * you exiled, rule 702.97a; Dodgy Jalopy's ruling). */
export type PaidKind = "sacrificed" | "discarded" | "exiled" | "exiled-self" | "revealed" | "tapped" | "unattached";

/**
 * A set of objects, by where it comes from:
 *
 * - `{ thisWay, who?, byOwner? }` — what the resolution under way did
 *   (this-way.ts), whose as the `thisWay` amount says: "the creatures exiled
 *   this way", "the tokens created this way" (`"created"`).
 * - `{ paid }` — the objects the spell's or ability's cost took, recorded as
 *   each is paid ("the sacrificed creatures", "the exiled card", "the
 *   revealed card", "the tapped creature"); `"sacrificed"` also takes what a
 *   `sacrifice-source` step earlier in the same resolution sacrificed.
 * - `"exiled-with-source"` — rule 607.2a / 406.6 linked exile: the cards
 *   exiled with the source in the stint the ability refers to (or exiled
 *   until it leaves, 610.3), only the source's own printed pairs (607.1).
 * - `"trigger-batch"` — "those creatures", "them", "one of them": the
 *   objects of the batch a "one or more" trigger fired on, each in the stint
 *   it was in then.
 * - `{ attachmentsOf }` — the Auras and Equipment attached to that object,
 *   as it last existed once it has left (608.2h): Wyleth's "attached to it",
 *   Mark of Eviction's "all Auras attached to that creature".
 * - `{ targetsOf }` — the objects that object targets, a spell's: Storm,
 *   Windrider's "those creatures" of "a spell that targets one or more
 *   creatures". Its player targets aren't objects, and aren't in it.
 * - `{ targets }` — the objects in these target slots (an empty or illegal
 *   slot names nothing).
 * - `{ remembered }` — a set a delayed or reflexive trigger captured as it
 *   was made (`remember`).
 */
export type ObjectSetRef =
  | { readonly thisWay: ThisWayKind; readonly who?: PlayerScope | "each"; readonly byOwner?: true }
  | { readonly paid: PaidKind }
  | "exiled-with-source"
  | "trigger-batch"
  | { readonly attachmentsOf: ObjectRef }
  | { readonly targetsOf: ObjectRef }
  | { readonly targets: readonly number[] }
  | { readonly remembered: string };

/** A set captured into a delayed or reflexive trigger as it's made — its
 * members, the ones matching `filter` (read as they are then) when given:
 * Song of Blood's "each creature card put into your graveyard this way". */
export interface RememberSpec {
  readonly set: ObjectSetRef;
  readonly filter?: CardFilter;
}

/** The sets a stack object keeps (`LastKnownRefs.sets`): plain arrays, as
 * game state must be. */
export interface ObjectSets {
  readonly paid?: { readonly [K in PaidKind]?: readonly SetMember[] };
  readonly batch?: readonly SetMember[];
  readonly remembered?: { readonly [name: string]: readonly SetMember[] };
}

/** Whether `value` is an `ObjectSetRef` rather than a slot, a string ref of
 * another kind or a filter object. */
export function isObjectSetRef(value: unknown): value is ObjectSetRef {
  if (value === "exiled-with-source" || value === "trigger-batch") return true;
  if (typeof value !== "object" || value === null) return false;
  return "thisWay" in value || "paid" in value || "targets" in value || "remembered" in value || "attachmentsOf" in value || "targetsOf" in value;
}

/** Whether a set's members are cards rather than permanents: everything but
 * a trigger's batch, what's attached to the source and a target group —
 * what a `create-token-copy` copies as the card it is. */
export function isCardSet(ref: ObjectSetRef): boolean {
  return ref !== "trigger-batch" && !(typeof ref === "object" && ("targets" in ref || "attachmentsOf" in ref || "targetsOf" in ref));
}

/** `sets` with `members` appended to one of its sets — the one writer, so a
 * cost paid in two parts adds rather than overwrites. */
export function addToSet(
  sets: ObjectSets | undefined,
  where: { readonly paid: PaidKind } | "batch" | { readonly remembered: string },
  members: readonly SetMember[],
): ObjectSets {
  const base = sets ?? {};
  if (where === "batch") return { ...base, batch: [...(base.batch ?? []), ...members] };
  if ("paid" in where) {
    const paid = base.paid ?? {};
    return { ...base, paid: { ...paid, [where.paid]: [...(paid[where.paid] ?? []), ...members] } };
  }
  const remembered = base.remembered ?? {};
  return { ...base, remembered: { ...remembered, [where.remembered]: [...(remembered[where.remembered] ?? []), ...members] } };
}

/** The members a stack object's sets hold for `ref`, for the kinds kept
 * there (`paid`, the trigger batch, remembered); `undefined` for the others,
 * which are read off the game. */
export function storedSetMembers(sets: ObjectSets | undefined, ref: ObjectSetRef): readonly SetMember[] | undefined {
  if (ref === "trigger-batch") return sets?.batch ?? [];
  if (typeof ref !== "object") return undefined;
  if ("paid" in ref) return sets?.paid?.[ref.paid] ?? [];
  if ("remembered" in ref) return sets?.remembered?.[ref.remembered] ?? [];
  return undefined;
}

/** Every member a stack object's sets hold, of every kind. */
export function setMembersAll(sets: ObjectSets): SetMember[] {
  const out: SetMember[] = [];
  for (const members of Object.values(sets.paid ?? {})) if (members !== undefined) out.push(...members);
  if (sets.batch !== undefined) out.push(...sets.batch);
  for (const members of Object.values(sets.remembered ?? {})) out.push(...members);
  return out;
}

/** The one object of a set, for "**the** sacrificed creature", "**the**
 * exiled card": `undefined` with none or several. */
export function onlyMember(members: readonly SetMember[]): SetMember | undefined {
  return members.length === 1 ? members[0] : undefined;
}

/** A member's weight in a count or sum: how many permanents it stood for. */
export function memberCount(member: SetMember): number {
  return member.count ?? 1;
}

/**
 * The source-relative sets a static ability can read with no resolution
 * under way — a CDA's "the number of cards exiled with it" (rule 604.3: in
 * every zone), a condition's "as long as an Equipment is attached to it":
 *
 * - `"exiled-with-source"`: the cards in exile linked to `source`'s current
 *   battlefield stint (rule 607.2a);
 * - `{ attachmentsOf: "source" }`: the permanents attached to `source` now.
 *
 * Every other set is a resolution's and names nothing here.
 */
export function staticSetMembers(state: GameState, ref: ObjectSetRef, source: ObjectId | undefined): readonly SetMember[] {
  if (source === undefined) return [];
  const object = state.objects[source];
  if (object === undefined) return [];
  if (ref === "exiled-with-source") {
    if (object.zone !== "battlefield") return [];
    const stint = object.zoneChangeCount ?? 0;
    const out: SetMember[] = [];
    for (const id of state.zones.shared.exile) {
      const card = state.objects[id];
      const linked = (link: { readonly source: ObjectId; readonly zoneChangeCount: number } | undefined): boolean =>
        link !== undefined && link.source === source && link.zoneChangeCount === stint;
      if (card !== undefined && (linked(card.exiledWith) || linked(card.exiledUntil))) {
        out.push({ object: id, stint: card.zoneChangeCount ?? 0 });
      }
    }
    return out;
  }
  if (typeof ref === "object" && "attachmentsOf" in ref && ref.attachmentsOf === "source") {
    if (object.zone !== "battlefield") return [];
    const out: SetMember[] = [];
    for (const id of state.zones.shared.battlefield) {
      const other = state.objects[id];
      if (other?.attachedTo === source) out.push({ object: id, stint: other.zoneChangeCount ?? 0, count: other.stackCount ?? 1 });
    }
    return out;
  }
  return [];
}
