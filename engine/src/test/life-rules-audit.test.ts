import { describe, expect, it } from "vitest";

import { A, B, life, spawn, table, toStep } from "./harness.js";

/**
 * A rules audit (2026-11-26): life (rule 119) beside lifelink — damage to a
 * player who can't lose life is still dealt (119.3, 120.3a), and a player
 * who can't gain life gains nothing from it (119.7).
 */
describe("life, audited", () => {
  it("Platinum Emperion: its controller loses no life to the hit, and the lifelinker still gains (rules 119.3, 702.15b)", () => {
    const { game, a } = table();
    const hawk = spawn(game, "Vampire Nighthawk");
    spawn(game, "Platinum Emperion", B);
    a.declareAttackersFn = () => [{ attacker: hawk, defender: B }];
    const mine = life(game, A);
    const theirs = life(game, B);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(theirs);
    expect(life(game, A)).toBe(mine + 2);
  });

  it("Sulfuric Vortex: a lifelinker's controller gains nothing, and the hit lands (rule 119.7)", () => {
    const { game, a } = table();
    const hawk = spawn(game, "Vampire Nighthawk");
    spawn(game, "Sulfuric Vortex", B);
    a.declareAttackersFn = () => [{ attacker: hawk, defender: B }];
    const mine = life(game, A);
    const theirs = life(game, B);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(theirs - 2);
    expect(life(game, A)).toBe(mine);
  });
});
