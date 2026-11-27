/**
 * "Can't attack unless a creature with greater power also attacks" and "can't
 * block unless a creature with greater power also blocks" (Okk): restrictions
 * on the whole declaration (rules 508.1c, 509.1b), `combat/company.ts`'s
 * `joinedBy` — the creatures with greater power its controller could declare
 * beside it, read as the declaration is made. They reach the offers (an Okk
 * with none isn't eligible), the validator, the requirements (508.1d) and the
 * fix-ups the bots and the fuzzer go through.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { attackCompanyViolations, withinAttackCompany } from "../combat/attacking.js";
import { blockCompanyViolations, withinBlockCompany } from "../combat/blocking.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, blockOffer, spawn, table, toStep } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

const attackOffer = (game: Game): AttackOffer | undefined => {
  toStep(game, "declare-attackers");
  return game.legalActions(A).find((o): o is AttackOffer => o.kind === "declare-attackers");
};
const atBob = (...ids: readonly ObjectId[]): { attacker: ObjectId; defender: PlayerId }[] =>
  ids.map((attacker) => ({ attacker, defender: B }));
const attackWhy = (game: Game, ...ids: readonly ObjectId[]): string | null =>
  game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(...ids) });
const ids = (declared: readonly { attacker: ObjectId }[]): ObjectId[] => declared.map((d) => d.attacker).sort();

describe("Okk: can't attack unless a creature with greater power also attacks", () => {
  it("isn't offered beside only creatures with power no greater than its own", () => {
    const { game } = table();
    spawn(game, "Okk"); // 4/4
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Okk"); // equal power isn't greater
    const offer = attackOffer(game);
    expect(offer?.eligible).toEqual([bears]);
    expect(offer?.eligible).not.toContain(other);
  });

  it("attacks beside a creature with greater power, whatever else attacks; not beside a smaller one", () => {
    const { game, a } = table();
    const okk = spawn(game, "Okk");
    const dragon = spawn(game, "Shivan Dragon"); // 5/5
    const bears = spawn(game, "Grizzly Bears");
    const offer = attackOffer(game);
    expect([...(offer?.eligible ?? [])].sort()).toEqual([okk, dragon, bears].sort());
    expect(attackWhy(game, okk)).toMatch(/greater power/);
    expect(attackWhy(game, okk, bears)).toMatch(/greater power/);
    expect(attackWhy(game, okk, dragon)).toBeNull();
    expect(attackWhy(game, okk, dragon, bears)).toBeNull();
    if (offer === undefined) throw new Error("offered");
    expect(attackCompanyViolations(atBob(okk, bears), offer)).toEqual([
      { kind: "needs-companion", attacker: okk, companion: "greater-power" },
    ]);
    // A driver's fix-up keeps Okk home rather than bring the Dragon.
    expect(ids(withinAttackCompany(atBob(okk, bears), offer))).toEqual([bears]);
    a.declareAttackersFn = () => atBob(okk, dragon);
    toStep(game, "postcombat-main");
    expect(game.state.players[B].life).toBe(20 - 4 - 5);
  });

  it("must attack: it must, and bring a creature with greater power (508.1d)", () => {
    const { game } = table();
    const okk = spawn(game, "Okk");
    const dragon = spawn(game, "Shivan Dragon");
    const bears = spawn(game, "Grizzly Bears");
    (game.state.playerEffects ??= []).push({
      owner: A,
      expires: "end-of-turn",
      combat: { rules: ["must-attack"], filter: { name: "Okk" }, side: A },
    });
    const offer = attackOffer(game);
    expect(offer?.mustAttack).toEqual([okk]);
    expect(attackWhy(game)).toMatch(/must attack/);
    expect(attackWhy(game, okk, bears)).toMatch(/greater power/);
    expect(attackWhy(game, okk, dragon)).toBeNull();
    if (offer === undefined) throw new Error("offered");
    expect(ids(withinAttackCompany([], offer))).toEqual([okk, dragon].sort());
    expect(ids(withinAttackCompany(atBob(okk, bears), offer))).toEqual([okk, dragon, bears].sort());
  });

  it("must attack with nothing greater beside it: no requirement", () => {
    const { game } = table();
    const okk = spawn(game, "Okk");
    const bears = spawn(game, "Grizzly Bears");
    (game.state.playerEffects ??= []).push({
      owner: A,
      expires: "end-of-turn",
      combat: { rules: ["must-attack"], filter: { name: "Okk" }, side: A },
    });
    const offer = attackOffer(game);
    expect(offer?.mustAttack).toEqual([]);
    expect(attackWhy(game)).toBeNull();
    expect(attackWhy(game, bears)).toBeNull();
    expect(attackWhy(game, okk, bears)).toMatch(/greater power/);
  });
});

describe("Okk: can't block unless a creature with greater power also blocks", () => {
  const board = () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const okk = spawn(game, "Okk", B);
    const giant = spawn(game, "Hill Giant", B); // 3/3, smaller
    const dragon = spawn(game, "Shivan Dragon", B); // 5/5
    const offer = blockOffer(game, a, [one, two]);
    return { game, one, two, okk, giant, dragon, offer };
  };
  const blockWhy = (game: Game, ...blocks: readonly { blocker: ObjectId; attacker: ObjectId }[]): string | null =>
    game.canDispatch({ type: "declare-blockers", player: B, blocks });

  it("blocks beside a creature with greater power, on anything; not beside a smaller one", () => {
    const { game, one, two, okk, giant, dragon, offer } = board();
    expect(offer.blockJoinedBy).toEqual({ [okk]: [dragon] });
    expect(blockWhy(game, { blocker: okk, attacker: one })).toMatch(/greater power/);
    expect(blockWhy(game, { blocker: okk, attacker: one }, { blocker: giant, attacker: two })).toMatch(/greater power/);
    expect(blockWhy(game, { blocker: okk, attacker: one }, { blocker: dragon, attacker: two })).toBeNull();
    expect(blockWhy(game, { blocker: okk, attacker: one }, { blocker: dragon, attacker: one })).toBeNull();
    const lonely = [{ blocker: okk, attacker: one }, { blocker: giant, attacker: two }];
    expect(blockCompanyViolations(lonely, offer)).toEqual([{ blocker: okk, others: 1, companion: "greater-power" }]);
    expect(withinBlockCompany(lonely, offer)).toEqual([{ blocker: giant, attacker: two }]);
  });

  it("isn't offered with nothing greater to block beside it", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const okk = spawn(game, "Okk", B);
    const giant = spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, a, [one]);
    expect(offer.eligible.map((e) => e.blocker)).toEqual([giant]);
    expect(blockWhy(game, { blocker: okk, attacker: one }, { blocker: giant, attacker: one })).toMatch(/greater power|can't block/);
  });
});
