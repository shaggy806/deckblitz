/**
 * "That player exiles a card from it, then you exile a card from it. Repeat
 * this process until all cards in that hand have been exiled. That player
 * returns the cards they exiled this way to their hand and puts the rest
 * into their graveyard" (Struggle for Sanity): a `repeat` of an `as-player`
 * `discard-chosen` exile and the caster's own, then `move-exiled-this-way`
 * `exiledBy` (the cards whose `exiledByPlayer` is that player) to hand and the
 * rest to the graveyard.
 */
import { describe, expect, it } from "vitest";

import { B, cast, hand, lands, ref, settle, table, toHand, zone } from "./harness.js";
import type { ObjectId } from "../primitives.js";

describe("Struggle for Sanity", () => {
  it("alternates the picks, the opponent first; theirs go back to hand, the caster's to the graveyard", () => {
    const { game, a, b } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 4);
    const bolt = toHand(game, "Lightning Bolt", B);
    const bears = toHand(game, "Grizzly Bears", B);
    const ogre = toHand(game, "Gray Ogre", B);
    const giant = toHand(game, "Hill Giant", B);
    const spell = toHand(game, "Struggle for Sanity");
    const order: string[] = [];
    const theirPicks = [bolt, ogre];
    const myPicks = [bears, giant];
    b.chooseFromZoneFn = (_view, eligible) => {
      const id = theirPicks.find((c) => eligible.includes(c))!;
      order.push(`b:${game.state.objects[id].cardName}`);
      return [id];
    };
    a.chooseFromZoneFn = (_view, eligible) => {
      const id = myPicks.find((c) => eligible.includes(c))!;
      order.push(`a:${game.state.objects[id].cardName}`);
      return [id];
    };
    cast(game, spell, { targets: [ref(B)] });
    settle(game);
    expect(order).toEqual(["b:Lightning Bolt", "a:Grizzly Bears", "b:Gray Ogre", "a:Hill Giant"]);
    expect([...hand(game, B)].sort()).toEqual([bolt, ogre].sort());
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, spell)).toBe("graveyard");
  });

  it("with an odd hand the opponent exiles the last card, and gets it back", () => {
    const { game, a, b } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 4);
    const cards: ObjectId[] = [
      toHand(game, "Lightning Bolt", B),
      toHand(game, "Grizzly Bears", B),
      toHand(game, "Gray Ogre", B),
    ];
    let asked = 0;
    b.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    a.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      return [eligible[0]];
    };
    cast(game, toHand(game, "Struggle for Sanity"), { targets: [ref(B)] });
    settle(game);
    // The caster chose once: the hand was empty when their second turn came.
    expect(asked).toBe(1);
    expect(cards.filter((id) => zone(game, id) === "hand")).toHaveLength(2);
    expect(cards.filter((id) => zone(game, id) === "graveyard")).toHaveLength(1);
  });

  it("an empty hand: nothing is asked", () => {
    const { game, a, b } = table({ openingHandSize: 0 });
    lands(game, "Swamp", 4);
    const refuse = (): never => {
      throw new Error("asked about an empty hand");
    };
    a.chooseFromZoneFn = refuse;
    b.chooseFromZoneFn = refuse;
    const spell = toHand(game, "Struggle for Sanity");
    cast(game, spell, { targets: [ref(B)] });
    settle(game);
    expect(zone(game, spell)).toBe("graveyard");
  });
});
