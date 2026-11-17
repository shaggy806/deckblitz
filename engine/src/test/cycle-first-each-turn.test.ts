/**
 * "Whenever you cycle another card for the first time each turn" (Valiant
 * Rescuer): the `cycles` trigger takes the timing wrapper, counted by
 * `Game.timingCount` from the journal's `cycled` entries (rule 702.29c). Need
 * key trigger:first-cycle-each-turn.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, lands, nextTurn, settle, spawn, table, toHand, tokensNamed } from "./harness.js";
import { timingCountable } from "../trigger-events.js";

const cycle = (game: Game, card: ObjectId): void => {
  game.dispatch({ type: "cycle", player: A, card });
  settle(game);
};

const soldiers = (game: Game): number => tokensNamed(game, "Human Soldier Token", A);

describe("Valiant Rescuer", () => {
  it("makes a Soldier for the first card cycled each turn, not the second", () => {
    const { game } = table();
    spawn(game, "Valiant Rescuer");
    lands(game, "Wastes", 2);
    cycle(game, toHand(game, "Startling Development"));
    expect(soldiers(game)).toBe(1);
    cycle(game, toHand(game, "Startling Development"));
    expect(soldiers(game)).toBe(1);
    // A new turn, a new first time.
    nextTurn(game);
    nextTurn(game);
    lands(game, "Wastes", 1);
    cycle(game, toHand(game, "Startling Development"));
    expect(soldiers(game)).toBe(2);
  });

  it("counts a card cycled this turn before it was on the battlefield", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    cycle(game, toHand(game, "Startling Development"));
    spawn(game, "Valiant Rescuer");
    cycle(game, toHand(game, "Startling Development"));
    expect(soldiers(game)).toBe(0);
  });

  it("is a kind the timing wrapper counts", () => {
    expect(timingCountable({ on: "cycles", who: "you", otherOnly: true, firstTimeEachTurn: true })).toBe(true);
  });
});
