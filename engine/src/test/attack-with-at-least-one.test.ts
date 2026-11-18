/**
 * "Each opponent must attack [you or a planeswalker you control] with at
 * least one creature each combat if able" (Seeker of Slaanesh, Trove of
 * Temptation): the `must-attack` record's `atLeastOne`, a requirement on the
 * player's declaration (rule 508.1d) — the attackers offer's `company.groups`,
 * one requirement each, obeyed by any member attacking one of its defenders,
 * and never by paying a cost.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { attackCompanyViolations, withRequiredAttackers, withinAttackCompany } from "../combat/attacking.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, spawn, table } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

const attackOffer = (game: Game): AttackOffer => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers");
  const offer = game.legalActions(A).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error("alice wasn't asked to attack");
  return offer;
};

const declare = (game: Game, ...pairs: readonly (readonly [ObjectId, PlayerId | ObjectId])[]): void => {
  game.dispatch({
    type: "declare-attackers",
    player: A,
    attackers: pairs.map(([attacker, defender]) => ({ attacker, defender })),
  });
};

describe("Seeker of Slaanesh", () => {
  it("one creature must attack — anyone — and one is enough", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Seeker of Slaanesh", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    const offer = attackOffer(game);
    expect(offer.company?.groups).toHaveLength(1);
    expect(offer.mustAttack).toEqual([]);
    expect(attackCompanyViolations([], offer).map((v) => v.kind)).toEqual(["attack-with-one"]);
    expect(attackCompanyViolations([{ attacker: bears, defender: C }], offer)).toEqual([]);
    expect(attackCompanyViolations([{ attacker: giant, defender: B }], offer)).toEqual([]);
    expect(() => declare(game)).toThrow(/At least one creature must attack/);
    declare(game, [giant, C]);
    expect(game.state.objects[giant].attacking).toBe(C);
    expect(game.state.objects[bears].attacking).toBe(null);
  });

  it("asks nothing when no creature can attack", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Seeker of Slaanesh", B);
    spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Llanowar Elves", A, { sick: true });
    game.advanceUntil((s) => s.turn.step === "declare-attackers" || s.turn.step === "postcombat-main");
    expect(game.state.turn.number).toBe(1);
    expect(game.state.awaiting?.kind === "attackers").toBe(false);
  });

  it("a creature it would cost to send isn't made to attack (Ghostly Prison)", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Seeker of Slaanesh", B);
    spawn(game, "Ghostly Prison", B);
    spawn(game, "Forest", A);
    spawn(game, "Forest", A);
    spawn(game, "Grizzly Bears", A);
    const offer = attackOffer(game);
    expect(attackCompanyViolations([], offer)).toEqual([]);
  });

  it("a creature of its own that must attack obeys it too", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Seeker of Slaanesh", B);
    const juggernaut = spawn(game, "Juggernaut", A);
    spawn(game, "Grizzly Bears", A);
    const offer = attackOffer(game);
    expect(offer.mustAttack).toEqual([juggernaut]);
    expect(attackCompanyViolations([{ attacker: juggernaut, defender: B }], offer)).toEqual([]);
  });

  it("a driver that doesn't choose sends one", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Seeker of Slaanesh", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const offer = attackOffer(game);
    const sent = withRequiredAttackers([], offer);
    expect(sent).toEqual([{ attacker: bears, defender: B }]);
    expect(attackCompanyViolations(sent, offer)).toEqual([]);
  });
});

describe("Trove of Temptation", () => {
  it("one creature must attack its controller or their planeswalker; elsewhere doesn't count", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Trove of Temptation", B);
    const walker = spawn(game, "Jace Beleren", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    const offer = attackOffer(game);
    expect(offer.company?.groups?.[0]?.defenders).toEqual([B, walker]);
    const only = (...pairs: readonly (readonly [ObjectId, PlayerId | ObjectId])[]) =>
      attackCompanyViolations(
        pairs.map(([attacker, defender]) => ({ attacker, defender })),
        offer,
      );
    expect(only().map((v) => v.kind)).toEqual(["attack-with-one"]);
    expect(only([bears, C]).map((v) => v.kind)).toEqual(["attack-with-one"]);
    expect(only([bears, B])).toEqual([]);
    expect(only([bears, walker])).toEqual([]);
    // The rest attack whom they like (the ruling).
    expect(only([bears, B], [giant, C])).toEqual([]);
    expect(() => declare(game, [bears, C])).toThrow(/At least one creature must attack/);
    declare(game, [bears, C], [giant, B]);
    expect(game.state.objects[giant].attacking).toBe(B);
  });

  it("two Troves from two players: one creature for each, while there are two", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Trove of Temptation", B);
    spawn(game, "Trove of Temptation", C);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    const offer = attackOffer(game);
    expect(offer.company?.groups).toHaveLength(2);
    expect(attackCompanyViolations([{ attacker: bears, defender: B }], offer).map((v) => v.kind)).toEqual(["attack-with-one"]);
    expect(
      attackCompanyViolations(
        [
          { attacker: bears, defender: B },
          { attacker: giant, defender: C },
        ],
        offer,
      ),
    ).toEqual([]);
    // A lone creature can obey only one of them: either will do.
    expect(withinAttackCompany([], offer).length).toBe(2);
  });

  it("under a one-attacker limit, the one attacks its controller (Silent Arbiter)", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Trove of Temptation", B);
    spawn(game, "Silent Arbiter", C);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    const offer = attackOffer(game);
    expect(attackCompanyViolations([{ attacker: bears, defender: C }], offer).map((v) => v.kind)).toEqual(["attack-with-one"]);
    expect(attackCompanyViolations([{ attacker: giant, defender: B }], offer)).toEqual([]);
    const sent = withinAttackCompany([{ attacker: bears, defender: C }], offer);
    expect(sent).toHaveLength(1);
    expect(sent[0].defender).toBe(B);
  });
});
