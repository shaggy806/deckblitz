/**
 * Eventide (EVE), batch 1, group C — the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  named,
  pickFromZone,
  pickTargets,
  pt,
  spawn,
  subtypes,
  toHand,
  table,
  zone,
} from "./harness.js";

describe("Figure of Destiny", () => {
  it("climbs to an 8/8 flier, and the first ability later keeps flying and first strike", () => {
    const { game } = table();
    const figure = spawn(game, "Figure of Destiny");
    lands(game, "Mountain", 11);
    // The Warrior step does nothing while it isn't a Spirit.
    activate(game, figure, 1);
    expect(pt(game, figure)).toEqual({ power: 1, toughness: 1 });
    activate(game, figure, 0);
    expect(pt(game, figure)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, figure)).toEqual(expect.arrayContaining(["Kithkin", "Spirit"]));
    // 1 + 3 spent; 7 left: 3 for Warrior.
    activate(game, figure, 1);
    expect(pt(game, figure)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, figure)).toContain("Warrior");
    lands(game, "Mountain", 3);
    activate(game, figure, 2);
    expect(pt(game, figure)).toEqual({ power: 8, toughness: 8 });
    expect(keywords(game, figure).has("flying")).toBe(true);
    expect(keywords(game, figure).has("first-strike")).toBe(true);
    activate(game, figure, 0);
    expect(pt(game, figure)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, figure)).not.toContain("Warrior");
    expect(keywords(game, figure).has("flying")).toBe(true);
    expect(keywords(game, figure).has("first-strike")).toBe(true);
  });
});

describe("Ashling, the Extinguisher", () => {
  it("makes the damaged player sacrifice the targeted creature", () => {
    const { game, a } = table();
    const ashling = spawn(game, "Ashling, the Extinguisher");
    const bears = spawn(game, "Grizzly Bears", B);
    const piker = spawn(game, "Goblin Piker", B);
    pickTargets(a, piker);
    attack(game, a, [ashling]);
    expect(zone(game, piker)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Impelled Giant", () => {
  it("gets +X/+0 for the tapped red creature's power, and can't tap itself", () => {
    const { game } = table();
    const giant = spawn(game, "Impelled Giant");
    expect(() => activate(game, giant, 0)).toThrow();
    const piker = spawn(game, "Goblin Piker", A, { sick: true });
    activate(game, giant, 0);
    expect(game.state.objects[piker].tapped).toBe(true);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 3 });
  });

  it("can't tap a creature that isn't red", () => {
    const { game } = table();
    const giant = spawn(game, "Impelled Giant");
    spawn(game, "Grizzly Bears");
    expect(() => activate(game, giant, 0)).toThrow();
  });
});

describe("Dream Thief", () => {
  it("doesn't count itself as another blue spell", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const thief = toHand(game, "Dream Thief");
    const before = hand(game).length;
    cast(game, thief);
    expect(zone(game, thief)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
  });

  it("draws after another blue spell this turn", () => {
    const { game } = table();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Divination"));
    const thief = toHand(game, "Dream Thief");
    const before = hand(game).length;
    cast(game, thief);
    expect(hand(game).length).toBe(before);
  });
});

describe("Talara's Battalion", () => {
  it("can be cast only after another green spell", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const battalion = toHand(game, "Talara's Battalion");
    expect(() => cast(game, battalion)).toThrow();
    cast(game, toHand(game, "Grizzly Bears"));
    cast(game, battalion);
    expect(zone(game, battalion)).toBe("battlefield");
  });
});

describe("Sturdy Hatchling", () => {
  it("enters with four -1/-1 counters, and a green-blue spell removes two", () => {
    const { game } = table();
    const hatchling = enter(game, "Sturdy Hatchling");
    expect(counters(game, hatchling, "-1/-1")).toBe(4);
    expect(pt(game, hatchling)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Island", 4);
    cast(game, toHand(game, "Sturdy Hatchling"));
    expect(counters(game, hatchling, "-1/-1")).toBe(2);
  });
});

describe("Unnerving Assault", () => {
  it("does only the red half when no {U} was spent", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Unnerving Assault"));
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("does both halves when {U} and {R} were spent", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unnerving Assault"));
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 2 });
  });
});

describe("Mindwrack Liege", () => {
  it("gives a blue-red creature +2/+2 and puts a red creature card from hand onto the battlefield", () => {
    const { game, a } = table();
    const liege = spawn(game, "Mindwrack Liege");
    const bandit = spawn(game, "Noggle Bandit");
    expect(pt(game, bandit)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, liege)).toEqual({ power: 4, toughness: 4 });
    lands(game, "Mountain", 4);
    const piker = toHand(game, "Goblin Piker");
    const bears = toHand(game, "Grizzly Bears");
    const { offered } = pickFromZone(a, piker);
    activate(game, liege, 0);
    expect(offered).not.toContain(bears);
    expect(zone(game, piker)).toBe("battlefield");
  });
});

describe("Aerie Ouphes", () => {
  it("deals its power to a flier and persists", () => {
    const { game, a } = table();
    const ouphes = spawn(game, "Aerie Ouphes");
    const crow = spawn(game, "Storm Crow", B);
    pickTargets(a, crow);
    activate(game, ouphes, 0, { targets: [{ kind: "object", object: crow }] });
    expect(zone(game, crow)).toBe("graveyard");
    const back = named(game, "Aerie Ouphes").filter((id) => zone(game, id) === "battlefield");
    expect(back).toHaveLength(1);
    expect(counters(game, back[0], "-1/-1")).toBe(1);
  });
});
