/** Batch 166, group D (Mirage): Early Harvest's basic-only untap, Forsaken
 * Wastes' targeting drain and life-gain lock, Seeds of Innocence's per-
 * controller life, Roots of Life's chosen type, Shauku's attack restriction
 * and exile, Reparations' spell-targets trigger, Shimmer's chosen land type, Soulshriek's +X/+0 and
 * delayed sacrifice, Vigilant Martyr's and Unyaro Griffin's counters. */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  nextTurn,
  cast,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
  counters,
} from "./harness.js";

describe("Early Harvest", () => {
  it("untaps the target player's basic lands only", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const basic = spawn(game, "Forest", B, { tapped: true });
    const nonbasic = spawn(game, "Tranquil Thicket", B, { tapped: true });
    cast(game, toHand(game, "Early Harvest"), { targets: [ref(B)] });
    expect(game.state.objects[basic].tapped).toBe(false);
    expect(game.state.objects[nonbasic].tapped).toBe(true);
  });
});

describe("Forsaken Wastes", () => {
  it("drains the controller of a spell that targets it, and stops life gain", () => {
    const { game } = table();
    const wastes = spawn(game, "Forsaken Wastes");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Nourish"));
    expect(life(game, A)).toBe(20);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Disenchant"), { targets: [ref(wastes)] });
    expect(zone(game, wastes)).toBe("graveyard");
    expect(life(game, A)).toBe(15);
  });
});

describe("Seeds of Innocence", () => {
  it("each controller gains the mana value of their destroyed artifacts", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const stone = spawn(game, "Mind Stone");
    const ring = spawn(game, "Sol Ring", B);
    const wurm = spawn(game, "Wurmcoil Engine", B);
    cast(game, toHand(game, "Seeds of Innocence"));
    expect([zone(game, stone), zone(game, ring), zone(game, wurm)]).toEqual(["graveyard", "graveyard", "graveyard"]);
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(27);
  });
});

describe("Roots of Life", () => {
  it("gains 1 life when an opponent's land of the chosen type becomes tapped", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    a.chooseCreatureTypeFn = () => "Swamp";
    cast(game, toHand(game, "Roots of Life"));
    const swamp = spawn(game, "Swamp", B);
    const island = spawn(game, "Island", B);
    lands(game, "Forest", 2);
    const port = spawn(game, "Rishadan Port");
    activate(game, port, 1, { targets: [ref(island)] });
    expect(life(game, A)).toBe(20);
    activate(game, spawn(game, "Rishadan Port"), 1, { targets: [ref(swamp)] });
    expect(life(game, A)).toBe(21);
  });
});

describe("Shauku, Endbringer", () => {
  it("exiles a creature and grows; attacks only once it's alone", () => {
    const { game, a } = table();
    const shauku = spawn(game, "Shauku, Endbringer");
    const bears = spawn(game, "Grizzly Bears", B);
    attack(game, a, [shauku]);
    expect(life(game, B)).toBe(20);
    nextTurn(game);
    toStep(game, "precombat-main");
    activate(game, shauku, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, shauku)).toBe(1);
    nextTurn(game);
    toStep(game, "precombat-main");
    attack(game, a, [shauku]);
    expect(life(game, B)).toBe(14);
  });

  it("can't attack beside another creature you control", () => {
    const { game, a } = table();
    const shauku = spawn(game, "Shauku, Endbringer");
    spawn(game, "Grizzly Bears");
    expect(() => attack(game, a, [shauku])).toThrow(/can't attack/);
  });
});

describe("Reparations", () => {
  it("offers a draw when an opponent's spell targets you or your creature, not theirs", () => {
    const seats = table();
    const { game } = seats;
    const { b } = seats;
    pickModes(b, 0);
    spawn(game, "Reparations", B);
    lands(game, "Mountain", 3);
    const before = hand(game, B).length;
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Shock"), { targets: [ref(mine)] });
    expect(hand(game, B).length).toBe(before);
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(theirs)] });
    expect(hand(game, B).length).toBe(before + 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before + 2);
  });
});

describe("Shimmer", () => {
  it("gives phasing to lands of the chosen type only", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    a.chooseCreatureTypeFn = () => "Forest";
    const forest = spawn(game, "Forest", B);
    const island = spawn(game, "Island", B);
    cast(game, toHand(game, "Shimmer"));
    expect(keywords(game, forest).has("phasing")).toBe(true);
    expect(keywords(game, island).has("phasing")).toBe(false);
  });
});

describe("Soulshriek", () => {
  it("adds power per creature card in your graveyard, then sacrifices it at end step", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Soulshriek"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    toStep(game, "cleanup");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Vigilant Martyr", () => {
  it("counters a spell that targets an enchantment", () => {
    const { game } = table();
    const martyr = spawn(game, "Vigilant Martyr");
    lands(game, "Plains", 2);
    const anthem = spawn(game, "Glorious Anthem");
    lands(game, "Plains", 2);
    const disenchant = toHand(game, "Disenchant");
    cast(game, disenchant, { targets: [ref(anthem)], settle: false });
    activate(game, martyr, 1, { targets: [ref(disenchant)] });
    expect(zone(game, anthem)).toBe("battlefield");
    expect(graveyard(game, A)).toContain(disenchant);
  });
});

describe("Unyaro Griffin", () => {
  it("counters a red instant", () => {
    const { game } = table();
    const griffin = spawn(game, "Unyaro Griffin");
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    activate(game, griffin, 0, { targets: [ref(shock)] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, griffin)).toBe("graveyard");
  });
});
