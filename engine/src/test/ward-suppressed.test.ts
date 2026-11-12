/**
 * `suppressWardTriggers` — Nowhere to Run: "Creatures your opponents control
 * can be the targets of spells and abilities as though they didn't have
 * hexproof. Ward abilities of those creatures don't trigger."
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Nowhere to Run", () => {
  it("an opponent's ward creature's ward doesn't trigger", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Nowhere to Run");
    const adrix = spawn(game, "Adrix and Nev, Twincasters", B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(adrix)] });
    expect(zone(game, adrix)).toBe("graveyard");
  });

  it("without it, the ward counters the unpaid spell", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const adrix = spawn(game, "Adrix and Nev, Twincasters", B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(adrix)] });
    expect(zone(game, adrix)).toBe("battlefield");
  });

  it("its controller's own ward creatures keep their ward", () => {
    const { game } = table();
    lands(game, "Mountain", 1, B);
    spawn(game, "Nowhere to Run");
    const adrix = spawn(game, "Adrix and Nev, Twincasters", A);
    game.advanceUntil((s) => s.priority.holder === B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(adrix)] });
    expect(zone(game, adrix)).toBe("battlefield");
  });

  it("anyone may target an opponent's hexproof creature", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Nowhere to Run");
    const hexproof = spawn(game, "Gladecover Scout", B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(hexproof)] });
    expect(zone(game, hexproof)).toBe("graveyard");
  });
});
