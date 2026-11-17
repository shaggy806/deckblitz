/**
 * "If a creature you control would explore, instead you scry 1, then that
 * creature explores" (Twists and Turns): a `would-explore` replacement whose
 * `also` (the scry) is done first, by its controller, then the exploration,
 * not replaced again (rule 614.5). Two of them scry twice (the ruling); with
 * Topography Tracker the scry comes first and the explorations multiply.
 */
import { describe, expect, it } from "vitest";

import { A, B, counters, enter, hand, lands, pickModes, pickTargets, spawn, table, toLibrary, zone } from "./harness.js";

describe("Twists and Turns", () => {
  it("its enters trigger: scry 1 first, then the target explores what's on top after it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = toLibrary(game, "Llanowar Elves");
    const forest = toLibrary(game, "Forest");
    const scried: string[][] = [];
    a.chooseScryFn = (_view, cards) => {
      scried.push(cards.map((id) => game.state.objects[id].cardName));
      return cards; // the Forest to the bottom
    };
    pickTargets(a, bears);
    pickModes(a); // leave the Elves on top
    enter(game, "Twists and Turns");
    expect(scried).toEqual([["Forest"]]);
    expect(game.state.zones.perPlayer[A].library.at(-1)).toBe(forest);
    expect(counters(game, bears)).toBe(1);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(elves);
  });

  it("a land left on top by the scry goes to hand as the creature explores", () => {
    const { game, a } = table();
    spawn(game, "Twists and Turns");
    const forest = toLibrary(game, "Forest");
    let asked = 0;
    a.chooseScryFn = () => {
      asked += 1;
      return [];
    };
    const scout = enter(game, "Cenote Scout");
    expect(asked).toBe(1);
    expect(zone(game, forest)).toBe("hand");
    expect(counters(game, scout)).toBe(0);
  });

  it("two of them scry twice before it explores, and Topography Tracker still doubles the explorations", () => {
    const { game, a } = table();
    spawn(game, "Twists and Turns");
    spawn(game, "Twists and Turns");
    spawn(game, "Topography Tracker");
    toLibrary(game, "Grizzly Bears");
    let asked = 0;
    a.chooseScryFn = () => {
      asked += 1;
      return [];
    };
    pickModes(a);
    const scout = enter(game, "Cenote Scout");
    expect(asked).toBe(2);
    expect(counters(game, scout)).toBe(2);
  });

  it("leaves an opponent's creature's exploring alone", () => {
    const { game, a, b } = table();
    spawn(game, "Twists and Turns", A);
    toLibrary(game, "Grizzly Bears", B);
    let asked = 0;
    a.chooseScryFn = () => {
      asked += 1;
      return [];
    };
    b.chooseScryFn = a.chooseScryFn;
    pickModes(b);
    const scout = enter(game, "Cenote Scout", B);
    expect(asked).toBe(0);
    expect(counters(game, scout)).toBe(1);
  });

  it("transforms into Mycoid Maze when a land enters while you control seven or more", () => {
    const { game } = table();
    const twists = spawn(game, "Twists and Turns");
    lands(game, "Forest", 5);
    enter(game, "Forest");
    expect(game.state.objects[twists].face ?? 0).toBe(0);
    const cards = hand(game).length;
    enter(game, "Forest");
    expect(game.state.objects[twists].face).toBe(1);
    expect(hand(game).length).toBe(cards);
  });
});
