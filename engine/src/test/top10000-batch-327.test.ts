import { describe, expect, it } from "vitest";
import { computeCharacteristics, invalidateComputedCache } from "../characteristics.js";
import { A, enter, pickModes, table, toStep } from "./harness.js";

// Batch 327 (EDHREC ranks 15527–18514): the lead's cards.

describe("Centaur of Attention — stored die results", () => {
  it("stores five d6 results as it enters and gets +X/+X for the most that match", () => {
    const { game } = table();
    const id = enter(game, "Centaur of Attention");
    const stored = game.state.objects[id].storedResults ?? [];
    expect(stored).toHaveLength(5);
    expect(stored.every((s) => s.sides === 6 && s.result >= 1 && s.result <= 6)).toBe(true);
    const tally = new Map<number, number>();
    for (const s of stored) tally.set(s.result, (tally.get(s.result) ?? 0) + 1);
    const most = Math.max(...tally.values());
    expect(computeCharacteristics(game.state, game.registry, id).power).toBe(3 + most);
    // The ruling's example: 1, 1, 3, 3, 4 is +2/+2.
    game.state.objects[id].storedResults = [1, 1, 3, 3, 4].map((result) => ({ sides: 6, result }));
    invalidateComputedCache();
    const c = computeCharacteristics(game.state, game.registry, id);
    expect([c.power, c.toughness]).toEqual([5, 5]);
  });

  it("rerolls only the chosen results, together as one roll, at the beginning of combat", () => {
    const { game, a } = table();
    const id = enter(game, "Centaur of Attention");
    game.state.objects[id].storedResults = [1, 2, 3, 4, 5].map((result) => ({ sides: 6, result }));
    invalidateComputedCache();
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts ?? [];
      return [1, 3];
    };
    const from = game.state.eventLog.length;
    toStep(game, "begin-combat", A);
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0);
    expect(offered).toEqual([
      "Reroll result 1 (1)",
      "Reroll result 2 (2)",
      "Reroll result 3 (3)",
      "Reroll result 4 (4)",
      "Reroll result 5 (5)",
    ]);
    const after = (game.state.objects[id].storedResults ?? []).map((s) => s.result);
    expect(after).toHaveLength(5);
    // The unchosen ones are untouched.
    expect([after[0], after[2], after[4]]).toEqual([1, 3, 5]);
    const rolls = game.state.eventLog.slice(from).flatMap((e) => (e.type === "dice-rolled" ? [e.results.length] : []));
    expect(rolls).toEqual([2]);
  });

  it("choosing none rerolls nothing", () => {
    const { game, a } = table();
    const id = enter(game, "Centaur of Attention");
    game.state.objects[id].storedResults = [6, 6, 6, 6, 6].map((result) => ({ sides: 6, result }));
    invalidateComputedCache();
    pickModes(a);
    toStep(game, "begin-combat", A);
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0);
    expect((game.state.objects[id].storedResults ?? []).map((s) => s.result)).toEqual([6, 6, 6, 6, 6]);
    expect(computeCharacteristics(game.state, game.registry, id).power).toBe(8);
  });
});
