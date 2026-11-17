/**
 * A delayed sacrifice of every card a mass return put onto the battlefield
 * (`delayed-trigger`'s `remember` over `thisWay: "put-onto-battlefield"`, read
 * by `sacrifice-all`'s `inSet`): Push the Limit's "return all Mount and
 * Vehicle cards from your graveyard to the battlefield. Sacrifice them at the
 * beginning of the next end step" — each only while it's still the permanent
 * that returned (rule 400.7) and still yours (rule 701.21a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, keywords, lands, spawn, table, toGraveyard, toHand, toStep, types } from "./harness.js";

const zoneOf = (game: Game, id: ObjectId): string => game.state.objects[id].zone;

describe("Push the Limit", () => {
  it("returns every Mount and Vehicle card, animates and hastes them, and sacrifices them at the end step", () => {
    const { game } = table();
    const bronco = toGraveyard(game, "Caustic Bronco");
    const copter = toGraveyard(game, "Smuggler's Copter");
    const bears = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Caustic Bronco", B);
    // A Vehicle already here becomes a creature too, but stays.
    const chariot = spawn(game, "Esika's Chariot");
    lands(game, "Mountain", 7);
    cast(game, toHand(game, "Push the Limit"));
    expect(zoneOf(game, bronco)).toBe("battlefield");
    expect(zoneOf(game, copter)).toBe("battlefield");
    expect(zoneOf(game, bears)).toBe("graveyard");
    expect(zoneOf(game, theirs)).toBe("graveyard");
    expect(types(game, copter)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(types(game, chariot)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(keywords(game, copter).has("haste")).toBe(true);
    expect(keywords(game, bronco).has("haste")).toBe(true);
    toStep(game, "end", A);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zoneOf(game, bronco)).toBe("graveyard");
    expect(zoneOf(game, copter)).toBe("graveyard");
    expect(zoneOf(game, chariot)).toBe("battlefield");
  });

  it("leaves a returned permanent that has since left and come back", () => {
    const { game } = table();
    const bronco = toGraveyard(game, "Caustic Bronco");
    const copter = toGraveyard(game, "Smuggler's Copter");
    lands(game, "Mountain", 7);
    cast(game, toHand(game, "Push the Limit"));
    // The Copter goes away and comes back: a new object (rule 400.7).
    game.debugMove(copter, "hand");
    game.debugMove(copter, "battlefield");
    toStep(game, "end", A);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zoneOf(game, bronco)).toBe("graveyard");
    expect(zoneOf(game, copter)).toBe("battlefield");
  });
});
