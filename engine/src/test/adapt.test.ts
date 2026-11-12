/**
 * The `adapt` effect (rule 701.46a) and `adapt-as-though-no-counters` —
 * Biomancer's Familiar: "The next time target creature adapts this turn, it
 * adapts as though it had no +1/+1 counters on it."
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import { activate, counters, lands, ref, spawn, table } from "./harness.js";

describe("adapt", () => {
  it("puts counters only on a creature with none", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const eel = spawn(game, "Skitter Eel");
    activate(game, eel);
    expect(counters(game, eel)).toBe(2);
    activate(game, eel);
    expect(counters(game, eel)).toBe(2);
  });
});

describe("Biomancer's Familiar", () => {
  it("the next adapt this turn ignores the counters it has, once", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const familiar = spawn(game, "Biomancer's Familiar");
    const eel = spawn(game, "Skitter Eel");
    game.state.objects[eel].counters = { "+1/+1": 1 };
    invalidateComputedCache();
    activate(game, familiar, 0, { targets: [ref(eel)] });
    // The mark adds nothing itself.
    expect(counters(game, eel)).toBe(1);
    // {2}{U} less {2}: {U}.
    activate(game, eel);
    expect(counters(game, eel)).toBe(3);
    activate(game, eel);
    expect(counters(game, eel)).toBe(3);
  });

  it("wears off with the turn", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const familiar = spawn(game, "Biomancer's Familiar");
    const eel = spawn(game, "Skitter Eel");
    game.state.objects[eel].counters = { "+1/+1": 1 };
    invalidateComputedCache();
    activate(game, familiar, 0, { targets: [ref(eel)] });
    game.state.turn.number += 2;
    activate(game, eel);
    expect(counters(game, eel)).toBe(1);
  });
});
