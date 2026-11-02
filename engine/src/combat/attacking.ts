/**
 * The attack-declaration rule that constrains a *set* of attackers rather
 * than any single one: a creature that must attack if able (rule 508.1d —
 * "attacks each combat if able", goad, encore) has to be in the declaration.
 *
 * Every other attack check asks "may this creature attack that defender?"
 * and is answered per pair by `eligibility.ts`, which also narrows *which*
 * defenders a goaded or encore creature may be sent at. Whether a required
 * attacker was left out can only be answered once the whole declaration is
 * known.
 *
 * **Checked against the offer, not the board**, as `blocking.ts` is: the
 * `declare-attackers` `LegalAction`'s `mustAttack` and `defendersFor` were
 * computed when attackers were asked for, so the engine's validator and the
 * client's Confirm button run the same check and can't disagree.
 */

import type { AttackerDeclaration, LegalAction } from "../actions.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { fitsCompany, tokensFitting } from "./company.js";
import type { CompanyUnit } from "./company.js";
import type { AttackCaps } from "./limits.js";

/** The `declare-attackers` offer, which is all these checks need. */
export type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

/** `attacker` must attack if able, could have, and wasn't declared. */
export type AttackingViolation = { readonly kind: "must-attack"; readonly attacker: ObjectId };

/** Every rule of this kind `declared` breaks — all of them, so a client can
 * name every creature still to be sent somewhere. */
export function attackingViolations(
  declared: readonly AttackerDeclaration[],
  offer: AttackOffer,
): AttackingViolation[] {
  const attacking = new Set(declared.map((d) => d.attacker));
  return offer.mustAttack
    .filter((id) => !attacking.has(id))
    .map((attacker) => ({ kind: "must-attack", attacker }));
}

/**
 * `declared`, with every creature that must attack and was left out sent at
 * the first defender it may attack. For a driver that doesn't make the
 * choice itself — a bot, a test's scripted player, a seat skipping its own
 * decisions. The client asks the player instead.
 */
export function withRequiredAttackers(
  declared: readonly AttackerDeclaration[],
  offer: AttackOffer,
): AttackerDeclaration[] {
  const out = [...declared];
  for (const { attacker } of attackingViolations(declared, offer)) {
    // A defender that costs nothing to attack first: the requirement never
    // obliges paying a cost (rule 508.1d).
    const options = offer.defendersFor[attacker] ?? [];
    const defender = options.find((d) => attackIsFree(offer, attacker, d)) ?? options[0];
    if (defender !== undefined) out.push({ attacker, defender });
  }
  return withinAttackCompany(withinAttackTax(out, offer), offer);
}

/** A rule keyed to the other attackers (`combat/company.ts`) a declaration
 * breaks. The client's Confirm doesn't ask yet: the engine's refusal says it. */
export type AttackCompanyViolation =
  /** `attacker` can only attack alone, and doesn't. */
  | { readonly kind: "attacks-alone"; readonly attacker: ObjectId }
  /** `attacker` needs at least `others` other attackers, and hasn't them. */
  | { readonly kind: "needs-company"; readonly attacker: ObjectId; readonly others: number }
  /** Fewer requirements obeyed than could be without disobeying a restriction
   * (rule 508.1d): `obeyed` of `possible` creatures that must attack. */
  | { readonly kind: "fewer-requirements"; readonly obeyed: number; readonly possible: number }
  /** More attackers than "no more than `most` creatures can attack" allows
   * (`combat/limits.ts`), or, with `defender`, more on that defender. */
  | { readonly kind: "too-many"; readonly most: number; readonly defender?: string };

/** One eligible attacker, as far as company, caps and requirements care.
 * `free`: it has a defender it needn't pay to attack (508.1d doesn't oblige
 * paying), and `freeDefenders` are those; `defenders`, all it may attack. */
export interface AttackUnit extends CompanyUnit {
  readonly required: boolean;
  readonly free: boolean;
  readonly defenders: readonly string[];
  readonly freeDefenders: readonly string[];
}

/** The units of `offer` (which has `company`). */
function attackUnits(offer: AttackOffer): AttackUnit[] {
  const company = offer.company;
  return offer.eligible.map((id) => {
    const defenders = offer.defendersFor[id] ?? [];
    const freeDefenders = defenders.filter((d) => taxOn(offer, id, d) === 0);
    return {
      id,
      tokens: company?.tokens[id] ?? 1,
      ...(company?.limits[id] !== undefined ? { company: company.limits[id] } : {}),
      required: company?.required.includes(id) === true,
      free: freeDefenders.length > 0,
      defenders,
      freeDefenders,
    };
  });
}

