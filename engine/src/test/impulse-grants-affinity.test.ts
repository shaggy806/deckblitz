/**
 * A permission that gives the spell cast under it affinity (`PlayTerms`'
 * `affinity`, rule 702.41a), the need key `zone:impulse-one-cast-grants-affinity`
 * — Chiss-Goria, Forge Tyrant: "Whenever Chiss-Goria attacks, exile the top
 * five cards of your library. You may cast an artifact spell from among them
 * this turn. If you do, it has affinity for artifacts."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, attack, cast, lands, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);
const untapped = (game: Game, ids: readonly ObjectId[]): number => ids.filter((id) => !game.state.objects[id].tapped).length;

const setUp = () => {
  const { game, a } = table();
  const chiss = spawn(game, "Chiss-Goria, Forge Tyrant");
  for (let i = 0; i < 3; i += 1) spawn(game, "Ornithopter");
  const mountains = lands(game, "Mountain", 3);
  // The top five, Wurmcoil Engine on top.
  const bolt = toLibrary(game, "Lightning Bolt");
  const icy = toLibrary(game, "Icy Manipulator");
  toLibrary(game, "Wastes");
  toLibrary(game, "Wastes");
  const wurmcoil = toLibrary(game, "Wurmcoil Engine");
  attack(game, a, [chiss]);
  return { game, mountains, bolt, icy, wurmcoil };
};

describe("Chiss-Goria, Forge Tyrant", () => {
  it("one artifact spell from the five, with affinity for artifacts", () => {
    const { game, mountains, bolt, icy, wurmcoil } = setUp();
    for (const id of [bolt, icy, wurmcoil]) expect(zone(game, id)).toBe("exile");
    // Not an artifact.
    expect(castable(game, bolt)).toBe(false);
    // Wurmcoil Engine ({6}) costs {3} with three artifacts.
    expect(castable(game, wurmcoil)).toBe(true);
    cast(game, wurmcoil, { via: "impulse" });
    expect(zone(game, wurmcoil)).toBe("battlefield");
    expect(untapped(game, mountains)).toBe(0);
    // Only one.
    lands(game, "Mountain", 4);
    expect(castable(game, icy)).toBe(false);
  });

  it("without enough artifacts it costs more: two Ornithopters fewer, Wurmcoil isn't affordable", () => {
    const { game, wurmcoil } = setUp();
    const thopters = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Ornithopter");
    for (const id of thopters.slice(0, 2)) game.debugMove(id, "graveyard");
    settle(game);
    expect(castable(game, wurmcoil)).toBe(false);
  });

  it("its own affinity for artifacts, as it's cast", () => {
    const { game } = table();
    for (let i = 0; i < 3; i += 1) spawn(game, "Ornithopter");
    lands(game, "Mountain", 6);
    const chiss = toHand(game, "Chiss-Goria, Forge Tyrant");
    cast(game, chiss);
    expect(zone(game, chiss)).toBe("battlefield");
  });
});
