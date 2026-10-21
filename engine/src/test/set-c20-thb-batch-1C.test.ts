/**
 * Commander 2020 and Theros Beyond Death (C20, THB; B118) — group C: mutate, escape,
 * heroic, a Saga and the Aura-death trigger.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  controller,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Souvenir Snatcher", () => {
  it("mutating steals a noncreature artifact, for good", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Island", 6);
    pickModes(a, 0);
    pickTargets(a, ring);
    cast(game, toHand(game, "Souvenir Snatcher"), { overload: true, targets: [ref(bears)] });
    expect(controller(game, ring)).toBe(A);
    expect(keywords(game, bears).has("flying")).toBe(true);
    toStep(game, "upkeep");
    expect(controller(game, ring)).toBe(A);
  });
});

describe("Ox of Agonas", () => {
  it("escapes for {R}{R} and eight other cards, with a +1/+1 counter, and refills the hand", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const ox = toGraveyard(game, "Ox of Agonas");
    for (let i = 0; i < 8; i += 1) toGraveyard(game, "Wastes");
    const before = hand(game).length;
    expect(before).toBeGreaterThan(0);
    cast(game, ox, { via: "escape" });
    expect(zone(game, ox)).toBe("battlefield");
    expect(counters(game, ox)).toBe(1);
    expect(pt(game, ox)).toEqual({ power: 5, toughness: 3 });
    expect(hand(game).length).toBe(3);
    // The eight exiled, plus the whole hand discarded.
    expect(graveyard(game).length).toBe(before);
  });
});

describe("Pharika's Spawn", () => {
  it("cast from the hand, nobody sacrifices", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Pharika's Spawn"));
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("escaped, it has two counters and each opponent sacrifices a non-Gorgon creature", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const gorgon = spawn(game, "Pharika's Spawn", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const spawnCard = toGraveyard(game, "Pharika's Spawn");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Wastes");
    cast(game, spawnCard, { via: "escape" });
    expect(counters(game, spawnCard)).toBe(2);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, gorgon)).toBe("battlefield");
  });
});

describe("Dawn Evangel", () => {
  it("a creature dying with your Aura on it returns a small creature card — even itself", () => {
    const { game, a } = table();
    spawn(game, "Dawn Evangel");
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Mogis's Favor"), { targets: [ref(bears)] });
    pickTargets(a, bears);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("hand");
  });

  it("an opponent's creature with your Aura counts; one with no Aura doesn't", () => {
    const { game, a } = table();
    spawn(game, "Dawn Evangel");
    const small = toGraveyard(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears", B);
    pickTargets(a, small);
    destroy(game, plain);
    expect(zone(game, small)).toBe("graveyard");
    lands(game, "Swamp", 1);
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Mogis's Favor"), { targets: [ref(theirs)] });
    destroy(game, theirs);
    expect(zone(game, small)).toBe("hand");
  });
});

describe("The Triumph of Anax", () => {
  it("chapters I and II give trample and +X/+0 for the lore counters as each resolves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    pickTargets(a, bears);
    cast(game, toHand(game, "The Triumph of Anax"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    toStep(game, "precombat-main");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Hero of the Pride", () => {
  it("a spell you cast that targets it gives your creatures +1/+0", () => {
    const { game } = table();
    const hero = spawn(game, "Hero of the Pride");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(hero)] });
    expect(pt(game, hero)).toEqual({ power: 6, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Commanding Presence", () => {
  it("+2/+2, first strike, and a Human Soldier for combat damage to a player", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Commanding Presence"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
  });
});
