import { describe, expect, it } from "vitest";

import { A, B, activate, cast, counters, hand, lands, nextTurn, ref, spawn, table, toHand } from "./harness.js";

// "This turn, each creature you control enters with an additional +1/+1
// counter on it" (Zameck Guildmage, Combine Guildmage): a `replacement-effect`
// of `others-enter-battlefield` lasting the turn (rules 611.2c, 614.1c) —
// creatures that enter later this turn get it, the Guildmage gone or not.

describe("Zameck Guildmage", () => {
  it("a creature cast after it enters with a counter; twice, two; other players' don't", () => {
    const { game } = table();
    const mage = spawn(game, "Zameck Guildmage");
    lands(game, "Forest", 4);
    lands(game, "Island", 2);
    activate(game, mage, 0);
    activate(game, mage, 0);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears, "+1/+1")).toBe(2);
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(counters(game, theirs, "+1/+1")).toBe(0);
  });

  it("only this turn", () => {
    const { game } = table();
    const mage = spawn(game, "Zameck Guildmage");
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    activate(game, mage, 0);
    nextTurn(game);
    nextTurn(game);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears, "+1/+1")).toBe(0);
  });

  it("removes a +1/+1 counter from a creature you control to draw", () => {
    const { game } = table();
    const mage = spawn(game, "Zameck Guildmage");
    lands(game, "Forest", 4);
    lands(game, "Island", 2);
    activate(game, mage, 0);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    const before = hand(game, A).length;
    activate(game, mage, 1);
    expect(counters(game, bears, "+1/+1")).toBe(0);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("Combine Guildmage", () => {
  it("taps for the turn's counters, and moves one between your creatures", () => {
    const { game } = table();
    const mage = spawn(game, "Combine Guildmage");
    lands(game, "Forest", 3);
    lands(game, "Island", 1);
    activate(game, mage, 0);
    expect(game.state.objects[mage].tapped).toBe(true);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears, "+1/+1")).toBe(1);
    // Next turn: the move.
    nextTurn(game);
    nextTurn(game);
    const other = spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    activate(game, mage, 1, { targets: [ref(bears), ref(other)] });
    expect(counters(game, bears, "+1/+1")).toBe(0);
    expect(counters(game, other, "+1/+1")).toBe(1);
  });

  it("the second target must be another creature you control", () => {
    const { game } = table();
    const mage = spawn(game, "Combine Guildmage");
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, mage, 1, { targets: [ref(bears), ref(theirs)] })).toThrow(/target/i);
    expect(() => activate(game, mage, 1, { targets: [ref(bears), ref(bears)] })).toThrow(/target/i);
  });
});
