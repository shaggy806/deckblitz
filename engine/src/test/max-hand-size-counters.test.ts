/**
 * "Your maximum hand size is equal to the number of hour counters on this
 * enchantment" (Midnight Oil): `maxHandSize.set` as a `CountSpec`, read at
 * cleanup (rule 514.1), `countersOnThis` meaning the static's own permanent.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import { A, counters, enter, hand, life, nextTurn, table } from "./harness.js";

const fill = (game: Game, n: number): void => {
  while (hand(game).length < n) game.debugSpawn("Wastes", A, "hand");
};

describe("Midnight Oil", () => {
  it("enters with seven hour counters", () => {
    const { game } = table();
    const oil = enter(game, "Midnight Oil");
    expect(counters(game, oil, "hour")).toBe(7);
  });

  it("sets its controller's maximum hand size to its hour counters, and each discard costs 1 life", () => {
    const { game } = table();
    const oil = enter(game, "Midnight Oil");
    game.state.objects[oil].counters.hour = 3;
    fill(game, 6);
    const held = hand(game).length;
    const before = life(game);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(hand(game).length).toBe(3);
    expect(life(game)).toBe(before - (held - 3));
  });

  it("with no hour counters, its controller's maximum hand size is 0", () => {
    const { game } = table();
    const oil = enter(game, "Midnight Oil");
    game.state.objects[oil].counters.hour = 0;
    fill(game, 2);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(hand(game).length).toBe(0);
  });

  it("draws an additional card in its controller's draw step and removes two hour counters", () => {
    const { game } = table();
    const oil = enter(game, "Midnight Oil");
    nextTurn(game);
    const before = hand(game).length;
    nextTurn(game);
    expect(hand(game).length).toBe(before + 2);
    expect(counters(game, oil, "hour")).toBe(5);
  });

  it("still draws the additional card with no hour counters left (the ruling)", () => {
    const { game } = table();
    const oil = enter(game, "Midnight Oil");
    game.state.objects[oil].counters.hour = 1;
    nextTurn(game);
    const before = hand(game).length;
    nextTurn(game);
    expect(hand(game).length).toBe(before + 2);
    expect(counters(game, oil, "hour")).toBe(0);
  });
});
