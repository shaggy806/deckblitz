import { describe, expect, it } from "vitest";

import { A, B, C, activate, cast, lands, life, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

/**
 * A rules audit (2026-11-26): protection against what reaches every
 * creature, an indestructible creature at 0 toughness, a creature put onto
 * the battlefield attacking, and damage wearing off.
 */
describe("more combat and state-based actions, audited", () => {
  it("protection from black prevents Pestilence's damage, and doesn't stop Wrath of God (rules 702.16e, 702.16b)", () => {
    const { game } = table();
    const knight = spawn(game, "White Knight", B);
    spawn(game, "Pestilence");
    lands(game, "Swamp", 2);
    const pest = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Pestilence")!;
    activate(game, pest, 0);
    activate(game, pest, 0);
    expect(game.state.objects[knight].damageMarked).toBe(0);
    expect(zone(game, knight)).toBe("battlefield");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Wrath of God"));
    expect(zone(game, knight)).toBe("graveyard");
  });

  it("an indestructible creature at 0 toughness is put into the graveyard (rule 704.5f)", () => {
    const { game } = table();
    const myr = spawn(game, "Darksteel Myr", B);
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" }, [ref(myr)]);
    settle(game);
    toStep(game, "postcombat-main");
    expect(zone(game, myr)).toBe("graveyard");
  });

  it("myriad's copies enter attacking and don't trigger Hellrider; the declared attacker does (rules 508.4, 508.1m)", () => {
    const { game, a } = table({ players: 4 });
    spawn(game, "Hellrider");
    const viper = spawn(game, "Broodbirth Viper");
    a.declareAttackersFn = () => [{ attacker: viper, defender: B }];
    a.chooseModesFn = () => [0];
    const bob = life(game, B);
    const carol = life(game, C);
    toStep(game, "postcombat-main");
    // Bob: Hellrider's 1 for the Viper, the Viper's 3. Carol: the copy's 3 alone.
    expect(life(game, B)).toBe(bob - 4);
    expect(life(game, C)).toBe(carol - 3);
  });

  it("marked damage wears off in the cleanup step (rule 514.2)", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 2 } as never, [ref(giant)]);
    settle(game);
    expect(game.state.objects[giant].damageMarked).toBe(2);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep");
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });
});
