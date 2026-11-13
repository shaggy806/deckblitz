/**
 * The `{ youAnd }` player scope and the `thisWay` set's `who: "each-other"` —
 * Keen Duelist: "you and target opponent each reveal the top card of your
 * library. You each lose life equal to the mana value of the card revealed by
 * the other player. You each put the card you revealed into your hand."
 */
import { describe, expect, it } from "vitest";

import { A, B, C, hand, life, pickTargets, spawn, table, toLibrary, toStep } from "./harness.js";

describe("Keen Duelist", () => {
  it("each loses the other's card's mana value, and each takes their own card", () => {
    const seats = table();
    const { game } = seats;
    spawn(game, "Keen Duelist");
    toStep(game, "end", B);
    const mine = toLibrary(game, "Grizzly Bears"); // MV 2
    const theirs = toLibrary(game, "Wind Drake", B); // MV 3
    pickTargets(seats.a, B);
    toStep(game, "draw");
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(18);
    expect(hand(game, B)).toContain(theirs);
    // Alice's draw step came after: her revealed card was put in hand first.
    expect(hand(game, A)).toContain(mine);
  });

  it("one simultaneous loss, between the two of them only (a third player is untouched)", () => {
    const seats = table({ players: 3 });
    const { game } = seats;
    spawn(game, "Keen Duelist");
    toStep(game, "end", C);
    toLibrary(game, "Wind Drake"); // MV 3
    toLibrary(game, "Wind Drake", C);
    const land = toLibrary(game, "Forest", B); // MV 0
    pickTargets(seats.a, B);
    toStep(game, "draw");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(20);
    expect(hand(game, B)).toContain(land);
  });
});
