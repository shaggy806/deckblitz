/**
 * Declaring attackers (rule 508.1).
 *
 * One of the two kinds whose validator carries real rules rather than a
 * shape check — every declared attacker is run through
 * `combat/eligibility.ts`'s `whyCannotAttack`, and then through its attack
 * requirements (goad, encore, an attack-requirement rule), the rules that
 * constrain *which* defender rather than whether the creature may attack at
 * all. Then the declaration as a whole: every creature that must attack if
 * able is in it (`combat/attacking.ts`).
 *
 * The offer and the validator go through the same pair of functions, which is
 * an invariant worth stating: `defendersForAttacker` enumerates exactly what
 * `whyCannotAttack` + `attackRequirementsForbid` will accept. Enumerating
 * without goad is what let the fuzzer propose declarations `dispatch` then
 * refused.
 */

import type { Action, LegalAction } from "../actions.js";
import { restrictionsOf } from "../characteristics.js";
import {
  attackCompanyViolations,
  attackingViolations,
  mostRequirementsObeyed,
  withinAttackCompany,
  withinAttackTax,
  withRequiredAttackers,
} from "../combat/attacking.js";
import type { AttackOffer, AttackUnit } from "../combat/attacking.js";
import { ableInCompany, attackCompanyOf } from "../combat/company.js";
import type { CombatCompany } from "../combat/company.js";
import {
  attackRequirementsForbid,
  attackRequirementsReason,
  creatureDef,
  defendersForAttacker,
  legalDefenders,
  mustAttack,
  whyCannotAttack,
} from "../combat/eligibility.js";
import { creatureAttackTax, creatureAttackTaxes } from "../combat/tax.js";
import { bandingAbilitiesOf, whyBandsInvalid } from "../combat/banding.js";
import type { BandingAbilities } from "../combat/banding.js";
import { declaredTokens, MAX_MATERIALIZED, whyCountsInvalid } from "../combat/stack-counts.js";
import { attackChooser } from "../player-control.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { defineDecision } from "./define.js";
import type { DecisionReadCtx } from "./contract.js";

/** Whether `attacker` attacking `defender` costs nothing at all (rule 508.1d:
 * a creature that must attack isn't obliged to pay to). */
function attackIsFree(ctx: DecisionReadCtx, attacker: ObjectId, defender: PlayerId | ObjectId): boolean {
  const { generic, life } = ctx.attackTaxOf(defender);
  if (generic !== 0 || life !== 0) return false;
  const own = creatureAttackTax(ctx.state, ctx.registry, attacker, defender);
  return own.generic === 0 && own.life === 0;
}

/**
 * "You choose which creatures attack this turn" (Master Warcraft) splits the
 * declaration in two (its ruling): `naming`, its chooser names the group, every
 * defender left for the second step; `sending`, the active player sends that
 * group. Neither, for an ordinary declaration.
 */
function declarationStep(ctx: DecisionReadCtx, player: PlayerId): { naming: boolean; sending?: readonly ObjectId[] } {
  const awaiting = ctx.state.awaiting;
  const sending = awaiting?.kind === "attackers" ? awaiting.group : undefined;
  if (sending !== undefined) return { naming: false, sending };
  return { naming: attackChooser(ctx.state, player) !== null };
}

