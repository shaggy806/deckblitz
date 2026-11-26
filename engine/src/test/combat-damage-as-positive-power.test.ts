/**
 * "If Loot's power is negative, he assigns combat damage as though his power
 * were positive" — the `combatDamageAsPositivePower` static, read in
 * `combatDamageOf` (rule 510.1a), proven on Loot, the Anomaly: its power
 * doesn't change (the ruling), and by toughness wins over it (the ruling).
 */
import { describe, expect, it } from "vitest";

import { combatDamageOf, computeCharacteristics } from "../characteristics.js";
import { A, B, activate, attack, life, pt, spawn, table, toGraveyard, zone } from "./harness.js";

const threshold = (game: Parameters<typeof toGraveyard>[0]): void => {
  for (let i = 0; i < 7; i++) toGraveyard(game, "Forest", A);
};

describe("Loot, the Anomaly", () => {
  it("assigns 2 combat damage at -2 power", () => {
    const { game, a } = table();
    const loot = spawn(game, "Loot, the Anomaly");
    expect(pt(game, loot).power).toBe(-2);
    attack(game, a, [loot]);
    expect(life(game, B)).toBe(18);
  });

  it("threshold: sacrificing another creature makes it -4/4, and it assigns 4", () => {
    const { game, a } = table();
    const loot = spawn(game, "Loot, the Anomaly");
    const bears = spawn(game, "Grizzly Bears");
    threshold(game);
    activate(game, loot, 0, { sacrifice: bears });
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, loot)).toEqual({ power: -4, toughness: 4 });
    attack(game, a, [loot]);
    expect(life(game, B)).toBe(16);
  });

  it("can't be activated without threshold", () => {
    const { game } = table();
    const loot = spawn(game, "Loot, the Anomaly");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, loot, 0, { sacrifice: bears })).toThrow(/activate-ability refused/);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("a creature with positive power assigns its power as before; another negative creature assigns none", () => {
    const { game } = table();
    const loot = spawn(game, "Loot, the Anomaly");
    const bears = spawn(game, "Grizzly Bears");
    const c = computeCharacteristics(game.state, game.registry, loot);
    expect(combatDamageOf(c)).toBe(2);
    // Without the static, negative power assigns no damage (510.1a).
    expect(combatDamageOf({ ...c, damageAsPositivePower: undefined })).toBeLessThanOrEqual(0);
    expect(combatDamageOf(computeCharacteristics(game.state, game.registry, bears))).toBe(2);
  });

  it("by toughness wins: under Doran it assigns its toughness", () => {
    const { game, a } = table();
    const loot = spawn(game, "Loot, the Anomaly");
    spawn(game, "Doran, the Siege Tower", B);
    attack(game, a, [loot]);
    expect(life(game, B)).toBe(16);
  });
});
