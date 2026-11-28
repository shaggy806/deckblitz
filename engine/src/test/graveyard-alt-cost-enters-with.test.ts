/**
 * "You may cast this card from your graveyard by paying {W}{U}{B}{R}{G}
 * rather than paying its mana cost. If you do, it enters with two +1/+1
 * counters on it" (Worldheart Phoenix): the card's own graveyard permission
 * (rule 113.6f), its alternative cost `byPaying` and its `entersWith`, which
 * rides only on a spell cast under that permission. Written from the Oracle
 * text and rulings.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, counters, lands, pt, table, toGraveyard, toHand, zone } from "./harness.js";

const fiveColors = (game: Game): void => {
  for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
};
const castsFrom = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card);

describe("Worldheart Phoenix", () => {
  it("cast from your graveyard for {W}{U}{B}{R}{G}, it enters with two +1/+1 counters", () => {
    const { game } = table();
    fiveColors(game);
    const phoenix = toGraveyard(game, "Worldheart Phoenix");
    cast(game, phoenix, { via: "graveyard-permission" });
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(counters(game, phoenix)).toBe(2);
    expect(pt(game, phoenix)).toEqual({ power: 4, toughness: 4 });
  });

  it("can't be cast from the graveyard for its mana cost, or without all five colors", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const phoenix = toGraveyard(game, "Worldheart Phoenix");
    expect(castsFrom(game, phoenix)).toHaveLength(0);
  });

  it("cast from your hand, it enters with no counters", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const phoenix = toHand(game, "Worldheart Phoenix");
    cast(game, phoenix);
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(counters(game, phoenix)).toBe(0);
  });

  it("cast from the graveyard under another permission, for its mana cost, it enters with no counters", () => {
    const { game } = table();
    // In the graveyard first: the Will exiles anything put there later.
    const phoenix = toGraveyard(game, "Worldheart Phoenix");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Yawgmoth's Will"));
    lands(game, "Mountain", 4);
    // The Will's offer: the Phoenix's own needs all five colors.
    const offers = castsFrom(game, phoenix);
    expect(offers).toHaveLength(1);
    const offer = offers[0];
    if (offer.kind !== "cast-spell") throw new Error("not a cast");
    cast(game, phoenix, {
      via: "graveyard-permission",
      ...(offer.graveyardGrant !== undefined ? { graveyardGrant: offer.graveyardGrant } : {}),
    });
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(counters(game, phoenix)).toBe(0);
  });
});
