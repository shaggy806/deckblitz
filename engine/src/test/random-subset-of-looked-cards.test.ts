/**
 * A random subset of looked-at cards: `look-and-choose` `atRandom` over the
 * top of a library, then the rest ordered — Orcish Librarian's "look at the
 * top eight cards of your library. Exile four of them at random, then put the
 * rest on top of your library in any order."
 */
import { describe, expect, it } from "vitest";

import { A, activate, lands, spawn, table, toLibrary, zone } from "./harness.js";

const TOP = ["Shock", "Divination", "Grizzly Bears", "Lightning Bolt", "Counterspell", "Giant Growth", "Duress", "Opt"];

describe("Orcish Librarian", () => {
  it("exiles four of the top eight at random and puts the other four back on top", () => {
    const { game } = table({ openingHandSize: 0 });
    const top = TOP.map((name) => toLibrary(game, name));
    const librarian = spawn(game, "Orcish Librarian");
    lands(game, "Mountain", 1);
    const before = game.state.zones.perPlayer[A].library.length;
    activate(game, librarian, 0);
    const exiled = top.filter((id) => zone(game, id) === "exile");
    const kept = top.filter((id) => zone(game, id) === "library");
    expect(exiled).toHaveLength(4);
    expect(kept).toHaveLength(4);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.length).toBe(before - 4);
    // The library's top is its first card here (`toLibrary` puts each on top).
    expect(new Set(library.slice(0, 4))).toEqual(new Set(kept));
  });

  it("with fewer than eight cards, exiles four of them and keeps the rest", () => {
    const { game } = table({ openingHandSize: 0 });
    const library = game.state.zones.perPlayer[A].library;
    library.splice(0, library.length);
    const six = TOP.slice(0, 6).map((name) => toLibrary(game, name));
    const librarian = spawn(game, "Orcish Librarian");
    lands(game, "Mountain", 1);
    activate(game, librarian, 0);
    expect(six.filter((id) => zone(game, id) === "exile")).toHaveLength(4);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(2);
  });
});
