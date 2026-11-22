/**
 * Batch 338 (author-top-cards overnight, combat-targeting lane):
 * - Tilonalli's Crown and Fatal Attraction: an Aura's untargeted damage to
 *   the creature it enchants (`damage` `target: "attached"`, Earthbind's).
 */

import { describe, expect, it } from "vitest";

import { B, cast, keywords, lands, life, nextTurn, pt, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Tilonalli's Crown", () => {
  it("deals 1 damage to the creature it enchants, which gets +3/+0 and trample", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Tilonalli's Crown"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 6, toughness: 3 });
    expect(keywords(game, giant).has("trample")).toBe(true);
  });

  it("kills an X/1 it enchants", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const elves = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Tilonalli's Crown"), { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("graveyard");
  });
});

describe("Mana Maze", () => {
  it("stops a spell sharing a color with the last spell cast this turn, even once that resolved", () => {
    const { game } = table();
    spawn(game, "Mana Maze", B);
    const start = life(game, B);
    lands(game, "Mountain", 2);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(B)] })).toThrow();
    // Blue shares nothing with red; then red is fine again and blue isn't.
    cast(game, toHand(game, "Opt"));
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(start - 5);
  });

  it("restricts nothing before the turn's first spell, nor after a colorless one", () => {
    const { game } = table();
    spawn(game, "Mana Maze", B);
    lands(game, "Mountain", 2);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    nextTurn(game);
    nextTurn(game);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    cast(game, toHand(game, "Sol Ring"));
    expect(() => cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] })).not.toThrow();
  });
});

describe("Fatal Attraction", () => {
  it("deals 2 as it enters and 4 at its controller's upkeep", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Fatal Attraction"), { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    nextTurn(game); // Bob's turn: no upkeep trigger, and the damage wore off.
    expect(zone(game, wurm)).toBe("battlefield");
    nextTurn(game); // Alice's upkeep: 4 damage to a 6/4.
    expect(zone(game, wurm)).toBe("graveyard");
  });
});
