/**
 * A delayed "whenever" watch lasting "for as long as this creature remains
 * tapped" (`until: "while-source-tapped"`, rule 611.2b) — Giant Oyster's
 * draw-step -1/-1 counters: over as the Oyster untaps, phases out (702.26f)
 * or leaves, and not brought back by tapping it again. Beside it, the
 * "doesn't untap" restriction of the same duration and the once-only watch on
 * the Oyster untapping or leaving that removes the counters.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, counters, destroy, nextTurn, pickPermanents, pt, ref, spawn, table, toStep } from "./harness.js";

function setUp() {
  const { game, a } = table();
  const oyster = spawn(game, "Giant Oyster");
  const giant = spawn(game, "Hill Giant", B, { tapped: true });
  activate(game, oyster, 0, { targets: [ref(giant)] });
  return { game, a, oyster, giant };
}

describe("Giant Oyster", () => {
  it("only a tapped creature can be targeted", () => {
    const { game } = table();
    const oyster = spawn(game, "Giant Oyster");
    const giant = spawn(game, "Hill Giant", B);
    expect(() => activate(game, oyster, 0, { targets: [ref(giant)] })).toThrow();
  });

  it("holds the creature tapped and shrinks it each of your draw steps while the Oyster stays tapped", () => {
    const { game, a, oyster, giant } = setUp();
    nextTurn(game); // Bob's untap step: the Giant stays tapped.
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(counters(game, giant, "-1/-1")).toBe(0);
    pickPermanents(a, oyster);
    nextTurn(game); // Alice keeps the Oyster tapped; her draw step adds a counter.
    expect(game.state.objects[oyster].tapped).toBe(true);
    expect(counters(game, giant, "-1/-1")).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    pickPermanents(a, oyster);
    nextTurn(game);
    expect(counters(game, giant, "-1/-1")).toBe(2);
    // She lets it untap: every -1/-1 counter comes off, and no more come.
    nextTurn(game);
    pickPermanents(a);
    nextTurn(game);
    expect(game.state.objects[oyster].tapped).toBe(false);
    expect(counters(game, giant, "-1/-1")).toBe(0);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game); // The restriction is over too.
    expect(game.state.objects[giant].tapped).toBe(false);
  });

  it("untapped and tapped again, the watch stays over", () => {
    const { game, a, oyster, giant } = setUp();
    nextTurn(game);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(oyster)]);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(oyster)]);
    pickPermanents(a, oyster);
    nextTurn(game);
    expect(game.state.objects[oyster].tapped).toBe(true);
    expect(counters(game, giant, "-1/-1")).toBe(0);
    expect(game.state.delayedTriggers.filter((t) => t.source === oyster)).toHaveLength(0);
  });

  it("leaving the battlefield removes the counters", () => {
    const { game, a, oyster, giant } = setUp();
    nextTurn(game);
    pickPermanents(a, oyster);
    nextTurn(game);
    expect(counters(game, giant, "-1/-1")).toBe(1);
    toStep(game, "precombat-main");
    destroy(game, oyster);
    expect(counters(game, giant, "-1/-1")).toBe(0);
    nextTurn(game);
    expect(game.state.objects[giant].tapped).toBe(false);
  });
});
