/**
 * Firestorm Phoenix: its own "would die" replacement returns it to its
 * owner's hand, and the replacement's `then` (`GraveyardExileReplacement.then`
 * with `self` and `instead: "hand"`) binds a `cast` / `play-land` prohibition
 * to that card in this stint of it until its owner's next turn. It's known
 * to every player while it stays in the hand (it came from the battlefield).
 */

import { describe, expect, it } from "vitest";

import { A, B, destroy, hand, lands, nextTurn, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { liveProhibitions } from "../prohibitions.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

/** The players a live "can't cast" bound to `card` binds. */
const barred = (game: Game, card: ObjectId): PlayerId[] =>
  liveProhibitions(game.state, game.registry, "cast").flatMap(({ prohibition }) =>
    prohibition.objects?.some((b) => b.object === card) === true && typeof prohibition.who === "object" && "players" in prohibition.who
      ? [...prohibition.who.players]
      : [],
  );

describe("Firestorm Phoenix: returns to hand instead of dying, and can't be played until its owner's next turn", () => {
  it("returns to its owner's hand instead of dying", () => {
    const { game } = table();
    const phoenix = spawn(game, "Firestorm Phoenix", A);
    destroy(game, phoenix);
    expect(zone(game, phoenix)).toBe("hand");
    expect(hand(game, A)).toContain(phoenix);
  });

  it("can't be cast this turn, though another Firestorm Phoenix can", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const phoenix = spawn(game, "Firestorm Phoenix", A);
    const other = toHand(game, "Firestorm Phoenix");
    destroy(game, phoenix);
    expect(castable(game, phoenix)).toBe(false);
    expect(castable(game, other)).toBe(true);
  });

  it("is shown to every player while it's in the hand", () => {
    const { game } = table();
    const phoenix = spawn(game, "Firestorm Phoenix", A);
    destroy(game, phoenix);
    expect(game.viewFor(B).objects[phoenix]?.knownToAll).toBe(true);
  });

  it("can't be cast in an opponent's turn before its owner's next turn, and can be in that turn", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const phoenix = spawn(game, "Firestorm Phoenix", A);
    destroy(game, phoenix);
    nextTurn(game);
    // Bob's turn: still barred.
    expect(barred(game, phoenix)).toEqual([A]);
    nextTurn(game);
    expect(barred(game, phoenix)).toEqual([]);
    expect(castable(game, phoenix)).toBe(true);
  });

  it("can still be put onto the battlefield by an effect", () => {
    const { game } = table();
    const phoenix = spawn(game, "Firestorm Phoenix", A);
    destroy(game, phoenix);
    expect(game.debugMove(phoenix, "battlefield")).toBe(true);
  });

  it("a stolen Phoenix goes to its owner's hand, and its owner is the one barred", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const phoenix = spawn(game, "Firestorm Phoenix", B);
    game.state.objects[phoenix].controller = A;
    destroy(game, phoenix, A);
    expect(hand(game, B)).toContain(phoenix);
    expect(barred(game, phoenix)).toEqual([B]);
  });

  it("the bar is on that card in that stint: once it leaves the hand and comes back, it can be cast", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const phoenix = spawn(game, "Firestorm Phoenix", A);
    destroy(game, phoenix);
    game.debugMove(phoenix, "library");
    game.debugMove(phoenix, "hand");
    expect(castable(game, phoenix)).toBe(true);
  });
});
