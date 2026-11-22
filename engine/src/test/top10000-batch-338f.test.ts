/**
 * B338 (author-top-cards overnight), decisions lane, agent f: Rites of
 * Initiation — "discard any number of cards at random" is a resolution-time
 * `choose-value` number, then a random `discard` of that many, with no engine
 * code of its own.
 */
import { describe, expect, it } from "vitest";

import { cast, graveyard, hand, lands, pt, spawn, table, toHand } from "./harness.js";

describe("Rites of Initiation", () => {
  it("discards the chosen number of cards at random, then pumps creatures you control by that many", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    const rites = toHand(game, "Rites of Initiation");
    for (let i = 0; i < 4; i++) toHand(game, "Grizzly Bears");
    const handBefore = hand(game).length;
    let offered: { min: number; max?: number } | undefined;
    a.chooseNumberFn = (_view, offer) => {
      offered = offer;
      return 3;
    };
    const before = graveyard(game).length;
    cast(game, rites);
    expect(offered?.min).toBe(0);
    // Asked as it resolves, after Rites itself left the hand.
    expect(offered?.max).toBe(handBefore - 1);
    expect(hand(game)).toHaveLength(handBefore - 4);
    // Three discarded plus Rites itself.
    expect(graveyard(game).length - before).toBe(4);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
  });

  it("choosing zero discards nothing and pumps nothing", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    const rites = toHand(game, "Rites of Initiation");
    toHand(game, "Grizzly Bears");
    const handBefore = hand(game).length;
    a.chooseNumberFn = () => 0;
    cast(game, rites);
    expect(hand(game)).toHaveLength(handBefore - 1);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});
