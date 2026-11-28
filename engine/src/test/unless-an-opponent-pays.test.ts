/**
 * "Unless an opponent pays {2}" (Scarwood Bandits): each opponent in turn
 * order may pay, the next asked only once the one before declines (rule
 * 101.4), and the ability's controller never — `unless` with `chooser: {
 * anyOf: "each-opponent" }`. The control it gives lasts while Bandits stays
 * (rule 611.2b).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, activate, controller, lands, ref, settle, spawn, table } from "./harness.js";

const answer = (game: Game, player: PlayerId, pays: boolean): void => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
  expect(game.state.awaiting).toMatchObject({ kind: "choose-modes", player });
  game.dispatch({ type: "choose-modes", player, modes: pays ? [0] : [] });
};

const board = (players: 2 | 3 = 2): { game: Game; bandits: ObjectId; ring: ObjectId } => {
  const { game } = table({ players, openingHandSize: 0 });
  lands(game, "Forest", 3);
  for (const p of [B, C].slice(0, players - 1)) lands(game, "Island", 2, p);
  const bandits = spawn(game, "Scarwood Bandits");
  const ring = spawn(game, "Sol Ring", B);
  activate(game, bandits, 0, { targets: [ref(ring)], settle: false });
  return { game, bandits, ring };
};

describe("Scarwood Bandits", () => {
  it("nobody pays: gains control of the artifact, never asking its controller", () => {
    const { game, ring } = board();
    answer(game, B, false);
    settle(game);
    expect(controller(game, ring)).toBe(A);
  });

  it("an opponent pays {2}: nothing changes hands", () => {
    const { game, ring } = board();
    answer(game, B, true);
    settle(game);
    expect(controller(game, ring)).toBe(B);
  });

  it("asks each opponent in turn: the second may pay when the first declines", () => {
    const { game, ring } = board(3);
    answer(game, B, false);
    answer(game, C, true);
    settle(game);
    expect(controller(game, ring)).toBe(B);
  });

  it("the control ends as Bandits leaves the battlefield", () => {
    const { game, bandits, ring } = board();
    answer(game, B, false);
    settle(game);
    expect(controller(game, ring)).toBe(A);
    game.debugMove(bandits, "graveyard");
    settle(game);
    expect(controller(game, ring)).toBe(B);
  });
});
