/**
 * CN2 / EMN batch 1, group b: each test written from the card's Oracle text
 * and rulings, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  enter,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Subterranean Tremors", () => {
  it("at X = 8: damages creatures without flying, destroys artifacts, makes the Lizard", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Mountain", 9);
    cast(game, toHand(game, "Subterranean Tremors"), { x: 8 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, angel)).toBe("battlefield");
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, "Lizard Token", A)).toBe(1);
  });

  it("at X = 3: the damage only", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Subterranean Tremors"), { x: 3 });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
    expect(tokensNamed(game, "Lizard Token")).toBe(0);
  });
});

describe("Splitting Slime", () => {
  it("becoming monstrous makes a copy with no counters that isn't monstrous", () => {
    const { game } = table();
    const slime = spawn(game, "Splitting Slime");
    lands(game, "Forest", 6);
    activate(game, slime, 0);
    expect(counters(game, slime)).toBe(3);
    const slimes = named(game, "Splitting Slime", A);
    expect(slimes.length).toBe(2);
    const token = slimes.find((id) => id !== slime) as ObjectId;
    expect(game.state.objects[token].isToken).toBe(true);
    expect(counters(game, token)).toBe(0);
    expect(game.state.objects[token].monstrous).toBeUndefined();
  });
});

describe("Spectral Grasp", () => {
  it("the enchanted creature can't block creatures the Aura's controller controls", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const grasped = spawn(game, "Hill Giant", B);
    const free = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Spectral Grasp"), { targets: [ref(grasped)] });
    const offer = blockOffer(game, a, [mine]);
    const canBlock = (id: ObjectId): readonly ObjectId[] => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(grasped)).toEqual([]);
    expect(canBlock(free)).toEqual([mine]);
  });
});

describe("Orchard Elemental", () => {
  it("two counters per sprout vote, 3 life per harvest vote", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 1);
    const elemental = enter(game, "Orchard Elemental");
    expect(counters(game, elemental)).toBe(2);
    expect(life(game, A)).toBe(23);
  });

  it("two sprout votes are four counters", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 0);
    const elemental = enter(game, "Orchard Elemental");
    expect(counters(game, elemental)).toBe(4);
    expect(life(game, A)).toBe(20);
  });
});

describe("Dark Salvation", () => {
  it("counts every Zombie the target player controls after making X", () => {
    const { game } = table();
    spawn(game, "Zombie Token", A);
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Dark Salvation"), { x: 2, targets: [ref(A), ref(wurm)] });
    // Two new tokens; the spawned Zombie is a card, not a token, but counts.
    expect(tokensNamed(game, "Zombie Token", A)).toBe(2);
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 1 });
  });

  it("gives the target player the tokens with no creature target", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Dark Salvation"), { x: 1, targets: [ref(B), null] });
    expect(tokensNamed(game, "Zombie Token", B)).toBe(1);
  });
});

describe("Liliana, the Last Hope", () => {
  it("the emblem makes two plus the Zombies you control", () => {
    const { game } = table();
    const liliana = spawn(game, "Liliana, the Last Hope");
    spawn(game, "Zombie Token", A);
    loyalty(game, liliana, -7, { atLeast: 7 });
    toStep(game, "end");
    settle(game);
    // Two plus the one Zombie already there (spawned, so not itself a token).
    expect(tokensNamed(game, "Zombie Token", A)).toBe(3);
  });
});

describe("Niblis of Frost", () => {
  it("an instant taps an opponent's creature, which stays tapped through its untap step", () => {
    const { game, a } = table();
    const niblis = spawn(game, "Niblis of Frost");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    pickTargets(a, bears);
    cast(game, toHand(game, "Opt"));
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(pt(game, niblis)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Keeper of Keys", () => {
  it("as the monarch at upkeep, a creature you get later that turn can't be blocked", () => {
    const { game, a } = table();
    enter(game, "Keeper of Keys");
    expect(game.state.monarch).toBe(A);
    toStep(game, "precombat-main");
    const bears = spawn(game, "Grizzly Bears", A);
    spawn(game, "Hill Giant", B);
    // Nothing can block it, so bob is never asked to declare blockers.
    expect(() => blockOffer(game, a, [bears])).toThrow("wasn't asked to block");
  });

  it("not the monarch: the same attacker can be blocked", () => {
    const { game, a } = table();
    spawn(game, "Keeper of Keys");
    toStep(game, "precombat-main");
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, a, [bears]);
    expect(offer.eligible.find((e) => e.blocker === giant)?.canBlock).toEqual([bears]);
  });
});
