/**
 * Separating cards a resolution exiled first (rule 700.3): `separate-into-piles`
 * over `{ thisWay: "exiled" }` — the cards still in exile, face up — and a
 * pile whose fate is to be played from free (`play-free`).
 *
 * Proving cards: Brilliant Ultimatum (the top five, an opponent separates,
 * you play from one pile), Boneyard Parley (target creature cards from any
 * graveyard, the pile you choose onto the battlefield under your control),
 * Split the Spoils (you separate, an opponent chooses the pile for your hand).
 */

import { describe, expect, it } from "vitest";
import type { ChoosePileOffer, SeparatePilesOffer } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, controller, graveyard, hand, lands, ref, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

/** Named cards on top of `player`'s library, the first on top. */
function onTop(game: Parameters<typeof toLibrary>[0], names: readonly string[]): ObjectId[] {
  return [...names].reverse().map((name) => toLibrary(game, name)).reverse();
}

function ultimatumMana(game: Parameters<typeof lands>[0]): void {
  lands(game, "Plains", 2);
  lands(game, "Island", 3);
  lands(game, "Swamp", 2);
}

describe("Brilliant Ultimatum", () => {
  it("exiles five, an opponent separates them in exile, and you play a land and cast a spell free from your pile", () => {
    const { game, a, b } = table();
    // The harness allows many land plays a turn; the rules allow one.
    game.state.rules.maxLandsPerTurn = 1;
    const cards = onTop(game, ["Island", "Divination", "Forest", "Grizzly Bears", "Shock"]);
    ultimatumMana(game);
    let separating: SeparatePilesOffer | undefined;
    b.separatePilesFn = (_view, offer) => {
      separating = offer;
      // Island, Divination and Forest together; the rest the other pile.
      return [cards.slice(0, 3), cards.slice(3)];
    };
    let choosing: ChoosePileOffer | undefined;
    a.choosePileFn = (_view, offer) => {
      choosing = offer;
      return 0;
    };
    const offers: (readonly ObjectId[])[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offers.push(offer.cards);
      if (offers.length === 1) return { type: "play-land", player: A, card: cards[0] };
      if (offers.length === 2) {
        return { type: "cast-spell", player: A, card: cards[1], targets: [], via: "effect", free: true };
      }
      return null;
    };
    const start = hand(game).length;
    cast(game, toHand(game, "Brilliant Ultimatum"));
    // Separated in exile, face up, by the opponent; you choose.
    expect(separating?.objects).toEqual(cards);
    expect(separating?.chooser).toBe(A);
    expect(separating?.fates).toEqual({ chosen: "play-free" });
    expect(choosing?.piles).toEqual([cards.slice(0, 3), cards.slice(3)]);
    // Only the chosen pile is offered; after the land, the second land isn't
    // (one land play a turn), but the spell is.
    expect(offers[0]).toEqual(cards.slice(0, 3));
    expect(offers[1]).not.toContain(cards[2]);
    expect(offers[1]).toContain(cards[1]);
    expect(zone(game, cards[0])).toBe("battlefield");
    // Divination was cast free and resolved: two cards drawn.
    expect(zone(game, cards[1])).toBe("graveyard");
    expect(hand(game).length).toBe(start + 2);
    // The land not played and the other pile stay exiled.
    for (const id of [cards[2], ...cards.slice(3)]) expect(zone(game, id)).toBe("exile");
  });

  it("declining leaves every card exiled", () => {
    const { game, a, b } = table();
    const cards = onTop(game, ["Divination", "Shock", "Island", "Grizzly Bears", "Forest"]);
    ultimatumMana(game);
    b.separatePilesFn = (_view, offer) => [[], [...offer.objects]];
    a.choosePileFn = () => 1;
    let asked = 0;
    a.chooseCastNowFn = () => {
      asked += 1;
      return null;
    };
    cast(game, toHand(game, "Brilliant Ultimatum"));
    expect(asked).toBe(1);
    for (const id of cards) expect(zone(game, id)).toBe("exile");
  });

  it("at four players, you choose the opponent who separates", () => {
    const { game, a, c } = table({ players: 4 });
    onTop(game, ["Island", "Divination", "Forest", "Grizzly Bears", "Shock"]);
    ultimatumMana(game);
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.findIndex((text) => text.toLowerCase().includes("carol"))];
    let separator: string | undefined;
    c.separatePilesFn = (view, offer) => {
      separator = view.player;
      return [[], [...offer.objects]];
    };
    a.choosePileFn = () => 0;
    a.chooseCastNowFn = () => null;
    cast(game, toHand(game, "Brilliant Ultimatum"));
    expect(separator).toBe(C);
  });
});

