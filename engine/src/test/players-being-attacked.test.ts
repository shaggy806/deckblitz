/**
 * The `"players-being-attacked"` scope counted (Pack Attack's "the number of
 * players being attacked", `combat/attacked.ts`): players, not their
 * planeswalkers (rule 802.4); a creature put onto the battlefield attacking a
 * player makes them one (508.4).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, B, C, D, activate, cast, lands, pt, spawn, table, toGraveyard, toHand } from "./harness.js";

/** Alice's attackers declared as given, alice holding priority in her
 * declare attackers step. */
function aliceAttacks(game: Game, a: ScriptedController, attacks: readonly (readonly [ObjectId, PlayerId | ObjectId])[]): void {
  a.declareAttackersFn = () => attacks.map(([attacker, defender]) => ({ attacker, defender }));
  game.advanceUntil(
    (s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null,
  );
}

describe("Pack Attack", () => {
  it("gives attacking creatures +1/+0 for each player being attacked, and draws", () => {
    const { game, a } = table({ players: 4 });
    lands(game, "Mountain", 3);
    const pack = toHand(game, "Pack Attack");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const three = spawn(game, "Grizzly Bears");
    aliceAttacks(game, a, [
      [one, B],
      [two, C],
      [three, C],
    ]);
    const hand = game.state.zones.perPlayer[A].hand.length;
    cast(game, pack);
    expect(pt(game, one)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, three)).toEqual({ power: 4, toughness: 2 });
    expect(game.state.zones.perPlayer[A].hand.length).toBe(hand); // Pack Attack out, a card in
  });

  it("counts a player a creature was put onto the battlefield attacking", () => {
    const { game, a } = table({ players: 4 });
    lands(game, "Mountain", 6);
    const pack = toHand(game, "Pack Attack");
    const phoenix = toGraveyard(game, "Nemesis Phoenix");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    aliceAttacks(game, a, [
      [one, B],
      [two, C],
    ]);
    a.chooseAttackTargetsFn = (_view, creatures) => creatures.map((c) => ({ object: c.object, target: D }));
    activate(game, phoenix);
    expect(game.state.objects[phoenix].attacking).toBe(D);
    cast(game, pack);
    expect(pt(game, one).power).toBe(5);
    expect(pt(game, phoenix).power).toBe(7);
  });

  it("is +0 outside combat", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 3);
    const pack = toHand(game, "Pack Attack");
    const bear = spawn(game, "Grizzly Bears");
    cast(game, pack);
    expect(pt(game, bear).power).toBe(2);
  });
});
