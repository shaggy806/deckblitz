/**
 * Recheck list R3, group B: the cards whose old blockers have been built since.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, enter, hand, life, settle, spawn, table, toStep } from "./harness.js";

describe("Court of Ambition", () => {
  it("as the monarch: each opponent discards two cards or loses 6", () => {
    const { game, b, c } = table({ players: 3 });
    enter(game, "Court of Ambition");
    expect(game.state.monarch).toBe(A);
    b.chooseModesFn = () => [0];
    b.chooseDiscardsFn = () => hand(game, B).slice(0, 2);
    c.chooseModesFn = () => [];
    toStep(game, "upkeep");
    const bBefore = hand(game, B).length;
    settle(game);
    expect(game.state.monarch).toBe(A);
    expect(hand(game, B)).toHaveLength(bBefore - 2);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(14);
  });

  it("not the monarch: each opponent discards a card or loses 3", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "Court of Ambition");
    b.chooseModesFn = () => [0];
    b.chooseDiscardsFn = () => hand(game, B).slice(0, 1);
    c.chooseModesFn = () => [];
    toStep(game, "upkeep");
    const bBefore = hand(game, B).length;
    settle(game);
    expect(hand(game, B)).toHaveLength(bBefore - 1);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(17);
  });
});
