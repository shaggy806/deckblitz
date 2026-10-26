/**
 * Innistrad and Magic 2012 — group D of the set walk: Screeching Bat's paid
 * transform, bloodthirst, random graveyard returns, Phantasmal Dragon and
 * the Human-only Equipment.
 */
import { describe, expect, it } from "vitest";

import {
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
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
  toStep,
  zone,
} from "./harness.js";
import { faceName } from "../state.js";

describe("Screeching Bat", () => {
  it("transforms into Stalking Vampire when its controller pays {2}{B}{B} at upkeep", () => {
    const { game, a } = table();
    const bat = spawn(game, "Screeching Bat");
    lands(game, "Swamp", 4);
    pickModes(a, 0);
    toStep(game, "draw");
    expect(faceName(game.state.objects[bat])).toBe("Stalking Vampire");
    expect(pt(game, bat)).toEqual({ power: 5, toughness: 5 });
  });

  it("stays a Bat when the cost is declined", () => {
    const { game } = table();
    const bat = spawn(game, "Screeching Bat");
    lands(game, "Swamp", 4);
    toStep(game, "draw");
    expect(pt(game, bat)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bat).has("flying")).toBe(true);
  });
});

describe("Vampire Outcasts", () => {
  it("enters with two +1/+1 counters only once an opponent was dealt damage this turn", () => {
    const { game } = table();
    const first = enter(game, "Vampire Outcasts");
    expect(counters(game, first)).toBe(0);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const second = enter(game, "Vampire Outcasts");
    expect(counters(game, second)).toBe(2);
    expect(pt(game, second)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Make a Wish", () => {
  it("returns two cards from the graveyard to hand, and only one when one is there", () => {
    const { game } = table();
    for (const name of ["Grizzly Bears", "Shock", "Island"]) toGraveyard(game, name);
    lands(game, "Forest", 8);
    const before = hand(game).length;
    cast(game, toHand(game, "Make a Wish"));
    expect(hand(game).length).toBe(before + 2);
    expect(graveyard(game).length).toBe(2); // the one left, and Make a Wish

    const { game: g2 } = table();
    const only = toGraveyard(g2, "Grizzly Bears");
    lands(g2, "Forest", 4);
    cast(g2, toHand(g2, "Make a Wish"));
    expect(zone(g2, only)).toBe("hand");
  });
});

describe("Phantasmal Dragon", () => {
  it("is sacrificed when it becomes a target", () => {
    const { game } = table();
    const dragon = spawn(game, "Phantasmal Dragon", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(dragon)] });
    expect(zone(game, dragon)).toBe("graveyard");
  });
});

describe("Crumbling Colossus", () => {
  it("is sacrificed at end of combat after it attacks", () => {
    const { game, a } = table();
    const colossus = spawn(game, "Crumbling Colossus");
    attack(game, a, [colossus]);
    expect(zone(game, colossus)).toBe("graveyard");
  });
});

describe("Geistcatcher's Rig", () => {
  it("may deal 4 damage to a creature with flying as it enters", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    pickTargets(a, angel);
    pickModes(a, 0);
    enter(game, "Geistcatcher's Rig");
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("Sharpened Pitchfork", () => {
  it("gives first strike, and +1/+1 only to a Human", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const human = spawn(game, "Elite Inquisitor");
    const fork = spawn(game, "Sharpened Pitchfork");
    lands(game, "Wastes", 2);
    activate(game, fork, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    activate(game, fork, 0, { targets: [ref(human)] });
    expect(pt(game, human)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[fork].attachedTo).toBe(human);
  });
});
