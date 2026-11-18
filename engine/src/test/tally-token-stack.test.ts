/**
 * A permanent's `tally` under token stacks. A token split off a stack shares
 * what `splitOneFromStack` doesn't copy, and the tally was written in place:
 * once a stack had a tally, one token's damage was counted on its fellows
 * too, so two tokens hitting for 2 each added 4 apiece. Found by the fuzzer's
 * copy check (`MTG_REPLICA=1`): a copy of the game restored from a sent state
 * shares nothing between objects, and added 2. A stack is a representation,
 * so it may not change a result.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, life, named, spawn, table, toStep } from "./harness.js";

/** A stack of `count` bears that took `taken` life each on an earlier turn. */
function seasonedStack(game: Game, count: number, taken: number): ObjectId {
  const stack = spawn(game, "Grizzly Bears");
  game.state.objects[stack].stackCount = count;
  game.state.objects[stack].tally = {
    lifeTaken: taken,
    cardsDrawn: 0,
    thisTurn: { turn: game.state.turn.number - 1, lifeTaken: taken, cardsDrawn: 0 },
  };
  return stack;
}

const tallies = (game: Game): { count: number; taken: number; thisTurn: number }[] =>
  named(game, "Grizzly Bears").map((id) => ({
    count: game.state.objects[id].stackCount ?? 1,
    taken: game.state.objects[id].tally?.lifeTaken ?? 0,
    thisTurn: game.state.objects[id].tally?.thisTurn.lifeTaken ?? 0,
  }));

describe("a token stack's tally", () => {
  it("credits each attacker with its own damage, not its fellows'", () => {
    const { game, a } = table();
    const stack = seasonedStack(game, 2, 2);
    a.declareAttackersFn = () => [{ attacker: stack, defender: B, count: 2 }];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(16);

    // Two bears, 2 damage each on top of the 2 each had: 4 apiece, however
    // the two are held now (one stack again, or two objects).
    const now = tallies(game);
    expect(now.reduce((n, t) => n + t.count, 0)).toBe(2);
    for (const t of now) expect(t).toMatchObject({ taken: 4, thisTurn: 2 });
  });

  it("leaves the tokens that stayed home with what they had", () => {
    const { game, a } = table();
    const stack = seasonedStack(game, 3, 2);
    a.declareAttackersFn = () => [{ attacker: stack, defender: B, count: 1 }];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(18);

    // 2 each before, and one of the three dealt 2 more: 8 between them, the
    // two at home still at 2. (Their `thisTurn` is the earlier turn's, stale
    // by design until something is added.)
    const now = tallies(game);
    expect(now.reduce((n, t) => n + t.count, 0)).toBe(3);
    expect(now.reduce((n, t) => n + t.count * t.taken, 0)).toBe(8);
    expect(now.map((t) => t.taken).sort()).toEqual(now.length === 2 ? [2, 4] : [2, 2, 4]);
  });
});
