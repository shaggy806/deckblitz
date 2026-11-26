import { describe, expect, it } from "vitest";

import { A, life, loyalty, ref, settle, spawn, table } from "./harness.js";

/**
 * A rules audit (2026-11-26): a loyalty ability once a turn per permanent
 * (rule 606.3) — and a planeswalker that left and came back is a new object
 * that hasn't activated one (400.7).
 */
describe("loyalty abilities, audited", () => {
  it("a second loyalty ability in one turn is refused; blinked, the new object may activate one (rules 606.3, 400.7)", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani Goldmane");
    game.state.objects[ajani].counters.loyalty = 4;
    const before = life(game, A);
    loyalty(game, ajani, 1);
    expect(life(game, A)).toBe(before + 2);
    expect(() => loyalty(game, ajani, 1)).toThrow();
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(ajani)]);
    settle(game);
    expect(game.state.objects[ajani].zone).toBe("battlefield");
    expect(game.state.objects[ajani].counters.loyalty).toBe(4);
    loyalty(game, ajani, 1);
    expect(life(game, A)).toBe(before + 4);
  });
});
