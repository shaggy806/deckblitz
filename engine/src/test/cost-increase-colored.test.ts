/**
 * "Black spells you cast cost {B} more to cast" (Derelor and the Leeches,
 * `costModification.increaseColored`): coloured pips added to a spell's total
 * cost, before any reduction (rule 601.2f), to whatever cost it's cast for
 * (118.9d), its mana value untouched.
 */

import { describe, expect, it } from "vitest";

import { manaValueOfObject } from "../filter.js";
import { A, B, activate, cast, destroy, keywords, lands, pt, registryOf, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const refusal = (game: Game, card: ObjectId): string | null =>
  game.canDispatch({ type: "cast-spell", player: A, card, targets: [] });
const shown = (game: Game, card: ObjectId) => game.viewFor(A).objects[card]?.effectiveManaCost;

describe("spells of a colour costing a pip of it more", () => {
  it("takes one more of the pip: a spell {B} short can't be cast", () => {
    const { game } = table();
    spawn(game, "Derelor");
    const spell = toHand(game, "Footlight Fiend"); // {B/R}: black, and red.
    lands(game, "Mountain", 1);
    expect(refusal(game, spell)).not.toBeNull();
    lands(game, "Swamp", 1);
    expect(refusal(game, spell)).toBeNull();
    cast(game, spell);
    expect(zone(game, spell)).toBe("battlefield");
  });

  it("a generic source can't pay the pip it adds", () => {
    const { game } = table();
    spawn(game, "Derelor");
    const spell = toHand(game, "Andradite Leech"); // {2}{B}: {2}{B}{B} now.
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 3);
    expect(refusal(game, spell)).not.toBeNull();
    lands(game, "Swamp", 1);
    expect(shown(game, spell)).toBe("{2}{B}{B}");
    cast(game, spell);
    expect(zone(game, spell)).toBe("battlefield");
  });

  it("spells of another colour, and the colourless, are untouched", () => {
    const { game } = table();
    spawn(game, "Derelor");
    const bears = toHand(game, "Grizzly Bears");
    const sapphire = toHand(game, "Sapphire Leech");
    expect(shown(game, bears)).toBeUndefined();
    expect(shown(game, sapphire)).toBeUndefined();
    lands(game, "Forest", 2);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("only the spells its controller casts", () => {
    const { game } = table();
    spawn(game, "Derelor", B);
    const spell = toHand(game, "Andradite Leech");
    lands(game, "Swamp", 3);
    expect(shown(game, spell)).toBeUndefined();
    cast(game, spell);
    expect(zone(game, spell)).toBe("battlefield");
  });

  it("two of them add two pips", () => {
    const { game } = table();
    spawn(game, "Derelor");
    spawn(game, "Andradite Leech");
    const spell = toHand(game, "Andradite Leech");
    expect(shown(game, spell)).toBe("{2}{B}{B}{B}");
  });

  it("a pip on a spell with none of that colour of its own, a hybrid one aside", () => {
    const { game } = table();
    spawn(game, "Derelor");
    expect(shown(game, toHand(game, "Footlight Fiend"))).toBe("{B/R}{B}");
  });

  it("a generic reduction can't take the pip (rule 118.7a)", () => {
    const { game } = table();
    spawn(game, "Derelor");
    spawn(game, "Jet Medallion"); // Black spells cost {1} less.
    const spell = toHand(game, "Andradite Leech");
    expect(shown(game, spell)).toBe("{1}{B}{B}");
    const fiend = toHand(game, "Footlight Fiend"); // {B/R}: nothing generic to take.
    expect(shown(game, fiend)).toBe("{B/R}{B}");
    lands(game, "Swamp", 1);
    expect(refusal(game, fiend)).not.toBeNull();
    lands(game, "Swamp", 1);
    cast(game, fiend);
    expect(zone(game, fiend)).toBe("battlefield");
  });

  it("is added to an alternative cost, even of nothing (rule 118.9d): Omniscience", () => {
    const { game } = table();
    spawn(game, "Derelor");
    spawn(game, "Omniscience");
    const spell = toHand(game, "Andradite Leech");
    const omniscient = { type: "cast-spell", player: A, card: spell, targets: [], altCost: true } as const;
    expect(game.canDispatch(omniscient)).not.toBeNull();
    lands(game, "Swamp", 1);
    expect(game.canDispatch(omniscient)).toBeNull();
    cast(game, spell, { altCost: true });
    expect(zone(game, spell)).toBe("battlefield");
  });

  it("doesn't change the spell's mana value", () => {
    const { game } = table();
    spawn(game, "Derelor");
    const spell = toHand(game, "Andradite Leech");
    lands(game, "Swamp", 4);
    cast(game, spell, { settle: false });
    expect(zone(game, spell)).toBe("stack");
    expect(manaValueOfObject(registryOf(game), game.state.objects[spell])).toBe(3);
  });

  it("stops with the permanent gone", () => {
    const { game } = table();
    const derelor = spawn(game, "Derelor");
    const spell = toHand(game, "Andradite Leech");
    expect(shown(game, spell)).toBe("{2}{B}{B}");
    destroy(game, derelor);
    expect(shown(game, spell)).toBeUndefined();
  });

  it("Andradite Leech's own pump runs beside it, untaxed: an ability isn't a spell", () => {
    const { game } = table();
    const leech = spawn(game, "Andradite Leech");
    lands(game, "Swamp", 1);
    activate(game, leech, 0);
    expect(pt(game, leech)).toEqual({ power: 3, toughness: 3 });
  });

  it("Sapphire Leech flies, and taxes blue", () => {
    const { game } = table();
    const leech = spawn(game, "Sapphire Leech");
    expect(keywords(game, leech).has("flying")).toBe(true);
    const spell = toHand(game, "Sapphire Leech");
    lands(game, "Island", 2);
    expect(refusal(game, spell)).not.toBeNull();
  });
});
