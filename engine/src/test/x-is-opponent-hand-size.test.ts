/**
 * `xIs: { cardsInHandOf: "an-opponent" }` (Bargaining Table): "X is the
 * number of cards in an opponent's hand", the opponent chosen as it's
 * activated (its ruling). The choice is read by nothing but X, so the ability
 * is offered once per hand size an opponent has, X fixed (rule 107.3c), and
 * any other X is refused.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, D, activate, hand, lands, spawn, table, toHand } from "./harness.js";

type Activate = Extract<LegalAction, { kind: "activate-ability" }>;

const offeredX = (game: Game, source: ObjectId): (number | undefined)[] =>
  game
    .legalActions(A)
    .filter((a): a is Activate => a.kind === "activate-ability" && a.source === source)
    .map((a) => (a.xCost !== undefined && (a.xCost.minX ?? 0) === a.xCost.maxX ? a.xCost.maxX : undefined))
    .sort();

const fillHand = (game: Game, player: typeof B, n: number): void => {
  for (let i = 0; i < n; i += 1) toHand(game, "Plains", player);
};

describe("Bargaining Table", () => {
  it("X is each opponent's hand size, one offer each", () => {
    const { game } = table({ players: 4, openingHandSize: 0 });
    lands(game, "Plains", 5);
    const tableId = spawn(game, "Bargaining Table");
    fillHand(game, B, 3);
    fillHand(game, C, 1);
    fillHand(game, D, 3);
    expect(offeredX(game, tableId)).toEqual([1, 3]);
  });

  it("activated at an opponent's hand size: pays that much, draws a card", () => {
    const { game } = table({ players: 3, openingHandSize: 0 });
    const plains = lands(game, "Plains", 3);
    const tableId = spawn(game, "Bargaining Table");
    fillHand(game, B, 2);
    fillHand(game, C, 4);
    const before = hand(game).length;
    activate(game, tableId, 0, { x: 2 });
    expect(hand(game).length).toBe(before + 1);
    expect(plains.filter((id) => game.state.objects[id].tapped)).toHaveLength(2);
  });

  it("an X no opponent's hand has is refused", () => {
    const { game } = table({ players: 3, openingHandSize: 0 });
    lands(game, "Plains", 5);
    const tableId = spawn(game, "Bargaining Table");
    fillHand(game, B, 2);
    fillHand(game, C, 4);
    expect(() => activate(game, tableId, 0, { x: 3 })).toThrow();
    expect(() => activate(game, tableId, 0, { x: 0 })).toThrow();
  });

  it("an empty hand is X = 0, free", () => {
    const { game } = table({ openingHandSize: 0 });
    const tableId = spawn(game, "Bargaining Table");
    expect(offeredX(game, tableId)).toEqual([0]);
    activate(game, tableId, 0, { x: 0 });
    expect(game.state.objects[tableId].tapped).toBe(true);
  });

  it("a hand size beyond the mana there is isn't offered", () => {
    const { game } = table({ players: 3, openingHandSize: 0 });
    lands(game, "Plains", 2);
    const tableId = spawn(game, "Bargaining Table");
    fillHand(game, B, 2);
    fillHand(game, C, 5);
    expect(offeredX(game, tableId)).toEqual([2]);
  });
});
