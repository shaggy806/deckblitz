/**
 * Coram, the Undertaker, and the static permission it needs: "During each of
 * your turns, you may play a land and cast a spell from among cards in
 * graveyards that were put there from libraries this turn" —
 * `StaticPlay.anyGraveyard` (every player's graveyard, rule 601.3) and
 * `StaticPlay.landAndSpell` (one land and one spell a turn, spent apart;
 * the land still takes a land drop, rule 305.2).
 *
 * - the attack trigger mills each player a card;
 * - a milled creature card in an opponent's graveyard may be cast, and comes
 *   under Coram's controller's control; a second milled spell may not;
 * - a milled land in the player's own graveyard may still be played;
 * - a card in a graveyard that wasn't milled this turn isn't reached;
 * - Coram's power is the greatest power among creature cards in graveyards.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, C, attack, controller, lands, pt, settle, spawn, table, toGraveyard, toLibrary, zone } from "./harness.js";

const spellOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "graveyard-permission");
const landOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "play-land" && a.card === card);

function board(): { game: Game; coram: ObjectId; mine: ObjectId; bears: ObjectId; elves: ObjectId; old: ObjectId } {
  const { game, a } = table({ players: 3 });
  lands(game, "Forest", 4);
  const coram = spawn(game, "Coram, the Undertaker");
  const mine = toLibrary(game, "Forest", A);
  const bears = toLibrary(game, "Grizzly Bears", B);
  const elves = toLibrary(game, "Llanowar Elves", C);
  const old = toGraveyard(game, "Grizzly Bears", B);
  attack(game, a, [coram], B as PlayerId);
  return { game, coram, mine, bears, elves, old };
}

describe("Coram, the Undertaker", () => {
  it("mills each player as it attacks, and reaches milled cards in every graveyard", () => {
    const { game, mine, bears, elves, old } = board();
    for (const id of [mine, bears, elves]) expect(zone(game, id)).toBe("graveyard");
    expect(spellOffers(game, bears).length).toBeGreaterThan(0);
    expect(spellOffers(game, elves).length).toBeGreaterThan(0);
    expect(spellOffers(game, old)).toHaveLength(0);
    expect(landOffers(game, mine).length).toBeGreaterThan(0);
  });

  it("casts one spell and plays one land, each its own allowance", () => {
    const { game, mine, bears, elves } = board();
    const [offer] = spellOffers(game, bears);
    game.dispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "graveyard-permission",
      ...(offer.kind === "cast-spell" && offer.graveyardGrant !== undefined ? { graveyardGrant: offer.graveyardGrant } : {}) });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    // The spell allowance is spent; the land one isn't.
    expect(spellOffers(game, elves)).toHaveLength(0);
    const [land] = landOffers(game, mine);
    game.dispatch({ type: "play-land", player: A, card: mine,
      ...(land.kind === "play-land" && land.graveyardGrant !== undefined ? { graveyardGrant: land.graveyardGrant } : {}) });
    expect(zone(game, mine)).toBe("battlefield");
    expect(controller(game, mine)).toBe(A);
  });

  it("gets +X/+0 for the greatest power among creature cards in all graveyards", () => {
    const { game } = table();
    const coram = spawn(game, "Coram, the Undertaker");
    expect(pt(game, coram)).toEqual({ power: 0, toughness: 5 });
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Craw Wurm", A);
    expect(pt(game, coram)).toEqual({ power: 6, toughness: 5 });
  });
});
