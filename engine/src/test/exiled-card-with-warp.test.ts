/**
 * "Target exiled card with warp" — a `card-in-exile` slot with `hasKeyword:
 * "warp"`, put on the bottom of its owner's library. Proven on Blade of the
 * Swarm's second mode.
 */
import { describe, expect, it } from "vitest";

import { B, counters, enter, pickModes, pickTargets, table, toExile, watchTargets, zone } from "./harness.js";

describe("Blade of the Swarm", () => {
  it("puts two +1/+1 counters on itself", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const blade = enter(game, "Blade of the Swarm");
    expect(counters(game, blade)).toBe(2);
  });

  it("puts an opponent's exiled warp card on the bottom of their library", () => {
    const { game, a } = table();
    const warped = toExile(game, "Astelli Reclaimer", B);
    pickModes(a, 1);
    pickTargets(a, warped);
    const blade = enter(game, "Blade of the Swarm");
    expect(zone(game, warped)).toBe("library");
    const library = game.state.zones.perPlayer[B].library;
    expect(library[library.length - 1]).toBe(warped);
    expect(counters(game, blade)).toBe(0);
  });

  it("offers only exiled cards with warp, yours and theirs", () => {
    const { game, a } = table();
    const bears = toExile(game, "Grizzly Bears", B);
    const theirs = toExile(game, "Astelli Reclaimer", B);
    const mine = toExile(game, "Astelli Reclaimer");
    pickModes(a, 1);
    const seen = watchTargets(a, () => [mine]);
    enter(game, "Blade of the Swarm");
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([theirs, mine].sort());
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, mine)).toBe("library");
  });
});
