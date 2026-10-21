/**
 * Commander 2020 (C20) and Theros Beyond Death (THB) — group D of the set
 * walk: enchantment payoffs, escape, heroic and devotion.
 */
import { describe, expect, it } from "vitest";

import { goadersOf } from "../goad.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
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
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Curious Herd", () => {
  it("makes a Beast for each artifact the target opponent controls", () => {
    const { game } = table();
    spawn(game, "Ornithopter", B);
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", A);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Curious Herd"), { targets: [ref(B)] });
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(2);
  });
});

describe("Predatory Impetus", () => {
  it("gives +3/+3 and goads the enchanted creature for its controller", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Predatory Impetus"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(goadersOf(game.state, game.registry, bears)).toEqual([A]);
  });
});

describe("Karametra's Blessing", () => {
  it("adds hexproof and indestructible only for an enchantment creature", () => {
    const { game } = table();
    const fish = spawn(game, "Wavebreak Hippocamp");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Karametra's Blessing"), { targets: [ref(fish)] });
    cast(game, toHand(game, "Karametra's Blessing"), { targets: [ref(bears)] });
    expect(pt(game, fish)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, fish).has("indestructible")).toBe(true);
    expect(keywords(game, fish).has("hexproof")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
  });
});

describe("The Binding of the Titans", () => {
  it("mills each player three, then gains 1 life per creature card it exiles", () => {
    const { game, a } = table();
    const before = { a: game.state.zones.perPlayer[A].graveyard.length, b: game.state.zones.perPlayer[B].graveyard.length };
    enter(game, "The Binding of the Titans");
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(before.a + 3);
    expect(game.state.zones.perPlayer[B].graveyard.length).toBe(before.b + 3);
    const creature = toGraveyard(game, "Grizzly Bears", B);
    const wastes = game.state.zones.perPlayer[A].graveyard[0];
    pickTargets(a, creature, wastes);
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, creature)).toBe("exile");
    expect(zone(game, wastes)).toBe("exile");
    expect(life(game, A)).toBe(21);
  });
});

describe("Nessian Boar", () => {
  it("each blocker's controller draws a card", () => {
    const { game, a, b } = table();
    const boar = spawn(game, "Nessian Boar");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: one, attacker: boar },
      { blocker: two, attacker: boar },
    ];
    const before = hand(game, B).length;
    attack(game, a, [boar]);
    expect(hand(game, B).length).toBe(before + 2);
  });
});

describe("Rise to Glory", () => {
  it("returns a creature, then an Aura that may enchant it", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const pacifism = toGraveyard(game, "Pacifism");
    lands(game, "Plains", 3);
    lands(game, "Swamp", 2);
    let offered: readonly ObjectId[] = [];
    a.chooseEnchantFn = (_view, _source, options) => {
      offered = options;
      return bears;
    };
    cast(game, toHand(game, "Rise to Glory"), { modes: [0, 1], targets: [ref(bears), ref(pacifism)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(offered).toContain(bears);
    expect(game.state.objects[pacifism].attachedTo).toBe(bears);
  });
});

describe("Enigmatic Incarnation", () => {
  it("at your end step, trades another enchantment for a creature one mana value higher", () => {
    const { game, a } = table();
    const incarnation = spawn(game, "Enigmatic Incarnation");
    const fish = spawn(game, "Wavebreak Hippocamp");
    const other = spawn(game, "Wavebreak Hippocamp");
    toLibrary(game, "Centaur Courser");
    const giant = toLibrary(game, "Hill Giant");
    pickModes(a, 0);
    let sacOffered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      sacOffered = eligible;
      return [fish];
    };
    const seen = pickFromZone(a, giant);
    toStep(game, "end");
    settle(game);
    expect([...sacOffered].sort()).toEqual([fish, other].sort());
    expect(zone(game, incarnation)).toBe("battlefield");
    expect(zone(game, fish)).toBe("graveyard");
    expect(seen.offered).toEqual([giant]);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Nyx Herald", () => {
  it("can target only an enchanted or enchantment creature you control", () => {
    const { game, a } = table();
    const herald = spawn(game, "Nyx Herald");
    const fish = spawn(game, "Wavebreak Hippocamp");
    const bears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [fish]);
    toStep(game, "begin-combat");
    settle(game);
    expect([...seen.offered[0]].sort()).toEqual([herald, fish].sort());
    expect(seen.offered[0]).not.toContain(bears);
    expect(pt(game, fish)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, fish).has("trample")).toBe(true);
  });
});

describe("Heroes of the Revel", () => {
  it("makes a Satyr, and a spell targeting it pumps your team", () => {
    const { game } = table();
    const heroes = enter(game, "Heroes of the Revel");
    expect(tokensNamed(game, "Satyr Token", A)).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(heroes)] });
    expect(pt(game, heroes)).toEqual({ power: 8, toughness: 7 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Impending Doom", () => {
  it("deals 3 damage to the enchanted creature's controller when it dies", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Impending Doom"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    destroy(game, bears);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("Brine Giant", () => {
  it("costs {1} less for each enchantment you control", () => {
    const { game } = table();
    spawn(game, "Wavebreak Hippocamp");
    spawn(game, "Wavebreak Hippocamp");
    spawn(game, "Wavebreak Hippocamp");
    lands(game, "Island", 4);
    const giant = toHand(game, "Brine Giant");
    cast(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Voracious Typhon", () => {
  it("escapes with three +1/+1 counters", () => {
    const { game } = table();
    const typhon = toGraveyard(game, "Voracious Typhon");
    const others = Array.from({ length: 4 }, () => toGraveyard(game, "Wastes"));
    lands(game, "Forest", 7);
    cast(game, typhon, { via: "escape" });
    expect(zone(game, typhon)).toBe("battlefield");
    expect(others.every((id) => zone(game, id) === "exile")).toBe(true);
    expect(counters(game, typhon)).toBe(3);
  });
});

describe("Escape Velocity", () => {
  it("escapes from the graveyard onto a creature, giving +1/+0 and haste", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const aura = toGraveyard(game, "Escape Velocity");
    const others = Array.from({ length: 2 }, () => toGraveyard(game, "Wastes"));
    lands(game, "Mountain", 2);
    cast(game, aura, { via: "escape", targets: [ref(bears)] });
    expect(zone(game, aura)).toBe("battlefield");
    expect(others.every((id) => zone(game, id) === "exile")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Klothys's Design", () => {
  it("pumps your creatures by your devotion to green", () => {
    const { game } = table();
    const one = spawn(game, "Centaur Courser");
    spawn(game, "Centaur Courser");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Klothys's Design"));
    expect(pt(game, one)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Temple Thief", () => {
  it("can't be blocked by an enchantment creature", () => {
    const { game, a } = table();
    const thief = spawn(game, "Temple Thief");
    const fish = spawn(game, "Wavebreak Hippocamp", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [thief]);
    const canBlock = (blocker: ObjectId): readonly ObjectId[] =>
      offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(fish)).toEqual([]);
    expect(canBlock(bears)).toEqual([thief]);
  });
});
