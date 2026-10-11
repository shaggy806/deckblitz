/**
 * The Kindred card type (rule 308): a noncreature card that has creature
 * types (rule 205.3m) — "Kindred Enchantment — Faerie" (Bitterblossom). It's
 * cast and resolves by its other type's rules (308.1), its creature types are
 * read like a creature's (a "Faerie", an "Elf you control"), changeling
 * reaches it (rule 702.73a — Crib Swap is every creature type), and kindred
 * counts as a card type of its own (the rulings: delirium).
 */
import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import { subtypeFitsTypes } from "../subtypes.js";

import { A, cast, lands, pt, registryOf, spawn, subtypes, table, toGraveyard, toHand, tokensNamed, types } from "./harness.js";

describe("Kindred", () => {
  it("is a card type beside the other, and the permanent has its creature types without being a creature", () => {
    const { game } = table();
    const blossom = spawn(game, "Bitterblossom");
    expect(types(game, blossom)).toEqual(["kindred", "enchantment"]);
    expect(subtypes(game, blossom)).toContain("Faerie");
    expect(matchesFilter(game.state, registryOf(game), blossom, { subtype: "Faerie" }, { you: A })).toBe(true);
    expect(matchesFilter(game.state, registryOf(game), blossom, { type: "creature" }, { you: A })).toBe(false);
  });

  it("creature types fit a kindred as they fit a creature (rule 205.3m), and nothing else", () => {
    expect(subtypeFitsTypes("Faerie", ["kindred", "enchantment"])).toBe(true);
    expect(subtypeFitsTypes("Faerie", ["enchantment"])).toBe(false);
  });

  it("an 'Elf you control' count includes a kindred Elf enchantment", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    spawn(game, "Prowess of the Fair");
    spawn(game, "Llanowar Elves");
    cast(game, toHand(game, "Elvish Promenade"));
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
  });

  it("changeling on a kindred card makes it every creature type, in hand too (rule 702.73a)", () => {
    const { game } = table();
    const swap = toHand(game, "Crib Swap");
    expect(matchesFilter(game.state, registryOf(game), swap, { subtype: "Goblin" }, { you: A })).toBe(true);
    expect(matchesFilter(game.state, registryOf(game), swap, { subtype: "Merfolk" }, { you: A })).toBe(true);
  });

  it("counts as a card type for delirium (the rulings)", () => {
    const { game } = table();
    const channeler = spawn(game, "Dragon's Rage Channeler");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, channeler)).toEqual({ power: 1, toughness: 1 });
    // A kindred sorcery: two card types, so four with a land and a creature.
    toGraveyard(game, "Elvish Promenade");
    expect(pt(game, channeler)).toEqual({ power: 3, toughness: 3 });
  });
});
