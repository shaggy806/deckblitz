/**
 * "Exchange your hand and library, then shuffle" (Mordenkainen's −10):
 * `exchange-hand-and-library` — every card of the hand into the library and
 * every card of the library into the hand at once (rule 701.12d), even with
 * one of them empty (701.12f), and not a draw (its ruling).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, hand, loyalty, pt, spawn, table, toHand, tokensNamed, named } from "./harness.js";

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
