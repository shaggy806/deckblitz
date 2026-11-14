/**
 * A suspended card's own "whenever a time counter is removed from this card
 * while it's exiled": once per counter (`counters-removed`'s `perCounter`, rule
 * 603.2c), and "whenever **you** remove" only for its owner's removals
 * (`byYou`, read off the `time-counter-removed` event's `by`).
 *
 * Proving cards: Benalish Commander, Watcher of Hours, Dust of Moments.
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, nextTurn, pickModes, ref, settle, table, toHand, toLibrary, tokensNamed } from "./harness.js";

type G = ReturnType<typeof table>["game"];

const suspend = (game: G, name: string, cost: readonly [string, number], xValue?: number, player: PlayerId = A): ObjectId => {
  const card = toHand(game, name, player);
  lands(game, cost[0], cost[1], player);
  game.dispatch({ type: "suspend", player, card, ...(xValue === undefined ? {} : { xValue }) } as Action);
  settle(game);
  expect(game.state.objects[card].suspended).toBe(true);
  return card;
};
const time = (game: G, id: ObjectId): number => game.state.objects[id].counters.time ?? 0;
const surveils = (game: G, player: PlayerId = A): number =>
  game.eventsOfType("scried").filter((e) => e.mode === "surveil" && e.player === player).length;

describe("a time counter removed from a suspended card", () => {
  it("Benalish Commander: Dust of Moments' two make two Soldiers", () => {
    const { game, a } = table();
    const commander = suspend(game, "Benalish Commander", ["Plains", 7], 5);
    pickModes(a, 0);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Dust of Moments"), { modes: [0] });
    settle(game);
    expect(time(game, commander)).toBe(3);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
  });

  it("Watcher of Hours surveils at its owner's upkeep", () => {
    const { game, a } = table();
    const watcher = suspend(game, "Watcher of Hours", ["Island", 2]);
    expect(time(game, watcher)).toBe(6);
    toLibrary(game, "Forest");
    a.chooseScryFn = (_view, cards) => cards;
    nextTurn(game);
    nextTurn(game);
    expect(time(game, watcher)).toBe(5);
    expect(surveils(game)).toBe(1);
  });

  it("Watcher of Hours surveils once a counter its owner removes, and not for an opponent's", () => {
    const { game, a } = table();
    const watcher = suspend(game, "Watcher of Hours", ["Island", 2]);
    a.chooseScryFn = () => [];
    // Bob's removal: a counter off, no surveil.
    game.debugApplyEffect(B, { kind: "remove-counter", target: 0, counter: "time", amount: 1 }, [ref(watcher)]);
    settle(game);
    expect(time(game, watcher)).toBe(5);
    expect(surveils(game)).toBe(0);
    // Alice's Dust of Moments: two off, two surveils.
    pickModes(a, 0);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Dust of Moments"), { modes: [0] });
    settle(game);
    expect(time(game, watcher)).toBe(3);
    expect(surveils(game)).toBe(2);
  });
});
