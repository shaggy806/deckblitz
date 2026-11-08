/**
 * Two target players each search their own library for a card and put it on top:
 * `for-each-target` over `search-library` of `who: { controllerOf }`. Each
 * chooses for themselves, in APNAP order however they were targeted (rule 101.4),
 * and each shuffles.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, lands, ref, table, toHand, toLibrary } from "./harness.js";

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
/** The top of a library: `toLibrary` puts a card here, and a draw takes it. */
const topOf = (game: Game, player: PlayerId): string => {
  const cards = library(game, player);
  return game.state.objects[cards[0]].cardName;
};
const shuffles = (game: Game, player: PlayerId): number =>
  game.eventsOfType("library-shuffled").filter((e) => e.player === player).length;

describe("Scheming Symmetry", () => {
  it("each target player puts the card they choose on top, after shuffling", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Swamp", 1);
    const giant = toLibrary(game, "Hill Giant", B);
    const bears = toLibrary(game, "Grizzly Bears", C);
    // The chosen cards start buried: another card goes on top of each.
    toLibrary(game, "Plains", B);
    toLibrary(game, "Plains", C);
    b.chooseFromZoneFn = () => [giant];
    c.chooseFromZoneFn = () => [bears];
    const before = library(game, A).length;
    a.chooseFromZoneFn = () => {
      throw new Error("alice isn't searching");
    };
    cast(game, toHand(game, "Scheming Symmetry"), { targets: [ref(B), ref(C)] });
    expect(topOf(game, B)).toBe("Hill Giant");
    expect(topOf(game, C)).toBe("Grizzly Bears");
    expect(shuffles(game, B)).toBe(1);
    expect(shuffles(game, C)).toBe(1);
    expect(shuffles(game, A)).toBe(0);
    expect(library(game, A).length).toBe(before);
  });

  it("offers each player their own library only, every card of it", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 1);
    const mine = toLibrary(game, "Hill Giant", A);
    const hers = toLibrary(game, "Grizzly Bears", B);
    let offeredA: readonly ObjectId[] = [];
    let offeredB: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offeredA = eligible;
      return [mine];
    };
    b.chooseFromZoneFn = (_view, eligible) => {
      offeredB = eligible;
      return [hers];
    };
    cast(game, toHand(game, "Scheming Symmetry"), { targets: [ref(A), ref(B)] });
    expect(offeredA).toContain(mine);
    expect(offeredA).not.toContain(hers);
    expect(offeredB).toContain(hers);
    expect(offeredB).not.toContain(mine);
    expect(offeredA.length).toBeGreaterThan(1);
    expect(topOf(game, A)).toBe("Hill Giant");
    expect(topOf(game, B)).toBe("Grizzly Bears");
  });

  it("asks in APNAP order however they were targeted (rule 101.4)", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Swamp", 1);
    const order: PlayerId[] = [];
    const note = (player: PlayerId) => (_view: unknown, eligible: readonly ObjectId[]) => {
      order.push(player);
      return eligible.slice(0, 1);
    };
    a.chooseFromZoneFn = note(A);
    b.chooseFromZoneFn = note(B);
    c.chooseFromZoneFn = note(C);
    cast(game, toHand(game, "Scheming Symmetry"), { targets: [ref(C), ref(A)] });
    expect(order).toEqual([A, C]);
  });

  it("can't target one player twice", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    expect(() => cast(game, toHand(game, "Scheming Symmetry"), { targets: [ref(B), ref(B)] })).toThrow();
  });
});
