/**
 * "If ~ would die, instead exile it with N counters on it" — a self
 * `would-be-put-into-graveyard` replacement with `withCounters` (rule 614.1a)
 * — and the card's upkeep ability that works only in exile (rule 113.6k):
 * Darigaaz Reincarnated.
 */
import { describe, expect, it } from "vitest";

import { A, B, counters, destroy, spawn, table, toExile, toStep, zone } from "./harness.js";

describe("Darigaaz Reincarnated", () => {
  it("dies into exile with three egg counters, and returns on the third upkeep after", () => {
    const { game } = table();
    const darigaaz = spawn(game, "Darigaaz Reincarnated", A);
    destroy(game, darigaaz);
    expect(zone(game, darigaaz)).toBe("exile");
    expect(counters(game, darigaaz, "egg")).toBe(3);
    toStep(game, "precombat-main", A);
    expect(counters(game, darigaaz, "egg")).toBe(2);
    toStep(game, "precombat-main", A);
    expect(counters(game, darigaaz, "egg")).toBe(1);
    expect(zone(game, darigaaz)).toBe("exile");
    toStep(game, "precombat-main", A);
    expect(zone(game, darigaaz)).toBe("battlefield");
    expect(game.state.objects[darigaaz].controller).toBe(A);
  });

  it("exiled without egg counters, it never triggers", () => {
    const { game } = table();
    const darigaaz = toExile(game, "Darigaaz Reincarnated", A);
    toStep(game, "precombat-main", A);
    toStep(game, "precombat-main", A);
    expect(zone(game, darigaaz)).toBe("exile");
    expect(counters(game, darigaaz, "egg")).toBe(0);
  });

  it("beside an opponent's Rest in Peace, its controller applies its own and it gets the eggs (616.1)", () => {
    const { game } = table();
    spawn(game, "Rest in Peace", B);
    const darigaaz = spawn(game, "Darigaaz Reincarnated", A);
    destroy(game, darigaaz);
    expect(zone(game, darigaaz)).toBe("exile");
    expect(counters(game, darigaaz, "egg")).toBe(3);
  });

  it("only on its owner's upkeep", () => {
    const { game } = table();
    const darigaaz = spawn(game, "Darigaaz Reincarnated", A);
    destroy(game, darigaaz);
    toStep(game, "precombat-main", B);
    expect(counters(game, darigaaz, "egg")).toBe(3);
  });
});
