/**
 * Time counters (Doctor Who): time travel (rule 701.56a), vanishing (rule
 * 702.63) and cards that gain suspend (rule 702.62b).
 *
 * Time travel: for each permanent you control with a time counter on it and
 * each suspended card you own with one, put a time counter on it, remove
 * one, or neither — all at once (the rulings). A suspended card's last
 * counter coming off, by any means, lets its owner cast it (702.62a, the
 * rulings: "it doesn't matter why the last time counter was removed").
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, counters, enter, hand, lands, life, quiet, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

/** Suspend Rift Bolt (suspend 1 — {R}) from alice's hand. */
function suspendRiftBolt(game: Game): ObjectId {
  spawn(game, "Mountain");
  const bolt = toHand(game, "Rift Bolt");
  game.dispatch({ type: "suspend", player: A, card: bolt });
  game.advanceUntil(quiet);
  return bolt;
}

describe("vanishing (rule 702.63)", () => {
  it("Four Knocks enters with four time counters, loses one each upkeep, and is sacrificed as the last comes off", () => {
    const { game } = table();
    const knocks = enter(game, "Four Knocks");
    expect(counters(game, knocks, "time")).toBe(4);
    for (const left of [3, 2, 1]) {
      toStep(game, "upkeep");
      settle(game);
      expect(counters(game, knocks, "time")).toBe(left);
      expect(zone(game, knocks)).toBe("battlefield");
    }
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, knocks)).toBe("graveyard");
  });

  it("only its controller's upkeep removes one", () => {
    const { game } = table();
    const knocks = enter(game, "Four Knocks");
    toStep(game, "upkeep", B);
    settle(game);
    expect(counters(game, knocks, "time")).toBe(4);
  });
});

describe("time travel (rule 701.56a)", () => {
  it("offers each of your permanents with a time counter and your suspended cards — not an opponent's", () => {
    const { game, a } = table();
    const knocks = enter(game, "Four Knocks");
    const theirs = enter(game, "Four Knocks", B);
    const bolt = suspendRiftBolt(game);
    let offered: readonly ObjectId[] = [];
    a.chooseTimeTravelFn = (_view, eligible) => {
      offered = eligible;
      return { add: [knocks], remove: [] };
    };
    lands(game, "Island", 2);
    cast(game, toHand(game, "Wibbly-wobbly, Timey-wimey"));
    expect([...offered].sort()).toEqual([knocks, bolt].sort());
    expect(counters(game, knocks, "time")).toBe(5);
    expect(counters(game, theirs, "time")).toBe(4);
    expect(counters(game, bolt, "time")).toBe(1);
  });

  it("removing a vanishing permanent's last time counter sacrifices it", () => {
    const { game, a } = table();
    const knocks = enter(game, "Four Knocks");
    game.state.objects[knocks].counters.time = 1;
    a.chooseTimeTravelFn = () => ({ add: [], remove: [knocks] });
    lands(game, "Island", 2);
    cast(game, toHand(game, "Wibbly-wobbly, Timey-wimey"));
    expect(zone(game, knocks)).toBe("graveyard");
  });

  it("removing a suspended card's last time counter lets its owner cast it free — after the spell finishes resolving", () => {
    const { game, a } = table();
    const bolt = suspendRiftBolt(game);
    a.chooseTimeTravelFn = () => ({ add: [], remove: [bolt] });
    let handWhenOffered = -1;
    a.chooseCastNowFn = (_v, offer) => {
      handWhenOffered = hand(game).length;
      return offer.casts.length === 0
        ? null
        : { type: "cast-spell", player: A, card: offer.cards[0], targets: [{ kind: "player", player: B }], via: "effect", free: true };
    };
    lands(game, "Island", 2);
    const before = hand(game).length;
    const lifeBefore = life(game, B);
    cast(game, toHand(game, "Wibbly-wobbly, Timey-wimey"));
    // Its draw came before the offer (Wibbly-wobbly itself was put into the
    // hand after `before` was read, and left it as it was cast).
    expect(handWhenOffered).toBe(before + 1);
    expect(life(game, B)).toBe(lifeBefore - 3);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("declining that cast leaves the card exiled and no longer suspended (rule 702.62a)", () => {
    const { game, a } = table();
    const bolt = suspendRiftBolt(game);
    a.chooseTimeTravelFn = () => ({ add: [], remove: [bolt] });
    lands(game, "Island", 2);
    cast(game, toHand(game, "Wibbly-wobbly, Timey-wimey"));
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.objects[bolt].suspended).toBe(false);
  });

  it("with nothing eligible it asks nothing, and the rest of the spell still happens", () => {
    const { game, a } = table();
    let asked = false;
    a.chooseTimeTravelFn = () => {
      asked = true;
      return { add: [], remove: [] };
    };
    lands(game, "Island", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Wibbly-wobbly, Timey-wimey"));
    expect(asked).toBe(false);
    expect(hand(game).length).toBe(before + 1);
  });

  it("refuses an object in both lists, or one that isn't eligible", () => {
    const { game, a } = table();
    const knocks = enter(game, "Four Knocks");
    const theirs = enter(game, "Four Knocks", B);
    a.chooseTimeTravelFn = () => ({ add: [knocks], remove: [knocks] });
    lands(game, "Island", 2);
    expect(() => cast(game, toHand(game, "Wibbly-wobbly, Timey-wimey"))).toThrow(/twice/);
    expect(game.canDispatch({ type: "time-travel", player: A, add: [theirs], remove: [] })).toMatch(/no time counter/);
  });

  it("Rotating Fireplace enters tapped with a time counter, taps for {C} per time counter, and time travels", () => {
    const { game, a } = table();
    const fireplace = enter(game, "Rotating Fireplace");
    expect(game.state.objects[fireplace].tapped).toBe(true);
    expect(counters(game, fireplace, "time")).toBe(1);
    game.state.objects[fireplace].tapped = false;
    a.chooseTimeTravelFn = (_v, eligible) => ({ add: [...eligible], remove: [] });
    lands(game, "Wastes", 4);
    activate(game, fireplace, 1);
    expect(counters(game, fireplace, "time")).toBe(2);
    game.state.objects[fireplace].tapped = false;
    activate(game, fireplace, 0, { settle: false });
    expect(game.state.players[A].manaPool.length).toBe(2);
  });

  it("Time Beetle time travels when it deals combat damage to a player", () => {
    const { game, a } = table();
    const knocks = enter(game, "Four Knocks");
    const beetle = spawn(game, "Time Beetle");
    a.chooseTimeTravelFn = () => ({ add: [knocks], remove: [] });
    a.declareAttackersFn = () => [{ attacker: beetle, defender: B }];
    toStep(game, "postcombat-main");
    settle(game);
    expect(counters(game, knocks, "time")).toBe(5);
  });
});
