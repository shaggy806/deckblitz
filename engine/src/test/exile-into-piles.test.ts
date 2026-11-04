/**
 * Piles made in exile, nobody separating them (rule 700.3): `exile-into-piles`,
 * face down or face up, one turned up by its controller, an opponent choosing.
 *
 * Proving cards: Hostile Negotiations, Abstract Performance.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, hand, life, lands, table, toHand, zone } from "./harness.js";

const topCards = (game: ReturnType<typeof table>["game"], n: number) => game.state.zones.perPlayer[A].library.slice(0, n);

describe("Hostile Negotiations", () => {
  it("exiles two piles, turns the chosen one up, and the opponent's pick goes to hand", () => {
    const { game, a, b } = table();
    const cards = topCards(game, 6);
    let turning: readonly (readonly string[])[] = [];
    a.choosePileFn = (view, offer) => {
      turning = offer.piles;
      // Alice looks at both, face down to everyone else.
      for (const id of offer.piles.flat()) {
        expect(view.state.objects[id]?.cardName).toBeDefined();
        expect(game.viewFor(B).objects[id]).toBeUndefined();
        expect(game.state.objects[id].exiledFaceDown?.lookers).toEqual([A]);
      }
      expect(offer.fates).toEqual({ chosen: "turned-face-up" });
      expect(offer.faceDown).toBeUndefined();
      return 1;
    };
    let shown: readonly (readonly string[])[] = [];
    b.choosePileFn = (_view, offer) => {
      shown = offer.piles;
      expect(offer.faceDown).toBe(true);
      expect(offer.fates).toEqual({ chosen: "hand", rest: "graveyard" });
      // The turned pile is everyone's now; the other is still Alice's alone.
      expect(game.viewFor(B).objects[offer.piles[1][0]]?.cardName).toBeDefined();
      expect(game.viewFor(B).objects[offer.piles[0][0]]).toBeUndefined();
      expect(game.viewFor(A).objects[offer.piles[0][0]]?.cardName).toBeDefined();
      return 0;
    };
    lands(game, "Swamp", 4);
    const before = life(game);
    const start = hand(game).length;
    cast(game, toHand(game, "Hostile Negotiations"));
    expect(turning).toEqual([cards.slice(0, 3), cards.slice(3)]);
    // Pile 1 of the second offer is the one left face down.
    expect(shown).toEqual([cards.slice(0, 3), cards.slice(3)]);
    for (const id of cards.slice(0, 3)) expect(zone(game, id)).toBe("hand");
    for (const id of cards.slice(3)) expect(zone(game, id)).toBe("graveyard");
    expect(hand(game).length).toBe(start + 3);
    expect(graveyard(game)).toContain(cards[3]);
    expect(life(game)).toBe(before - 3);
  });

  it("the face-down pile is first even when the first was turned up, and a hand card is no longer face down", () => {
    const { game, a, b } = table();
    const cards = topCards(game, 6);
    a.choosePileFn = () => 0;
    b.choosePileFn = (_view, offer) => {
      expect(offer.piles).toEqual([cards.slice(3), cards.slice(0, 3)]);
      return 1;
    };
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Hostile Negotiations"));
    for (const id of cards.slice(0, 3)) {
      expect(zone(game, id)).toBe("hand");
      expect(game.state.objects[id].exiledFaceDown).toBeUndefined();
    }
  });

  it("at four players, the opponent is chosen only once the pile is face up", () => {
    const { game, a, c } = table({ players: 4 });
    const order: string[] = [];
    a.choosePileFn = () => {
      order.push("turn");
      return 0;
    };
    a.chooseModesFn = (_view, _min, _max, texts) => {
      order.push("opponent");
      return [texts.findIndex((text) => text.toLowerCase().includes("carol"))];
    };
    c.choosePileFn = () => {
      order.push("choose");
      return 0;
    };
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Hostile Negotiations"));
    expect(order).toEqual(["turn", "opponent", "choose"]);
    expect(life(game, A)).toBe(17);
  });
});

describe("Abstract Performance", () => {
  it("the chosen pile is milled; the other is looked at, one spell cast free, the rest to hand", () => {
    const { game, a, b } = table();
    const cards = topCards(game, 8);
    b.choosePileFn = (_view, offer) => {
      expect(offer.faceDown).toBe(true);
      expect(offer.piles).toEqual([cards.slice(0, 4), cards.slice(4)]);
      // Nobody has looked at the face-down pile, its owner included.
      expect(game.viewFor(A).objects[cards[0]]).toBeUndefined();
      expect(game.viewFor(B).objects[cards[4]]?.cardName).toBeDefined();
      return 1;
    };
    let asked = 0;
    a.chooseCastNowFn = () => {
      asked += 1;
      return null;
    };
    lands(game, "Island", 6);
    const start = hand(game).length;
    cast(game, toHand(game, "Abstract Performance"));
    for (const id of cards.slice(4)) expect(zone(game, id)).toBe("graveyard");
    for (const id of cards.slice(0, 4)) expect(zone(game, id)).toBe("hand");
    // Wastes aren't spells: nothing to cast, the rest all to hand.
    expect(asked).toBe(0);
    expect(hand(game).length).toBe(start + 4);
  });

  it("a spell from the face-down pile is looked at and cast free, the rest to hand", () => {
    const { game, a, b } = table({ deck: "Divination" });
    const cards = topCards(game, 8);
    b.choosePileFn = () => 1;
    let offered: readonly string[] = [];
    a.chooseCastNowFn = (view, offer) => {
      offered = offer.cards;
      // Looked at now: Alice's alone to see.
      expect(view.state.objects[cards[0]]?.cardName).toBe("Divination");
      expect(game.viewFor(B).objects[cards[0]]).toBeUndefined();
      return { type: "cast-spell", player: A, card: cards[0], targets: [], via: "effect", free: true };
    };
    lands(game, "Island", 6);
    const start = hand(game).length;
    cast(game, toHand(game, "Abstract Performance"));
    expect(offered).toEqual(cards.slice(0, 4));
    expect(zone(game, cards[0])).toBe("graveyard");
    for (const id of cards.slice(1, 4)) expect(zone(game, id)).toBe("hand");
    for (const id of cards.slice(4)) expect(zone(game, id)).toBe("graveyard");
    // The three left, and Divination's two.
    expect(hand(game).length).toBe(start + 5);
  });

  it("declining the cast leaves every card to the hand", () => {
    const { game, a, b } = table({ deck: "Divination" });
    const cards = topCards(game, 8);
    b.choosePileFn = () => 0;
    let asked = 0;
    a.chooseCastNowFn = () => {
      asked += 1;
      return null;
    };
    lands(game, "Island", 6);
    cast(game, toHand(game, "Abstract Performance"));
    expect(asked).toBe(1);
    for (const id of cards.slice(0, 4)) expect(zone(game, id)).toBe("graveyard");
    for (const id of cards.slice(4)) expect(zone(game, id)).toBe("hand");
  });
});
