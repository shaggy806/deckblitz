/**
 * "As an additional cost to cast this spell, exile two cards from your
 * graveyard or pay {1}{W}" (Soaring Stoneglider): a choice of additional
 * costs whose first branch is an `also` exile from the graveyard, the cards
 * chosen as the cost is paid (rule 601.2h), offered only while the graveyard
 * holds enough (rule 118.3).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, graveyard, lands, pickFromZone, table, toGraveyard, toHand, zone } from "./harness.js";

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card) as Extract<
    ReturnType<Game["legalActions"]>[number],
    { kind: "cast-spell" }
  >[];

describe("an additional-cost option exiling cards from the graveyard (Soaring Stoneglider)", () => {
  it("exiles the two cards chosen, for {2}{W} alone", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 3);
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Shock");
    const three = toGraveyard(game, "Hill Giant");
    const glider = toHand(game, "Soaring Stoneglider");
    expect(castOffers(game, glider).map((o) => o.costOption)).toEqual([0]);
    pickFromZone(a, one, three);
    cast(game, glider, { costOption: 0 });
    expect(zone(game, glider)).toBe("battlefield");
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, three)).toBe("exile");
    expect(zone(game, two)).toBe("graveyard");
    expect(plains.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("with one card in the graveyard, only the {1}{W} branch is offered", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const lone = toGraveyard(game, "Grizzly Bears");
    const glider = toHand(game, "Soaring Stoneglider");
    expect(castOffers(game, glider).map((o) => o.costOption)).toEqual([1]);
    cast(game, glider, { costOption: 1 });
    expect(zone(game, glider)).toBe("battlefield");
    expect(graveyard(game)).toContain(lone);
  });

  it("with three lands and no graveyard, it can't be cast", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const glider = toHand(game, "Soaring Stoneglider");
    expect(castOffers(game, glider)).toEqual([]);
  });
});
