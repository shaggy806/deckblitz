/**
 * "Power and toughness are each equal to the number of <kind> counters on
 * it" — a characteristic-defining ability (rule 604.3) over its own counters,
 * `setBasePtFromCount: { countOf: { countersOnThis } }`: 0/0 off the
 * battlefield, and the count read live as counters come and go. The record's
 * `static:cda-counters-on-self` needed no engine code.
 *
 * Tidewalker (time counters, one for each Island as it enters; vanishing
 * without a number), Rusting Golem (fading 5) and Mwonvuli Ooze (1 plus
 * twice its age counters, cumulative upkeep).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, counters, lands, nextTurn, pt, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const addCounters = (game: Game, id: ObjectId, counter: string, amount: number): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount }, [ref(id)]);
  settle(game);
};

describe("Tidewalker", () => {
  it("enters with a time counter for each Island, and is that big", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const walker = toHand(game, "Tidewalker");
    expect(pt(game, walker)).toEqual({ power: 0, toughness: 0 });
    cast(game, walker);
    expect(zone(game, walker)).toBe("battlefield");
    expect(counters(game, walker, "time")).toBe(3);
    expect(pt(game, walker)).toEqual({ power: 3, toughness: 3 });
  });

  it("shrinks as vanishing removes a counter each upkeep", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    const walker = toHand(game, "Tidewalker");
    cast(game, walker);
    expect(pt(game, walker)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, walker, "time")).toBe(1);
    expect(pt(game, walker)).toEqual({ power: 1, toughness: 1 });
    // The last counter off: a 0/0, put into the graveyard (704.5f).
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, walker)).toBe("graveyard");
  });

  it("with no Island it enters 0/0 and dies", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const walker = spawn(game, "Tidewalker");
    expect(counters(game, walker, "time")).toBe(0);
    expect(pt(game, walker)).toEqual({ power: 0, toughness: 0 });
    nextTurn(game);
    expect(zone(game, walker)).toBe("graveyard");
  });
});

describe("Rusting Golem", () => {
  it("enters with five fade counters and is a 5/5, then 4/4 after an upkeep", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const golem = toHand(game, "Rusting Golem");
    cast(game, golem);
    expect(counters(game, golem, "fade")).toBe(5);
    expect(pt(game, golem)).toEqual({ power: 5, toughness: 5 });
    nextTurn(game);
    nextTurn(game);
    expect(pt(game, golem)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Mwonvuli Ooze", () => {
  it("is 1 plus twice its age counters", () => {
    const { game } = table();
    const ooze = spawn(game, "Mwonvuli Ooze");
    expect(pt(game, ooze)).toEqual({ power: 1, toughness: 1 });
    addCounters(game, ooze, "age", 2);
    expect(pt(game, ooze)).toEqual({ power: 5, toughness: 5 });
  });
});
