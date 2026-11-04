/**
 * "This spell costs {X} less to cast, where X is the greatest number of
 * artifacts an opponent controls" (rule 601.2f): the `{ greatestOpponentCount }`
 * cost reduction, and Cavern-Hoard Dragon's whole text. The most any one
 * opponent controls, never the sum (its ruling), and generic mana only.
 */
import { describe, expect, it } from "vitest";

import { A, attack, B, C, cast, lands, spawn, table, tokensNamed, toHand, zone, life } from "./harness.js";

const DRAGON = "Cavern-Hoard Dragon";

describe("a cost reduced by the most any one opponent controls", () => {
  it("takes the greatest opponent's count, not the sum across opponents", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", C);
    spawn(game, "Sol Ring", C);
    spawn(game, "Sol Ring", C);
    // {7}{R}{R} less 3 is six mana: the five lands fall short though the
    // opponents have five artifacts between them.
    lands(game, "Mountain", 5);
    expect(() => cast(game, toHand(game, DRAGON))).toThrow();
    lands(game, "Mountain", 1);
    const dragon = toHand(game, DRAGON);
    cast(game, dragon);
    expect(zone(game, dragon)).toBe("battlefield");
  });

  it("counts opponents only: your own artifacts take nothing off", () => {
    const { game } = table();
    spawn(game, "Ornithopter", A);
    lands(game, "Mountain", 8);
    expect(() => cast(game, toHand(game, DRAGON))).toThrow();
  });

  it("stops at the generic: seven or more artifacts leave {R}{R} (its ruling)", () => {
    const { game } = table();
    for (let i = 0; i < 8; i += 1) spawn(game, "Sol Ring", B);
    lands(game, "Mountain", 2);
    const dragon = toHand(game, DRAGON);
    cast(game, dragon);
    expect(zone(game, dragon)).toBe("battlefield");
  });

  it("counts a stack of tokens as every token in it", () => {
    const { game } = table();
    game.state.objects[spawn(game, "Treasure Token", B)].stackCount = 3;
    lands(game, "Mountain", 6);
    const dragon = toHand(game, DRAGON);
    cast(game, dragon);
    expect(zone(game, dragon)).toBe("battlefield");
  });
});

describe("Cavern-Hoard Dragon's Treasures", () => {
  it("makes a Treasure for each artifact the damaged player controls, no one else's", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", C);
    spawn(game, "Sol Ring", C);
    spawn(game, "Sol Ring", C);
    const dragon = spawn(game, DRAGON, A);
    attack(game, a, [dragon], B);
    expect(life(game, B)).toBe(14);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("makes none when that player has no artifacts", () => {
    const { game, a } = table();
    const dragon = spawn(game, DRAGON, A);
    attack(game, a, [dragon], B);
    expect(life(game, B)).toBe(14);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});
