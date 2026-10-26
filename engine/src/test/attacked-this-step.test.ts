/**
 * Portal's "Cast this spell only during the declare attackers step and only
 * if you've been attacked this step" (the `attacked-this-step` condition),
 * the `attackingYou` filter (Blessed Reversal), and the batch-190 cards on
 * them.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, activate, cast, hand, lands, life, nextTurn, pt, ref, spawn, table, toHand, zone } from "./harness.js";
import type { ScriptedController } from "../controller.js";

/** Bob's turn, his creatures declared attacking as given, alice holding
 * priority in his declare attackers step. */
function bobAttacks(game: Game, b: ScriptedController, attacks: readonly (readonly [ObjectId, PlayerId])[]): void {
  nextTurn(game);
  b.declareAttackersFn = () => attacks.map(([attacker, defender]) => ({ attacker, defender }));
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
}

describe("attacked-this-step", () => {
  it("lets Just Fate be cast only in a declare attackers step in which you were attacked", () => {
    const { game, b } = table();
    lands(game, "Plains", 3);
    const fate = toHand(game, "Just Fate");
    const giant = spawn(game, "Hill Giant", B);
    expect(() => cast(game, fate, { targets: [ref(giant)] })).toThrow();
    bobAttacks(game, b, [[giant, A]]);
    cast(game, fate, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("isn't met when the attack went at someone else", () => {
    const { game, b } = table({ players: 3 });
    lands(game, "Plains", 3);
    const fate = toHand(game, "Just Fate");
    const giant = spawn(game, "Hill Giant", B);
    bobAttacks(game, b, [[giant, C]]);
    expect(() => cast(game, fate, { targets: [ref(giant)] })).toThrow();
  });

  it("is over once the declare blockers step begins", () => {
    const { game, b } = table();
    lands(game, "Plains", 3);
    const fate = toHand(game, "Just Fate");
    const giant = spawn(game, "Hill Giant", B);
    bobAttacks(game, b, [[giant, A]]);
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null);
    expect(() => cast(game, fate, { targets: [ref(giant)] })).toThrow();
  });
});

describe("Blessed Reversal", () => {
  it("counts only the creatures attacking you", () => {
    const { game, b } = table({ players: 3 });
    lands(game, "Plains", 2);
    const reversal = toHand(game, "Blessed Reversal");
    const one = spawn(game, "Hill Giant", B);
    const two = spawn(game, "Grizzly Bears", B);
    const three = spawn(game, "Grizzly Bears", B);
    bobAttacks(game, b, [
      [one, A],
      [two, A],
      [three, C],
    ]);
    const before = life(game, A);
    cast(game, reversal);
    expect(life(game, A)).toBe(before + 6);
  });
});

describe("Harsh Justice", () => {
  it("has each attacker that damages you deal that much to its controller", () => {
    const { game, b } = table();
    lands(game, "Plains", 3);
    const justice = toHand(game, "Harsh Justice");
    const giant = spawn(game, "Hill Giant", B);
    bobAttacks(game, b, [[giant, A]]);
    cast(game, justice);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.awaiting === null && s.pendingTriggers.length === 0 && s.zones.shared.stack.length === 0);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
  });
});

describe("Command of Unsummoning", () => {
  it("returns two attacking creatures", () => {
    const { game, b } = table();
    lands(game, "Island", 3);
    const command = toHand(game, "Command of Unsummoning");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    bobAttacks(game, b, [
      [giant, A],
      [bears, A],
    ]);
    cast(game, command, { targets: [ref(giant), ref(bears)] });
    expect(hand(game, B)).toEqual(expect.arrayContaining([giant, bears]));
  });
});

describe("Defiant Stand", () => {
  it("gives +1/+3 and untaps", () => {
    const { game, b } = table();
    lands(game, "Plains", 2);
    const stand = toHand(game, "Defiant Stand");
    const wall = spawn(game, "Grizzly Bears", A, { tapped: true });
    const giant = spawn(game, "Hill Giant", B);
    bobAttacks(game, b, [[giant, A]]);
    cast(game, stand, { targets: [ref(wall)] });
    expect(pt(game, wall)).toEqual({ power: 3, toughness: 5 });
    expect(game.state.objects[wall].tapped).toBe(false);
  });
});

describe("prevent-damage-to-you", () => {
  it("Deep Wood prevents what attacking creatures would deal to you", () => {
    const { game, b } = table();
    lands(game, "Forest", 2);
    const wood = toHand(game, "Deep Wood");
    const giant = spawn(game, "Hill Giant", B);
    bobAttacks(game, b, [[giant, A]]);
    cast(game, wood);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.awaiting === null);
    expect(life(game, A)).toBe(20);
  });

  it("Scarecrow stops creatures with flying, not the others", () => {
    const { game, b } = table();
    lands(game, "Wastes", 6);
    const scarecrow = spawn(game, "Scarecrow");
    const drake = spawn(game, "Wind Drake", B);
    const giant = spawn(game, "Hill Giant", B);
    bobAttacks(game, b, [
      [drake, A],
      [giant, A],
    ]);
    activate(game, scarecrow);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.awaiting === null);
    expect(life(game, A)).toBe(17);
  });
});
