/**
 * The `cycled-this-game` condition — "if you've cycled a card named Yidaro,
 * Wandering Monster four or more times this game" — over the journal's
 * whole-game `cycledNames`, any card of that name each time, the cycle
 * that triggered the ability among them. And `shuffle-into-library` of the
 * source with the card gone: its owner still shuffles (rule 701.24c).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, lands, settle, table, toHand, zone } from "./harness.js";

const YIDARO = "Yidaro, Wandering Monster";

function cycle(game: Game, card: ObjectId, player: PlayerId = A, andSettle = true): void {
  lands(game, "Mountain", 2, player);
  game.dispatch({ type: "cycle", player, card });
  if (andSettle) settle(game);
}

const shuffles = (game: Game, player: PlayerId = A): number =>
  game.eventsOfType("library-shuffled").filter((e) => e.player === player).length;

describe("Yidaro, Wandering Monster", () => {
  it("the first three cycles shuffle it into your library from your graveyard", () => {
    const { game } = table();
    for (let i = 0; i < 3; i += 1) {
      const yidaro = toHand(game, YIDARO);
      cycle(game, yidaro);
      expect(zone(game, yidaro)).toBe("library");
    }
  });

  it("the fourth cycle of any card named Yidaro puts it onto the battlefield instead", () => {
    const { game } = table();
    for (let i = 0; i < 3; i += 1) cycle(game, toHand(game, YIDARO));
    const fourth = toHand(game, YIDARO);
    const before = shuffles(game);
    cycle(game, fourth);
    expect(zone(game, fourth)).toBe("battlefield");
    expect(shuffles(game)).toBe(before);
  });

  it("counts only your own cycles", () => {
    const { game } = table();
    for (let i = 0; i < 3; i += 1) {
      // Bob cycles with priority passed to him, on Alice's turn.
      game.dispatch({ type: "pass-priority", player: A });
      cycle(game, toHand(game, YIDARO, B), B);
    }
    expect(game.state.priority.holder).toBe(A);
    const mine = toHand(game, YIDARO);
    cycle(game, mine);
    expect(zone(game, mine)).toBe("library");
  });

  it("gone from your graveyard: it stays where it is, and you still shuffle", () => {
    const { game } = table();
    const yidaro = toHand(game, YIDARO);
    const before = shuffles(game);
    cycle(game, yidaro, A, false);
    // The cycle trigger waits; the card is exiled in response.
    game.debugMove(yidaro, "exile");
    settle(game);
    expect(zone(game, yidaro)).toBe("exile");
    expect(shuffles(game)).toBe(before + 1);
  });
});
