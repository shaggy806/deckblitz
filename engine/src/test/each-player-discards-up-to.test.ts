/**
 * "Each player may discard up to three cards. Mind Bomb deals damage to each
 * player equal to 3 minus the number of cards they discarded this way": a
 * scoped `discard` of `anyNumber` with `atMost`, then a `damage` to each
 * player of `{ thisWay: "discarded", who: "each" }` read per player.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, graveyard, hand, lands, life, table, toHand } from "./harness.js";

describe("Mind Bomb", () => {
  it("each player chooses how many to discard, at most three, and is dealt 3 minus that many", () => {
    const { game, a, b } = table();
    const bomb = toHand(game, "Mind Bomb");
    lands(game, "Island", 1);
    for (let i = 0; i < 4; i += 1) toHand(game, "Grizzly Bears", B);
    const offered: number[] = [];
    a.chooseDiscardsFn = () => [];
    b.chooseDiscardsFn = (h, count) => {
      offered.push(count);
      return h.slice(0, 2).map((o) => o.id);
    };
    const bHand = hand(game, B).length;
    const aGrave = graveyard(game, A).length;
    const [aLife, bLife] = [life(game, A), life(game, B)];
    cast(game, bomb);
    expect(offered).toEqual([3]);
    expect(hand(game, B).length).toBe(bHand - 2);
    expect(life(game, B)).toBe(bLife - 1);
    expect(life(game, A)).toBe(aLife - 3);
    expect(graveyard(game, A).length).toBe(aGrave + 1); // Mind Bomb itself
  });

  it("three discarded is no damage, none is all 3, at four players", () => {
    const { game, a, b, c } = table({ players: 4 });
    const bomb = toHand(game, "Mind Bomb");
    lands(game, "Island", 1);
    for (let i = 0; i < 3; i += 1) toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", A);
    const lifeBefore = { a: life(game, A), b: life(game, B), c: life(game, C) };
    a.chooseDiscardsFn = (h) => h.slice(0, 1).map((o) => o.id);
    b.chooseDiscardsFn = (h) => h.slice(0, 3).map((o) => o.id);
    c.chooseDiscardsFn = () => [];
    cast(game, bomb);
    expect(life(game, A)).toBe(lifeBefore.a - 2);
    expect(life(game, B)).toBe(lifeBefore.b);
    expect(life(game, C)).toBe(lifeBefore.c - 3);
  });
});
