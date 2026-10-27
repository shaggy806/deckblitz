/**
 * Torment (TOR; B220), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  nextTurn,
  zone,
} from "./harness.js";

describe("Breakthrough", () => {
  it("draws four, then keeps X cards and discards the rest", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const card = toHand(game, "Breakthrough");
    cast(game, card, { x: 2 });
    expect(hand(game, A).length).toBe(2);
  });

  it("with X greater than the hand, discards nothing", () => {
    const { game } = table();
    lands(game, "Island", 21);
    const before = hand(game, A).length;
    const card = toHand(game, "Breakthrough");
    cast(game, card, { x: 20 });
    expect(hand(game, A).length).toBe(before + 4);
  });
});

describe("Dawn of the Dead", () => {
  it("returns a creature at upkeep with haste, then exiles it at the end step", () => {
    const { game, a } = table();
    spawn(game, "Dawn of the Dead");
    const bears = toGraveyard(game, "Grizzly Bears");
    const startLife = life(game, A);
    pickTargets(a, bears);
    pickModes(a, 0);
    toStep(game, "precombat-main");
    expect(life(game, A)).toBe(startLife - 1);
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, bears).has("haste")).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Cephalid Vandal", () => {
  it("adds a shred counter each upkeep and mills one card per counter", () => {
    const { game } = table();
    const vandal = spawn(game, "Cephalid Vandal");
    toStep(game, "precombat-main");
    expect(counters(game, vandal, "shred")).toBe(1);
    expect(graveyard(game, A).length).toBe(1);
    toStep(game, "precombat-main");
    expect(counters(game, vandal, "shred")).toBe(2);
    expect(graveyard(game, A).length).toBe(3);
  });
});

describe("Ghostly Wings", () => {
  it("discarding a card returns the enchanted creature to its owner's hand", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const wings = toHand(game, "Ghostly Wings");
    cast(game, wings, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    const before = hand(game, A).length;
    activate(game, wings, 0);
    expect(hand(game, A).length).toBe(before - 1);
    expect(zone(game, bears)).toBe("hand");
    expect(game.state.objects[bears].owner).toBe(B);
    expect(zone(game, wings)).toBe("graveyard");
  });
});

describe("Major Teroh", () => {
  it("sacrificed, exiles every black creature and leaves the rest", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const teroh = spawn(game, "Major Teroh");
    const black = spawn(game, "Boneshard Slasher", B);
    const green = spawn(game, "Grizzly Bears", B);
    activate(game, teroh, 0);
    expect(zone(game, teroh)).toBe("graveyard");
    expect(zone(game, black)).toBe("exile");
    expect(zone(game, green)).toBe("battlefield");
  });
});

describe("Boneshard Slasher", () => {
  it("with threshold, is 3/3 and sacrificed when it becomes a target", () => {
    const { game } = table();
    const slasher = spawn(game, "Boneshard Slasher");
    expect(pt(game, slasher)).toEqual({ power: 1, toughness: 1 });
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    expect(pt(game, slasher)).toEqual({ power: 3, toughness: 3 });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(slasher)] });
    expect(zone(game, slasher)).toBe("graveyard");
  });
});

describe("Carrion Wurm", () => {
  it("assigns no combat damage once a player exiles three cards from their graveyard", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Carrion Wurm");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Wastes", B);
    pickModes(a);
    pickModes(b, 0);
    const startLife = life(game, B);
    attack(game, a, [wurm]);
    expect(graveyard(game, B).length).toBe(0);
    expect(life(game, B)).toBe(startLife);
  });

  it("deals its damage when nobody exiles", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Carrion Wurm");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Wastes", B);
    pickModes(a);
    pickModes(b);
    const startLife = life(game, B);
    attack(game, a, [wurm]);
    expect(graveyard(game, B).length).toBe(3);
    expect(life(game, B)).toBe(startLife - 6);
  });
});

describe("Pyromania", () => {
  it("sacrificed, deals 1 damage to any target", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const pyro = spawn(game, "Pyromania");
    const startLife = life(game, B);
    activate(game, pyro, 1, { targets: [ref(B)] });
    expect(zone(game, pyro)).toBe("graveyard");
    expect(life(game, B)).toBe(startLife - 1);
  });
});

describe("Centaur Veteran", () => {
  it("discards a card to regenerate", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const vet = spawn(game, "Centaur Veteran");
    toLibrary(game, "Wastes");
    const before = hand(game, A).length;
    activate(game, vet, 0);
    expect(hand(game, A).length).toBe(before - 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(vet)] });
    expect(zone(game, vet)).toBe("battlefield");
  });
});
