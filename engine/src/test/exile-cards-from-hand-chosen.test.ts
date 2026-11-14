/**
 * "Its controller exiles cards from their hand equal to the difference": a
 * `for-each-player` about the destroyed creature's controller (as it last
 * existed, rule 608.2h) with a `look-and-choose` of theirs, as many as their
 * hand holds past four. Isildur's Fateful Strike, a legendary instant (rule
 * 205.4e).
 */

import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";
import { B, cast, hand, lands, pickFromZone, ref, spawn, table, toHand, zone } from "./harness.js";

type G = ReturnType<typeof table>["game"];

/** `player`'s hand made exactly `n` new cards. */
const handOf = (game: G, player: PlayerId, n: number): ObjectId[] => {
  for (const id of [...hand(game, player)]) game.debugMove(id, "library");
  return Array.from({ length: n }, () => toHand(game, "Grizzly Bears", player));
};

describe("Isildur's Fateful Strike", () => {
  it("can't be cast without a legendary creature or planeswalker", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    expect(() => cast(game, toHand(game, "Isildur's Fateful Strike"), { targets: [ref(bears)] })).toThrow(/205\.4e/);
  });

  it("destroys the creature, and its controller exiles the cards they choose past four", () => {
    const { game, b } = table();
    spawn(game, "Isamaru, Hound of Konda");
    const bears = spawn(game, "Grizzly Bears", B);
    const cards = handOf(game, B, 7);
    const chosen = cards.slice(0, 3);
    const seen = pickFromZone(b, ...chosen);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Isildur's Fateful Strike"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(seen.offered.length).toBe(7);
    for (const id of chosen) expect(zone(game, id)).toBe("exile");
    expect(hand(game, B).length).toBe(4);
  });

  it("asks nothing of a controller with four or fewer", () => {
    const { game, b } = table();
    spawn(game, "Isamaru, Hound of Konda");
    const bears = spawn(game, "Grizzly Bears", B);
    handOf(game, B, 4);
    let asked = false;
    b.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Isildur's Fateful Strike"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(asked).toBe(false);
    expect(hand(game, B).length).toBe(4);
  });

  it("an indestructible creature survives, and its controller still exiles", () => {
    const { game, b } = table();
    spawn(game, "Isamaru, Hound of Konda");
    const god = spawn(game, "Darksteel Myr", B);
    const cards = handOf(game, B, 6);
    pickFromZone(b, ...cards.slice(0, 2));
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Isildur's Fateful Strike"), { targets: [ref(god)] });
    expect(zone(game, god)).toBe("battlefield");
    expect(hand(game, B).length).toBe(4);
  });
});
