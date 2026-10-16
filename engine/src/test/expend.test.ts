/**
 * Expend (rule 700.14): "whenever you expend N" triggers on the payment that
 * takes the mana a player has spent to cast spells this turn from below N to
 * N or more — once a turn, counting mana spent before the permanent arrived.
 */
import { describe, expect, it } from "vitest";

import { cast, counters, lands, spawn, table, toHand } from "./harness.js";

describe("expend", () => {
  it("Wandertale Mentor: a counter on the spell that reaches four mana, and only that once", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Mountain", 5);
    const mentor = spawn(game, "Wandertale Mentor");
    cast(game, toHand(game, "Grizzly Bears")); // 2 spent
    expect(counters(game, mentor)).toBe(0);
    cast(game, toHand(game, "Hill Giant")); // 2 → 6: crosses 4
    expect(counters(game, mentor)).toBe(1);
    cast(game, toHand(game, "Grizzly Bears")); // 6 → 8: already past 4
    expect(counters(game, mentor)).toBe(1);
  });

  it("counts mana spent before it entered, its own cost included", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Wandertale Mentor")); // 2 spent, on the stack itself
    const mentor = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Wandertale Mentor")!;
    expect(counters(game, mentor)).toBe(0);
    cast(game, toHand(game, "Grizzly Bears")); // 2 → 4
    expect(counters(game, mentor)).toBe(1);
  });
});
