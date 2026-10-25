/**
 * Commander 2016 and Kaladesh, group C: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Evolutionary Escalation", () => {
  it("puts three +1/+1 counters on a creature of yours and one of an opponent's at your upkeep", () => {
    const { game, a } = table();
    spawn(game, "Evolutionary Escalation");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, mine, theirs);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, mine)).toBe(3);
    expect(counters(game, theirs)).toBe(3);
  });
});

describe("Frenzied Fugue", () => {
  it("steals, untaps and hastes the enchanted permanent as it enters, until end of turn", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bear = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Frenzied Fugue"), { targets: [ref(bear)] });
    expect(controller(game, bear)).toBe(A);
    expect(game.state.objects[bear].tapped).toBe(false);
    expect(keywords(game, bear).has("haste")).toBe(true);
    nextTurn(game);
    expect(controller(game, bear)).toBe(B);
  });

  it("takes it again at the beginning of your upkeep", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Frenzied Fugue"), { targets: [ref(bear)] });
    nextTurn(game);
    expect(controller(game, bear)).toBe(B);
    nextTurn(game);
    expect(controller(game, bear)).toBe(A);
  });
});

describe("Parting Thoughts", () => {
  it("counts every kind of counter on the destroyed creature", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    game.state.objects[bear].counters["+1/+1"] = 2;
    game.state.objects[bear].counters["stun"] = 1;
    const before = hand(game).length;
    cast(game, toHand(game, "Parting Thoughts"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 3);
    expect(life(game)).toBe(17);
  });
});

describe("Nature's Way", () => {
  it("grants vigilance and trample, then the creature deals its power one way", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Nature's Way"), { targets: [ref(mine), ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(game.state.objects[mine].damageMarked).toBe(0);
    expect(keywords(game, mine).has("vigilance")).toBe(true);
    expect(keywords(game, mine).has("trample")).toBe(true);
  });
});

describe("Underhanded Designs", () => {
  it("can't be activated with fewer than two artifacts", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const designs = spawn(game, "Underhanded Designs");
    spawn(game, "Ornithopter");
    const bear = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, designs, 0, { targets: [ref(bear)] })).toThrow();
    spawn(game, "Ornithopter");
    activate(game, designs, 0, { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, designs)).toBe("graveyard");
  });

  it("drains each opponent for {1} when an artifact enters", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 1);
    spawn(game, "Underhanded Designs");
    pickModes(a, 0);
    enter(game, "Ornithopter");
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    expect(life(game)).toBe(21);
  });
});

describe("Aethertorch Renegade", () => {
  it("pays eight energy for 6 damage to a player", () => {
    const { game } = table();
    const renegade = enter(game, "Aethertorch Renegade");
    expect(game.state.players[A].energy).toBe(4);
    expect(() => activate(game, renegade, 1, { targets: [ref(B)] })).toThrow();
    game.state.players[A].energy = 8;
    activate(game, renegade, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    expect(game.state.players[A].energy).toBe(0);
  });
});

describe("Built to Last", () => {
  it("gives an artifact creature indestructible as well as +2/+2", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const thopter = spawn(game, "Ornithopter");
    cast(game, toHand(game, "Built to Last"), { targets: [ref(thopter)] });
    expect(pt(game, thopter)).toEqual({ power: 2, toughness: 4 });
    expect(keywords(game, thopter).has("indestructible")).toBe(true);
  });

  it("gives a nonartifact creature only +2/+2", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Built to Last"), { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bear).has("indestructible")).toBe(false);
  });
});

describe("Glassblower's Puzzleknot", () => {
  it("scries 2 and gives two energy as it enters, and again when sacrificed", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const knot = enter(game, "Glassblower's Puzzleknot");
    expect(game.state.players[A].energy).toBe(2);
    activate(game, knot, 0);
    expect(zone(game, knot)).toBe("graveyard");
    expect(game.state.players[A].energy).toBe(4);
  });
});

describe("Spireside Infiltrator", () => {
  it("deals 1 damage to each opponent when it becomes tapped", () => {
    const { game, a } = table({ players: 3 });
    const rogue = spawn(game, "Spireside Infiltrator");
    attack(game, a, [rogue], B);
    expect(life(game, B)).toBe(16);
    expect(life(game, C)).toBe(19);
    expect(life(game)).toBe(20);
  });
});

describe("Furious Reprisal", () => {
  it("deals 2 damage to each of two different targets", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Furious Reprisal"), { targets: [ref(bear), ref(B)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("can't target the same thing twice", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    expect(() => cast(game, toHand(game, "Furious Reprisal"), { targets: [ref(B), ref(B)] })).toThrow();
  });
});

describe("Take Down", () => {
  it("the second mode deals 1 damage to each creature with flying, and none to the rest", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const drake = spawn(game, "Wind Drake", B);
    const thopter = spawn(game, "Ornithopter");
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Take Down"), { modes: [1] });
    expect(game.state.objects[thopter].damageMarked).toBe(1);
    expect(game.state.objects[drake].damageMarked).toBe(1);
    expect(game.state.objects[bear].damageMarked).toBe(0);
  });
});

describe("Guardian of the Great Conduit", () => {
  it("gets +2/+0 and vigilance only while you control a Nissa planeswalker", () => {
    const { game } = table();
    const guardian = spawn(game, "Guardian of the Great Conduit");
    expect(pt(game, guardian)).toEqual({ power: 2, toughness: 4 });
    expect(keywords(game, guardian).has("vigilance")).toBe(false);
    spawn(game, "Nissa, Voice of Zendikar");
    expect(pt(game, guardian)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, guardian).has("vigilance")).toBe(true);
  });
});

describe("Eager Construct", () => {
  it("offers every player a scry 1", () => {
    const { game, a, b } = table();
    let askedA = 0;
    let askedB = 0;
    a.chooseModesFn = () => {
      askedA += 1;
      return [];
    };
    b.chooseModesFn = () => {
      askedB += 1;
      return [];
    };
    enter(game, "Eager Construct");
    expect(askedA).toBeGreaterThan(0);
    expect(askedB).toBeGreaterThan(0);
  });
});
