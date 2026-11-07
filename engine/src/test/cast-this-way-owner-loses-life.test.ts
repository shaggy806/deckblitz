/**
 * "Each player who owns a spell you cast this way loses life equal to its
 * mana value" (Kefka, Dancing Mad): the `thisWay: "cast"` amount read by the
 * spells' owners (`byOwner`), not their caster.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, controller, destroy, life, settle, spawn, table, toGraveyard, toStep, zone } from "./harness.js";

/** The seat casts each offered card in `wanted` once, free, then declines. */
function castEach(seat: ScriptedController, wanted: readonly ObjectId[]): { offered: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  const left = [...wanted];
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    const pick = left.find((id) => offer.cards.includes(id));
    if (pick === undefined) return null;
    left.splice(left.indexOf(pick), 1);
    const way = offer.casts.find((c) => c.card === pick)!;
    return { type: "cast-spell", player: seat.playerId, card: pick, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return seen;
}

describe("Kefka, Dancing Mad", () => {
  it("exiles one card from each opponent's graveyard; each owner loses the mana value of their spells cast", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Kefka, Dancing Mad");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const giant = toGraveyard(game, "Hill Giant", C);
    const own = toGraveyard(game, "Llanowar Elves", A);
    const seen = castEach(a, [bears, giant]);
    toStep(game, "end");
    settle(game);
    // Its own graveyard isn't touched.
    expect(zone(game, own)).toBe("graveyard");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, giant]));
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    // Bob owns the 2-drop, Carol the 4-drop; Kefka's controller owns neither.
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(16);
    expect(life(game, A)).toBe(20);
  });

  it("a card left uncast stays exiled, and its owner loses nothing", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Kefka, Dancing Mad");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const giant = toGraveyard(game, "Hill Giant", C);
    castEach(a, [giant]);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(16);
  });

  it("has indestructible during its controller's turn only", () => {
    const { game } = table();
    const kefka = spawn(game, "Kefka, Dancing Mad");
    destroy(game, kefka);
    expect(zone(game, kefka)).toBe("battlefield");
    toStep(game, "upkeep", B);
    destroy(game, kefka);
    expect(zone(game, kefka)).toBe("graveyard");
  });
});
