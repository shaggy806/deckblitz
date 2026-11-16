/**
 * An "any number of target …" group whose count is read from another of the
 * spell's targets (`maxReadsSlot`): Reap's "up to X target cards from your
 * graveyard, where X is the number of black permanents target opponent
 * controls as you cast this spell". The count is set as the targets are
 * announced and doesn't change after (rule 601.2c, the ruling). Written from
 * the Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { groupBounds, slotOptions } from "../target.js";
import type { TargetRef, TargetSpec } from "../target.js";
import { A, B, C, cast, destroy, hand, lands, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

/** Reap's cast offer for alice. */
function offer(game: Game, card: ObjectId): { specs: readonly TargetSpec[]; options: readonly (readonly TargetRef[])[] } {
  for (const legal of game.legalActions(A)) {
    if (legal.kind === "cast-spell" && legal.card === card) return { specs: legal.targetSpecs, options: legal.targetOptions };
  }
  throw new Error("Reap isn't offered");
}

/** Two black permanents for bob, none for carol; three cards in alice's graveyard. */
function board(players: 2 | 3 = 3) {
  const t = table({ players });
  spawn(t.game, "Gravedigger", B);
  spawn(t.game, "Phyrexian Arena", B);
  spawn(t.game, "Hill Giant", B);
  const cards = ["Grizzly Bears", "Hill Giant", "Gray Ogre"].map((name) => toGraveyard(t.game, name));
  lands(t.game, "Forest", 2);
  return { ...t, cards, reap: toHand(t.game, "Reap") };
}

describe("Reap", () => {
  it("offers each opponent's count with the group, for the target picked before it", () => {
    const { game, reap } = board();
    const { specs, options } = offer(game, reap);
    const group = specs[1];
    expect(typeof group === "object" && group.kind === "any-number" ? group.maxFor : undefined).toEqual({
      slot: 0,
      by: [
        { target: ref(B), n: 2 },
        { target: ref(C), n: 0 },
      ],
    });
    expect(groupBounds(group, [ref(B)]).max).toBe(2);
    expect(groupBounds(group, [ref(C)]).max).toBe(0);
    // Two picked for bob: no third.
    expect(slotOptions(specs, options, 1, [ref(B)])).toHaveLength(3);
    const [first, second] = options[1];
    expect(slotOptions(specs, options, 3, [ref(B), first, second])).toEqual([]);
    expect(slotOptions(specs, options, 1, [ref(C)])).toEqual([]);
  });

  it("returns up to as many cards as the targeted opponent controls black permanents", () => {
    const { game, reap, cards } = board();
    cast(game, reap, { targets: [ref(B), ref(cards[0]), ref(cards[1])] });
    expect(zone(game, cards[0])).toBe("hand");
    expect(zone(game, cards[1])).toBe("hand");
    expect(zone(game, cards[2])).toBe("graveyard");
  });

  it("refuses more targets than that count", () => {
    const { game, reap, cards } = board();
    expect(() => cast(game, reap, { targets: [ref(B), ...cards.map(ref)] })).toThrow(/at most 2/);
  });

  it("an opponent with no black permanents allows none, and Reap is still cast at them", () => {
    const { game, reap, cards } = board();
    expect(() => cast(game, reap, { targets: [ref(C), ref(cards[0])] })).toThrow(/at most 0/);
    cast(game, reap, { targets: [ref(C)] });
    expect(zone(game, reap)).toBe("graveyard");
    expect(zone(game, cards[0])).toBe("graveyard");
  });

  it("the count isn't read again: a black permanent gone before it resolves takes no card back (the ruling)", () => {
    const { game, reap, cards } = board(2);
    const [digger] = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Gravedigger");
    cast(game, reap, { targets: [ref(B), ref(cards[0]), ref(cards[1])], settle: false });
    destroy(game, digger);
    settle(game);
    expect(hand(game)).toEqual(expect.arrayContaining([cards[0], cards[1]]));
  });
});
