/**
 * "Power and toughness are each equal to **twice** the number of …" — a
 * characteristic-defining ability (rule 604.3) whose count is added to itself
 * (`CountSpec`'s `sum`), so it stays a layer-7b set of base P/T that a later
 * 7b effect overrides and 7c/7d bonuses add to. The record's
 * `bug:cda-count-multiplier` needed no engine code.
 *
 * Melek, Reforged Researcher (instant and sorcery cards in your graveyard, and
 * the first instant or sorcery each turn costs {3} less), Territorial Maro
 * (domain) and Masumaro, First to Live (cards in your hand).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, pt, settle, spawn, table, toGraveyard, toHand } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.canDispatch({ type: "cast-spell", player: A, card, targets: [] }) === null;

describe("Melek, Reforged Researcher", () => {
  it("is twice the instant and sorcery cards in your graveyard, and only yours", () => {
    const { game } = table();
    const melek = toHand(game, "Melek, Reforged Researcher");
    expect(pt(game, melek)).toEqual({ power: 0, toughness: 0 });
    toGraveyard(game, "Divination");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Shock", B);
    // Defined in every zone (604.3): two instants and sorceries, doubled.
    expect(pt(game, melek)).toEqual({ power: 4, toughness: 4 });
    const onBattlefield = spawn(game, "Melek, Reforged Researcher");
    expect(pt(game, onBattlefield)).toEqual({ power: 4, toughness: 4 });
  });

  it("a +1/+1 counter adds after the doubled count (layer 7c after 7b)", () => {
    const { game } = table();
    const melek = spawn(game, "Melek, Reforged Researcher");
    toGraveyard(game, "Divination");
    game.state.objects[melek].counters["+1/+1"] = 1;
    expect(pt(game, melek)).toEqual({ power: 3, toughness: 3 });
  });

  it("the first instant or sorcery you cast each turn costs {3} less; the second, full price", () => {
    const { game } = table();
    // A card in the graveyard keeps Melek alive (2/2) through the settles.
    toGraveyard(game, "Lightning Bolt");
    spawn(game, "Melek, Reforged Researcher");
    spawn(game, "Island");
    // A creature spell first doesn't use up the discount.
    spawn(game, "Forest");
    cast(game, toHand(game, "Llanowar Elves"));
    // Divination is {2}{U}: the {3} takes the {2}, the Island pays the {U}.
    const first = toHand(game, "Divination");
    expect(castable(game, first)).toBe(true);
    cast(game, first);
    expect(game.state.objects[first].zone).toBe("graveyard");
    spawn(game, "Island");
    expect(castable(game, toHand(game, "Divination"))).toBe(false);
    settle(game);
  });
});

describe("Territorial Maro", () => {
  it("is twice the basic land types among lands you control", () => {
    const { game } = table();
    const maro = spawn(game, "Territorial Maro");
    expect(pt(game, maro)).toEqual({ power: 0, toughness: 0 });
    spawn(game, "Forest");
    spawn(game, "Forest");
    spawn(game, "Island");
    spawn(game, "Swamp", B);
    expect(pt(game, maro)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Masumaro, First to Live", () => {
  it("is twice the cards in your hand, changing as the hand does", () => {
    const { game } = table({ openingHandSize: 0 });
    const masumaro = spawn(game, "Masumaro, First to Live");
    const before = game.state.zones.perPlayer[A].hand.length;
    toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears", B);
    expect(pt(game, masumaro)).toEqual({ power: 2 * (before + 1), toughness: 2 * (before + 1) });
  });
});
