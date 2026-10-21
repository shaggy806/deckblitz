/**
 * Commander 2019 and Core Set 2020 (C19, M20; B121), group C. One test per
 * card whose behaviour is more than a stat line, on the clause most likely
 * to be wrong.
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
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const PLANT = "1/1 Green Plant Token";

describe("Grismold, the Dreadsower", () => {
  it("gives each player a Plant at your end step, and grows when any creature token dies", () => {
    const { game } = table();
    const grismold = enter(game, "Grismold, the Dreadsower");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, PLANT, A)).toBe(1);
    expect(tokensNamed(game, PLANT, B)).toBe(1);
    const [bobs] = named(game, PLANT, B);
    destroy(game, bobs);
    expect(counters(game, grismold)).toBe(1);
  });
});

describe("Gauntlets of Light", () => {
  it("adds +0/+2 and deals combat damage equal to toughness, leaving power alone", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Gauntlets of Light"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 4 });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Scorch Spitter", () => {
  it("deals 1 damage to the player it attacks, on top of its combat damage", () => {
    const { game, a } = table();
    const spitter = spawn(game, "Scorch Spitter");
    attack(game, a, [spitter]);
    expect(life(game, B)).toBe(18);
  });
});

describe("Chandra's Embercat", () => {
  it("its mana casts an Elemental spell but not a Shock", () => {
    const { game } = table();
    spawn(game, "Chandra's Embercat");
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(B)] })).toThrow(/refused/);
    const spitter = toHand(game, "Scorch Spitter");
    cast(game, spitter);
    expect(zone(game, spitter)).toBe("battlefield");
  });
});

describe("Chandra, Flame's Fury", () => {
  it("−2 deals 4 to a creature and 2 to its controller", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Flame's Fury");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, chandra, -2, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("−8 deals 10 to the player and each creature they control, not yours", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Flame's Fury");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    loyalty(game, chandra, -8, { atLeast: 8, targets: [ref(B)] });
    expect(life(game, B)).toBe(10);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Gnarlback Rhino", () => {
  it("draws a card when you cast a spell that targets it", () => {
    const { game } = table();
    const rhino = spawn(game, "Gnarlback Rhino");
    lands(game, "Forest", 1);
    const growth = toHand(game, "Giant Growth");
    const before = hand(game).length;
    cast(game, growth, { targets: [ref(rhino)] });
    expect(hand(game).length).toBe(before); // the Growth left, a card came
  });
});

describe("Wolfrider's Saddle", () => {
  it("makes a Wolf and arrives attached to it", () => {
    const { game } = table();
    enter(game, "Wolfrider's Saddle");
    const [wolf] = named(game, "Wolf Token", A);
    expect(wolf).toBeDefined();
    expect(pt(game, wolf)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Ironroot Warlord", () => {
  it("has power equal to the creatures you control, itself included", () => {
    const { game } = table();
    const warlord = spawn(game, "Ironroot Warlord");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, warlord)).toEqual({ power: 3, toughness: 5 });
  });
});

describe("Growth Cycle", () => {
  it("adds +2/+2 per Growth Cycle in your graveyard only, counted once as it resolves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Growth Cycle");
    toGraveyard(game, "Growth Cycle");
    toGraveyard(game, "Growth Cycle", B);
    lands(game, "Forest", 2);
    const spell = toHand(game, "Growth Cycle");
    cast(game, spell, { targets: [ref(bears)] });
    expect(graveyard(game)).toContain(spell);
    expect(pt(game, bears)).toEqual({ power: 9, toughness: 9 });
  });
});

describe("Vivien's Crocodile", () => {
  it("gets +1/+1 only while you control a Vivien planeswalker", () => {
    const { game } = table();
    const croc = spawn(game, "Vivien's Crocodile");
    spawn(game, "Vivien, Nature's Avenger", B);
    expect(pt(game, croc)).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Vivien, Nature's Avenger", A);
    expect(pt(game, croc)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Brineborn Cutthroat", () => {
  it("grows when you cast a spell on an opponent's turn, not your own", () => {
    const { game } = table();
    const cutthroat = spawn(game, "Brineborn Cutthroat");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, cutthroat)).toBe(0);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, cutthroat)).toBe(1);
  });
});

describe("Shifting Ceratops", () => {
  it("gains the keyword its controller picks", () => {
    const { game, a } = table();
    const ceratops = spawn(game, "Shifting Ceratops");
    lands(game, "Forest", 1);
    pickModes(a, 1);
    activate(game, ceratops);
    expect(keywords(game, ceratops).has("trample")).toBe(true);
    expect(keywords(game, ceratops).has("haste")).toBe(false);
  });
});

describe("Mu Yanling, Celestial Wind", () => {
  it("−7 pumps only your creatures with flying", () => {
    const { game } = table();
    const mu = spawn(game, "Mu Yanling, Celestial Wind");
    const flier = spawn(game, "Storm Crow");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, mu, -7, { atLeast: 7 });
    expect(pt(game, flier)).toEqual({ power: 6, toughness: 7 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});
