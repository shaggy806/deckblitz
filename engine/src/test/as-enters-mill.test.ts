/**
 * "As this creature enters, mill three cards for each time it was kicked"
 * (Urborg Lhurgoyf — `AsEntersAction.mill`): part of the replacement as it
 * enters (rules 614.1c, 614.12), so its controller mills before it's on the
 * battlefield and it enters seeing the milled cards (the ruling); its two
 * kicker costs (702.33b) kick it once or twice.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, cast, graveyard, lands, pt, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

/** Grizzly Bears, Grizzly Bears, Forest on top of alice's library, then more
 * creature cards below them. */
const stack = (game: Game, below = 0): void => {
  for (let i = 0; i < below; i++) toLibrary(game, "Grizzly Bears");
  toLibrary(game, "Forest");
  toLibrary(game, "Grizzly Bears");
  toLibrary(game, "Grizzly Bears");
};

const ready = (game: Game): void => {
  lands(game, "Forest", 2);
  lands(game, "Island", 1);
  lands(game, "Swamp", 1);
};

describe("Urborg Lhurgoyf", () => {
  it("unkicked, mills nothing: power the creature cards in your graveyard, toughness one more", () => {
    const { game } = table();
    ready(game);
    stack(game);
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Grizzly Bears", B);
    const card = toHand(game, "Urborg Lhurgoyf");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(graveyard(game)).toHaveLength(1);
    // Only your graveyard.
    expect(pt(game, card)).toEqual({ power: 1, toughness: 2 });
  });

  it("kicked once, mills three as it enters and counts what it milled", () => {
    const { game } = table();
    ready(game);
    stack(game, 3);
    const card = toHand(game, "Urborg Lhurgoyf");
    cast(game, card, { kicked: true, kickCount: 1 });
    expect(graveyard(game)).toHaveLength(3);
    expect(pt(game, card)).toEqual({ power: 2, toughness: 3 });
  });

  it("kicked with {B} alone is once too", () => {
    const { game } = table();
    ready(game);
    stack(game, 3);
    const card = toHand(game, "Urborg Lhurgoyf");
    cast(game, card, { kicked: true, kickCount: 2 });
    expect(graveyard(game)).toHaveLength(3);
  });

  it("kicked with both, mills six", () => {
    const { game } = table();
    ready(game);
    stack(game, 3);
    const card = toHand(game, "Urborg Lhurgoyf");
    cast(game, card, { kicked: true, kickCount: 3 });
    expect(graveyard(game)).toHaveLength(6);
    expect(pt(game, card)).toEqual({ power: 5, toughness: 6 });
  });
});
