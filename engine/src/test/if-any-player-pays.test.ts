/**
 * "Then if any player pays {2}, discard three cards" (Rhystic Scrying): the
 * rhystic question with the effect on paying — `unless` of `"any-player"`
 * whose option's `ifPaid` is the discard, nothing otherwise. Each player in
 * turn order from the active player (rule 101.4), the next asked only once the
 * one before declines; whoever pays, the spell's controller discards.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, cast, graveyard, hand, lands, settle, table, toHand } from "./harness.js";

/** Run to `player`'s question, and pay (or not). */
const answer = (game: Game, player: PlayerId, pays: boolean): void => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || s.awaiting?.kind === "discard");
  const awaiting = game.state.awaiting as { kind: string; player: PlayerId } | null;
  expect(awaiting).toMatchObject({ kind: "choose-modes", player });
  game.dispatch({ type: "choose-modes", player, modes: pays ? [0] : [] });
};

describe("Rhystic Scrying", () => {
  const board = (players: 2 | 3 = 2) => {
    const { game } = table({ players, openingHandSize: 0, deck: "Island" });
    lands(game, "Island", 6);
    for (const p of [B, C].slice(0, players - 1)) lands(game, "Island", 2, p);
    const scrying = toHand(game, "Rhystic Scrying");
    cast(game, scrying, { settle: false });
    return { game, mine: hand(game, A).length, bobs: hand(game, B).length };
  };

  it("nobody pays: the caster keeps all three", () => {
    const { game, mine } = board();
    answer(game, A, false);
    answer(game, B, false);
    settle(game);
    expect(hand(game, A)).toHaveLength(mine + 3);
  });

  it("an opponent pays {2}: the caster discards three", () => {
    const { game, mine, bobs } = board();
    const yard = graveyard(game, A).length;
    answer(game, A, false);
    answer(game, B, true);
    settle(game);
    expect(hand(game, A)).toHaveLength(mine);
    // The three discarded and the Scrying itself.
    expect(graveyard(game, A)).toHaveLength(yard + 4);
    expect(hand(game, B)).toHaveLength(bobs);
  });

  it("the first to pay ends it: the players after aren't asked", () => {
    const { game, mine } = board(3);
    answer(game, A, false);
    answer(game, B, true);
    settle(game);
    expect(hand(game, A)).toHaveLength(mine);
    const tapped = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].controller === C && game.state.objects[id].tapped,
    );
    expect(tapped).toHaveLength(0);
  });
});
