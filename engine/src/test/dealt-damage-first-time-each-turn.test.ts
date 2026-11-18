/**
 * "Whenever Hercules is dealt damage for the first time each turn" — the
 * timing wrapper (`firstTimeEachTurn`) on a `dealt-damage` trigger, counted
 * in `Game.timingCount` by damage event: the journal's `damage` entries that
 * dealt this permanent damage this turn, in this stint, sources dealing
 * damage at once one event (rule 510.2 — their shared `seq`).
 */

import { describe, expect, it } from "vitest";

import { timingCountable } from "../trigger-events.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, counters, keywords, nextTurn, ref, settle, spawn, table } from "./harness.js";

const hit = (game: Game, source: ObjectId, target: ObjectId, amount: number): void => {
  game.debugApplyEffect(B, { kind: "damage", amount, target: 0 }, [ref(target)], { source });
  settle(game);
};

describe("dealt damage for the first time each turn — Hercules, Olympian Hero", () => {
  it("the first damage this turn: that many +1/+1 counters; later damage that turn, none", () => {
    const { game } = table();
    const hercules = spawn(game, "Hercules, Olympian Hero");
    const shock = spawn(game, "Grizzly Bears", B);
    hit(game, shock, hercules, 2);
    expect(counters(game, hercules)).toBe(2);
    hit(game, shock, hercules, 1);
    expect(counters(game, hercules)).toBe(2);
  });

  it("each turn has its own first time", () => {
    const { game } = table();
    const hercules = spawn(game, "Hercules, Olympian Hero");
    const source = spawn(game, "Grizzly Bears", B);
    hit(game, source, hercules, 1);
    expect(counters(game, hercules)).toBe(1);
    nextTurn(game);
    hit(game, source, hercules, 2);
    expect(counters(game, hercules)).toBe(3);
  });

  it("damage to another permanent first doesn't use up his first time", () => {
    const { game } = table();
    const hercules = spawn(game, "Hercules, Olympian Hero");
    const bears = spawn(game, "Grizzly Bears");
    const source = spawn(game, "Grizzly Bears", B);
    hit(game, source, bears, 1);
    hit(game, source, hercules, 2);
    expect(counters(game, hercules)).toBe(2);
  });

  it("blocked by two creatures: one damage event, all of it counted", () => {
    const { game, a, b } = table();
    const hercules = spawn(game, "Hercules, Olympian Hero");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: one, attacker: hercules },
      { blocker: two, attacker: hercules },
    ];
    attack(game, a, [hercules]);
    // Attacking: one counter and indestructible; then 4 from the two Bears at once.
    expect(keywords(game, hercules).has("indestructible")).toBe(true);
    expect(counters(game, hercules)).toBe(1 + 4);
    expect(game.state.objects[hercules].controller).toBe(A);
  });

  it("the wrapper counts `dealt-damage` unless it fires on an amount, excess, source or several permanents", () => {
    expect(timingCountable({ on: "dealt-damage", who: "self", firstTimeEachTurn: true })).toBe(true);
    expect(timingCountable({ on: "dealt-damage", who: "self", atLeast: 3, firstTimeEachTurn: true })).toBe(false);
    expect(timingCountable({ on: "dealt-damage", who: "you-control", batched: true, firstTimeEachTurn: true })).toBe(false);
  });
});
