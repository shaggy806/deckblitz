/**
 * A prevention shield's "if damage is prevented this way, …" (rule 615.5) over
 * a simultaneous sweep: the rest of the effect happens once, right after the
 * event, for everything prevented in it.
 */
import { describe, expect, it } from "vitest";

import { A, activate, B, cast, lands, life, pickPermanents, ref, spawn, table, toHand } from "./harness.js";

describe("a shield's then over a simultaneous sweep", () => {
  it("Refraction Trap deals what it prevented in one instance", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    lands(game, "Swamp", 1);
    spawn(game, "Grizzly Bears");
    spawn(game, "Savannah Lions");
    const pestilence = spawn(game, "Pestilence");
    pickPermanents(a, pestilence);
    const trap = toHand(game, "Refraction Trap");
    const lifeA = life(game, A);
    cast(game, trap, { targets: [ref(B)] });
    const lifeB = life(game, B);
    const seq = game.state.eventSeq;
    activate(game, pestilence);
    const fromTrap = game.state.eventLog.filter((e) => e.seq >= seq && e.type === "damage-dealt" && e.source === trap);
    expect(fromTrap.map((e) => (e.type === "damage-dealt" ? e.amount : 0))).toEqual([3]);
    // Pestilence's 1 and the Trap's 3.
    expect(life(game, B)).toBe(lifeB - 4);
    expect(life(game, A)).toBe(lifeA);
  });
});
