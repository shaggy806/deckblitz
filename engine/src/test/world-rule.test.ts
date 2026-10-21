/**
 * The world rule (704.5k): with two or more world permanents, all but the
 * newest go to their owners' graveyards; a tie for newest sends them all.
 * Legends' Nether Void and Gravity Sphere.
 */
import { describe, expect, it } from "vitest";

import { B, cast, keywords, lands, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

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

  it("In the Eye of Chaos counters an instant unless its mana value is paid; not a creature spell", () => {
    const { game } = table();
    spawn(game, "In the Eye of Chaos", B);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(20);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
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
