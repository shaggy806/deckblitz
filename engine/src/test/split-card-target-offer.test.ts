/**
 * Rule 709.3: a split card cast as one half has only that half's
 * characteristics, so the target offer judges filter-based protection against
 * the half. Malice is mono-black: Guardian of the Guildpact (protection from
 * monocolored) can't be offered as its target, though the whole card is
 * multicolored.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { lands, ref, spawn, table, toHand, A, B } from "./harness.js";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;
const castsOf = (game: Game, card: ObjectId): Cast[] =>
  game.legalActions(A).filter((a): a is Cast => a.kind === "cast-spell" && a.card === card);

describe("a split card's target offer", () => {
  it("Malice can't be offered Guardian of the Guildpact, but a Bears, yes", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    lands(game, "Island", 8);
    const guardian = spawn(game, "Guardian of the Guildpact", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Spite // Malice");
    const malice = castsOf(game, card).find((a) => a.face === 2);
    expect(malice).toBeDefined();
    const offered = malice!.targetOptions.flat();
    expect(offered).toContainEqual(ref(bears));
    expect(offered).not.toContainEqual(ref(guardian));
  });
});
