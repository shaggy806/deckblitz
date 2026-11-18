/**
 * Two permissions over one source's linked exile (rule 607.2a), one limited:
 * Hedonist's Trove's "you may play lands from among cards exiled with this
 * enchantment" (no limit but the player's land plays) and "you may cast
 * spells from among [them]. You can't cast more than one spell this way each
 * turn" — the second static's `oncePerTurn`, which a land played under the
 * first doesn't spend.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, enter, lands, nextTurn, pickTargets, table, toGraveyard, zone } from "./harness.js";

const offers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

describe("Hedonist's Trove: lands from its exile freely, one spell a turn", () => {
  it("exiles the opponent's graveyard; a land and one spell each turn, the second spell refused", () => {
    const { game, a } = table();
    const forest = toGraveyard(game, "Forest", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const elves = toGraveyard(game, "Llanowar Elves", B);
    const ogre = toGraveyard(game, "Hill Giant", B);
    lands(game, "Forest", 3);
    lands(game, "Mountain", 4);
    pickTargets(a, B);
    const trove = enter(game, "Hedonist's Trove");
    for (const id of [forest, bears, elves, ogre]) {
      expect(zone(game, id)).toBe("exile");
      expect(game.state.objects[id].exiledWith?.source).toBe(trove);
    }
    expect(offers(game, forest).map((o) => o.kind)).toEqual(["play-land"]);
    expect(offers(game, bears).map((o) => o.kind)).toEqual(["cast-spell"]);
    // The land doesn't spend the spell's once a turn.
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
    expect(offers(game, bears)).toHaveLength(1);
    const offer = offers(game, bears)[0];
    cast(game, bears, offer?.kind === "cast-spell" && offer.via !== undefined ? { via: offer.via } : {});
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(offers(game, elves)).toEqual([]);
    nextTurn(game);
    nextTurn(game);
    expect(offers(game, elves)).toHaveLength(1);
    expect(offers(game, ogre)).toHaveLength(1);
  });
});
