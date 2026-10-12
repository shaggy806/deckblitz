/**
 * The set walk, batch 58, part c (2026-10-11): Marvel Super Heroes.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  enter,
  grant,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Crossbones, Malicious Mercenary", () => {
  it("grows and burns each opponent for another Villain entering, only once each turn", () => {
    const { game } = table();
    const crossbones = spawn(game, "Crossbones, Malicious Mercenary");
    enter(game, "Abomination, Irradiated Brute"); // a non-artifact Villain
    expect(counters(game, crossbones)).toBe(1);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
    enter(game, "Flying Octobot"); // a second Villain, same turn
    expect(counters(game, crossbones)).toBe(1);
    expect(life(game, B)).toBe(18);
  });
});

describe("HYDRA Assault Robot", () => {
  it("pings for another Villain and/or artifact — once for one that is both — and not for anything else", () => {
    const { game, a } = table();
    spawn(game, "HYDRA Assault Robot");
    pickTargets(a, B);
    enter(game, "Mind Stone");
    expect(life(game, B)).toBe(19);
    enter(game, "Abomination, Irradiated Brute");
    expect(life(game, B)).toBe(18);
    enter(game, "Flying Octobot"); // a Villain artifact
    expect(life(game, B)).toBe(17);
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(17);
  });
});

describe("Visions of Villainy", () => {
  it("costs {1} less only while you control a Villain", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const visions = toHand(game, "Visions of Villainy");
    expect(() => cast(game, visions)).toThrow();
    spawn(game, "Abomination, Irradiated Brute");
    const before = hand(game).length;
    cast(game, visions);
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(life(game, A)).toBe(18);
  });
});

describe("Human Torch, Johnny Storm", () => {
  it("burns a target opponent for each card you draw only while you control another Hero", () => {
    const { game, a } = table();
    spawn(game, "Human Torch, Johnny Storm");
    pickTargets(a, B);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    // Human Torch is a Hero, but not "another" one.
    expect(life(game, B)).toBe(20);
    spawn(game, "Amateur Hero");
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(life(game, B)).toBe(18);
  });
});

describe("The Thing, Ben Grimm", () => {
  it("gets two counters once for two Heroes dealing a player damage together, none for a non-Hero", () => {
    const { game, a } = table();
    const thing = spawn(game, "The Thing, Ben Grimm");
    const hero = spawn(game, "Amateur Hero");
    attack(game, a, [thing, hero]);
    expect(life(game, B)).toBe(10);
    expect(counters(game, thing)).toBe(2);

    const { game: game2, a: a2 } = table();
    const thing2 = spawn(game2, "The Thing, Ben Grimm");
    const bears = spawn(game2, "Grizzly Bears");
    attack(game2, a2, [bears]);
    expect(life(game2, B)).toBe(18);
    expect(counters(game2, thing2)).toBe(0);
  });
});

describe("The Wondrous Wasp", () => {
  it("taps the creature, which loses its abilities only for as long as the Wasp stays", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    pickTargets(a, angel);
    const wasp = enter(game, "The Wondrous Wasp");
    expect(game.state.objects[angel].tapped).toBe(true);
    expect(keywords(game, angel).has("flying")).toBe(false);
    destroy(game, wasp);
    expect(keywords(game, angel).has("flying")).toBe(true);
    expect(game.state.objects[angel].tapped).toBe(true);
  });
});

describe("Daredevil, Man Without Fear", () => {
  it("exiles a Hero card off the top, gets +2/+1, and may play it this turn", () => {
    const { game, a } = table();
    const daredevil = spawn(game, "Daredevil, Man Without Fear");
    const hero = toLibrary(game, "Amateur Hero");
    pickModes(a, 0);
    attack(game, a, [daredevil]);
    expect(zone(game, hero)).toBe("exile");
    expect(life(game, B)).toBe(15);
    expect(pt(game, daredevil)).toEqual({ power: 5, toughness: 5 });
    lands(game, "Plains", 3);
    cast(game, hero, { via: "impulse" });
    expect(zone(game, hero)).toBe("battlefield");
  });

  it("gets no pump for a card that isn't a Hero, and exiles nothing when declined", () => {
    const { game, a } = table();
    const daredevil = spawn(game, "Daredevil, Man Without Fear");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [daredevil]);
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(17);
    expect(pt(game, daredevil)).toEqual({ power: 3, toughness: 4 });

    const { game: game2, a: a2 } = table();
    const daredevil2 = spawn(game2, "Daredevil, Man Without Fear");
    const hero = toLibrary(game2, "Amateur Hero");
    pickModes(a2);
    attack(game2, a2, [daredevil2]);
    expect(zone(game2, hero)).toBe("library");
    expect(pt(game2, daredevil2)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Armor Wars", () => {
  // `spawn` puts a Saga's first lore counter on it, chapter I waiting.
  it("I — you draw one per artifact and each opponent draws one; with no artifacts nobody does", () => {
    const { game, a } = table();
    spawn(game, "Mind Stone");
    spawn(game, "Sol Ring");
    pickModes(a, 0);
    const [handA, handB] = [hand(game, A).length, hand(game, B).length];
    spawn(game, "Armor Wars");
    settle(game);
    expect(hand(game, A).length).toBe(handA + 2);
    expect(hand(game, B).length).toBe(handB + 1);

    const { game: game2, a: a2 } = table();
    pickModes(a2, 0);
    const [handA2, handB2] = [hand(game2, A).length, hand(game2, B).length];
    spawn(game2, "Armor Wars");
    settle(game2);
    expect(hand(game2, A).length).toBe(handA2);
    expect(hand(game2, B).length).toBe(handB2);
  });

  it("II — artifact spells cost {1} less for the rest of the turn", () => {
    const { game, a } = table();
    pickModes(a);
    spawn(game, "Armor Wars");
    settle(game);
    toStep(game, "precombat-main");
    settle(game);
    lands(game, "Wastes", 1);
    const stone = toHand(game, "Mind Stone");
    cast(game, stone);
    expect(zone(game, stone)).toBe("battlefield");
  });

  it("III — deals the greatest mana value among your artifacts to the target opponent", () => {
    const { game, a } = table();
    pickModes(a);
    const saga = spawn(game, "Armor Wars");
    settle(game);
    game.state.objects[saga].counters.lore = 2;
    spawn(game, "Gilded Lotus");
    spawn(game, "Sol Ring");
    spawn(game, "Gilded Lotus", B);
    pickTargets(a, B);
    toStep(game, "precombat-main");
    settle(game);
    expect(life(game, B)).toBe(15);
    expect(zone(game, saga)).toBe("graveyard");
  });
});

describe("Super-Adaptoid", () => {
  it("has power equal to the legendary creatures you control, itself included", () => {
    const { game } = table();
    const adaptoid = spawn(game, "Super-Adaptoid");
    expect(pt(game, adaptoid)).toEqual({ power: 1, toughness: 2 });
    spawn(game, "Abomination, Irradiated Brute");
    spawn(game, "Grizzly Bears");
    spawn(game, "Abomination, Irradiated Brute", B);
    expect(pt(game, adaptoid)).toEqual({ power: 2, toughness: 2 });
  });

  it("takes a keyword counter for each listed keyword the target has and it doesn't", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B); // flying, vigilance
    pickTargets(a, angel);
    const adaptoid = enter(game, "Super-Adaptoid");
    expect(counters(game, adaptoid, "flying")).toBe(1);
    expect(counters(game, adaptoid, "vigilance")).toBe(1);
    expect(counters(game, adaptoid, "haste")).toBe(0);
    expect(keywords(game, adaptoid).has("flying")).toBe(true);
  });

  it("on attack, skips a keyword it already has", () => {
    const { game, a } = table();
    const adaptoid = spawn(game, "Super-Adaptoid");
    const angel = spawn(game, "Serra Angel", B);
    grant(game, adaptoid, "flying");
    grant(game, angel, "haste");
    pickTargets(a, angel);
    attack(game, a, [adaptoid]);
    expect(counters(game, adaptoid, "flying")).toBe(0);
    expect(counters(game, adaptoid, "vigilance")).toBe(1);
    expect(counters(game, adaptoid, "haste")).toBe(1);
  });
});
