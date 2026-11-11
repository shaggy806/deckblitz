/**
 * "During your turn, you may cast cards exiled with Azula and you may cast
 * them as though they had flash. Mana of any type can be spent to cast those
 * spells" (Azula, Cunning Usurper): a static's linked-exile permission (rule
 * 607.2a) with `PlayTerms.flash` (rules 601.3c, 702.8a), `yourTurnOnly` and
 * `spendAs` (rule 609.4b) together.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, cast, enter, lands, pickFromZone, pickPermanents, spawn, table, toExile, toGraveyard, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

describe("Azula, Cunning Usurper", () => {
  it("has the opponent exile a nontoken creature of theirs, then a nonland card from their graveyard", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const forest = toGraveyard(game, "Forest", B);
    const divination = toGraveyard(game, "Divination", B);
    const shock = toGraveyard(game, "Shock", B);
    const creatures = pickPermanents(b, giant);
    const cards = pickFromZone(b, shock);
    enter(game, "Azula, Cunning Usurper");
    expect([...creatures.offered].sort()).toEqual([bears, giant].sort());
    // The creature is in exile, not the graveyard, as the second choice is made.
    expect([...cards.offered].sort()).toEqual([divination, shock].sort());
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, shock)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, forest)).toBe("graveyard");
  });

  it("casts the exiled cards in her controller's upkeep, with mana of any type", () => {
    const { game, b } = table({ step: "upkeep" });
    const bears = spawn(game, "Grizzly Bears", B);
    const divination = toGraveyard(game, "Divination", B);
    pickPermanents(b, bears);
    pickFromZone(b, divination);
    const azula = enter(game, "Azula, Cunning Usurper");
    lands(game, "Swamp", 5);
    // A card exiled some other way isn't hers to cast.
    const other = toExile(game, "Divination", B);
    expect(offers(game, other)).toEqual([]);
    expect(offers(game, bears).length).toBeGreaterThan(0);
    cast(game, bears, { via: "impulse" });
    expect(game.state.turn.step).toBe("upkeep");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    cast(game, divination, { via: "impulse" });
    expect(game.state.turn.step).toBe("upkeep");
    expect(zone(game, divination)).toBe("graveyard");
    expect(zone(game, azula)).toBe("battlefield");
  });

  it("offers nothing on an opponent's turn, nor once she has left", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickPermanents(b, bears);
    const azula = enter(game, "Azula, Cunning Usurper");
    lands(game, "Swamp", 2);
    expect(offers(game, bears).length).toBeGreaterThan(0);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A);
    expect(offers(game, bears)).toEqual([]);
    game.advanceUntil((s) => activePlayerOf(s) === A && s.turn.step === "upkeep" && s.priority.holder === A);
    expect(offers(game, bears).length).toBeGreaterThan(0);
    game.debugMove(azula, "graveyard");
    expect(zone(game, azula)).toBe("graveyard");
    expect(offers(game, bears)).toEqual([]);
  });
});
