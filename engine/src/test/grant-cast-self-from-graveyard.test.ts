/**
 * "Landfall — Whenever a land you control enters, if this card is in your
 * graveyard and it's your turn, you may cast it from your graveyard this
 * turn" (Skyclave Shade): a graveyard trigger (rule 113.6b) whose
 * intervening if (603.4) asks the zone and the turn, giving the card itself a
 * `grant-play` of `cards: "source"` for the turn.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, enter, lands, nextTurn, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;

const castOffers = (game: Game, card: ObjectId, player = A): Cast[] =>
  game.legalActions(player).filter((a): a is Cast => a.kind === "cast-spell" && a.card === card);

function playLand(game: Game, player = A, name = "Swamp"): ObjectId {
  const land = toHand(game, name, player);
  game.dispatch({ type: "play-land", player, card: land });
  settle(game);
  return land;
}

describe("cast this card from your graveyard this turn — Skyclave Shade", () => {
  it("a land entering on your turn lets it be cast from the graveyard, kicked too", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const shade = toGraveyard(game, "Skyclave Shade");
    expect(castOffers(game, shade)).toEqual([]);
    playLand(game);
    expect(castOffers(game, shade).length).toBeGreaterThan(0);
    cast(game, shade, { via: "graveyard-permission", kicked: true });
    expect(zone(game, shade)).toBe("battlefield");
    expect(counters(game, shade)).toBe(2);
  });

  it("the permission ends with the turn", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const shade = toGraveyard(game, "Skyclave Shade");
    playLand(game);
    expect(castOffers(game, shade).length).toBeGreaterThan(0);
    nextTurn(game);
    nextTurn(game);
    expect(castOffers(game, shade)).toEqual([]);
  });

  it("not on an opponent's turn, and not from the battlefield", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const onField = spawn(game, "Skyclave Shade");
    const shade = toGraveyard(game, "Skyclave Shade");
    nextTurn(game); // bob's turn
    game.advanceUntil((s) => s.priority.holder === B);
    // A land of alice's entering on bob's turn: "it's your turn" fails, so
    // the landfall doesn't trigger (rule 603.4).
    const stack = game.state.zones.shared.stack.length;
    enter(game, "Swamp", A, { settle: false });
    expect(game.state.pendingTriggers).toHaveLength(0);
    expect(game.state.zones.shared.stack).toHaveLength(stack);
    settle(game);
    nextTurn(game); // alice's turn: no permission carried over, and the one
    // on the battlefield never gave one (it works only from the graveyard)
    expect(castOffers(game, shade)).toEqual([]);
    expect(castOffers(game, onField)).toEqual([]);
  });

  it("a Shade that leaves the graveyard before the trigger resolves gets nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const shade = toGraveyard(game, "Skyclave Shade");
    const land = toHand(game, "Swamp");
    game.dispatch({ type: "play-land", player: A, card: land });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 || s.pendingTriggers.length > 0);
    // Out and back: a new object (rule 400.7), as the intervening if reads it.
    game.debugMove(shade, "exile");
    game.debugMove(shade, "graveyard");
    settle(game);
    expect(castOffers(game, shade)).toEqual([]);
  });
});
