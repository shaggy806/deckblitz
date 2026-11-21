/**
 * `win-game`'s `who: { greatest }` and `ifTied` — Celestial Convergence:
 * "the player with the highest life total wins the game. If two or more
 * players are tied for highest life total, the game is a draw" (rule 104.4c).
 */

import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import { A, B, C, counters, enter, table, toStep } from "./harness.js";

function convergenceAtOne(players: 2 | 4): { game: Game } {
  const { game } = table({ players });
  const convergence = enter(game, "Celestial Convergence");
  expect(counters(game, convergence, "omen")).toBe(7);
  game.state.objects[convergence].counters.omen = 1;
  invalidateComputedCache();
  return { game };
}

describe("Celestial Convergence", () => {
  it("loses an omen counter each upkeep and does nothing while any are left", () => {
    const { game } = table();
    const convergence = enter(game, "Celestial Convergence");
    toStep(game, "precombat-main");
    expect(counters(game, convergence, "omen")).toBe(6);
    expect(game.state.result.over).toBe(false);
  });

  it("with the last counter gone, the player with the highest life total wins — not necessarily its controller", () => {
    const { game } = convergenceAtOne(4);
    game.state.players[C].life += 5;
    toStep(game, "precombat-main");
    expect(game.state.result.over).toBe(true);
    expect(game.state.result.winner).toBe(C);
  });

  it("two or more tied for highest life total: the game is a draw", () => {
    const { game } = convergenceAtOne(4);
    game.state.players[A].life += 10;
    game.state.players[B].life += 10;
    toStep(game, "precombat-main");
    expect(game.state.result.over).toBe(true);
    expect(game.state.result.winner).toBeNull();
  });
});
