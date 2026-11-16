/**
 * `lose-game`'s `whoseIf`: "each player **with exactly 13 life** loses the
 * game" — every player of the scope the condition holds for, asked about each
 * as "that player", losing at once (rule 104.4a: all of them is a draw) —
 * Triskaidekaphobia.
 */
import { describe, expect, it } from "vitest";

import type { PlayerId } from "../primitives.js";
import { A, B, C, D, life, pickModes, settle, spawn, table, toStep } from "./harness.js";
import type { Game } from "../game.js";

/** `player`'s life set to `to`, through the engine — with the trigger still
 * on the stack, so it reads the new total as it resolves. */
function setLife(game: Game, player: PlayerId, to: number): void {
  const now = game.state.players[player].life;
  if (to < now) game.debugApplyEffect(player, { kind: "lose-life", amount: now - to });
  if (to > now) game.debugApplyEffect(player, { kind: "gain-life", amount: to - now });
}

const lost = (game: Game, player: PlayerId): boolean => game.state.players[player].hasLost;

describe("each player with exactly 13 life — Triskaidekaphobia", () => {
  it("the player at 13 loses, then each player still in gains 1 life", () => {
    const { game, a } = table({ players: 4 });
    spawn(game, "Triskaidekaphobia");
    pickModes(a, 0);
    toStep(game, "upkeep");
    // Set after the turns go round, just before the trigger resolves.
    setLife(game, B, 13);
    settle(game);
    expect(lost(game, B)).toBe(true);
    expect([life(game, A), life(game, C), life(game, D)]).toEqual([21, 21, 21]);
  });

  it("chosen with nobody at 13, each player loses 1 life", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Triskaidekaphobia");
    pickModes(a, 1);
    toStep(game, "upkeep");
    settle(game);
    expect([lost(game, A), lost(game, B), lost(game, C)]).toEqual([false, false, false]);
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([19, 19, 19]);
  });

  it("everyone at 13 is a draw", () => {
    const { game, a } = table({ players: 3, life: 13 });
    spawn(game, "Triskaidekaphobia");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.result.over).toBe(true);
    expect(game.state.result.winner).toBeNull();
  });

  it("an opponent at 13 loses before you at 1 lose 1 life", () => {
    const { game, a } = table();
    spawn(game, "Triskaidekaphobia");
    pickModes(a, 1);
    toStep(game, "upkeep");
    setLife(game, A, 1);
    setLife(game, B, 13);
    settle(game);
    expect(game.state.result.over).toBe(true);
    expect(game.state.result.winner).toBe(A);
  });

  it("losses come first: the life change can't save or doom anyone at 13", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Triskaidekaphobia");
    pickModes(a, 1);
    toStep(game, "upkeep");
    setLife(game, A, 1);
    setLife(game, B, 13);
    setLife(game, C, 14);
    settle(game);
    // Bob at 13 loses; then each loses 1: Carol to 13 (too late), Alice to 0.
    expect(lost(game, B)).toBe(true);
    expect(lost(game, A)).toBe(true);
    expect(lost(game, C)).toBe(false);
    expect(game.state.result.winner).toBe(C);
  });
});
