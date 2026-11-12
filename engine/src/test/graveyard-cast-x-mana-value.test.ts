/**
 * A permission's `spell` filter read with the X announced (rule 601.3e,
 * `FilterContext.castX`) — Lurrus of the Dream-Den's "permanent spell with
 * mana value 2 or less": Hangarback Walker ({X}{X}) may be cast from the
 * graveyard with X = 1 (mana value 2), not X = 2 (4). Once each of your turns.
 */
import { describe, expect, it } from "vitest";

import { A, cast, lands, spawn, table, toGraveyard, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/** The permission the offer to cast `card` from the graveyard names. */
const via = (game: Game, card: ObjectId): { via?: never } => {
  const offer = game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === card);
  return offer?.kind === "cast-spell" && offer.via !== undefined ? { via: offer.via as never } : {};
};

describe("Lurrus of the Dream-Den — X counts toward the mana value", () => {
  it("refuses X = 2, allows X = 1, once a turn", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    spawn(game, "Lurrus of the Dream-Den");
    const walker = toGraveyard(game, "Hangarback Walker");
    expect(() => cast(game, walker, { x: 2, ...via(game, walker) })).toThrow();
    cast(game, walker, { x: 1, ...via(game, walker) });
    expect(zone(game, walker)).toBe("battlefield");
    const second = toGraveyard(game, "Hangarback Walker");
    expect(() => cast(game, second, { x: 0, ...via(game, second) })).toThrow();
  });

  it("doesn't reach an instant or a land", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Lurrus of the Dream-Den");
    const bolt = toGraveyard(game, "Lightning Bolt");
    expect(Object.keys(via(game, bolt))).toEqual([]);
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === bolt)).toBe(false);
  });
});
