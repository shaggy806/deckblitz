/**
 * Kotose, the Silent Spider: "When Kotose enters, exile target card other than
 * a basic land card from an opponent's graveyard. Search that player's
 * graveyard, hand, and library for any number of cards with the same name as
 * that card and exile them. Then that player shuffles. For as long as you
 * control Kotose, you may play one of the exiled cards, and you may spend mana
 * as though it were mana of any color to cast it."
 *
 * One `grant-play` over every card exiled this way, `upTo: 1`: the cards share
 * one play (a permission group), so once one is cast the others stay in exile
 * (the ruling). `while-you-control-source`: it ends with Kotose leaving, for
 * good (rule 400.7).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, destroy, lands, pickFromZone, pickTargets, settle, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

/** Kotose cast with Bob's graveyard Hill Giant targeted, one more from his hand
 * and one from his library found. */
function kotose(game: Game, a: Parameters<typeof pickTargets>[0]): { kotose: ObjectId; giants: ObjectId[] } {
  const target = toGraveyard(game, "Hill Giant", B);
  const inHand = toHand(game, "Hill Giant", B);
  const inLibrary = toLibrary(game, "Hill Giant", B);
  lands(game, "Island", 3);
  lands(game, "Swamp", 2);
  pickTargets(a, target);
  pickFromZone(a, inHand, inLibrary);
  const card = toHand(game, "Kotose, the Silent Spider");
  cast(game, card);
  return { kotose: card, giants: [target, inHand, inLibrary] };
}

describe("Kotose, the Silent Spider", () => {
  it("exiles the target and its same-named cards, then lets you cast one of them with mana of any color", () => {
    const { game, a } = table();
    const { giants } = kotose(game, a);
    for (const id of giants) expect(zone(game, id)).toBe("exile");
    // Hill Giant costs {3}{R}: four Islands pay it, as though the blue were red.
    lands(game, "Island", 4);
    for (const id of giants) expect(castable(game, id)).toBe(true);
    cast(game, giants[1], { via: "impulse" });
    expect(zone(game, giants[1])).toBe("battlefield");
    // One play in all: the others stay in exile, unplayable.
    lands(game, "Island", 4);
    expect(castable(game, giants[0])).toBe(false);
    expect(castable(game, giants[2])).toBe(false);
  });

  it("can't target a basic land card", () => {
    const { game, a } = table();
    toGraveyard(game, "Forest", B);
    lands(game, "Island", 3);
    lands(game, "Swamp", 2);
    let asked = false;
    a.chooseTargetsFn = (_view, _source, _specs, legalOptions) => {
      asked = legalOptions[0].length > 0;
      return [null];
    };
    cast(game, toHand(game, "Kotose, the Silent Spider"));
    expect(asked).toBe(false);
  });

  it("stops letting you play them once Kotose leaves the battlefield", () => {
    const { game, a } = table();
    const { kotose: card, giants } = kotose(game, a);
    lands(game, "Island", 4);
    expect(castable(game, giants[0])).toBe(true);
    destroy(game, card);
    settle(game);
    expect(castable(game, giants[0])).toBe(false);
  });
});
