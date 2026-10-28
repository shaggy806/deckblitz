/**
 * Banding — rule 702.22: who may form a band, who a band's blocker blocks,
 * and who divides a creature's combat damage when banding is involved.
 *
 * Banding is two things. Attacking, creatures with banding (and up to one
 * without), or creatures sharing a quality one of which "bands with other"
 * creatures of it, may be declared as a **band** (702.22c): every
 * `AttackerDeclaration` with the same `band` number. A band attacks one
 * player, planeswalker or battle (702.22d) and is blocked as a group: a
 * creature blocking one member blocks them all (702.22h —
 * `GameObject.blockingAlso`). Then, in the combat damage step, the *other*
 * side divides the damage (702.22j-k): an attacker blocked by a creature with
 * banding has its damage divided by the defending player, and a blocker
 * blocking a creature with banding has its damage divided by the active
 * player. That second half needs no band at all — a lone Benalish Hero
 * blocking a trampler decides how much of it tramples over.
 *
 * Everything here is a read over state. `Game` writes the bands and the
 * blocks; the attackers decision validates with {@link whyBandsInvalid}; the
 * damage step asks {@link damageAssigner}.
 */

import type { CardRegistry } from "../cards.js";
import { computeCharacteristics } from "../characteristics.js";
import type { CardFilter } from "../filter.js";
import { matchesFilter } from "../filter.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import type { DamageAssignmentOffer } from "./damage.js";

/** What lets a creature lead a band: banding itself, or each "bands with
 * other [quality]" it has (rule 702.22b), the quality as a filter. */
export interface BandingAbilities {
  readonly banding: boolean;
  readonly bandsWithOther: readonly CardFilter[];
}

export function bandingAbilitiesOf(state: GameState, registry: CardRegistry, id: ObjectId): BandingAbilities {
  const c = computeCharacteristics(state, registry, id);
  return { banding: c.keywords.has("banding"), bandsWithOther: c.bandsWithOther };
}

/** Whether `id` is a creature of `quality`, from its controller's view. */
function isOfQuality(state: GameState, registry: CardRegistry, id: ObjectId, quality: CardFilter): boolean {
  const controller = state.objects[id]?.controller;
  if (controller === undefined) return false;
  return matchesFilter(state, registry, id, quality, { you: controller, source: id });
}

/**
 * Whether these creatures may be one band (rule 702.22c): one or more with
 * banding and at most one without (that one even if it has "bands with
 * other"), or every one of them of some quality, one of which bands with
 * other creatures of that quality. Each listed id is one creature; a token
 * stack's entry is listed once per token.
 */
export function mayBand(state: GameState, registry: CardRegistry, members: readonly ObjectId[]): boolean {
  if (members.length < 2) return true;
  const abilities = new Map<ObjectId, BandingAbilities>();
  const of = (id: ObjectId): BandingAbilities => {
    let a = abilities.get(id);
    if (a === undefined) {
      a = bandingAbilitiesOf(state, registry, id);
      abilities.set(id, a);
    }
    return a;
  };
  const without = members.filter((id) => !of(id).banding).length;
  if (without < members.length && without <= 1) return true;
  // "Bands with other [quality]": some member's quality that every member
  // (itself included) has.
  for (const id of new Set(members)) {
    for (const quality of of(id).bandsWithOther) {
      if (members.every((m) => isOfQuality(state, registry, m, quality))) return true;
    }
  }
  return false;
}

/** One attack declaration entry, as far as banding goes. */
export interface BandEntry {
  readonly attacker: ObjectId;
  readonly defender: PlayerId | ObjectId;
  readonly count?: number;
  readonly band?: number;
}

/**
 * Why the declaration's bands can't be formed, or `null`. `tokensIn` is how
 * many tokens an object stands for; a stack in a band has to wake into one
 * creature per token (each its own band member), so it may hold no more
 * than `wakeCap`.
 */
export function whyBandsInvalid(
  state: GameState,
  registry: CardRegistry,
  entries: readonly BandEntry[],
  tokensIn: (id: ObjectId) => number,
  wakeCap: number,
  nameOf: (id: ObjectId) => string,
): string | null {
  const bands = new Map<number, BandEntry[]>();
  for (const entry of entries) {
    if (entry.band === undefined) continue;
    if (!Number.isInteger(entry.band)) return `${entry.band} is not a band number`;
    const list = bands.get(entry.band) ?? [];
    list.push(entry);
    bands.set(entry.band, list);
  }
  for (const list of bands.values()) {
    // Rule 702.22d: one player, planeswalker or battle for the whole band.
    if (list.some((e) => e.defender !== list[0].defender)) {
      return `a band must attack one player, planeswalker or battle (${list.map((e) => nameOf(e.attacker)).join(", ")})`;
    }
    const members: ObjectId[] = [];
    for (const e of list) {
      const n = e.count ?? tokensIn(e.attacker);
      if (n > wakeCap) return `${nameOf(e.attacker)}: a band can hold at most ${wakeCap} of one token stack`;
      for (let i = 0; i < n; i += 1) members.push(e.attacker);
    }
    if (!mayBand(state, registry, members)) {
      return `${list.map((e) => nameOf(e.attacker)).join(", ")} can't attack as a band: it needs creatures with banding and at most one without, or creatures of a quality one of them bands with (rule 702.22c)`;
    }
  }
  return null;
}

