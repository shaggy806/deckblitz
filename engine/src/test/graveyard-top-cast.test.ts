/**
 * The `topOfGraveyard` filter clause in a graveyard permission: "until end of
 * turn, you may cast instant and sorcery spells from the top of your
 * graveyard. If a spell cast this way would be put into a graveyard, exile it
 * instead" (Bösium Strip). Only the card put there last (rule 404.2) is
 * reached; once it's cast, the next one down is the top.
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, lands, life, ref, spawn, table, toGraveyard, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId): CastOffer[] =>
  game.legalActions(A).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

describe("Bösium Strip", () => {
  it("casts only the top card, exiles it after, and then reaches the next one down", () => {
    const { game } = table();
    const strip = spawn(game, "Bösium Strip");
    lands(game, "Mountain", 5);
    const lower = toGraveyard(game, "Shock");
    const top = toGraveyard(game, "Lightning Bolt");
    expect(offers(game, top)).toEqual([]);
    activate(game, strip);
    expect(offers(game, lower)).toEqual([]);
    expect(offers(game, top).map((o) => o.via)).toEqual(["graveyard-permission"]);
    cast(game, top, { via: "graveyard-permission", targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, top)).toBe("exile");
    expect(offers(game, lower).map((o) => o.via)).toEqual(["graveyard-permission"]);
  });

  it("reaches nothing when the top card isn't an instant or sorcery", () => {
    const { game } = table();
    const strip = spawn(game, "Bösium Strip");
    lands(game, "Mountain", 4);
    const bolt = toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears");
    activate(game, strip);
    expect(offers(game, bolt)).toEqual([]);
  });
});
