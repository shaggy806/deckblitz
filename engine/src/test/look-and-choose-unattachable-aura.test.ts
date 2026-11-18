/**
 * "You may put any number of Aura cards with mana value X or less from among
 * them onto the battlefield. Then put all cards revealed this way that
 * weren't put onto the battlefield on the bottom of your library in a random
 * order." (Knickknack Ouphe — need key
 * bug:look-and-choose-offers-unattachable-aura): a look-and-choose onto the
 * battlefield with no host named doesn't offer an Aura card with nothing it
 * could enchant (rule 303.4g; the card's ruling: "you can't choose to put it
 * onto the battlefield at all"), so it goes to the bottom with the rest
 * instead of staying on top. One it could enchant chooses its host as it
 * enters (303.4f, not targeted).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, lands, pickFromZone, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

/** Alice's mana for X = 3: a Forest-free {G} and three more. */
function mana(game: Game): void {
  spawn(game, "Birds of Paradise");
  lands(game, "Island", 3);
}

describe("Knickknack Ouphe", () => {
  it("enters with X counters and doesn't offer an Aura with nothing it could enchant; it goes to the bottom with the rest", () => {
    const { game, a } = table();
    mana(game);
    // Top of the library last: Utopia Sprawl (Enchant Forest — none here),
    // Pacifism, Grizzly Bears.
    const bears = toLibrary(game, "Grizzly Bears");
    const pacifism = toLibrary(game, "Pacifism");
    const sprawl = toLibrary(game, "Utopia Sprawl");
    const ouphe = toHand(game, "Knickknack Ouphe");
    const seen = pickFromZone(a, pacifism);
    let enchantOptions: readonly ObjectId[] = [];
    a.chooseEnchantFn = (_view, _source, options) => {
      enchantOptions = options;
      return ouphe;
    };
    cast(game, ouphe, { x: 3 });
    expect(counters(game, ouphe)).toBe(3);
    expect(seen.offered).toEqual([pacifism]);
    expect(zone(game, pacifism)).toBe("battlefield");
    expect(enchantOptions).toContain(ouphe);
    expect(game.state.objects[pacifism].attachedTo).toBe(ouphe);
    // Neither the Sprawl nor the Bears stayed on top.
    const lib = library(game);
    expect(lib.slice(-2).sort()).toEqual([bears, sprawl].sort());
  });

  it("offers an Aura with something it could enchant, an opponent's permanent too, but none over X", () => {
    const { game, a } = table();
    mana(game);
    const theirForest = spawn(game, "Forest", B);
    const magic = toLibrary(game, "Control Magic");
    const sprawl = toLibrary(game, "Utopia Sprawl");
    const ouphe = toHand(game, "Knickknack Ouphe");
    const seen = pickFromZone(a, sprawl);
    a.chooseEnchantFn = () => theirForest;
    cast(game, ouphe, { x: 2 });
    // Control Magic is mana value 4: not offered at X = 2, and the top two
    // are all that's revealed.
    expect(seen.offered).toEqual([sprawl]);
    expect(game.state.objects[sprawl].attachedTo).toBe(theirForest);
    expect(zone(game, magic)).toBe("library");
  });

  it("asks nothing when no revealed Aura could enter", () => {
    const { game, a } = table();
    mana(game);
    const bears = toLibrary(game, "Grizzly Bears");
    const sprawl = toLibrary(game, "Utopia Sprawl");
    const ouphe = toHand(game, "Knickknack Ouphe");
    let asked = false;
    a.chooseFromZoneFn = (_view, eligible) => {
      if (eligible.length > 0) asked = true;
      return [];
    };
    cast(game, ouphe, { x: 1 });
    expect(asked).toBe(false);
    expect(zone(game, sprawl)).toBe("library");
    expect(library(game).at(-1)).toBe(sprawl);
    expect(library(game)[0]).toBe(bears);
  });
});
