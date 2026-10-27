/**
 * Invasion (INV; B232), the lead's cards: the two domain cards written the
 * way group A wrote Kavu Scout and Strength of Unity.
 */
import { describe, expect, it } from "vitest";

import { B, cast, pt, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Exotic Curse", () => {
  it("gives -1/-1 per basic land type among its controller's lands", () => {
    const { game } = table();
    for (const land of ["Swamp", "Swamp", "Forest", "Island"]) spawn(game, land);
    spawn(game, "Mountain", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Exotic Curse"), { targets: [ref(giant)] });
    // Three types (Swamp, Forest, Island); the opponent's Mountain doesn't count.
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Wayfaring Giant", () => {
  it("counts basic land types, not lands", () => {
    const { game } = table();
    const giant = spawn(game, "Wayfaring Giant");
    for (const land of ["Plains", "Plains", "Plains", "Forest"]) spawn(game, land);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 5 });
  });
});
