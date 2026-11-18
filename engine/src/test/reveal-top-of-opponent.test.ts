/**
 * A revealed card read after the reveal, the spell's own targets kept — the
 * cards `effect:reveal-top-any-library` and the random-card reveal freed:
 * `reveal-top` (`of` a target opponent's library, or your own) or
 * `choose-random-card` from a hand, then `{ thisWay: "revealed" }` read in a
 * later step of the same sequence (Cerebral Eruption's shape). Prophecy,
 * Riddle of Lightning, Judge Unworthy, Planeswalker's Scorn and Favor.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, hand, lands, life, pt, ref, settle, spawn, table, toHand, toLibrary, toStep } from "./harness.js";

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

describe("Riddle of Lightning", () => {
  it("deals damage equal to the revealed top card's mana value to its target", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    toLibrary(game, "Hill Giant");
    const riddle = toHand(game, "Riddle of Lightning");
    cast(game, riddle, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("Judge Unworthy", () => {
  it("aims only at an attacking or blocking creature", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const judge = toHand(game, "Judge Unworthy");
    expect(() => cast(game, judge, { targets: [ref(bears)] })).toThrow(/target/i);
  });
});

describe("Planeswalker's Scorn and Favor", () => {
  it("Scorn: -X/-X, X the mana value of a card revealed at random from the opponent's hand", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const scorn = spawn(game, "Planeswalker's Scorn");
    game.state.zones.perPlayer[B].hand.length = 0;
    toHand(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, scorn, 0, { targets: [ref(B), ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });

  it("Favor: +X/+X, and X is 0 with an empty hand (the ruling)", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const favor = spawn(game, "Planeswalker's Favor");
    const bears = spawn(game, "Grizzly Bears");
    game.state.zones.perPlayer[B].hand.length = 0;
    toHand(game, "Hill Giant", B);
    activate(game, favor, 0, { targets: [ref(B), ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    game.state.zones.perPlayer[B].hand.length = 0;
    activate(game, favor, 0, { targets: [ref(B), ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});
