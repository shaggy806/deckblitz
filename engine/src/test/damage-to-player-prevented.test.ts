/**
 * The `damage-to-player-prevented` trigger event — "whenever damage that
 * would be dealt to you is prevented" (Selfless Squire): any prevention of
 * damage to you, with "that many" the amount prevented; damage to a creature
 * or to an opponent doesn't count.
 */
import { describe, expect, it } from "vitest";

import { A, B, counters, enter, life, ref, settle, spawn, table } from "./harness.js";

describe("damage-to-player-prevented — Selfless Squire", () => {
  it("prevents damage to you this turn and grows by the amount prevented", () => {
    const { game } = table();
    const squire = enter(game, "Selfless Squire");
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [{ kind: "player", player: A }]);
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(counters(game, squire, "+1/+1")).toBe(3);
    // Damage to a creature you control isn't damage to you.
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(bears)]);
    settle(game);
    expect(counters(game, squire, "+1/+1")).toBe(3);
  });

  it("counts an opponent's prevention for them, not you", () => {
    const { game } = table();
    const squire = spawn(game, "Selfless Squire");
    game.debugApplyEffect(B, { kind: "damage-rule", to: { players: "you" } }, []);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, target: 0 }, [{ kind: "player", player: B }]);
    settle(game);
    expect(life(game, B)).toBe(20);
    expect(counters(game, squire, "+1/+1")).toBe(0);
  });
});
