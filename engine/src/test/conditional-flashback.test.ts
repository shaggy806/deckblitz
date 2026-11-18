/**
 * A card's way to cast itself from its graveyard that holds only while a
 * condition does:
 * - Viral Spawning's corrupted flashback — "as long as an opponent has three
 *   or more poison counters and this card is in your graveyard, it has
 *   flashback {2}{G}" (`flashback.if`): cast with it only then, and "a card
 *   with flashback" only then, in its owner's graveyard;
 * - Glimpse the Cosmos's "as long as you control a Giant, you may cast this
 *   card from your graveyard by paying {U} rather than paying its mana cost"
 *   (`mayPlaySelf` with `if`, `byPaying`, `exileAfter`).
 *
 * Proving cards: Viral Spawning, Glimpse the Cosmos.
 */

import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, graveyard, hand, lands, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

const graveyardCasts = (game: Game, card: ObjectId, via: string) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === via);
const hasFlashback = (game: Game, id: ObjectId): boolean =>
  matchesFilter(game.state, game.registry, id, { hasKeyword: "flashback" }, { you: A, source: id });
const tokens = (game: Game, name: string): number =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === name).length;

describe("Viral Spawning — a corrupted flashback", () => {
  it("has no flashback, and no graveyard cast, while no opponent has three poison counters", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const spawning = toGraveyard(game, "Viral Spawning");
    game.state.players[B].counters.poison = 2;
    expect(graveyardCasts(game, spawning, "flashback")).toHaveLength(0);
    expect(hasFlashback(game, spawning)).toBe(false);
  });

  it("with three, it's cast from the graveyard for {2}{G}, makes its Beast and is exiled", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const spawning = toGraveyard(game, "Viral Spawning");
    game.state.players[B].counters.poison = 3;
    expect(hasFlashback(game, spawning)).toBe(true);
    expect(graveyardCasts(game, spawning, "flashback")).toHaveLength(1);
    cast(game, spawning, { via: "flashback" });
    expect(tokens(game, "Phyrexian Beast Token")).toBe(1);
    expect(zone(game, spawning)).toBe("exile");
  });

  it("is a card with flashback only in its owner's graveyard: not in a library", () => {
    const { game } = table();
    const spawning = toLibrary(game, "Viral Spawning");
    game.state.players[B].counters.poison = 3;
    expect(hasFlashback(game, spawning)).toBe(false);
  });
});

describe("Glimpse the Cosmos — cast from the graveyard for {U} while you control a Giant", () => {
  it("not without a Giant; with one, for {U}, then exiled instead of put into the graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const glimpse = toGraveyard(game, "Glimpse the Cosmos");
    expect(graveyardCasts(game, glimpse, "graveyard-permission")).toHaveLength(0);
    spawn(game, "Hill Giant");
    expect(graveyardCasts(game, glimpse, "graveyard-permission")).toHaveLength(1);
    // It isn't flashback.
    expect(hasFlashback(game, glimpse)).toBe(false);
    const before = hand(game).length;
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, glimpse, { via: "graveyard-permission" });
    expect(hand(game)).toHaveLength(before + 1);
    expect(zone(game, glimpse)).toBe("exile");
    expect(graveyard(game)).not.toContain(glimpse);
  });

  it("cast from hand, it goes to the graveyard as usual", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    spawn(game, "Hill Giant");
    const glimpse = toHand(game, "Glimpse the Cosmos");
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, glimpse);
    expect(zone(game, glimpse)).toBe("graveyard");
  });
});
