/**
 * `grantPtPerCount.turnHistory`: a static P/T bonus that scales with one of
 * a player's this-turn journal lists — Kinbinding's "creatures you control
 * get +X/+X, where X is the number of creatures that entered the battlefield
 * under your control this turn". Each is counted as it was when it entered,
 * so one that has since died still counts; the count is the controller's
 * own, and it's gone with the turn.
 */
import { describe, expect, it } from "vitest";

import { A, B, destroy, enter, nextTurn, pt, spawn, table, toStep, tokensNamed } from "./harness.js";

describe("Kinbinding", () => {
  it("counts the creatures that entered under your control this turn, dead ones too", () => {
    const { game } = table();
    spawn(game, "Kinbinding");
    const bears = spawn(game, "Grizzly Bears"); // silently: no entry recorded
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });

    const giant = enter(game, "Hill Giant");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });

    // A noncreature permanent entering isn't counted; an opponent's creature isn't either.
    enter(game, "Sol Ring");
    const theirs = enter(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });

    // It entered this turn whatever became of it.
    destroy(game, giant);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    enter(game, "Hill Giant");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("makes a Kithkin at the beginning of combat on your turn, which counts, and forgets with the turn", () => {
    const { game } = table();
    spawn(game, "Kinbinding");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "declare-attackers");
    expect(tokensNamed(game, "Kithkin Token", A)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });

    // The opponent's turn: nothing entered under your control, and no token at their combat.
    nextTurn(game, "postcombat-main");
    expect(tokensNamed(game, "Kithkin Token", A)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});
