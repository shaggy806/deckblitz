/**
 * "You may return another creature you control to its owner's hand. If you
 * do, …" (Temur Sabertooth): the creature is chosen as the ability resolves,
 * not targeted (the ruling) — none declines — and the tail happens only once
 * one was returned (`choose-permanents` then a `returned-to-hand`
 * conditional).
 */

import { describe, expect, it } from "vitest";

import { B, activate, keywords, lands, pickPermanents, spawn, table, zone } from "./harness.js";

describe("may return a creature you control; if you do (Temur Sabertooth)", () => {
  it("returns the creature chosen, and the Sabertooth gains indestructible", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const cat = spawn(game, "Temur Sabertooth");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(a, bears);
    activate(game, cat);
    // Another creature of yours: never the Sabertooth, never an opponent's.
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(cat);
    expect(seen.offered).not.toContain(theirs);
    expect(zone(game, bears)).toBe("hand");
    expect(keywords(game, cat).has("indestructible")).toBe(true);
  });

  it("choosing none returns nothing and grants nothing", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const cat = spawn(game, "Temur Sabertooth");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a);
    activate(game, cat);
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, cat).has("indestructible")).toBe(false);
  });

  it("with no other creature, there's nothing to return and no indestructible", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const cat = spawn(game, "Temur Sabertooth");
    activate(game, cat);
    expect(zone(game, cat)).toBe("battlefield");
    expect(keywords(game, cat).has("indestructible")).toBe(false);
  });
});