describe("Boneyard Parley", () => {
  it("exiles creature cards from any graveyard; the pile you choose comes under your control, the rest to their owners' graveyards", () => {
    const { game, a, b } = table();
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const theirs2 = toGraveyard(game, "Llanowar Elves", B);
    const mine = toGraveyard(game, "Hill Giant", A);
    lands(game, "Swamp", 7);
    let separating: SeparatePilesOffer | undefined;
    b.separatePilesFn = (_view, offer) => {
      separating = offer;
      return [[theirs], [theirs2, mine]];
    };
    a.choosePileFn = () => 0;
    cast(game, toHand(game, "Boneyard Parley"), { targets: [ref(theirs), ref(theirs2), ref(mine)] });
    expect(separating?.fates).toEqual({ chosen: "battlefield", rest: "graveyard" });
    // Each card counts for whoever would get it: the caster, onto the battlefield.
    expect(separating?.whose[theirs]).toBe(A);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(A);
    expect(graveyard(game, B)).toContain(theirs2);
    expect(graveyard(game, A)).toContain(mine);
  });

  it("a target gone before it resolves isn't separated", () => {
    const { game, a, b } = table();
    const gone = toGraveyard(game, "Grizzly Bears", B);
    const stays = toGraveyard(game, "Hill Giant", B);
    lands(game, "Swamp", 7);
    let objects: readonly ObjectId[] = [];
    b.separatePilesFn = (_view, offer) => {
      objects = offer.objects;
      return [[...offer.objects], []];
    };
    a.choosePileFn = () => 0;
    cast(game, toHand(game, "Boneyard Parley"), { targets: [ref(gone), ref(stays)], settle: false });
    game.debugMove(gone, "exile");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(objects).toEqual([stays]);
    expect(zone(game, stays)).toBe("battlefield");
    expect(zone(game, gone)).toBe("exile");
  });
});

describe("Split the Spoils", () => {
  it("you separate the exiled cards; the opponent's pick goes to your hand, the other to your graveyard", () => {
    const { game, a, b } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const island = toGraveyard(game, "Island");
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Forest", 3);
    let separator: string | undefined;
    a.separatePilesFn = (view, offer) => {
      separator = view.player;
      expect(offer.objects).toEqual([bears, island, giant]);
      return [[bears], [island, giant]];
    };
    b.choosePileFn = () => 1;
    cast(game, toHand(game, "Split the Spoils"), { targets: [ref(bears), ref(island), ref(giant)] });
    expect(separator).toBe(A);
    expect(hand(game)).toEqual(expect.arrayContaining([island, giant]));
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("an empty pile chosen sends every card back to the graveyard (the ruling)", () => {
    const { game, a, b } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Forest", 3);
    a.separatePilesFn = (_view, offer) => [[], [...offer.objects]];
    b.choosePileFn = () => 0;
    cast(game, toHand(game, "Split the Spoils"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("can't target an instant or sorcery card", () => {
    const { game } = table();
    const shock = toGraveyard(game, "Shock");
    lands(game, "Forest", 3);
    expect(() => cast(game, toHand(game, "Split the Spoils"), { targets: [ref(shock)] })).toThrow(/target/i);
  });
});
