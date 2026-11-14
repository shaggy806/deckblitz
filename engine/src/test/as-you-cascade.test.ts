/**
 * "As you cascade, you may put a land card from among the exiled cards onto
 * the battlefield tapped" (Averna, the Chaos Bloom): `StaticAbility
 * .asYouCascade`, applied in each of its controller's cascades after the last
 * card is exiled and before the cast is chosen — and, with no card found,
 * before the rest go to the bottom (its rulings).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const library = (game: Game): readonly ObjectId[] => game.state.zones.perPlayer[A].library;

function emptyLibrary(game: Game): void {
  for (const id of [...library(game)]) game.debugMove(id, "exile");
}

describe("as you cascade", () => {
  it("Averna: a land from among the exiled cards, tapped, before the cast is offered", () => {
    const { game, a } = table();
    spawn(game, "Averna, the Chaos Bloom");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    // Top first: Forest, Island, then the Bolt cascade stops at.
    const bolt = toLibrary(game, "Lightning Bolt");
    const island = toLibrary(game, "Island");
    const forest = toLibrary(game, "Forest");
    const elf = toHand(game, "Bloodbraid Elf");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [forest];
    };
    let forestWhenOffered = "";
    a.chooseCastNowFn = () => {
      forestWhenOffered = zone(game, forest);
      return null;
    };
    cast(game, elf);
    // The lands were offered, not the Bolt; the Forest came in first.
    expect([...offered].sort()).toEqual([forest, island].sort());
    expect(forestWhenOffered).toBe("battlefield");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    // The rest, the Bolt declined, on the bottom.
    expect(zone(game, island)).toBe("library");
    expect(zone(game, bolt)).toBe("library");
    expect(library(game).slice(-2).sort()).toEqual([island, bolt].sort());
  });

  it("Averna: with nothing found, still a land before the rest go to the bottom", () => {
    const { game, a } = table();
    spawn(game, "Averna, the Chaos Bloom");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const elf = toHand(game, "Bloodbraid Elf");
    emptyLibrary(game);
    const island = toLibrary(game, "Island");
    const forest = toLibrary(game, "Forest");
    a.chooseFromZoneFn = () => [island];
    cast(game, elf);
    expect(zone(game, island)).toBe("battlefield");
    expect(game.state.objects[island].tapped).toBe(true);
    expect(library(game)).toEqual([forest]);
  });

  it("Averna: you may put none", () => {
    const { game, a } = table();
    spawn(game, "Averna, the Chaos Bloom");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const elf = toHand(game, "Bloodbraid Elf");
    const forest = toLibrary(game, "Forest");
    a.chooseFromZoneFn = () => [];
    a.chooseCastNowFn = () => null;
    cast(game, elf);
    expect(zone(game, forest)).toBe("library");
  });

  it("Averna: only its controller's cascades", () => {
    const { game, a, b } = table();
    spawn(game, "Averna, the Chaos Bloom", B);
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const elf = toHand(game, "Bloodbraid Elf");
    const forest = toLibrary(game, "Forest");
    let asked = false;
    a.chooseFromZoneFn = b.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    a.chooseCastNowFn = () => null;
    cast(game, elf);
    expect(asked).toBe(false);
    expect(zone(game, forest)).toBe("library");
  });
});
