/**
 * "For each creature exiled this way, its controller searches their library
 * for a basic land card. Those players put those cards onto the battlefield
 * tapped, then shuffle" (Winds of Abandon): a `for-each-player` of
 * `whoseAmount` — only the players one or more of whose creatures went — each
 * searching once for as many basic lands as they lost creatures (a
 * `search-library`'s amount read for its searcher).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, D, grant, lands, named, ref, spawn, table, toHand, zone } from "./harness.js";

const shuffles = (game: Game, player: PlayerId): number =>
  game.eventsOfType("library-shuffled").filter((e) => e.player === player).length;

/** The basic lands `player` has out; every deck is all Wastes. */
const wastes = (game: Game, player: PlayerId): ObjectId[] =>
  named(game, "Wastes", player).filter((id) => zone(game, id) === "battlefield");

const asMany = (_view: unknown, eligible: readonly string[], _min: number, max: number): readonly string[] =>
  eligible.slice(0, max);

describe("Winds of Abandon", () => {
  it("exiles the target; its controller finds one basic land, tapped, and only they shuffle", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    let maxOffered = -1;
    b.chooseFromZoneFn = ((v: unknown, eligible: readonly string[], min: number, max: number) => {
      maxOffered = max;
      return asMany(v, eligible, min, max);
    }) as never;
    a.chooseFromZoneFn = asMany as never;
    cast(game, toHand(game, "Winds of Abandon"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(maxOffered).toBe(1);
    const found = wastes(game, B);
    expect(found).toHaveLength(1);
    expect(game.state.objects[found[0]].tapped).toBe(true);
    expect(shuffles(game, B)).toBe(1);
    expect(shuffles(game, A)).toBe(0);
    expect(wastes(game, A)).toHaveLength(0);
  });

  it("can't target a creature you control", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const mine = spawn(game, "Grizzly Bears", A);
    expect(() => cast(game, toHand(game, "Winds of Abandon"), { targets: [ref(mine)] })).toThrow(/target/i);
  });

  it("overloaded: every creature you don't control, hexproof too; each controller searches once for that many", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    lands(game, "Plains", 6);
    const mine = spawn(game, "Grizzly Bears", A);
    const bs = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    grant(game, bs[1], "hexproof");
    const cs = spawn(game, "Grizzly Bears", C);
    const searches: Record<string, number[]> = {};
    for (const [seat, player] of [
      [a, A],
      [b, B],
      [c, C],
      [d, D],
    ] as const) {
      seat.chooseFromZoneFn = ((v: unknown, eligible: readonly string[], min: number, max: number) => {
        (searches[player] ??= []).push(max);
        return asMany(v, eligible, min, max);
      }) as never;
    }
    cast(game, toHand(game, "Winds of Abandon"), { overload: true });
    expect(zone(game, mine)).toBe("battlefield");
    for (const id of [...bs, cs]) expect(zone(game, id)).toBe("exile");
    expect(searches).toEqual({ [B]: [2], [C]: [1] });
    expect(wastes(game, B)).toHaveLength(2);
    expect(wastes(game, C)).toHaveLength(1);
    for (const id of [...wastes(game, B), ...wastes(game, C)]) expect(game.state.objects[id].tapped).toBe(true);
    expect(wastes(game, D)).toHaveLength(0);
    expect(shuffles(game, B)).toBe(1);
    expect(shuffles(game, C)).toBe(1);
    // Nobody of D's or alice's went: no search, no shuffle.
    expect(shuffles(game, D)).toBe(0);
    expect(shuffles(game, A)).toBe(0);
  });
});
