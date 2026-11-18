/**
 * "You may sacrifice a creature. If you do, return that card to the
 * battlefield under its owner's control with three +1/+1 counters on it and
 * you become the monarch." (Heart-Shaped Herb): `each-player-may` hands the
 * creature sacrificed in answer to its `ifDid` as `{ paid: "sacrificed" }`,
 * found in the graveyard it was just put into (rule 400.7j), and
 * `put-onto-battlefield` returns it from there with `withCounters`. Need key
 * effect:return-sacrificed-card-with-counters.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, controller, counters, lands, life, pickModes, ref, settle, spawn, table, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/** Alice's Herb, with mana to activate it. */
function herb(game: Game): ObjectId {
  lands(game, "Wastes", 2);
  return spawn(game, "Heart-Shaped Herb");
}

describe("Heart-Shaped Herb", () => {
  it("returns the sacrificed creature with three +1/+1 counters, and you become the monarch", () => {
    const { game, a } = table();
    const source = herb(game);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    activate(game, source, 0);
    expect(zone(game, source)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(3);
    expect(controller(game, bears)).toBe(A);
    expect(game.state.monarch).toBe(A);
  });

  it("does nothing when you decline to sacrifice", () => {
    const { game, a } = table();
    const source = herb(game);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    activate(game, source, 0);
    expect(zone(game, source)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
    expect(game.state.monarch ?? null).toBe(null);
  });

  it("returns a creature you didn't own under its owner's control", () => {
    const { game, a } = table();
    const source = herb(game);
    const stolen = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(stolen)]);
    settle(game);
    expect(controller(game, stolen)).toBe(A);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [stolen];
    activate(game, source, 0);
    expect(zone(game, stolen)).toBe("battlefield");
    expect(controller(game, stolen)).toBe(B);
    expect(counters(game, stolen)).toBe(3);
    expect(game.state.monarch).toBe(A);
  });

  it("can't bring back a token (rule 111.8), but you still become the monarch", () => {
    const { game, a } = table();
    const source = herb(game);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 });
    settle(game);
    const token = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken);
    expect(token).toBeDefined();
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [token!];
    activate(game, source, 0);
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id]?.isToken)).toBe(false);
    expect(game.state.monarch).toBe(A);
  });

  it("prevents 1 of the damage a source an opponent controls would deal to you, not your own", () => {
    const { game } = table();
    spawn(game, "Heart-Shaped Herb");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)], { source: theirs });
    settle(game);
    expect(life(game, A)).toBe(18);
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0 }, [ref(A)], { source: mine });
    settle(game);
    expect(life(game, A)).toBe(15);
  });
});
