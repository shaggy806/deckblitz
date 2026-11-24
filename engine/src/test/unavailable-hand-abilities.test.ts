/**
 * `Game.unavailableHandAbilities`: the abilities of a hand card that work
 * from the hand and aren't on offer, each with why, which a seat's view
 * carries for its own hand so the client can grey them out. A player left a
 * game holding Colossal Skyturtle with one of its two channel abilities
 * missing: an opponent's Bojuka Bog had emptied their graveyard, and nothing
 * on screen said that was why (room FNWFF, 2026-11-24).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, lands, spawn, table, toGraveyard, toHand } from "./harness.js";

/** Each unavailable hand ability of Alice's, as card, ability and reason. */
const off = (game: Game): (string | number)[][] =>
  game.unavailableHandAbilities(A).map((each) => [each.cardName, each.abilityIndex, each.why]);

describe("a hand ability that can't be activated right now", () => {
  it("says there is nothing to target, and leaves out the one on offer", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    spawn(game, "Grizzly Bears", B);
    const turtle = toHand(game, "Colossal Skyturtle");
    expect(off(game)).toEqual([["Colossal Skyturtle", 0, "No card in your graveyard to target"]]);
    const offered = game.legalActions(A).flatMap((l) => (l.kind === "activate-ability" && l.source === turtle ? [l.abilityIndex] : []));
    expect(offered).toEqual([1]);
  });

  it("is gone once the ability can be activated", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    spawn(game, "Grizzly Bears", B);
    toGraveyard(game, "Forest");
    toHand(game, "Colossal Skyturtle");
    expect(off(game)).toEqual([]);
    expect(game.viewFor(A).unavailableHandAbilities).toBeUndefined();
  });

  it("says the cost can't be paid", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    toGraveyard(game, "Forest");
    toHand(game, "Colossal Skyturtle");
    expect(off(game)).toEqual([
      ["Colossal Skyturtle", 0, "Can't pay its cost"],
      ["Colossal Skyturtle", 1, "Can't pay its cost"],
    ]);
  });

  it("is in the seat's own view while it holds priority, and in nobody else's", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    spawn(game, "Grizzly Bears", B);
    const turtle = toHand(game, "Colossal Skyturtle");
    expect(game.viewFor(A).unavailableHandAbilities).toEqual([
      {
        source: turtle,
        abilityIndex: 0,
        cardName: "Colossal Skyturtle",
        text: expect.stringContaining("Return target card from your graveyard to your hand"),
        why: "No card in your graveyard to target",
      },
    ]);
    expect(game.viewFor(B).unavailableHandAbilities).toBeUndefined();
    // Bob holds priority: Alice is offered nothing, so nothing is greyed.
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    expect(game.viewFor(A).unavailableHandAbilities).toBeUndefined();
  });

  it("leaves a card with no hand ability alone", () => {
    const { game } = table();
    toHand(game, "Grizzly Bears");
    toHand(game, "Forest");
    expect(off(game)).toEqual([]);
  });
});
