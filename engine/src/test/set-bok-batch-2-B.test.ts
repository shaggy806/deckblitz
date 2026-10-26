/**
 * Betrayers of Kamigawa's rest and Champions of Kamigawa's most-played
 * (BOK, CHK; B207), group B. One test per card whose behaviour is more than
 * a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  keywords,
  lands,
  life,
  pickFromZone,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Myojin of Infinite Rage", () => {
  it("cast from hand: a divinity counter and indestructible; removing it destroys all lands", () => {
    const { game } = table();
    const mountains = lands(game, "Mountain", 10);
    const theirs = spawn(game, "Forest", B);
    const myojin = toHand(game, "Myojin of Infinite Rage");
    cast(game, myojin);
    expect(counters(game, myojin, "divinity")).toBe(1);
    expect(keywords(game, myojin).has("indestructible")).toBe(true);
    activate(game, myojin);
    expect(mountains.every((m) => zone(game, m) === "graveyard")).toBe(true);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(counters(game, myojin, "divinity")).toBe(0);
    expect(keywords(game, myojin).has("indestructible")).toBe(false);
  });

  it("put onto the battlefield without casting: no counter, not indestructible", () => {
    const { game } = table();
    const myojin = spawn(game, "Myojin of Infinite Rage");
    expect(counters(game, myojin, "divinity")).toBe(0);
    expect(keywords(game, myojin).has("indestructible")).toBe(false);
  });
});

describe("Ishi-Ishi, Akki Crackshot", () => {
  it("deals 2 damage to an opponent who casts an Arcane spell", () => {
    const { game } = table();
    spawn(game, "Ishi-Ishi, Akki Crackshot", B);
    lands(game, "Island", 5);
    cast(game, toHand(game, "Ribbons of the Reikai"));
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
  });

  it("ignores a spell that is neither Spirit nor Arcane", () => {
    const { game } = table();
    spawn(game, "Ishi-Ishi, Akki Crackshot", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, A)).toBe(20);
  });
});

describe("Psychic Spear", () => {
  it("offers only Spirit or Arcane cards, and discards the chosen one", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const bears = toHand(game, "Grizzly Bears", B);
    const ribbons = toHand(game, "Ribbons of the Reikai", B);
    const pick = pickFromZone(a, ribbons);
    cast(game, toHand(game, "Psychic Spear"), { targets: [ref(B)] });
    expect(pick.offered).not.toContain(bears);
    expect(graveyard(game, B)).toEqual([ribbons]);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Long-Forgotten Gohei", () => {
  it("makes Arcane spells cost {1} less and pumps Spirits", () => {
    const { game } = table();
    spawn(game, "Long-Forgotten Gohei");
    const frostling = spawn(game, "Frostling");
    expect(pt(game, frostling)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Island", 4);
    const ribbons = toHand(game, "Ribbons of the Reikai");
    cast(game, ribbons);
    expect(zone(game, ribbons)).toBe("graveyard");
  });
});
