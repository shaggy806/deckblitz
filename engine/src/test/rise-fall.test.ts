/**
 * Rise // Fall: Rise returns a creature card from any graveyard and a
 * creature on the battlefield to their owners' hands; Fall reveals two cards
 * at random from a hand (`choose-random-card` `count`) and discards the
 * nonland ones among them.
 */
import { describe, expect, it } from "vitest";

import { B, cast, hand, lands, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Rise // Fall", () => {
  it("Rise: a creature card from an opponent's graveyard and a creature, each to its owner's hand", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const dead = toGraveyard(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Gray Ogre", B);
    cast(game, toHand(game, "Rise // Fall"), { face: 1, targets: [ref(dead), ref(ogre)] });
    expect(hand(game, B)).toContain(dead);
    expect(hand(game, B)).toContain(ogre);
  });

  it("Fall: of the two revealed, the nonland card is discarded and the land kept", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const forest = toHand(game, "Forest", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, toHand(game, "Rise // Fall"), { face: 2, targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, forest)).toBe("hand");
  });

  it("Fall: only two of a bigger hand are revealed", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    for (let i = 0; i < 5; i += 1) toHand(game, "Lightning Bolt", B);
    cast(game, toHand(game, "Rise // Fall"), { face: 2, targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(3);
    expect(game.state.zones.perPlayer[B].graveyard).toHaveLength(2);
  });
});
