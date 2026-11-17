/**
 * A die rolled as an activated ability's cost (rules 602.2b, 601.2h; 706):
 * Clay Golem's "{6}, Roll a d8: Monstrosity X, where X is the result". The
 * roll is made as the cost is paid, before anyone can respond, and it is
 * the ability's own — activated again in response, each resolves with its
 * own result (the ruling) — and once monstrous it can still be activated,
 * the die rolled and nothing else (the ruling).
 */

import { describe, expect, it } from "vitest";

import { rollsSince } from "../random-results.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { B, activate, counters, lands, pickTargets, settle, spawn, table, watchTargets, zone } from "./harness.js";

/** Berserk aims at the first of `stones` still there. */
const aimAt = (seat: ScriptedController, stones: readonly ObjectId[]): void => {
  watchTargets(seat, (offered) => [stones.find((id) => offered[0]?.includes(id)) ?? null]);
};

/** Each d8 rolled so far, oldest first. */
const d8s = (state: Parameters<typeof rollsSince>[0]): number[] =>
  rollsSince(state, 0)
    .filter((roll) => roll.sides === 8)
    .map((roll) => roll.total);

describe("Clay Golem — roll a d8 as the cost, monstrosity X", () => {
  it("rolls as it's activated and puts that many counters on it, then berserks", () => {
    const { game, a } = table();
    lands(game, "Wastes", 6);
    const golem = spawn(game, "Clay Golem");
    const stone = spawn(game, "Mind Stone", B);
    pickTargets(a, stone);
    activate(game, golem, 0, { settle: false });
    // Rolled already, the ability still on the stack.
    const [rolled] = d8s(game.state);
    expect(rolled).toBeGreaterThanOrEqual(1);
    expect(rolled).toBeLessThanOrEqual(8);
    expect(counters(game, golem)).toBe(0);
    settle(game);
    expect(counters(game, golem)).toBe(rolled);
    expect(game.state.objects[golem].monstrous).toBe(true);
    expect(zone(game, stone)).toBe("graveyard");
  });

  it("each activation resolves with its own roll, not the last one made", () => {
    // A seed where the two d8s differ, so reading the wrong one shows.
    let found = false;
    for (let seed = 1; seed <= 40 && !found; seed += 1) {
      const { game, a } = table({ seed });
      lands(game, "Wastes", 12);
      const first = spawn(game, "Clay Golem");
      const second = spawn(game, "Clay Golem");
      aimAt(a, [spawn(game, "Mind Stone", B), spawn(game, "Mind Stone", B)]);
      activate(game, first, 0, { settle: false });
      activate(game, second, 0, { settle: false });
      const [r1, r2] = d8s(game.state);
      if (r1 === r2) continue;
      found = true;
      settle(game);
      expect(counters(game, second)).toBe(r2);
      expect(counters(game, first)).toBe(r1);
    }
    expect(found).toBe(true);
  });

  it("can be activated once monstrous: the die is rolled, nothing more", () => {
    const { game, a } = table();
    lands(game, "Wastes", 12);
    const golem = spawn(game, "Clay Golem");
    aimAt(a, [spawn(game, "Mind Stone", B)]);
    activate(game, golem);
    const after = counters(game, golem);
    activate(game, golem);
    expect(d8s(game.state)).toHaveLength(2);
    expect(counters(game, golem)).toBe(after);
  });
});
