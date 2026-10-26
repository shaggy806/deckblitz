/**
 * Saviors of Kamigawa, group B: the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  controller,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Aether Shockwave", () => {
  it("the first mode taps every Spirit and nothing else", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const spirit = spawn(game, "Kataki, War's Wage", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Aether Shockwave"), { modes: [0] });
    expect(game.state.objects[spirit].tapped).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("the second mode taps every non-Spirit creature", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const spirit = spawn(game, "Kataki, War's Wage", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Aether Shockwave"), { modes: [1] });
    expect(game.state.objects[spirit].tapped).toBe(false);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Charge Across the Araba", () => {
  it("creatures you control get +1/+1 for each Plains returned", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, plains[0], plains[1]);
    cast(game, toHand(game, "Charge Across the Araba"));
    expect(zone(game, plains[0])).toBe("hand");
    expect(zone(game, plains[1])).toBe("hand");
    expect(zone(game, plains[2])).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("returning none gives nothing", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a);
    cast(game, toHand(game, "Charge Across the Araba"));
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Kiyomaro, First to Stand", () => {
  it("is as big as your hand, has vigilance at four, and gains 7 when it deals damage with seven in hand", () => {
    const { game, a } = table();
    const kiyomaro = spawn(game, "Kiyomaro, First to Stand");
    const cards = hand(game, A).length;
    expect(cards).toBeGreaterThanOrEqual(7);
    expect(pt(game, kiyomaro)).toEqual({ power: cards, toughness: cards });
    expect(keywords(game, kiyomaro).has("vigilance")).toBe(true);
    const before = life(game, A);
    attack(game, a, [kiyomaro]);
    expect(life(game, B)).toBe(20 - cards);
    expect(life(game, A)).toBe(before + 7);
    expect(game.state.objects[kiyomaro].tapped).toBe(false);
  });
});

describe("Iname as One", () => {
  it("dying, exiles itself to return a Spirit permanent card to the battlefield", () => {
    const { game, a } = table();
    const iname = spawn(game, "Iname as One");
    const kataki = toGraveyard(game, "Kataki, War's Wage");
    pickTargets(a, kataki);
    pickModes(a, 0);
    destroy(game, iname);
    expect(zone(game, iname)).toBe("exile");
    expect(zone(game, kataki)).toBe("battlefield");
  });

  it("declining the exile returns nothing", () => {
    const { game, a } = table();
    const iname = spawn(game, "Iname as One");
    const kataki = toGraveyard(game, "Kataki, War's Wage");
    pickTargets(a, kataki);
    pickModes(a);
    destroy(game, iname);
    expect(zone(game, iname)).toBe("graveyard");
    expect(zone(game, kataki)).toBe("graveyard");
  });

  it("cast from your hand, it searches for a Spirit permanent card", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    lands(game, "Forest", 6);
    const kataki = toLibrary(game, "Kataki, War's Wage");
    pickModes(a, 0);
    pickFromZone(a, kataki);
    cast(game, toHand(game, "Iname as One"));
    expect(zone(game, kataki)).toBe("battlefield");
  });

  it("entering without being cast searches nothing", () => {
    const { game, a } = table();
    const kataki = toLibrary(game, "Kataki, War's Wage");
    pickModes(a, 0);
    pickFromZone(a, kataki);
    enter(game, "Iname as One");
    expect(zone(game, kataki)).toBe("library");
  });
});

describe("Measure of Wickedness", () => {
  it("another card put into your graveyard gives it to the target opponent", () => {
    const { game, a } = table();
    const measure = spawn(game, "Measure of Wickedness");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    destroy(game, bears);
    expect(controller(game, measure)).toBe(B);
  });

  it("at your end step, you sacrifice it and lose 8 life", () => {
    const { game } = table();
    const measure = spawn(game, "Measure of Wickedness");
    toStep(game, "end");
    settle(game);
    expect(zone(game, measure)).toBe("graveyard");
    expect(life(game, A)).toBe(12);
    expect(controller(game, measure)).toBe(A);
  });
});
