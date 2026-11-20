/**
 * "For each card type among spells you've cast this turn": the `castThisTurn`
 * amount's `cardTypes` (April O'Neil, Hacktivist) — each card type once,
 * among the spells as they were cast (rule 205.2a; legendary is a supertype).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import { A, cast, hand, lands, settle, spawn, table, toHand, toStep } from "./harness.js";

/** Run to A's end step, every trigger of it resolved. */
const toEndStep = (game: Game): void => {
  toStep(game, "end", A);
  settle(game);
};

describe("card types among spells cast this turn", () => {
  it("April O'Neil: an artifact creature spell and an instant are three types; four spells of them add none", () => {
    const { game } = table();
    spawn(game, "April O'Neil, Hacktivist");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Ornithopter"));
    cast(game, toHand(game, "Memnite"));
    cast(game, toHand(game, "Opt"));
    cast(game, toHand(game, "Opt"));
    const before = hand(game).length;
    toEndStep(game);
    expect(hand(game).length - before).toBe(3);
  });

  it("April O'Neil: a spell cast before she entered counts; with none cast she draws nothing", () => {
    const { game } = table();
    cast(game, toHand(game, "Ornithopter"));
    spawn(game, "April O'Neil, Hacktivist");
    const before = hand(game).length;
    toEndStep(game);
    expect(hand(game).length - before).toBe(2);

    const quiet = table().game;
    spawn(quiet, "April O'Neil, Hacktivist");
    const none = hand(quiet).length;
    toEndStep(quiet);
    expect(hand(quiet).length - none).toBe(0);
  });
});
