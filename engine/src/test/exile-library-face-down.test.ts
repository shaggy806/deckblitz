/**
 * A whole library exiled face down (rule 406.3), then the graveyard shuffled
 * in: Inverter of Truth's "when this creature enters, exile all cards from
 * your library face down, then shuffle all cards from your graveyard into
 * your library". Its rulings: nobody may look at the exiled cards, and a
 * processor taking one of them takes one at random (they are one face-down
 * group).
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, lands, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import { viewFor } from "../view.js";

const library = (game: Game, player = A) => game.state.zones.perPlayer[player].library;

describe("Inverter of Truth", () => {
  it("exiles the whole library face down for nobody to see, then shuffles the graveyard in as the new library", () => {
    const { game } = table();
    const marked = toLibrary(game, "Grizzly Bears");
    const was = [...library(game)];
    const bolt = toGraveyard(game, "Lightning Bolt");
    const giant = toGraveyard(game, "Hill Giant");
    const inverter = toHand(game, "Inverter of Truth");
    lands(game, "Swamp", 4);
    cast(game, inverter);
    expect(zone(game, inverter)).toBe("battlefield");
    expect(was.every((id) => zone(game, id) === "exile")).toBe(true);
    const exiled = was.map((id) => game.state.objects[id]);
    expect(exiled.every((o) => o.exiledFaceDown !== undefined && o.exiledFaceDown.lookers.length === 0)).toBe(true);
    // One face-down group, so a processor takes one of them at random.
    expect(new Set(exiled.map((o) => o.exiledFaceDown?.group)).size).toBe(1);
    expect([...library(game)].sort()).toEqual([bolt, giant].sort());
    expect(graveyard(game)).toHaveLength(0);
    for (const seat of [A, B]) {
      const seen = viewFor(game.state, game.registry, seat);
      expect(seen.objects[marked]).toBeUndefined();
    }
  });

  it("with an empty graveyard, the library is left empty", () => {
    const { game } = table();
    const inverter = toHand(game, "Inverter of Truth");
    lands(game, "Swamp", 4);
    cast(game, inverter);
    expect(library(game)).toHaveLength(0);
    expect(zone(game, inverter)).toBe("battlefield");
  });
});
