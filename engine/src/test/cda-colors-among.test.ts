/**
 * A CDA counting the colours among permanents you control (`CountSpec`'s
 * `colorsAmong`) — Squawkroaster, in every zone (rule 604.3).
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import { A, B, pt, spawn, table, toHand } from "./harness.js";

describe("power equal to the number of colors among permanents you control", () => {
  it("counts each colour once, itself included, and not an opponent's", () => {
    const { game } = table();
    const roaster = spawn(game, "Squawkroaster", A);
    expect(pt(game, roaster)).toEqual({ power: 1, toughness: 4 });
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Llanowar Elves", A);
    spawn(game, "Island", A);
    spawn(game, "Serra Angel", B);
    expect(pt(game, roaster)).toEqual({ power: 2, toughness: 4 });
    spawn(game, "Serra Angel", A);
    expect(pt(game, roaster)).toEqual({ power: 3, toughness: 4 });
  });

  it("works in the hand, from its owner's permanents", () => {
    const { game } = table();
    spawn(game, "Serra Angel", A);
    spawn(game, "Grizzly Bears", A);
    const card = toHand(game, "Squawkroaster", A);
    expect(computeCharacteristics(game.state, game.registry, card).power).toBe(2);
  });
});
