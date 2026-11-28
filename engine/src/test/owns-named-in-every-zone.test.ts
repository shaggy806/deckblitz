/**
 * "You win the game if you own a card named Hedron Alignment in exile, in
 * your hand, in your graveyard, and on the battlefield" (Hedron Alignment):
 * an `all` of one ownership condition per zone, read after the hand is
 * revealed. No engine code of its own — `cards-in-exile`, `hand-size`,
 * `cards-in-graveyard` and an `aggregate` count with `ownedBy`.
 */
import { describe, expect, it } from "vitest";

import { A, B, enter, nextTurn, pickModes, table, toExile, toGraveyard, toHand } from "./harness.js";

const upkeepOf = (game: ReturnType<typeof table>["game"]) => {
  nextTurn(game);
  nextTurn(game);
};

describe("Hedron Alignment", () => {
  it("wins at your upkeep with one in exile, in hand, in the graveyard and itself on the battlefield", () => {
    const { game, a } = table();
    enter(game, "Hedron Alignment");
    toExile(game, "Hedron Alignment");
    toGraveyard(game, "Hedron Alignment");
    toHand(game, "Hedron Alignment");
    pickModes(a, 0);
    upkeepOf(game);
    expect(game.state.result.winner).toBe(A);
  });

  it("doesn't win with one zone missing (the graveyard)", () => {
    const { game, a } = table();
    enter(game, "Hedron Alignment");
    toExile(game, "Hedron Alignment");
    toHand(game, "Hedron Alignment");
    pickModes(a, 0);
    upkeepOf(game);
    expect(game.state.result.winner).toBeNull();
  });

  it("declined, it doesn't win even with all four", () => {
    const { game, a } = table();
    enter(game, "Hedron Alignment");
    toExile(game, "Hedron Alignment");
    toGraveyard(game, "Hedron Alignment");
    toHand(game, "Hedron Alignment");
    pickModes(a);
    upkeepOf(game);
    expect(game.state.result.winner).toBeNull();
  });

  it("an opponent's card of the name in exile isn't one you own", () => {
    const { game, a } = table();
    enter(game, "Hedron Alignment");
    toExile(game, "Hedron Alignment", B);
    toGraveyard(game, "Hedron Alignment");
    toHand(game, "Hedron Alignment");
    pickModes(a, 0);
    upkeepOf(game);
    expect(game.state.result.winner).toBeNull();
  });
});
