/**
 * "For one spell this turn, you may spend mana as though it were mana of any
 * type to pay that spell's mana cost. (Additional costs are still paid
 * normally.)" (North Star — rule 609.4b): a timed static's `spendManaAs`
 * with `oneSpell`, read off the emblem it rides (`spendAsFor`), its symbols
 * those of the spell's mana cost alone (`spendAsWithin`), and used up by
 * the first spell cast that can't be paid without it.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activate, cast, lands, nextTurn, spawn, table, toHand, zone } from "./harness.js";

const spentTypes = (game: Game, id: ObjectId): string[] =>
  (game.state.objects[id].manaSpent ?? []).map((unit) => unit.type).sort();

/** North Star activated with four Swamps, nothing else left untapped. */
function starred(): Game {
  const { game } = table();
  const star = spawn(game, "North Star");
  lands(game, "Swamp", 4);
  activate(game, star);
  return game;
}

describe("North Star — mana of any type for one spell's mana cost", () => {
  it("pays a {G} with blue mana, once", () => {
    const game = starred();
    lands(game, "Island", 4);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(spentTypes(game, bears)).toEqual(["U", "U"]);
    // Used up: a second green spell can't be paid with Islands.
    const more = toHand(game, "Grizzly Bears");
    expect(() => cast(game, more)).toThrow(/pay|mana|afford/i);
  });

  it("isn't used up by a spell paid without it", () => {
    const game = starred();
    lands(game, "Island", 3);
    const merfolk = toHand(game, "Merfolk of the Pearl Trident");
    cast(game, merfolk);
    expect(zone(game, merfolk)).toBe("battlefield");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("an additional cost's {W} is still paid with white mana", () => {
    const game = starred();
    lands(game, "Island", 6);
    const lancer = toHand(game, "Benalish Lancer");
    expect(() => cast(game, lancer, { kicked: true })).toThrow(/pay|mana|afford/i);
    // Its mana cost alone: the {W} paid with an Island.
    cast(game, lancer);
    expect(zone(game, lancer)).toBe("battlefield");
  });

  it("an additional cost's {W} paid with a Plains, the mana cost's with Islands", () => {
    const game = starred();
    lands(game, "Island", 5);
    lands(game, "Plains", 1);
    const lancer = toHand(game, "Benalish Lancer");
    cast(game, lancer, { kicked: true });
    expect(zone(game, lancer)).toBe("battlefield");
    expect(spentTypes(game, lancer)).toEqual(["U", "U", "U", "U", "U", "W"]);
  });

  it("lasts the turn only", () => {
    const game = starred();
    nextTurn(game);
    nextTurn(game);
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Island", 2);
    expect(() => cast(game, bears)).toThrow(/pay|mana|afford/i);
  });
});
