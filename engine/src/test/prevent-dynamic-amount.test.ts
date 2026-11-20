/**
 * A static "prevent X of that damage" whose X is counted as the damage would
 * be dealt (rule 615.10; `DamagePrevention.prevent: { count }`): Shield of
 * the Avatar's "where X is the number of creatures you control", read from
 * its controller's side for each source's damage on its own.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, activate, lands, ref, spawn, table } from "./harness.js";

const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Shield of the Avatar", () => {
  it("equipped, it prevents as much as the creatures its controller has", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const shield = spawn(game, "Shield of the Avatar", A);
    const wall = spawn(game, "Wall of Stone", A);
    spawn(game, "Grizzly Bears", A);
    activate(game, shield, 0, { targets: [ref(wall)] });
    expect(game.state.objects[shield].attachedTo).toBe(wall);
    const goblin = spawn(game, "Raging Goblin", B);
    // The opponent's creatures don't count.
    spawn(game, "Grizzly Bears", B);
    hit(game, goblin, ref(wall), 5);
    expect(damage(game, wall)).toBe(3);
  });

  it("counts as the damage would be dealt, and prevents all of it when X is enough", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const shield = spawn(game, "Shield of the Avatar", A);
    const wall = spawn(game, "Wall of Stone", A);
    activate(game, shield, 0, { targets: [ref(wall)] });
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(wall), 2);
    expect(damage(game, wall)).toBe(1);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", A);
    hit(game, goblin, ref(wall), 2);
    expect(damage(game, wall)).toBe(1);
  });

  it("doesn't reach a creature it isn't attached to", () => {
    const { game } = table();
    spawn(game, "Shield of the Avatar", A);
    const wall = spawn(game, "Wall of Stone", A);
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(wall), 2);
    expect(damage(game, wall)).toBe(2);
  });
});
