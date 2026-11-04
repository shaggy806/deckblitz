/**
 * A spell's own ceiling on X (`CardDefinition.maxX`, rule 601.2b), read as X is
 * chosen: Open the Way's "X can't be greater than the number of players in the
 * game", and its reveal of X land cards.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, C, cast, lands, table, toHand, toLibrary, zone } from "./harness.js";

/** The X offered to `player` for this card, the most their lands and the card allow. */
const offeredMaxX = (game: Game, card: string, player = A): number | undefined => {
  for (const action of game.legalActions(player)) {
    if (action.kind === "cast-spell" && action.card === card) return action.xCost?.maxX;
  }
  return undefined;
};

describe("Open the Way", () => {
  it("caps X at the players in the game, whatever the mana", () => {
    const { game } = table();
    lands(game, "Forest", 12);
    const way = toHand(game, "Open the Way");
    expect(offeredMaxX(game, way)).toBe(2);
    expect(() => cast(game, way, { x: 3 })).toThrow();
    expect(zone(game, way)).toBe("hand");
  });

  it("counts four in a four-player game, and three once one has left", () => {
    const { game } = table({ players: 4 });
    lands(game, "Forest", 12);
    const way = toHand(game, "Open the Way");
    expect(offeredMaxX(game, way)).toBe(4);
    game.state.players[C].hasLost = true;
    expect(offeredMaxX(game, way)).toBe(3);
  });

  it("is still limited by the mana", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    expect(offeredMaxX(game, toHand(game, "Open the Way"))).toBe(1);
  });

  it("puts X lands onto the battlefield tapped and the rest on the bottom", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    // Top first, once placed: Bears, Plains, Elves, Island, then Swamp stays.
    const swamp = toLibrary(game, "Swamp");
    const island = toLibrary(game, "Island");
    const elves = toLibrary(game, "Llanowar Elves");
    const plains = toLibrary(game, "Plains");
    const bears = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Open the Way"), { x: 2 });
    expect(zone(game, plains)).toBe("battlefield");
    expect(zone(game, island)).toBe("battlefield");
    expect(game.state.objects[plains].tapped).toBe(true);
    expect(game.state.objects[island].tapped).toBe(true);
    expect(zone(game, swamp)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.indexOf(bears)).toBeGreaterThan(library.indexOf(swamp));
    expect(library.indexOf(elves)).toBeGreaterThan(library.indexOf(swamp));
  });

  it("X = 0 reveals nothing", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const plains = toLibrary(game, "Plains");
    cast(game, toHand(game, "Open the Way"), { x: 0 });
    expect(zone(game, plains)).toBe("library");
  });
});
