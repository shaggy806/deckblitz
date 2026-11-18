/**
 * "Exactly two colors" (rule 105.4 — a multicolored object has two or more)
 * is `CardFilter.colorCount: 2`, and "isn't exactly two colors" its `not`:
 * colorless, one color, or three or more (Invasion of Ravnica's ruling).
 * Invasion of Ravnica // Guildpact Paragon.
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, pickFromZone, spawn, table, toHand, toLibrary, watchTargets, zone } from "./harness.js";

/** Invasion of Ravnica turned to Guildpact Paragon. */
function paragon(game: Game): ObjectId {
  const id = spawn(game, "Invasion of Ravnica");
  const object = game.state.objects[id];
  object.face = 1;
  delete object.counters.defense;
  invalidateComputedCache();
  return id;
}

describe("Invasion of Ravnica", () => {
  it("exiles a nonland permanent an opponent controls that isn't exactly two colors", () => {
    const { game, a } = table();
    const wolf = spawn(game, "Watchwolf", B);
    const ring = spawn(game, "Sol Ring", B);
    const sphinx = spawn(game, "Sphinx of the Steel Wind", B);
    const elf = spawn(game, "Bloodbraid Elf", B);
    const goblin = spawn(game, "Raging Goblin", B);
    const mine = spawn(game, "Raging Goblin", A);
    const seen = watchTargets(a, () => [goblin]);
    lands(game, "Wastes", 5);
    cast(game, toHand(game, "Invasion of Ravnica"));
    // Colorless, three colors and one are in; two colors, and its own, out.
    expect(new Set(seen.offered[0])).toEqual(new Set([ring, sphinx, goblin]));
    expect(seen.offered[0]).not.toContain(wolf);
    expect(seen.offered[0]).not.toContain(elf);
    expect(seen.offered[0]).not.toContain(mine);
    expect(zone(game, goblin)).toBe("exile");
  });
});

describe("Guildpact Paragon", () => {
  it("a spell that's exactly two colors: a two-color card from the top six to hand", () => {
    const { game, a } = table();
    paragon(game);
    const helix = toLibrary(game, "Lightning Helix");
    const bolt = toLibrary(game, "Lightning Bolt");
    const charm = toLibrary(game, "Esper Charm");
    const seen = pickFromZone(a, helix);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Watchwolf"));
    expect(seen.offered).toContain(helix);
    expect(seen.offered).not.toContain(bolt);
    expect(seen.offered).not.toContain(charm);
    expect(zone(game, helix)).toBe("hand");
    expect(zone(game, bolt)).toBe("library");
  });

  it("a one-color spell doesn't trigger it", () => {
    const { game, a } = table();
    paragon(game);
    toLibrary(game, "Lightning Helix");
    const seen = pickFromZone(a);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Raging Goblin"));
    expect(seen.offered).toEqual([]);
  });
});
