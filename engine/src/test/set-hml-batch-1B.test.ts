/**
 * Homelands (HML; B160), group B. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  named,
  nextTurn,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Koskun Falls", () => {
  it("is sacrificed at upkeep unless you tap an untapped creature", () => {
    const { game, a } = table();
    const falls = spawn(game, "Koskun Falls");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, falls)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    game.state.objects[bears].tapped = false;
    pickPermanents(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, falls)).toBe("graveyard");
  });
});

describe("Chain Stasis", () => {
  it("taps the creature, and its controller may pay {2}{U} to copy it at a new target", () => {
    const { game, a, b } = table();
    lands(game, "Island", 1);
    lands(game, "Island", 3, B);
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant");
    let asked = 0;
    a.chooseModesFn = () => (asked++ === 0 ? [0] : []);
    b.chooseModesFn = () => [0];
    pickTargets(b, mine);
    cast(game, toHand(game, "Chain Stasis"), { targets: [ref(theirs)] });
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(true);
  });
});

describe("Forget", () => {
  it("discards two and draws as many as were discarded", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Forget"), { targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(before);
    expect(graveyard(game, B)).toHaveLength(2);
  });
});

describe("Trade Caravan", () => {
  it("untaps a basic land only during an opponent's upkeep", () => {
    const { game } = table();
    const caravan = spawn(game, "Trade Caravan");
    const plains = spawn(game, "Plains", A, { tapped: true });
    toStep(game, "upkeep");
    settle(game);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, caravan, "currency")).toBe(2);
    expect(() => activate(game, caravan, 0, { targets: [ref(plains)] })).toThrow();
    game.state.objects[plains].tapped = true;
    game.advanceUntil((s) => s.turn.step === "upkeep" && activePlayerOf(s) === B && s.priority.holder === A);
    activate(game, caravan, 0, { targets: [ref(plains)] });
    expect(game.state.objects[plains].tapped).toBe(false);
    expect(counters(game, caravan, "currency")).toBe(0);
  });
});

describe("Irini Sengir", () => {
  it("makes a green enchantment spell cost {2} more", () => {
    const { game } = table();
    spawn(game, "Irini Sengir", B);
    lands(game, "Forest", 4);
    const roots = toHand(game, "Roots");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, roots, { targets: [ref(bears)] })).toThrow();
    lands(game, "Forest", 2);
    cast(game, roots, { targets: [ref(bears)] });
    expect(zone(game, roots)).toBe("battlefield");
  });
});

describe("Roots", () => {
  it("can't enchant a flier, and taps what it enchants", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const crow = spawn(game, "Storm Crow", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const roots = toHand(game, "Roots");
    expect(() => cast(game, roots, { targets: [ref(crow)] })).toThrow();
    cast(game, roots, { targets: [ref(bears)] });
    expect(game.state.objects[roots].attachedTo).toBe(bears);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Broken Visage", () => {
  it("destroys an attacker and gives you a Spirit its size until the end step", () => {
    const { game, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 5);
    const visage = toHand(game, "Broken Visage");
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    nextTurn(game);
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A);
    cast(game, visage, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    const [spirit] = named(game, "X/X Spirit Token (Black)", A);
    expect(spirit).toBeDefined();
    expect(pt(game, spirit)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    expect(named(game, "X/X Spirit Token (Black)")).toHaveLength(0);
  });
});

describe("An-Havva Constable", () => {
  it("has toughness 1 plus the green creatures on the battlefield", () => {
    const { game } = table();
    const constable = spawn(game, "An-Havva Constable");
    expect(pt(game, constable)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Storm Crow", B);
    expect(pt(game, constable)).toEqual({ power: 2, toughness: 3 });
  });
});
