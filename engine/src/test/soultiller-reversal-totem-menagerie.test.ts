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

describe("Reversal of Fortune", () => {
  it("copies an instant in the opponent's hand and casts the copy free; the card stays", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const bolt = toHand(game, "Lightning Bolt", B);
    const bears = toHand(game, "Grizzly Bears", B);
    let offer: CastNowOffer | undefined;
    a.chooseCastNowFn = (_v, o): Cast | null => {
      offer = o;
      const copy = o.cards[0];
      return copy === undefined ? null : { type: "cast-spell", player: A, card: copy, targets: [ref(B)], via: "effect", free: true };
    };
    cast(game, toHand(game, "Reversal of Fortune"), { targets: [ref(B)] });
    expect(offer?.cards).toHaveLength(1);
    // The copy, not the card: it's offered in the card's place (707.12).
    expect(offer?.cards).not.toContain(bolt);
    expect(offer?.cards).not.toContain(bears);
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("hand");
    expect(hand(game, B)).toContain(bolt);
    // The copy ceased to exist leaving the stack: nothing new in a graveyard.
    expect(graveyard(game, B)).toEqual([]);
  });

  it("offers nothing without an instant or sorcery card in that hand", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    toHand(game, "Grizzly Bears", B);
    let asked = false;
    a.chooseCastNowFn = () => {
      asked = true;
      return null;
    };
    cast(game, toHand(game, "Reversal of Fortune"), { targets: [ref(B)] });
    expect(asked).toBe(false);
  });
});

describe("Grinning Totem", () => {
  it("exiles the found card, playable by the activator; unplayed, it goes to its owner's graveyard at the next upkeep", () => {
    const { game, a } = table();
    const totem = spawn(game, "Grinning Totem", A);
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears", B);
    pickFromZone(a, bears);
    activate(game, totem, 0, { targets: [ref(B)] });
    expect(zone(game, totem)).toBe("graveyard");
    expect(zone(game, bears)).toBe("exile");
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === bears)).toBe(true);
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(bears);
  });

  it("a card played from exile isn't put into the graveyard", () => {
    const { game, a } = table();
    const totem = spawn(game, "Grinning Totem", A);
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears", B);
    pickFromZone(a, bears);
    activate(game, totem, 0, { targets: [ref(B)] });
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Gruesome Menagerie", () => {
  it("returns one creature card of each mana value 1, 2 and 3 together", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const elf = toGraveyard(game, "Llanowar Elves", A);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const otherBears = toGraveyard(game, "Grizzly Bears", A);
    const ogre = toGraveyard(game, "Gray Ogre", A);
    // Mana value 4: no slot.
    const giant = toGraveyard(game, "Hill Giant", A);
    const seen = pickFromZone(a, elf, bears, ogre);
    cast(game, toHand(game, "Gruesome Menagerie"));
    expect(seen.offered).toEqual(expect.arrayContaining([elf, bears, otherBears, ogre]));
    expect(seen.offered).not.toContain(giant);
    for (const id of [elf, bears, ogre]) expect(zone(game, id)).toBe("battlefield");
    expect(zone(game, otherBears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    // One event: all three entered at once (the ruling).
    const left = game.state.eventLog.filter((e) => e.type === "cards-left-graveyard");
    expect(left).toHaveLength(1);
  });

  it("a missing mana value is skipped: the others still must be chosen", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    const runeclaw = toGraveyard(game, "Runeclaw Bear", A);
    let asked: { min: number; max: number } | undefined;
    a.chooseFromZoneFn = (_v, _eligible, min, max) => {
      asked = { min, max };
      return [runeclaw];
    };
    cast(game, toHand(game, "Gruesome Menagerie"));
    // Only the mana value 2 slot can be filled, and it must be.
    expect(asked?.min).toBe(1);
    expect(zone(game, runeclaw)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});
