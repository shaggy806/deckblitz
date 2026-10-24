/**
 * Bolster N (rule 701.39a): choose a creature you control with the least
 * toughness (or tied for it) as the effect resolves — not a target — and put
 * N +1/+1 counters on it. Dromoka's Gift, Anafenza, Kin-Tree Spirit,
 * Sandsteppe War Riders.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, enter, lands, named, pickPermanents, settle, spawn, table, toHand, toStep } from "./harness.js";

describe("bolster", () => {
  it("goes on the one creature with the least toughness, unasked", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm");
    const picks = pickPermanents(a);
    const gift = toHand(game, "Dromoka's Gift");
    lands(game, "Forest", 5);
    cast(game, gift);
    expect(counters(game, bears)).toBe(4);
    expect(counters(game, wurm)).toBe(0);
    expect(picks.offered).toHaveLength(0);
  });

  it("asks among the tied creatures only, and puts every counter on the one chosen", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm");
    const picks = pickPermanents(a, other);
    const gift = toHand(game, "Dromoka's Gift");
    lands(game, "Forest", 5);
    cast(game, gift);
    expect([...picks.offered].sort()).toEqual([bears, other].sort());
    expect(counters(game, other)).toBe(4);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, wurm)).toBe(0);
  });

  it("isn't a target: an opponent's creature is never chosen, and with none of yours it does nothing", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const gift = toHand(game, "Dromoka's Gift");
    lands(game, "Forest", 5);
    cast(game, gift);
    expect(counters(game, theirs)).toBe(0);
  });

  it("puts the counters on one token of an identical pair", () => {
    const { game } = table();
    // Two 2/2 Human Knight tokens; the 4/4 Riders aren't least.
    enter(game, "Riders of Rohan");
    const gift = toHand(game, "Dromoka's Gift");
    lands(game, "Forest", 5);
    cast(game, gift);
    const knights = named(game, "Human Knight Token", A);
    const each = knights.flatMap((id) => Array<number>(game.state.objects[id].stackCount ?? 1).fill(counters(game, id)));
    expect(each.sort()).toEqual([0, 4]);
  });
});

describe("Anafenza, Kin-Tree Spirit", () => {
  it("bolsters 1 when another nontoken creature enters — onto Anafenza when it's least", () => {
    const { game } = table();
    const anafenza = spawn(game, "Anafenza, Kin-Tree Spirit");
    const wurm = enter(game, "Craw Wurm");
    expect(counters(game, anafenza)).toBe(1);
    expect(counters(game, wurm)).toBe(0);
  });
});

describe("Sandsteppe War Riders", () => {
  it("bolsters X at the beginning of combat, X the differently named artifact tokens", () => {
    const { game } = table({ step: "upkeep" });
    const riders = spawn(game, "Sandsteppe War Riders");
    const bears = spawn(game, "Grizzly Bears");
    for (const name of ["Treasure Token", "Treasure Token", "Clue Token"]) {
      game.state.objects[spawn(game, name)].isToken = true;
    }
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, riders)).toBe(0);
  });
});
