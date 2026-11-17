/**
 * The `exile-top-contest` effect (Timesifter): each player exiles the top
 * card of their library; the one who exiled the greatest mana value gets the
 * effect's `then` ("takes an extra turn after this one", `take-extra-turn`'s
 * `who: "that-player"`); a tie sends only the tied players round again, until
 * it's broken (the card's rulings); a player who exiles nothing is out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, C, destroy, named, nextTurn, spawn, table, toLibrary } from "./harness.js";

/** `names` put on top of `player`'s library, the first topmost. */
const onTop = (game: Game, player: PlayerId, names: readonly string[]): void => {
  const library = game.state.zones.perPlayer[player].library;
  for (const name of [...names].reverse()) {
    const id = toLibrary(game, name, player);
    library.splice(library.indexOf(id), 1);
    library.unshift(id);
  }
};
const exiled = (game: Game, player: PlayerId): string[] =>
  game.state.zones.shared.exile
    .filter((id) => game.state.objects[id]?.owner === player)
    .map((id) => game.state.objects[id].cardName);

describe("exile-top-contest (Timesifter)", () => {
  it("the greatest mana value takes an extra turn after this one", () => {
    const { game } = table();
    spawn(game, "Timesifter");
    onTop(game, A, ["Hill Giant"]);
    onTop(game, B, ["Grizzly Bears"]);
    // Bob's upkeep: alice's Hill Giant (4) beats bob's Grizzly Bears (2).
    nextTurn(game, "draw");
    expect(activePlayerOf(game.state)).toBe(B);
    expect(exiled(game, A)).toEqual(["Hill Giant"]);
    expect(exiled(game, B)).toEqual(["Grizzly Bears"]);
    expect(game.state.extraTurns).toEqual([A]);
    // Then alice's extra turn, her own, and bob's.
    destroy(game, named(game, "Timesifter")[0]);
    const order: PlayerId[] = [];
    for (let i = 0; i < 3; i += 1) {
      nextTurn(game);
      order.push(activePlayerOf(game.state));
    }
    expect(order).toEqual([A, A, B]);
  });

  it("a tie: only the tied players exile again, until it's broken", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Timesifter");
    // Alice and bob tie at 4 (carol's Wastes is 0, and she's out), tie again
    // at 2, then bob's Hill Giant beats alice's Wastes.
    onTop(game, A, ["Hill Giant", "Grizzly Bears"]);
    onTop(game, B, ["Hill Giant", "Grizzly Bears", "Hill Giant"]);
    nextTurn(game, "draw");
    expect(exiled(game, C)).toEqual(["Wastes"]);
    expect(exiled(game, A).sort()).toEqual(["Grizzly Bears", "Hill Giant", "Wastes"]);
    expect(exiled(game, B).sort()).toEqual(["Grizzly Bears", "Hill Giant", "Hill Giant"]);
    expect(game.state.extraTurns).toEqual([B]);
  });

  it("a player who exiles nothing can't win: a library run out is out", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Timesifter");
    // Alice and carol tie at 4; then carol has nothing left to exile, and
    // alice's Wastes (0) wins alone.
    onTop(game, A, ["Hill Giant"]);
    onTop(game, B, ["Grizzly Bears"]);
    game.state.zones.perPlayer[C].library.length = 0;
    onTop(game, C, ["Hill Giant"]);
    nextTurn(game, "draw");
    expect(exiled(game, A).sort()).toEqual(["Hill Giant", "Wastes"]);
    expect(exiled(game, B)).toEqual(["Grizzly Bears"]);
    expect(exiled(game, C)).toEqual(["Hill Giant"]);
    expect(game.state.extraTurns).toEqual([A]);
  });
});
