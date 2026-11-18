/**
 * Damage replaced by something else, not prevented (rules 614.1a, 614.6):
 * "If damage would be dealt to this creature, put that many +1/+1 counters on
 * it instead" (Phytohydra). The damage never happens and none is prevented,
 * so damage that can't be prevented (615.12) is replaced all the same
 * (Phytohydra's ruling).
 */

import { describe, expect, it } from "vitest";

import { A, cast, counters, lands, life, ref, spawn, table, toHand } from "./harness.js";

describe("damage replaced, not prevented", () => {
  it("Force Bubble, Phytohydra and Lichenthrope replace damage that can't be prevented too", () => {
    const { game } = table();
    const bubble = spawn(game, "Force Bubble");
    const hydra = spawn(game, "Phytohydra");
    const lichen = spawn(game, "Lichenthrope");
    lands(game, "Mountain", 13);
    cast(game, toHand(game, "Flames of the Blood Hand"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    // Four counters: the state trigger sacrificed it.
    expect(game.state.objects[bubble].zone).toBe("graveyard");
    cast(game, toHand(game, "Pinpoint Avalanche"), { targets: [ref(hydra)] });
    expect(counters(game, hydra, "+1/+1")).toBe(4);
    expect(game.state.objects[hydra].damageMarked).toBe(0);
    cast(game, toHand(game, "Pinpoint Avalanche"), { targets: [ref(lichen)] });
    expect(counters(game, lichen, "-1/-1")).toBe(4);
    expect(game.state.objects[lichen].damageMarked).toBe(0);
  });
});
