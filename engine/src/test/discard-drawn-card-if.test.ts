/**
 * "Draw a card and reveal it. If it isn't a land card, discard it"
 * (Fa'adiyah Seer, Sindbad): a `draw`, `reveal-drawn`, then a `discard` whose
 * filter is the card drawn this way — no choice, and no other card of the
 * hand at risk.
 */
import { describe, expect, it } from "vitest";

import { A, activate, graveyard, hand, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Fa'adiyah Seer", () => {
  it("keeps a land drawn", () => {
    const { game } = table();
    const seer = spawn(game, "Fa'adiyah Seer", A);
    game.state.zones.perPlayer[A].hand = [];
    const forest = toLibrary(game, "Forest", A);
    activate(game, seer, 0);
    expect(zone(game, forest)).toBe("hand");
    expect(graveyard(game, A)).toEqual([]);
  });

  it("discards a nonland drawn, and only that card", () => {
    const { game } = table();
    const seer = spawn(game, "Fa'adiyah Seer", A);
    game.state.zones.perPlayer[A].hand = [];
    const kept = toHand(game, "Lightning Bolt", A);
    const bears = toLibrary(game, "Grizzly Bears", A);
    activate(game, seer, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, A)).toEqual([kept]);
  });
});

describe("Sindbad", () => {
  it("discards a nonland drawn", () => {
    const { game } = table();
    const sindbad = spawn(game, "Sindbad", A);
    const bolt = toLibrary(game, "Lightning Bolt", A);
    activate(game, sindbad, 0);
    expect(zone(game, bolt)).toBe("graveyard");
  });
});
