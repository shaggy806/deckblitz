/**
 * Damage replaced by something else, not prevented (rules 614.1a, 614.6):
 * "If damage would be dealt to you, put that many delay counters on this
 * enchantment instead" (Delaying Shield). The damage never happens and none
 * is prevented, so damage that can't be prevented (615.12) is replaced all
 * the same (the card's ruling). Delaying Shield's upkeep then asks once per
 * counter removed whether to pay {1}{W} or lose 1 life.
 */

import { describe, expect, it } from "vitest";

import { A, cast, counters, lands, life, pickModes, ref, spawn, table, toHand, toStep } from "./harness.js";

describe("damage replaced, not prevented — Delaying Shield", () => {
  it("turns damage to you into that many delay counters", () => {
    const { game } = table();
    const shield = spawn(game, "Delaying Shield");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    expect(counters(game, shield, "delay")).toBe(3);
  });

  it("replaces damage that can't be prevented", () => {
    const { game } = table();
    const shield = spawn(game, "Delaying Shield");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Flames of the Blood Hand"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    expect(counters(game, shield, "delay")).toBe(4);
  });

  it("removes every delay counter at upkeep, a payment or a life for each", () => {
    const { game, a } = table();
    const shield = spawn(game, "Delaying Shield");
    game.state.objects[shield].counters.delay = 3;
    lands(game, "Plains", 2);
    // Pay for the first counter (all the mana there is), decline the rest.
    let asked = 0;
    a.chooseModesFn = () => (asked++ === 0 ? [0] : []);
    toStep(game, "upkeep");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(counters(game, shield, "delay")).toBe(0);
    expect(asked).toBeGreaterThanOrEqual(1);
    expect(life(game, A)).toBe(18);
  });

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

  it("loses a life for each counter when nothing is paid", () => {
    const { game, a } = table();
    const shield = spawn(game, "Delaying Shield");
    game.state.objects[shield].counters.delay = 4;
    pickModes(a);
    toStep(game, "upkeep");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(counters(game, shield, "delay")).toBe(0);
    expect(life(game, A)).toBe(16);
  });
});
