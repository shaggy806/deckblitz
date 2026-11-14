/**
 * What a pile of identical noncreature tokens is worth to v2's evaluation
 * (`TOKEN_CAP`, `EXTRA_TOKEN_CAP`), and what a low library costs it
 * (`libraryDanger`). Both were zero where it mattered in one live game
 * (room K6DYC, 2026-11-14): 31 Treasures spent on nothing scored the same
 * as keeping them, and every draw was a gain down to the last card.
 */
import { describe, expect, it } from "vitest";

import { DEFAULT_WEIGHTS, evaluateState } from "../bot/evaluate.js";
import { EXTRA_TOKEN_CAP, TOKEN_CAP } from "../bot/features.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const registry = createDefaultRegistry();

function board(setup: (game: Game) => void): number {
  const game = Game.create({
    seed: 3,
    registry,
    decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  setup(game);
  return evaluateState(game.state, registry, A, DEFAULT_WEIGHTS);
}

const treasures = (count: number) => (game: Game) => {
  for (let i = 0; i < count; i += 1) {
    game.state.objects[game.debugSpawn("Treasure Token", A, "battlefield")].isToken = true;
  }
};

describe("a pile of Treasures", () => {
  it("is worth more with each token up to the two caps", () => {
    expect(board(treasures(TOKEN_CAP))).toBeGreaterThan(board(treasures(TOKEN_CAP - 1)));
    expect(board(treasures(TOKEN_CAP + 1))).toBeGreaterThan(board(treasures(TOKEN_CAP)));
    expect(board(treasures(TOKEN_CAP + EXTRA_TOKEN_CAP))).toBeGreaterThan(
      board(treasures(TOKEN_CAP + EXTRA_TOKEN_CAP - 1)),
    );
  });

  it("is worth no more past them, so making Treasures is never a gain without end", () => {
    const full = TOKEN_CAP + EXTRA_TOKEN_CAP;
    expect(board(treasures(full + 1))).toBe(board(treasures(full)));
    expect(board(treasures(40))).toBe(board(treasures(full)));
  });

  it("costs something to spend down: nine left of forty score below the forty", () => {
    expect(board(treasures(9))).toBeLessThan(board(treasures(40)));
  });
});

describe("a low library", () => {
  const cut = (cards: number, hand: number) => (game: Game) => {
    const zones = game.state.zones.perPlayer[A];
    zones.library = zones.library.slice(0, cards);
    zones.hand = [];
    for (let i = 0; i < hand; i += 1) game.debugSpawn("Craw Wurm", A, "hand");
  };

  it("makes a card in hand worth less than the library card it came from, below fifteen", () => {
    // The same eleven cards: ten in the library and one in hand, or eleven
    // in the library.
    expect(board(cut(10, 1))).toBeLessThan(board(cut(11, 0)));
  });

  it("leaves a draw from a full library a gain", () => {
    expect(board(cut(30, 1))).toBeGreaterThan(board(cut(31, 0)));
  });
});
