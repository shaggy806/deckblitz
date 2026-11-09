/**
 * Declaring blockers (rule 509.1).
 *
 * The largest validator in the engine, because block legality comes in two
 * layers. Per pair — may this creature block that attacker? — is
 * `combat/eligibility.ts`'s `whyCannotBlock`. Per *set* — menace counting
 * blockers, Lure asking whether a creature that could have blocked didn't —
 * is `combat/blocking.ts`'s `blockingViolations`, which cannot be answered
 * until the whole declaration is known.
 *
 * The set-level half is checked **against the offer**, built here by
 * {@link blockersOffer} and used by both `legal` and `whyCannot`. That is
 * what makes the validator unable to disagree with what was advertised, and
 * it is what lets the client run the same check with only its view: the
 * offer already carries `menaceAttackers`, `mustBlock` and `eligible`.
 */

import type { Action, BlockerDeclaration, LegalAction } from "../actions.js";
import {
  blockCompanyViolations,
  blockingViolations,
  blockTaxTotal,
  obeyingLure,
  withinBlockCompany,
  withinBlockTax,
  withinSingleBlockers,
} from "../combat/blocking.js";
import { blockTaxRates } from "../combat/tax.js";
import { ableInCompany, blockCompanyOf, hasBlockCompany } from "../combat/company.js";
import {
  blockedByAtMostOne,
  blockedOnlyByAll,
  blockRequirementsOf,
  mustBeBlockedByExactlyOne,
  blockersRequiredBy,
  creatureDef,
  currentAttackers,
  defendingPlayerOf,
  minimumBlockers,
  whyCannotBlock,
} from "../combat/eligibility.js";
import { blockLimitOf, restrictionsOf } from "../characteristics.js";
import { whyCountsInvalid } from "../combat/stack-counts.js";
import { tooManyBlockers, whyMembersInvalid } from "../combat/blocking.js";
import { blockersLeft } from "../combat/limits.js";
import { mustBlockByChoice } from "../player-control.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { defineDecision } from "./define.js";
import type { DecisionReadCtx } from "./contract.js";