/**
 * The most tokens of `units` that can attack at once with no defender past its
 * cap (a matching: a creature with a choice of defender makes room for one with
 * none), and who's where: each capped defender's seats, by index into `units`.
 * A defender with no cap has room for anyone, so isn't in `seats`.
 */
function seatAttackers(
  units: readonly Pick<AttackUnit, "tokens" | "defenders">[],
  caps: Readonly<Record<string, number>>,
): { readonly seated: number; readonly seats: ReadonlyMap<string, number[]> } {
  const seats = new Map<string, number[]>();
  const seatOne = (unit: number, tried: Set<string>): boolean => {
    for (const defender of units[unit].defenders) {
      if (tried.has(defender)) continue;
      tried.add(defender);
      const cap = caps[defender];
      if (cap === undefined) return true;
      const here = seats.get(defender) ?? [];
      seats.set(defender, here);
      if (here.length < cap) {
        here.push(unit);
        return true;
      }
      for (let i = 0; i < here.length; i += 1) {
        if (seatOne(here[i], tried)) {
          here[i] = unit;
          return true;
        }
      }
    }
    return false;
  };
  let seated = 0;
  units.forEach((unit, index) => {
    // Anyone with an uncapped defender goes there, every token of it.
    if (unit.defenders.some((d) => caps[d] === undefined)) {
      seated += unit.tokens;
      return;
    }
    for (let token = 0; token < unit.tokens; token += 1) {
      if (!seatOne(index, new Set())) break;
      seated += 1;
    }
  });
  return { seated, seats };
}

/** The most requirements (creatures that must attack, each token one) a
 * declaration of `size` can obey under `caps`, or `null` if none of that size is
 * legal. */
function obeyedAtSize(units: readonly AttackUnit[], size: number, caps?: AttackCaps): number | null {
  if (tokensFitting(units, size) < size || size > (caps?.most ?? Infinity)) return null;
  const fitting = units.filter((u) => fitsCompany(u.company, size));
  const perDefender = caps?.perDefender;
  if (perDefender !== undefined && seatAttackers(fitting, perDefender).seated < size) return null;
  const must = fitting.filter((u) => u.required);
  const required = perDefender !== undefined ? seatAttackers(must, perDefender).seated : must.reduce((n, u) => n + u.tokens, 0);
  return Math.min(size, required);
}

/** The most requirements any legal declaration of `units` obeys under `caps`,
 * paying nothing (rule 508.1d). */
export function mostRequirementsObeyed(units: readonly AttackUnit[], caps?: AttackCaps): number {
  const free = units.filter((u) => u.free).map((u) => ({ ...u, defenders: u.freeDefenders }));
  const total = free.reduce((n, u) => n + u.tokens, 0);
  let best = 0;
  for (let size = 1; size <= Math.min(total, caps?.most ?? Infinity); size += 1) {
    best = Math.max(best, obeyedAtSize(free, size, caps) ?? 0);
  }
  return best;
}

/** How many creatures `declared` sends: each token of a stack is one. */
function attackersDeclared(declared: readonly AttackerDeclaration[], tokens: Readonly<Record<ObjectId, number>>): number {
  return declared.reduce((n, d) => n + (d.count ?? tokens[d.attacker] ?? 1), 0);
}

/** Every rule keyed to the other attackers `declared` breaks. None without
 * the offer's `company`. */
export function attackCompanyViolations(
  declared: readonly AttackerDeclaration[],
  offer: AttackOffer,
): AttackCompanyViolation[] {
  const company = offer.company;
  if (company === undefined) return [];
  const out: AttackCompanyViolation[] = [];
  const size = attackersDeclared(declared, company.tokens);
  for (const attacker of new Set(declared.map((d) => d.attacker))) {
    const limit = company.limits[attacker];
    if (limit === undefined) continue;
    if (size - 1 < limit.least) out.push({ kind: "needs-company", attacker, others: limit.least });
    else if (!fitsCompany(limit, size)) out.push({ kind: "attacks-alone", attacker });
  }
  const caps = company.caps;
  if (caps?.most !== undefined && size > caps.most) out.push({ kind: "too-many", most: caps.most });
  for (const [defender, most] of Object.entries(caps?.perDefender ?? {})) {
    if (attackersDeclared(declared.filter((d) => d.defender === defender), company.tokens) > most) {
      out.push({ kind: "too-many", most, defender });
    }
  }
  const required = declared.filter((d) => company.required.includes(d.attacker));
  const obeyed = attackersDeclared(required, company.tokens);
  const possible = mostRequirementsObeyed(attackUnits(offer), caps);
  if (obeyed < possible) out.push({ kind: "fewer-requirements", obeyed, possible });
  return out;
}

