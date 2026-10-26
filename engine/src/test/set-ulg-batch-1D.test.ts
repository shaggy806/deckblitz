/**
 * Urza's Legacy (ULG) and Portal Three Kingdoms (PTK), group D. One test per
 * card whose behaviour is more than a stat line, on the clause most likely to
 * be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Forbidding Watchtower", () => {
  it("becomes a 1/5 white Soldier creature that's still a land", () => {
    const { game } = table();
    const tower = spawn(game, "Forbidding Watchtower");
    lands(game, "Plains", 2);
    activate(game, tower, 1);
    expect(pt(game, tower)).toEqual({ power: 1, toughness: 5 });
    expect(types(game, tower)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, tower)).toContain("Soldier");
  });
});

describe("Scrapheap", () => {
  it("gains 1 life for an artifact or enchantment going to your graveyard, not an opponent's or a creature", () => {
    const { game } = table();
    spawn(game, "Scrapheap");
    const mine = spawn(game, "Glorious Anthem");
    const theirs = spawn(game, "Glorious Anthem", B);
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, theirs);
    destroy(game, bears);
    expect(life(game, A)).toBe(20);
    destroy(game, mine);
    expect(life(game, A)).toBe(21);
  });
});

describe("Hidden Gibbons", () => {
  it("becomes a 4/4 Ape creature, no longer an enchantment, when an opponent casts an instant", () => {
    const { game } = table();
    const gibbons = spawn(game, "Hidden Gibbons");
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(A)] });
    expect(pt(game, gibbons)).toEqual({ power: 4, toughness: 4 });
    expect(types(game, gibbons)).toEqual(["creature"]);
    expect(subtypes(game, gibbons)).toEqual(["Ape"]);
  });
});

describe("Second Chance", () => {
  it("at 5 life, is sacrificed at your upkeep for an extra turn", () => {
    const { game } = table({ life: 5 });
    const chance = spawn(game, "Second Chance");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, chance)).toBe("graveyard");
    expect(game.state.extraTurns).toEqual([A]);
  });

  it("does nothing above 5 life", () => {
    const { game } = table({ life: 6 });
    const chance = spawn(game, "Second Chance");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, chance)).toBe("battlefield");
    expect(game.state.extraTurns).toEqual([]);
  });
});

describe("Anthroplasm", () => {
  it("enters with two counters and resets to X", () => {
    const { game } = table();
    const plasm = enter(game, "Anthroplasm");
    expect(counters(game, plasm)).toBe(2);
    lands(game, "Island", 5);
    toStep(game, "precombat-main");
    activate(game, plasm, 0, { x: 5 });
    expect(counters(game, plasm)).toBe(5);
    expect(pt(game, plasm)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Lurking Skirge", () => {
  it("becomes a 3/2 flying Phyrexian Imp when an opponent's creature dies, not yours", () => {
    const { game } = table();
    const skirge = spawn(game, "Lurking Skirge");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(types(game, skirge)).toEqual(["enchantment"]);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(graveyard(game, B).length).toBe(1);
    expect(pt(game, skirge)).toEqual({ power: 3, toughness: 2 });
    expect(types(game, skirge)).toEqual(["creature"]);
    expect(subtypes(game, skirge)).toEqual(["Phyrexian", "Imp"]);
    expect(keywords(game, skirge).has("flying")).toBe(true);
  });
});

describe("Rank and File", () => {
  it("gives green creatures -1/-1, and only green ones", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const lions = spawn(game, "Savannah Lions", B);
    enter(game, "Rank and File");
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, lions)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Peach Garden Oath", () => {
  it("gains 2 life per creature you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Peach Garden Oath"));
    expect(life(game, A)).toBe(24);
  });
});
