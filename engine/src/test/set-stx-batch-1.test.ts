/**
 * Strixhaven: School of Mages, batch 1 (B111): learn's rummage (rule 701.48a;
 * its Lesson half, from a sideboard, is in outside-the-game.test.ts) — and
 * the cards the scaffolder finished with it.
 */
import { describe, expect, it } from "vitest";

import { A, cast, destroy, graveyard, hand, lands, pickModes, settle, spawn, table, toHand, zone } from "./harness.js";

describe("learn (rule 701.48a)", () => {
  it("Pop Quiz: draws, then learn discards the chosen card and draws another", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = toHand(game, "Grizzly Bears");
    const quiz = toHand(game, "Pop Quiz");
    const before = hand(game, A).length;
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [bears];
    cast(game, quiz);
    expect(zone(game, bears)).toBe("graveyard");
    // Pop Quiz left the hand, then: draw, discard, draw.
    expect(hand(game, A).length).toBe(before - 1 + 1 - 1 + 1);
  });

  it("declining learn discards nothing and draws nothing more", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = toHand(game, "Grizzly Bears");
    const quiz = toHand(game, "Pop Quiz");
    const before = hand(game, A).length;
    const yardBefore = graveyard(game, A).length;
    pickModes(a);
    cast(game, quiz);
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, A).length).toBe(before - 1 + 1);
    // Only Pop Quiz itself went to the graveyard.
    expect(graveyard(game, A).length).toBe(yardBefore + 1);
  });

  it("a madness card discarded to learn is still discarded: the draw follows (Eyetwitch dying)", () => {
    const { game, a } = table();
    const eyetwitch = spawn(game, "Eyetwitch");
    const imp = toHand(game, "Kitchen Imp");
    const before = hand(game, A).length;
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [imp];
    // Declines to cast the Imp for its madness cost: it goes to the graveyard.
    a.chooseCastNowFn = () => null;
    destroy(game, eyetwitch);
    settle(game);
    expect(zone(game, eyetwitch)).toBe("graveyard");
    expect(zone(game, imp)).toBe("graveyard");
    // −1 Imp discarded, +1 learn's draw.
    expect(hand(game, A).length).toBe(before);
  });
});
