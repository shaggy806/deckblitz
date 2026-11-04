/**
 * "Your first, second, or third turn of the game": each player's own count of
 * turns taken (`PlayerState.turnsTaken`, the `turns-taken` condition). Extra
 * turns count; a skipped turn doesn't; another player's turns don't, and on
 * them it isn't "your" turn.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, cast, lands, life, nextTurn, spawn, table, toHand } from "./harness.js";

const entersTapped = (game: Game): boolean => game.state.objects[spawn(game, "Starting Town", A)].tapped;

describe("the count of a player's own turns", () => {
  it("each player counts their own", () => {
    const { game } = table();
    expect(game.state.players[A].turnsTaken).toBe(1);
    expect(game.state.players[B].turnsTaken ?? 0).toBe(0);
    nextTurn(game);
    expect(game.state.players[A].turnsTaken).toBe(1);
    expect(game.state.players[B].turnsTaken).toBe(1);
    nextTurn(game);
    expect(game.state.players[A].turnsTaken).toBe(2);
  });

  it("an extra turn is one of them", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const walk = (): void => {
      cast(game, toHand(game, "Time Walk"));
      nextTurn(game);
      expect(game.state.turn.isExtra).toBe(true);
    };
    walk(); // A's second
    expect(game.state.players[A].turnsTaken).toBe(2);
    walk(); // A's third
    expect(entersTapped(game)).toBe(false);
    walk(); // A's fourth, with B yet to take a turn
    expect(game.state.players[B].turnsTaken ?? 0).toBe(0);
    expect(game.state.players[A].turnsTaken).toBe(4);
    expect(entersTapped(game)).toBe(true);
  });

  it("a skipped turn was never taken (rule 614.10)", () => {
    const { game } = table();
    lands(game, "Island", 4);
    cast(game, toHand(game, "Meditate")); // skip A's next turn
    nextTurn(game); // B's first
    nextTurn(game); // A's second is skipped: B's second
    expect(game.state.players[A].turnsTaken).toBe(1);
    expect(game.state.players[B].turnsTaken).toBe(2);
  });
});

describe("Starting Town", () => {
  it("enters untapped on your first, second and third turns, tapped on your fourth", () => {
    const { game } = table();
    expect(entersTapped(game)).toBe(false); // A's first
    nextTurn(game); // B's first
    nextTurn(game); // A's second
    expect(entersTapped(game)).toBe(false);
    nextTurn(game);
    nextTurn(game); // A's third
    expect(entersTapped(game)).toBe(false);
    nextTurn(game);
    nextTurn(game); // A's fourth
    expect(entersTapped(game)).toBe(true);
  });

  it("enters tapped on another player's turn, however early", () => {
    const { game } = table();
    nextTurn(game); // B's first, and A has taken only one
    expect(game.state.players[A].turnsTaken).toBe(1);
    expect(entersTapped(game)).toBe(true);
  });

  it("makes any color for 1 life", () => {
    const { game } = table();
    spawn(game, "Starting Town", A);
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(game.state.objects[elves].zone).toBe("battlefield");
    expect(life(game, A)).toBe(19);
  });

  it("makes colorless for no life", () => {
    const { game } = table();
    spawn(game, "Starting Town", A);
    const ring = toHand(game, "Sol Ring");
    cast(game, ring);
    expect(game.state.objects[ring].zone).toBe("battlefield");
    expect(life(game, A)).toBe(20);
  });
});

describe("Serra Avenger", () => {
  it("can't be cast on your first three turns and can on your fourth", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const avenger = toHand(game, "Serra Avenger");
    expect(() => cast(game, avenger)).toThrow();
    nextTurn(game);
    nextTurn(game); // A's second
    expect(() => cast(game, avenger)).toThrow();
    nextTurn(game);
    nextTurn(game); // A's third
    expect(() => cast(game, avenger)).toThrow();
    nextTurn(game);
    nextTurn(game); // A's fourth
    cast(game, avenger);
    expect(game.state.objects[avenger].zone).toBe("battlefield");
  });

  it("can be cast on another player's early turns, with something to let it (the ruling)", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Vedalken Orrery", A);
    const avenger = toHand(game, "Serra Avenger");
    expect(() => cast(game, avenger)).toThrow(); // A's first
    nextTurn(game); // B's first
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, avenger);
    expect(game.state.objects[avenger].zone).toBe("battlefield");
  });
});
