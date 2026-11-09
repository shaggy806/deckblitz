/**
 * Restrictions keyed to the other creatures in combat: "can't attack or block
 * alone" (Mogg Flunkies), "can only attack alone" (Master of Cruelties, Errantry),
 * "can't attack unless at least two other creatures attack" (Orcish Conscripts).
 * Rules 508.1c and 509.1b: each is a restriction on the whole declaration, read
 * as it's made and never again (the rulings: a creature whose companions leave
 * combat stays in it; a creature put onto the battlefield attacking doesn't count).
 *
 * The creatures counted are those one player declares, whatever each attacks
 * or blocks (the rulings), a token of a stack being a creature of its own.
 * The per-kind checks are `combat/attacking.ts`'s and `combat/blocking.ts`'s,
 * against their offers. This is what they share.
 */

import type { CombatWord } from "./rules.js";
import type { ObjectId } from "../primitives.js";

/** How many *other* creatures a creature may be declared beside. */
export interface CombatCompany {
  /** At least this many others. */
  readonly least: number;
  /** At most this many others: 0 is "alone". Absent: any number. */
  readonly most?: number;
}

/** What `restrictions` ask of a creature's fellow attackers. `null`: nothing. */
export function attackCompanyOf(restrictions: ReadonlySet<CombatWord>): CombatCompany | null {
  const least = restrictions.has("cant-attack-unless-two-others")
    ? 2
    : restrictions.has("cant-attack-alone")
      ? 1
      : 0;
  if (restrictions.has("can-only-attack-alone")) return { least, most: 0 };
  return least > 0 ? { least } : null;
}

/** What `restrictions` ask of a creature's fellow blockers. `null`: nothing. */
export function blockCompanyOf(restrictions: ReadonlySet<CombatWord>): CombatCompany | null {
  const least = restrictions.has("cant-block-unless-two-others") ? 2 : restrictions.has("cant-block-alone") ? 1 : 0;
  return least > 0 ? { least } : null;
}

/** Whether a creature with `company` may be one of `size` declared together. */
export function fitsCompany(company: CombatCompany | undefined, size: number): boolean {
  return size - 1 >= (company?.least ?? 0) && size - 1 <= (company?.most ?? Infinity);
}

/** One creature, or a token stack, that could be declared. */
export interface CompanyUnit {
  readonly id: ObjectId;
  readonly tokens: number;
  readonly company?: CombatCompany;
}

/** The tokens among `units` able to be one of `size` declared together. */
export function tokensFitting(units: readonly CompanyUnit[], size: number): number {
  return units.reduce((n, u) => n + (fitsCompany(u.company, size) ? u.tokens : 0), 0);
}

/** One creature, or a token stack, as a blocker its fellows could stand beside. */
export interface BlockerSeat {
  readonly blocker: ObjectId;
  readonly copies?: number;
  readonly canBlock: readonly ObjectId[];
}

/**
 * Whether `entry` could block with `least` other creatures blocking beside it,
 * out of `all` (the attackers `single` hold one creature each): the creatures
 * who could stand beside it on something. A creature that can only block the
 * attacker it would be alone on is no company (rule 509.1b).
 */
export function hasBlockCompany(
  entry: BlockerSeat,
  all: readonly BlockerSeat[],
  single: ReadonlySet<ObjectId>,
  least: number,
): boolean {
  // Its own other tokens are company too.
  const others = all.flatMap((e) =>
    e.blocker !== entry.blocker
      ? [e]
      : (e.copies ?? 1) > 1
        ? [{ ...e, copies: (e.copies ?? 1) - 1 }]
        : [],
  );
  return entry.canBlock.some((attacker) => {
    let beside = 0;
    const taken = new Set<ObjectId>(single.has(attacker) ? [attacker] : []);
    for (const other of others) {
      if (other.canBlock.some((a) => !single.has(a))) {
        beside += other.copies ?? 1;
        continue;
      }
      // Only attackers holding one: one token each, an attacker apiece.
      for (let token = 0; token < (other.copies ?? 1); token += 1) {
        const seat = other.canBlock.find((a) => !taken.has(a));
        if (seat === undefined) break;
        taken.add(seat);
        beside += 1;
      }
    }
    return beside >= least;
  });
}

/**
 * Those of `units` that can be declared at all: each in some group of a size
 * that everyone in it allows. A lone Mogg Flunkies can't, nor two Orcish
 * Conscripts with nothing else to go with them, so neither is offered, and no
 * requirement to attack or block reaches it (rule 508.1d, 509.1c: "without
 * disobeying any restrictions").
 */
export function ableInCompany(units: readonly CompanyUnit[], most?: number): ObjectId[] {
  // No group past "no more than N creatures can attack" (`combat/limits.ts`).
  const total = Math.min(most ?? Infinity, units.reduce((n, u) => n + u.tokens, 0));
  const able = new Set<ObjectId>();
  for (let size = 1; size <= total; size += 1) {
    if (tokensFitting(units, size) < size) continue;
    for (const u of units) if (fitsCompany(u.company, size)) able.add(u.id);
  }
  return units.filter((u) => able.has(u.id)).map((u) => u.id);
}
