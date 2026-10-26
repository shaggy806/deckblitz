import { describe, expect, it } from "vitest";

import {
  B,
  activate,
  attack,
  cast,
  destroy,
  hand,
  lands,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Erratic Portal", () => {
  it("returns the creature when its controller can't pay {1}", () => {
    const { game } = table();
    const portal = spawn(game, "Erratic Portal");
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, portal, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Soltari Visionary", () => {
  it("destroys an enchantment the damaged player controls", () => {
    const { game, a } = table();
    const visionary = spawn(game, "Soltari Visionary");
    const anthem = spawn(game, "Glorious Anthem", B);
    pickTargets(a, anthem);
    attack(game, a, [visionary]);
    settle(game);
    expect(zone(game, anthem)).toBe("graveyard");
  });
});

describe("Elvish Berserker", () => {
  it("gets +1/+1 for each creature blocking it", () => {
    const { game, a, b } = table();
    const berserker = spawn(game, "Elvish Berserker");
    const x = spawn(game, "Llanowar Elves", B);
    const y = spawn(game, "Llanowar Elves", B);
    a.declareAttackersFn = () => [{ attacker: berserker, defender: B }];
    b.declareBlockersFn = () => [
      { blocker: x, attacker: berserker },
      { blocker: y, attacker: berserker },
    ];
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, berserker)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Pygmy Troll", () => {
  it("gets +1/+1 once per creature blocking it", () => {
    const { game, a, b } = table();
    const troll = spawn(game, "Pygmy Troll");
    const x = spawn(game, "Llanowar Elves", B);
    const y = spawn(game, "Llanowar Elves", B);
    a.declareAttackersFn = () => [{ attacker: troll, defender: B }];
    b.declareBlockersFn = () => [
      { blocker: x, attacker: troll },
      { blocker: y, attacker: troll },
    ];
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, troll)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Cinder Crawler", () => {
  it("pumps only while it's blocked", () => {
    const { game, a, b } = table();
    const crawler = spawn(game, "Cinder Crawler");
    lands(game, "Mountain", 2);
    expect(() => activate(game, crawler)).toThrow();
    const elves = spawn(game, "Llanowar Elves", B);
    a.declareAttackersFn = () => [{ attacker: crawler, defender: B }];
    b.declareBlockersFn = () => [{ blocker: elves, attacker: crawler }];
    toStep(game, "declare-attackers");
    expect(() => activate(game, crawler)).toThrow();
    toStep(game, "declare-blockers");
    activate(game, crawler);
    expect(pt(game, crawler)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Resuscitate", () => {
  it("gives the creatures you control now a regeneration ability, not later ones", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Resuscitate"));
    const late = spawn(game, "Grizzly Bears");
    expect(() => activate(game, late)).toThrow();
    activate(game, bears);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Medicine Bag", () => {
  it("discards a card to regenerate target creature", () => {
    const { game } = table();
    const bag = spawn(game, "Medicine Bag");
    lands(game, "Wastes", 1);
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, bag, 0, { targets: [ref(bears)] });
    expect(hand(game).length).toBe(before - 1);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
