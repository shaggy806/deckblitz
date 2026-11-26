/**
 * A player's speed reduced, never below a floor — the `reduce-speed` effect —
 * and speed as a `player-compare` stat (0 for a player with none, rule
 * 702.179f): Spikeshell Harrier's "return target creature or Vehicle an
 * opponent controls to its owner's hand. If that opponent's speed is greater
 * than each other player's speed, reduce that opponent's speed by 1. This
 * effect can't reduce their speed below 1."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import { A, B, C, enter, pickTargets, spawn, table, zone } from "./harness.js";

const speed = (game: Game, player: PlayerId): number | undefined => game.state.players[player].speed;
/** Give `player` a speed of `n` the way an effect would. */
const setSpeed = (game: Game, n: number, player: PlayerId): void =>
  game.debugApplyEffect(player, { kind: "increase-speed", amount: n - (game.state.players[player].speed ?? 0) });

/** Three players; bob's Bears bounced by alice's Harrier, with these speeds. */
function harrier(speeds: Partial<Record<PlayerId, number>>): Game {
  const { game, a } = table({ players: 3 });
  for (const [player, n] of Object.entries(speeds)) if (n !== undefined) setSpeed(game, n, player as PlayerId);
  const bears = spawn(game, "Grizzly Bears", B);
  pickTargets(a, bears);
  enter(game, "Spikeshell Harrier");
  expect(zone(game, bears)).toBe("hand");
  return game;
}

describe("Spikeshell Harrier", () => {
  it("that opponent's speed, greater than each other player's, goes down by 1", () => {
    const game = harrier({ [A]: 2, [B]: 3, [C]: 1 });
    expect(speed(game, B)).toBe(2);
    expect(speed(game, A)).toBe(2);
    expect(speed(game, C)).toBe(1);
  });

  it("tied for the greatest, it stays", () => {
    const game = harrier({ [A]: 3, [B]: 3 });
    expect(speed(game, B)).toBe(3);
  });

  it("can't reduce it below 1", () => {
    const game = harrier({ [B]: 1 });
    expect(speed(game, B)).toBe(1);
  });

  it("a player with no speed has 0 to compare, and none is given", () => {
    const game = harrier({ [C]: 2 });
    expect(speed(game, B)).toBeUndefined();
    expect(speed(game, C)).toBe(2);
  });
});
