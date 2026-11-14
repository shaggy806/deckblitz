/**
 * A land card with morph (Zoetic Cavern): played as a land, or cast face down
 * as a 2/2 creature for {3} (rule 702.37c — face down it's a creature card
 * with no other type, so rule 305.9's "played only as a land" doesn't reach
 * the cast), and turned face up for its morph cost into the land.
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { A, cast, lands, pt, table, toHand, types, zone } from "./harness.js";

describe("a land with morph", () => {
  it("Zoetic Cavern: offered as a land play and as a face-down cast", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const cavern = toHand(game, "Zoetic Cavern");
    const offers = game.legalActions(A).filter((a) => "card" in a && a.card === cavern);
    expect(offers.some((a) => a.kind === "play-land")).toBe(true);
    expect(offers.some((a) => a.kind === "cast-spell" && a.via === "face-down")).toBe(true);
    // Not as itself: a land is never cast (rule 305.9).
    expect(offers.some((a) => a.kind === "cast-spell" && a.via !== "face-down")).toBe(false);
  });

  it("Zoetic Cavern: cast face down as a 2/2 for {3}, without a land play, then turned face up into the land for {2}", () => {
    const { game } = table();
    game.state.rules.maxLandsPerTurn = 1;
    lands(game, "Wastes", 5);
    const cavern = toHand(game, "Zoetic Cavern");
    cast(game, cavern, { via: "face-down" });
    expect(zone(game, cavern)).toBe("battlefield");
    expect(game.state.objects[cavern].faceDown).toBeDefined();
    expect(types(game, cavern)).toEqual(["creature"]);
    expect(pt(game, cavern)).toEqual({ power: 2, toughness: 2 });
    // The land play is still there.
    const forest = toHand(game, "Forest");
    expect(game.legalActions(A).some((a) => a.kind === "play-land" && a.card === forest)).toBe(true);
    game.dispatch({ type: "turn-face-up", player: A, permanent: cavern, morph: true } as Action);
    expect(game.state.objects[cavern].faceDown).toBeUndefined();
    expect(types(game, cavern)).toEqual(["land"]);
    expect(game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === cavern)).toBe(true);
  });
});
