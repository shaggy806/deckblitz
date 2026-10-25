/**
 * Batch 142's lead cards: Conspiracy: Take the Crown's draft-matters cards,
 * as they play outside a draft — nothing noted, revealed or exiled, so each
 * one's rulings' "you didn't draft one" case (a noted number of 0, no names).
 */
import { describe, expect, it } from "vitest";

import { B, activate, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Pyretic Hunter", () => {
  it("enters with no counters and dies a 0/0", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const hunter = toHand(game, "Pyretic Hunter");
    cast(game, hunter);
    expect(zone(game, hunter)).toBe("graveyard");
  });
});

describe("Garbage Fire", () => {
  it("targets a creature and deals it no damage", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const fire = toHand(game, "Garbage Fire");
    cast(game, fire, { targets: [ref(bears)] });
    expect(zone(game, fire)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Regicide", () => {
  it("can't be cast: no creature is one of no colours", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Regicide"), { targets: [ref(bears)] })).toThrow();
  });
});

describe("Custodi Peacekeeper", () => {
  it("taps only a creature with power 0 or less", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const keeper = spawn(game, "Custodi Peacekeeper");
    const bears = spawn(game, "Grizzly Bears", B);
    const wall = spawn(game, "Ornithopter", B);
    expect(() => activate(game, keeper, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, keeper, 0, { targets: [ref(wall)] });
    expect(game.state.objects[wall].tapped).toBe(true);
  });
});

describe("Volatile Chimera", () => {
  it("can be activated, and stays itself", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const chimera = spawn(game, "Volatile Chimera");
    activate(game, chimera, 0);
    expect(game.state.objects[chimera].cardName).toBe("Volatile Chimera");
  });
});
