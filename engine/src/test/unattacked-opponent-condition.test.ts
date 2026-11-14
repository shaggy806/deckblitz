/**
 * "If that player has another opponent who isn't being attacked": the
 * `unattacked-opponent` condition, read from the board as it is (rule 506.3 —
 * a creature attacking that player, not their planeswalker), and a
 * `damage-rule` lasting "this combat" (511.2). Suppressor Skyguard is the
 * proving card.
 */

import { describe, expect, it } from "vitest";

import { invalidateComputedCache, staticConditionMet } from "../characteristics.js";
import { A, B, C, attack, life, spawn, table } from "./harness.js";

describe("Suppressor Skyguard", () => {
  it("prevents the combat damage to you when the attacker left another opponent unattacked", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Suppressor Skyguard", B);
    const bears = spawn(game, "Grizzly Bears", A);
    attack(game, a, [bears], B);
    expect(life(game, B)).toBe(20);
    // Only this combat's: none is left once combat has ended.
    expect(game.state.activeReplacements.filter((r) => r.owner === B)).toEqual([]);
  });

  it("not when every other opponent is attacked too", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Suppressor Skyguard", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const other = spawn(game, "Grizzly Bears", A);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: other, defender: C },
    ];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
  });

  it("an opponent whose planeswalker alone is attacked isn't being attacked", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Suppressor Skyguard", B);
    const walker = spawn(game, "Liliana of the Veil", C);
    const bears = spawn(game, "Grizzly Bears", A);
    const other = spawn(game, "Grizzly Bears", A);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: other, defender: walker },
    ];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, B)).toBe(20);
  });

  it("reads the board as it is: a creature attacking that opponent", () => {
    const { game } = table({ players: 3 });
    const skyguard = spawn(game, "Suppressor Skyguard", B);
    const source = game.state.objects[skyguard];
    const cond = { kind: "unattacked-opponent", of: "active-player", another: true } as const;
    expect(staticConditionMet(game.state, game.registry, source, cond)).toBe(true);
    const bears = spawn(game, "Grizzly Bears", A);
    game.state.objects[bears].attacking = C;
    invalidateComputedCache();
    expect(staticConditionMet(game.state, game.registry, source, cond)).toBe(false);
    game.state.objects[bears].attacking = null;
    game.state.players[C].hasLost = true;
    invalidateComputedCache();
    expect(staticConditionMet(game.state, game.registry, source, cond)).toBe(false);
  });
});
