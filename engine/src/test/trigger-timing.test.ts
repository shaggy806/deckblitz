/**
 * The timing wrapper every trigger takes (`TriggerTiming`: "for the first time
 * each turn", "your second … each turn" — theme 2's design note in
 * docs/plans/need-key-themes.md) is answered from the journal for the kinds
 * `timingCountable` lists. A trigger the wrapper can't count for never fires
 * with it, so no pool card may spell one: this walks every definition, its
 * granted and delayed triggers included.
 */

import { describe, expect, it } from "vitest";
import type { TriggerSpec } from "../abilities.js";
import { POOL_CARDS, TOKEN_CARDS } from "../cards/generated.js";
import { abilityCountThisTurn, appendJournal, modesDoneThisTurn } from "../journal.js";
import { timingCountable } from "../trigger-events.js";
import { A, nextTurn, table } from "./harness.js";

/** Every trigger spec anywhere in `value`: an object with an `on` string and
 * a timing field. */
function timedTriggers(value: unknown, out: TriggerSpec[] = []): TriggerSpec[] {
  if (value === null || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const item of value) timedTriggers(item, out);
    return out;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.on === "string" && (record.firstTimeEachTurn !== undefined || record.nthEachTurn !== undefined)) {
    out.push(record as unknown as TriggerSpec);
  }
  for (const item of Object.values(record)) timedTriggers(item, out);
  return out;
}

describe("the timing wrapper", () => {
  it("is spelled only on triggers it can count for", () => {
    const bad: string[] = [];
    let timed = 0;
    for (const def of [...POOL_CARDS, ...TOKEN_CARDS]) {
      for (const spec of timedTriggers(def)) {
        timed += 1;
        if (!timingCountable(spec)) bad.push(`${def.name}: ${JSON.stringify(spec)}`);
      }
    }
    expect(bad).toEqual([]);
    // The walk finds them: draws' second card, cast triggers' first spell,
    // valiant, and the rest (about 190 at B278).
    expect(timed).toBeGreaterThan(150);
  });

  it("refuses a kind it can't count for", () => {
    expect(timingCountable({ on: "blocks", who: "self", firstTimeEachTurn: true } as TriggerSpec)).toBe(false);
    expect(timingCountable({ on: "counters-put", who: "self", batched: true, firstTimeEachTurn: true } as TriggerSpec)).toBe(false);
    expect(timingCountable({ on: "counters-put", who: "self", firstTimeEachTurn: true } as TriggerSpec)).toBe(true);
  });
});

describe("the journal's ability index (the usage limits' count)", () => {
  it("counts what's appended since it last read, and starts again for a new turn or a replaced array", () => {
    const { game } = table();
    const state = game.state;
    const key = "test-key";
    expect(abilityCountThisTurn(state, "activated", key)).toBe(0);
    appendJournal(state, { kind: "activated", player: A, ability: key });
    expect(abilityCountThisTurn(state, "activated", key)).toBe(1);
    appendJournal(state, { kind: "activated", player: A, ability: key });
    appendJournal(state, { kind: "triggered", player: A, ability: key });
    expect(abilityCountThisTurn(state, "activated", key)).toBe(2);
    expect(abilityCountThisTurn(state, "triggered", key)).toBe(1);
    appendJournal(state, { kind: "did", player: A, ability: key, mode: 2 });
    appendJournal(state, { kind: "did", player: A, ability: key, mode: 0 });
    expect(modesDoneThisTurn(state, key)).toEqual([2, 0]);
    // A clone's array is another array: read afresh, the same answer.
    const copy = structuredClone(state);
    expect(abilityCountThisTurn(copy, "activated", key)).toBe(2);
    // A pruned (replaced) array.
    const journal = state.journal!;
    journal.entries = journal.entries.filter((e) => e.kind !== "activated");
    expect(abilityCountThisTurn(state, "activated", key)).toBe(0);
    expect(abilityCountThisTurn(state, "triggered", key)).toBe(1);
    // The next turn: none of this turn's.
    nextTurn(game);
    expect(abilityCountThisTurn(game.state, "triggered", key)).toBe(0);
  });
});
