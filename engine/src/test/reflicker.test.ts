/**
 * The `reflicker` effect — Lae'zel's Acrobatics: "Exile all nontoken
 * creatures you control, then roll a d20. 1—9 | Return those cards … at the
 * beginning of the next end step. 10—20 | Return those cards …, then exile
 * them again. Return those cards … at the beginning of the next end step."
 * The roll is read from its `dice-rolled` event, seed by seed, so both rows
 * are played.
 */
import { describe, expect, it } from "vitest";

import { cast, counters, hand, lands, settle, spawn, table, toHand, zone } from "./harness.js";

function play(seed: number) {
  const { game } = table({ seed });
  lands(game, "Plains", 4);
  const visionary = spawn(game, "Elvish Visionary");
  game.state.objects[visionary].counters = { "+1/+1": 1 };
  const before = hand(game).length;
  cast(game, toHand(game, "Lae'zel's Acrobatics"));
  const roll = game.eventsOfType("dice-rolled").at(-1)?.results[0] ?? 0;
  const afterSpell = { zone: zone(game, visionary), drawn: hand(game).length - before };
  game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length === 0);
  settle(game);
  return { roll, afterSpell, end: { zone: zone(game, visionary), drawn: hand(game).length - before, counters: counters(game, visionary) } };
}

describe("Lae'zel's Acrobatics", () => {
  it("1—9: back at the end step only; 10—20: back and exiled again at once, and back at the end step", () => {
    const seen = new Set<"low" | "high">();
    for (let seed = 1; seed <= 12 && seen.size < 2; seed += 1) {
      const { roll, afterSpell, end } = play(seed);
      expect(roll).toBeGreaterThan(0);
      expect(afterSpell.zone).toBe("exile");
      expect(end.zone).toBe("battlefield");
      // A new object each time: its counter is gone.
      expect(end.counters).toBe(0);
      if (roll >= 10) {
        seen.add("high");
        // Its enters trigger drew once on the immediate return, once at the end step.
        expect(afterSpell.drawn).toBe(1);
        expect(end.drawn).toBe(2);
      } else {
        seen.add("low");
        expect(afterSpell.drawn).toBe(0);
        expect(end.drawn).toBe(1);
      }
    }
    expect([...seen].sort()).toEqual(["high", "low"]);
  });
});
