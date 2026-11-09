/**
 * Rule 508.1d: as many requirements obeyed as can be, within the restrictions.
 * A goaded creature that can't get past a full Crawlspace still attacks: at
 * its goader, the one player left.
 */

import { describe, expect, it } from "vitest";

import type { AttackerDeclaration, LegalAction } from "../actions.js";
import { attackCompanyViolations, withinAttackCompany } from "../combat/attacking.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, spawn, table } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "declare-attackers" }>;

/** Three players, alice's `n` Bears goaded by carol, bob's Crawlspace in play
 * unless `open`, at alice's declaration. */
const board = (n: number, open = false): { game: Game; bears: ObjectId[]; offer: Offer } => {
  const { game } = table({ players: 3 });
  if (!open) spawn(game, "Crawlspace", B);
  const bears = Array.from({ length: n }, () => spawn(game, "Grizzly Bears"));
  for (const id of bears) game.state.objects[id].goadedBy = [C];
  game.advanceUntil((s) => s.awaiting?.kind === "attackers");
  const offer = game.legalActions(A).find((o): o is Offer => o.kind === "declare-attackers")!;
  return { game, bears, offer };
};

const declared = (game: Game, attackers: readonly AttackerDeclaration[]): string | null =>
  game.canDispatch({ type: "declare-attackers", player: A, attackers });

const at = (ids: readonly ObjectId[], defender: typeof B): AttackerDeclaration[] =>
  ids.map((attacker) => ({ attacker, defender }));

describe("goad beside a cap on attackers", () => {
  it("sends the one Crawlspace turns away at the goader", () => {
    const { game, bears, offer } = board(3);
    const [one, two, three] = bears;
    expect(offer.mustAttack).toEqual(expect.arrayContaining(bears));
    expect(offer.defendersFor[three]).toContain(C);
    expect(declared(game, [...at([one, two], B), ...at([three], C)])).toBeNull();
    // Every one of them may be the one sent at Carol.
    expect(declared(game, [...at([two, three], B), ...at([one], C)])).toBeNull();
  });

  it("doesn't let the turned-away one stay home", () => {
    const { game, bears } = board(3);
    expect(declared(game, at(bears.slice(0, 2), B))).not.toBeNull();
  });

  it("still sends as many as can go past the goader", () => {
    const { game, bears } = board(3);
    expect(declared(game, at(bears, C))).not.toBeNull();
    expect(declared(game, [...at(bears.slice(0, 1), B), ...at(bears.slice(1), C)])).not.toBeNull();
  });

  it("puts a driver's declaration right", () => {
    const { bears, offer } = board(3);
    const fixed = withinAttackCompany(at(bears, C), offer);
    expect(attackCompanyViolations(fixed, offer)).toEqual([]);
    expect(fixed.filter((d) => d.defender === B)).toHaveLength(2);
    expect(fixed).toHaveLength(3);
  });

  it("splits a goaded token stack between the seats and the goader", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Crawlspace", B);
    const stack = game.debugSpawn("Goblin Token", A, "battlefield", { summoningSick: false });
    game.state.objects[stack].stackCount = 3;
    game.state.objects[stack].goadedBy = [C];
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    const offer = game.legalActions(A).find((o): o is Offer => o.kind === "declare-attackers")!;
    const fixed = withinAttackCompany([{ attacker: stack, defender: C }], offer);
    expect(attackCompanyViolations(fixed, offer)).toEqual([]);
    expect(fixed.find((d) => d.defender === B)?.count).toBe(2);
  });

  it("changes nothing while the cap has room", () => {
    const { game, bears, offer } = board(2);
    expect(offer.defendersFor[bears[0]]).toEqual([B]);
    expect(declared(game, [...at(bears.slice(0, 1), B), ...at(bears.slice(1), C)])).not.toBeNull();
  });

  it("changes nothing without a cap", () => {
    const { bears, offer } = board(3, true);
    expect(offer.defendersFor[bears[0]]).toEqual([B]);
  });
});
