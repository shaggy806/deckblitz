/**
 * `DistinctOf`'s `"controller"`: "for each opponent who controls one or more
 * of those permanents" (Sudden Salvation) — each opponent once, however many
 * of the returned permanents they control.
 */

import { describe, expect, it } from "vitest";

import { A, B, C, D, cast, controller, destroy, hand, lands, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Sudden Salvation", () => {
  it("returns permanent cards put into graveyards from the battlefield this turn, tapped, and draws one a controlling opponent", () => {
    const { game } = table({ players: 4 });
    lands(game, "Plains", 4);
    const bob1 = spawn(game, "Grizzly Bears", B);
    const bob2 = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Gray Ogre", C);
    for (const id of [bob1, bob2, carols]) destroy(game, id, A);
    const salvation = toHand(game, "Sudden Salvation");
    const before = hand(game).length;
    cast(game, salvation, { targets: [ref(bob1), ref(bob2), ref(carols)] });
    for (const id of [bob1, bob2, carols]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].tapped).toBe(true);
    }
    expect(controller(game, bob1)).toBe(B);
    expect(controller(game, carols)).toBe(C);
    // Bob controls two of them and carol one: two opponents, two cards
    // (the spell itself left the hand).
    expect(hand(game).length).toBe(before - 1 + 2);
  });

  it("draws nothing for your own permanents, and can't target a card that didn't come from the battlefield", () => {
    const { game } = table({ players: 4 });
    lands(game, "Plains", 4);
    const mine = spawn(game, "Grizzly Bears", A);
    destroy(game, mine, B);
    const discarded = toGraveyard(game, "Hill Giant", D);
    const salvation = toHand(game, "Sudden Salvation");
    expect(() => cast(game, salvation, { targets: [ref(discarded)] })).toThrow();
    const before = hand(game).length;
    cast(game, salvation, { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
  });
});
