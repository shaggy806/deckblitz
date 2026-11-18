/**
 * Revealing the top card of a target opponent's library and reading it
 * (`reveal-top`'s `of`, `{ thisWay: "revealed" }`) — Prophecy, one of the
 * cards `effect:reveal-top-any-library` freed.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, life, ref, settle, table, toHand, toLibrary, toStep } from "./harness.js";

describe("Prophecy", () => {
  it("gains 1 life for a land on top, and draws a card at the next upkeep", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    toLibrary(game, "Forest", B);
    const prophecy = toHand(game, "Prophecy");
    cast(game, prophecy, { targets: [ref(B)] });
    expect(life(game, A)).toBe(21);
    const before = hand(game, A).length;
    toStep(game, "upkeep", B);
    settle(game);
    // Bob's upkeep is the next turn's: alice draws then.
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("gains nothing for a nonland, and still draws (the ruling)", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    toLibrary(game, "Grizzly Bears", B);
    const prophecy = toHand(game, "Prophecy");
    cast(game, prophecy, { targets: [ref(B)] });
    expect(life(game, A)).toBe(20);
    const before = hand(game, A).length;
    toStep(game, "upkeep", B);
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
  });
});
