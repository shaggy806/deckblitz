/**
 * "The next X damage that a source of your choice would deal …" (rule 609.7):
 * `prevent-damage-from-chosen-source` with an amount the resolution reads,
 * fixed as the source is chosen — Shining Shoal's X, paid or the exiled white
 * card's mana value, redirected to its target (614.9).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Shining Shoal", () => {
  it("exiling a white card of mana value 3: the next 3 damage the chosen source would deal to you goes to the target", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const pestilence = spawn(game, "Pestilence");
    a.choosePermanentsFn = (_view, eligible) => eligible.filter((id) => id === pestilence);
    const knight = toHand(game, "Benalish Knight");
    cast(game, toHand(game, "Shining Shoal"), { targets: [ref(B)], altCost: true, x: 3 });
    expect(zone(game, knight)).toBe("exile");
    for (let i = 0; i < 4; i += 1) activate(game, pestilence, 0);
    // Three of Pestilence's 1s to Alice went to Bob; the fourth didn't.
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20 - 4 - 3);
  });

  it("cast for {X}{W}{W}: X is what was paid, and it covers your creatures too", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    lands(game, "Swamp", 1);
    const pestilence = spawn(game, "Pestilence");
    const bears = spawn(game, "Grizzly Bears");
    a.choosePermanentsFn = (_view, eligible) => eligible.filter((id) => id === pestilence);
    // Of the 2 Pestilence deals to Alice and her Bears, the shield of 1 takes
    // the share she says: the Bears'.
    a.chooseNumberFn = (_view, offer) => (offer.prompt?.includes("Grizzly Bears") ? 1 : 0);
    cast(game, toHand(game, "Shining Shoal"), { targets: [ref(B)], x: 1 });
    activate(game, pestilence, 0);
    expect(life(game, A)).toBe(19);
    expect(game.state.objects[bears].damageMarked ?? 0).toBe(0);
    expect(life(game, B)).toBe(18);
  });
});
