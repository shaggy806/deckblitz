/**
 * "Until end of turn, if you would put one or more +1/+1 counters on a
 * creature you control, put that many plus one … instead" (Prairie Dog): a
 * `would-add-counter` replacement made by an ability (rule 614.1a), lasting
 * the turn (611.2c); each resolution adds one more (the ruling).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, counters, lands, nextTurn, ref, settle, spawn, table, toHand, toStep } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

function addCounters(game: Game, target: ObjectId, amount: number, player = A): void {
  game.debugApplyEffect(player, { kind: "add-counter", target: 0, counter: "+1/+1", amount }, [ref(target)]);
  settle(game);
}

describe("Prairie Dog", () => {
  it("adds one more +1/+1 counter per resolution, this turn, on creatures you control", () => {
    const { game } = table();
    const dog = spawn(game, "Prairie Dog");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 10);
    addCounters(game, bears, 1);
    expect(counters(game, bears, "+1/+1")).toBe(1);
    activate(game, dog, 0);
    addCounters(game, bears, 1);
    expect(counters(game, bears, "+1/+1")).toBe(3);
    // Not a creature an opponent controls.
    addCounters(game, theirs, 1);
    expect(counters(game, theirs, "+1/+1")).toBe(1);
    // A second resolution: that many plus two.
    activate(game, dog, 0);
    addCounters(game, bears, 1);
    expect(counters(game, bears, "+1/+1")).toBe(6);
    nextTurn(game);
    addCounters(game, bears, 1);
    expect(counters(game, bears, "+1/+1")).toBe(7);
  });

  it("counts only counters you put", () => {
    const { game } = table();
    const dog = spawn(game, "Prairie Dog");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 5);
    activate(game, dog, 0);
    addCounters(game, bears, 1, B);
    expect(counters(game, bears, "+1/+1")).toBe(1);
  });

  it("grows at your end step unless you cast a spell from your hand", () => {
    const { game } = table();
    const dog = spawn(game, "Prairie Dog");
    toStep(game, "end");
    settle(game);
    expect(counters(game, dog, "+1/+1")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Savannah Lions"));
    toStep(game, "end");
    settle(game);
    expect(counters(game, dog, "+1/+1")).toBe(1);
  });
});
