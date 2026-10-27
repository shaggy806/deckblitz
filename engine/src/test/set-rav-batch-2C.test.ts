/**
 * Ravnica: City of Guilds (RAV; B234), group C. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Woebringer Demon", () => {
  it("makes the upkeep player sacrifice a creature, and is sacrificed when they can't", () => {
    const { game } = table();
    const demon = spawn(game, "Woebringer Demon");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, demon)).toBe("battlefield");
    nextTurn(game, "upkeep"); // alice's: she sacrifices the Demon itself, her only creature
    settle(game);
    expect(zone(game, demon)).toBe("graveyard");
  });

  it("is sacrificed on an upkeep whose player controls no creature", () => {
    const { game } = table();
    const demon = spawn(game, "Woebringer Demon");
    nextTurn(game, "upkeep");
    settle(game);
    expect(zone(game, demon)).toBe("graveyard");
  });
});

describe("Twisted Justice", () => {
  it("draws cards equal to the sacrificed creature's power", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Twisted Justice"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Razia's Purification", () => {
  it("leaves each player the three permanents they chose", () => {
    const { game, a } = table();
    const own = [...lands(game, "Plains", 3), ...lands(game, "Mountain", 3)];
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Llanowar Elves", B)];
    pickPermanents(a, bears, elves, own[0]);
    cast(game, toHand(game, "Razia's Purification"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, own[0])).toBe("battlefield");
    expect(own.slice(1).every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(theirs.every((id) => zone(game, id) === "battlefield")).toBe(true);
  });
});

describe("Quickchange", () => {
  it("makes the creature the chosen colour until end of turn, and draws", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    pickModes(a, 3); // the single colours come first, W U B R G: red
    cast(game, toHand(game, "Quickchange"), { targets: [ref(bears)] });
    expect(computeCharacteristics(game.state, registryOf(game), bears).colors).toEqual(new Set(["R"]));
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Flame-Kin Zealot", () => {
  it("gives the creatures you control +1/+1 and haste", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const theirs = spawn(game, "Grizzly Bears", B);
    const zealot = enter(game, "Flame-Kin Zealot");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(pt(game, zealot)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Gate Hound and Stasis Cell", () => {
  it("gives vigilance only while the Hound is enchanted; the Cell moves to another creature", () => {
    const { game } = table();
    lands(game, "Island", 9);
    const hound = spawn(game, "Gate Hound");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    const cell = toHand(game, "Stasis Cell");
    cast(game, cell, { targets: [ref(hound)] });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    activate(game, cell, 0, { targets: [ref(bears)] });
    expect(game.state.objects[cell].attachedTo).toBe(bears);
    expect(keywords(game, bears).has("vigilance")).toBe(false);
  });
});

describe("Cyclopean Snare", () => {
  it("taps the creature and returns to its owner's hand", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const snare = spawn(game, "Cyclopean Snare");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, snare, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(zone(game, snare)).toBe("hand");
  });
});

describe("Mnemonic Nexus", () => {
  it("shuffles every player's graveyard into their library", () => {
    const { game } = table();
    lands(game, "Island", 4);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Llanowar Elves", B);
    const nexus = toHand(game, "Mnemonic Nexus");
    cast(game, nexus);
    expect(graveyard(game)).toEqual([nexus]);
    expect(graveyard(game, B).length).toBe(0);
  });
});

describe("Sell-Sword Brute", () => {
  it("deals 2 damage to its controller when it dies", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const brute = spawn(game, "Sell-Sword Brute");
    cast(game, toHand(game, "Shock"), { targets: [ref(brute)] });
    expect(life(game)).toBe(18);
  });
});