function attackersOffer(ctx: DecisionReadCtx, player: PlayerId): AttackOffer {
  const { naming, sending } = declarationStep(ctx, player);
  const defenders = legalDefenders(ctx.state, ctx.registry, player);
  const defendersFor: Record<ObjectId, readonly (PlayerId | ObjectId)[]> = {};
  for (const id of ctx.state.zones.shared.battlefield) {
    if (sending !== undefined && !sending.includes(id)) continue;
    if (naming && ctx.state.attackChoiceRefused?.includes(id) === true) continue;
    const legal = defendersForAttacker(ctx.state, ctx.registry, player, id);
    if (legal.length > 0) defendersFor[id] = legal;
  }
  // Restrictions keyed to the other attackers (rule 508.1c): one with no group
  // it could attack in isn't eligible at all.
  const limits: Record<ObjectId, CombatCompany> = {};
  const tokensOf = (id: ObjectId): number => ctx.state.objects[id]?.stackCount ?? 1;
  for (const id of Object.keys(defendersFor) as ObjectId[]) {
    const limit = attackCompanyOf(restrictionsOf(ctx.state, ctx.registry, id));
    if (limit !== null) limits[id] = limit;
  }
  const inCompany = Object.keys(limits).length > 0;
  if (inCompany) {
    const units = (Object.keys(defendersFor) as ObjectId[]).map((id) => ({
      id,
      tokens: tokensOf(id),
      ...(limits[id] !== undefined ? { company: limits[id] } : {}),
    }));
    const able = ableInCompany(units);
    for (const { id } of units) if (!able.includes(id)) delete defendersFor[id];
  }
  const eligible = Object.keys(defendersFor) as ObjectId[];
  const perCreature: Record<string, number> = {};
  const lifePerCreature: Record<string, number> = {};
  for (const d of defenders) {
    const { generic, life } = ctx.attackTaxOf(d);
    if (generic > 0) perCreature[d] = generic;
    if (life > 0) lifePerCreature[d] = life;
  }
  // What a creature costs on its own (Brainwash, Nils), on top of those.
  const perAttacker = creatureAttackTaxes(ctx.state, ctx.registry, defendersFor);
  const creatureTaxed = Object.keys(perAttacker).length > 0;
  const lifeTaxed =
    Object.keys(lifePerCreature).length > 0 ||
    Object.values(perAttacker).some((rates) => Object.values(rates).some((cost) => cost.life > 0));
  const taxed = lifeTaxed || creatureTaxed || Object.keys(perCreature).length > 0;
  // Who can lead a band (rule 702.22c): banding, or a "bands with other".
  const banding: Record<ObjectId, BandingAbilities> = {};
  for (const id of eligible) {
    const abilities = bandingAbilitiesOf(ctx.state, ctx.registry, id);
    if (abilities.banding || abilities.bandsWithOther.length > 0) banding[id] = abilities;
  }
  const tokens: Record<ObjectId, number> = {};
  for (const id of eligible) {
    const n = ctx.state.objects[id]?.stackCount;
    if (n !== undefined && n > 1) tokens[id] = n;
  }
  // Able to attack is being eligible: a legal defender to be sent at — and
  // a creature that could only attack someone who taxes it
  // isn't required to: paying a cost to attack is never obligatory (rule
  // 508.1d).
  const required = eligible.filter(
    (id) =>
      (sending !== undefined || mustAttack(ctx.state, ctx.registry, id)) &&
      (defendersFor[id] ?? []).some((d) => attackIsFree(ctx, id, d)),
  );
  // Under a restriction keyed to the others, only those in every declaration
  // obeying the most requirements are simply "must attack" (508.1d): one that
  // would break a restriction beside the others isn't.
  const units: AttackUnit[] = inCompany
    ? eligible.map((id) => ({
        id,
        tokens: tokensOf(id),
        ...(limits[id] !== undefined ? { company: limits[id] } : {}),
        required: required.includes(id),
        free: (defendersFor[id] ?? []).some((d) => attackIsFree(ctx, id, d)),
      }))
    : [];
  const most = mostRequirementsObeyed(units);
  const stacks: Record<ObjectId, number> = {};
  for (const id of [...eligible, ...(Object.keys(limits) as ObjectId[])]) {
    if (tokensOf(id) > 1) stacks[id] = tokensOf(id);
  }
  // Naming the group is no choice of defender, nor of paying or banding: those
  // are the second step's. One defender a creature, so nothing asks.
  const named: Record<ObjectId, readonly (PlayerId | ObjectId)[]> = {};
  if (naming) for (const id of eligible) named[id] = (defendersFor[id] ?? []).slice(0, 1);
  return {
    kind: "declare-attackers",
    // The union across every attacker. NOT the list for any one of them —
    // `defendersFor` is that, per creature, and picking from the union builds
    // a declaration this module's own validator rejects.
    defenders: naming ? [...new Set(Object.values(named).flat())] : defenders,
    defendersFor: naming ? named : defendersFor,
    eligible,
    mustAttack: inCompany
      ? required.filter((id) => mostRequirementsObeyed(units.filter((u) => u.id !== id)) < most)
      : required,
    ...(inCompany ? { company: { limits, tokens: stacks, required } } : {}),
    ...(taxed && !naming
      ? {
          attackTax: {
            perCreature,
            ...(creatureTaxed ? { perAttacker } : {}),
            budget: ctx.attackTaxBudget(player, eligible),
            ...(lifeTaxed ? { lifePerCreature, lifeBudget: ctx.attackTaxLifeBudget(player) } : {}),
            ...(Object.keys(tokens).length > 0 ? { tokens } : {}),
          },
        }
      : {}),
    ...(Object.keys(banding).length > 0 && !naming ? { banding } : {}),
  };
}

