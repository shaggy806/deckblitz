/**
 * Extract Brain's "target opponent chooses X cards from their hand. Look at
 * those cards. You may cast a spell from among them without paying its mana
 * cost": the opponent's `look-and-choose` with `destination: "stay"`, then
 * `look-at-hand`'s `only: "chosen-this-way"` and `cast-now`'s
 * `from: "chosen-this-way"`. Written from the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, hand, lands, life, ref, table, toHand, zone } from "./harness.js";

/** Bob's opening hand put back: his hand holds only what a test gives him. */
function emptyBobsHand(game: Game): void {
  for (const id of [...hand(game, B)]) game.debugMove(id, "library");
}

/** The seat's choose-from-zone answers: what it's offered each time, and
 * `pick` from it. */
function zoneAnswers(
  seat: ScriptedController,
  pick: (offered: readonly ObjectId[]) => readonly ObjectId[],
): { asked: { ids: readonly ObjectId[]; eligible: readonly ObjectId[] }[] } {
  const seen = { asked: [] as { ids: readonly ObjectId[]; eligible: readonly ObjectId[] }[] };
  seat.chooseFromZoneFn = (view, eligible) => {
    const awaiting = view.state.awaiting;
    seen.asked.push({ ids: awaiting?.kind === "choose-from-zone" ? awaiting.ids : [], eligible });
    return pick(eligible);
  };
  return seen;
}

describe("Extract Brain", () => {
  it("bob chooses two cards; alice looks at those two alone and casts one free", () => {
    const { game, a, b } = table();
    emptyBobsHand(game);
    const bolt = toHand(game, "Lightning Bolt", B);
    const island = toHand(game, "Island", B);
    const giant = toHand(game, "Hill Giant", B);
    lands(game, "Island", 3);
    lands(game, "Swamp", 1);
    const bobs = zoneAnswers(b, () => [bolt, island]);
    const looks = zoneAnswers(a, () => []);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === bolt)!;
      return { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via, free: true };
    };
    cast(game, toHand(game, "Extract Brain"), { targets: [ref(B)], x: 2 });
    // Bob chose from his whole hand.
    expect([...bobs.asked[0].eligible].sort()).toEqual([bolt, island, giant].sort());
    // Alice looked at the two chosen, not the Giant.
    expect([...looks.asked[0].ids].sort()).toEqual([bolt, island].sort());
    expect(looks.asked[0].eligible).toEqual([]);
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game, B)).toEqual(expect.arrayContaining([island, giant]));
  });

  it("with X greater than their hand, all of it is chosen", () => {
    const { game, a, b } = table();
    emptyBobsHand(game);
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Island", 5);
    lands(game, "Swamp", 1);
    zoneAnswers(b, (offered) => offered);
    const looks = zoneAnswers(a, () => []);
    let offered: readonly string[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered = offer.casts.map((c) => c.cardName);
      return null;
    };
    cast(game, toHand(game, "Extract Brain"), { targets: [ref(B)], x: 4 });
    expect(looks.asked[0].ids).toEqual([bolt]);
    expect(offered).toEqual(["Lightning Bolt"]);
    expect(zone(game, bolt)).toBe("hand");
  });

  it("only lands chosen: alice looks, and nothing is offered", () => {
    const { game, a, b } = table();
    emptyBobsHand(game);
    const island = toHand(game, "Island", B);
    toHand(game, "Lightning Bolt", B);
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    zoneAnswers(b, () => [island]);
    const looks = zoneAnswers(a, () => []);
    let asked = 0;
    a.chooseCastNowFn = () => {
      asked += 1;
      return null;
    };
    cast(game, toHand(game, "Extract Brain"), { targets: [ref(B)], x: 1 });
    expect(looks.asked[0].ids).toEqual([island]);
    expect(asked).toBe(0);
  });

  it("X is 0: nothing is chosen, looked at or cast", () => {
    const { game, a, b } = table();
    emptyBobsHand(game);
    toHand(game, "Lightning Bolt", B);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const bobs = zoneAnswers(b, () => []);
    const looks = zoneAnswers(a, () => []);
    cast(game, toHand(game, "Extract Brain"), { targets: [ref(B)], x: 0 });
    expect(bobs.asked.length).toBe(0);
    expect(looks.asked.length).toBe(0);
  });
});
