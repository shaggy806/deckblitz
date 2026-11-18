/**
 * Devastating Mastery: with the {2}{W}{W} cost paid, an opponent (the
 * caster's choice, as it resolves) chooses up to two nonland permanents they
 * control and returns them — not targets, and together — before every
 * nonland permanent is destroyed.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, hand, lands, pickPermanents, spawn, table, toHand, zone } from "./harness.js";

describe("Devastating Mastery", () => {
  it("cast for its mana cost: everything nonland is destroyed, nobody chooses", () => {
    const { game, b } = table();
    lands(game, "Plains", 6);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Llanowar Elves", B);
    const relic = spawn(game, "Sol Ring", B);
    const land = spawn(game, "Forest", B);
    b.choosePermanentsFn = () => {
      throw new Error("asked");
    };
    cast(game, toHand(game, "Devastating Mastery"));
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, relic)).toBe("graveyard");
    expect(zone(game, land)).toBe("battlefield");
  });

  it("the alternative cost: the opponent saves up to two of their own, the rest are destroyed", () => {
    const { game, b } = table();
    lands(game, "Plains", 4);
    const mine = spawn(game, "Grizzly Bears", A);
    const elves = spawn(game, "Llanowar Elves", B);
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(b, ring, bears);
    cast(game, toHand(game, "Devastating Mastery"), { altCost: true });
    // Only their own nonland permanents are offered.
    expect([...seen.offered].sort()).toEqual([elves, ring, bears].sort());
    expect(hand(game, B)).toEqual(expect.arrayContaining([ring, bears]));
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("at three players the caster names the opponent who chooses", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Plains", 4);
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Llanowar Elves", C);
    a.chooseModesFn = (_view, _min, _max, texts) => {
      expect(texts).toEqual(["Choose Bob", "Choose Carol"]);
      return [1];
    };
    b.choosePermanentsFn = () => {
      throw new Error("Bob wasn't named");
    };
    pickPermanents(c, carols);
    cast(game, toHand(game, "Devastating Mastery"), { altCost: true });
    expect(zone(game, carols)).toBe("hand");
    expect(zone(game, bobs)).toBe("graveyard");
  });
});
