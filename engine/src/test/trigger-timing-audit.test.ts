import { describe, expect, it } from "vitest";

import { A, B, cast, lands, pickTargets, settle, spawn, table, toHand, zone } from "./harness.js";

/**
 * A rules audit (2026-11-26): when triggers look, and what they find — a
 * state trigger without an intervening "if" (rule 603.8), and a dies trigger
 * of a creature that died in the same event as the rest (603.10a).
 */
describe("trigger timing, audited", () => {
  it("Emperor Crocodile's state trigger sacrifices it though a creature arrived before it resolved (rules 603.8, 603.4)", () => {
    const { game } = table();
    const croc = spawn(game, "Emperor Crocodile");
    // Nothing else: the trigger goes on the stack; a creature arrives in response.
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.awaiting === null);
    spawn(game, "Grizzly Bears");
    settle(game);
    expect(zone(game, croc)).toBe("graveyard");
  });

  it("Blood Artist dying in a wrath sees itself and every creature that died with it (rule 603.10a)", () => {
    const { game, a } = table();
    spawn(game, "Blood Artist");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    lands(game, "Plains", 4);
    const mine = game.state.players[A].life;
    const theirs = game.state.players[B].life;
    cast(game, toHand(game, "Wrath of God"));
    expect(game.state.players[A].life).toBe(mine + 4);
    expect(game.state.players[B].life).toBe(theirs - 4);
  });
});
