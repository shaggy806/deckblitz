/**
 * Shaman's Trance: other players can't play lands or cast spells from their
 * graveyards this turn, and its caster may play lands and cast spells from
 * theirs "as though those cards were in your graveyard" — the cards' own
 * flashback included (its ruling), through `EffectPlaySpec.asThoughYours`
 * and `Game.castableAsOwnGraveyard`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, cast, hand, lands, settle, table, toGraveyard, toHand, zone } from "./harness.js";

const casts = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card);
const playsLand = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "play-land" && a.card === card);

describe("Shaman's Trance", () => {
  it("lets its caster cast an opponent's graveyard card, by its flashback too, and play their land", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 3);
    const twice = toGraveyard(game, "Think Twice", B);
    const forest = toGraveyard(game, "Forest", B);
    expect(casts(game, twice)).toHaveLength(0);
    cast(game, toHand(game, "Shaman's Trance"));
    const offers = casts(game, twice);
    expect(offers.some((a) => a.kind === "cast-spell" && a.via === "flashback")).toBe(true);
    expect(offers.some((a) => a.kind === "cast-spell" && a.via === "graveyard-permission")).toBe(true);
    expect(playsLand(game, forest)).toBe(true);

    // Flashback from Bob's graveyard: Alice draws, and the card is exiled.
    const before = hand(game).length;
    cast(game, twice, { via: "flashback" });
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, twice)).toBe("exile");
  });

  it("stops the other players playing from their own graveyards", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 3, B);
    const twice = toGraveyard(game, "Think Twice", B);
    cast(game, toHand(game, "Shaman's Trance"));
    game.dispatch({ type: "pass-priority", player: A });
    expect(casts(game, twice, B)).toHaveLength(0);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: twice, targets: [], via: "flashback" })).toMatch(/can't/);
  });

  it("lasts the turn only", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 3);
    const twice = toGraveyard(game, "Think Twice", B);
    cast(game, toHand(game, "Shaman's Trance"));
    expect(casts(game, twice).length).toBeGreaterThan(0);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "precombat-main");
    expect(game.state.playerEffects?.some((e) => e.mayPlay?.asThoughYours === true) ?? false).toBe(false);
  });
});
