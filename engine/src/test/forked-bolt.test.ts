import { describe, expect, it } from "vitest";

import { B, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

// Forked Bolt's "2 damage divided as you choose among one or two targets"
// needs its `divided` (Twin Bolt's shape): without it the cast carried no
// split and the spell dealt nothing (found authoring Apocalypse's Fire).
describe("Forked Bolt", () => {
  it("deals 1 to each of two targets as divided", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const elf = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Forked Bolt"), { targets: [ref(elf), ref(B)], division: [1, 1] });
    expect(zone(game, elf)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });

  it("deals all 2 to a single target", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Forked Bolt"), { targets: [ref(B)], division: [2] });
    expect(life(game, B)).toBe(18);
  });
});
