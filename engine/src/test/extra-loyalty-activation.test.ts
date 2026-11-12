/**
 * The `player-effect`'s `extraLoyaltyActivation` — The Chain Veil's "for each
 * planeswalker you control, you may activate one of its loyalty abilities
 * once this turn as though none … have been activated" (rule 606.3): one more
 * each time it resolves (its ruling), a planeswalker that arrives later
 * included; and its end-step life loss when no loyalty ability was activated.
 */
import { describe, expect, it } from "vitest";

import { A, activate, lands, life, loyalty, ref, settle, spawn, table, toStep } from "./harness.js";

describe("extraLoyaltyActivation — The Chain Veil", () => {
  it("adds one activation per resolution, for a planeswalker that arrives later too", () => {
    const { game } = table();
    lands(game, "Wastes", 8);
    const veil = spawn(game, "The Chain Veil");
    const jace = spawn(game, "Jace Beleren");
    loyalty(game, jace, 2);
    expect(() => loyalty(game, jace, 2)).toThrow();
    activate(game, veil);
    settle(game);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(veil)]);
    activate(game, veil);
    settle(game);
    loyalty(game, jace, 2);
    loyalty(game, jace, 2);
    expect(() => loyalty(game, jace, 2)).toThrow();
    const later = spawn(game, "Ajani Goldmane");
    loyalty(game, later, 1);
    loyalty(game, later, 1);
    loyalty(game, later, 1);
    expect(() => loyalty(game, later, 1)).toThrow();
  });

  it("loses 2 life at your end step only if you activated no loyalty ability", () => {
    const { game } = table();
    spawn(game, "The Chain Veil");
    const jace = spawn(game, "Jace Beleren");
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(18);
    const second = table();
    spawn(second.game, "The Chain Veil");
    loyalty(second.game, spawn(second.game, "Jace Beleren"), 2);
    toStep(second.game, "end");
    settle(second.game);
    expect(life(second.game, A)).toBe(20);
    void jace;
  });
});
