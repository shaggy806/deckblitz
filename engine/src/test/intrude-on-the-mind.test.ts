/**
 * Intrude on the Mind: you separate the five revealed cards (rule 700.3), an
 * opponent of your choice chooses the pile for your hand, and the 0/0 Thopter
 * gets a +1/+1 counter for each card the other pile put into your graveyard
 * (`thisWay: "put-into-graveyard"`, read after the piles' decisions).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, graveyard, hand, keywords, lands, pt, table, toHand, toLibrary, zone } from "./harness.js";

function topFive(game: Game): ObjectId[] {
  const names = ["Grizzly Bears", "Shock", "Island", "Counterspell", "Llanowar Elves"];
  return [...names].reverse().map((name) => toLibrary(game, name)).reverse();
}

const thopters = (game: Game): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken === true && game.state.objects[id].cardName.startsWith("Thopter"));

describe("Intrude on the Mind", () => {
  it("you separate, the opponent picks your hand's pile, and the Thopter counts the rest", () => {
    const { game, a, b } = table();
    const cards = topFive(game);
    lands(game, "Island", 5);
    a.separatePilesFn = (_view, offer) => {
      expect(offer.objects).toEqual(cards);
      expect(offer.chooser).toBe(B);
      expect(offer.fates).toEqual({ chosen: "hand", rest: "graveyard" });
      return [cards.slice(0, 2), cards.slice(2)];
    };
    b.choosePileFn = (_view, offer) => {
      expect(offer.separator).toBe(A);
      return 0;
    };
    cast(game, toHand(game, "Intrude on the Mind"));
    for (const id of cards.slice(0, 2)) expect(hand(game)).toContain(id);
    for (const id of cards.slice(2)) expect(graveyard(game)).toContain(id);
    const [thopter] = thopters(game);
    expect(thopter).toBeDefined();
    expect(game.state.objects[thopter].controller).toBe(A);
    expect(counters(game, thopter)).toBe(3);
    expect(pt(game, thopter)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, thopter).has("flying")).toBe(true);
  });

  it("all five in your hand leave the Thopter a 0/0, which dies", () => {
    const { game, a, b } = table();
    const cards = topFive(game);
    lands(game, "Island", 5);
    a.separatePilesFn = () => [cards, []];
    b.choosePileFn = () => 0;
    cast(game, toHand(game, "Intrude on the Mind"));
    for (const id of cards) expect(zone(game, id)).toBe("hand");
    expect(thopters(game)).toEqual([]);
  });

  it("all five binned make a 5/5 (rule 700.3d: the other pile is empty)", () => {
    const { game, a, b } = table();
    const cards = topFive(game);
    lands(game, "Island", 5);
    a.separatePilesFn = () => [[], cards];
    b.choosePileFn = () => 0;
    cast(game, toHand(game, "Intrude on the Mind"));
    for (const id of cards) expect(zone(game, id)).toBe("graveyard");
    const [thopter] = thopters(game);
    expect(counters(game, thopter)).toBe(5);
  });

  it("at three players you name the opponent who chooses once the piles are made", () => {
    const { game, a, b, c } = table({ players: 3 });
    const cards = topFive(game);
    lands(game, "Island", 5);
    const order: string[] = [];
    a.separatePilesFn = (_view, offer) => {
      order.push("separate");
      expect(offer.anOpponentChooses).toBe(true);
      return [cards.slice(0, 4), cards.slice(4)];
    };
    a.chooseModesFn = (_view, _min, _max, texts) => {
      order.push("name");
      expect(texts).toEqual(["Choose Bob", "Choose Carol"]);
      return [1];
    };
    b.choosePileFn = () => {
      throw new Error("Bob wasn't named");
    };
    c.choosePileFn = (_view, offer) => {
      order.push("choose");
      expect(offer.separator).toBe(A);
      return 1;
    };
    cast(game, toHand(game, "Intrude on the Mind"));
    expect(order).toEqual(["separate", "name", "choose"]);
    expect(hand(game)).toContain(cards[4]);
    const [thopter] = thopters(game);
    expect(counters(game, thopter)).toBe(4);
  });
});
