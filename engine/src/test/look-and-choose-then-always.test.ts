/**
 * A `look-and-choose` whose `then` runs with nothing chosen too (`thenAlways`):
 * one instruction that moves the chosen card **and** something else, the
 * choice made first so both moves are one event — Avatar Destiny's "return
 * this card to its owner's hand and up to one creature card milled this way
 * to the battlefield under your control".
 */

import { describe, expect, it } from "vitest";

import { A, cast, controller, destroy, hand, lands, pickFromZone, pt, ref, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

describe("Avatar Destiny", () => {
  it("gets +1/+1 for each creature card in your graveyard and is an Avatar", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Forest");
    cast(game, toHand(game, "Avatar Destiny"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("mills its power, then the Aura and the chosen creature card leave the graveyard as one event", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    // Milled top first: three cards, the creature's last power (2 + 1).
    const deep = toLibrary(game, "Llanowar Elves");
    const ogre = toLibrary(game, "Gray Ogre");
    const forest = toLibrary(game, "Forest");
    const elf = toLibrary(game, "Elvish Mystic");
    const aura = toHand(game, "Avatar Destiny");
    cast(game, aura, { targets: [ref(bears)] });
    const seen = pickFromZone(a, ogre);
    destroy(game, bears);
    // Only the creature cards milled this way: not Hill Giant, not the Bears.
    expect([...seen.offered].sort()).toEqual([elf, ogre].sort());
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, deep)).toBe("library");
    expect(zone(game, ogre)).toBe("battlefield");
    expect(controller(game, ogre)).toBe(A);
    expect(hand(game)).toContain(aura);
    expect(zone(game, elf)).toBe("graveyard");
    const leaves = game.eventsOfType("cards-left-graveyard").map((e) => [...e.objects].sort());
    expect(leaves).toEqual([[aura, ogre].sort()]);
  });

  it("returns the Aura with no creature card milled, nothing asked", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    toLibrary(game, "Forest");
    toLibrary(game, "Forest");
    const aura = toHand(game, "Avatar Destiny");
    cast(game, aura, { targets: [ref(bears)] });
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    destroy(game, bears);
    expect(asked).toBe(false);
    expect(hand(game)).toContain(aura);
  });

  it("returns the Aura when its controller chooses no creature card", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    const ogre = toLibrary(game, "Gray Ogre");
    toLibrary(game, "Forest");
    const aura = toHand(game, "Avatar Destiny");
    cast(game, aura, { targets: [ref(bears)] });
    pickFromZone(a);
    destroy(game, bears);
    expect(zone(game, ogre)).toBe("graveyard");
    expect(hand(game)).toContain(aura);
  });
});
