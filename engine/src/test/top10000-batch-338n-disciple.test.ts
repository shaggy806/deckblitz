/**
 * B338 (decisions lane, agent n): Disciple of Caelus Nin (need key
 * effect:each-player-chooses-permanents-rest-phase-out) — `sacrifice-all-but`
 * with `startingWithYou`, `rest: "phase-out"` and `exceptSource`, and a static
 * `phase-in` prohibition over every object ("Permanents can't phase in").
 */

import { describe, expect, it } from "vitest";

import type { PlayerId } from "../primitives.js";
import { A, B, destroy, enter, lands, nextTurn, spawn, table, zone } from "./harness.js";

describe("Disciple of Caelus Nin", () => {
  it("starting with its controller, each player keeps up to five; everything else but the Disciple phases out", () => {
    const { game, a, b } = table();
    const mine = lands(game, "Plains", 7);
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B), spawn(game, "Forest", B)];
    // On Bob's turn, so "starting with you" isn't the active player's order.
    nextTurn(game);
    expect(game.state.turnOrder[game.state.turn.activePlayerIndex]).toBe(B);
    const order: PlayerId[] = [];
    let offered: { min: number; max: number } | undefined;
    a.choosePermanentsFn = (_view, _eligible, min, max) => {
      order.push(A);
      offered = { min, max };
      return mine.slice(0, 5);
    };
    b.choosePermanentsFn = () => {
      order.push(B);
      return [theirs[1]];
    };
    const disciple = enter(game, "Disciple of Caelus Nin");
    expect(order).toEqual([A, B]);
    expect(offered).toEqual({ min: 0, max: 5 });
    expect(zone(game, disciple)).toBe("battlefield");
    expect(mine.slice(0, 5).every((id) => zone(game, id) === "battlefield")).toBe(true);
    expect(mine.slice(5).every((id) => zone(game, id) === "phased-out")).toBe(true);
    expect(zone(game, theirs[0])).toBe("phased-out");
    expect(zone(game, theirs[1])).toBe("battlefield");
    expect(zone(game, theirs[2])).toBe("phased-out");
  });

  it("holds them phased out through untap steps, and lets them phase in once it's gone", () => {
    const { game, a } = table();
    const mine = lands(game, "Plains", 3);
    a.choosePermanentsFn = () => [mine[0]];
    const disciple = enter(game, "Disciple of Caelus Nin");
    expect(zone(game, mine[1])).toBe("phased-out");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turnOrder[game.state.turn.activePlayerIndex]).toBe(A);
    expect(zone(game, mine[1])).toBe("phased-out");
    expect(zone(game, mine[2])).toBe("phased-out");
    destroy(game, disciple);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, mine[1])).toBe("battlefield");
    expect(zone(game, mine[2])).toBe("battlefield");
  });
});
