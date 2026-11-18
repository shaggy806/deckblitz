/**
 * "Choose three cards in each graveyard. Their owners shuffle those cards
 * into their libraries" (The Three Seasons' chapter III): a `for-each-player`
 * of `look-and-choose` `from: "that-player"`, `destination: "stay"`, then
 * `put-on-libraries` of `{ inGraveyards: { thisWay: "chosen" } }` with
 * `position: "shuffle"` — only the chosen cards go, and only their owners
 * shuffle.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, graveyard, ref, settle, spawn, table, toGraveyard, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId, PlayerId } from "../primitives.js";

/** A The Three Seasons of alice's with two lore counters, its chapter I
 * (milling three Wastes) already resolved. */
function seasonsAtTwo(game: Game): ObjectId {
  const seasons = spawn(game, "The Three Seasons", A);
  settle(game);
  game.state.objects[seasons].counters = { lore: 2 };
  return seasons;
}

/** Its third lore counter: chapter III triggers and resolves. */
function chapterThree(game: Game, seasons: ObjectId): void {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(seasons)]);
  settle(game);
}

/** The seat picks, from each graveyard asked about, those of `wanted` there
 * (three at most), recording what each question offered. */
function chooseAmong(seat: ScriptedController, wanted: readonly ObjectId[]): (readonly ObjectId[])[] {
  const offers: (readonly ObjectId[])[] = [];
  seat.chooseFromZoneFn = (_view, eligible) => {
    offers.push(eligible);
    return wanted.filter((id) => eligible.includes(id)).slice(0, 3);
  };
  return offers;
}

const libraryOf = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("The Three Seasons: three chosen cards in each graveyard shuffled into their owners' libraries", () => {
  it("shuffles only the chosen three of each graveyard, and all of a smaller one", () => {
    const { game, a } = table({ players: 3 });
    const seasons = seasonsAtTwo(game);
    const alices = ["Hill Giant", "Grizzly Bears", "Lightning Bolt", "Island"].map((n) => toGraveyard(game, n, A));
    const bobs = ["Hill Giant", "Grizzly Bears", "Lightning Bolt", "Island", "Forest"].map((n) => toGraveyard(game, n, B));
    const carols = [toGraveyard(game, "Hill Giant", C)];
    const offers = chooseAmong(a, [alices[0], alices[1], alices[2], bobs[1], bobs[3], bobs[4], carols[0]]);
    chapterThree(game, seasons);
    // Alice was asked about each graveyard, in turn order from her own.
    expect(offers.map((offer) => offer.includes(alices[0]) || offer.includes(bobs[0]) || offer.includes(carols[0]))).toEqual([
      true,
      true,
      true,
    ]);
    for (const id of alices.slice(0, 3)) expect(zone(game, id)).toBe("library");
    expect(zone(game, alices[3])).toBe("graveyard");
    for (const id of [bobs[1], bobs[3], bobs[4]]) expect(zone(game, id)).toBe("library");
    for (const id of [bobs[0], bobs[2]]) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, carols[0])).toBe("library");
    // Each card went to its owner's library.
    expect(libraryOf(game, B)).toContain(bobs[1]);
    expect(libraryOf(game, C)).toContain(carols[0]);
  });

  it("doesn't shuffle the library of a player with an empty graveyard", () => {
    const { game, a } = table();
    const seasons = seasonsAtTwo(game);
    const giant = toGraveyard(game, "Hill Giant", A);
    const bobLibrary = [...libraryOf(game, B)];
    chooseAmong(a, [giant, ...graveyard(game, A)]);
    const shuffled = (): number =>
      game.state.eventLog.filter((e) => e.type === "library-shuffled" && e.player === B).length;
    const before = shuffled();
    chapterThree(game, seasons);
    expect(zone(game, giant)).toBe("library");
    expect(shuffled()).toBe(before);
    expect(libraryOf(game, B)).toEqual(bobLibrary);
  });
});
