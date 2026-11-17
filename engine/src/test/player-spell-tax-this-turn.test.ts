/**
 * "At the beginning of each player's draw step, that player may draw an
 * additional card. If they do, spells they cast this turn cost {2} more to
 * cast." (Academy Loremaster): an `each-player-may` of the active player's,
 * whose effect is theirs — so the tax, a `timed-static` `costModification`
 * with `caster: "you"`, is on the player who drew and nobody else, for the
 * turn (rule 601.2f), and only if they did draw.
 */

import { describe, expect, it } from "vitest";

import { activePlayerOf } from "../state.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, cast, hand, lands, nextTurn, pickModes, spawn, table, toHand, zone } from "./harness.js";

/** Can `player` cast Grizzly Bears ({1}{G}) with `forests` Forests? */
function bearsCast(game: Game, player: PlayerId, forests: number): boolean {
  lands(game, "Forest", forests, player);
  const bears = toHand(game, "Grizzly Bears", player);
  try {
    cast(game, bears, { player });
  } catch {
    return false;
  }
  return zone(game, bears) === "battlefield";
}

describe("Academy Loremaster", () => {
  it("you drew the extra card: your spells cost {2} more this turn", () => {
    const { game, a } = table();
    spawn(game, "Academy Loremaster");
    pickModes(a, 0);
    const before = hand(game).length;
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    expect(hand(game).length).toBe(before + 2);
    expect(bearsCast(game, A, 2)).toBe(false);
    expect(bearsCast(game, A, 2)).toBe(true);
  });

  it("declined: one card, no tax", () => {
    const { game } = table();
    spawn(game, "Academy Loremaster");
    const before = hand(game).length;
    nextTurn(game);
    nextTurn(game);
    expect(hand(game).length).toBe(before + 1);
    expect(bearsCast(game, A, 2)).toBe(true);
  });

  it("an opponent who draws pays it, and the controller doesn't", () => {
    const { game, b } = table();
    spawn(game, "Academy Loremaster");
    pickModes(b, 0);
    const before = hand(game, B).length;
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(hand(game, B).length).toBe(before + 2);
    expect(bearsCast(game, B, 2)).toBe(false);
    expect(bearsCast(game, B, 2)).toBe(true);
    // Alice's turn: she declined (her seat's default), and pays nothing.
    nextTurn(game);
    expect(bearsCast(game, A, 2)).toBe(true);
  });

  it("lasts the turn only", () => {
    const { game, a } = table();
    spawn(game, "Academy Loremaster");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(bearsCast(game, A, 2)).toBe(false);
    a.chooseModesFn = () => [];
    nextTurn(game);
    nextTurn(game);
    // The same two Forests, untapped again.
    expect(bearsCast(game, A, 0)).toBe(true);
  });
});
