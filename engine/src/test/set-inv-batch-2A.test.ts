/**
 * Invasion (INV; B232), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Yawgmoth's Agenda", () => {
  it("casts from the graveyard, then locks out a second spell, and exiles what would go to the graveyard", () => {
    const { game } = table();
    // Into the graveyard before the Agenda is out, or its replacement exiles it.
    const bears = toGraveyard(game, "Grizzly Bears");
    spawn(game, "Yawgmoth's Agenda");
    lands(game, "Forest", 4);
    cast(game, bears, { via: "graveyard-permission" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(() => cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] })).toThrow();
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Faerie Squadron", () => {
  it("kicked, enters with two counters and flying", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const card = toHand(game, "Faerie Squadron");
    cast(game, card, { kicked: true });
    expect(counters(game, card)).toBe(2);
    expect(keywords(game, card).has("flying")).toBe(true);
  });

  it("unkicked, a plain 1/1", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const card = toHand(game, "Faerie Squadron");
    cast(game, card);
    expect(pt(game, card)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, card).has("flying")).toBe(false);
  });
});

describe("Duskwalker", () => {
  it("kicked, enters with two counters and fear", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const card = toHand(game, "Duskwalker");
    cast(game, card, { kicked: true });
    expect(pt(game, card)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, card).has("fear")).toBe(true);
  });
});

describe("Kavu Scout", () => {
  it("counts basic land types, not lands", () => {
    const { game } = table();
    const scout = spawn(game, "Kavu Scout");
    spawn(game, "Mountain");
    lands(game, "Forest", 3);
    expect(pt(game, scout)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Strength of Unity", () => {
  it("gives +1/+1 per basic land type its controller has", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Swamp"]) spawn(game, land);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Strength of Unity"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Tek", () => {
  it("gets each land type's bonus independently", () => {
    const { game } = table();
    const tek = spawn(game, "Tek");
    spawn(game, "Island");
    spawn(game, "Swamp");
    expect(pt(game, tek)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, tek).has("flying")).toBe(true);
    expect(keywords(game, tek).has("first-strike")).toBe(false);
    expect(keywords(game, tek).has("trample")).toBe(false);
  });
});

describe("Phyrexian Slayer", () => {
  it("destroys a white creature that blocks it", () => {
    const { game, a, b } = table();
    const slayer = spawn(game, "Phyrexian Slayer");
    // A white flier that can block it; the trigger destroys it before damage.
    const angel = spawn(game, "Serra Angel", B);
    b.declareBlockersFn = () => [{ blocker: angel, attacker: slayer }];
    attack(game, a, [slayer]);
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, slayer)).toBe("battlefield");
  });
});

describe("Kavu Runner", () => {
  it("has haste unless an opponent controls a white or blue creature", () => {
    const { game } = table();
    const runner = spawn(game, "Kavu Runner");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Coral Merfolk", A);
    expect(keywords(game, runner).has("haste")).toBe(true);
    spawn(game, "Coral Merfolk", B);
    expect(keywords(game, runner).has("haste")).toBe(false);
  });
});

describe("Sky Weaver", () => {
  it("targets only a white or black creature", () => {
    const { game } = table();
    const weaver = spawn(game, "Sky Weaver");
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    expect(() => activate(game, weaver, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, weaver, 0, { targets: [ref(lions)] });
    expect(keywords(game, lions).has("flying")).toBe(true);
  });
});

describe("Stand // Deliver", () => {
  it("casts Deliver to bounce a permanent", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Stand // Deliver");
    cast(game, card, { face: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, card)).toBe("graveyard");
  });
});

describe("Meteor Storm", () => {
  it("discards two cards at random to deal 4 damage", () => {
    const { game } = table();
    const storm = spawn(game, "Meteor Storm");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const before = hand(game).length;
    activate(game, storm, 0, { targets: [ref(B)] });
    expect(hand(game).length).toBe(before - 2);
    expect(life(game, B)).toBe(16);
  });
});
