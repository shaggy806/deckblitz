/**
 * "A deck can have any number of cards named ~" and "up to seven cards named
 * ~": a card's own exception to the copy limit (rules 100.2a and 903.5b; the
 * card wins, 101.1). A deckbuilding rule, read by the deck validator; the
 * proving cards' other lines count their copies on the battlefield.
 */
import { describe, expect, it } from "vitest";

import { createDefaultRegistry } from "../cards.js";
import { copiesAllowed, validateCommanderDeck } from "../deck-validation.js";
import { B, pt, spawn, table } from "./harness.js";

const reg = createDefaultRegistry();
const swamps = (n: number): string[] => Array<string>(n).fill("Swamp");
const mountains = (n: number): string[] => Array<string>(n).fill("Mountain");

describe("a card's own copy limit (deck validation)", () => {
  it("copiesAllowed: one, a basic's any number, and what the card says", () => {
    expect(copiesAllowed("Doom Blade", reg)).toBe(1);
    expect(copiesAllowed("Swamp", reg)).toBe(Infinity);
    expect(copiesAllowed("Rat Colony", reg)).toBe(Infinity);
    expect(copiesAllowed("Relentless Rats", reg)).toBe(Infinity);
    expect(copiesAllowed("Seven Dwarves", reg)).toBe(7);
    // An unknown name is the feasibility audit's report, and one copy here.
    expect(copiesAllowed("No Such Card", reg)).toBe(1);
  });

  it("any number of Rat Colony is a legal 99 (903.5b gives way, 101.1)", () => {
    const r = validateCommanderDeck(
      { commanders: ["Sheoldred, the Apocalypse"], cards: [...Array<string>(60).fill("Rat Colony"), ...swamps(39)], size: 100 },
      reg,
    );
    expect(r.violations).toEqual([]);
    expect(r.legal).toBe(true);
  });

  it("two of a card with no such line is still a singleton violation", () => {
    const r = validateCommanderDeck(
      { commanders: ["Sheoldred, the Apocalypse"], cards: ["Doom Blade", "Doom Blade", "Rat Colony", "Rat Colony", ...swamps(95)], size: 100 },
      reg,
    );
    expect(r.violations).toEqual(['2× "Doom Blade" — singleton format allows only 1']);
  });

  it("'up to seven': seven pass, an eighth is reported with the card's own limit", () => {
    const commander = "Krenko, Mob Boss";
    const seven = validateCommanderDeck(
      { commanders: [commander], cards: [...Array<string>(7).fill("Seven Dwarves"), ...mountains(92)], size: 100 },
      reg,
    );
    expect(seven.violations).toEqual([]);
    const eight = validateCommanderDeck(
      { commanders: [commander], cards: [...Array<string>(8).fill("Seven Dwarves"), ...mountains(91)], size: 100 },
      reg,
    );
    expect(eight.violations).toEqual(['8× "Seven Dwarves" — a deck can have up to 7 cards with that name']);
  });

  it("the exception is the copy limit alone: colour identity still applies (903.5c)", () => {
    const r = validateCommanderDeck(
      { commanders: ["Krenko, Mob Boss"], cards: [...Array<string>(30).fill("Rat Colony"), ...mountains(69)], size: 100 },
      reg,
    );
    expect(r.violations.some((v) => v.includes('"Rat Colony" is outside'))).toBe(true);
    expect(r.violations.some((v) => v.includes("singleton"))).toBe(false);
  });

  it("a commander is a copy of itself: its name in the 99 too is two copies (903.5b)", () => {
    const r = validateCommanderDeck(
      { commanders: ["Krenko, Mob Boss"], cards: ["Krenko, Mob Boss", ...mountains(98)], size: 100 },
      reg,
    );
    expect(r.violations).toEqual(['2× "Krenko, Mob Boss" — singleton format allows only 1']);
  });
});

describe("the proving cards in play", () => {
  it("Rat Colony counts every other Rat you control, whatever its name", () => {
    const { game } = table();
    const colony = spawn(game, "Rat Colony");
    spawn(game, "Rat Colony");
    spawn(game, "Relentless Rats");
    spawn(game, "Grizzly Bears");
    expect(pt(game, colony)).toEqual({ power: 4, toughness: 1 });
  });

  it("Relentless Rats counts only its own name, on either side of the table", () => {
    const { game } = table();
    const rats = spawn(game, "Relentless Rats");
    spawn(game, "Relentless Rats", B);
    spawn(game, "Rat Colony");
    expect(pt(game, rats)).toEqual({ power: 3, toughness: 3 });
  });

  it("Seven Dwarves counts only the others you control", () => {
    const { game } = table();
    const dwarf = spawn(game, "Seven Dwarves");
    spawn(game, "Seven Dwarves");
    spawn(game, "Seven Dwarves", B);
    expect(pt(game, dwarf)).toEqual({ power: 3, toughness: 3 });
  });
});
