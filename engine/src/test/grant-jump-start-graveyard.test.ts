/**
 * Jump-start given to graveyard cards (rule 702.133a): Niv-Mizzet, Supreme's
 * "each instant and sorcery card in your graveyard that's exactly two colors
 * has jump-start" — `grantsToGraveyard.flashback` with `keyword:
 * "jump-start"` and `discard: 1`, cast for the card's own mana cost, a card
 * discarded beside it, then exiled.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, graveyard, hand, lands, life, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const NIV = "Niv-Mizzet, Supreme";
const graveyardCasts = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "flashback");

describe("Niv-Mizzet, Supreme", () => {
  it("a two-color instant in your graveyard has jump-start: cast for its mana cost, a card discarded, then exiled", () => {
    const { game } = table();
    spawn(game, NIV);
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    toHand(game, "Grizzly Bears");
    const helix = toGraveyard(game, "Lightning Helix");
    expect(graveyardCasts(game, helix)[0]).toMatchObject({ altCostText: "jump-start, discarding a card" });
    const before = { hand: hand(game).length, graveyard: graveyard(game).length };
    cast(game, helix, { via: "flashback", targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
    expect(zone(game, helix)).toBe("exile");
    expect(hand(game)).toHaveLength(before.hand - 1);
    // The Helix left the graveyard, the discarded card came in.
    expect(graveyard(game)).toHaveLength(before.graveyard);
  });

  it("not a one-color card, not another player's, and not without Niv-Mizzet", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Plains", 1);
    toHand(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const helix = toGraveyard(game, "Lightning Helix");
    expect(graveyardCasts(game, helix)).toHaveLength(0);
    spawn(game, NIV);
    expect(graveyardCasts(game, bolt)).toHaveLength(0);
    expect(graveyardCasts(game, helix)).toHaveLength(1);
    const theirs = toGraveyard(game, "Lightning Helix", B);
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === theirs)).toBe(false);
  });
});
