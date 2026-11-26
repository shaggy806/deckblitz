/**
 * Domain counted from another player's side: the `{ basicLandTypes }` amount
 * takes any `PlayerRef` — Allied Strategies' "target player draws a card for
 * each basic land type among lands they control", Collapsing Borders' "that
 * player" of an upkeep.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, life, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

describe("domain of a player other than you", () => {
  it("Allied Strategies: the target player draws for the basic land types among their lands", () => {
    const { game } = table();
    lands(game, "Island", 5, A);
    spawn(game, "Island", B);
    spawn(game, "Island", B);
    spawn(game, "Swamp", B);
    spawn(game, "Forest", B);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Allied Strategies"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before + 3);
  });

  it("Allied Strategies on yourself: your own domain", () => {
    const { game } = table();
    lands(game, "Island", 4, A);
    spawn(game, "Mountain", A);
    spawn(game, "Swamp", B);
    spawn(game, "Forest", B);
    const card = toHand(game, "Allied Strategies");
    const before = hand(game, A).length;
    cast(game, card, { targets: [ref(A)] });
    // The cast card left the hand; two types among A's lands.
    expect(hand(game, A).length).toBe(before - 1 + 2);
  });

  it("Collapsing Borders: each upkeep, that player gains life for their domain, then takes 3", () => {
    const { game } = table();
    spawn(game, "Collapsing Borders", A);
    spawn(game, "Plains", B);
    spawn(game, "Mountain", B);
    lands(game, "Island", 3, A);
    const bBefore = life(game, B);
    toStep(game, "upkeep", B);
    settle(game);
    expect(life(game, B)).toBe(bBefore + 2 - 3);
    const aBefore = life(game, A);
    toStep(game, "upkeep", A);
    settle(game);
    expect(life(game, A)).toBe(aBefore + 1 - 3);
  });
});
