/**
 * Leonardo, Sewer Samurai: "During your turn, you may cast creature spells
 * with power or toughness 1 or less from your graveyard. If you cast a spell
 * this way, that creature enters with a finality counter on it."
 *
 * A static graveyard `mayPlay` with `yourTurnOnly`, its `spell` filter judged
 * as the face cast (601.3e), and "if you cast a spell this way" the
 * permission's `entersWith` — a rider of that permission alone (614.1c). The
 * finality counter exiles the creature instead of letting it die.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, cast, counters, destroy, lands, spawn, table, toGraveyard, zone } from "./harness.js";

const graveyardOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "graveyard-permission");

describe("Leonardo, Sewer Samurai", () => {
  it("a 1/1 is cast from the graveyard on your turn and enters with a finality counter; dying, it's exiled", () => {
    const { game } = table();
    spawn(game, "Leonardo, Sewer Samurai");
    lands(game, "Plains", 1);
    const lions = toGraveyard(game, "Savannah Lions");
    expect(graveyardOffers(game, lions)).toHaveLength(1);
    cast(game, lions, { via: "graveyard-permission" });
    expect(zone(game, lions)).toBe("battlefield");
    expect(counters(game, lions, "finality")).toBe(1);
    destroy(game, lions);
    expect(zone(game, lions)).toBe("exile");
  });

  it("toughness 1 alone is enough; a 2/2 can't be cast, nor a noncreature card", () => {
    const { game } = table();
    spawn(game, "Leonardo, Sewer Samurai");
    lands(game, "Plains", 2);
    const vanguard = toGraveyard(game, "Elite Vanguard");
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    expect(graveyardOffers(game, bears)).toHaveLength(0);
    expect(graveyardOffers(game, bolt)).toHaveLength(0);
    cast(game, vanguard, { via: "graveyard-permission" });
    expect(counters(game, vanguard, "finality")).toBe(1);
  });

  it("an adventurer's creature face is judged as cast: Brazen Borrower, not Petty Theft", () => {
    const { game } = table();
    spawn(game, "Leonardo, Sewer Samurai");
    lands(game, "Island", 3);
    const borrower = toGraveyard(game, "Brazen Borrower");
    const offers = graveyardOffers(game, borrower);
    expect(offers.map((a) => (a.kind === "cast-spell" ? [a.face ?? 0, a.cardName] : null))).toEqual([
      [0, "Brazen Borrower"],
    ]);
  });

  it("not during an opponent's turn, even for a creature with flash", () => {
    const { game } = table();
    spawn(game, "Leonardo, Sewer Samurai");
    lands(game, "Island", 2);
    const sailor = toGraveyard(game, "Spectral Sailor");
    const inHand = game.debugSpawn("Spectral Sailor", A, "hand");
    expect(graveyardOffers(game, sailor)).toHaveLength(1);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A);
    // Alice has priority at flash speed: the one in hand is offered, the one in the graveyard isn't.
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === inHand)).toBe(true);
    expect(graveyardOffers(game, sailor)).toHaveLength(0);
  });

  it("cast from the hand, a 1/1 enters with no finality counter", () => {
    const { game } = table();
    spawn(game, "Leonardo, Sewer Samurai");
    lands(game, "Plains", 1);
    const lions = game.debugSpawn("Savannah Lions", A, "hand");
    cast(game, lions);
    expect(zone(game, lions)).toBe("battlefield");
    expect(counters(game, lions, "finality")).toBe(0);
  });
});