/** The other attacking creatures in `id`'s band — "creatures banded with
 * it" (rule 702.22). Empty when it's in no band. */
export function bandMatesOf(state: GameState, id: ObjectId): ObjectId[] {
  const band = state.objects[id]?.band;
  if (band === undefined) return [];
  return state.zones.shared.battlefield.filter((other) => {
    const o = state.objects[other];
    return other !== id && o?.band === band && o.attacking !== null;
  });
}

/** Every attacker `blockerId` blocks that is still attacking and still
 * blocked by it: the one it was declared blocking and the rest of that
 * attacker's band (rule 702.22h). An attacker removed from combat leaves it
 * blocking nothing there (506.4), though it stays a blocking creature. */
export function blockedAttackersOf(state: GameState, blockerId: ObjectId): ObjectId[] {
  const blocker = state.objects[blockerId];
  if (blocker === undefined || blocker.blocking === null) return [];
  return [blocker.blocking, ...(blocker.blockingAlso ?? [])].filter((id) => {
    const attacker = state.objects[id];
    return attacker?.zone === "battlefield" && attacker.attacking !== null && attacker.blockedBy.includes(blockerId);
  });
}

/** Whether `creatures` (all on one side of a block) carry banding into the
 * damage step (rules 702.22j-k): one with banding, or a creature of some
 * quality that bands with other creatures of it and another of that quality.
 * Read as the damage is assigned, so a creature that lost banding since its
 * band formed no longer hands the division over (702.22e is the band, not
 * this). Returns that creature's controller, who divides the damage. */
function bandingController(
  state: GameState,
  registry: CardRegistry,
  creatures: readonly ObjectId[],
): PlayerId | null {
  for (const id of creatures) {
    const { banding, bandsWithOther } = bandingAbilitiesOf(state, registry, id);
    if (banding) return state.objects[id].controller;
    for (const quality of bandsWithOther) {
      if (
        isOfQuality(state, registry, id, quality) &&
        creatures.some((other) => other !== id && isOfQuality(state, registry, other, quality))
      ) {
        return state.objects[id].controller;
      }
    }
  }
  return null;
}

/**
 * Who divides `dealerId`'s combat damage among `recipients` — the creatures
 * blocking it if it's an attacker, the attackers it blocks if it's a
 * blocker. Its controller (rules 510.1c-d), unless the recipients carry
 * banding: then their controller does (702.22j for an attacker, 702.22k for
 * a blocker).
 */
export function damageAssigner(
  state: GameState,
  registry: CardRegistry,
  dealerId: ObjectId,
  recipients: readonly ObjectId[],
): PlayerId {
  const own = state.objects[dealerId].controller;
  const other = bandingController(state, registry, recipients);
  return other !== null && other !== own ? other : own;
}

/**
 * The division the side *receiving* the damage would make — banding's
 * answer (rules 702.22j-k), when the player dividing it doesn't control the
 * creature dealing it: as few of the recipients destroyed as possible. Each
 * takes up to one less than its lethal (an indestructible one any amount);
 * whatever doesn't fit goes on the one that can take most, so at most one
 * dies. Every point stays on a recipient, which is always legal: nothing
 * has to trample over.
 */
export function opposedAssignment(offer: DamageAssignmentOffer): number[] {
  const { power, lethal } = offer;
  const amounts = lethal.map(() => 0);
  if (lethal.length === 0) return amounts;
  const sturdy = lethal.findIndex((_, i) => offer.indestructible?.[i] === true);
  if (sturdy >= 0) {
    amounts[sturdy] = power;
    return amounts;
  }
  let remaining = power;
  for (let i = 0; i < lethal.length && remaining > 0; i += 1) {
    const take = Math.min(remaining, Math.max(0, lethal[i] - 1));
    amounts[i] = take;
    remaining -= take;
  }
  if (remaining > 0) {
    let most = 0;
    for (let i = 1; i < lethal.length; i += 1) if (lethal[i] > lethal[most]) most = i;
    amounts[most] += remaining;
  }
  return amounts;
}
