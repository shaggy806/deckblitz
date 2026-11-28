/**
 * A CDA `difference` of two counts (rule 604.3) — Roiling Horror's "your
 * life total minus the life total of an opponent with the most life", read
 * in every zone, negative when behind (rule 107.1b).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, lands, nextTurn, pickTargets, pt, spawn, table, toHand, zone } from "./harness.js";

describe("Roiling Horror", () => {
  it("is its controller's life minus the most life among their opponents", () => {
    const { game } = table({ players: 3 });
    const horror = spawn(game, "Roiling Horror", A);
    game.state.players[A].life = 30;
    game.state.players[B].life = 22;
    game.state.players[C].life = 25;
    expect(pt(game, horror)).toEqual({ power: 5, toughness: 5 });
  });

  it("reads its owner's life in the hand, and goes negative when behind", () => {
    const { game } = table();
    const horror = toHand(game, "Roiling Horror", A);
    game.state.players[A].life = 18;
    expect(pt(game, horror)).toEqual({ power: -2, toughness: -2 });
  });

  it("dies to the state-based check at equal life", () => {
    const { game } = table();
    const horror = spawn(game, "Roiling Horror", A);
    nextTurn(game);
    expect(zone(game, horror)).toBe("graveyard");
  });

  it("drains a target player for each time counter removed while suspended", () => {
    const t = table();
    const { game } = t;
    lands(game, "Swamp", 5, A);
    const horror = toHand(game, "Roiling Horror", A);
    game.dispatch({ type: "suspend", player: A, card: horror, xValue: 2 });
    expect(game.state.objects[horror].counters.time).toBe(2);
    pickTargets(t.a, B);
    nextTurn(game); // Bob's turn
    nextTurn(game); // Alice's: a counter comes off in her upkeep
    expect(game.state.objects[horror].counters.time).toBe(1);
    expect(game.state.players[B].life).toBe(19);
    expect(game.state.players[A].life).toBe(21);
  });
});
