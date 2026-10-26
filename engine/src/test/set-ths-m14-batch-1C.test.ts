/**
 * Theros and Magic 2014, group C: monstrous triggers (Stoneshock Giant's
 * turn-wide can't-block, Ember Swallower's land sacrifice), heroic counters,
 * a two-target lifelink pump, Dismiss into Dream's granted sacrifice trigger,
 * Illusionary Armor, Pyromancer's Gauntlet, Mindsparker, Tidebinder Mage's
 * lock, Woodborn Behemoth and the Magus staffs.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  enter,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

describe("Stoneshock Giant", () => {
  it("becoming monstrous stops the opponents' creatures without flying from blocking", () => {
    const { game, a } = table();
    const giant = spawn(game, "Stoneshock Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Mountain", 8);
    activate(game, giant, 0);
    expect(counters(game, giant)).toBe(3);
    const offer = blockOffer(game, a, [giant]);
    const blockers = offer.eligible.filter((e) => e.canBlock.length > 0).map((e) => e.blocker);
    expect(blockers).toContain(angel);
    expect(blockers).not.toContain(bears);
  });
});

describe("Ember Swallower", () => {
  it("becoming monstrous makes each player sacrifice three lands", () => {
    const { game } = table();
    const swallower = spawn(game, "Ember Swallower");
    lands(game, "Mountain", 7);
    lands(game, "Forest", 4, B);
    activate(game, swallower, 0);
    expect(named(game, "Mountain", A)).toHaveLength(4);
    expect(named(game, "Forest", B)).toHaveLength(1);
  });
});

describe("Centaur Battlemaster", () => {
  it("heroic puts three +1/+1 counters on it", () => {
    const { game } = table();
    const centaur = spawn(game, "Centaur Battlemaster");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(centaur)] });
    expect(counters(game, centaur)).toBe(3);
  });
});

describe("Cutthroat Maneuver", () => {
  it("gives both targets +1/+1 and lifelink", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Cutthroat Maneuver"), { targets: [ref(one), ref(two)] });
    expect(pt(game, one)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, two)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, one).has("lifelink")).toBe(true);
    expect(keywords(game, two).has("lifelink")).toBe(true);
  });
});

describe("Fleshmad Steed", () => {
  it("taps when another creature dies", () => {
    const { game } = table();
    const steed = spawn(game, "Fleshmad Steed");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[steed].tapped).toBe(true);
  });
});

describe("Dismiss into Dream", () => {
  it("makes the opponents' creatures Illusions that are sacrificed when targeted", () => {
    const { game } = table();
    spawn(game, "Dismiss into Dream");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Serra Angel", B);
    expect(subtypes(game, theirs)).toContain("Illusion");
    expect(subtypes(game, mine)).not.toContain("Illusion");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Illusionary Armor", () => {
  it("is sacrificed when the enchanted creature is targeted, leaving the creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 5);
    const armor = toHand(game, "Illusionary Armor");
    cast(game, armor, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(zone(game, armor)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Pyromancer's Gauntlet", () => {
  it("adds 2 to a red instant's damage", () => {
    const { game } = table();
    spawn(game, "Pyromancer's Gauntlet");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
  });
});

describe("Mindsparker", () => {
  it("deals 2 damage to an opponent who casts a blue instant, but not a green one", () => {
    const { game } = table();
    spawn(game, "Mindsparker");
    nextTurn(game);
    lands(game, "Island", 1, B);
    lands(game, "Forest", 1, B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Giant Growth", B), { player: B, targets: [ref(bears)] });
    expect(life(game, B)).toBe(20);
    cast(game, toHand(game, "Opt", B), { player: B });
    expect(life(game, B)).toBe(18);
  });
});

describe("Tidebinder Mage", () => {
  it("taps a red or green opponent's creature, which stays tapped while you control the Mage", () => {
    const { game, a } = table();
    const goblin = spawn(game, "Raging Goblin", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const lions = spawn(game, "Savannah Lions", B);
    const seen = watchTargets(a, () => [goblin]);
    const mage = enter(game, "Tidebinder Mage");
    expect(seen.offered[0]).toContain(goblin);
    expect(seen.offered[0]).toContain(elves);
    expect(seen.offered[0]).not.toContain(lions);
    expect(game.state.objects[goblin].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[goblin].tapped).toBe(true);
    expect(zone(game, mage)).toBe("battlefield");
  });
});

describe("Woodborn Behemoth", () => {
  it("is an 8/8 trampler with eight lands", () => {
    const { game } = table();
    const behemoth = spawn(game, "Woodborn Behemoth");
    lands(game, "Forest", 7);
    expect(pt(game, behemoth)).toEqual({ power: 4, toughness: 4 });
    lands(game, "Forest", 1);
    expect(pt(game, behemoth)).toEqual({ power: 8, toughness: 8 });
    expect(keywords(game, behemoth).has("trample")).toBe(true);
  });
});

describe("Staff of the Sun Magus", () => {
  it("gains 1 life for a white spell and for a Plains entering", () => {
    const { game } = table();
    spawn(game, "Staff of the Sun Magus");
    enter(game, "Plains");
    expect(life(game, A)).toBe(21);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Savannah Lions"));
    expect(life(game, A)).toBe(22);
  });
});
