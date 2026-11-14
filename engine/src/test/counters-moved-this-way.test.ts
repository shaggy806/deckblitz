/**
 * "If one or more +1/+1 counters are moved this way, you gain that much life"
 * (Black Panther, Wakandan King): `move-counters`' `ifMoved`, with the
 * amount the counters that left the first permanent — `{ thisWay:
 * "counters-removed" }` over the move's own removals (rule 122.5).
 */

import { describe, expect, it } from "vitest";

import { A, activate, counters, enter, hand, lands, life, pickTargets, ref, spawn, table } from "./harness.js";

describe("Black Panther, Wakandan King", () => {
  it("Survey the Realm: it and each other creature you control entering put a counter on a land", () => {
    const { game, a } = table();
    const [forest] = lands(game, "Forest", 1);
    pickTargets(a, forest);
    enter(game, "Black Panther, Wakandan King");
    expect(counters(game, forest)).toBe(1);
    enter(game, "Grizzly Bears");
    expect(counters(game, forest)).toBe(2);
  });

  it("Mine Vibranium: moves them all, gains that much life and draws", () => {
    const { game } = table();
    const panther = spawn(game, "Black Panther, Wakandan King");
    const [forest] = lands(game, "Forest", 1);
    game.state.objects[forest].counters["+1/+1"] = 3;
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    const before = hand(game, A).length;
    activate(game, panther, 0, { targets: [ref(forest), ref(bears)] });
    expect(counters(game, forest)).toBe(0);
    expect(counters(game, bears)).toBe(3);
    expect(life(game, A)).toBe(23);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("with none to move, nothing more happens", () => {
    const { game } = table();
    const panther = spawn(game, "Black Panther, Wakandan King");
    const [forest] = lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    const before = hand(game, A).length;
    activate(game, panther, 0, { targets: [ref(forest), ref(bears)] });
    expect(life(game, A)).toBe(20);
    expect(hand(game, A).length).toBe(before);
  });
});
