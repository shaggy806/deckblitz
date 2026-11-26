/**
 * "+2/+0 for each graveyard with seven or more cards in it" — a count of
 * players, each graveyard on its own (`grantPtPerCount.players` with
 * `cards-in-graveyard`'s `whose: "that-player"`): Master's Councillors.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, nextTurn, pickTargets, pt, settle, spawn, table, toGraveyard } from "./harness.js";

const fill = (game: Game, player: PlayerId, n: number): void => {
  for (let i = 0; i < n; i += 1) toGraveyard(game, "Forest", player);
};

describe("Master's Councillors", () => {
  it("gets +2/+0 for each graveyard, yours included, with seven or more cards", () => {
    const { game } = table();
    const councillors = spawn(game, "Master's Councillors", A);
    expect(pt(game, councillors)).toEqual({ power: 1, toughness: 3 });
    fill(game, B, 6);
    expect(pt(game, councillors).power).toBe(1);
    fill(game, B, 1);
    expect(pt(game, councillors).power).toBe(3);
    fill(game, A, 7);
    expect(pt(game, councillors)).toEqual({ power: 5, toughness: 3 });
  });

  it("each graveyard counts on its own: cards spread across them don't add up", () => {
    const { game } = table();
    const councillors = spawn(game, "Master's Councillors", A);
    fill(game, A, 6);
    fill(game, B, 6);
    expect(pt(game, councillors).power).toBe(1);
  });

  it("the second card drawn in a turn makes target player mill three; the third doesn't", () => {
    const { game, a } = table();
    spawn(game, "Master's Councillors", A);
    pickTargets(a, B);
    nextTurn(game);
    nextTurn(game);
    // Alice's draw step's card was her first this turn.
    expect(activePlayerOf(game.state)).toBe(A);
    const graveyard = game.state.zones.perPlayer[B].graveyard;
    expect(graveyard).toHaveLength(0);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(graveyard).toHaveLength(3);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(graveyard).toHaveLength(3);
  });

  it("an opponent's second draw doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Master's Councillors", A);
    pickTargets(a, B);
    game.debugApplyEffect(B, { kind: "draw", amount: 2 }, []);
    settle(game);
    expect(game.state.zones.perPlayer[B].graveyard).toHaveLength(0);
  });
});
