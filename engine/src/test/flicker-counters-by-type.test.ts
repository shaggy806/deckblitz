/**
 * `FlickerCounters.and` — more counters on a returning permanent, each kind
 * with its own `onlyIf` — Semester's End: exiled creatures and planeswalkers
 * come back at the next end step, a creature with an additional +1/+1
 * counter and a planeswalker with an additional loyalty counter.
 */
import { describe, expect, it } from "vitest";

import { cast, counters, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Semester's End", () => {
  it("a +1/+1 counter for the creature, a loyalty counter for the planeswalker", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const walker = spawn(game, "Ajani Goldmane");
    cast(game, toHand(game, "Semester's End"), { targets: [ref(bears), ref(walker)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, walker)).toBe("exile");
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length === 0);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, walker)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, bears, "loyalty")).toBe(0);
    // Ajani Goldmane's printed 4, and one more.
    expect(counters(game, walker, "loyalty")).toBe(5);
    expect(counters(game, walker)).toBe(0);
  });
});
