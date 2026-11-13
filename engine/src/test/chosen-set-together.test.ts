/**
 * An untargeted chosen set acted on together (`choose-permanents`'
 * `thenTogether`): `then` happens once over every permanent chosen — none
 * chosen included — and the set is what the resolution "chose this way"
 * (`thisWay: "chosen"`) for later steps to read. Nahiri's Resolve flickers the
 * set with one delayed return, Fortune, Loyal Steed flickers itself with up to
 * one of them, and Spry and Mighty pumps the chosen two by an X read once.
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
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
  pickPermanents,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Nahiri's Resolve: exile any number at your end step, return them at your next upkeep", () => {
  it("the chosen ones leave together and come back together at your next upkeep, not before", () => {
    const { game, a } = table();
    spawn(game, "Nahiri's Resolve");
    const bears = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring");
    const kept = spawn(game, "Hill Giant");
    const seen = pickPermanents(a, bears, ring);
    toStep(game, "end");
    settle(game);
    expect(seen.offered).toEqual(expect.arrayContaining([bears, ring, kept]));
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, kept)).toBe("battlefield");
    // Bob's turn passes with them still in exile.
    toStep(game, "upkeep", B);
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("choosing none exiles nothing", () => {
    const { game, a } = table();
    spawn(game, "Nahiri's Resolve");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("its creatures get +1/+0 and haste", () => {
    const { game } = table();
    spawn(game, "Nahiri's Resolve");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

/** Whether it has changed zones since `spawn` put it onto the battlefield. */
const moved = (game: Game, id: ObjectId): boolean => (game.state.objects[id].zoneChangeCount ?? 0) > 1;

/** Saddle `mount` (its ability `index`) tapping `tap`, then settle. */
function saddleWith(game: Game, mount: ObjectId, tap: readonly ObjectId[], index = 0): void {
  const action: Action = { type: "activate-ability", player: A, source: mount, abilityIndex: index, targets: [], tap };
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
}

describe("Fortune, Loyal Steed: at end of combat, exile it and up to one creature that saddled it, then return them", () => {
  it("it and the chosen creature come back as new objects, untapped", () => {
    const { game, a } = table();
    const fortune = spawn(game, "Fortune, Loyal Steed");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    saddleWith(game, fortune, [bears]);
    const seen = pickPermanents(a, bears);
    attack(game, a, [fortune]);
    // Only a creature that saddled it is offered.
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, fortune)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(game.state.objects[fortune].tapped).toBe(false);
    expect(game.state.objects[fortune].saddled).not.toBe(true);
    expect(zone(game, other)).toBe("battlefield");
    // Both left and came back: new objects (rule 400.7).
    expect(moved(game, fortune)).toBe(true);
    expect(moved(game, bears)).toBe(true);
    expect(moved(game, other)).toBe(false);
  });

  it("choosing none, Fortune alone is flickered", () => {
    const { game, a } = table();
    const fortune = spawn(game, "Fortune, Loyal Steed");
    const bears = spawn(game, "Grizzly Bears");
    saddleWith(game, fortune, [bears]);
    pickPermanents(a);
    attack(game, a, [fortune]);
    expect(moved(game, fortune)).toBe(true);
    expect(moved(game, bears)).toBe(false);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("attacking unsaddled, nothing happens", () => {
    const { game, a } = table();
    const fortune = spawn(game, "Fortune, Loyal Steed");
    attack(game, a, [fortune]);
    expect(moved(game, fortune)).toBe(false);
  });
});

describe("Spry and Mighty: the chosen two get +X/+X and trample, and you draw X", () => {
  it("X is the difference between their powers, read once", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const left = spawn(game, "Llanowar Elves");
    const seen = pickPermanents(a, giant, bears);
    const before = hand(game).length;
    cast(game, toHand(game, "Spry and Mighty"));
    expect(seen.offered).toEqual(expect.arrayContaining([giant, bears, left]));
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, giant).has("trample")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, left).has("trample")).toBe(false);
    expect(pt(game, left)).toEqual({ power: 1, toughness: 1 });
    expect(hand(game).length).toBe(before + 1);
  });

  it("with only one creature, it does nothing", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Spry and Mighty"));
    expect(keywords(game, bears).has("trample")).toBe(false);
    expect(hand(game).length).toBe(before);
  });
});
