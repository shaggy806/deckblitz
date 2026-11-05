/**
 * "An opponent separates" and "an opponent chooses" (`separate-into-piles`'s
 * `"an-opponent"`): which opponent is named as the text reaches them (rule
 * 608.2c), so with the cards revealed and, for a chooser, the piles made. At
 * two players nobody is asked; at three the order is what these pin.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, graveyard, hand, lands, table, toHand, toLibrary } from "./harness.js";

function topFive(game: Parameters<typeof toLibrary>[0]): ObjectId[] {
  const names = ["Grizzly Bears", "Shock", "Island", "Counterspell", "Llanowar Elves"];
  return [...names].reverse().map((name) => toLibrary(game, name)).reverse();
}

describe("an opponent named after the cards are revealed", () => {
  it("Fact or Fiction: you see the five, then name who separates, then choose the pile", () => {
    const { game, a, b, c } = table({ players: 3 });
    const cards = topFive(game);
    lands(game, "Island", 4);
    const order: string[] = [];
    let revealedWhenNaming: boolean | undefined;
    a.chooseModesFn = (_view, _min, _max, texts) => {
      order.push("name");
      revealedWhenNaming = cards.every((id) => game.state.revealedThisTurn.includes(id));
      expect(texts).toEqual(["Choose Bob", "Choose Carol"]);
      return [1];
    };
    b.separatePilesFn = () => {
      throw new Error("Bob wasn't named");
    };
    c.separatePilesFn = (_view, offer) => {
      order.push("separate");
      expect(offer.chooser).toBe(A);
      expect(offer.anOpponentChooses).toBeUndefined();
      return [cards.slice(0, 2), cards.slice(2)];
    };
    a.choosePileFn = (_view, offer) => {
      order.push("choose");
      expect(offer.separator).toBe(C);
      return 1;
    };
    cast(game, toHand(game, "Fact or Fiction"));
    expect(order).toEqual(["name", "separate", "choose"]);
    expect(revealedWhenNaming).toBe(true);
    for (const id of cards.slice(2)) expect(hand(game)).toContain(id);
    for (const id of cards.slice(0, 2)) expect(graveyard(game)).toContain(id);
  });
});

describe("an opponent named after the piles are made", () => {
  it("Steam Augury: you separate, then name who chooses, and they choose", () => {
    const { game, a, b, c } = table({ players: 3 });
    const cards = topFive(game);
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    const order: string[] = [];
    a.separatePilesFn = (_view, offer) => {
      order.push("separate");
      // Nobody is the chooser yet, and the offer says so.
      expect(offer.anOpponentChooses).toBe(true);
      return [cards.slice(0, 1), cards.slice(1)];
    };
    a.chooseModesFn = (_view, _min, _max, texts) => {
      order.push("name");
      expect(texts).toEqual(["Choose Bob", "Choose Carol"]);
      return [0];
    };
    b.choosePileFn = (_view, offer) => {
      order.push("choose");
      expect(offer.piles).toEqual([cards.slice(0, 1), cards.slice(1)]);
      expect(offer.separator).toBe(A);
      return 0;
    };
    c.choosePileFn = () => {
      throw new Error("Carol wasn't named");
    };
    const handBefore = hand(game).length;
    cast(game, toHand(game, "Steam Augury"));
    expect(order).toEqual(["separate", "name", "choose"]);
    expect(hand(game).length).toBe(handBefore + 1);
    expect(hand(game)).toContain(cards[0]);
    for (const id of cards.slice(1)) expect(graveyard(game)).toContain(id);
  });

  it("at two players the one opponent is the chooser from the start, and nothing's asked", () => {
    const { game, a, b } = table();
    const cards = topFive(game);
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    a.chooseModesFn = () => {
      throw new Error("nobody to name");
    };
    a.separatePilesFn = (_view, offer) => {
      expect(offer.chooser).toBe(B);
      expect(offer.anOpponentChooses).toBeUndefined();
      return [cards.slice(0, 2), cards.slice(2)];
    };
    b.choosePileFn = () => 1;
    cast(game, toHand(game, "Steam Augury"));
    for (const id of cards.slice(2)) expect(hand(game)).toContain(id);
  });
});
