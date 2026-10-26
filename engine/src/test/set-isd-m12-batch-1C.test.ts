/**
 * Innistrad and Magic 2012 (B191), group C. One test per card whose behaviour
 * is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
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
  lands,
  life,
  loyalty,
  nextTurn,
  pt,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Carnage Wurm (bloodthirst)", () => {
  it("enters with three counters only once an opponent was dealt damage this turn", () => {
    const { game } = table();
    const before = enter(game, "Carnage Wurm");
    expect(counters(game, before)).toBe(0);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(B)]);
    const after = enter(game, "Carnage Wurm");
    expect(counters(game, after)).toBe(3);
    expect(pt(game, after)).toEqual({ power: 9, toughness: 9 });
  });
});

describe("Furyborn Hellkite (bloodthirst)", () => {
  it("doesn't count damage dealt to you", () => {
    const { game } = table();
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)]);
    expect(counters(game, enter(game, "Furyborn Hellkite"))).toBe(0);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [ref(B)]);
    expect(counters(game, enter(game, "Furyborn Hellkite"))).toBe(6);
  });
});

describe("Scourge of Geier Reach", () => {
  it("gets +1/+1 for each creature opponents control", () => {
    const { game } = table();
    const scourge = spawn(game, "Scourge of Geier Reach");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, scourge)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Stitcher's Apprentice", () => {
  it("creates the 2/2 before the sacrifice, so the new token can be the one sacrificed", () => {
    const { game, a } = table();
    const apprentice = spawn(game, "Stitcher's Apprentice");
    lands(game, "Island", 2);
    let offered: readonly ObjectId[] = [];
    let offeredNames: readonly string[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      offeredNames = eligible.map((id) => game.state.objects[id].cardName);
      return eligible.filter((id) => game.state.objects[id].cardName === "Homunculus Token (2/2)").slice(0, 1);
    };
    activate(game, apprentice);
    expect(offered).toContain(apprentice);
    expect(offeredNames).toContain("Homunculus Token (2/2)");
    expect(tokensNamed(game, "Homunculus Token (2/2)")).toBe(0);
    expect(zone(game, apprentice)).toBe("battlefield");
  });
});

describe("Civilized Scholar // Homicidal Brute", () => {
  it("untaps and transforms on a creature discard, then turns back tapped at the end step if it didn't attack", () => {
    const { game, a } = table();
    const scholar = spawn(game, "Civilized Scholar");
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    activate(game, scholar);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, scholar)).toEqual({ power: 5, toughness: 1 });
    expect(game.state.objects[scholar].tapped).toBe(false);
    nextTurn(game);
    expect(pt(game, scholar)).toEqual({ power: 0, toughness: 1 });
    expect(game.state.objects[scholar].tapped).toBe(true);
  });

  it("stays the Scholar on a noncreature discard", () => {
    const { game, a } = table();
    const scholar = spawn(game, "Civilized Scholar");
    a.chooseDiscardsFn = (cards) => [cards[0].id];
    activate(game, scholar);
    expect(pt(game, scholar)).toEqual({ power: 0, toughness: 1 });
    expect(game.state.objects[scholar].tapped).toBe(true);
  });
});

describe("Woodland Sleuth", () => {
  it("returns the creature card from your graveyard when a creature died this turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(graveyard(game)).toContain(bears);
    enter(game, "Woodland Sleuth");
    expect(hand(game)).toContain(bears);
  });
});

describe("Circle of Flame", () => {
  it("deals 1 damage to each attacker without flying", () => {
    const { game, b } = table();
    spawn(game, "Circle of Flame");
    const elves = spawn(game, "Llanowar Elves", B);
    const crow = spawn(game, "Storm Crow", B);
    nextTurn(game);
    attack(game, b, [elves, crow], A);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, crow)).toBe("battlefield");
    expect(life(game, A)).toBe(19);
  });
});

describe("Chandra, the Firebrand", () => {
  it("−6 deals 6 damage to each of up to six targets", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, the Firebrand");
    const angel = spawn(game, "Serra Angel", B);
    loyalty(game, chandra, -6, { atLeast: 6, targets: [ref(B), ref(angel), null, null, null, null] });
    expect(life(game, B)).toBe(14);
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("Monomania", () => {
  it("leaves the target player only the card they chose", () => {
    const { game, b } = table();
    lands(game, "Swamp", 5);
    const keep = toHand(game, "Grizzly Bears", B);
    expect(hand(game, B).length).toBeGreaterThan(2);
    b.chooseDiscardsFn = (cards, count) =>
      cards
        .filter((c) => c.id !== keep)
        .slice(0, count)
        .map((c) => c.id);
    cast(game, toHand(game, "Monomania"), { targets: [ref(B)] });
    expect(hand(game, B)).toEqual([keep]);
  });
});

describe("Guardians' Pledge", () => {
  it("pumps only your white creatures", () => {
    const { game } = table();
    const lions = spawn(game, "Savannah Lions");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Savannah Lions", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Guardians' Pledge"));
    expect(pt(game, lions)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 1 });
  });
});
