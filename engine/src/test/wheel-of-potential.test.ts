/**
 * Wheel of Potential: "You get {E}{E}{E}, then you may pay any amount of
 * {E}. Each player may exile their hand and draw a number of cards equal to
 * the amount of {E} paid this way. If seven or more {E} was paid this way, you
 * may play cards you own exiled this way until the end of your next turn."
 * The key `effect:play-cards-exiled-this-way-until-next-turn` — `grant-play`
 * over `{ thisWay: "exiled-from-hand", who: "you" }`, Hex Magic's duration.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, hand, lands, nextTurn, settle, table, toHand, zone } from "./harness.js";

/** Cast Wheel of Potential with `energy` already banked and pay `paid` (null:
 * decline). */
function wheel(game: Game, energy: number, paid: number | null): void {
  game.state.players[A].energy = energy;
  lands(game, "Mountain", 3);
  cast(game, toHand(game, "Wheel of Potential"), { settle: false });
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || s.result.over);
  game.dispatch(
    paid === null
      ? { type: "choose-modes", player: A, modes: [] }
      : { type: "choose-modes", player: A, modes: [0], xValue: paid },
  );
}

/** Answer each player's "exile your hand and draw?" in turn. */
function answers(game: Game, ...yes: readonly [PlayerId, boolean][]): void {
  for (const [player, says] of yes) {
    game.advanceUntil((s) => (s.awaiting?.kind === "choose-modes" && s.awaiting.player === player) || s.result.over);
    game.dispatch({ type: "choose-modes", player, modes: says ? [0] : [] });
  }
  settle(game);
}

const playable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

describe("Wheel of Potential", () => {
  it("paying seven: each player who says yes exiles their hand and draws seven; you may play yours until your next turn ends", () => {
    const { game } = table();
    const giant = toHand(game, "Hill Giant", A);
    const theirs = toHand(game, "Grizzly Bears", B);
    const bHand = hand(game, B).length;
    wheel(game, 4, 7);
    answers(game, [A, true], [B, true]);
    expect(game.state.players[A].energy).toBe(0);
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(hand(game, A)).toHaveLength(7);
    expect(hand(game, B)).toHaveLength(7);
    expect(bHand).toBeGreaterThan(0);
    lands(game, "Mountain", 4);
    expect(playable(game, giant)).toBe(true);
    // Not a card bob owns.
    expect(playable(game, theirs)).toBe(false);
    nextTurn(game); // bob's
    nextTurn(game); // alice's next turn: still
    lands(game, "Mountain", 4);
    expect(playable(game, giant)).toBe(true);
    nextTurn(game);
    nextTurn(game); // and gone after it
    lands(game, "Mountain", 4);
    expect(playable(game, giant)).toBe(false);
  });

  it("everyone decides before anyone exiles their hand (the ruling)", () => {
    const { game } = table();
    const giant = toHand(game, "Hill Giant", A);
    wheel(game, 0, 2);
    game.advanceUntil((s) => (s.awaiting?.kind === "choose-modes" && s.awaiting.player === A) || s.result.over);
    game.dispatch({ type: "choose-modes", player: A, modes: [0] });
    game.advanceUntil((s) => (s.awaiting?.kind === "choose-modes" && s.awaiting.player === B) || s.result.over);
    // Bob decides with alice's hand still where it was.
    expect(zone(game, giant)).toBe("hand");
    game.dispatch({ type: "choose-modes", player: B, modes: [] });
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    expect(hand(game, A)).toHaveLength(2);
  });

  it("paying less than seven: the draws only, nothing to play from exile", () => {
    const { game } = table();
    const giant = toHand(game, "Hill Giant", A);
    wheel(game, 0, 3);
    answers(game, [A, true], [B, true]);
    expect(zone(game, giant)).toBe("exile");
    expect(hand(game, A)).toHaveLength(3);
    expect(hand(game, B)).toHaveLength(3);
    lands(game, "Mountain", 4);
    expect(playable(game, giant)).toBe(false);
  });

  it("declining the energy is paying 0; a player who says no keeps their hand", () => {
    const { game } = table();
    const giant = toHand(game, "Hill Giant", A);
    const bBefore = [...hand(game, B)];
    wheel(game, 0, null);
    answers(game, [A, true], [B, false]);
    expect(game.state.players[A].energy).toBe(3);
    expect(zone(game, giant)).toBe("exile");
    expect(hand(game, A)).toHaveLength(0);
    expect(hand(game, B)).toEqual(bBefore);
  });
});
