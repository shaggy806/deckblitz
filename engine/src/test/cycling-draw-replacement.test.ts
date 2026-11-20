/**
 * A draw replacement for the draw a cycling ability makes (`would-draw`
 * `byCyclingOf`, rule 702.29a), the cycled card the effect's
 * `"trigger-object"` — Unpredictable Cyclone.
 */

import { describe, expect, it } from "vitest";

import { A, hand, lands, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Unpredictable Cyclone", () => {
  it("replaces a nonland card's cycling draw: exiles to a card sharing a type, casts it free, the rest to the bottom", () => {
    const { game, a } = table();
    spawn(game, "Unpredictable Cyclone");
    lands(game, "Wastes", 1);
    const healer = toHand(game, "Drannith Healer");
    const bears = toLibrary(game, "Grizzly Bears");
    const wastes = toLibrary(game, "Wastes");
    const cards = hand(game).length;
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === bears);
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: bears, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    game.dispatch({ type: "cycle", player: A, card: healer });
    settle(game);
    expect(zone(game, healer)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    // No card drawn; the land exiled on the way went to the bottom.
    expect(hand(game).length).toBe(cards - 1);
    expect(zone(game, wastes)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.indexOf(wastes)).toBe(library.length - 1);
  });

  it("puts the card found on the bottom too when it isn't cast", () => {
    const { game } = table();
    spawn(game, "Unpredictable Cyclone");
    lands(game, "Wastes", 1);
    const healer = toHand(game, "Drannith Healer");
    const bears = toLibrary(game, "Grizzly Bears");
    const cards = hand(game).length;
    game.dispatch({ type: "cycle", player: A, card: healer });
    settle(game);
    expect(zone(game, bears)).toBe("library");
    expect(hand(game).length).toBe(cards - 1);
  });

  it("leaves a land's cycling draw alone", () => {
    const { game } = table();
    spawn(game, "Unpredictable Cyclone");
    lands(game, "Plains", 1);
    const steppe = toHand(game, "Secluded Steppe");
    const top = toLibrary(game, "Grizzly Bears");
    game.dispatch({ type: "cycle", player: A, card: steppe });
    settle(game);
    expect(zone(game, top)).toBe("hand");
  });
});
