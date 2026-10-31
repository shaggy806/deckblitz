/**
 * Alternative costs (rule 118.9) paid from the hand: discarding a card of a
 * kind (Abolish; Foil's "an Island card and another card"), exiling a card
 * whose mana value is X (the Shoals — rules 107.3a, 601.2b, 202.3e), and
 * revealing the hand (Land Grant — 701.20a) under a "no land cards in hand"
 * condition.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, graveyard, hand, lands, life, pt, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const castsOf = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }>[] =>
  game.legalActions(A).filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

const altOffers = (game: Game, card: ObjectId) => castsOf(game, card).filter((a) => a.altCost === true);

/** Alice's opening hand of Wastes, gone: only what a test puts there. */
const emptyHand = (game: Game): void => {
  for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
};

describe("Abolish — discard a Plains card rather than pay", () => {
  it("is offered for free only with a Plains card in hand, and discards it", () => {
    const { game } = table();
    emptyHand(game);
    const stone = spawn(game, "Mind Stone", B);
    const abolish = toHand(game, "Abolish");
    toHand(game, "Island");
    expect(altOffers(game, abolish)).toEqual([]);
    const plains = toHand(game, "Plains");
    const [offer] = altOffers(game, abolish);
    expect(offer?.altCostText).toBe("discard a Plains card");
    cast(game, abolish, { targets: [ref(stone)], altCost: true });
    expect(zone(game, plains)).toBe("graveyard");
    expect(zone(game, stone)).toBe("graveyard");
    expect(hand(game)).toHaveLength(1);
  });
});

describe("Foil — discard an Island card and another card rather than pay", () => {
  it("needs an Island card and one more, and discards both", () => {
    const { game, a } = table();
    emptyHand(game);
    lands(game, "Mountain", 1);
    // Alice's own Shock, on the stack, for Foil to counter.
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    const foil = toHand(game, "Foil");
    const island = toHand(game, "Island");
    expect(altOffers(game, foil)).toEqual([]);
    const bears = toHand(game, "Grizzly Bears");
    expect(altOffers(game, foil)).toHaveLength(1);
    const divination = toHand(game, "Divination");
    // The Island card first, then the Bears among the rest.
    a.chooseDiscardsFn = (cards, count) =>
      [island, bears].filter((id) => cards.some((c) => c.id === id)).slice(0, count);
    cast(game, foil, { targets: [ref(shock)], altCost: true });
    expect(zone(game, shock)).toBe("graveyard");
    expect(zone(game, island)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, divination)).toBe("hand");
    expect(life(game, B)).toBe(20);
  });
});

describe("Sickening Shoal — exile a black card with mana value X rather than pay", () => {
  it("offers one X per mana value of a black card in hand, and X is that card's", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const shoal = toHand(game, "Sickening Shoal");
    toHand(game, "Grizzly Bears");
    expect(altOffers(game, shoal)).toEqual([]);
    const ravager = toHand(game, "Gray Merchant of Asphodel");
    const imp = toHand(game, "Typhoid Rats");
    expect(altOffers(game, shoal).map((o) => o.xCost?.maxX).sort()).toEqual([1, 5]);
    cast(game, shoal, { targets: [ref(giant)], altCost: true, x: 5 });
    expect(zone(game, ravager)).toBe("exile");
    expect(zone(game, imp)).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("refuses an X no black card in hand has", () => {
    const { game } = table();
    const shoal = toHand(game, "Sickening Shoal");
    toHand(game, "Typhoid Rats");
    const giant = spawn(game, "Hill Giant", B);
    expect(() => cast(game, shoal, { targets: [ref(giant)], altCost: true, x: 3 })).toThrow(/mana value 3/);
  });

  it("cast for its mana cost, X is paid as usual", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const shoal = toHand(game, "Sickening Shoal");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, shoal, { targets: [ref(bears)], x: 1, settle: false });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Nourishing Shoal — X from the exiled green card", () => {
  it("gains life equal to the exiled card's mana value", () => {
    const { game } = table();
    const shoal = toHand(game, "Nourishing Shoal");
    const giant = toHand(game, "Craw Wurm");
    cast(game, shoal, { altCost: true, x: 6 });
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, A)).toBe(26);
    expect(graveyard(game)).toContain(shoal);
  });
});

describe("Land Grant — reveal your hand rather than pay, with no land cards in it", () => {
  it("is free only with no land card in hand, reveals the hand, and finds a Forest", () => {
    const { game, a } = table();
    emptyHand(game);
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    toLibrary(game, "Forest");
    const grant = toHand(game, "Land Grant");
    const mountain = toHand(game, "Mountain");
    expect(altOffers(game, grant)).toEqual([]);
    game.debugMove(mountain, "graveyard");
    toHand(game, "Grizzly Bears");
    const [offer] = altOffers(game, grant);
    expect(offer?.altCostText).toBe("reveal your hand");
    const revealsBefore = game.eventsOfType("cards-revealed").length;
    cast(game, grant, { altCost: true });
    expect(game.eventsOfType("cards-revealed").length).toBeGreaterThan(revealsBefore);
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Forest")).toBe(true);
  });
});
