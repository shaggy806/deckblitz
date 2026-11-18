/**
 * A characteristic-defining count of **other** permanents (rule 604.3):
 * Pestilence Rats's "power is equal to the number of other Rats on the
 * battlefield" — a `setBasePtFromCount` over an `aggregate: "count"` with
 * `excludeSelf`, which `countValue` now honours (its ruling: it doesn't count
 * itself). Anyone's Rats count, a changeling among them (rule 702.73a).
 * Ancient Ooze's sum of the others' mana values is the same `excludeSelf`.
 */

import { describe, expect, it } from "vitest";

import { A, B, pt, spawn, table, toStep, zone } from "./harness.js";

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

// A sum over the others (`aggregate: "sum"` with `excludeSelf`): Ancient
// Ooze's "the total mana value of other creatures you control".
describe("Ancient Ooze", () => {
  it("adds up the mana values of the other creatures you control, not an opponent's or a noncreature", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    spawn(game, "Hill Giant", B);
    spawn(game, "Sol Ring");
    const ooze = spawn(game, "Ancient Ooze");
    expect(pt(game, ooze)).toEqual({ power: 6, toughness: 6 });
  });

  it("a token is 0 (the ruling), and two Oozes count each other's seven", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    const one = spawn(game, "Ancient Ooze");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 3 }, []);
    expect(pt(game, one)).toEqual({ power: 2, toughness: 2 });
    const two = spawn(game, "Ancient Ooze");
    expect(pt(game, one)).toEqual({ power: 9, toughness: 9 });
    expect(pt(game, two)).toEqual({ power: 9, toughness: 9 });
  });

  it("alone it's 0/0 and dies (rule 704.5f)", () => {
    const { game } = table();
    const ooze = spawn(game, "Ancient Ooze");
    toStep(game, "end");
    expect(zone(game, ooze)).toBe("graveyard");
  });
});
