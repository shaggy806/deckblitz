/**
 * Mirror-Mad Phantasm: "{1}{U}: This creature's owner shuffles it into their
 * library. If that player does, they reveal cards from the top of that
 * library until a card named Mirror-Mad Phantasm is revealed. The player puts
 * that card onto the battlefield and all other cards revealed this way into
 * their graveyard." `shuffle-into-library` now logs what it shuffled in
 * (`cards-shuffled-into-library`, a token too), for the `this-way` "if that
 * player does"; `reveal-until`'s `whose: { ownerOf: "source" }` reads its
 * owner's library, whoever controls it.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, activate, graveyard, lands, named, ref, settle, spawn, table, zone } from "./harness.js";

const PHANTASM = "Mirror-Mad Phantasm";
const library = (game: Game, player: PlayerId = A): readonly string[] => game.state.zones.perPlayer[player].library;

describe("reveal until, in the source's owner's library — Mirror-Mad Phantasm", () => {
  it("shuffled in, then found again: everything revealed above it goes to the graveyard", () => {
    const { game } = table();
    const phantasm = spawn(game, PHANTASM);
    lands(game, "Island", 2);
    const before = library(game).length;
    activate(game, phantasm, 0);
    const back = named(game, PHANTASM, A);
    expect(back).toHaveLength(1);
    expect(zone(game, back[0])).toBe("battlefield");
    // The library it went into, less the cards above it, which went to the
    // graveyard: every card is accounted for.
    expect(library(game).length + graveyard(game).length).toBe(before);
    expect(graveyard(game).every((id) => game.state.objects[id].cardName !== PHANTASM)).toBe(true);
  });

  it("its owner's library and battlefield, whoever controls it (the ruling)", () => {
    const { game } = table();
    const phantasm = spawn(game, PHANTASM, B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(phantasm)]);
    settle(game);
    expect(game.state.objects[phantasm].controller).toBe(A);
    lands(game, "Island", 2);
    const mine = library(game, A).length;
    const theirs = library(game, B).length;
    activate(game, phantasm, 0);
    const back = named(game, PHANTASM);
    expect(back).toHaveLength(1);
    expect(zone(game, back[0])).toBe("battlefield");
    expect(game.state.objects[back[0]].controller).toBe(B);
    expect(library(game, A)).toHaveLength(mine);
    expect(library(game, B).length + graveyard(game, B).length).toBe(theirs);
  });

  it("a token finds no card of its name: the whole library goes to the graveyard (the ruling)", () => {
    const { game } = table();
    const phantasm = spawn(game, PHANTASM);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, who: "you" }, [ref(phantasm)]);
    settle(game);
    const token = named(game, PHANTASM).find((id) => game.state.objects[id].isToken === true);
    expect(token).toBeDefined();
    // The card itself is elsewhere: out of the library.
    game.debugMove(phantasm, "exile");
    lands(game, "Island", 2);
    const before = library(game).length;
    activate(game, token!, 0);
    expect(library(game)).toHaveLength(0);
    expect(graveyard(game)).toHaveLength(before);
    expect(game.state.zones.shared.battlefield.some((id) => game.state.objects[id].cardName === PHANTASM)).toBe(false);
  });

  it("gone before it resolves: not shuffled in, so nothing is revealed", () => {
    const { game } = table();
    const phantasm = spawn(game, PHANTASM);
    lands(game, "Island", 2);
    activate(game, phantasm, 0, { settle: false });
    game.debugMove(phantasm, "exile");
    const before = library(game).length;
    settle(game);
    expect(zone(game, phantasm)).toBe("exile");
    expect(graveyard(game)).toHaveLength(0);
    expect(library(game)).toHaveLength(before);
  });
});
