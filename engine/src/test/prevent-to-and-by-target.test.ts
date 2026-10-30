/**
 * The prevent-combat-damage-to-and-by-target family (rule 615): one-shot
 * `damage-rule`s over a target — "to and dealt by that creature" (Ebony
 * Horse), "the next time target creature would deal damage" with the life
 * gained (Awe Strike), "to this creature by target creature" (Stonewise
 * Fortifier) — and a static prevention for "other creatures you control"
 * (Tajic, Legion's Edge).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, life, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

describe("prevent to and by target", () => {
  it("Ebony Horse: the attacker untaps and neither deals nor is dealt combat damage", () => {
    const { game, a, b } = table();
    const horse = spawn(game, "Ebony Horse");
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    activate(game, horse, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("Awe Strike: the next damage the creature would deal is prevented, and its caster gains that much", () => {
    const { game, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 1);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A);
    cast(game, toHand(game, "Awe Strike"), { targets: [ref(giant)] });
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, A)).toBe(23);
  });

  it("Stonewise Fortifier: the target creature's damage to it is prevented, its own isn't", () => {
    const { game, a, b } = table();
    const fortifier = spawn(game, "Stonewise Fortifier");
    lands(game, "Plains", 5);
    const giant = spawn(game, "Hill Giant", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    a.declareBlockersFn = () => [{ blocker: fortifier, attacker: giant }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A);
    activate(game, fortifier, 0, { targets: [ref(giant)] });
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(zone(game, fortifier)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("Tajic: noncombat damage to its controller's other creatures is prevented, not to itself", () => {
    const { game } = table();
    const tajic = spawn(game, "Tajic, Legion's Edge");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(tajic)] });
    expect(zone(game, tajic)).toBe("graveyard");
  });
});
