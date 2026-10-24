/**
 * A search of the library and the graveyard together (`search-library`'s
 * `zones: "library-and-graveyard"`). The library is a hidden zone, so a
 * search for cards with a stated quality may find none of them there (rule
 * 701.23b) — and a search that takes in the library may find none at all,
 * even with one waiting in the graveyard (Nissa's Encouragement's ruling: "You
 * could even find none"). A search of the graveyard alone, a public zone,
 * must find one if there is one (`x-effects.test.ts`, Finale of Devastation).
 */
import { describe, expect, it } from "vitest";

import { cast, hand, lands, pickFromZone, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

describe("Nissa's Encouragement", () => {
  it("finds one card of each name, from the library and the graveyard, into the hand", () => {
    const { game, a } = table();
    spawn(game, "Forest");
    lands(game, "Wastes", 4);
    const forest = toGraveyard(game, "Forest");
    const behemoth = toLibrary(game, "Brambleweft Behemoth");
    const nissa = toLibrary(game, "Nissa, Genesis Mage");
    toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, forest, behemoth, nissa);
    cast(game, toHand(game, "Nissa's Encouragement"));
    expect(new Set(seen.offered)).toEqual(new Set([forest, behemoth, nissa]));
    for (const id of [forest, behemoth, nissa]) expect(zone(game, id)).toBe("hand");
  });

  it("may find none, though a Forest is in the graveyard (rule 701.23b)", () => {
    const { game, a } = table();
    spawn(game, "Forest");
    lands(game, "Wastes", 4);
    const forest = toGraveyard(game, "Forest");
    toLibrary(game, "Brambleweft Behemoth");
    let least: number | undefined;
    a.chooseFromZoneFn = (_view, _eligible, min) => {
      least = min;
      return [];
    };
    const before = hand(game).length;
    cast(game, toHand(game, "Nissa's Encouragement"));
    expect(least).toBe(0);
    expect(zone(game, forest)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
  });
});
