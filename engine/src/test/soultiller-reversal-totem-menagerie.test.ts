/**
 * Four cards of the casting-zones lane that needed no new vocabulary:
 * Elvish Soultiller (a filtered graveyard shuffle by a type chosen as it
 * resolves), Reversal of Fortune (a copy of a card in an opponent's hand,
 * cast free, rule 707.12), Grinning Totem (an opponent's library searched
 * into exile, playable until the next upkeep, then put into its owner's
 * graveyard) and Gruesome Menagerie (one creature card each of mana value 1,
 * 2 and 3 from the graveyard, entering together).
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import { A, B, activate, cast, destroy, enter, graveyard, hand, lands, life, pickFromZone, ref, settle, spawn, table, toGraveyard, toHand, toLibrary, toStep, zone } from "./harness.js";

type Cast = Extract<Action, { type: "cast-spell" }>;
type CastNowOffer = Extract<LegalAction, { kind: "cast-now" }>;

describe("Elvish Soultiller", () => {
  it("shuffles only the creature cards of the chosen type from its owner's graveyard, itself included", () => {
    const { game, a } = table();
    const tiller = enter(game, "Elvish Soultiller", A);
    const llanowar = toGraveyard(game, "Llanowar Elves", A);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const bolt = toGraveyard(game, "Lightning Bolt", A);
    const theirs = toGraveyard(game, "Llanowar Elves", B);
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_v, _s, options) => {
      offered = options;
      return "Elf";
    };
    destroy(game, tiller);
    settle(game);
    expect(offered).toContain("Elf");
    expect(zone(game, tiller)).toBe("library");
    expect(zone(game, llanowar)).toBe("library");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("another type leaves Soultiller itself in the graveyard", () => {
    const { game, a } = table();
    const tiller = enter(game, "Elvish Soultiller", A);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    a.chooseCreatureTypeFn = () => "Bear";
    destroy(game, tiller);
    settle(game);
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, tiller)).toBe("graveyard");
  });
});

