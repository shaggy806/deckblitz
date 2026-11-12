/**
 * `put-onto-battlefield`'s `withCounters.amount` read as it resolves —
 * Nine-Lives Familiar's "return it … with one fewer revival counter on it",
 * counted from the counters it died with (608.2h), and "enters with eight
 * revival counters on it if you cast it".
 */
import { describe, expect, it } from "vitest";

import { cast, counters, destroy, lands, nextTurn, settle, spawn, table, toHand, zone } from "./harness.js";

describe("withCounters amount — Nine-Lives Familiar", () => {
  it("enters with eight if cast, comes back with one fewer, and stays dead at none", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const cat = toHand(game, "Nine-Lives Familiar");
    cast(game, cat);
    expect(counters(game, cat, "revival")).toBe(8);
    destroy(game, cat);
    expect(zone(game, cat)).toBe("graveyard");
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    settle(game);
    expect(zone(game, cat)).toBe("battlefield");
    expect(counters(game, cat, "revival")).toBe(7);
  });

  it("put onto the battlefield without being cast, it has none and doesn't return", () => {
    const { game } = table();
    const cat = spawn(game, "Nine-Lives Familiar");
    expect(counters(game, cat, "revival")).toBe(0);
    destroy(game, cat);
    nextTurn(game);
    expect(zone(game, cat)).toBe("graveyard");
  });
});
