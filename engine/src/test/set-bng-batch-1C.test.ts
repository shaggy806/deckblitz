/**
 * Born of the Gods, batch 164 group C: the clauses most likely to be wrong —
 * inspired's paid token copy (an enchantment, hasty, exiled at end step),
 * bestow's "enchanted creature attacks", devotion on an attack trigger, a
 * colored-only cost reduction, Eye Gouge's Cyclops clause, three distinct
 * targets, and "doesn't untap during its controller's next untap step".
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  counters,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Felhide Spiritbinder", () => {
  it("as it untaps, pays {1}{R} for a hasty enchantment copy of another creature, exiled at end step", () => {
    const { game, a } = table();
    spawn(game, "Felhide Spiritbinder", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    pickTargets(a, bears);
    a.chooseModesFn = () => [0]; // pay {1}{R}
    toStep(game, "precombat-main");
    const copies = named(game, "Grizzly Bears").filter((id) => id !== bears);
    expect(copies).toHaveLength(1);
    const token = copies[0];
    expect(types(game, token)).toEqual(expect.arrayContaining(["creature", "enchantment"]));
    expect(types(game, bears)).not.toContain("enchantment");
    expect(keywords(game, token).has("haste")).toBe(true);
    nextTurn(game);
    expect(named(game, "Grizzly Bears").filter((id) => id !== bears)).toHaveLength(0);
  });
});

describe("Spiteful Returned", () => {
  it("bestowed, the enchanted creature's attack makes the defending player lose 2", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    const returned = toHand(game, "Spiteful Returned");
    cast(game, returned, { overload: true, targets: [ref(bears)] });
    expect(game.state.objects[returned].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20 - 2 - 3);
  });
});

describe("Thunderous Might", () => {
  it("the enchanted attacker gets +X/+0, X your devotion to red as it resolves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hulking Cyclops");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Thunderous Might"), { targets: [ref(bears)] });
    attack(game, a, [bears]);
    // {R} from the Aura and {R}{R} from the Cyclops: devotion 3.
    expect(life(game, B)).toBe(20 - 5);
  });
});

describe("Ragemonger", () => {
  it("a Minotaur spell costs {B}{R} less, only its colored part", () => {
    const { game } = table();
    spawn(game, "Ragemonger");
    lands(game, "Wastes", 2);
    const minotaur = toHand(game, "Felhide Minotaur");
    cast(game, minotaur);
    expect(zone(game, minotaur)).toBe("battlefield");
  });

  it("doesn't reduce a non-Minotaur", () => {
    const { game } = table();
    spawn(game, "Ragemonger");
    lands(game, "Wastes", 2);
    expect(() => cast(game, toHand(game, "Spiteful Returned"))).toThrow();
  });
});

describe("Eye Gouge", () => {
  it("destroys a Cyclops, and only shrinks anything else", () => {
    const { game } = table();
    const cyclops = spawn(game, "Hulking Cyclops", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Eye Gouge"), { targets: [ref(cyclops)] });
    expect(zone(game, cyclops)).toBe("graveyard");
    cast(game, toHand(game, "Eye Gouge"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Reap What Is Sown", () => {
  it("puts a counter on each of three different creatures", () => {
    const { game } = table();
    const ids = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears", B)];
    lands(game, "Plains", 2);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Reap What Is Sown"), { targets: ids.map(ref) });
    expect(ids.map((id) => counters(game, id))).toEqual([1, 1, 1]);
  });
});

describe("Sudden Storm", () => {
  it("the tapped creatures don't untap during their controller's next untap step", () => {
    const { game } = table();
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Sudden Storm"), { targets: [ref(first), ref(second)] });
    expect(game.state.objects[first].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[first].tapped).toBe(true);
    expect(game.state.objects[second].tapped).toBe(true);
  });
});
