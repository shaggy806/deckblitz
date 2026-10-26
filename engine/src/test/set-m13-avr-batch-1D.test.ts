/**
 * Set walk batch 182, group D (2026-10-26): Magic 2013 (M13) and Avacyn Restored (AVR).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  destroy,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  table,
  ref,
  spawn,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
  controller,
  keywords,
} from "./harness.js";

describe("Dual Casting", () => {
  it("gives the enchanted creature a tap ability that copies your instant", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Dual Casting"), { targets: [ref(bears)] });
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    activate(game, bears, 0, { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(14);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});


describe("Stolen Goods", () => {
  it("exiles down to a nonland card the caster may cast free this turn", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears", B);
    const forest = toLibrary(game, "Forest", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Stolen Goods"), { targets: [ref(B)] });
    expect(zone(game, forest)).toBe("exile");
    expect(zone(game, bears)).toBe("exile");
    cast(game, bears, { via: "impulse", free: true });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Mwonvuli Beast Tracker", () => {
  it("offers only a creature with one of the keywords, and puts it on top", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    const spider = toLibrary(game, "Giant Spider");
    toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, spider);
    enter(game, "Mwonvuli Beast Tracker");
    expect(seen.offered).toEqual([spider]);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(spider);
  });
});

describe("Commander's Authority", () => {
  it("gives the enchanted creature's controller a Human each of their upkeeps", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Commander's Authority"), { targets: [ref(bears)] });
    nextTurn(game);
    expect(tokensNamed(game, "Human Token", B)).toBe(1);
    expect(tokensNamed(game, "Human Token", A)).toBe(0);
  });
});

describe("Scroll of Avacyn", () => {
  it("draws, and gains 5 only with an Angel", () => {
    const { game } = table();
    const scroll = spawn(game, "Scroll of Avacyn");
    spawn(game, "Serra Angel");
    lands(game, "Wastes", 1);
    const before = hand(game).length;
    activate(game, scroll);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(25);
  });

  it("gains nothing without one", () => {
    const { game } = table();
    const scroll = spawn(game, "Scroll of Avacyn");
    lands(game, "Wastes", 1);
    activate(game, scroll);
    expect(life(game)).toBe(20);
  });
});

describe("Necrobite", () => {
  it("gives deathtouch and a regeneration shield", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Necrobite"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});
