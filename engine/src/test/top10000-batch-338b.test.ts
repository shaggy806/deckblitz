/**
 * Top-10000 batch 338b (lane triggers-journal): Bishop of Binding's X read
 * from the card it exiled until it leaves.
 */
import { describe, expect, it } from "vitest";

import { attack, B, destroy, enter, pickTargets, pt, spawn, table, zone } from "./harness.js";

describe("batch 338b — Bishop of Binding", () => {
  it("gives a Vampire +X/+X, X the exiled card's power, and the card comes back when it leaves", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const bishop = enter(game, "Bishop of Binding");
    expect(zone(game, giant)).toBe("exile");
    pickTargets(a, bishop);
    attack(game, a, [bishop]);
    // Hill Giant is a 3/3: the 1/1 Bishop is 4/4 until end of turn.
    expect(pt(game, bishop)).toEqual({ power: 4, toughness: 4 });
    destroy(game, bishop);
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Hill Giant")).toBe(true);
  });

  it("X is 0 with no card exiled", () => {
    const { game, a } = table();
    const bishop = enter(game, "Bishop of Binding");
    pickTargets(a, bishop);
    attack(game, a, [bishop]);
    expect(pt(game, bishop)).toEqual({ power: 1, toughness: 1 });
  });
});