function blockersOffer(
  ctx: DecisionReadCtx,
  player: PlayerId,
): Extract<LegalAction, { kind: "declare-blockers" }> {
  const attacking = currentAttackers(ctx.state).filter((id) => {
    const target = ctx.state.objects[id].attacking;
    return target !== null && defendingPlayerOf(ctx.state, target) === player;
  });
  // How many may block (rule 509.1b, `combat/limits.ts`): none of an attacker
  // that needs more than that (menace under Silent Arbiter).
  const blockMost = blockersLeft(ctx.state, ctx.registry, player);
  const blockable =
    blockMost === null ? attacking : attacking.filter((id) => minimumBlockers(ctx.state, ctx.registry, id) <= blockMost);
  const candidates = ctx.state.zones.shared.battlefield
    .filter((id) => ctx.state.objects[id].controller === player)
    .map((blocker) => {
      const copies = ctx.state.objects[blocker].stackCount ?? 1;
      const canBlock =
        blockMost === 0
          ? []
          : blockable.filter((attacker) => whyCannotBlock(ctx.state, ctx.registry, player, blocker, attacker) === null);
      const maxBlocks = Math.min(blockLimitOf(ctx.state, ctx.registry, blocker), canBlock.length);
      return {
        blocker,
        canBlock,
        ...(copies > 1 ? { copies } : {}),
        ...(maxBlocks > 1 ? { maxBlocks } : {}),
      };
    })
    .filter((entry) => entry.canBlock.length > 0);
  // Restrictions keyed to the other blockers (rule 509.1b): one with no group
  // it could block in isn't eligible at all, and no requirement reaches it
  // (509.1c).
  const blockCompany: Record<ObjectId, number> = {};
  const limited = candidates.map((entry) => ({
    id: entry.blocker,
    tokens: entry.copies ?? 1,
    company: blockCompanyOf(restrictionsOf(ctx.state, ctx.registry, entry.blocker)) ?? undefined,
  }));
  const inCompany = limited.some((u) => u.company !== undefined);
  // Attackers that can't be blocked by more than one creature (Challenger
  // Troll — rule 509.1b). A Craven Hulk's only companion can't stand beside it
  // on one of those: it's no company, and each creature dropped may have been
  // another's only companion.
  const singleBlockerAttackers = attacking.filter((id) => blockedByAtMostOne(ctx.state, ctx.registry, id));
  const single = new Set(singleBlockerAttackers);
  let eligible = candidates;
  if (inCompany) {
    for (;;) {
      const units = limited.filter((u) => eligible.some((e) => e.blocker === u.id));
      const able = ableInCompany(units, blockMost ?? undefined);
      const stays = (entry: (typeof candidates)[number]): boolean => {
        const company = units.find((u) => u.id === entry.blocker)?.company;
        return (
          able.includes(entry.blocker) &&
          (company === undefined || hasBlockCompany(entry, eligible, single, company.least))
        );
      };
      const next = eligible.filter(stays);
      if (next.length === eligible.length) break;
      eligible = next;
    }
  }
  for (const { id, company } of limited) if (company !== undefined) blockCompany[id] = company.least;
  // Menace, or "can't be blocked except by N or more creatures" (rule
  // 702.111b, 509.1b): 0 or N creatures on it.
  const leastOf = new Map(attacking.map((id) => [id, minimumBlockers(ctx.state, ctx.registry, id)]));
  const menaceAttackers = attacking.filter((id) => (leastOf.get(id) ?? 1) >= 2);
  const minBlockers: Record<ObjectId, number> = {};
  for (const id of menaceAttackers) if ((leastOf.get(id) ?? 1) > 2) minBlockers[id] = leastOf.get(id) ?? 1;
  // "Can't be blocked unless all creatures defending player controls block
  // it" (Tromokratis): only when every one of them can (`whyCannotBlock`).
  const blockedByAll = attacking.filter(
    (id) => blockedOnlyByAll(ctx.state, ctx.registry, id) && eligible.some((e) => e.canBlock.includes(id)),
  );
  // Attackers this defender's creatures are *forced* to block (Lure — rule
  // 509.1c). One with menace too is forced only in pairs; `blockingViolations`
  // works out how many blocks that comes to. One that can be blocked by only
  // one creature can have only one obey (509.1c: as many requirements as can
  // be without breaking a restriction), so it's "blocked if able" instead.
  const lured = attacking.filter((id) => restrictionsOf(ctx.state, ctx.registry, id).has("must-be-blocked"));
  const mustBlock = lured.filter((id) => !singleBlockerAttackers.includes(id));
  // Attackers that need only *one* blocker if one can manage (Anzrag), or one
  // and no more (Nacatl War-Pride), or one of certain creatures (Slayer's
  // Cleaver): the last only while one of those creatures can block it at all,
  // a requirement no block could obey asking nothing (rule 509.1c).
  const eligibleIds = eligible.map((e) => e.blocker);
  const exactlyOne = attacking.filter((id) =>
    mustBeBlockedByExactlyOne(ctx.state, ctx.registry, id),
  );
  const required = new Map(
    attacking.map((id) => [id, blockersRequiredBy(ctx.state, ctx.registry, id, eligibleIds)] as const),
  );
  const mustBeBlockedByOneOf: Record<ObjectId, readonly ObjectId[]> = {};
  for (const [attacker, wanted] of required) {
    const by = wanted
      .filter((w) => !w.all)
      .flatMap((w) => w.by)
      .filter((blocker) => eligible.find((e) => e.blocker === blocker)?.canBlock.includes(attacker) === true);
    if (by.length > 0) mustBeBlockedByOneOf[attacker] = [...new Set(by)];
  }
  const mustBeBlockedIfAble = attacking.filter(
    (id) =>
      restrictionsOf(ctx.state, ctx.registry, id).has("must-be-blocked-if-able") ||
      exactlyOne.includes(id) ||
      mustBeBlockedByOneOf[id] !== undefined ||
      (lured.includes(id) && singleBlockerAttackers.includes(id)),
  );
  // Creatures that have to block if able (provoke: that attacker), each the
  // same object it was when the requirement was made (rule 400.7), and only
  // while it's able to.
  const blockRequirements: { blocker: ObjectId; attacker?: ObjectId }[] = [];
  // "All Walls able to block this creature do so" (Marble Priest): each its own
  // requirement to block that attacker.
  for (const [attacker, wanted] of required) {
    for (const blocker of wanted.filter((w) => w.all).flatMap((w) => w.by)) {
      const entry = eligible.find((e) => e.blocker === blocker);
      if (entry?.canBlock.includes(attacker) === true) blockRequirements.push({ blocker, attacker });
    }
  }
  // "Target creature blocks this creature this combat if able" (provoke), "all
  // creatures with magnet counters on them block that creature this turn if
  // able" (Magnetic Web): each binding record, and only while it's able to.
  for (const entry of eligible) {
    for (const { attacker } of blockRequirementsOf(ctx.state, ctx.registry, entry.blocker)) {
      if (attacker === undefined) blockRequirements.push({ blocker: entry.blocker });
      else if (entry.canBlock.includes(attacker)) blockRequirements.push({ blocker: entry.blocker, attacker });
    }
  }
  // "Blocks each combat if able" (Razorgrass Screen, Grand Melee): a
  // requirement on the creature as a static or a `restrict` gives it.
  for (const entry of eligible) {
    if (blockRequirements.some((r) => r.blocker === entry.blocker && r.attacker === undefined)) continue;
    if (
      restrictionsOf(ctx.state, ctx.registry, entry.blocker).has("must-block") ||
      // "Creatures your opponents control block this turn if able" (Brutal
      // Hordechief): a rule over the turn, whatever arrived since.
      mustBlockByChoice(ctx.state, player)
    ) {
      blockRequirements.push({ blocker: entry.blocker });
    }
  }
  // Token stacks attacking as one counted object (`Game.attackingStackPart`).
  const attackerTokens: Record<ObjectId, number> = {};
  for (const id of attacking) {
    const n = ctx.state.objects[id]?.stackCount ?? 1;
    if (n > 1) attackerTokens[id] = n;
  }
  // What blocking costs (rule 509.1d). Blocking taps nothing, so the budget is
  // everything the player's sources make.
  const rates = blockTaxRates(ctx.state, ctx.registry, eligible.map((e) => e.blocker), attacking);
  return {
    kind: "declare-blockers",
    eligible,
    menaceAttackers,
    ...(Object.keys(minBlockers).length > 0 ? { minBlockers } : {}),
    ...(blockedByAll.length > 0 ? { blockedByAll } : {}),
    ...(singleBlockerAttackers.length > 0 ? { singleBlockerAttackers } : {}),
    mustBlock,
    ...(mustBeBlockedIfAble.length > 0 ? { mustBeBlockedIfAble } : {}),
    ...(Object.keys(mustBeBlockedByOneOf).length > 0 ? { mustBeBlockedByOneOf } : {}),
    ...(exactlyOne.length > 0 ? { mustBeBlockedByExactlyOne: exactlyOne } : {}),
    ...(blockRequirements.length > 0 ? { blockRequirements } : {}),
    ...(Object.keys(attackerTokens).length > 0 ? { attackerTokens } : {}),
    ...(Object.keys(blockCompany).length > 0 ? { blockCompany } : {}),
    ...(blockMost !== null ? { blockMost } : {}),
    ...(rates !== null
      ? { blockTax: { ...rates, budget: ctx.attackTaxBudget(player, []), lifeBudget: ctx.attackTaxLifeBudget(player) } }
      : {}),
  };
}

