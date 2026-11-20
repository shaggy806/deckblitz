/**
 * "During your turn, as long as you haven't activated an exhaust ability this
 * turn, you may activate exhaust abilities as though they haven't been
 * activated" (Elvish Refueler, `StaticAbility.exhaustReactivation`): rule
 * 702.177b — the first exhaust ability its controller begins to activate on
 * their own turn may be one already used, and none after it.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, counters, lands, nextTurn, spawn, table } from "./harness.js";

const canActivate = (game: Game, source: ObjectId, player: PlayerId = A): boolean =>
  game.canDispatch({ type: "activate-ability", player, source, abilityIndex: 0, targets: [] }) === null;

describe("Elvish Refueler", () => {
  it("lets its own used exhaust ability be activated again on a later turn of yours, once", () => {
    const { game } = table();
    const refueler = spawn(game, "Elvish Refueler");
    lands(game, "Forest", 4);
    activate(game, refueler);
    expect(counters(game, refueler)).toBe(1);
    // This turn an exhaust ability has been activated: no more.
    expect(canActivate(game, refueler)).toBe(false);

    nextTurn(game);
    nextTurn(game);
    expect(game.activePlayer).toBe(A);
    expect(canActivate(game, refueler)).toBe(true);
    activate(game, refueler);
    expect(counters(game, refueler)).toBe(2);
    expect(canActivate(game, refueler)).toBe(false);
  });

  it("gives nothing once another exhaust ability was activated first this turn", () => {
    const { game } = table();
    const refueler = spawn(game, "Elvish Refueler");
    const expert = spawn(game, "Afterburner Expert");
    lands(game, "Forest", 6);
    activate(game, refueler);

    nextTurn(game);
    nextTurn(game);
    // A fresh exhaust ability is no reactivation, but it is an exhaust
    // ability activated this turn.
    activate(game, expert);
    expect(counters(game, expert)).toBe(2);
    expect(canActivate(game, refueler)).toBe(false);

    nextTurn(game);
    nextTurn(game);
    activate(game, refueler);
    expect(counters(game, refueler)).toBe(2);
    expect(canActivate(game, expert)).toBe(false);
  });

  it("doesn't work during an opponent's turn", () => {
    const { game } = table();
    const refueler = spawn(game, "Elvish Refueler");
    lands(game, "Forest", 2);
    activate(game, refueler);
    nextTurn(game);
    expect(game.activePlayer).toBe(B);
    game.advanceUntil((s) => s.priority.holder === A);
    expect(game.activePlayer).toBe(B);
    expect(canActivate(game, refueler)).toBe(false);
  });

  it("reaches its controller's other exhaust abilities, never an opponent's", () => {
    const { game } = table();
    spawn(game, "Elvish Refueler", B);
    const expert = spawn(game, "Afterburner Expert");
    lands(game, "Forest", 4);
    activate(game, expert);
    nextTurn(game);
    nextTurn(game);
    expect(game.activePlayer).toBe(A);
    expect(canActivate(game, expert)).toBe(false);
  });
});
