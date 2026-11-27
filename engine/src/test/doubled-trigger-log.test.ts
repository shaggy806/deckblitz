import { describe, expect, it } from "vitest";

import { B, cast, lands, life, settle, spawn, table, toHand } from "./harness.js";

/**
 * A trigger that "triggers an additional time" (Delney, Streetwise Lookout)
 * goes on the stack as one entry standing for its instances
 * (`GameObject.stackCount`), each resolved on its own. Its `ability-triggered`
 * event says how many, so the log can (a friend's game, 2026-11-26: four
 * Y'shtola triggers announced, eight resolved).
 */
describe("a doubled trigger, announced", () => {
  it("Papalymo Totolymo under Delney: one entry for two instances, the event says 2, both resolve", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Delney, Streetwise Lookout");
    spawn(game, "Papalymo Totolymo");
    lands(game, "Island", 1);
    const bob = life(game, B);
    cast(game, toHand(game, "Opt"), { settle: false });
    const triggered = game.eventsOfType("ability-triggered").filter((e) => game.state.objects[e.source]?.cardName === "Papalymo Totolymo");
    expect(triggered).toHaveLength(1);
    expect(triggered[0].copies).toBe(2);
    expect(game.state.objects[triggered[0].object].stackCount).toBe(2);
    settle(game);
    // Each instance: 1 to each opponent, 1 life to alice.
    expect(life(game, B)).toBe(bob - 2);
  });

  it("without Delney: one instance, no count on the event", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Papalymo Totolymo");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"), { settle: false });
    const triggered = game.eventsOfType("ability-triggered").filter((e) => game.state.objects[e.source]?.cardName === "Papalymo Totolymo");
    expect(triggered).toHaveLength(1);
    expect(triggered[0].copies).toBeUndefined();
  });
});
