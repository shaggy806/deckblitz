/**
 * Commander 2016 (C16) and Kaladesh (KLD), batch 1, group D (2026-10-23).
 * Written on the shared table in `harness.ts`, each from the card's Oracle
 * text.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
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
  toStep,
  zone,
} from "./harness.js";

const energy = (game: ReturnType<typeof table>["game"], player = A): number => game.state.players[player].energy;

describe("Akiri, Line-Slinger", () => {
  it("gets +1/+0 for each artifact you control", () => {
    const { game } = table();
    const akiri = spawn(game, "Akiri, Line-Slinger");
    expect(pt(game, akiri)).toEqual({ power: 0, toughness: 3 });
    spawn(game, "Memnite");
    spawn(game, "Memnite");
    spawn(game, "Memnite", B);
    expect(pt(game, akiri)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Charging Cinderhorn", () => {
  it("gets a fury counter at each player's end step with no attack, and deals that much to that player", () => {
    const { game } = table();
    const ox = spawn(game, "Charging Cinderhorn");
    toStep(game, "end");
    settle(game);
    expect(counters(game, ox, "fury")).toBe(1);
    expect(life(game, A)).toBe(19);
    nextTurn(game);
    toStep(game, "end", B);
    settle(game);
    expect(counters(game, ox, "fury")).toBe(2);
    expect(life(game, B)).toBe(18);
  });

  it("doesn't trigger in a turn a creature attacked", () => {
    const { game, a } = table();
    const ox = spawn(game, "Charging Cinderhorn");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "end");
    settle(game);
    expect(counters(game, ox, "fury")).toBe(0);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(18);
  });
});

describe("Fateful Showdown", () => {
  it("deals damage equal to your hand, then discards it and draws that many", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const card = toHand(game, "Fateful Showdown");
    const n = hand(game).length - 1;
    const graveBefore = graveyard(game).length;
    cast(game, card, { targets: [ref(B)] });
    expect(life(game, B)).toBe(20 - n);
    expect(hand(game).length).toBe(n);
    expect(graveyard(game).length).toBe(graveBefore + n + 1);
  });
});

describe("Built to Smash", () => {
  it("gives +3/+3 to an attacker, and trample only to an artifact creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const memnite = spawn(game, "Memnite");
    lands(game, "Mountain", 2);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: memnite, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    cast(game, toHand(game, "Built to Smash"), { targets: [ref(memnite)] });
    expect(pt(game, memnite)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, memnite).has("trample")).toBe(true);
    cast(game, toHand(game, "Built to Smash"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("trample")).toBe(false);
  });
});

describe("Chandra's Pyrohelix", () => {
  it("divides 2 damage between two targets", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Chandra's Pyrohelix"), { targets: [ref(bears), ref(B)], division: [1, 1] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(life(game, B)).toBe(19);
  });
});

describe("Dynavolt Tower", () => {
  it("gets {E}{E} for each instant or sorcery you cast, and spends five for 3 damage", () => {
    const { game } = table();
    const tower = spawn(game, "Dynavolt Tower");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(energy(game)).toBe(4);
    enter(game, "Grizzly Bears");
    expect(energy(game)).toBe(4);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(energy(game)).toBe(6);
    activate(game, tower, 0, { targets: [ref(B)] });
    expect(energy(game)).toBe(1);
    expect(life(game, B)).toBe(20 - 9 - 3);
  });
});

describe("Welding Sparks", () => {
  it("deals 3 plus the number of artifacts you control", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Memnite");
    spawn(game, "Memnite");
    const titan = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Welding Sparks"), { targets: [ref(titan)] });
    expect(game.state.objects[titan].zone).toBe("graveyard");
    expect(graveyard(game, B)).toContain(titan);
  });
});

describe("Bristling Hydra", () => {
  it("pays {E}{E}{E} for a +1/+1 counter and hexproof", () => {
    const { game } = table();
    const hydra = enter(game, "Bristling Hydra");
    expect(energy(game)).toBe(3);
    activate(game, hydra);
    expect(energy(game)).toBe(0);
    expect(counters(game, hydra)).toBe(1);
    expect(keywords(game, hydra).has("hexproof")).toBe(true);
  });
});

describe("Multiform Wonder", () => {
  it("chooses its keyword and its P/T swing as each ability resolves", () => {
    const { game, a } = table();
    const wonder = enter(game, "Multiform Wonder");
    expect(energy(game)).toBe(3);
    pickModes(a, 2);
    activate(game, wonder, 0);
    expect(keywords(game, wonder).has("lifelink")).toBe(true);
    expect(keywords(game, wonder).has("flying")).toBe(false);
    pickModes(a, 1);
    activate(game, wonder, 1);
    expect(pt(game, wonder)).toEqual({ power: 1, toughness: 5 });
    expect(energy(game)).toBe(1);
  });
});

describe("Scrapheap Scrounger", () => {
  it("returns from the graveyard by exiling another creature card", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const scrounger = toGraveyard(game, "Scrapheap Scrounger");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickFromZone(a, bears);
    activate(game, scrounger);
    expect(zone(game, scrounger)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
  });

  it("can't pay with itself alone", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const scrounger = toGraveyard(game, "Scrapheap Scrounger");
    expect(() => activate(game, scrounger)).toThrow();
  });
});

describe("Thriving Turtle", () => {
  it("may pay {E}{E} as it attacks for a +1/+1 counter", () => {
    const { game, a } = table();
    const turtle = enter(game, "Thriving Turtle");
    expect(energy(game)).toBe(2);
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: turtle, defender: B }];
    toStep(game, "postcombat-main");
    expect(counters(game, turtle)).toBe(1);
    expect(energy(game)).toBe(0);
  });
});

describe("Tidy Conclusion", () => {
  it("destroys a creature and gains 1 life per artifact you control", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    spawn(game, "Memnite");
    spawn(game, "Dynavolt Tower");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Tidy Conclusion"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game)).toBe(22);
  });
});

describe("Self-Assembler", () => {
  it("may find an Assembly-Worker creature card", () => {
    const { game, a } = table();
    const other = toLibrary(game, "Self-Assembler");
    pickModes(a, 0);
    const seen = pickFromZone(a, other);
    enter(game, "Self-Assembler");
    expect(seen.offered).toEqual([other]);
    expect(zone(game, other)).toBe("hand");
  });
});

describe("Maulfist Doorbuster", () => {
  it("pays {E} as it attacks to stop the target creature blocking", () => {
    const { game, a } = table();
    const door = enter(game, "Maulfist Doorbuster");
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    const offer = blockOffer(game, a, [door]);
    const blockers: readonly ObjectId[] = offer.eligible.filter((e) => e.canBlock.length > 0).map((e) => e.blocker);
    expect(blockers).toEqual([other]);
    expect(energy(game)).toBe(1);
  });
});

describe("Lathnu Hellion", () => {
  it("stays when you pay {E}{E} at your end step, and is sacrificed when you can't", () => {
    const { game, a } = table();
    const hellion = enter(game, "Lathnu Hellion");
    expect(energy(game)).toBe(2);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, hellion)).toBe("battlefield");
    expect(energy(game)).toBe(0);
    nextTurn(game);
    toStep(game, "end");
    settle(game);
    expect(zone(game, hellion)).toBe("graveyard");
  });
});

describe("Renegade Firebrand", () => {
  it("gets +1/+0 and first strike while you control a Chandra planeswalker", () => {
    const { game } = table();
    const brand = spawn(game, "Renegade Firebrand");
    expect(pt(game, brand)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, brand).has("first-strike")).toBe(false);
    spawn(game, "Chandra, Torch of Defiance");
    expect(pt(game, brand)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, brand).has("first-strike")).toBe(true);
  });
});
