/**
 * A resolved "the next time you would draw a card this turn, instead …"
 * (rule 614.1a) reads its ability's X when it applies: Aladdin's Lamp's
 * "look at the top X cards of your library, put all but one of them on the
 * bottom of your library in a random order, then draw a card".
 */
import { describe, expect, it } from "vitest";

import { A, activate, cast, hand, lands, pickFromZone, spawn, table, toHand, toLibrary } from "./harness.js";

describe("Aladdin's Lamp", () => {
  it("the next draw looks at the top X, keeps one on top and draws it; the rest go to the bottom", () => {
    const { game, a } = table();
    const lamp = spawn(game, "Aladdin's Lamp");
    lands(game, "Island", 6);
    const library = game.state.zones.perPlayer[A].library;
    // Five cards on top, whatever was there below them.
    const cards = ["Forest", "Swamp", "Mountain", "Plains", "Wastes"].map((name) => toLibrary(game, name));
    // Put ours on top in that order.
    game.state.zones.perPlayer[A].library = [...cards, ...library.filter((id) => !cards.includes(id))];
    activate(game, lamp, 0, { x: 3 });
    const top3 = game.state.zones.perPlayer[A].library.slice(0, 3);
    expect(top3).toEqual(cards.slice(0, 3));
    const seen = pickFromZone(a, cards[2]);
    const before = hand(game).length;
    // Divination: two draws, the first replaced.
    cast(game, toHand(game, "Divination"));
    expect(seen.offered).toEqual(cards.slice(0, 3));
    // The Mountain kept and drawn, then Plains (now on top) by the second draw.
    expect(hand(game)).toContain(cards[2]);
    expect(hand(game)).toContain(cards[3]);
    expect(hand(game).length).toBe(before + 2);
    const now = game.state.zones.perPlayer[A].library;
    expect(now.slice(-2).sort()).toEqual([cards[0], cards[1]].sort());
    expect(now[0]).toBe(cards[4]);
  });

  it("X can't be 0", () => {
    const { game } = table();
    const lamp = spawn(game, "Aladdin's Lamp");
    lands(game, "Island", 1);
    expect(() => activate(game, lamp, 0, { x: 0 })).toThrow();
  });
});
