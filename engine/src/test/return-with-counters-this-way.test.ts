/**
 * "When Lagrella enters, exile any number of other target creatures
 * controlled by different players until Lagrella leaves the battlefield. When
 * an exiled card enters under your control this way, put two +1/+1 counters
 * on it." (Lagrella, the Magpie): the `delayed-trigger` `at: {
 * returnsUntilLeaves, underYourControl }` (`DelayedReturnWatch`), used up as
 * that stint of the permanent leaves and firing once (rule 603.7b) for the
 * cards coming back under its controller's control (610.3c). Need key
 * effect:return-with-counters-this-way.
 */

import { describe, expect, it } from "vitest";

import { A, B, C, controller, counters, destroy, enter, nextTurn, pickPermanents, pickTargets, ref, settle, spawn, table, zone } from "./harness.js";

describe("Lagrella, the Magpie", () => {
  it("exiles creatures of different players until it leaves; yours comes back with two +1/+1 counters", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    pickTargets(a, mine, theirs, null, null);
    const lagrella = enter(game, "Lagrella, the Magpie");
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    destroy(game, lagrella);
    settle(game);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(B);
    expect(counters(game, mine)).toBe(2);
    expect(counters(game, theirs)).toBe(0);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("puts nothing on a card that comes back under an opponent's control", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Hill Giant", B);
    pickTargets(a, theirs, null, null, null);
    const lagrella = enter(game, "Lagrella, the Magpie");
    destroy(game, lagrella);
    settle(game);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(counters(game, theirs)).toBe(0);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("returns your own card from an opponent's control to you, with the counters", () => {
    const { game, a } = table();
    const stolen = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(stolen)]);
    settle(game);
    expect(controller(game, stolen)).toBe(B);
    pickTargets(a, stolen, null, null, null);
    const lagrella = enter(game, "Lagrella, the Magpie");
    expect(zone(game, stolen)).toBe("exile");
    destroy(game, lagrella);
    settle(game);
    expect(controller(game, stolen)).toBe(A);
    expect(counters(game, stolen)).toBe(2);
  });

  it("triggers once when two of your cards come back at once (rule 603.7b): you choose which", () => {
    const { game, a } = table({ players: 3 });
    const mine = spawn(game, "Grizzly Bears");
    const stolen = spawn(game, "Hill Giant");
    game.debugApplyEffect(C, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(stolen)]);
    settle(game);
    pickTargets(a, mine, stolen, null, null);
    const lagrella = enter(game, "Lagrella, the Magpie");
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, stolen)).toBe("exile");
    const seen = pickPermanents(a, stolen);
    destroy(game, lagrella);
    settle(game);
    expect([...seen.offered].sort()).toEqual([mine, stolen].sort());
    expect(counters(game, stolen)).toBe(2);
    expect(counters(game, mine)).toBe(0);
  });

  it("still waits on a later turn, and a second stint of Lagrella is a new watch", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    pickTargets(a, mine, null, null, null);
    const lagrella = enter(game, "Lagrella, the Magpie");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.delayedTriggers).toHaveLength(1);
    destroy(game, lagrella);
    settle(game);
    expect(counters(game, mine)).toBe(2);
  });

  it("exiles nothing, and waits on nothing, once Lagrella has left before its ability resolves", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    pickTargets(a, mine, null, null, null);
    const lagrella = enter(game, "Lagrella, the Magpie", A, { settle: false });
    destroy(game, lagrella);
    settle(game);
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.delayedTriggers).toHaveLength(0);
  });
});
