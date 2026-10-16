/**
 * A player who leaves the game during their own turn (rule 800.4a): the turn
 * goes on without them, and their precombat main phase adds no lore counter
 * to their Sagas (714.3c) — no chapter waits on a player who can't answer
 * (fuzzer seed 26, four players: a painland's damage in the draw step).
 */
import { describe, expect, it } from "vitest";

import { A, B, counters, spawn, table } from "./harness.js";

describe("a Saga whose controller has left", () => {
  it("gets no lore counter at its departed controller's precombat main", () => {
    const { game } = table({ players: 3, step: "upkeep" });
    const saga = spawn(game, "The Eldest Reborn");
    game.state.objects[saga].counters.lore = 1;
    spawn(game, "Grizzly Bears", B);
    game.state.players[A].life = 0;
    game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder !== null);
    expect(game.state.players[A].hasLost).toBe(true);
    expect(counters(game, saga, "lore")).toBe(1);
    expect(game.state.awaiting).toBeNull();
    // And the game goes on.
    game.advanceUntil((s) => s.turn.number === 2);
  });
});
