/**
 * A draw replaced by exiling the top card of the library face down, linked
 * to the permanent (rules 614.1a, 614.6, 406.3, 607.2a): Asmodeus the
 * Archfiend's "if you would draw a card, exile the top card of your library
 * face down instead", and its "return all cards exiled with Asmodeus to
 * their owner's hand and you lose that much life".
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, hand, lands, life, nextTurn, spawn, table, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import { viewFor } from "../view.js";

const ASMODEUS = "Asmodeus the Archfiend";
const library = (game: Game, player = A): number => game.state.zones.perPlayer[player].library.length;
const exiled = (game: Game) => game.state.zones.shared.exile.map((id) => game.state.objects[id]);

describe("Asmodeus the Archfiend", () => {
  it("draw seven is seven cards exiled face down, none drawn", () => {
    const { game } = table();
    const asmodeus = spawn(game, ASMODEUS);
    lands(game, "Swamp", 3);
    const top = toLibrary(game, "Grizzly Bears");
    const before = { hand: hand(game).length, library: library(game) };
    activate(game, asmodeus, 0);
    expect(hand(game)).toHaveLength(before.hand);
    expect(library(game)).toBe(before.library - 7);
    expect(exiled(game)).toHaveLength(7);
    expect(exiled(game).every((o) => o.exiledFaceDown !== undefined && o.exiledFaceDown.lookers.length === 0)).toBe(true);
    expect(zone(game, top)).toBe("exile");
    // Nobody may look, the player who exiled them included.
    for (const seat of [A, B]) {
      const seen = JSON.stringify(viewFor(game.state, game.registry, seat));
      expect(seen.includes("Grizzly Bears")).toBe(false);
    }
  });

  it("returns every card exiled with it to its owner's hand, and its controller loses that much life", () => {
    const { game } = table();
    const asmodeus = spawn(game, ASMODEUS);
    lands(game, "Swamp", 4);
    activate(game, asmodeus, 0);
    const before = hand(game).length;
    activate(game, asmodeus, 1);
    expect(hand(game)).toHaveLength(before + 7);
    expect(exiled(game)).toHaveLength(0);
    expect(life(game)).toBe(13);
    // With nothing exiled: nothing returned, no life lost.
    lands(game, "Swamp", 1);
    activate(game, asmodeus, 1);
    expect(life(game)).toBe(13);
  });

  it("replaces the turn's own draw, and only its controller's", () => {
    const { game } = table();
    spawn(game, ASMODEUS);
    const before = { a: hand(game).length, b: hand(game, B).length };
    nextTurn(game); // bob's turn: he draws
    expect(hand(game, B)).toHaveLength(before.b + 1);
    nextTurn(game); // alice's: her draw is exiled instead
    expect(hand(game)).toHaveLength(before.a);
    expect(exiled(game)).toHaveLength(1);
    expect(exiled(game)[0].owner).toBe(A);
  });

  it("with an empty library exiles nothing, and the player doesn't lose for the draw (the ruling)", () => {
    const { game } = table();
    const asmodeus = spawn(game, ASMODEUS);
    lands(game, "Swamp", 3);
    const cards = [...game.state.zones.perPlayer[A].library];
    for (const id of cards.slice(2)) game.debugMove(id, "graveyard");
    activate(game, asmodeus, 0);
    expect(exiled(game)).toHaveLength(2);
    expect(library(game)).toBe(0);
    expect(game.state.players[A].hasLost).toBe(false);
    expect(game.state.result.over).toBe(false);
  });

  it("a new Asmodeus has no connection to the cards an earlier one exiled (the ruling)", () => {
    const { game } = table();
    const first = spawn(game, ASMODEUS);
    lands(game, "Swamp", 4);
    activate(game, first, 0);
    game.debugMove(first, "graveyard");
    const second = spawn(game, ASMODEUS);
    const before = hand(game).length;
    activate(game, second, 1);
    expect(hand(game)).toHaveLength(before);
    expect(exiled(game)).toHaveLength(7);
    expect(life(game)).toBe(20);
  });
});
