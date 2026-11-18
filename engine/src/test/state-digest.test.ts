import { describe, expect, it } from "vitest";

import { isSettled } from "../auto-settle.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import { stateDigest } from "../state-digest.js";
import { stateFromJson, stateToJson } from "../state-wire.js";

const ALICE = asPlayerId("alice");
const BOB = asPlayerId("bob");

/** Any plain value as a state, for the digest's own rules. */
const of = (value: Record<string, unknown>): string =>
  stateDigest({ eventLog: [], ...value } as unknown as GameState, { events: true });

describe("stateDigest", () => {
  it("is 16 hex characters, the same for the same content", () => {
    const digest = of({ a: 1, b: ["x", { c: true }] });
    expect(digest).toMatch(/^[0-9a-f]{16}$/);
    expect(of({ a: 1, b: ["x", { c: true }] })).toBe(digest);
  });

  it("doesn't care what order an object's keys are in, or about an undefined property", () => {
    const digest = of({ a: 1, b: { x: 1, y: 2 }, c: "z" });
    expect(of({ c: "z", b: { y: 2, x: 1 }, a: 1 })).toBe(digest);
    expect(of({ a: 1, b: { x: 1, y: 2, gone: undefined }, c: "z", also: undefined })).toBe(digest);
  });

  it("tells a blank array slot from a null, and from no slot", () => {
    const blank = of({ targets: [{ id: "obj-1" }, undefined] });
    expect(of({ targets: [{ id: "obj-1" }, null] })).not.toBe(blank);
    expect(of({ targets: [{ id: "obj-1" }] })).not.toBe(blank);
  });

  it("tells apart values that read alike", () => {
    const all = [
      of({ v: 1 }),
      of({ v: "1" }),
      of({ v: true }),
      of({ v: null }),
      of({ v: [1] }),
      of({ v: { 1: 1 } }),
      of({ v: ["ab", "c"] }),
      of({ v: ["a", "bc"] }),
      of({ v: ["abc"] }),
      of({ v: [[1], 2] }),
      of({ v: [1, [2]] }),
      of({ v: { a: { b: 1 } } }),
      of({ v: { a: {}, b: 1 } }),
      of({ v: 0.1 + 0.2 }),
      of({ v: 0.3 }),
      of({ va: 1 }),
    ];
    expect(new Set(all).size).toBe(all.length);
  });

  it("counts the event log by its length unless asked for every event", () => {
    const base = { turn: 3 };
    const one = { ...base, eventLog: [{ type: "a", seq: 1 }] } as unknown as GameState;
    const other = { ...base, eventLog: [{ type: "b", seq: 1 }] } as unknown as GameState;
    const longer = { ...base, eventLog: [{ type: "a", seq: 1 }, { type: "c", seq: 2 }] } as unknown as GameState;
    expect(stateDigest(one)).toBe(stateDigest(other));
    expect(stateDigest(one)).not.toBe(stateDigest(longer));
    expect(stateDigest(one, { events: true })).not.toBe(stateDigest(other, { events: true }));
  });

  it("is the same for a game and for a copy restored from its sent state, and moves when the game does", () => {
    const decks = [ALICE, BOB].map((player) => ({ player, cards: Array(40).fill("Forest") as string[] }));
    const game = Game.create({ seed: 7, decks });
    // As a room plays it: on to the next decision, then the pass.
    const pass = (g: Game, times: number): void => {
      for (let i = 0; i < times; i += 1) {
        g.advanceUntil(isSettled);
        const holder = g.state.priority.holder;
        if (g.state.result.over || holder === null) throw new Error("nobody to pass");
        g.dispatch({ type: "pass-priority", player: holder });
      }
      g.advanceUntil(isSettled);
    };
    pass(game, 9);
    const copy = Game.fromSnapshot(stateFromJson(stateToJson(game.snapshot())));
    for (const events of [false, true]) {
      expect(stateDigest(copy.state, { events })).toBe(stateDigest(game.state, { events }));
    }
    const before = stateDigest(game.state);
    pass(game, 1);
    expect(stateDigest(game.state)).not.toBe(before);
    pass(copy, 1);
    expect(stateDigest(copy.state, { events: true })).toBe(stateDigest(game.state, { events: true }));
  });
});
