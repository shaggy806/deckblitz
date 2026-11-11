/**
 * "That player chooses draw step, main phase, or combat phase. The player
 * skips each instance of the chosen step or phase this turn." (Fatespinner):
 * the `skip-step` effect's `eachThisTurn` — every one of the active player's
 * draw steps, main phases (rule 505.1: both, and any additional one) or
 * combat phases left this turn, passed as though it didn't exist (rules
 * 500.11, 614.10), one added after the choice too, and nothing of a later
 * turn.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, life, nextTurn, pickModes, spawn, table, toLibrary } from "./harness.js";

const DRAW = 0;
const MAIN = 1;
const COMBAT = 2;

const hand = (game: Game, player: PlayerId): number => game.state.zones.perPlayer[player].hand.length;
const stock = (game: Game, player: PlayerId, n = 10): void => {
  for (let i = 0; i < n; i += 1) toLibrary(game, "Wastes", player);
};
/** The steps that began and the ones skipped in the turn that started after
 * `from` (the rest of the turn under way then left out), in order. */
const steps = (game: Game, from: number): string[] => {
  const all = game.events
    .slice(from)
    .flatMap((e) => (e.type === "step-began" ? [e.step] : e.type === "step-skipped" ? [`skipped ${e.step}`] : []));
  return all.slice(all.indexOf("untap"));
};

/** Alice's Fatespinner, and Bob's turn about to start with a full library. */
function setUp(): ReturnType<typeof table> {
  const t = table();
  stock(t.game, A);
  stock(t.game, B);
  spawn(t.game, "Fatespinner");
  return t;
}

describe("Fatespinner", () => {
  it("asks the opponent whose upkeep it is, not its controller", () => {
    const { game, a, b } = setUp();
    let asked: PlayerId | undefined;
    a.chooseModesFn = () => {
      asked = A;
      return [DRAW];
    };
    b.chooseModesFn = () => {
      asked = B;
      return [DRAW];
    };
    nextTurn(game);
    expect(asked).toBe(B);
  });

  it("draw step: no card drawn, and the turn goes on to the main phase", () => {
    const { game, b } = setUp();
    pickModes(b, DRAW);
    const before = hand(game, B);
    const from = game.events.length;
    nextTurn(game, "end");
    expect(hand(game, B)).toBe(before);
    const seen = steps(game, from);
    expect(seen).toContain("skipped draw");
    expect(seen).not.toContain("draw");
    expect(seen).toContain("precombat-main");
    expect(seen).toContain("postcombat-main");
  });

  it("main phase: both are skipped and count as none, and combat still happens", () => {
    const { game, b } = setUp();
    pickModes(b, MAIN);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    const before = life(game, A);
    const from = game.events.length;
    nextTurn(game, "end");
    const seen = steps(game, from);
    expect(seen.filter((s) => s === "skipped main")).toHaveLength(2);
    expect(seen).not.toContain("precombat-main");
    expect(seen).not.toContain("postcombat-main");
    // Upkeep, draw, then straight to combat, then the end step.
    expect(seen.indexOf("draw")).toBeLessThan(seen.indexOf("begin-combat"));
    expect(life(game, A)).toBe(before - 2);
    expect(game.state.turn.mainPhases ?? 0).toBe(0);
  });

  it("combat phase: every one is skipped, one added after the choice too", () => {
    const { game, b } = setUp();
    pickModes(b, COMBAT);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    const before = life(game, A);
    const from = game.events.length;
    nextTurn(game); // Bob's precombat main
    game.debugApplyEffect(B, { kind: "additional-combat" });
    game.advanceUntil((s) => s.turn.step === "end");
    const seen = steps(game, from);
    expect(seen.filter((s) => s === "skipped combat")).toHaveLength(2);
    expect(seen).not.toContain("begin-combat");
    expect(seen).not.toContain("declare-attackers");
    expect(life(game, A)).toBe(before);
  });

  it("lasts only the turn: its controller's own turn is whole, and the opponent chooses again next time", () => {
    const { game, b } = setUp();
    pickModes(b, MAIN);
    nextTurn(game, "end"); // Bob's, his main phases skipped
    const from = game.events.length;
    const before = hand(game, A);
    nextTurn(game); // Alice's precombat main: nothing of hers is skipped
    expect(hand(game, A)).toBe(before + 1);
    expect(steps(game, from).filter((s) => s.startsWith("skipped"))).toEqual([]);
    pickModes(b, DRAW);
    const bobs = hand(game, B);
    const again = game.events.length;
    nextTurn(game); // Bob's: this time his main phase happens, his draw doesn't
    expect(hand(game, B)).toBe(bobs);
    expect(steps(game, again)).toContain("skipped draw");
  });

  it("two of them may both be answered with the same phase", () => {
    const { game, b } = setUp();
    spawn(game, "Fatespinner");
    pickModes(b, COMBAT);
    const from = game.events.length;
    nextTurn(game, "end");
    const seen = steps(game, from);
    expect(seen).toContain("skipped combat");
    expect(seen).toContain("draw");
    expect(seen).toContain("precombat-main");
  });
});