/**
 * `declared` made legal under the offer's `company`, for a driver that doesn't
 * weigh it: a bot, the fuzzer's random player, a skipped window. Unchanged when
 * it already is. Otherwise, of the sizes obeying the most requirements, the one
 * adding the fewest creatures and then keeping the most of `declared`: a lone
 * Mogg Flunkies stays home rather than bringing a friend, unless it has to
 * attack. Deterministic, so it moves no fuzzer seed.
 */
export function withinAttackCompany(
  declared: readonly AttackerDeclaration[],
  offer: AttackOffer,
): AttackerDeclaration[] {
  const company = offer.company;
  if (company === undefined || attackCompanyViolations(declared, offer).length === 0) return [...declared];
  const named = new Set(declared.map((d) => d.attacker));
  // What's declared counts as it is, taxed or not; nothing taxed is added.
  const units = attackUnits(offer).filter((u) => u.free || named.has(u.id));
  const total = units.reduce((n, u) => n + u.tokens, 0);
  const caps = company.caps;
  const possible = mostRequirementsObeyed(attackUnits(offer), caps);
  let best: { size: number; adding: number; kept: number } | null = possible === 0 ? { size: 0, adding: 0, kept: 0 } : null;
  for (let size = 1; size <= Math.min(total, caps?.most ?? Infinity); size += 1) {
    if ((obeyedAtSize(units, size, caps) ?? -1) < possible) continue;
    const fit = declared.filter((d) => fitsCompany(company.limits[d.attacker], size));
    const kept = Math.min(size, attackersDeclared(fit, company.tokens));
    const adding = size - kept;
    if (best === null || adding < best.adding || (adding === best.adding && kept >= best.kept)) {
      best = { size, adding, kept };
    }
  }
  if (best === null || best.size === 0) return [];
  const { size } = best;
  const out: AttackerDeclaration[] = [];
  let room = size;
  // Room left on each capped defender. What's kept from one that's full goes at
  // another it may attack free, if any has room, and otherwise stays home.
  const perDefender = caps?.perDefender;
  const left = new Map(Object.entries(perDefender ?? {}));
  const place = (attacker: ObjectId, defender: PlayerId | ObjectId, tokens: number, whole: number): void => {
    let wanted = Math.min(room, tokens);
    const elsewhere = (offer.defendersFor[attacker] ?? []).filter((d) => d !== defender && taxOn(offer, attacker, d) === 0);
    for (const at of [defender, ...elsewhere]) {
      const n = Math.min(wanted, left.get(at) ?? Infinity);
      if (n <= 0) continue;
      if (left.has(at)) left.set(at, (left.get(at) ?? 0) - n);
      wanted -= n;
      room -= n;
      out.push(n === whole ? { attacker, defender: at } : { attacker, defender: at, count: n });
      if (wanted === 0) return;
    }
  };
  const fitting = units.filter((u) => fitsCompany(u.company, size));
  // With caps, those that must attack go where a matching has room for the most
  // of them: their seats first, spoken for before anyone's declaration is read.
  if (perDefender !== undefined) {
    const must = fitting.filter((u) => u.required).map((u) => ({ ...u, defenders: u.freeDefenders }));
    const { seats } = seatAttackers(must, perDefender);
    const seatedTokens = new Map<ObjectId, number>();
    for (const [defender, here] of seats) {
      for (const index of new Set(here)) {
        const u = must[index];
        const n = here.filter((i) => i === index).length;
        seatedTokens.set(u.id, (seatedTokens.get(u.id) ?? 0) + n);
        place(u.id, defender as PlayerId | ObjectId, n, u.tokens);
      }
    }
    // Who has an uncapped defender wasn't seated: there, every token of it.
    for (const u of must) {
      if (seatedTokens.has(u.id)) continue;
      const defender = u.defenders.find((d) => perDefender[d] === undefined);
      if (defender !== undefined) place(u.id, defender as PlayerId | ObjectId, u.tokens, u.tokens);
    }
  }
  const placedAlready = new Set(perDefender !== undefined ? out.map((d) => d.attacker) : []);
  const sendAsDeclared = (u: AttackUnit): void => {
    for (const d of declared) {
      if (d.attacker === u.id) place(d.attacker, d.defender, d.count ?? u.tokens, u.tokens);
    }
  };
  const freeDefender = (u: AttackUnit): PlayerId | ObjectId | undefined =>
    (offer.defendersFor[u.id] ?? []).find((d) => taxOn(offer, u.id, d) === 0 && (left.get(d) ?? Infinity) > 0) ??
    (offer.defendersFor[u.id] ?? []).find((d) => taxOn(offer, u.id, d) === 0);
  // Those that must attack, first; then what was declared; then whoever can.
  for (const u of fitting.filter((v) => v.required && !placedAlready.has(v.id))) {
    if (named.has(u.id)) {
      sendAsDeclared(u);
    } else {
      const defender = freeDefender(u);
      if (defender !== undefined) place(u.id, defender, u.tokens, u.tokens);
    }
  }
  for (const u of fitting.filter((v) => !v.required && named.has(v.id))) sendAsDeclared(u);
  for (const u of fitting.filter((v) => !v.required && !named.has(v.id))) {
    const defender = freeDefender(u);
    if (defender !== undefined) place(u.id, defender, u.tokens, u.tokens);
  }
  return out;
}

