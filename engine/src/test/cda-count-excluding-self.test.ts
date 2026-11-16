/**
 * A characteristic-defining count of **other** permanents (rule 604.3):
 * Pestilence Rats's "power is equal to the number of other Rats on the
 * battlefield" — a `setBasePtFromCount` over an `aggregate: "count"` with
 * `excludeSelf`, which `countValue` now honours (its ruling: it doesn't count
 * itself). Anyone's Rats count, a changeling among them (rule 702.73a).
 */

import { describe, expect, it } from "vitest";

import { B, pt, spawn, table } from "./harness.js";

describe("Pestilence Rats", () => {
  it("doesn't count itself", () => {
    const { game } = table();
    const rats = spawn(game, "Pestilence Rats");
    expect(pt(game, rats)).toEqual({ power: 0, toughness: 3 });
  });

  it("counts the other Rats on the battlefield, an opponent's and a changeling too", () => {
    const { game } = table();
    const rats = spawn(game, "Pestilence Rats");
    spawn(game, "Swarm of Rats");
    spawn(game, "Relentless Rats", B);
    expect(pt(game, rats)).toEqual({ power: 2, toughness: 3 });
    spawn(game, "Changeling Outcast", B);
    expect(pt(game, rats)).toEqual({ power: 3, toughness: 3 });
    // Not a Rat: no change.
    spawn(game, "Grizzly Bears");
    expect(pt(game, rats)).toEqual({ power: 3, toughness: 3 });
  });

  it("two of them count each other", () => {
    const { game } = table();
    const one = spawn(game, "Pestilence Rats");
    const two = spawn(game, "Pestilence Rats", B);
    expect(pt(game, one)).toEqual({ power: 1, toughness: 3 });
    expect(pt(game, two)).toEqual({ power: 1, toughness: 3 });
  });
});
