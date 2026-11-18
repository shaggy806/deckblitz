/**
 * A creature gaining each listed keyword another has, its variants included
 * (rule 702.11d-e — "hexproof from white" is gained as itself, not as
 * hexproof): Majestic Myriarch's "at the beginning of each combat, this
 * creature gains flying until end of turn if you control a creature with
 * flying. The same is true for first strike, …, hexproof, …". What it gains
 * is read once, as the ability resolves (rule 608.2h, its ruling), and its
 * power and toughness are twice the creatures you control (rule 604.3).
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import { B, destroy, keywords, nextTurn, pt, registryOf, settle, spawn, table, toStep } from "./harness.js";

describe("Majestic Myriarch", () => {
  it("is twice the creatures you control, itself counted", () => {
    const { game } = table();
    const myriarch = spawn(game, "Majestic Myriarch");
    expect(pt(game, myriarch)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, myriarch)).toEqual({ power: 4, toughness: 4 });
  });

  it("gains the listed keywords your creatures have, hexproof from white as itself, until end of turn", () => {
    const { game } = table();
    const myriarch = spawn(game, "Majestic Myriarch");
    const drake = spawn(game, "Wind Drake");
    spawn(game, "Knight of Malice");
    // An opponent's creature lends nothing.
    spawn(game, "Giant Spider", B);
    toStep(game, "begin-combat");
    settle(game);
    const has = keywords(game, myriarch);
    expect(has.has("flying")).toBe(true);
    expect(has.has("first-strike")).toBe(true);
    expect(has.has("reach")).toBe(false);
    expect(has.has("hexproof")).toBe(false);
    expect(computeCharacteristics(game.state, registryOf(game), myriarch).hexproofFrom.colors).toContain("W");
    // Fixed as it resolved: the flyer leaving takes nothing away.
    destroy(game, drake);
    expect(keywords(game, myriarch).has("flying")).toBe(true);
    nextTurn(game);
    expect(keywords(game, myriarch).has("flying")).toBe(false);
  });

  it("triggers at the beginning of each combat, an opponent's too", () => {
    const { game } = table();
    const myriarch = spawn(game, "Majestic Myriarch");
    spawn(game, "Wind Drake");
    toStep(game, "begin-combat", B);
    settle(game);
    expect(keywords(game, myriarch).has("flying")).toBe(true);
  });
});
