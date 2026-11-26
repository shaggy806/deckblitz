/**
 * "Whenever all non-Wall creatures you control attack": an `attack-with`
 * trigger's `allOf` — every creature the attacking player controls matching
 * it is among the declaration's attackers (rule 508.1). Mob Mentality.
 */
import { describe, expect, it } from "vitest";

import { attack, B, cast, lands, life, pt, ref, spawn, table, toHand } from "./harness.js";

const board = () => {
  const t = table();
  const { game } = t;
  const bears = spawn(game, "Grizzly Bears");
  const elves = spawn(game, "Llanowar Elves");
  const wall = spawn(game, "Wall of Wood");
  lands(game, "Mountain", 1);
  cast(game, toHand(game, "Mob Mentality"), { targets: [ref(bears)] });
  return { ...t, bears, elves, wall };
};

describe("Mob Mentality: +X/+0 when every non-Wall creature attacks", () => {
  it("both non-Walls attack, the Wall home: +2/+0, counting the attackers", () => {
    const { game, a, bears, elves } = board();
    attack(game, a, [bears, elves]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(life(game, B)).toBe(20 - 4 - 1);
  });

  it("one non-Wall left home: no trigger", () => {
    const { game, a, bears } = board();
    attack(game, a, [bears]);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(life(game, B)).toBe(18);
  });
});
