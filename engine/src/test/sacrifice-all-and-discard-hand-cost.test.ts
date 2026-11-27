/**
 * "As an additional cost to cast this spell, sacrifice all permanents you
 * control and discard your hand" (Kaervek's Spite): one `additionalCost.also`
 * whose `do` is a sequence of `sacrifice-all` and `discard-hand`, paid as the
 * spell goes on the stack after its mana (601.2h) — the lands that paid are
 * sacrificed too. No engine code: cost acts already take both.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Kaervek's Spite", () => {
  it("sacrifices every permanent you control and discards your hand; the target loses 5", () => {
    const { game } = table();
    const swamps = lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const kept = [toHand(game, "Swamp"), toHand(game, "Grizzly Bears")];
    const spite = toHand(game, "Kaervek's Spite");
    cast(game, spite, { targets: [ref(B)], settle: false });
    // Paid as it's cast, before it resolves.
    for (const id of [...swamps, bears, ...kept]) expect(zone(game, id)).toBe("graveyard");
    expect(hand(game, A)).toHaveLength(0);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, spite)).toBe("stack");
    settle(game);
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(20);
  });

  it("can target yourself, with an empty hand left over", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const spite = toHand(game, "Kaervek's Spite");
    cast(game, spite, { targets: [ref(A)] });
    expect(life(game, A)).toBe(15);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === A)).toHaveLength(0);
  });
});
