/**
 * Recheck list R7, group D (2026-10-28): cards once blocked on a coarse need
 * key since built, on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, counters, enter, hand, lands, named, pickTargets, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("Brimaz, Blight of Oreskos", () => {
  it("incubates for an artifact creature spell, not for a plain creature spell", () => {
    const { game } = table();
    spawn(game, "Brimaz, Blight of Oreskos");
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(named(game, "Incubator Token", A)).toHaveLength(0);
    cast(game, toHand(game, "Solemn Simulacrum"));
    const [incubator] = named(game, "Incubator Token", A);
    expect(incubator).toBeDefined();
    expect(counters(game, incubator)).toBe(4);
  });
});

describe("Chrome Host Seedshark", () => {
  it("incubates X for a noncreature spell's mana value", () => {
    const { game } = table();
    spawn(game, "Chrome Host Seedshark");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    const [incubator] = named(game, "Incubator Token", A);
    expect(counters(game, incubator)).toBe(3);
  });
});

describe("Sunfall", () => {
  it("exiles every creature and incubates their number", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Sunfall"));
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    const [incubator] = named(game, "Incubator Token", A);
    expect(counters(game, incubator)).toBe(2);
  });
});

describe("Singer of Swift Rivers", () => {
  it("shields another creature, and lets Merfolk (only) be cast at instant speed", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Singer of Swift Rivers");
    expect(counters(game, bears, "shield")).toBe(1);
    lands(game, "Island", 4);
    toStep(game, "end");
    const looter = toHand(game, "Merfolk Looter");
    cast(game, looter);
    expect(zone(game, looter)).toBe("battlefield");
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
  });
});

describe("King T'Challa", () => {
  it("draws when an opponent draws their second card of the turn", () => {
    const { game } = table();
    spawn(game, "King T'Challa");
    const before = hand(game, A).length;
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game, A).length).toBe(before);
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    // Bob's second card draws alice one — her own second this turn (after
    // her draw step's), which triggers it again; her third doesn't.
    expect(hand(game, A).length).toBe(before + 2);
  });
});
