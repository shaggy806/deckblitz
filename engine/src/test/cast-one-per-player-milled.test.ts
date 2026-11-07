// The Ur-Sphinx's "each player mills that many cards. For each player, you may
// cast a card that player milled this way without paying its mana cost":
// `cast-now` over the cards milled this way, `repeat` with `onePerGraveyard`
// read by each card's owner — the player who milled it — the casts made while
// the trigger resolves, in the order the caster picks (the ruling).

import { describe, expect, it } from "vitest";
import { A, B, C, attack, spawn, table, toLibrary, zone } from "./harness.js";
import type { ObjectId } from "../primitives.js";

type Seat = ReturnType<typeof table>["a"];

/** Answer each cast-now offer with the next card of `order`, recording what
 * each offered; a card not on offer declines. */
function castInOrder(a: Seat, order: readonly ObjectId[]): (readonly ObjectId[])[] {
  const offers: (readonly ObjectId[])[] = [];
  let at = 0;
  a.chooseCastNowFn = (_view, offer) => {
    offers.push(offer.casts.map((way) => way.card));
    const card = order[at];
    at += 1;
    const way = offer.casts.find((w) => w.card === card);
    if (way === undefined) return null;
    return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return offers;
}

describe("The Ur-Sphinx", () => {
  it("mills each player as many cards as Sphinxes attacked, and casts at most one of each player's", () => {
    const { game, a } = table({ players: 3 });
    const sphinx = spawn(game, "The Ur-Sphinx");
    const token = spawn(game, "Sphinx Token");
    const mine = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Hill Giant")];
    const bobs = [toLibrary(game, "Grizzly Bears", B), toLibrary(game, "Hill Giant", B)];
    const carols = [toLibrary(game, "Grizzly Bears", C), toLibrary(game, "Hill Giant", C)];
    const offers = castInOrder(a, [bobs[0], carols[1]]);
    attack(game, a, [sphinx, token]);
    for (const id of [...mine, ...bobs, ...carols]) expect(["graveyard", "battlefield"]).toContain(zone(game, id));
    expect(offers[0]).toEqual(expect.arrayContaining([...mine, ...bobs, ...carols]));
    // Bob's turn has gone: his other card isn't offered again.
    expect(offers[1]).toEqual(expect.arrayContaining([...mine, ...carols]));
    expect(offers[1]).not.toContain(bobs[1]);
    expect(offers[2]).toEqual(expect.arrayContaining(mine));
    expect(offers[2]).not.toContain(carols[0]);
    expect(offers).toHaveLength(3);
    // Cast free, yours to control (rule 108.3).
    expect(zone(game, bobs[0])).toBe("battlefield");
    expect(game.state.objects[bobs[0]].controller).toBe(A);
    expect(zone(game, carols[1])).toBe("battlefield");
    expect(zone(game, bobs[1])).toBe("graveyard");
  });

  it("never offers a land card, and mills one each for one Sphinx", () => {
    const { game, a } = table();
    const sphinx = spawn(game, "The Ur-Sphinx");
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears", B);
    const offers = castInOrder(a, []);
    attack(game, a, [sphinx]);
    expect(zone(game, forest)).toBe("graveyard");
    expect(offers).toHaveLength(1);
    expect(offers[0]).toEqual([bears]);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("isn't triggered by an attack without a Sphinx", () => {
    const { game, a } = table();
    spawn(game, "The Ur-Sphinx");
    const bears = spawn(game, "Grizzly Bears");
    const top = toLibrary(game, "Hill Giant");
    attack(game, a, [bears]);
    expect(zone(game, top)).toBe("library");
  });
});
