/**
 * Selective Adaptation: a `look-and-choose` of one card a keyword
 * (`together.oneEach`), whose first pick goes onto the battlefield and the
 * other chosen cards into your hand (`restDestination`), the rest into your
 * graveyard, all in one move.
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, cast, graveyard, hand, lands, table, toHand, toLibrary, zone } from "./harness.js";

describe("Selective Adaptation", () => {
  it("puts the first chosen card onto the battlefield, the others into your hand, the rest into your graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const deep = toLibrary(game, "Air Elemental");
    const rats = toLibrary(game, "Typhoid Rats");
    const giant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    const goblin = toLibrary(game, "Raging Goblin");
    const spider = toLibrary(game, "Giant Spider");
    const nighthawk = toLibrary(game, "Vampire Nighthawk");
    const angel = toLibrary(game, "Serra Angel");
    const asked: { eligible: readonly ObjectId[]; min: number; max: number }[] = [];
    a.chooseFromZoneFn = (_view, eligible, min, max) => {
      asked.push({ eligible, min, max });
      return [nighthawk, angel, spider, goblin, rats];
    };
    cast(game, toHand(game, "Selective Adaptation"));
    // Only the cards with a listed keyword, and "choose" means all five slots
    // the seven can fill (Serra Angel as vigilance, Nighthawk as flying or
    // lifelink, the Rats as deathtouch).
    expect(asked).toHaveLength(1);
    expect([...asked[0].eligible].sort()).toEqual([angel, nighthawk, spider, goblin, rats].sort());
    expect(asked[0].min).toBe(5);
    expect(zone(game, nighthawk)).toBe("battlefield");
    for (const card of [angel, spider, goblin, rats]) expect(hand(game)).toContain(card);
    expect([...graveyard(game)].filter((id) => id === bears || id === giant).sort()).toEqual([bears, giant].sort());
    expect(zone(game, deep)).toBe("library");
    // One instruction: the chosen cards and the rest leave the library together.
    expect(game.eventsOfType("cards-chosen-from-zone").at(-1)).toMatchObject({ player: A, rest: "hand" });
  });

  it("takes a card for one keyword only, so two flyers both go when one has vigilance", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    for (let i = 0; i < 5; i += 1) toLibrary(game, "Grizzly Bears");
    const air = toLibrary(game, "Air Elemental");
    const angel = toLibrary(game, "Serra Angel");
    a.chooseFromZoneFn = () => [air, angel];
    cast(game, toHand(game, "Selective Adaptation"));
    expect(zone(game, air)).toBe("battlefield");
    expect(zone(game, angel)).toBe("hand");
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Grizzly Bears")).toHaveLength(5);
  });

  it("puts all seven into your graveyard with no card to choose", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const seven = Array.from({ length: 7 }, () => toLibrary(game, "Grizzly Bears"));
    const offered: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered.push(eligible);
      return [];
    };
    cast(game, toHand(game, "Selective Adaptation"));
    // Shown the revealed cards, with nothing to pick.
    expect(offered.every((e) => e.length === 0)).toBe(true);
    for (const card of seven) expect(zone(game, card)).toBe("graveyard");
  });
});