/** The generic mana `attacker` attacking `defender` costs under `offer`'s attack tax. */
function taxOn(offer: AttackOffer, attacker: ObjectId, defender: string): number {
  const tax = offer.attackTax;
  return (tax?.perCreature[defender] ?? 0) + (tax?.perAttacker?.[attacker]?.[defender]?.generic ?? 0);
}

/** The life `attacker` attacking `defender` costs under `offer`'s attack tax. */
function lifeTaxOn(offer: AttackOffer, attacker: ObjectId, defender: string): number {
  const tax = offer.attackTax;
  return (tax?.lifePerCreature?.[defender] ?? 0) + (tax?.perAttacker?.[attacker]?.[defender]?.life ?? 0);
}

/** Whether `attacker` attacking `defender` costs nothing at all under `offer`. */
function attackIsFree(offer: AttackOffer, attacker: ObjectId, defender: string): boolean {
  return taxOn(offer, attacker, defender) === 0 && lifeTaxOn(offer, attacker, defender) === 0;
}

/**
 * `declared`, cut down to what its attack tax budget surely pays (Ghostly
 * Prison — see `AttackOffer.attackTax`): taxed entries are dropped from the
 * end until the rest fits, in mana and in life, the life stopping short of
 * the attacker's last point (paying it is legal, and never what such a driver
 * should do by accident). A creature that must attack is kept if it can be
 * sent somewhere untaxed instead, and otherwise dropped — the requirement
 * never obliges paying (rule 508.1d). For a driver that doesn't weigh the
 * cost itself: a bot, the fuzzer's random player, a skipped window.
 */
export function withinAttackTax(
  declared: readonly AttackerDeclaration[],
  offer: AttackOffer,
): AttackerDeclaration[] {
  const tax = offer.attackTax;
  if (tax === undefined) return [...declared];
  const tokensOf = (d: AttackerDeclaration): number => d.count ?? tax.tokens?.[d.attacker] ?? 1;
  const costOf = (d: AttackerDeclaration): number => taxOn(offer, d.attacker, d.defender) * tokensOf(d);
  const lifeOf = (d: AttackerDeclaration): number => lifeTaxOn(offer, d.attacker, d.defender) * tokensOf(d);
  const lifeLimit = Math.max(0, (tax.lifeBudget ?? 0) - 1);
  const out = [...declared];
  let total = out.reduce((n, d) => n + costOf(d), 0);
  let life = out.reduce((n, d) => n + lifeOf(d), 0);
  // The optional attackers first, latest declared first.
  for (const required of [false, true]) {
    for (let i = out.length - 1; i >= 0 && (total > tax.budget || life > lifeLimit); i -= 1) {
      const d = out[i];
      // Only one paying for what's over: a creature costing life stays when
      // only the mana is short.
      const helps = (total > tax.budget && costOf(d) > 0) || (life > lifeLimit && lifeOf(d) > 0);
      if (!helps || offer.mustAttack.includes(d.attacker) !== required) continue;
      total -= costOf(d);
      life -= lifeOf(d);
      const free = required
        ? (offer.defendersFor[d.attacker] ?? []).find((x) => attackIsFree(offer, d.attacker, x))
        : undefined;
      if (free !== undefined) out[i] = { ...d, defender: free };
      else out.splice(i, 1);
    }
  }
  return out;
}
