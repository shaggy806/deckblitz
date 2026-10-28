/**
 * Recheck list R6, group E: Flamekin Village, Changing Loyalty, Thrumming
 * Stone.
 */
import { describe, expect, it } from "vitest";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, cast, controller, destroy, lands, life, named, pickModes, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

/** The seat casts every card a cast-now offers (free), with `targets`. */
function castEveryOffer(seat: ScriptedController, targets: readonly TargetRef[] = []): { offered: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    const way = offer.casts[0];
    if (way === undefined) return null;
    return { type: "cast-spell", player: seat.playerId, card: way.card, targets, via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return seen;
}

describe("Flamekin Village", () => {
  it("a changeling card in hand is an Elemental card to reveal", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    // An opening hand of Grizzly Bears: no Elemental, so it enters tapped.
    const tapped = spawn(game, "Flamekin Village");
    expect(game.state.objects[tapped].tapped).toBe(true);
    toHand(game, "Mistwalker");
    const untapped = spawn(game, "Flamekin Village");
    expect(game.state.objects[untapped].tapped).toBe(false);
  });
});

describe("Changing Loyalty", () => {
  it("replicated once: the copy is a token Aura on its own target, and each returns its creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    a.chooseTargetsFn = () => [ref(giant)];
    cast(game, toHand(game, "Changing Loyalty"), { targets: [ref(bears)], kicked: true, kickCount: 1 });
    const auras = named(game, "Changing Loyalty");
    expect(auras.length).toBe(2);
    expect(auras.filter((id) => game.state.objects[id].isToken === true).length).toBe(1);
    destroy(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
    destroy(game, bears);
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Thrumming Stone", () => {
  it("a spell you cast has ripple 4: a same-named card revealed is cast free, and it ripples too", () => {
    const { game, a } = table();
    spawn(game, "Thrumming Stone");
    lands(game, "Mountain", 1);
    toLibrary(game, "Hill Giant");
    const second = toLibrary(game, "Shock");
    pickModes(a, 0); // reveal, each time
    const seen = castEveryOffer(a, [ref(B)]);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(zone(game, second)).toBe("graveyard");
    // The first ripple offered only the Shock; the second's reveal held no Shock.
    expect(seen.offered[0]).toEqual([second]);
    expect(seen.offered.slice(1).every((cards) => cards.length === 0)).toBe(true);
  });
});
