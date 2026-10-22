/**
 * Cumulative upkeep (rule 702.24 — the `cumulativeUpkeep(cost)` helper, on
 * the `unless` option's `times`): each of your upkeeps an age counter, then
 * the cost once per age counter, all or nothing, or the permanent is
 * sacrificed. Ice Age's Illusionary Wall ({U}) and Polar Kraken (sacrifice a
 * land).
 */
import { describe, expect, it } from "vitest";
import { A, counters, lands, nextTurn, pickModes, spawn, table, zone } from "./harness.js";

describe("cumulative upkeep", () => {
  it("adds an age counter each upkeep, and the cost grows with them", () => {
    const { game, a } = table();
    const wall = spawn(game, "Illusionary Wall");
    lands(game, "Island", 2);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    // First upkeep: one counter, {U} paid.
    expect(counters(game, wall, "age")).toBe(1);
    expect(zone(game, wall)).toBe("battlefield");
    nextTurn(game);
    nextTurn(game);
    // Second: two counters, {U}{U} paid with both Islands.
    expect(counters(game, wall, "age")).toBe(2);
    expect(zone(game, wall)).toBe("battlefield");
    nextTurn(game);
    nextTurn(game);
    // Third: {U}{U}{U}, more than two Islands make — sacrificed.
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("is sacrificed when its controller declines to pay", () => {
    const { game, a } = table();
    const wall = spawn(game, "Illusionary Wall");
    lands(game, "Island", 3);
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("a sacrifice cost takes one land per age counter, or the permanent", () => {
    const { game, a } = table();
    const kraken = spawn(game, "Polar Kraken");
    const forests = lands(game, "Forest", 2);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, kraken)).toBe("battlefield");
    expect(forests.filter((f) => zone(game, f) === "graveyard")).toHaveLength(1);
    nextTurn(game);
    nextTurn(game);
    // Two age counters, one land left: it can't be paid.
    expect(zone(game, kraken)).toBe("graveyard");
    expect(game.state.players[A].life).toBe(20);
  });
});
