import { describe, expect, it } from "vitest";
import { A, B, activate, cast, counters, lands, life, ref, spawn, table, toHand } from "./harness.js";

// "Target player or battle" (Onakke Javelineer): a battle permanent slot
// with `orPlayer: "any"` — any player, yourself included, or a battle; never
// a creature or a planeswalker. Damage to a battle removes defense counters
// (rule 310.6).
describe("target player or battle (Onakke Javelineer)", () => {
  it("deals 2 damage to a player, or to a battle, and can't target a creature or planeswalker", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Forest", 3);
    const battle = toHand(game, "Invasion of Lorwyn");
    cast(game, battle);
    expect(counters(game, battle, "defense")).toBe(5);
    const javelineer = spawn(game, "Onakke Javelineer", A);
    const other = spawn(game, "Onakke Javelineer", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const walker = spawn(game, "Jace Beleren", B);
    expect(() => activate(game, javelineer, 0, { targets: [ref(bears)] })).toThrow(/target/i);
    expect(() => activate(game, javelineer, 0, { targets: [ref(walker)] })).toThrow(/target/i);
    activate(game, javelineer, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    activate(game, other, 0, { targets: [ref(battle)] });
    expect(counters(game, battle, "defense")).toBe(3);
  });

  it("may target its own controller", () => {
    const { game } = table();
    const javelineer = spawn(game, "Onakke Javelineer", A);
    activate(game, javelineer, 0, { targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
  });
});
