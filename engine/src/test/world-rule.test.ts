/**
 * The world rule (704.5k): with two or more world permanents, all but the
 * newest go to their owners' graveyards; a tie for newest sends them all.
 * Legends' Nether Void and Gravity Sphere.
 */
import { describe, expect, it } from "vitest";

import { B, cast, keywords, lands, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("the world rule", () => {
  it("a newer world enchantment puts the older one into the graveyard", () => {
    const { game } = table();
    const voidId = spawn(game, "Nether Void", B);
    const sphere = spawn(game, "Gravity Sphere");
    toStep(game, "begin-combat");
    expect(zone(game, voidId)).toBe("graveyard");
    expect(zone(game, sphere)).toBe("battlefield");
  });

  it("Gravity Sphere: all creatures lose flying", () => {
    const { game } = table();
    spawn(game, "Gravity Sphere");
    const bird = spawn(game, "Suntail Hawk", B);
    expect(keywords(game, bird).has("flying")).toBe(false);
  });

  it("Nether Void counters a spell whose controller doesn't pay {3}", () => {
    const { game } = table();
    spawn(game, "Nether Void", B);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    // Two Forests both spent on the Bears: nothing left to pay {3} with.
    expect(zone(game, bears)).toBe("graveyard");
  });
});
