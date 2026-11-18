/**
 * "Whenever you surveil for the first time each turn"
 * (`trigger:surveils-first-time-each-turn`): the timing wrapper on the
 * `surveils` row, counted from the journal's `scried` entries the row's
 * `journaledIf` keeps (`how: "surveil"`) — a scry is no surveil, and a
 * surveil before the permanent entered still counts (its ruling). Whispering
 * Snitch.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import { A, B, life, nextTurn, settle, spawn, table } from "./harness.js";

/** `player` surveils (or scries) `count`, keeping every card on top. */
function look(game: Game, mode: "surveil" | "scry", count = 1, player: PlayerId = A): void {
  game.debugApplyEffect(player, { kind: mode, amount: count });
  game.dispatch({ type: "scry", player, away: [] });
  settle(game);
}

describe("Whispering Snitch", () => {
  it("drains each opponent for 1 the first time you surveil each turn, and not again that turn", () => {
    const { game } = table();
    spawn(game, "Whispering Snitch");
    look(game, "surveil");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    look(game, "surveil", 2);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    // A new turn (bob's): your first surveil of it.
    nextTurn(game);
    look(game, "surveil");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("doesn't count a scry, but counts a surveil from before it entered", () => {
    const { game } = table();
    spawn(game, "Whispering Snitch");
    look(game, "scry");
    expect(life(game, B)).toBe(20);
    look(game, "surveil");
    expect(life(game, B)).toBe(19);

    const { game: g2 } = table();
    look(g2, "surveil");
    spawn(g2, "Whispering Snitch");
    look(g2, "surveil");
    expect(life(g2, B)).toBe(20);
  });

  it("doesn't trigger on an opponent's surveil", () => {
    const { game } = table();
    spawn(game, "Whispering Snitch");
    look(game, "surveil", 1, B);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
  });
});
