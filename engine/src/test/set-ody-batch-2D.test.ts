/**
 * Odyssey (ODY; B231), group D. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  keywords,
  lands,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  types,
} from "./harness.js";

describe("Sacred Rites", () => {
  it("gives +0/+1 per card discarded, to your creatures only", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const discards = [toHand(game, "Grizzly Bears"), toHand(game, "Grizzly Bears"), toHand(game, "Grizzly Bears")];
    a.chooseDiscardsFn = () => discards;
    cast(game, toHand(game, "Sacred Rites"));
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 5 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Cognivore", () => {
  it("counts instant cards in every graveyard", () => {
    const { game } = table();
    const cog = spawn(game, "Cognivore");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Lightning Bolt", B);
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, cog)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Kamahl's Desire", () => {
  it("grants first strike, and +3/+0 only at threshold", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Kamahl's Desire"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    for (let i = 0; i < 6; i++) toGraveyard(game, "Wastes");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    toGraveyard(game, "Wastes");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
  });
});

describe("Testament of Faith", () => {
  it("becomes an X/X Wall creature with defender, still an enchantment", () => {
    const { game } = table();
    const testament = spawn(game, "Testament of Faith");
    lands(game, "Plains", 3);
    activate(game, testament, 0, { x: 3 });
    expect(pt(game, testament)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, testament)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
    expect(subtypes(game, testament)).toContain("Wall");
    expect(keywords(game, testament).has("defender")).toBe(true);
  });
});

describe("Cabal Inquisitor", () => {
  it("needs threshold, exiles two graveyard cards and makes the target discard", () => {
    const { game } = table();
    const inquisitor = spawn(game, "Cabal Inquisitor");
    lands(game, "Swamp", 2);
    for (let i = 0; i < 6; i++) toGraveyard(game, "Wastes");
    expect(() => activate(game, inquisitor, 0, { targets: [ref(B)] })).toThrow();
    toGraveyard(game, "Wastes");
    const before = hand(game, B).length;
    activate(game, inquisitor, 0, { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 1);
    expect(graveyard(game, A).length).toBe(5);
  });
});

describe("Still Life", () => {
  it("becomes a 4/3 Centaur creature until end of turn", () => {
    const { game } = table();
    const life = spawn(game, "Still Life");
    lands(game, "Forest", 2);
    activate(game, life);
    expect(pt(game, life)).toEqual({ power: 4, toughness: 3 });
    expect(types(game, life)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
    expect(subtypes(game, life)).toContain("Centaur");
  });
});
