/**
 * Demilich: a self cost reduction of {U} for each instant and sorcery spell
 * you've cast this turn (`reduceColored` × `reduceColoredTimes` of a
 * `castThisTurn` count — rule 601.2f), an attack trigger that exiles an
 * instant or sorcery card from your graveyard and lets you cast a copy, paying
 * its cost, and a cast from your graveyard by exiling four instant and/or
 * sorcery cards as an additional cost.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, attack, cast, lands, life, pickTargets, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const castOffers = (game: Game, card: ObjectId, via?: string): LegalAction[] =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && (via === undefined || a.via === via));

describe("Demilich", () => {
  it("costs {U} less for each instant and sorcery spell you've cast this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 2);
    const demilich = toHand(game, "Demilich");
    expect(castOffers(game, demilich)).toEqual([]);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(castOffers(game, demilich)).toEqual([]);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    // Two cast: {U}{U} left, two Islands to pay it.
    cast(game, demilich);
    expect(zone(game, demilich)).toBe("battlefield");
  });

  it("a creature spell doesn't count", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Llanowar Elves"));
    const demilich = toHand(game, "Demilich");
    expect(castOffers(game, demilich)).toEqual([]);
  });

  it("attacking, exiles an instant or sorcery card from your graveyard and casts a copy, paying for it", () => {
    const { game, a } = table();
    const demilich = spawn(game, "Demilich");
    lands(game, "Mountain", 1);
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickTargets(a, bolt);
    let offered = 0;
    a.chooseCastNowFn = (_view, offer) => {
      offered++;
      const way = offer.casts[0];
      return way === undefined ? null : { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via };
    };
    attack(game, a, [demilich]);
    expect(offered).toBe(1);
    expect(zone(game, bolt)).toBe("exile");
    // The copy's 3 and Demilich's 4.
    expect(life(game, B)).toBe(20 - 3 - 4);
  });

  it("casts from the graveyard by exiling four other instant and/or sorcery cards", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const demilich = toGraveyard(game, "Demilich");
    const spells = [
      toGraveyard(game, "Lightning Bolt"),
      toGraveyard(game, "Opt"),
      toGraveyard(game, "Divination"),
    ];
    toGraveyard(game, "Grizzly Bears");
    expect(castOffers(game, demilich, "graveyard-permission")).toEqual([]);
    spells.push(toGraveyard(game, "Opt"));
    const [offer] = castOffers(game, demilich, "graveyard-permission");
    expect(offer?.kind === "cast-spell" ? [...(offer.escapeExile?.choices ?? [])].sort() : undefined).toEqual([...spells].sort());
    cast(game, demilich, { via: "graveyard-permission", escapeExile: spells });
    expect(zone(game, demilich)).toBe("battlefield");
    for (const spell of spells) expect(zone(game, spell)).toBe("exile");
    expect(life(game, A)).toBe(20);
  });
});
