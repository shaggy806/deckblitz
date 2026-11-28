/**
 * "A land that a mire counter was put onto with this artifact but that a
 * mire counter has not been removed from with this artifact" (Cyclopean
 * Tomb): `CardFilter.countersPutBySource`, read off the journal's
 * whole-game `countersPutBy` — the counters an ability of a permanent put on
 * and removed from each permanent, by both objects' stints (rule 400.7), a
 * fired delayed ability's by the stint its creator meant (608.2h; gaps key
 * `effect:remove-counters-placed-by-source`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, activate, counters, destroy, lands, nextTurn, pickPermanents, ref, settle, spawn, subtypes, table, toStep } from "./harness.js";

const mire = (game: Game, id: ObjectId): number => counters(game, id, "mire");

/** Alice's next upkeep, the Tomb put on `land` there. */
const tombOn = (game: Game, tomb: ObjectId, land: ObjectId): void => {
  toStep(game, "upkeep");
  activate(game, tomb, 0, { targets: [ref(land)] });
  settle(game);
};

describe("Cyclopean Tomb", () => {
  it("makes a land a Swamp while it has a mire counter, during its controller's upkeep only", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const tomb = spawn(game, "Cyclopean Tomb");
    const forest = spawn(game, "Forest", B);
    expect(() => activate(game, tomb, 0, { targets: [ref(forest)] })).toThrow();
    tombOn(game, tomb, forest);
    expect(mire(game, forest)).toBe(1);
    expect(subtypes(game, forest)).toEqual(["Swamp"]);
  });

  it("clears one of its lands an upkeep once it's in the graveyard, never one twice", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const tomb = spawn(game, "Cyclopean Tomb");
    const forest = spawn(game, "Forest", B);
    const island = spawn(game, "Island", B);
    const other = spawn(game, "Mountain", B);
    tombOn(game, tomb, forest);
    tombOn(game, tomb, island);
    destroy(game, tomb);
    settle(game);
    expect(game.state.objects[tomb].zone).toBe("graveyard");
    // Another source's mire counter on another land doesn't make it the Tomb's.
    game.state.objects[other].counters.mire = 1;

    const offered = pickPermanents(a, forest);
    toStep(game, "upkeep");
    settle(game);
    expect([...offered.offered].sort()).toEqual([forest, island].sort());
    expect(mire(game, forest)).toBe(0);
    expect(subtypes(game, forest)).toEqual(["Forest"]);
    expect(mire(game, island)).toBe(1);

    // The next upkeep: the Forest has been cleared with it, so only the Island.
    const next = pickPermanents(a, island);
    nextTurn(game);
    toStep(game, "upkeep");
    settle(game);
    expect([...next.offered]).toEqual([island]);
    expect(mire(game, island)).toBe(0);
    expect(mire(game, other)).toBe(1);
  });

  it("forgets a land that has left the battlefield and come back", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const tomb = spawn(game, "Cyclopean Tomb");
    const forest = spawn(game, "Forest", B);
    tombOn(game, tomb, forest);
    destroy(game, tomb);
    game.debugMove(forest, "hand");
    game.debugMove(forest, "battlefield");
    game.state.objects[forest].counters.mire = 1;
    const offered = pickPermanents(a, forest);
    toStep(game, "upkeep");
    settle(game);
    expect(offered.offered).toEqual([]);
    expect(mire(game, forest)).toBe(1);
  });
});
