/**
 * Anticausal Vestige: when it leaves, draw, then maybe a permanent card with
 * mana value up to your land count from hand, tapped — the land count read as
 * the choice is made, and warp's exile counts as leaving.
 */
import { describe, expect, it } from "vitest";

import { B, cast, destroy, hand, lands, nextTurn, pickFromZone, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Anticausal Vestige", () => {
  it("draws, then offers only permanent cards up to the land count, and it enters tapped", () => {
    const { game, a } = table();
    const vestige = spawn(game, "Anticausal Vestige");
    lands(game, "Wastes", 2);
    const bear = toHand(game, "Grizzly Bears");
    const big = toHand(game, "Hill Giant");
    const bolt = toHand(game, "Lightning Bolt");
    const drawn = toLibrary(game, "Wastes");
    const seen = pickFromZone(a, bear);
    destroy(game, vestige);
    settle(game);
    expect(hand(game)).toContain(drawn);
    expect(seen.offered).toContain(bear);
    expect(seen.offered).toContain(drawn);
    expect(seen.offered).not.toContain(big);
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].tapped).toBe(true);
  });

  it("may put nothing", () => {
    const { game, a } = table();
    const vestige = spawn(game, "Anticausal Vestige");
    lands(game, "Wastes", 2);
    const bear = toHand(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    pickFromZone(a);
    destroy(game, vestige);
    settle(game);
    expect(zone(game, bear)).toBe("hand");
  });

  it("counts only your lands, not an opponent's", () => {
    const { game, a } = table();
    const vestige = spawn(game, "Anticausal Vestige");
    lands(game, "Wastes", 1);
    lands(game, "Wastes", 5, B);
    const bear = toHand(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    const seen = pickFromZone(a);
    destroy(game, vestige);
    settle(game);
    expect(seen.offered).not.toContain(bear);
  });

  it("reads {X} in a hand card's cost as 0 (its ruling)", () => {
    const { game, a } = table();
    const vestige = spawn(game, "Anticausal Vestige");
    const ballista = toHand(game, "Walking Ballista");
    toLibrary(game, "Wastes");
    const seen = pickFromZone(a);
    destroy(game, vestige);
    settle(game);
    expect(seen.offered).toContain(ballista);
  });

  it("warped for {4}, it triggers as it's exiled at the end step", () => {
    const { game, a } = table();
    const vestige = toHand(game, "Anticausal Vestige");
    lands(game, "Wastes", 4);
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    const before = hand(game).length;
    cast(game, vestige, { via: "warp" });
    expect(zone(game, vestige)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
    pickFromZone(a);
    nextTurn(game);
    expect(zone(game, vestige)).toBe("exile");
    expect(hand(game).length).toBe(before);
  });
});
