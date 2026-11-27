/**
 * "Deals damage to target creature equal to the damage already dealt to it
 * this turn": the `{ damageDealtThisTurn }` amount's `to: { target }` — the
 * journal's damage entries to that target in the stint it's in, from every
 * source (`who: "each-player"`). Damage a regeneration removed was still
 * dealt and counts; prevented damage was never dealt (Whipkeeper's rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, activate, ref, settle, spawn, table, toStep, zone } from "./harness.js";

/** A creature of bob's deals `n` damage to `id`, and the state-based actions
 * are checked. */
function hit(game: Game, id: ObjectId, n: number): void {
  const source = spawn(game, "Grizzly Bears", B);
  game.debugApplyEffect(B, { kind: "damage", amount: n, target: 0 }, [ref(id)], { source });
  settle(game);
  toStep(game, "begin-combat");
}

describe("Whipkeeper", () => {
  it("doubles the damage already dealt to the creature", () => {
    const { game } = table();
    const whip = spawn(game, "Whipkeeper");
    const wurm = spawn(game, "Craw Wurm", B);
    hit(game, wurm, 2);
    expect(zone(game, wurm)).toBe("battlefield");
    activate(game, whip, 0, { targets: [ref(wurm)] });
    // 2 more makes 4: lethal for a 6/4.
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("deals nothing to a creature dealt no damage, whatever else was", () => {
    const { game } = table();
    const whip = spawn(game, "Whipkeeper");
    const wurm = spawn(game, "Craw Wurm", B);
    const other = spawn(game, "Craw Wurm", B);
    hit(game, other, 3);
    activate(game, whip, 0, { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].damageMarked).toBe(0);
    expect(game.state.objects[other].damageMarked).toBe(3);
  });

  it("counts damage that a regeneration removed", () => {
    const { game } = table();
    const whip = spawn(game, "Whipkeeper");
    const wurm = spawn(game, "Craw Wurm", B);
    game.debugApplyEffect(B, { kind: "regenerate", target: 0 }, [ref(wurm)]);
    settle(game);
    hit(game, wurm, 5);
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(0);
    activate(game, whip, 0, { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("doesn't count damage dealt to it as an earlier object", () => {
    const { game } = table();
    const whip = spawn(game, "Whipkeeper");
    const wurm = spawn(game, "Craw Wurm", B);
    hit(game, wurm, 3);
    game.debugMove(wurm, "hand");
    game.debugMove(wurm, "battlefield");
    settle(game);
    activate(game, whip, 0, { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].damageMarked).toBe(0);
  });
});
