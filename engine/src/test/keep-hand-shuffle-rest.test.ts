/**
 * `sacrifice-all-but` `fromHand` with `rest: "shuffle-into-library"`: "each
 * player chooses up to seven cards in their hand, then shuffles the rest into
 * their library" (Worldpurge). Each player chooses in turn order from their
 * own hand, hidden from the others (rule 101.4a), and then every hand's rest
 * goes in at once and every library is shuffled.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, cast, lands, spawn, table, toHand } from "./harness.js";

const hand = (game: Game, player: PlayerId): readonly string[] => game.state.zones.perPlayer[player].hand;
const library = (game: Game, player: PlayerId): number => game.state.zones.perPlayer[player].library.length;
const shuffles = (game: Game, player: PlayerId): number =>
  game.eventsOfType("library-shuffled").filter((e) => e.player === player).length;

describe("Worldpurge", () => {
  it("returns every permanent, keeps up to seven of each hand, and shuffles the rest in", () => {
    const { game, a, b } = table({ openingHandSize: 0 });
    lands(game, "Plains", 8, A);
    spawn(game, "Grizzly Bears", B);
    for (let i = 0; i < 3; i++) toHand(game, "Wastes", B);
    const offered: Record<string, number> = {};
    let bSawA: readonly string[] | undefined;
    a.chooseFromZoneFn = ((_v: unknown, eligible: readonly string[]) => {
      offered.A = eligible.length;
      // What B is shown of A's choice: none of A's hand.
      const awaiting = game.viewFor(B).awaiting;
      if (awaiting?.kind === "choose-from-zone") bSawA = awaiting.eligible;
      return eligible.slice(0, 7);
    }) as never;
    b.chooseFromZoneFn = ((_v: unknown, eligible: readonly string[]) => {
      offered.B = eligible.length;
      return eligible.slice(0, 1);
    }) as never;
    const libraryA = library(game, A);
    const libraryB = library(game, B);
    // Each drew for the turn already.
    const handA = hand(game, A).length;
    cast(game, toHand(game, "Worldpurge"));
    // A's eight Plains came back; B's Bears and three Wastes are four.
    expect(offered).toEqual({ A: handA + 8, B: 4 });
    expect(bSawA).toEqual([]);
    expect(hand(game, A).length).toBe(7);
    expect(library(game, A)).toBe(libraryA + handA + 1);
    expect(hand(game, B).length).toBe(1);
    expect(library(game, B)).toBe(libraryB + 3);
    expect(shuffles(game, A)).toBe(1);
    expect(shuffles(game, B)).toBe(1);
    expect(game.state.zones.shared.battlefield.length).toBe(0);
  });

  it("an empty hand still shuffles, and up to seven may keep fewer", () => {
    const { game, a } = table({ openingHandSize: 0 });
    lands(game, "Plains", 8, A);
    a.chooseFromZoneFn = () => [];
    const libraryA = library(game, A);
    const handA = hand(game, A).length;
    cast(game, toHand(game, "Worldpurge"));
    expect(hand(game, A).length).toBe(0);
    expect(library(game, A)).toBe(libraryA + handA + 8);
    expect(shuffles(game, B)).toBe(1);
  });
});
