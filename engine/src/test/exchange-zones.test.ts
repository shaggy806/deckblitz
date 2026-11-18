/**
 * `exchange-zones` — every card of one of a player's zones into the other and
 * every card of the other into the first, at once (rule 701.12d), even with
 * one of them empty (701.12f): "exchange your hand and library, then shuffle"
 * (Mordenkainen's −10; not a draw, its ruling), "exchange your graveyard and
 * library. Then shuffle your library" (Morality Shift) and "exchange your hand
 * and graveyard" (Harness Infinity; not a discard, its ruling).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, graveyard, hand, lands, loyalty, pt, spawn, table, toGraveyard, toHand, tokensNamed, named } from "./harness.js";

const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;
const drawn = (game: Game, since: number): number =>
  game.state.eventLog.filter((e) => e.seq >= since && e.type === "card-drawn").length;

describe("exchange your hand and library", () => {
  it("Mordenkainen −10: the hand and library change places, nothing drawn, then an emblem", () => {
    const { game } = table();
    const mordenkainen = spawn(game, "Mordenkainen");
    const bolt = toHand(game, "Lightning Bolt");
    const handBefore = [...hand(game)];
    const libraryBefore = [...library(game)];
    expect(libraryBefore.length).toBeGreaterThan(0);
    const since = game.state.eventSeq;
    loyalty(game, mordenkainen, -10, { atLeast: 10 });
    expect([...hand(game)].sort()).toEqual([...libraryBefore].sort());
    expect([...library(game)].sort()).toEqual([...handBefore].sort());
    expect(library(game)).toContain(bolt);
    expect(drawn(game, since)).toBe(0);
    expect(game.state.emblems.filter((e) => e.owner === A)).toHaveLength(1);
  });

  it("Mordenkainen −10: with an empty hand the library still goes to it", () => {
    const { game } = table();
    const mordenkainen = spawn(game, "Mordenkainen");
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    const libraryBefore = library(game).length;
    loyalty(game, mordenkainen, -10, { atLeast: 10 });
    expect(hand(game)).toHaveLength(libraryBefore);
    expect(library(game)).toHaveLength(0);
  });

  it("Mordenkainen −2: a Dog Illusion twice the cards in your hand, as the hand changes", () => {
    const { game } = table();
    const mordenkainen = spawn(game, "Mordenkainen");
    loyalty(game, mordenkainen, -2);
    expect(tokensNamed(game, "Dog Illusion Token")).toBe(1);
    const dog = named(game, "Dog Illusion Token")[0];
    const n = hand(game).length;
    expect(pt(game, dog)).toEqual({ power: 2 * n, toughness: 2 * n });
    toHand(game, "Lightning Bolt");
    expect(pt(game, dog)).toEqual({ power: 2 * (n + 1), toughness: 2 * (n + 1) });
  });
});

describe("exchange your graveyard and library", () => {
  it("Morality Shift: the graveyard becomes the library, shuffled, and the library the graveyard", () => {
    const { game } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    const bears = toGraveyard(game, "Grizzly Bears");
    const libraryBefore = [...library(game)];
    expect(libraryBefore.length).toBeGreaterThan(2);
    lands(game, "Swamp", 7);
    const shift = toHand(game, "Morality Shift");
    const since = game.state.eventSeq;
    cast(game, shift);
    expect([...library(game)].sort()).toEqual([bolt, bears].sort());
    expect([...graveyard(game)].sort()).toEqual([...libraryBefore, shift].sort());
    // The library's cards arrive as one event, not one each; nobody mills.
    const arrivals = game.state.eventLog.filter((e) => e.seq >= since && e.type === "cards-put-into-graveyard");
    expect(arrivals.some((e) => e.type === "cards-put-into-graveyard" && e.arrivals.length === libraryBefore.length)).toBe(true);
    expect(game.state.eventLog.some((e) => e.seq >= since && e.type === "card-drawn")).toBe(false);
  });

  it("Morality Shift: with an empty graveyard, the library still goes (and nothing is left to draw)", () => {
    const { game } = table();
    const libraryBefore = [...library(game)];
    lands(game, "Swamp", 7);
    cast(game, toHand(game, "Morality Shift"));
    expect(library(game)).toHaveLength(0);
    expect(graveyard(game)).toEqual(expect.arrayContaining(libraryBefore));
  });
});

describe("exchange your hand and graveyard", () => {
  it("Harness Infinity: hand to graveyard and graveyard to hand, not discarded, then it exiles itself", () => {
    const { game } = table();
    for (const id of [...hand(game)]) game.debugMove(id, "library");
    const bolt = toHand(game, "Lightning Bolt");
    const giant = toHand(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    lands(game, "Forest", 3);
    const harness = toHand(game, "Harness Infinity");
    const since = game.state.eventSeq;
    cast(game, harness);
    expect([...hand(game)]).toEqual([bears]);
    expect([...graveyard(game)].sort()).toEqual([bolt, giant].sort());
    expect(game.state.objects[harness].zone).toBe("exile");
    expect(game.state.eventLog.some((e) => e.seq >= since && e.type === "cards-discarded")).toBe(false);
  });

  it("Harness Infinity: an empty hand still takes the graveyard", () => {
    const { game } = table();
    for (const id of [...hand(game)]) game.debugMove(id, "library");
    const bears = toGraveyard(game, "Grizzly Bears");
    const wurm = toGraveyard(game, "Craw Wurm");
    lands(game, "Swamp", 4);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Harness Infinity"));
    expect([...hand(game)].sort()).toEqual([bears, wurm].sort());
    expect(graveyard(game)).toEqual([]);
  });
});
