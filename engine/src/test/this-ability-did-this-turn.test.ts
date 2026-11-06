import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import { A, B, lands, nextTurn, settle, spawn, table, toStep } from "./harness.js";

// "If you haven't added mana with this ability this turn" (Carpet of
// Flowers): an intervening if (rule 603.4) on the `this-ability-did-this-turn`
// condition, which reads the record its `add-mana` (`marksAbilityDone`) keeps
// when it added at least one mana — X = 0 adds none (rule 107.1b). "Each of
// your main phases" is two trigger events of one ability (`sameAbilityAs`),
// sharing that record.

/** Answer Carpet's "you may" with `yes`, counting the questions; the colour
 * (asked as modes too) is the first offered. */
function answerMays(seat: ScriptedController, yes: () => boolean): { asked: number } {
  const seen = { asked: 0 };
  seat.chooseModesFn = (_view, minModes, _maxModes, texts) => {
    if (!texts[0]?.startsWith("Add X mana")) return Array.from({ length: Math.max(1, minModes) }, (_u, i) => i);
    seen.asked += 1;
    return yes() ? [0] : [];
  };
  return seen;
}

const pool = (game: Game): number => game.state.players[A].manaPool.length;

function board(): { game: Game; a: ScriptedController } {
  const { game, a } = table({ step: "upkeep" });
  spawn(game, "Carpet of Flowers");
  lands(game, "Island", 3, B);
  return { game, a };
}

describe("Carpet of Flowers", () => {
  it("adds X mana in the first main phase, X the Islands the target opponent controls", () => {
    const { game, a } = board();
    answerMays(a, () => true);
    toStep(game, "precombat-main");
    settle(game);
    expect(pool(game)).toBe(3);
  });

  it("having added mana, doesn't trigger again in the second main phase", () => {
    const { game, a } = board();
    const seen = answerMays(a, () => true);
    toStep(game, "precombat-main");
    settle(game);
    expect(seen.asked).toBe(1);
    toStep(game, "postcombat-main");
    // It never triggered (rule 603.4): nothing on the stack or waiting.
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(game.state.pendingTriggers).toEqual([]);
    settle(game);
    expect(seen.asked).toBe(1);
    expect(pool(game)).toBe(0);
  });

  it("declined in the first main phase, it triggers again in the second", () => {
    const { game, a } = board();
    let answer = false;
    const seen = answerMays(a, () => answer);
    toStep(game, "precombat-main");
    settle(game);
    expect(seen.asked).toBe(1);
    expect(pool(game)).toBe(0);
    answer = true;
    toStep(game, "postcombat-main");
    settle(game);
    expect(seen.asked).toBe(2);
    expect(pool(game)).toBe(3);
  });

  it("X = 0 adds no mana (rule 107.1b): an Island later, it triggers again and adds 1", () => {
    const { game, a } = table({ step: "upkeep" });
    spawn(game, "Carpet of Flowers");
    const seen = answerMays(a, () => true);
    toStep(game, "precombat-main");
    settle(game);
    expect(seen.asked).toBe(1);
    expect(pool(game)).toBe(0);
    lands(game, "Island", 1, B);
    toStep(game, "postcombat-main");
    settle(game);
    expect(seen.asked).toBe(2);
    expect(pool(game)).toBe(1);
  });

  it("starts again the next turn of yours", () => {
    const { game, a } = board();
    const seen = answerMays(a, () => true);
    toStep(game, "precombat-main");
    settle(game);
    nextTurn(game); // bob's
    settle(game);
    expect(seen.asked).toBe(1);
    nextTurn(game); // alice's
    settle(game);
    expect(seen.asked).toBe(2);
    expect(pool(game)).toBe(3);
  });

  it("a second Carpet is its own ability, with its own record", () => {
    const { game, a } = board();
    spawn(game, "Carpet of Flowers");
    answerMays(a, () => true);
    toStep(game, "precombat-main");
    settle(game);
    expect(pool(game)).toBe(6);
  });
});
