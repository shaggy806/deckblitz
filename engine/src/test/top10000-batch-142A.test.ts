/**
 * Batch 142, group A — EDHREC ranks 7454–7703. One test per clause most
 * likely to be wrong: Archangel Avacyn's delayed transform and the Purifier's
 * blast, Attempted Murder's dice split, Culling Dais's last-known count,
 * Melek's copy of a spell cast from the library, Saffi Eriksdotter's
 * ownership check, Era of Innovation's paid energy, Deathbringer Liege's
 * tapped check, Nut Collector's anthem over every Squirrel and Hellkite
 * Igniter's artifact count.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
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
  tokensNamed,
  zone,
} from "./harness.js";

describe("Archangel Avacyn", () => {
  it("transforms at the next upkeep after a non-Angel creature of yours dies, then blasts the others", () => {
    const { game } = table();
    const avacyn = spawn(game, "Archangel Avacyn");
    const angel = spawn(game, "Serra Angel");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    // An Angel dying doesn't set it up.
    destroy(game, angel);
    expect(game.state.objects[avacyn].face ?? 0).toBe(0);
    destroy(game, bears);
    expect(game.state.objects[avacyn].face ?? 0).toBe(0);
    // Bob's upkeep is the next upkeep.
    nextTurn(game);
    expect(game.state.objects[avacyn].face).toBe(1);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, avacyn)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("Attempted Murder", () => {
  it("splits X dice between two -1/-1 counters each and Storm Crows", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const target = spawn(game, "Colossal Dreadmaw", B);
    const murder = toHand(game, "Attempted Murder");
    cast(game, murder, { targets: [ref(target)], x: 2 });
    const minus = counters(game, target, "-1/-1");
    expect(minus % 2).toBe(0);
    expect(minus / 2 + tokensNamed(game, "Storm Crow Token", A)).toBe(2);
  });
});

describe("Culling Dais", () => {
  it("draws a card for each charge counter it had as it was sacrificed", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const dais = spawn(game, "Culling Dais");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: dais, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, dais, "charge")).toBe(1);
    game.state.objects[dais].counters.charge = 3;
    const before = hand(game).length;
    activate(game, dais, 1);
    expect(zone(game, dais)).toBe("graveyard");
    expect(hand(game).length - before).toBe(3);
  });
});

describe("Melek, Izzet Paragon", () => {
  it("copies an instant cast from the top of the library", () => {
    const { game } = table();
    spawn(game, "Melek, Izzet Paragon");
    lands(game, "Mountain", 1);
    const bolt = toLibrary(game, "Lightning Bolt");
    game.dispatch({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "library-top" });
    settle(game);
    expect(life(game, B)).toBe(14);

    // From the hand, no copy.
    const fromHand = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    cast(game, fromHand, { targets: [ref(B)] });
    expect(life(game, B)).toBe(11);
  });
});

describe("Saffi Eriksdotter", () => {
  it("returns the targeted creature when it's put into your graveyard this turn", () => {
    const { game, a } = table();
    const saffi = spawn(game, "Saffi Eriksdotter");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    activate(game, saffi, 0, { targets: [ref(bears)] });
    expect(zone(game, saffi)).toBe("graveyard");
    destroy(game, bears);
    const back = game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toHaveLength(1);
    expect(game.state.objects[back[0]].controller).toBe(A);
  });

  it("does nothing for a creature that goes to another player's graveyard", () => {
    const { game } = table();
    const saffi = spawn(game, "Saffi Eriksdotter");
    const theirs = spawn(game, "Grizzly Bears", B);
    activate(game, saffi, 0, { targets: [ref(theirs)] });
    destroy(game, theirs, A);
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears")).toHaveLength(0);
    expect(graveyard(game, B)).toHaveLength(1);
  });
});

describe("Era of Innovation", () => {
  it("pays {1} for {E}{E} when an artifact enters, and six energy draws three", () => {
    const { game, a } = table();
    const era = spawn(game, "Era of Innovation");
    lands(game, "Wastes", 1);
    pickModes(a, 0);
    game.debugSpawn("Ornithopter", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(game.state.players[A].energy).toBe(2);

    game.state.players[A].energy = 6;
    const before = hand(game).length;
    activate(game, era, 0);
    expect(game.state.players[A].energy).toBe(0);
    expect(hand(game).length - before).toBe(3);
    expect(zone(game, era)).toBe("graveyard");
  });
});

describe("Deathbringer Liege", () => {
  it("destroys the target of its black trigger only if that creature is tapped", () => {
    const { game, a } = table();
    spawn(game, "Deathbringer Liege");
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untapped = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 2);
    pickModes(a, 0);
    pickTargets(a, untapped);
    cast(game, toHand(game, "Dark Ritual"));
    expect(zone(game, untapped)).toBe("battlefield");
    pickTargets(a, tapped);
    cast(game, toHand(game, "Dark Ritual"));
    expect(zone(game, tapped)).toBe("graveyard");
  });
});

describe("Nut Collector", () => {
  it("gives every Squirrel +2/+2 at threshold, an opponent's too", () => {
    const { game } = table();
    spawn(game, "Nut Collector");
    const theirs = spawn(game, "Squirrel Token", B);
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Hellkite Igniter", () => {
  it("gets +X/+0 for each artifact you control", () => {
    const { game } = table();
    const hellkite = spawn(game, "Hellkite Igniter");
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter", B);
    lands(game, "Mountain", 2);
    activate(game, hellkite, 0);
    expect(pt(game, hellkite)).toEqual({ power: 7, toughness: 5 });
  });
});
