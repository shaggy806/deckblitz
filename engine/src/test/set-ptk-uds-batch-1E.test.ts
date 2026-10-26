/**
 * Portal Three Kingdoms and Urza's Destiny (PTK, UDS), batch 1, group E
 * (2026-10-26). Written on the shared table in `harness.ts`, each test from
 * the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  hand,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Incendiary", () => {
  it("deals damage equal to its fuse counters, read as it last existed, when the creature dies", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    const aura = toHand(game, "Incendiary");
    cast(game, aura, { targets: [ref(giant)] });
    game.state.objects[aura].counters.fuse = 3;
    pickTargets(a, B);
    destroy(game, giant);
    expect(zone(game, aura)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Powder Keg", () => {
  it("destroys each artifact and creature with mana value exactly its fuse counters", () => {
    const { game } = table();
    const keg = spawn(game, "Powder Keg");
    game.state.objects[keg].counters.fuse = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    const stone = spawn(game, "Mind Stone", B);
    const giant = spawn(game, "Hill Giant", B);
    const anthem = spawn(game, "Glorious Anthem", B);
    activate(game, keg, 0);
    expect(zone(game, keg)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, anthem)).toBe("battlefield");
  });
});

describe("Aura Thief", () => {
  it("takes control of every enchantment when it dies", () => {
    const { game } = table();
    const thief = spawn(game, "Aura Thief");
    const anthem = spawn(game, "Glorious Anthem", B);
    destroy(game, thief);
    expect(controller(game, anthem)).toBe(A);
  });
});

describe("Hunting Moa", () => {
  it("puts a +1/+1 counter on a target creature both as it enters and as it dies", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const moa = enter(game, "Hunting Moa");
    expect(counters(game, bears)).toBe(1);
    destroy(game, moa);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Dying Wail", () => {
  it("makes the target player discard two cards when the enchanted creature dies", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Dying Wail"), { targets: [ref(bears)] });
    const before = hand(game, B).length;
    pickTargets(a, B);
    destroy(game, bears);
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Counterintelligence", () => {
  it("may return just one creature", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Counterintelligence"), { targets: [ref(bears), null] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("returns two different creatures", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Counterintelligence"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Zhang Liao, Hero of Hefei", () => {
  it("makes the opponent it damages discard a card", () => {
    const { game, a } = table();
    const liao = spawn(game, "Zhang Liao, Hero of Hefei");
    const before = hand(game, B).length;
    attack(game, a, [liao]);
    expect(life(game, B)).toBe(17);
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Mask of Law and Grace", () => {
  it("gives the enchanted creature protection from red", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Mask of Law and Grace"), { targets: [ref(bears)] });
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(bears)] })).toThrow();
  });
});

describe("Sima Yi, Wei Field Marshal", () => {
  it("has power equal to the Swamps its controller controls", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Swamp", 2, B);
    const sima = spawn(game, "Sima Yi, Wei Field Marshal");
    expect(pt(game, sima)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Lady Sun", () => {
  it("returns herself and another creature to their owners' hands", () => {
    const { game } = table();
    const sun = spawn(game, "Lady Sun");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, sun, 0, { targets: [ref(bears)] });
    expect(zone(game, sun)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
  });
});
