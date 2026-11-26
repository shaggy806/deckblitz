/**
 * "If that creature is another Hero": a `target` condition's filter with
 * `isSource: false`, read against the ability's source as it resolves —
 * the source itself, a Hero too, isn't "another" (Wakandan Royal Guard).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { cast, lands, pickTargets, spawn, table, toHand } from "./harness.js";

const plus = (game: Game, id: ObjectId): number => game.state.objects[id].counters["+1/+1"] ?? 0;

/** Casts the Guard, its enters trigger aimed at what `aim` picks. */
const castGuard = (aim: (board: { hero: ObjectId; bears: ObjectId; guard: ObjectId }) => ObjectId) => {
  const { game, a } = table();
  const hero = spawn(game, "Amateur Hero");
  const bears = spawn(game, "Grizzly Bears");
  lands(game, "Forest", 5);
  const guard = toHand(game, "Wakandan Royal Guard");
  pickTargets(a, aim({ hero, bears, guard }));
  cast(game, guard);
  return { game, hero, bears, guard };
};

describe("Wakandan Royal Guard: two counters on another Hero, one otherwise", () => {
  it("another Hero gets two", () => {
    const { game, hero } = castGuard((b) => b.hero);
    expect(plus(game, hero)).toBe(2);
  });

  it("a non-Hero gets one", () => {
    const { game, bears } = castGuard((b) => b.bears);
    expect(plus(game, bears)).toBe(1);
  });

  it("the Guard itself, a Hero but not another one, gets one", () => {
    const { game, guard } = castGuard((b) => b.guard);
    expect(game.state.objects[guard].zone).toBe("battlefield");
    expect(plus(game, guard)).toBe(1);
  });
});
