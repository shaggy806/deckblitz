/**
 * A `repeat` whose stakes double each pass (the `{ repeatPass }` amount under
 * `powerOfTwo`) and whose "again?" is asked of the flip's winner, not always
 * the controller (`mayAgain.asks`) — Game of Chaos. The coins come from the
 * game's seeded stream, so each case reads the flips back off the log.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";

import { A, B, cast, lands, life, ref, table, toHand } from "./harness.js";

const flips = (game: Game): boolean[] =>
  game.state.eventLog.flatMap((e) => (e.type === "coin-flipped" && e.won !== undefined ? [e.won] : []));

/** Each "Flip again?" answered by `again(asked so far)`, recording who was asked. */
function answering(a: ScriptedController, b: ScriptedController, again: (n: number) => boolean): string[] {
  const asked: string[] = [];
  const answer = (who: string) => (_view: unknown, minModes: number, _max: number, texts: readonly string[]) => {
    if (texts[0] !== "Flip again?") return Array.from({ length: minModes }, (_, i) => i);
    asked.push(who);
    return again(asked.length) ? [0] : [];
  };
  a.chooseModesFn = answer("alice");
  b.chooseModesFn = answer("bob");
  return asked;
}

function play(seed: number, again: (n: number) => boolean) {
  const { game, a, b } = table({ seed });
  lands(game, "Mountain", 3);
  const asked = answering(a, b, again);
  cast(game, toHand(game, "Game of Chaos"), { targets: [ref(B)] });
  return { game, asked, flipped: flips(game) };
}

/** What alice's life moved by, flip by flip: ±1, ±2, ±4, … */
const swing = (results: readonly boolean[]): number => results.reduce((n, won, i) => n + (won ? 1 : -1) * 2 ** i, 0);

describe("Game of Chaos", () => {
  it("one flip, its winner asked, and declining ends it", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game, asked, flipped } = play(seed, () => false);
      expect(flipped).toHaveLength(1);
      expect(asked).toEqual([flipped[0] ? "alice" : "bob"]);
      expect(life(game, A)).toBe(20 + swing(flipped));
      expect(life(game, B)).toBe(20 - swing(flipped));
    }
  });

  it("the stakes double with each flip, the winner of each asked", () => {
    for (const seed of [1, 2, 3, 4]) {
      const { game, asked, flipped } = play(seed, (n) => n < 4);
      expect(flipped).toHaveLength(4);
      expect(asked).toEqual(flipped.map((won) => (won ? "alice" : "bob")));
      expect(life(game, A)).toBe(20 + swing(flipped));
      expect(life(game, B)).toBe(20 - swing(flipped));
    }
  });

  it("a loser of a flip who's asked can keep it going, and both kinds of flip turn up", () => {
    const seen = new Set<boolean>();
    for (let seed = 1; seed <= 12; seed += 1) for (const won of play(seed, (n) => n < 3).flipped) seen.add(won);
    expect([...seen].sort()).toEqual([false, true]);
  });
});
