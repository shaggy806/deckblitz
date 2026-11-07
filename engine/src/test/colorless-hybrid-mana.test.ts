/**
 * Colorless hybrid mana symbols, {C/W} and the rest (rule 107.4): each one is
 * paid with one colorless mana or one mana of its colour (107.4e), counts 1
 * toward mana value (202.3f), and is its colour (107.4e, 202.2d) — Ulalek,
 * Fused Atrocity, whose devoid makes the card itself colourless (702.114a)
 * while its colour identity stays all five.
 */
import { describe, expect, it } from "vitest";

import { colorIdentityOf } from "../identity.js";
import { colorSymbols, manaCostReductions, manaValue, parseManaCost } from "../mana.js";

import { cast, lands, registryOf, table, toHand, zone } from "./harness.js";

const ULALEK = "{C/W}{C/U}{C/B}{C/R}{C/G}";

describe("colorless hybrid mana", () => {
  it("parses {C/W} as colorless or white, mana value 1, a white symbol", () => {
    const cost = parseManaCost(ULALEK);
    expect(cost.hybrid[0]).toEqual([{ kind: "colorless" }, { kind: "color", color: "W" }]);
    expect(manaValue(cost)).toBe(5);
    expect(colorSymbols(cost, ["W"])).toBe(1);
    expect(colorSymbols(cost, ["W", "U", "B", "R", "G"])).toBe(5);
  });

  it("a reduction by the symbols offers the colorless half", () => {
    const spell = parseManaCost("{3}{C}");
    const texts = manaCostReductions("{C/W}", spell).map((r) => r.text);
    expect(texts).toContain("{C}");
  });

  it("Ulalek is colourless with a five-colour identity", () => {
    const { game } = table();
    const def = registryOf(game).get("Ulalek, Fused Atrocity");
    expect(def.colors).toEqual([]);
    expect([...colorIdentityOf(def)].sort()).toEqual(["B", "G", "R", "U", "W"]);
  });

  it("is cast with five colorless mana", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    const ulalek = toHand(game, "Ulalek, Fused Atrocity");
    cast(game, ulalek);
    expect(zone(game, ulalek)).toBe("battlefield");
  });

  it("is cast with one mana of each colour", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    const ulalek = toHand(game, "Ulalek, Fused Atrocity");
    cast(game, ulalek);
    expect(zone(game, ulalek)).toBe("battlefield");
  });

  it("can't be paid with mana of another colour", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const ulalek = toHand(game, "Ulalek, Fused Atrocity");
    expect(() => cast(game, ulalek)).toThrow(/refused/);
  });
});
