/**
 * "The greatest power among creature cards put into your graveyard this way"
 * — a `max` aggregate of power over the `{ thisWay: "put-into-graveyard" }`
 * set, after a look-and-choose sends the rest to the graveyard: Discerning
 * Taste.
 */
import { describe, expect, it } from "vitest";

import { cast, graveyard, hand, life, lands, pickFromZone, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

describe("Discerning Taste", () => {
  const setUp = () => {
    const t = table();
    lands(t.game, "Swamp", 3);
    // Top four, the last put first: Serra Angel 4/4, Hill Giant 3/3, Gray Ogre 2/2, Forest.
    const forest = toLibrary(t.game, "Forest");
    const ogre = toLibrary(t.game, "Gray Ogre");
    const giant = toLibrary(t.game, "Hill Giant");
    const angel = toLibrary(t.game, "Serra Angel");
    // Already in the graveyard: not put there this way.
    toGraveyard(t.game, "Craw Wurm");
    const spell = toHand(t.game, "Discerning Taste");
    return { ...t, forest, ogre, giant, angel, spell };
  };

  it("gains life equal to the greatest power among the creature cards milled away", () => {
    const { game, a, angel, giant, ogre, forest, spell } = setUp();
    pickFromZone(a, angel);
    cast(game, spell);
    expect(hand(game)).toContain(angel);
    for (const id of [giant, ogre, forest]) expect(zone(game, id)).toBe("graveyard");
    expect(life(game)).toBe(23);
  });

  it("the card kept doesn't count", () => {
    const { game, a, angel, giant, spell } = setUp();
    pickFromZone(a, giant);
    cast(game, spell);
    expect(zone(game, angel)).toBe("graveyard");
    expect(life(game)).toBe(24);
  });

  it("no creature card put there this way is no life", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    toLibrary(game, "Forest");
    toLibrary(game, "Island");
    const kept = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Mountain");
    toGraveyard(game, "Craw Wurm");
    const spell = toHand(game, "Discerning Taste");
    pickFromZone(a, kept);
    cast(game, spell);
    expect(graveyard(game).length).toBeGreaterThanOrEqual(4);
    expect(life(game)).toBe(20);
  });
});
