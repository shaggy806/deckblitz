/**
 * "As this creature enters, you may reveal … from your hand" (rules 614.1c,
 * 614.12, 701.20a — `AsEntersAction.reveal`): the cards are chosen and
 * revealed as it's about to enter and stay in the hand; how many is
 * `"done-as-enters"`, and the counters' `ifDone` reads whether any was, or a
 * condition as it enters. Dragon's Disciple (up to one Dragon card; "if you do
 * or if you control a Dragon") and Arsenal Thresher (any number of other
 * artifact cards, a counter for each).
 */

import { describe, expect, it } from "vitest";

import { A, cast, counters, hand, lands, pickFromZone, spawn, table, toHand, zone } from "./harness.js";

describe("Dragon's Disciple", () => {
  it("revealing a Dragon card gives it a +1/+1 counter, and the card stays in hand", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const dragon = toHand(game, "Shivan Dragon");
    toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, dragon);
    const disciple = toHand(game, "Dragon's Disciple");
    cast(game, disciple);
    expect(seen.offered).toEqual([dragon]);
    expect(zone(game, disciple)).toBe("battlefield");
    expect(counters(game, disciple)).toBe(1);
    expect(hand(game)).toContain(dragon);
    expect(game.state.revealedThisTurn).toContain(dragon);
  });

  it("declining the reveal, with no Dragon on the battlefield, gives no counter", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    toHand(game, "Shivan Dragon");
    pickFromZone(a);
    const disciple = toHand(game, "Dragon's Disciple");
    cast(game, disciple);
    expect(counters(game, disciple)).toBe(0);
  });

  it("controlling a Dragon gives the counter with nothing revealed", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Shivan Dragon", A);
    const disciple = toHand(game, "Dragon's Disciple");
    cast(game, disciple);
    expect(counters(game, disciple)).toBe(1);
  });

  it("with neither, no counter", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Grizzly Bears", A);
    const disciple = toHand(game, "Dragon's Disciple");
    cast(game, disciple);
    expect(counters(game, disciple)).toBe(0);
  });
});

describe("Arsenal Thresher", () => {
  it("a +1/+1 counter for each other artifact card revealed", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Plains", 2);
    const ring = toHand(game, "Sol Ring");
    const stone = toHand(game, "Mind Stone");
    toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, ring, stone);
    const thresher = toHand(game, "Arsenal Thresher");
    cast(game, thresher);
    expect([...seen.offered].sort()).toEqual([ring, stone].sort());
    expect(counters(game, thresher)).toBe(2);
    expect(hand(game)).toEqual(expect.arrayContaining([ring, stone]));
  });

  it("revealing fewer gives fewer", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Plains", 2);
    const ring = toHand(game, "Sol Ring");
    toHand(game, "Mind Stone");
    pickFromZone(a, ring);
    const thresher = toHand(game, "Arsenal Thresher");
    cast(game, thresher);
    expect(counters(game, thresher)).toBe(1);
  });
});
