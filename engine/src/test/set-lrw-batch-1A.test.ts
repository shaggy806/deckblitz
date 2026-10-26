/**
 * Lorwyn (LRW; B189), group A. One test per card whose behaviour is more
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
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Ashling the Pilgrim", () => {
  it("on the third resolution this turn removes its counters and deals that much to each creature and player", () => {
    const { game } = table();
    const ashling = spawn(game, "Ashling the Pilgrim");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 6);
    activate(game, ashling);
    activate(game, ashling);
    expect(counters(game, ashling)).toBe(2);
    expect(life(game, A)).toBe(20);
    activate(game, ashling);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ashling)).toBe("graveyard");
  });
});

describe("Deathrender", () => {
  it("puts a creature card from hand onto the battlefield when the equipped creature dies, and re-equips", () => {
    const { game, a } = table();
    const render = spawn(game, "Deathrender");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, render, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const inHand = toHand(game, "Llanowar Elves");
    pickFromZone(a, inHand);
    destroy(game, bears);
    const [elves] = named(game, "Llanowar Elves", A);
    expect(elves).toBeDefined();
    expect(pt(game, elves)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Treefolk Harbinger", () => {
  it("finds a Forest card and puts it on top", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Wastes");
    pickModes(a, 0);
    const seen = pickFromZone(a, forest);
    enter(game, "Treefolk Harbinger");
    expect(seen.offered).toContain(forest);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, forest)).toBe("hand");
  });
});

describe("Nath of the Gilt-Leaf", () => {
  it("may make an Elf Warrior whenever an opponent discards a card", () => {
    const { game, a } = table();
    spawn(game, "Nath of the Gilt-Leaf");
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 2 }, [ref(B)]);
    settle(game);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
  });
});

describe("Dread", () => {
  it("destroys a creature that deals damage to you, and shuffles itself back when it dies", () => {
    const { game, b } = table();
    const dread = spawn(game, "Dread");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    toStep(game, "postcombat-main", B);
    expect(life(game, A)).toBe(18);
    expect(zone(game, bears)).toBe("graveyard");
    destroy(game, dread);
    expect(zone(game, dread)).toBe("library");
  });
});

describe("Judge of Currents", () => {
  it("may gain 1 life when a Merfolk you control becomes tapped", () => {
    const { game, a } = table();
    const judge = spawn(game, "Judge of Currents");
    pickModes(a, 0);
    attack(game, a, [judge]);
    expect(life(game, A)).toBe(21);
  });
});

describe("Militia's Pride", () => {
  it("pays {W} for a tapped and attacking Kithkin Soldier when a nontoken creature attacks", () => {
    const { game, a } = table();
    spawn(game, "Militia's Pride");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Kithkin Soldier Token", A)).toBe(1);
    expect(life(game, B)).toBe(17);
  });
});

describe("Cloudgoat Ranger", () => {
  it("makes three Kithkin, and tapping them gives it +2/+0 and flying", () => {
    const { game } = table();
    const goat = enter(game, "Cloudgoat Ranger");
    expect(tokensNamed(game, "Kithkin Soldier Token", A)).toBe(3);
    activate(game, goat);
    expect(pt(game, goat)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, goat).has("flying")).toBe(true);
  });
});

describe("Peppersmoke", () => {
  it("draws a card only if you control a Faerie", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    const first = toHand(game, "Peppersmoke");
    const before = hand(game).length;
    cast(game, first, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    expect(hand(game).length).toBe(before - 1);
    spawn(game, "Faerie Harbinger");
    const second = toHand(game, "Peppersmoke");
    const mid = hand(game).length;
    cast(game, second, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(mid);
  });
});
