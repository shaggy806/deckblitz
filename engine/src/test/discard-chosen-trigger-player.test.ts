/**
 * "Whenever this creature deals combat damage to a player, look at that
 * player's hand and choose a card from it. The player discards that card"
 * (Doomsday Specter): `discard-chosen` on `"trigger-player"`, `lookOnly`.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, cast, graveyard, hand, lands, life, pickFromZone, pickPermanents, spawn, table, toHand, zone } from "./harness.js";

describe("Doomsday Specter", () => {
  it("returns a blue or black creature as it enters, itself if it's the only one", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const specter = toHand(game, "Doomsday Specter");
    pickPermanents(a, specter);
    cast(game, specter);
    expect(zone(game, specter)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("on combat damage, its controller looks at the damaged player's hand and picks the discard", () => {
    const { game, a } = table();
    const specter = spawn(game, "Doomsday Specter");
    const bolt = toHand(game, "Lightning Bolt", B);
    const wurm = toHand(game, "Craw Wurm", B);
    const seen = pickFromZone(a, wurm);
    attack(game, a, [specter]);
    expect(life(game, B)).toBe(18);
    expect(seen.offered).toEqual(expect.arrayContaining([bolt, wurm]));
    expect(graveyard(game, B)).toContain(wurm);
    expect(hand(game, B)).toContain(bolt);
    expect(game.state.zones.perPlayer[A].graveyard).not.toContain(wurm);
  });
});
