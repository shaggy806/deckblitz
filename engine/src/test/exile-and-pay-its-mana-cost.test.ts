/**
 * "Exile a creature card from your graveyard and pay its mana cost"
 * (`exileFromGraveyard.payItsManaCost` — Back from the Brink): the card
 * decides the cost's mana (rule 601.2f via 602.2b), so it's named as the
 * ability is activated (`costCard`): one offer per card whose mana cost can
 * be paid, an {X} in it 0 (107.3h), none for a card with no mana cost
 * (118.6).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, lands, named, pt, settle, spawn, table, toGraveyard, zone } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "activate-ability" }>;
const offers = (game: Game, source: ObjectId): Offer[] =>
  game.legalActions(A).filter((l): l is Offer => l.kind === "activate-ability" && l.source === source);

const activate = (game: Game, source: ObjectId, card: ObjectId): void => {
  game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: 0, costCard: card, targets: [] });
  settle(game);
};

const untapped = (game: Game): number =>
  game.state.zones.shared.battlefield.filter((id) => {
    const o = game.state.objects[id];
    return o.controller === A && !o.tapped && game.registry.get(o.cardName).types.includes("land");
  }).length;

describe("Back from the Brink: exile a creature card and pay its mana cost", () => {
  it("is offered once per creature card it can pay for, each with that card's cost", () => {
    const { game } = table();
    const brink = spawn(game, "Back from the Brink");
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Forest");
    const list = offers(game, brink);
    expect(list.map((o) => o.costCard?.card)).toEqual([bears]);
    expect(list[0].costCard?.manaCost).toBe("{1}{G}");
    expect(list[0].text).toContain("(Grizzly Bears: {1}{G})");
    lands(game, "Mountain", 2);
    expect(offers(game, brink).map((o) => o.costCard?.card).sort()).toEqual([bears, giant].sort());
  });

  it("exiles the named card, pays its cost and makes a token copy of it", () => {
    const { game } = table();
    const brink = spawn(game, "Back from the Brink");
    lands(game, "Forest", 1);
    lands(game, "Mountain", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    activate(game, brink, giant);
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    expect(untapped(game)).toBe(0);
    const tokens = named(game, "Hill Giant", A).filter((id) => game.state.objects[id].zone === "battlefield");
    expect(tokens.length).toBe(1);
    expect(game.state.objects[tokens[0]].isToken).toBe(true);
    expect(pt(game, tokens[0])).toEqual({ power: 3, toughness: 3 });
  });

  it("an {X} in the card's cost is 0", () => {
    const { game } = table();
    const brink = spawn(game, "Back from the Brink");
    lands(game, "Forest", 2);
    const ooze = toGraveyard(game, "Endless One");
    const list = offers(game, brink);
    expect(list.find((o) => o.costCard?.card === ooze)?.costCard?.manaCost).toBe("{0}");
  });

  it("can't be activated naming no card, or a card it can't afford", () => {
    const { game } = table();
    const brink = spawn(game, "Back from the Brink");
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: brink, abilityIndex: 0, targets: [] })).toMatch(/named/);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: brink, abilityIndex: 0, costCard: giant, targets: [] })).not.toBeNull();
    expect(game.canDispatch({ type: "activate-ability", player: A, source: brink, abilityIndex: 0, costCard: bears, targets: [] })).toBeNull();
  });
});
