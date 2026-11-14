/**
 * `thisWay: "counters-removed"` counts a player's energy counters taken off
 * (rule 122.1): energy is kept and announced apart from a player's other
 * counters (`PlayerState.energy`, `energy-changed`), and was missed.
 */
import { describe, expect, it } from "vitest";

import { A, B, hand, table } from "./harness.js";

describe("counters removed this way, energy included", () => {
  it("counts a player's energy and poison counters a resolution removed", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "get-energy", amount: 2, who: "each-opponent" });
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount: 1, who: "each-opponent" });
    const before = hand(game, A).length;
    game.debugApplyEffect(A, {
      kind: "sequence",
      effects: [
        { kind: "remove-player-counters", who: "each-opponent", counter: "every-kind", amount: "all" },
        { kind: "draw", amount: { thisWay: "counters-removed" } },
      ],
    });
    expect(game.state.players[B].energy).toBe(0);
    expect(hand(game, A).length).toBe(before + 3);
  });
});
