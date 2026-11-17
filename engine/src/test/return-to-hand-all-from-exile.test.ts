/**
 * Every card in exile a filter takes, put into its owner's hand at once:
 * `return-to-hand-all`'s `from: "exile"`. Flamewar, Brash Veteran's "{1},
 * Discard your hand: Put all exiled cards you own with intel counters on them
 * into your hand", the cards its back face, Flamewar, Streetwise Operative,
 * exiled face down with intel counters. A face-down card has no
 * characteristics (rule 406.3a), but its owner and counters aren't
 * characteristics (rule 109.3), so the filter still takes it.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, attack, cast, counters, graveyard, hand, lands, life, nextTurn, spawn, table, toExile, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const FRONT = "Flamewar, Brash Veteran";
const BACK = "Flamewar, Streetwise Operative";
const VIA = "more-than-meets-the-eye";

const faceName = (game: Game, id: ObjectId): string => {
  const object = game.state.objects[id];
  return object.faces?.[object.face ?? 0] ?? object.cardName;
};

/** `name` in exile, owned by `owner`, with `intel` intel counters. */
function exiled(game: Game, name: string, owner = A, opts: { intel?: number; faceDown?: boolean } = {}): ObjectId {
  const id = toExile(game, name, owner);
  const card = game.state.objects[id];
  if (opts.intel !== undefined) card.counters.intel = opts.intel;
  if (opts.faceDown === true) card.exiledFaceDown = { lookers: [], group: 7 };
  return id;
}

describe("Flamewar, Streetwise Operative", () => {
  it("deals combat damage: that many cards exiled face down for nobody to see, an intel counter on each, then it converts", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const flamewar = toHand(game, FRONT);
    cast(game, flamewar, { via: VIA, face: 1 });
    expect(faceName(game, flamewar)).toBe(BACK);
    nextTurn(game);
    nextTurn(game);
    const top = game.state.zones.perPlayer[A].library.slice(0, 2);
    attack(game, a, [flamewar]);
    expect(life(game, B)).toBe(18);
    for (const id of top) {
      expect(zone(game, id)).toBe("exile");
      expect(game.state.objects[id].exiledFaceDown?.lookers).toEqual([]);
      expect(counters(game, id, "intel")).toBe(1);
    }
    expect(faceName(game, flamewar)).toBe(FRONT);
  });
});

describe("Flamewar, Brash Veteran", () => {
  it("{1}, discard your hand: every exiled card you own with an intel counter, face down or up, comes to your hand", () => {
    const { game } = table();
    const flamewar = spawn(game, FRONT);
    lands(game, "Mountain", 1);
    const kept = toHand(game, "Lightning Bolt");
    const hidden = exiled(game, "Grizzly Bears", A, { intel: 1, faceDown: true });
    const shown = exiled(game, "Hill Giant", A, { intel: 2 });
    const plain = exiled(game, "Llanowar Elves", A);
    const theirs = exiled(game, "Shock", B, { intel: 1 });
    activate(game, flamewar, 1);
    expect(zone(game, kept)).toBe("graveyard");
    expect(graveyard(game)).toContain(kept);
    expect(hand(game)).toEqual(expect.arrayContaining([hidden, shown]));
    expect(zone(game, plain)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
  });

  it("sacrifice another artifact, as a sorcery: a +1/+1 counter, and it converts", () => {
    const { game } = table();
    const flamewar = spawn(game, FRONT);
    const fodder = spawn(game, "Sol Ring");
    activate(game, flamewar, 0, { sacrifice: fodder });
    expect(zone(game, fodder)).toBe("graveyard");
    expect(counters(game, flamewar)).toBe(1);
    expect(faceName(game, flamewar)).toBe(BACK);
  });
});
