/**
 * "You may cast a spell from your hand without paying its mana cost if it has
 * the same name as a spell that was cast this turn" (Twinning Glass):
 * `CardFilter.sameNameAsSpellCastThisTurn`, any player's spell (the ruling),
 * named as it was on the stack (rule 201.2a), from `spellsCastThisTurnAs`.
 */
import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, B, activate, cast, hand, lands, ref, spawn, table, toHand, zone, life } from "./harness.js";

/** Alice's seat casts the first offered card (and records what was offered). */
function takeFirst(seat: ScriptedController, offered: ObjectId[][]): void {
  seat.chooseCastNowFn = (_view, offer) => {
    offered.push(offer.casts.map((c) => c.card));
    const way = offer.casts[0];
    if (way === undefined) return null;
    return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
}

describe("Twinning Glass", () => {
  it("offers only a card with the name of a spell cast this turn, and casts it free", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const glass = spawn(game, "Twinning Glass", A);
    const first = toHand(game, "Grizzly Bears");
    const second = toHand(game, "Grizzly Bears");
    toHand(game, "Llanowar Elves");
    cast(game, first);
    expect(zone(game, first)).toBe("battlefield");
    const offered: ObjectId[][] = [];
    takeFirst(a, offered);
    activate(game, glass);
    expect(offered).toEqual([[second]]);
    expect(zone(game, second)).toBe("battlefield");
    // Two Forests paid for the first Bears, one for the Glass: none for this one.
    expect(hand(game).includes(second)).toBe(false);
  });

  it("counts an opponent's spell: it doesn't matter who cast the first one", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1, B);
    lands(game, "Forest", 3);
    const glass = spawn(game, "Twinning Glass", A);
    const mine = toHand(game, "Lightning Bolt");
    const theirs = toHand(game, "Lightning Bolt", B);
    // Bob's Bolt, in response to alice's Bears.
    cast(game, toHand(game, "Grizzly Bears"), { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, theirs, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(17);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === mine);
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    activate(game, glass);
    expect(life(game, B)).toBe(17);
  });

  it("offers nothing when no spell of that name was cast", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const glass = spawn(game, "Twinning Glass", A);
    const bears = toHand(game, "Grizzly Bears");
    const offered: ObjectId[][] = [];
    takeFirst(a, offered);
    activate(game, glass);
    expect(offered.flat()).toEqual([]);
    expect(zone(game, bears)).toBe("hand");
  });
});
