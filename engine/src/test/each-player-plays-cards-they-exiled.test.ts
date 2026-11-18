/**
 * Shared Fate: "If a player would draw a card, that player exiles the top
 * card of one of their opponents' libraries face down instead. Each player
 * may look at cards they exiled with this enchantment, and they may play
 * lands and cast spells from among those cards." A draw replacement of any
 * player's (rule 614.1a) made by the drawing player (`as-player`), who
 * chooses the opponent; the card exiled face down (406.3), linked to the
 * enchantment (607.2a) and seen by its exiler; and a static `mayPlay` every
 * player holds (`eachPlayer`) over only the cards they exiled with it
 * (`exiledByYou`).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { viewFor } from "../view.js";
import { A, B, C, hand, lands, nextTurn, pickModes, settle, spawn, table, toLibrary, zone } from "./harness.js";

const FATE = "Shared Fate";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;
type Land = Extract<LegalAction, { kind: "play-land" }>;

const castOffer = (game: Game, card: ObjectId, player: PlayerId): Cast | undefined =>
  game.legalActions(player).find((a): a is Cast => a.kind === "cast-spell" && a.card === card);
const landOffer = (game: Game, card: ObjectId, player: PlayerId): Land | undefined =>
  game.legalActions(player).find((a): a is Land => a.kind === "play-land" && a.card === card);
const drawOne = (game: Game, player: PlayerId): void => {
  game.debugApplyEffect(player, { kind: "draw", amount: 1 });
  settle(game);
};
const sees = (game: Game, viewer: PlayerId, name: string): boolean =>
  JSON.stringify(viewFor(game.state, game.registry, viewer)).includes(name);

describe("each player plays the cards they exiled with it — Shared Fate", () => {
  it("a draw exiles the top of the opponent's library face down instead, for the drawing player to look at and cast", () => {
    const { game } = table();
    spawn(game, FATE);
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const held = hand(game, A).length;
    const libraryA = game.state.zones.perPlayer[A].library.length;
    drawOne(game, A);
    expect(hand(game, A)).toHaveLength(held);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(libraryA);
    expect(zone(game, bears)).toBe("exile");
    const card = game.state.objects[bears];
    expect(card.exiledByPlayer).toBe(A);
    expect(card.exiledFaceDown?.lookers).toEqual([A]);
    // Alice may look at it; Bob, whose card it is, may not.
    expect(sees(game, A, "Grizzly Bears")).toBe(true);
    expect(sees(game, B, "Grizzly Bears")).toBe(false);
    const offer = castOffer(game, bears, A);
    expect(offer).toBeDefined();
    game.dispatch({ type: "cast-spell", player: A, card: bears, targets: [], ...(offer?.via !== undefined ? { via: offer.via } : {}) });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });

  it("every player's draw, even the opponent's: each plays only the cards they exiled", () => {
    const { game } = table();
    spawn(game, FATE);
    const forestA = toLibrary(game, "Forest", A);
    nextTurn(game); // bob's draw step: he exiles the top of alice's library
    expect(zone(game, forestA)).toBe("exile");
    expect(game.state.objects[forestA].exiledByPlayer).toBe(B);
    game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === B);
    expect(landOffer(game, forestA, B)).toBeDefined();
    // Alice owns it and controls Shared Fate, but didn't exile it.
    expect(landOffer(game, forestA, A)).toBeUndefined();
    game.dispatch({ type: "play-land", player: B, card: forestA });
    settle(game);
    expect(zone(game, forestA)).toBe("battlefield");
    expect(game.state.objects[forestA].controller).toBe(B);
  });

  it("with every opponent's library empty, the draw is still replaced: nothing exiled, nothing drawn, nobody loses", () => {
    const { game } = table();
    spawn(game, FATE);
    for (const id of [...game.state.zones.perPlayer[B].library]) game.debugMove(id, "graveyard");
    const held = hand(game, A).length;
    const libraryA = game.state.zones.perPlayer[A].library.length;
    drawOne(game, A);
    expect(hand(game, A)).toHaveLength(held);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(libraryA);
    expect(game.state.zones.shared.exile).toHaveLength(0);
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("the drawing player chooses which opponent's library", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, FATE);
    const fromB = toLibrary(game, "Grizzly Bears", B);
    const fromC = toLibrary(game, "Llanowar Elves", C);
    pickModes(a, 1); // the second opponent in the list: carol
    drawOne(game, A);
    expect(zone(game, fromC)).toBe("exile");
    expect(zone(game, fromB)).toBe("library");
    expect(game.state.objects[fromC].exiledByPlayer).toBe(A);
  });

  it("once it leaves, the cards can't be played, and a new Shared Fate doesn't reach them (the ruling)", () => {
    const { game } = table();
    const fate = spawn(game, FATE);
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears", B);
    drawOne(game, A);
    expect(castOffer(game, bears, A)).toBeDefined();
    game.debugMove(fate, "graveyard");
    expect(castOffer(game, bears, A)).toBeUndefined();
    // Once allowed to look, alice may go on looking (rule 406.3).
    expect(sees(game, A, "Grizzly Bears")).toBe(true);
    spawn(game, FATE);
    expect(castOffer(game, bears, A)).toBeUndefined();
  });

  it("with two, the drawing player chooses which replaces the draw, and plays the card under that one", () => {
    const { game, a } = table();
    const first = spawn(game, FATE);
    const second = spawn(game, FATE);
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears", B);
    pickModes(a, 1);
    drawOne(game, A);
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[bears].exiledWith?.source).toBe(second);
    // The other one leaving changes nothing for it.
    game.debugMove(first, "graveyard");
    expect(castOffer(game, bears, A)).toBeDefined();
  });
});
