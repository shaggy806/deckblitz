/**
 * Bestow, batch 161 group F: the earlier sets' bestow cards.
 */
import { describe, expect, it } from "vitest";

import {
  B,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Kestia, the Cultivator", () => {
  it("draws for each enchanted creature and enchantment creature you control that attacks", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const glyph = spawn(game, "Glyph Elemental");
    const plain = spawn(game, "Llanowar Elves");
    lands(game, "Forest", 4);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Kestia, the Cultivator"), { overload: true, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    const before = hand(game).length;
    attack(game, a, [bears, glyph, plain]);
    expect(hand(game).length - before).toBe(2);
  });
});

describe("Nyxborn Hydra", () => {
  it("bestowed for X=2, enters with two counters and pumps the enchanted creature by them", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    const hydra = toHand(game, "Nyxborn Hydra");
    cast(game, hydra, { overload: true, x: 2, targets: [ref(bears)] });
    expect(game.state.objects[hydra].attachedTo).toBe(bears);
    expect(counters(game, hydra)).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, bears).has("reach")).toBe(true);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [ref(bears)] });
    expect(pt(game, hydra)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Eidolon of Countless Battles", () => {
  it("counts itself once: as an Aura, not as a creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Eidolon of Countless Battles"), { overload: true, targets: [ref(bears)] });
    // One creature, one Aura.
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("as a creature alone, it's 1/1", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const eidolon = toHand(game, "Eidolon of Countless Battles");
    cast(game, eidolon);
    expect(pt(game, eidolon)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Nighthowler", () => {
  it("gives the enchanted creature +X/+X for creature cards in all graveyards", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Llanowar Elves");
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Opt");
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Nighthowler"), { overload: true, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Springheart Nantuko", () => {
  it("attached and paid: a token copy of the enchanted creature, no Insect", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Springheart Nantuko"), { overload: true, targets: [ref(bears)] });
    pickModes(a, 0);
    enter(game, "Wastes");
    expect(tokensNamed(game, "Grizzly Bears")).toBe(1);
    expect(tokensNamed(game, "Insect Token")).toBe(0);
  });

  it("as a creature, nothing to pay: an Insect", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    spawn(game, "Springheart Nantuko");
    enter(game, "Wastes");
    expect(tokensNamed(game, "Insect Token")).toBe(1);
  });
});

describe("Indebted Spirit", () => {
  it("gives afterlife to the enchanted creature, and has it itself as an Aura", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    lands(game, "Swamp", 3);
    lands(game, "Forest", 2);
    const spirit = toHand(game, "Indebted Spirit");
    cast(game, spirit, { overload: true, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    cast(game, toHand(game, "Murder"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Spirit Token (White-Black)")).toBe(1);
    expect(types(game, spirit)).toContain("creature");
    cast(game, toHand(game, "Naturalize"), { targets: [ref(spirit)] });
    expect(zone(game, spirit)).toBe("graveyard");
    expect(tokensNamed(game, "Spirit Token (White-Black)")).toBe(2);
  });

  it("put into the graveyard while an Aura, its own afterlife triggers", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    lands(game, "Forest", 2);
    const spirit = toHand(game, "Indebted Spirit");
    cast(game, spirit, { overload: true, targets: [ref(bears)] });
    cast(game, toHand(game, "Naturalize"), { targets: [ref(spirit)] });
    expect(zone(game, spirit)).toBe("graveyard");
    expect(tokensNamed(game, "Spirit Token (White-Black)")).toBe(1);
  });
});

describe("Glyph Elemental", () => {
  it("as an Aura, takes landfall counters and pumps the enchanted creature by them", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    const glyph = toHand(game, "Glyph Elemental");
    cast(game, glyph, { overload: true, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    enter(game, "Wastes");
    enter(game, "Wastes");
    expect(counters(game, glyph)).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Nyxborn Unicorn", () => {
  it("the enchanted creature has mentor", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Nyxborn Unicorn"), { overload: true, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    pickTargets(a, elves);
    attack(game, a, [bears, elves]);
    expect(counters(game, elves)).toBe(1);
  });
});

describe("Triton Wavebreaker", () => {
  it("the enchanted creature has prowess", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Triton Wavebreaker"), { overload: true, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("as a creature, it has prowess", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const triton = toHand(game, "Triton Wavebreaker");
    cast(game, triton);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, triton)).toEqual({ power: 2, toughness: 2 });
  });
});
