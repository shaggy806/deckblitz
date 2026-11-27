/**
 * "If damage would be dealt to a player, that player exiles that many cards
 * from the top of their library instead" (Crumbling Sanctuary): a
 * `would-deal-damage` replacement, `to: "player"`, whose `{ effect }` is an
 * `exile-from-library` of `"x"` cards from `"trigger-player"`'s library
 * (rules 614.1a, 614.6) — no damage dealt, so no life lost.
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, cast, lands, life, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Crumbling Sanctuary", () => {
  it("a player dealt damage exiles that many cards from the top of their library instead", () => {
    const { game } = table();
    spawn(game, "Crumbling Sanctuary");
    const library = [0, 1, 2, 3, 4].map(() => toLibrary(game, "Grizzly Bears", B));
    const before = life(game, B);
    const bolt = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(B)] });
    settle(game);
    expect(life(game, B)).toBe(before);
    expect(library.filter((id) => zone(game, id) === "exile")).toHaveLength(3);
    expect(library.filter((id) => zone(game, id) === "library")).toHaveLength(2);
  });

  it("its controller's damage too, and with fewer cards only what's there", () => {
    const { game } = table();
    spawn(game, "Crumbling Sanctuary");
    const only = toLibrary(game, "Grizzly Bears", A);
    const before = life(game, A);
    const bolt = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(A)] });
    settle(game);
    expect(life(game, A)).toBe(before);
    expect(zone(game, only)).toBe("exile");
  });

  it("combat damage to a player is replaced, damage to a creature is not", () => {
    const { game, a } = table();
    spawn(game, "Crumbling Sanctuary", B);
    const library = [0, 1, 2].map(() => toLibrary(game, "Grizzly Bears", B));
    const before = life(game, B);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(before);
    expect(library.filter((id) => zone(game, id) === "exile")).toHaveLength(2);

    const target = spawn(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(target)] });
    settle(game);
    expect(zone(game, target)).toBe("graveyard");
  });
});
