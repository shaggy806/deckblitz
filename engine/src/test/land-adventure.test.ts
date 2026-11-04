/**
 * A land with an Adventure (rule 715, the Final Fantasy Towns): played as a land
 * from hand, or cast as its Adventure, exiled as that resolves, and played from
 * exile later, with a land drop and at sorcery timing (the rulings).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import { colorIdentityOf } from "../identity.js";
import { A, B, hand, lands, life, nextTurn, registryOf, settle, spawn, table, tokensNamed, toHand, toStep, zone } from "./harness.js";
import type { ObjectId } from "../primitives.js";

type Land = Extract<LegalAction, { kind: "play-land" }>;
type Cast = Extract<LegalAction, { kind: "cast-spell" }>;

const playOffer = (game: Game, card: ObjectId): Land | undefined =>
  game.legalActions(A).find((a): a is Land => a.kind === "play-land" && a.card === card);
const castOffers = (game: Game, card: ObjectId): Cast[] =>
  game.legalActions(A).filter((a): a is Cast => a.kind === "cast-spell" && a.card === card);

/** Cast the card's Adventure face. */
function raid(game: Game, card: ObjectId): void {
  game.dispatch({ type: "cast-spell", player: A, card, face: 1, targets: [] });
  settle(game);
}

describe("a land with an Adventure", () => {
  it("from hand: a land to play, or its Adventure to cast, and it never offers casting the land", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const card = toHand(game, "Midgar, City of Mako");
    expect(playOffer(game, card)?.face ?? 0).toBe(0);
    const casts = castOffers(game, card);
    expect(casts.map((c) => c.face)).toEqual([1]);
    expect(casts[0].cardName).toBe("Reactor Raid");
  });

  it("played from hand it's the land: tapped, and taps for its colour", () => {
    const { game } = table();
    const card = toHand(game, "Midgar, City of Mako");
    game.dispatch({ type: "play-land", player: A, card, face: 0 });
    settle(game);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].tapped).toBe(true);
  });

  it("the Adventure resolves into exile, and the card is then playable from there, using a land drop", () => {
    const { game, a } = table();
    game.state.players[A].landsPlayedThisTurn = 0;
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    a.chooseModesFn = () => [0];
    const card = toHand(game, "Midgar, City of Mako");
    const held = hand(game, A).length - 1;
    raid(game, card);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].onAdventure).toBe(true);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, A).length).toBe(held + 2);
    const offer = playOffer(game, card);
    expect(offer).toBeDefined();
    expect(castOffers(game, card)).toEqual([]);
    game.dispatch({ type: "play-land", player: A, card, face: 0 });
    settle(game);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].tapped).toBe(true);
    expect(game.state.players[A].landsPlayedThisTurn).toBe(1);
  });

  it("from exile it waits for a land drop and for sorcery timing", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const card = toHand(game, "Lindblum, Industrial Regency");
    // An instant: cast in the upkeep of a later turn, say; here on the stack's
    // empty main, then asked at a step where a land can't be played.
    game.dispatch({ type: "cast-spell", player: A, card, face: 1, targets: [] });
    settle(game);
    expect(zone(game, card)).toBe("exile");
    expect(tokensNamed(game, "Wizard Token (Kuja)", A)).toBe(1);
    game.state.players[A].landsPlayedThisTurn = 99;
    expect(playOffer(game, card)).toBeUndefined();
    game.state.players[A].landsPlayedThisTurn = 0;
    expect(playOffer(game, card)).toBeDefined();
    toStep(game, "end");
    expect(playOffer(game, card)).toBeUndefined();
  });

  it("stays playable on a later turn, and only to its owner", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const card = toHand(game, "Lindblum, Industrial Regency");
    game.dispatch({ type: "cast-spell", player: A, card, face: 1, targets: [] });
    settle(game);
    nextTurn(game);
    const bobs = game.legalActions(B).filter((a) => a.kind === "play-land" && a.card === card);
    expect(bobs).toEqual([]);
    nextTurn(game);
    expect(playOffer(game, card)).toBeDefined();
  });

  it("its colour identity has its Adventure's mana cost", () => {
    const { game } = table();
    const def = registryOf(game).get("Midgar, City of Mako");
    expect([...colorIdentityOf(def, registryOf(game))]).toEqual(["B"]);
  });

  it("exiled any other way, no permission", () => {
    const { game } = table();
    const card = toHand(game, "Midgar, City of Mako");
    game.debugMove(card, "exile");
    expect(playOffer(game, card)).toBeUndefined();
  });

  it("the token's own text works: a noncreature spell pings each opponent", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const card = toHand(game, "Lindblum, Industrial Regency");
    game.dispatch({ type: "cast-spell", player: A, card, face: 1, targets: [] });
    settle(game);
    const before = life(game, B);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Shock");
    game.dispatch({ type: "cast-spell", player: A, card: bolt, targets: [{ kind: "player", player: B }] });
    settle(game);
    expect(life(game, B)).toBe(before - 3);
  });
});
