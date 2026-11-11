/**
 * "If damage would be dealt to that creature this turn, prevent that damage
 * and put that many +1/+1 counters on it" as a resolved ability's effect: a
 * `replacement-effect` on one object for the turn, its `then` counting the
 * damage even when it can't be prevented (rule 615.12) — Gatta and Luzzu.
 */

import { describe, expect, it } from "vitest";

import { A, B, attack, counters, enter, nextTurn, pickTargets, ref, settle, spawn, table } from "./harness.js";

describe("Gatta and Luzzu", () => {
  it("prevents damage to the chosen creature and puts that many counters on it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const other = spawn(game, "Grizzly Bears", A);
    const source = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    enter(game, "Gatta and Luzzu", A);

    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(bears)], { source });
    settle(game);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(counters(game, bears)).toBe(3);

    // Every time this turn, not only the next.
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(bears)], { source });
    settle(game);
    expect(counters(game, bears)).toBe(4);

    // Only that creature.
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(other)], { source });
    settle(game);
    expect(game.state.objects[other].damageMarked).toBe(1);
    expect(counters(game, other)).toBe(0);
  });

  it("damage that can't be prevented is dealt, and the counters still come (the ruling, 615.12)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", A); // 3/3
    const source = spawn(game, "Grizzly Bears", B);
    pickTargets(a, giant);
    enter(game, "Gatta and Luzzu", A);

    game.debugApplyEffect(B, { kind: "damage-cant-be-prevented" });
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(giant)], { source });
    settle(game);
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(counters(game, giant)).toBe(2);
  });

  it("two blockers' combat damage is one event: prevented, and one lot of counters", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    game.state.objects[bears].summoningSick = false;
    const b1 = spawn(game, "Grizzly Bears", B);
    const b2 = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    enter(game, "Gatta and Luzzu", A);

    b.declareBlockersFn = () => [b1, b2].map((blocker) => ({ blocker, attacker: bears }));
    attack(game, a, [bears]);
    settle(game);
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(counters(game, bears)).toBe(5);
  });

  it("ends with the turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const source = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    enter(game, "Gatta and Luzzu", A);
    nextTurn(game);

    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(bears)], { source });
    settle(game);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});
