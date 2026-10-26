/**
 * Theros / Commander 2013, group E: Master of Waves' devotion-sized Elementals,
 * From the Ashes' per-player searches, Act of Authority's control handoff,
 * Sydri's mana-value animation, the heroic creatures (Phalanx Leader's
 * counters for everyone, Artisan of Forms' copy), the two Emissaries'
 * bestowed triggers and Reverent Hunter's devotion counters.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  hand,
  lands,
  named,
  pickFromZone,
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
  types,
  zone,
} from "./harness.js";

describe("Master of Waves", () => {
  it("makes one 1/0 Elemental per point of devotion to blue, each a 2/1 under the anthem", () => {
    const { game } = table();
    spawn(game, "Flitterstep Eidolon");
    enter(game, "Master of Waves");
    expect(tokensNamed(game, "1/0 Blue Elemental Token", A)).toBe(2);
    const [token] = named(game, "1/0 Blue Elemental Token", A);
    expect(pt(game, token)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("From the Ashes", () => {
  it("destroys nonbasic lands; each player searches up to one basic per land of theirs destroyed", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 4);
    const towers = [spawn(game, "Command Tower"), spawn(game, "Command Tower")];
    const bTower = spawn(game, "Command Tower", B);
    pickModes(a, 0);
    pickModes(b, 0);
    const [first, second] = game.state.zones.perPlayer[A].library;
    const bFirst = game.state.zones.perPlayer[B].library[0];
    const aSearch = pickFromZone(a, first, second);
    pickFromZone(b, bFirst);
    cast(game, toHand(game, "From the Ashes"));
    expect(towers.every((t) => zone(game, t) === "graveyard")).toBe(true);
    expect(zone(game, bTower)).toBe("graveyard");
    expect(aSearch.offered.length).toBeGreaterThan(0);
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("battlefield");
    expect(game.state.objects[first].tapped).toBe(false);
    expect(zone(game, bFirst)).toBe("battlefield");
  });
});

describe("Act of Authority", () => {
  it("at your upkeep, exiling the target hands this enchantment to that permanent's controller", () => {
    const { game, a } = table();
    const act = spawn(game, "Act of Authority");
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, ring)).toBe("exile");
    expect(controller(game, act)).toBe(B);
  });
});

describe("Sydri, Galvanic Genius", () => {
  it("animates a noncreature artifact with P/T equal to its mana value", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const sydri = spawn(game, "Sydri, Galvanic Genius");
    const stone = spawn(game, "Mind Stone");
    activate(game, sydri, 0, { targets: [ref(stone)] });
    expect(types(game, stone)).toContain("creature");
    expect(types(game, stone)).toContain("artifact");
    expect(pt(game, stone)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Phalanx Leader", () => {
  it("heroic: a +1/+1 counter on each creature you control", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const leader = spawn(game, "Phalanx Leader");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(leader)] });
    expect(counters(game, leader)).toBe(1);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Artisan of Forms", () => {
  it("heroic: may become a copy of target creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const artisan = spawn(game, "Artisan of Forms");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a, 0);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(artisan)] });
    // A 3/3 Hill Giant, +3/+3 from Giant Growth.
    expect(pt(game, artisan)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Thassa's Emissary", () => {
  it("bestowed, the enchanted creature's combat damage to a player draws a card", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears");
    const emissary = toHand(game, "Thassa's Emissary");
    cast(game, emissary, { overload: true, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Heliod's Emissary", () => {
  it("bestowed, the enchanted creature's attack taps target creature an opponent controls", () => {
    const { game, a } = table();
    lands(game, "Plains", 7);
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Heliod's Emissary"), { overload: true, targets: [ref(bears)] });
    pickTargets(a, blocker);
    attack(game, a, [bears]);
    expect(game.state.objects[blocker].tapped).toBe(true);
  });
});

describe("Reverent Hunter", () => {
  it("enters with +1/+1 counters equal to your devotion to green, its own included", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    const hunter = enter(game, "Reverent Hunter");
    expect(counters(game, hunter)).toBe(2);
  });
});
