/**
 * Who crewed what (rules 702.122b-d): each creature tapped for a Vehicle's
 * crew cost "crews" it and remembers it for the turn
 * (`GameObject.crewedThisTurn`), read by `CardFilter.crewedSource` ("a
 * creature that crewed it this turn") and `crewedBySource` ("a Vehicle
 * crewed by ~ this turn"); the `crews-or-saddles` trigger ("whenever this
 * creature crews a Vehicle / saddles a Mount", its trigger object the
 * Vehicle or Mount); and the `cant-crew` restriction ("can't crew
 * Vehicles"). Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action, TapCostOffer } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

/** The tap-cost offer for `source`'s ability `index` (crew or saddle). */
function tapOffer(game: Game, source: ObjectId, index = 0): TapCostOffer {
  const offer = game
    .legalActions(A)
    .find((o) => o.kind === "activate-ability" && o.source === source && o.abilityIndex === index);
  if (offer === undefined || offer.kind !== "activate-ability" || offer.tapCost === undefined) {
    throw new Error("no tap-cost offer");
  }
  return offer.tapCost;
}

/** Activate `source`'s crew (or saddle) ability tapping `tap`, then settle. */
function crewWith(game: Game, source: ObjectId, tap: readonly ObjectId[], index = 0): void {
  const action: Action = { type: "activate-ability", player: A, source, abilityIndex: index, targets: [], tap };
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
}

describe("crews-or-saddles triggers", () => {
  it("Speedway Fanatic: the Vehicle it crews gains haste — and a Vehicle crewed by another creature doesn't", () => {
    const { game } = table();
    const fanatic = spawn(game, "Speedway Fanatic");
    const bears = spawn(game, "Grizzly Bears");
    const copter = spawn(game, "Smuggler's Copter", A, { sick: true });
    const other = spawn(game, "Smuggler's Copter", A, { sick: true });
    crewWith(game, copter, [fanatic]);
    expect(keywords(game, copter).has("haste")).toBe(true);
    crewWith(game, other, [bears]);
    expect(keywords(game, other).has("haste")).toBe(false);
  });

  it("Veteran Motorist: the Vehicle it crews gets +1/+1 until end of turn", () => {
    const { game } = table();
    const motorist = spawn(game, "Veteran Motorist");
    const copter = spawn(game, "Smuggler's Copter");
    crewWith(game, copter, [motorist]);
    expect(pt(game, copter)).toEqual({ power: 4, toughness: 4 });
    toStep(game, "upkeep", B);
    expect(pt(game, copter)).toEqual({ power: 3, toughness: 3 });
  });

  it("Reckless Velocitaur: in your main phase, the Vehicle it crews and the Mount it saddles get +2/+0 and trample", () => {
    const { game } = table();
    const taur = spawn(game, "Reckless Velocitaur");
    const copter = spawn(game, "Smuggler's Copter");
    crewWith(game, copter, [taur]);
    expect(pt(game, copter)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, copter).has("trample")).toBe(true);
    // A Mount saddled the next turn, in the main phase too.
    toStep(game, "precombat-main", A);
    const jaguar = spawn(game, "Alacrian Jaguar");
    crewWith(game, jaguar, [taur]);
    expect(keywords(game, jaguar).has("trample")).toBe(true);
  });

  it("Reckless Velocitaur: crewing outside your main phase does nothing", () => {
    const { game } = table({ step: "begin-combat" });
    const taur = spawn(game, "Reckless Velocitaur");
    const copter = spawn(game, "Smuggler's Copter");
    crewWith(game, copter, [taur]);
    expect(pt(game, copter)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, copter).has("trample")).toBe(false);
  });
});

describe("a creature that crewed it this turn", () => {
  it("Subterranean Schooner: only a creature that crewed it is a target, and it explores", () => {
    const { game, a } = table();
    const schooner = spawn(game, "Subterranean Schooner");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const giant = spawn(game, "Hill Giant");
    crewWith(game, schooner, [bears, elves]);
    expect(game.state.objects[bears].crewedThisTurn).toEqual([
      { vehicle: schooner, stint: game.state.objects[schooner].zoneChangeCount ?? 0 },
    ]);
    const seen = watchTargets(a, () => [bears]);
    const before = hand(game).length;
    attack(game, a, [schooner]);
    expect([...seen.offered[0]].sort()).toEqual([bears, elves].sort());
    expect(seen.offered[0]).not.toContain(giant);
    // The top card is a Wastes, a land: it goes to the hand.
    expect(hand(game).length).toBe(before + 1);
    // Until the turn ends.
    toStep(game, "upkeep", B);
    expect(game.state.objects[bears].crewedThisTurn).toBeUndefined();
  });

  it("Getaway Car: returns a creature that crewed it as it attacks", () => {
    const { game, a } = table();
    const car = spawn(game, "Getaway Car");
    const bears = spawn(game, "Grizzly Bears");
    crewWith(game, car, [bears]);
    watchTargets(a, (offered) => [offered[0][0] ?? null]);
    attack(game, a, [car]);
    expect(zone(game, bears)).toBe("hand");
    expect(life(game, B)).toBe(16);
  });

  it("isn't a creature that crewed another Vehicle, or saddled one", () => {
    const { game, a } = table();
    const car = spawn(game, "Getaway Car");
    const copter = spawn(game, "Smuggler's Copter");
    const jaguar = spawn(game, "Alacrian Jaguar");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    crewWith(game, copter, [bears]);
    crewWith(game, jaguar, [giant]);
    const gnat = spawn(game, "Grizzly Bears");
    crewWith(game, car, [gnat]);
    const seen = watchTargets(a, () => [null]);
    attack(game, a, [car]);
    expect(seen.offered[0]).toEqual([gnat]);
  });

  it("Balthier and Fran: a Vehicle it crewed attacking in the first combat may buy another combat", () => {
    const { game, a } = table();
    const balthier = spawn(game, "Balthier and Fran");
    const copter = spawn(game, "Smuggler's Copter");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    crewWith(game, copter, [balthier]);
    pickModes(a, 0);
    attack(game, a, [copter]);
    // 3/3 +1/+1, vigilance: it attacks in both combats, and the second
    // combat's trigger doesn't offer a third.
    expect(life(game, B)).toBe(12);
  });

  it("Balthier and Fran: a Vehicle crewed by another creature buys nothing", () => {
    const { game, a } = table();
    spawn(game, "Balthier and Fran");
    const bears = spawn(game, "Grizzly Bears");
    const copter = spawn(game, "Smuggler's Copter");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    crewWith(game, copter, [bears]);
    pickModes(a, 0);
    attack(game, a, [copter]);
    expect(life(game, B)).toBe(16);
  });
});

describe("can't crew Vehicles", () => {
  it("Revoke Privileges: the enchanted creature can't be tapped to crew, but can still saddle", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const copter = spawn(game, "Smuggler's Copter");
    const jaguar = spawn(game, "Alacrian Jaguar");
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Revoke Privileges"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(tapOffer(game, copter).choices).not.toContain(giant);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: copter, abilityIndex: 0, targets: [], tap: [giant] })).not.toBeNull();
    expect(tapOffer(game, jaguar).choices).toContain(giant);
  });
});
