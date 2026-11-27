/**
 * "Your maximum hand size is reduced by three for the rest of the game"
 * (Inspired Idea): `player-effect`'s `maxHandSizeAdjust`, a change to the
 * player's maximum hand size (rule 402.2) read at cleanup (rule 514.1) and
 * applied at its timestamp with the other hand-size effects (rule 613.11).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import { A, B, cast, enter, hand, lands, table, toHand } from "./harness.js";

/** A table with the game's own maximum hand size, seven (rule 402.2): the
 * harness's default is 99. */
const seven = (): Game => {
  const { game } = table();
  for (const p of [A, B]) game.state.players[p].maxHandSize = 7;
  return game;
};

const fill =(game: Game, n: number): void => {
  while (hand(game).length < n) game.debugSpawn("Wastes", A, "hand");
};

describe("Inspired Idea", () => {
  it("draws three, and its caster's maximum hand size is four from then on", () => {
    const game = seven();
    lands(game, "Island", 3);
    const idea = toHand(game, "Inspired Idea");
    const before = hand(game).length;
    cast(game, idea);
    expect(hand(game).length).toBe(before - 1 + 3);
    fill(game, 9);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(hand(game).length).toBe(4);
    // The rest of the game: still four at A's next cleanup.
    fill(game, 9);
    game.advanceUntil((s) => s.turn.number === 4);
    expect(hand(game).length).toBe(4);
  });

  it("is only its caster's: the opponent's maximum stays seven", () => {
    const game = seven();
    lands(game, "Island", 3);
    cast(game, toHand(game, "Inspired Idea"));
    game.advanceUntil((s) => s.turn.number === 2);
    while (hand(game, B).length < 9) game.debugSpawn("Wastes", B, "hand");
    game.advanceUntil((s) => s.turn.number === 3);
    expect(hand(game, B).length).toBe(7);
  });

  it("two of them reduce it by six", () => {
    const game = seven();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Inspired Idea"));
    cast(game, toHand(game, "Inspired Idea"));
    fill(game, 9);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(hand(game).length).toBe(1);
  });

  it("cleaved, the bracketed reduction is gone", () => {
    const game = seven();
    lands(game, "Island", 5);
    cast(game, toHand(game, "Inspired Idea"), { overload: true });
    fill(game, 9);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(hand(game).length).toBe(7);
  });

  it("a later \"no maximum hand size\" wins over it (rule 613.11)", () => {
    const game = seven();
    lands(game, "Island", 3);
    cast(game, toHand(game, "Inspired Idea"));
    enter(game, "Reliquary Tower");
    fill(game, 9);
    const held = hand(game).length;
    expect(held).toBeGreaterThan(7);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(hand(game).length).toBe(held);
  });
});
