/**
 * `each-player-may`'s `whoIf`: "each player **who controls four or fewer
 * lands** may search …" (Natural Balance) asks only the players it holds
 * for, each read as `"that-player"`, found before anyone answers; and a
 * per-player amount in the search ("X is five minus the number of lands
 * they control") is the searcher's own.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, cast, lands, named, table, toHand, zone } from "./harness.js";

const onField = (game: Game, name: string, player: PlayerId): number =>
  named(game, name, player).filter((id) => zone(game, id) === "battlefield").length;
const shuffles = (game: Game, player: PlayerId): number =>
  game.eventsOfType("library-shuffled").filter((e) => e.player === player).length;
/** As many as the search allows. */
const all = (_view: unknown, eligible: readonly string[], _min: number, max: number): readonly string[] =>
  eligible.slice(0, max);

describe("Natural Balance", () => {
  it("cuts six-plus to five, tops four-or-fewer up to five, and only searchers shuffle", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Forest", 7, A);
    lands(game, "Island", 2, B);
    lands(game, "Swamp", 5, C);
    const asked: PlayerId[] = [];
    for (const [seat, id] of [[a, A], [b, B], [c, C]] as const) {
      seat.chooseModesFn = () => {
        asked.push(id);
        return [0];
      };
      seat.chooseFromZoneFn = all as never;
    }
    cast(game, toHand(game, "Natural Balance"));
    // A had seven (counted after the sacrifice: five, not asked); B two; C five.
    expect(onField(game, "Forest", A)).toBe(5);
    expect(asked).toEqual([B]);
    // B searched for up to three, offered every Wastes, took three.
    expect(onField(game, "Wastes", B)).toBe(3);
    expect(onField(game, "Swamp", C)).toBe(5);
    expect(onField(game, "Wastes", C)).toBe(0);
    expect(shuffles(game, B)).toBe(1);
    expect(shuffles(game, A)).toBe(0);
    expect(shuffles(game, C)).toBe(0);
  });

  it("a player who declines doesn't search or shuffle", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 4, A);
    a.chooseModesFn = () => [0];
    a.chooseFromZoneFn = all as never;
    b.chooseModesFn = () => [];
    cast(game, toHand(game, "Natural Balance"));
    // A (four, after paying) searched for one; B, with none, declined.
    expect(onField(game, "Wastes", A)).toBe(1);
    expect(onField(game, "Wastes", B)).toBe(0);
    expect(shuffles(game, B)).toBe(0);
    expect(shuffles(game, A)).toBe(1);
  });
});
