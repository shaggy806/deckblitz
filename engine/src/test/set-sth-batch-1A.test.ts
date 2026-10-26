/**
 * Stronghold, group A: Ruination, Shifting Wall, Mortuary, Smite, Verdant Touch, Mogg Bombers,
 * and Stronghold Taskmaster.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  enter,
  hand,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Ruination", () => {
  it("destroys every nonbasic land and no basic one", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const tower = spawn(game, "Command Tower");
    const theirs = spawn(game, "Command Tower", B);
    const forest = spawn(game, "Forest", B);
    cast(game, toHand(game, "Ruination"));
    expect(zone(game, tower)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
  });
});

describe("Shifting Wall", () => {
  it("enters with X +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const wall = toHand(game, "Shifting Wall");
    cast(game, wall, { x: 3 });
    expect(zone(game, wall)).toBe("battlefield");
    expect(counters(game, wall)).toBe(3);
    expect(pt(game, wall)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Mortuary", () => {
  it("puts a creature card you own that dies on top of your library, and not an opponent's", () => {
    const { game } = table();
    spawn(game, "Mortuary");
    const marker = toLibrary(game, "Grizzly Bears");
    const library = (): readonly string[] => game.state.zones.perPlayer[A].library;
    const top = library().indexOf(marker) === 0 ? "first" : "last";
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("library");
    const lib = library();
    expect(top === "first" ? lib[0] : lib[lib.length - 1]).toBe(bears);
    destroy(game, theirs, A);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Smite", () => {
  it("destroys a blocked attacker; an unblocked one isn't a legal target, nor anything before blocks", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 1);
    const smite = toHand(game, "Smite");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves", B);
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: smite, targets: [ref(giant)] }),
    ).not.toBeNull();
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: B },
    ];
    b.declareBlockersFn = () => [{ blocker: elves, attacker: giant }];
    toStep(game, "declare-blockers");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: smite, targets: [ref(bears)] }),
    ).not.toBeNull();
    cast(game, smite, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Verdant Touch", () => {
  it("with buyback, a land becomes a 2/2 creature land for good and the card returns to hand", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const target = spawn(game, "Forest", B);
    const touch = toHand(game, "Verdant Touch");
    cast(game, touch, { targets: [ref(target)], kicked: true });
    expect(types(game, target)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, target)).toEqual({ power: 2, toughness: 2 });
    expect(hand(game)).toContain(touch);
    toStep(game, "precombat-main", B);
    expect(pt(game, target)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Mogg Bombers", () => {
  it("another creature entering sacrifices it and deals 3 to the target player", () => {
    const { game, a } = table();
    const bombers = spawn(game, "Mogg Bombers");
    pickTargets(a, B);
    enter(game, "Grizzly Bears", B);
    expect(zone(game, bombers)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("deals the damage even when it's gone before the trigger resolves", () => {
    const { game, a } = table();
    const bombers = spawn(game, "Mogg Bombers");
    pickTargets(a, B);
    enter(game, "Grizzly Bears", B, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bombers)]);
    expect(zone(game, bombers)).toBe("graveyard");
    settle(game);
    expect(life(game, B)).toBe(17);
  });
});

describe("Stronghold Taskmaster", () => {
  it("other black creatures get -1/-1, on both sides; others and itself don't", () => {
    const { game } = table();
    const master = spawn(game, "Stronghold Taskmaster");
    const mine = spawn(game, "Walking Corpse");
    const theirs = spawn(game, "Walking Corpse", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(pt(game, master)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, mine)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});
