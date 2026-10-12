/**
 * The set walk, batch 58, part d (2026-10-11): Marvel Super Heroes — the card
 * a fix unblocked: a "becomes tapped" trigger's trigger object is the
 * permanent that became tapped, so "it deals 1 damage" is that creature's
 * damage (Hawkeye's Bow).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, life, ref, settle, spawn, table } from "./harness.js";

describe("Hawkeye's Bow", () => {
  it("the equipped creature becoming tapped deals 1 damage to each opponent — its own damage (lifelink)", () => {
    const { game } = table({ players: 3 });
    const bow = spawn(game, "Hawkeye's Bow");
    const nighthawk = spawn(game, "Vampire Nighthawk");
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: "source" }, [ref(nighthawk)], { source: bow });
    settle(game);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(nighthawk)]);
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    // The Nighthawk dealt it, so its lifelink gained alice 2.
    expect(life(game, A)).toBe(22);
  });
});
