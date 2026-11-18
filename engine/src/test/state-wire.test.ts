import { describe, expect, it } from "vitest";

import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import { stateFromJson, stateToJson } from "../state-wire.js";

const ALICE = asPlayerId("alice");
const BOB = asPlayerId("bob");

describe("a state sent as text", () => {
  it("comes back with a blank array slot still blank, where plain JSON makes it null", () => {
    // The shape of a spell with a declined "up to one" target: a blank slot
    // beside a chosen one.
    const targets = [{ kind: "object", id: "obj-1" }, undefined, { kind: "player", id: "bob" }];
    const state = { objects: { "obj-9": { targets, nested: [[undefined], []] } }, note: null } as unknown as GameState;

    const plain = JSON.parse(JSON.stringify(state)) as { objects: Record<string, { targets: unknown[] }> };
    expect(plain.objects["obj-9"].targets[1]).toBeNull();

    const back = stateFromJson(stateToJson(state)) as unknown as {
      objects: Record<string, { targets: unknown[]; nested: unknown[][] }>;
      note: null;
    };
    const slots = back.objects["obj-9"].targets;
    expect(slots).toHaveLength(3);
    expect(slots[1]).toBeUndefined();
    // A real element, not a hole: `every` and `map` see it.
    expect(1 in slots).toBe(true);
    expect(slots.map((slot) => slot === undefined)).toEqual([false, true, false]);
    expect(slots[0]).toEqual({ kind: "object", id: "obj-1" });
    expect(back.objects["obj-9"].nested).toEqual([[undefined], []]);
    expect(0 in back.objects["obj-9"].nested[0]).toBe(true);
    // A null that was a null stays one.
    expect(back.note).toBeNull();
  });

  it("carries a real game's state whole, and a game restored from it plays on the same", () => {
    const decks = [ALICE, BOB].map((player) => ({ player, cards: Array(40).fill("Forest") as string[] }));
    const game = Game.create({ seed: 5, decks });
    const keep = (g: Game): void => {
      for (let i = 0; i < 12 && !g.state.result.over; i += 1) {
        const holder = g.state.priority.holder;
        if (holder === null) break;
        g.dispatch({ type: "pass-priority", player: holder });
      }
    };
    keep(game);
    const text = stateToJson(game.snapshot());
    expect(stateFromJson(text)).toEqual(game.snapshot());
    // The same text again from what was read: nothing lost on the way.
    expect(stateToJson(stateFromJson(text))).toBe(text);

    const copy = Game.fromSnapshot(stateFromJson(text));
    keep(game);
    keep(copy);
    expect(copy.snapshot()).toEqual(game.snapshot());
  });
});
