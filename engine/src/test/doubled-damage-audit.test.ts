import { describe, expect, it } from "vitest";

import { A, B, life, spawn, table, toStep } from "./harness.js";

/**
 * A rules audit (2026-11-26): damage doubled by a replacement (Furnace of
 * Rath) is the damage dealt — lifelink gains that much (702.15b), infect
 * gives that many poison counters (702.90b).
 */
describe("doubled damage, audited", () => {
  it("Vampire Nighthawk under Furnace of Rath deals 4 and its controller gains 4", () => {
    const { game, a } = table();
    spawn(game, "Furnace of Rath", B);
    const hawk = spawn(game, "Vampire Nighthawk");
    a.declareAttackersFn = () => [{ attacker: hawk, defender: B }];
    const mine = life(game, A);
    const theirs = life(game, B);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(theirs - 4);
    expect(life(game, A)).toBe(mine + 4);
  });

  it("Glistener Elf under Furnace of Rath gives 2 poison counters", () => {
    const { game, a } = table();
    spawn(game, "Furnace of Rath", B);
    const elf = spawn(game, "Glistener Elf");
    a.declareAttackersFn = () => [{ attacker: elf, defender: B }];
    toStep(game, "postcombat-main");
    expect(game.state.players[B].counters.poison ?? 0).toBe(2);
  });
});
