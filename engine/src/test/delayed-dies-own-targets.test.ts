/**
 * "Choose target creature. When that creature dies this turn, <an effect with
 * a target of its own>" (rules 603.7c, 603.7b, 603.3d): a delayed "when"
 * watching the spell's target, which chooses its own targets as it triggers
 * — the `DelayedWhenever` with `watching`, `once` and `targets`, no engine
 * code. With no legal target as it triggers, it's removed from the stack.
 *
 * Cards: Fatal Fissure.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, counters, destroy, keywords, lands, nextTurn, pickTargets, pt, ref, spawn, table, toHand, types, watchTargets } from "./harness.js";

describe("Fatal Fissure", () => {
  it("when the chosen creature dies this turn, earthbend 4 targets a land you control then", () => {
    const { game, a } = table();
    const [swamp] = lands(game, "Swamp", 2);
    const forest = spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Fatal Fissure"), { targets: [ref(bears)] });
    const seen = watchTargets(a, () => [forest]);
    destroy(game, bears);
    expect(seen.asked).toBe(1);
    expect(types(game, forest)).toContain("creature");
    expect(counters(game, forest)).toBe(4);
    expect(pt(game, forest)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, forest).has("haste")).toBe(true);
    expect(types(game, swamp)).not.toContain("creature");
  });

  it("fires once, and only for that creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const forest = spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Fatal Fissure"), { targets: [ref(bears)] });
    pickTargets(a, forest);
    destroy(game, other);
    expect(counters(game, forest)).toBe(0);
    destroy(game, bears);
    expect(counters(game, forest)).toBe(4);
  });

  it("not on a later turn", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const forest = spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears", A);
    cast(game, toHand(game, "Fatal Fissure"), { targets: [ref(bears)] });
    nextTurn(game);
    pickTargets(a, forest);
    destroy(game, bears);
    expect(counters(game, forest)).toBe(0);
    expect(types(game, forest)).not.toContain("creature");
  });
});
