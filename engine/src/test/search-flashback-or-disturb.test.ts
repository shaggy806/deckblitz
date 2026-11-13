/**
 * Phantom Carriage: "you may search your library for a card with flashback
 * or disturb, put it into your graveyard, then shuffle" — `hasKeyword`'s card
 * reads in an `anyOf`.
 */
import { describe, expect, it } from "vitest";

import { enter, pickModes, table, toLibrary, zone } from "./harness.js";

describe("Phantom Carriage", () => {
  it("offers only the cards with flashback or disturb, and mills the one chosen", () => {
    const seats = table();
    const { game } = seats;
    const twice = toLibrary(game, "Think Twice");
    const angler = toLibrary(game, "Baithook Angler");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(seats.a, 0);
    let offered: readonly string[] = [];
    seats.a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible.map((id) => game.state.objects[id].cardName);
      return eligible.filter((id) => id === twice);
    };
    enter(game, "Phantom Carriage");
    expect([...offered].sort()).toEqual(["Baithook Angler", "Think Twice"]);
    expect(zone(game, twice)).toBe("graveyard");
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, angler)).toBe("library");
  });
});
