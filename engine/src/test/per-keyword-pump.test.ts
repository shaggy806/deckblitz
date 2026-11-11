/**
 * `modify-pt-all`'s `perMatchOf`: the amount once for each listed filter a
 * permanent matches, every one counted before any is changed (rule 611.2c) —
 * Akroma, Vision of Ixidor's "+1/+1 if it has flying, +1/+1 if it has first
 * strike, and so on". With it, the filter clauses for a keyword in any
 * variant (`keywordVariant`: hexproof, protection) and for partner
 * (`hasKeyword: "partner"`).
 */

import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import type { CardFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, nextTurn, pt, registryOf, settle, spawn, table, toStep } from "./harness.js";
import type { PlayerId } from "../primitives.js";

/** A player's beginning of combat, Akroma's trigger resolved. */
const toCombat = (game: Game, player: PlayerId = A): void => {
  toStep(game, "begin-combat", player);
  settle(game);
};

const stats = (game: Game, id: ObjectId): string => {
  const { power, toughness } = pt(game, id);
  return `${power}/${toughness}`;
};
const matches = (game: Game, id: ObjectId, filter: CardFilter): boolean =>
  matchesFilter(game.state, registryOf(game), id, filter, { you: A });

describe("Akroma, Vision of Ixidor", () => {
  it("gives each other creature you control +1/+1 for each listed ability it has", () => {
    const { game } = table();
    const akroma = spawn(game, "Akroma, Vision of Ixidor");
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel"); // flying, vigilance
    const knight = spawn(game, "Black Knight"); // first strike, protection from white
    const tymna = spawn(game, "Tymna the Weaver"); // lifelink, partner
    const pir = spawn(game, "Pir, Imaginative Rascal"); // partner with
    const cecily = spawn(game, "Cecily, Haunted Mage"); // friends forever: no partner
    const theirs = spawn(game, "Serra Angel", B);
    toCombat(game);
    expect(stats(game, akroma)).toBe("6/6");
    expect(stats(game, bears)).toBe("2/2");
    expect(stats(game, angel)).toBe("6/6");
    expect(stats(game, knight)).toBe("4/4");
    expect(stats(game, tymna)).toBe("4/4");
    expect(stats(game, pir)).toBe("2/2");
    expect(stats(game, cecily)).toBe("3/5");
    expect(stats(game, theirs)).toBe("4/4");
  });

  it("counts a 'hexproof from' as hexproof, once", () => {
    const { game } = table();
    spawn(game, "Akroma, Vision of Ixidor");
    const grace = spawn(game, "Knight of Grace"); // first strike, hexproof from black
    expect(matches(game, grace, { keyword: "hexproof" })).toBe(false);
    expect(matches(game, grace, { keywordVariant: "hexproof" })).toBe(true);
    expect(matches(game, grace, { keywordVariant: "protection" })).toBe(false);
    toCombat(game);
    expect(stats(game, grace)).toBe("4/4");
  });

  it("triggers at each combat, and the bonus ends with the turn", () => {
    const { game } = table();
    spawn(game, "Akroma, Vision of Ixidor");
    const angel = spawn(game, "Serra Angel");
    toCombat(game);
    expect(stats(game, angel)).toBe("6/6");
    nextTurn(game);
    expect(stats(game, angel)).toBe("4/4");
    // Bob's combat too.
    toCombat(game, B);
    expect(stats(game, angel)).toBe("6/6");
  });
});

describe("the filter clauses", () => {
  it("reads partner off the text box, in its two plain forms", () => {
    const { game } = table();
    expect(matches(game, spawn(game, "Tymna the Weaver"), { hasKeyword: "partner" })).toBe(true);
    expect(matches(game, spawn(game, "Pir, Imaginative Rascal"), { hasKeyword: "partner" })).toBe(true);
    expect(matches(game, spawn(game, "Cecily, Haunted Mage"), { hasKeyword: "partner" })).toBe(false);
    expect(matches(game, spawn(game, "Grizzly Bears"), { hasKeyword: "partner" })).toBe(false);
  });

  it("reads protection of any quality", () => {
    const { game } = table();
    expect(matches(game, spawn(game, "Black Knight"), { keywordVariant: "protection" })).toBe(true);
    expect(matches(game, spawn(game, "Grizzly Bears"), { keywordVariant: "protection" })).toBe(false);
    expect(matches(game, spawn(game, "Gladecover Scout"), { keywordVariant: "hexproof" })).toBe(true);
  });
});
