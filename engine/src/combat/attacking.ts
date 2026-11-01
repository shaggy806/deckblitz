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
    const defender = options.find((d) => attackIsFree(offer, d)) ?? options[0];
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
  | { readonly kind: "fewer-requirements"; readonly obeyed: number; readonly possible: number };

/** One eligible attacker, as far as company and requirements care. `free`: it
 * has a defender it needn't pay to attack (508.1d doesn't oblige paying). */
export interface AttackUnit extends CompanyUnit {
  readonly required: boolean;
  readonly free: boolean;
}

/** The units of `offer` (which has `company`). */
function attackUnits(offer: AttackOffer): AttackUnit[] {
  const company = offer.company;
  return offer.eligible.map((id) => ({
    id,
    tokens: company?.tokens[id] ?? 1,
    ...(company?.limits[id] !== undefined ? { company: company.limits[id] } : {}),
    required: company?.required.includes(id) === true,
    free: (offer.defendersFor[id] ?? []).some((d) => taxOn(offer, d) === 0),
  }));
}

/** The most requirements (creatures that must attack, each token one) a
 * declaration of `size` can obey, or `null` if none of that size is legal. */
function obeyedAtSize(units: readonly AttackUnit[], size: number): number | null {
  if (tokensFitting(units, size) < size) return null;
  const required = units.reduce((n, u) => n + (u.required && fitsCompany(u.company, size) ? u.tokens : 0), 0);
  return Math.min(size, required);
}

/** The most requirements any legal declaration of `units` obeys, paying
 * nothing (rule 508.1d). */
export function mostRequirementsObeyed(units: readonly AttackUnit[]): number {
  const free = units.filter((u) => u.free);
  const total = free.reduce((n, u) => n + u.tokens, 0);
  let best = 0;
  for (let size = 1; size <= total; size += 1) best = Math.max(best, obeyedAtSize(free, size) ?? 0);
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
  const required = declared.filter((d) => company.required.includes(d.attacker));
  const obeyed = attackersDeclared(required, company.tokens);
  const possible = mostRequirementsObeyed(attackUnits(offer));
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
  const possible = mostRequirementsObeyed(attackUnits(offer));
  let best: { size: number; adding: number; kept: number } | null = possible === 0 ? { size: 0, adding: 0, kept: 0 } : null;
  for (let size = 1; size <= total; size += 1) {
    if ((obeyedAtSize(units, size) ?? -1) < possible) continue;
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
  const place = (attacker: ObjectId, defender: PlayerId | ObjectId, tokens: number, whole: number): void => {
    const n = Math.min(room, tokens);
    if (n <= 0) return;
    room -= n;
    out.push(n === whole ? { attacker, defender } : { attacker, defender, count: n });
  };
  const fitting = units.filter((u) => fitsCompany(u.company, size));
  const sendAsDeclared = (u: AttackUnit): void => {
    for (const d of declared) {
      if (d.attacker === u.id) place(d.attacker, d.defender, d.count ?? u.tokens, u.tokens);
    }
  };
  const freeDefender = (u: AttackUnit): PlayerId | ObjectId | undefined =>
    (offer.defendersFor[u.id] ?? []).find((d) => taxOn(offer, d) === 0);
  // Those that must attack, first; then what was declared; then whoever can.
  for (const u of fitting.filter((v) => v.required)) {
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

/** The generic mana one creature attacking `defender` costs under `offer`'s attack tax. */
function taxOn(offer: AttackOffer, defender: string): number {
  return offer.attackTax?.perCreature[defender] ?? 0;
}

/** The life one creature attacking `defender` costs under `offer`'s attack tax. */
function lifeTaxOn(offer: AttackOffer, defender: string): number {
  return offer.attackTax?.lifePerCreature?.[defender] ?? 0;
}

/** Whether attacking `defender` costs nothing at all under `offer`. */
function attackIsFree(offer: AttackOffer, defender: string): boolean {
  return taxOn(offer, defender) === 0 && lifeTaxOn(offer, defender) === 0;
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
  const costOf = (d: AttackerDeclaration): number => taxOn(offer, d.defender) * tokensOf(d);
  const lifeOf = (d: AttackerDeclaration): number => lifeTaxOn(offer, d.defender) * tokensOf(d);
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
        ? (offer.defendersFor[d.attacker] ?? []).find((x) => attackIsFree(offer, x))
        : undefined;
      if (free !== undefined) out[i] = { ...d, defender: free };
      else out.splice(i, 1);
    }
  }
  return out;
}
