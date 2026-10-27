/**
 * An ability without `{T}` may be paid with its own source's mana, which the
 * planner only *avoids* — tries last. That preference must never make a
 * payable cost unpayable: the legality check doesn't avoid anything, so it
 * offered the activation and dispatch then failed (a fuzzer crash,
 * 2026-10-27, seed 22 at four players).
 */

import { describe, expect, it } from "vitest";

import { activate, lands, spawn, table, toHand } from "./harness.js";

describe("paying an ability with its own source last", () => {
  it("Dread Statuary's {4} is paid with its own {C} when nothing else is left", () => {
    const { game } = table();
    const statuary = spawn(game, "Dread Statuary");
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    spawn(game, "Crypt of the Eternals");
    // Coloured cards in hand steer the planner's choice of sources — what
    // made the avoided-source plan fail.
    toHand(game, "Lightning Bolt");
    toHand(game, "Duress");
    activate(game, statuary, 1, {});
    expect(game.state.objects[statuary].tapped).toBe(true);
  });
});
