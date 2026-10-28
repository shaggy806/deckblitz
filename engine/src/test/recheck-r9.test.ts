/**
 * Batch 243 — the need-keys recheck list R9 (Phase 1 step 2): cards whose
 * old triage records named a key built since, re-triaged one by one.
 */
import { describe, expect, it } from "vitest";
import { A, activate, hand, lands, spawn, table, toHand, zone } from "./harness.js";

describe("Urban Retreat", () => {
  it("from the hand, {2} and a tapped creature returned put it onto the battlefield tapped", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const retreat = toHand(game, "Urban Retreat");
    activate(game, retreat, 1);
    expect(zone(game, retreat)).toBe("battlefield");
    expect(game.state.objects[retreat].tapped).toBe(true);
    expect(hand(game)).toContain(bears);
  });

  it("can't be activated without a tapped creature to return", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    spawn(game, "Grizzly Bears");
    const retreat = toHand(game, "Urban Retreat");
    expect(() => activate(game, retreat, 1)).toThrow();
    expect(zone(game, retreat)).toBe("hand");
  });
});
