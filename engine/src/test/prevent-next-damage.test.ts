/**
 * Prevention shields (rule 615.7) on the effect's controller, untargeted —
 * a `damage-rule` to "you" with an amount (Conservator, Shield of the Ages,
 * Decorated Griffin's combat damage only) — and divided among any number of
 * targets as the spell is cast, at least 1 each (601.2d —
 * `prevent-damage-divided`: Remedy, Embolden).
 */
import { describe, expect, it } from "vitest";

import { A, activate, attack, B, cast, lands, life, ref, spawn, table, toGraveyard, toHand, toStep, zone } from "./harness.js";

describe("the next N damage that would be dealt to you", () => {
  it("Conservator: a 2-point shield on its controller, used up by the first 2", () => {
    const { game } = table();
    const conservator = spawn(game, "Conservator");
    lands(game, "Wastes", 3);
    activate(game, conservator);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
  });

  it("Shield of the Ages: each activation adds a 1-point shield", () => {
    const { game } = table();
    const shield = spawn(game, "Shield of the Ages");
    lands(game, "Wastes", 4);
    activate(game, shield);
    activate(game, shield);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(19);
  });

  it("Decorated Griffin: combat damage only — a Shock gets through, an attacker's damage doesn't", () => {
    const t = table();
    const { game } = t;
    const griffin = spawn(game, "Decorated Griffin");
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    lands(game, "Mountain", 1);
    activate(game, griffin);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
    // The shield lasts only this turn: take another in bob's beginning of combat.
    toStep(game, "precombat-main", B);
    game.advanceUntil((s) => s.turn.step === "begin-combat" && s.priority.holder === A);
    activate(game, griffin, 0, { settle: false });
    attack(game, t.b, [bear], A);
    expect(life(game, A)).toBe(17);
  });
});

describe("the next N damage divided among any number of targets", () => {
  it("Remedy: each target's share is its own shield", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const ogre = spawn(game, "Gray Ogre");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Remedy"), { targets: [ref(bear), ref(ogre)], division: [3, 2] });
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].damageMarked ?? 0).toBe(0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(ogre)] });
    expect(game.state.objects[ogre].damageMarked).toBe(1);
  });

  it("refuses a division that isn't at least 1 each", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    expect(() => cast(game, toHand(game, "Remedy"), { targets: [ref(bear), ref(A)], division: [5, 0] })).toThrow();
  });

  it("Embolden, flashed back: a player and a creature, shares of 1 and 3", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const embolden = toGraveyard(game, "Embolden");
    lands(game, "Plains", 2);
    cast(game, embolden, { targets: [ref(A), ref(bear)], division: [1, 3], via: "flashback" });
    expect(zone(game, embolden)).toBe("exile");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(19);
    cast(game, toHand(game, "Shock"), { targets: [ref(bear)] });
    expect(game.state.objects[bear].damageMarked ?? 0).toBe(0);
  });
});
