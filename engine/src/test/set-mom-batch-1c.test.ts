/**
 * March of the Machine (MOM), batch 1, part c (2026-10-17).
 * Written on the shared table in `harness.ts`, from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Blight Titan", () => {
  it("mills two, then incubates X counting the creature cards in your graveyard after the mill", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Grizzly Bears");
    enter(game, "Blight Titan");
    expect(graveyard(game)).toHaveLength(3);
    const [incubator] = named(game, "Incubator Token", A);
    expect(incubator).toBeDefined();
    expect(counters(game, incubator)).toBe(3);
  });

  it("does it again when it attacks", () => {
    const { game, a } = table();
    const titan = spawn(game, "Blight Titan");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    attack(game, a, [titan]);
    const [incubator] = named(game, "Incubator Token", A);
    expect(incubator).toBeDefined();
    expect(counters(game, incubator)).toBe(1);
  });
});

describe("Bola Slinger", () => {
  it("backs up another creature, which then taps an opponent's artifact or creature when it attacks", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, bears);
    enter(game, "Bola Slinger");
    expect(counters(game, bears)).toBe(1);
    pickTargets(a, ring);
    attack(game, a, [bears]);
    expect(game.state.objects[ring].tapped).toBe(true);
  });
});

describe("Guardian of Ghirapur", () => {
  it("exiles an artifact you control and returns it at the beginning of the next end step", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    pickTargets(a, ring);
    enter(game, "Guardian of Ghirapur");
    expect(zone(game, ring)).toBe("exile");
    toStep(game, "end");
    settle(game);
    const [back] = named(game, "Sol Ring", A);
    expect(back).toBeDefined();
    expect(zone(game, back)).toBe("battlefield");
  });
});

describe("Phyrexian Pegasus", () => {
  it("gives another attacking creature without flying flying until end of turn", () => {
    const { game, a } = table();
    const pegasus = spawn(game, "Phyrexian Pegasus");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [pegasus, bears]);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Path of the Enigma", () => {
  it("makes the target player draw four, then holds the vote", () => {
    const { game, a, b } = table();
    lands(game, "Island", 5);
    pickModes(a, 0);
    pickModes(b, 1);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Path of the Enigma"), { targets: [ref(B)] });
    settle(game);
    expect(hand(game, B)).toHaveLength(before + 4);
  });
});

describe("Crystal Carapace", () => {
  it("gives the enchanted creature +3/+3", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Crystal Carapace"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});
