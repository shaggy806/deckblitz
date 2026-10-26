/**
 * Portal Three Kingdoms and Urza's Destiny (PTK, UDS; B208), group A. One
 * test per card whose behaviour is more than a stat line, on the clause most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  destroy,
  enter,
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
  zone,
} from "./harness.js";

describe("Stone Catapult", () => {
  it("destroys a tapped nonblack creature, never a black or untapped one", () => {
    const { game } = table();
    const catapult = spawn(game, "Stone Catapult");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untapped = spawn(game, "Hill Giant", B);
    const black = spawn(game, "Cunning Advisor", B, { tapped: true });
    expect(() => activate(game, catapult, 0, { targets: [ref(black)] })).toThrow();
    expect(() => activate(game, catapult, 0, { targets: [ref(untapped)] })).toThrow();
    activate(game, catapult, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Trip Wire", () => {
  it("can target only a creature with horsemanship", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const cavalry = spawn(game, "Wu Elite Cavalry", B);
    const card = toHand(game, "Trip Wire");
    expect(() => cast(game, card, { targets: [ref(bears)] })).toThrow();
    cast(game, card, { targets: [ref(cavalry)] });
    expect(zone(game, cavalry)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Compost", () => {
  it("offers a draw when a black card reaches an opponent's graveyard, not a nonblack one or its controller's", () => {
    const { game, a } = table();
    spawn(game, "Compost");
    pickModes(a, 0);
    const before = hand(game).length;
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(hand(game).length).toBe(before);
    destroy(game, spawn(game, "Cunning Advisor", A));
    expect(hand(game).length).toBe(before);
    destroy(game, spawn(game, "Cunning Advisor", B));
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Donate", () => {
  it("gives a permanent you control to the target player", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Donate"), { targets: [ref(B), ref(bears)] });
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Private Research", () => {
  it("draws a card per page counter as the Aura last was when the creature dies", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    const aura = toHand(game, "Private Research");
    cast(game, aura, { targets: [ref(bears)] });
    expect(game.state.objects[aura].attachedTo).toBe(bears);
    game.state.objects[aura].counters.page = 2;
    const before = hand(game).length;
    destroy(game, bears);
    expect(zone(game, aura)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Iridescent Drake", () => {
  it("puts an Aura from any graveyard onto the battlefield under your control, on the Drake", () => {
    const { game, a } = table();
    const aura = toGraveyard(game, "Holy Strength", B);
    pickTargets(a, aura);
    const drake = enter(game, "Iridescent Drake");
    expect(zone(game, aura)).toBe("battlefield");
    expect(controller(game, aura)).toBe(A);
    expect(game.state.objects[aura].attachedTo).toBe(drake);
    expect(pt(game, drake)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Meng Huo, Barbarian King", () => {
  it("pumps other green creatures you control only", () => {
    const { game } = table();
    const meng = spawn(game, "Meng Huo, Barbarian King");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, meng)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Zhuge Jin, Wu Strategist", () => {
  it("makes a creature unblockable this turn", () => {
    const { game } = table();
    const zhuge = spawn(game, "Zhuge Jin, Wu Strategist");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, zhuge, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });
});

describe("Cunning Advisor", () => {
  it("makes the target opponent discard a card", () => {
    const { game } = table();
    const advisor = spawn(game, "Cunning Advisor");
    const before = hand(game, B).length;
    activate(game, advisor, 0, { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 1);
  });
});