export const blockers = defineDecision({
  kind: "blockers",

  hasSource: false,

  legal: (ctx, _awaiting, player): LegalAction[] => [blockersOffer(ctx, player)],

  whyCannot: (ctx, action, player): string | null => {
    if (action.type !== "declare-blockers") {
      return `${player} is not being asked to declare blockers`;
    }
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "blockers" || awaiting.player !== player) {
      return `${player} is not being asked to declare blockers`;
    }
    const name = (id: ObjectId): string =>
      creatureDef(ctx.state, ctx.registry, id)?.name ?? id;

    // A creature that can block additional creatures is named once for each
    // attacker it blocks, each a different one, up to its limit (rule 509.1a
    // with `blockAdditional`).
    const blocking = new Map<ObjectId, ObjectId[]>();
    const once: BlockerDeclaration[] = [];
    for (const b of action.blocks) {
      const prior = blocking.get(b.blocker);
      if (prior === undefined) {
        blocking.set(b.blocker, [b.attacker]);
        once.push(b);
        continue;
      }
      const limit = blockLimitOf(ctx.state, ctx.registry, b.blocker);
      if (b.count !== undefined || (ctx.state.objects[b.blocker]?.stackCount ?? 1) > 1 || limit <= 1) {
        once.push(b);
        continue;
      }
      if (prior.includes(b.attacker)) return `${name(b.blocker)} is already blocking ${name(b.attacker)}`;
      if (prior.length >= limit) return `${name(b.blocker)} can't block more than ${limit} creatures`;
      prior.push(b.attacker);
    }
    // A token stack may be named more than once, each entry with how many of
    // it block which attacker (`combat/stack-counts.ts`); anything else only
    // once — one creature blocks one attacker.
    const badCounts = whyCountsInvalid(
      once.map((b) => ({ id: b.blocker, count: b.count })),
      (id) => ctx.state.objects[id]?.stackCount ?? 1,
      name,
      (id) => `${name(id)} is already blocking`,
    );
    if (badCounts !== null) return badCounts;
    for (const { blocker, attacker } of action.blocks) {
      const why = whyCannotBlock(ctx.state, ctx.registry, player, blocker, attacker);
      if (why !== null) return why;
    }
    // An attacking token stack has only so many tokens to block.
    const offer = blockersOffer(ctx, player);
    const badMembers = whyMembersInvalid(action.blocks, offer, (id) => ctx.state.objects[id]?.stackCount ?? 1, name);
    if (badMembers !== null) return badMembers;

    // `[0]` keeps the engine reporting one reason, in the order it always
    // has; the client shows the whole list.
    const violation = blockingViolations(action.blocks, offer)[0];
    if (tooManyBlockers(action.blocks, offer)) {
      const most = offer.blockMost ?? 0;
      return `No more than ${most === 1 ? "one creature" : `${most} creatures`} can block now`;
    }
    if (violation === undefined) {
      const short = blockCompanyViolations(action.blocks, offer)[0];
      if (short === undefined) {
        return offer.blockTax === undefined
          ? null
          : ctx.whyCannotPayBlockTax(
              player,
              blockTaxTotal(action.blocks, offer.blockTax, (id) => ctx.state.objects[id]?.stackCount ?? 1),
            );
      }
      return short.others === 1
        ? `${name(short.blocker)} can't block alone`
        : `${name(short.blocker)} can't block unless at least ${short.others} other creatures block`;
    }
    return violation.kind === "menace"
      ? violation.needs === 2
        ? `${name(violation.attacker)} has menace and must be blocked by two or more creatures`
        : `${name(violation.attacker)} can't be blocked except by ${violation.needs} or more creatures`
      : violation.kind === "blocked-by-all"
        ? `${name(violation.attacker)} can't be blocked unless all your creatures block it (${name(violation.blocker)} isn't)`
      : violation.kind === "single-blocker"
        ? `${name(violation.attacker)} can't be blocked by more than one creature`
      : violation.kind === "must-be-blocked"
        ? `${name(violation.blocker)} must block (a "must be blocked" attacker)`
      : violation.kind === "block-requirement"
        ? `${name(violation.blocker)} must block if able`
        : `${name(violation.attacker)} must be blocked if able`;
  },

  apply: (host, action): void => {
    if (action.type !== "declare-blockers") return;
    host.applyBlockerDeclarations(action.player, action.blocks);
  },

  // A bot's or a test's blocks, cut to what restrictions on company and block
  // taxes allow (a person is refused instead: the client's Confirm goes through
  // `apply`).
  ask: (controller, view, _awaiting, player): Action => {
    const blocks = controller.declareBlockers(view);
    const offer = view
      .legalActions()
      .find((o): o is Extract<LegalAction, { kind: "declare-blockers" }> => o.kind === "declare-blockers");
    return {
      type: "declare-blockers",
      player,
      blocks: offer === undefined ? blocks : withinBlockTax(withinBlockCompany(blocks, offer), offer),
    };
  },

  // candidates: deliberately absent — like `attackers`, combat is never
  // enumerated as a decision. `RandomController` and `HeuristicBotController`
  // build a `Map<blocker, attacker>` as a *policy* rather than re-deriving
  // the predicate, and re-pointing them at `blockingViolations` would mean
  // rewriting them — which would move every fuzzer seed and every
  // `bot:bench` number for no gain.

  // The policy the comment above describes, moved verbatim: it builds a
  // declaration and then drops what the set-level rules forbid, rather than
  // consulting `blockingViolations`. Deliberate — see that comment. Only a
  // Lured attacker with menace, which forces blocks in pairs, is left to
  // `obeyingLure`, which consults no randomness.
  randomAnswer: (legal, player, rng): Action => {
    const chosen = new Map<ObjectId, ObjectId>(); // blocker -> attacker
    for (const entry of legal.eligible) {
      // Lure (rule 509.1c): a creature able to block a must-be-blocked
      // attacker must block one of them; otherwise a coin flip.
      const mustOptions = entry.canBlock.filter(
        (a) => legal.mustBlock.includes(a) && !legal.menaceAttackers.includes(a),
      );
      if (mustOptions.length > 0) {
        chosen.set(entry.blocker, mustOptions[rng.pickIndex(mustOptions.length)]);
      } else if (rng.random() < 0.5) {
        chosen.set(entry.blocker, entry.canBlock[rng.pickIndex(entry.canBlock.length)]);
      }
    }
    let blocks: BlockerDeclaration[] = [...chosen].map(([blocker, attacker]) => ({
      blocker,
      attacker,
    }));
    // A menace attacker must be blocked by 0 or 2+ creatures; drop lone blocks.
    blocks = blocks.filter(
      (b) =>
        !legal.menaceAttackers.includes(b.attacker) ||
        blocks.filter((x) => x.attacker === b.attacker).length >= 2,
    );
    // And one that can't be blocked by more than one keeps its first.
    blocks = withinSingleBlockers(blocks, legal);
    return {
      type: "declare-blockers",
      player,
      blocks: withinBlockTax(withinBlockCompany(obeyingLure(blocks, legal), legal), legal),
    };
  },
});
