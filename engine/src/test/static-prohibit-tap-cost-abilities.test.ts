/**
 * "Creatures with flying can't attack or block, and their activated abilities
 * with {T} in their costs can't be activated" (Katabatic Winds): Serra
 * Bestiary's `activate` prohibition with `only: "tap"` over a filter, every
 * player's creatures, mana abilities included (rule 602.5).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, lands, life, spawn, table, toHand } from "./harness.js";

const offersOf = (game: Game, source: ObjectId) =>
  game.legalActions(game.state.objects[source].controller).filter(
    (o) => o.kind === "activate-ability" && o.source === source,
  );

describe("Katabatic Winds", () => {
  it("stops a flyer's {T} abilities, not a ground creature's, and not a flyer's others", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const pyro = spawn(game, "Prodigal Pyromancer");
    const dragon = spawn(game, "Shivan Dragon");
    expect(offersOf(game, pyro)).toHaveLength(1);
    spawn(game, "Katabatic Winds", B);
    // Prodigal Pyromancer has no flying.
    expect(offersOf(game, pyro)).toHaveLength(1);
    // Shivan Dragon's "{R}: +1/+0" has no {T}.
    expect(offersOf(game, dragon)).toHaveLength(1);
  });

  it("stops a flyer's {T} mana ability (Birds of Paradise)", () => {
    const castable = (winds: boolean): boolean => {
      const { game } = table();
      spawn(game, "Birds of Paradise");
      if (winds) spawn(game, "Katabatic Winds", B);
      const elves = toHand(game, "Llanowar Elves");
      return game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === elves);
    };
    expect(castable(false)).toBe(true);
    expect(castable(true)).toBe(false);
  });

  it("a flyer can't attack", () => {
    const dealt = (winds: boolean): number => {
      const { game, a } = table();
      const dragon = spawn(game, "Serra Angel");
      if (winds) spawn(game, "Katabatic Winds", B);
      try {
        attack(game, a, [dragon]);
      } catch {
        // A refused declaration: no attack.
      }
      return 20 - life(game, B);
    };
    expect(dealt(false)).toBe(4);
    expect(dealt(true)).toBe(0);
  });
});
