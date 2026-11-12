/**
 * A triggered ability's `resolvesDespiteIllegalTargets` — "this ability
 * still resolves if its target becomes illegal" (Gilded Drake): rule 608.2b
 * doesn't take it off the stack; it resolves, the exchange fails, and the
 * Drake is sacrificed.
 */
import { describe, expect, it } from "vitest";

import { A, B, controller, enter, pickTargets, settle, spawn, table, zone } from "./harness.js";

describe("Gilded Drake", () => {
  it("exchanges with the target", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const drake = enter(game, "Gilded Drake");
    expect(controller(game, drake)).toBe(B);
    expect(controller(game, giant)).toBe(A);
  });

  it("no target chosen: sacrificed", () => {
    const { game, a } = table();
    spawn(game, "Hill Giant", B);
    pickTargets(a, null);
    const drake = enter(game, "Gilded Drake");
    expect(zone(game, drake)).toBe("graveyard");
  });

  it("the target gone in response: the ability still resolves, and the Drake is sacrificed", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const drake = enter(game, "Gilded Drake", A, { settle: false });
    // The trigger is waiting on the stack: the target leaves before it resolves.
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.awaiting === null);
    game.debugMove(giant, "hand");
    settle(game);
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, drake)).toBe("graveyard");
  });
});
