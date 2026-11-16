/**
 * `opponentsOutlived` (`bot/combat-math.ts`): the crackback taken one
 * opponent at a time, in the order they act. "Dead to the table" names the
 * opponent whose swing kills, and the ones before it are lived through.
 */
import { describe, expect, it } from "vitest";
import { crackback, isLethal, opponentsLethalAlone, opponentsOutlived } from "../bot/combat-math.js";
import { A, B, C, D, spawn, table } from "./harness.js";

/** Alice on 12 with three Hill Giants; Bob (next) with four, Carol with six
 * Craw Wurms, Dave with nothing. */
function board() {
  const { game } = table({ players: 4 });
  game.state.players[A].life = 12;
  const mine = [0, 1, 2].map(() => spawn(game, "Hill Giant"));
  for (let i = 0; i < 4; i += 1) spawn(game, "Hill Giant", B);
  for (let i = 0; i < 6; i += 1) spawn(game, "Craw Wurm", C);
  return { game, mine };
}

const KILL_SHOT = { weight: 1, margin: 2 };

describe("the opponents a seat lives through", () => {
  it("stops at the first whose swing, added to the ones before, is lethal", () => {
    const { game } = board();
    // Bob gets 3 through three blockers; Carol's three unblocked Wurms kill.
    expect(opponentsOutlived(game.state, game.registry, A, 0.5, undefined, KILL_SHOT, -2)).toEqual([B]);
    // The whole crackback is what `deadAnyway` reads: lethal.
    expect(isLethal(game.state, A, crackback(game.state, game.registry, A, 0.5, undefined, KILL_SHOT), -2)).toBe(true);
  });

  it("is nobody when the next swing kills with the blockers gone", () => {
    const { game, mine } = board();
    expect(opponentsOutlived(game.state, game.registry, A, 0.5, "all", KILL_SHOT, -2)).toEqual([]);
    // One Giant home holds Bob to 9 of 12 less the margin's 2.
    expect(opponentsOutlived(game.state, game.registry, A, 0.5, new Set(mine.slice(0, 2)), KILL_SHOT, -2)).toEqual([B]);
  });

  it("is every opponent to act when none is lethal", () => {
    const { game } = table({ players: 4 });
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    expect(opponentsOutlived(game.state, game.registry, A, 0.5, undefined, KILL_SHOT, -2)).toEqual([B, C, D]);
  });

  it("names the opponents who kill alone, each by its own creatures and to the last point", () => {
    const { game, mine } = board();
    // Carol's six Wurms get 18 through three blockers: 12 life is dead to her alone.
    expect(opponentsLethalAlone(game.state, game.registry, A)).toEqual([C]);
    // Bob's four Giants need the blockers gone: 12 through nothing.
    expect(opponentsLethalAlone(game.state, game.registry, A, "all")).toEqual([B, C]);
    expect(opponentsLethalAlone(game.state, game.registry, A, new Set(mine.slice(0, 2)))).toEqual([C]);
    // On 19, Carol's 18 kills only with life kept in reserve.
    game.state.players[A].life = 19;
    expect(opponentsLethalAlone(game.state, game.registry, A)).toEqual([]);
    expect(opponentsLethalAlone(game.state, game.registry, A, undefined, -2)).toEqual([C]);
  });

  it("leaves the crackback's own sum as it was", () => {
    const { game } = board();
    // Bob's 3 in full, and Carol's 18 at the kill shot's weight, not the paranoia's.
    expect(crackback(game.state, game.registry, A, 0.5, undefined, KILL_SHOT).damage).toBe(3 + 18);
    expect(crackback(game.state, game.registry, A, 0.5).damage).toBe(3 + 9);
  });
});
