/**
 * Lethal damage, and Zilortha, Strength Incarnate's "Lethal damage dealt to
 * creatures you control is determined by their power rather than their
 * toughness" (`StaticAbility.lethalDamageByPower`). Every reading of lethal
 * damage goes through `lethalDamageOf` / `lethalDamageLeft`
 * (`characteristics.ts`); see `docs/plans/lethal-damage-by-power.md`.
 */

import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import { lethalFor } from "../combat/damage.js";
import type { DamageAssignmentAsk } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, grant, life, registryOf, spawn, table, zone } from "./harness.js";

const markDamage = (game: ReturnType<typeof table>["game"], id: ObjectId, amount: number): void => {
  game.state.objects[id].damageMarked = amount;
  invalidateComputedCache();
};

describe("lethal damage already marked (rule 702.19b)", () => {
  it("a deathtouch trampler owes nothing to a blocker that already has lethal damage marked", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Colossal Dreadmaw", A); // 6/6 trample
    grant(game, wurm, "deathtouch");
    const myr = spawn(game, "Darksteel Myr", B); // 0/1 indestructible
    markDamage(game, myr, 1);
    expect(lethalFor(game.state, registryOf(game), wurm, myr)).toBe(0);
    let asked: DamageAssignmentAsk | null = null;
    b.declareBlockersFn = () => [{ blocker: myr, attacker: wurm }];
    a.assignCombatDamageFn = (_view, ask) => {
      asked = ask;
      return [0];
    };
    attack(game, a, [wurm]);
    expect(asked!.lethal).toEqual([0]);
    expect(life(game, B)).toBe(14);
    expect(zone(game, myr)).toBe("battlefield");
  });

  it("one with no damage marked still needs only 1 from deathtouch (702.2c)", () => {
    const { game } = table();
    const wurm = spawn(game, "Colossal Dreadmaw", A);
    grant(game, wurm, "deathtouch");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(lethalFor(game.state, registryOf(game), wurm, bears)).toBe(1);
  });
});
