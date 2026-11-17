import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, activate, life, pickPermanents, ref, settle, spawn, table } from "./harness.js";

// The chosen-source shield (rule 609.7) preventing half the damage, rounded
// down — Dark Sphere: `prevent-damage-from-chosen-source` with `half`. Two
// apply one after the other, each to what's left (the ruling), and one that
// would prevent none of it isn't used up (609.7b).

const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });

function sphered(count = 1): { game: Game; ogre: ObjectId; spheres: ObjectId[] } {
  const { game, a } = table();
  const ogre = spawn(game, "Gray Ogre", B);
  const spheres: ObjectId[] = [];
  for (let i = 0; i < count; i += 1) spheres.push(spawn(game, "Dark Sphere", A));
  pickPermanents(a, ogre);
  for (const sphere of spheres) {
    activate(game, sphere);
    settle(game);
  }
  return { game, ogre, spheres };
}

describe("Dark Sphere", () => {
  it("prevents half the chosen source's next damage to you, rounded down, and is sacrificed", () => {
    const { game, ogre, spheres } = sphered();
    expect(game.state.objects[spheres[0]].zone).toBe("graveyard");
    hit(game, ogre, ref(A), 5);
    expect(life(game, A)).toBe(17);
    // Only the next time.
    hit(game, ogre, ref(A), 5);
    expect(life(game, A)).toBe(12);
  });

  it("two apply one after the other: 5 damage becomes 3, then 2", () => {
    const { game, ogre } = sphered(2);
    hit(game, ogre, ref(A), 5);
    expect(life(game, A)).toBe(18);
  });

  it("a hit it would prevent none of (1 damage) doesn't use it up", () => {
    const { game, ogre } = sphered();
    hit(game, ogre, ref(A), 1);
    expect(life(game, A)).toBe(19);
    hit(game, ogre, ref(A), 4);
    expect(life(game, A)).toBe(17);
  });

  it("another source isn't stopped, nor damage to a creature", () => {
    const { game, ogre } = sphered();
    const other = spawn(game, "Gray Ogre", B);
    hit(game, other, ref(A), 4);
    expect(life(game, A)).toBe(16);
    const bear = spawn(game, "Grizzly Bears", A);
    hit(game, ogre, ref(bear), 1);
    expect(game.state.objects[bear].damageMarked).toBe(1);
    hit(game, ogre, ref(A), 4);
    expect(life(game, A)).toBe(14);
  });
});