const nameOf = (ctx: DecisionReadCtx, id: ObjectId): string => creatureDef(ctx.state, ctx.registry, id)?.name ?? id;

export const attackers = defineDecision({
  kind: "attackers",

  // The rules ask for attackers; no card is behind the prompt.
  hasSource: false,

  legal: (ctx, _awaiting, player): LegalAction[] => [attackersOffer(ctx, player)],

  whyCannot: (ctx, action, player): string | null => {
    if (action.type !== "declare-attackers") {
      return `${player} is not being asked to declare attackers`;
    }
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "attackers" || awaiting.player !== player) {
      return `${player} is not being asked to declare attackers`;
    }
    // A token stack may be named more than once, each entry with how many of
    // it go where (`combat/stack-counts.ts`); anything else only once.
    const tokensIn = (id: ObjectId): number => ctx.state.objects[id]?.stackCount ?? 1;
    const entries = action.attackers.map((d) => ({ id: d.attacker, count: d.count }));
    const badCounts = whyCountsInvalid(
      entries,
      tokensIn,
      (id) => nameOf(ctx, id),
      (id) => `${id} was declared as an attacker twice`,
    );
    if (badCounts !== null) return badCounts;
    const declared = declaredTokens(entries, tokensIn);
    const { naming, sending } = declarationStep(ctx, player);
    for (const { attacker, defender, band } of action.attackers) {
      if (sending !== undefined && !sending.includes(attacker)) {
        return `${nameOf(ctx, attacker)} wasn't chosen to attack`;
      }
      if (naming && ctx.state.attackChoiceRefused?.includes(attacker) === true) {
        return `${nameOf(ctx, attacker)}'s controller won't pay for it to attack`;
      }
      if (naming && band !== undefined) return "bands are the active player's to declare";
      const why = whyCannotAttack(ctx.state, ctx.registry, player, attacker, defender);
      if (why !== null) return why;
      // Rule 508.1d — as many of its requirements obeyed as can be: goad's
      // "attacks a player other than you if able" (701.15b), encore's
      // "attacks that opponent if able". One that can't be obeyed (only the
      // goader left to attack) rules nothing out.
      if (attackRequirementsForbid(ctx.state, ctx.registry, player, attacker, defender)) {
        return attackRequirementsReason(ctx.state, ctx.registry, attacker);
      }
    }
    // A restriction keyed to the other attackers (rules 508.1c, 508.1d) needs
    // the whole declaration against the whole offer. Not otherwise, as below.
    const inCompany = ctx.state.zones.shared.battlefield.some(
      (id) =>
        ctx.state.objects[id]?.controller === player &&
        attackCompanyOf(restrictionsOf(ctx.state, ctx.registry, id)) !== null,
    );
    if (inCompany) {
      const offer = attackersOffer(ctx, player);
      const left = attackingViolations(action.attackers, offer)[0];
      if (left !== undefined) return `${nameOf(ctx, left.attacker)} must attack if able`;
      const broken = attackCompanyViolations(action.attackers, offer)[0];
      if (broken !== undefined) {
        return broken.kind === "attacks-alone"
          ? `${nameOf(ctx, broken.attacker)} can only attack alone`
          : broken.kind === "fewer-requirements"
            ? `Only ${broken.obeyed} of the ${broken.possible} attackers that must attack if able would`
            : broken.others === 1
              ? `${nameOf(ctx, broken.attacker)} can't attack alone`
              : `${nameOf(ctx, broken.attacker)} can't attack unless at least ${broken.others} other creatures attack`;
      }
    }
    // Rule 508.1d: every creature that must attack and can is declared. The
    // offer's `mustAttack` asked only of the ones left out, rather than
    // building the whole offer again (`attackingViolations` is that check
    // against the offer, for the client). A token stack that must attack
    // attacks whole: a count holding some of it back leaves those out.
    const missing = inCompany ? [] : ctx.state.zones.shared.battlefield.filter(
      (id) =>
        (declared.get(id) ?? 0) < tokensIn(id) &&
        ctx.state.objects[id]?.controller === player &&
        (sending?.includes(id) === true || mustAttack(ctx.state, ctx.registry, id)) &&
        // Not one it could attack only by paying for it (rule 508.1d).
        defendersForAttacker(ctx.state, ctx.registry, player, id).some((d) => attackIsFree(ctx, id, d)),
    );
    if (missing.length > 0) {
      return `${missing.map((id) => nameOf(ctx, id)).join(", ")} must attack if able`;
    }
    // Rule 702.22c-d: each band is one a band may be, at one defender.
    const badBands = whyBandsInvalid(ctx.state, ctx.registry, action.attackers, tokensIn, MAX_MATERIALIZED, (id) =>
      nameOf(ctx, id),
    );
    if (badBands !== null) return badBands;
    // The second step pays, once it's been said who goes where.
    return naming ? null : ctx.whyCannotPayAttackTax(player, action.attackers);
  },

  apply: (host, action): void => {
    if (action.type !== "declare-attackers") return;
    host.applyAttackerDeclarations(action.player, action.attackers);
  },

  // A controller that leaves out a creature that must attack — a bot's
  // policy, a test's scripted player — has it sent at the first defender it
  // may attack. A person is asked instead: the client won't confirm without
  // it.
  ask: (controller, view, _awaiting, player): Action => {
    const offer = view.legalActions().find((o): o is AttackOffer => o.kind === "declare-attackers");
    // A group someone else named: a bot's plan may have others in mind.
    const declared = controller
      .declareAttackers(view)
      .filter((d) => view.state.awaiting?.kind !== "attackers" || view.state.awaiting.group?.includes(d.attacker) !== false);
    return {
      type: "declare-attackers",
      player,
      attackers: offer === undefined ? declared : withRequiredAttackers(declared, offer),
    };
  },

  /** Attacking is optional (rule 508.1a), so declaring nothing is the safe
   * answer for a seat skipping its own windows — unless something must
   * attack. A creature with only one defender it may attack is sent there;
   * one with a choice of defender is the seat's to make, so nothing is
   * answered for it. */
  autoAnswer: (_awaiting, player, legal): Action | null => {
    const offer = legal.find((o): o is AttackOffer => o.kind === "declare-attackers");
    const required = offer?.mustAttack ?? [];
    // With a restriction keyed to the others, who goes with a creature that
    // must attack is the seat's to say.
    if ((offer?.company?.required.length ?? 0) > 0) return null;
    if (offer === undefined || required.some((id) => (offer.defendersFor[id] ?? []).length !== 1)) {
      return required.length === 0 ? { type: "declare-attackers", player, attackers: [] } : null;
    }
    return { type: "declare-attackers", player, attackers: withRequiredAttackers([], offer) };
  },

  // candidates: deliberately absent from `decisionCandidates`. Combat is not
  // enumerated as a decision at all — the searching bots build an attack one
  // attacker/defender pair at a time in `bot/combat-math.ts` and
  // `bot/eval-bot.ts`, because the subsets of a wide board are a
  // combinatorial trap and the useful cuts are structural rather than
  // arbitrary.

  randomAnswer: (legal, player, rng): Action => ({
    type: "declare-attackers",
    player,
    // The `filter` runs to completion before the `flatMap` starts, so every
    // eligible creature's coin flip is drawn before any defender is picked.
    // Fusing the two into one pass would interleave those draws and re-point
    // every seed, which is why this stays two passes. A creature that must
    // attack still draws its flip, and attacks whatever it came up.
    // Then cut to what its attack tax surely pays (Ghostly Prison), then to
    // what its restrictions on company allow (Mogg Flunkies) — no draws, so
    // a game without either replays exactly as before.
    attackers: withinAttackCompany(
      withinAttackTax(
        legal.eligible
          .filter((attacker) => rng.random() < 0.6 || legal.mustAttack.includes(attacker))
          .flatMap((attacker) => {
            // Per-attacker, not the union: a goaded creature may not be
            // sent at its goader while anyone else is available.
            const options = legal.defendersFor[attacker] ?? [];
            if (options.length === 0) return [];
            return [{ attacker, defender: options[rng.pickIndex(options.length)] }];
          }),
        legal,
      ),
      legal,
    ),
  }),
});
