/**
 * Illusionary Terrain: "As this enchantment enters, choose two basic land
 * types. Basic lands of the first chosen type are the second chosen type."
 * Two different types (`chooseOnEnterCount: 2`); the filter clause
 * `ofChosenLandType` reads the first, `setsChosenLandType: "second"` sets the
 * second (layer 4, rule 305.7: the old land type and its mana ability go).
 */
import { describe, expect, it } from "vitest";

import { intrinsicManaColors } from "../characteristics.js";
import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, registryOf, spawn, subtypes, supertypes, table, toHand } from "./harness.js";

const colors = (game: Game, id: ObjectId) => intrinsicManaColors(game.state, registryOf(game), game.state.objects[id]);

function terrain(first: string, second: string) {
  const t = table();
  const { game, a } = t;
  const asked: (readonly string[])[] = [];
  a.chooseCreatureTypeFn = (_view, _source, options) => {
    asked.push(options);
    return asked.length === 1 ? first : second;
  };
  lands(game, "Island", 2);
  const id = toHand(game, "Illusionary Terrain");
  cast(game, id);
  return { ...t, id, asked };
}

describe("Illusionary Terrain", () => {
  it("asks two different basic land types, the second from the four left", () => {
    const { game, id, asked } = terrain("Forest", "Island");
    expect(asked).toEqual([
      ["Plains", "Island", "Swamp", "Mountain", "Forest"],
      ["Plains", "Island", "Swamp", "Mountain"],
    ]);
    expect(game.state.objects[id].chosenOnEnter).toBe("Forest");
    expect(game.state.objects[id].chosenOnEnterAlso).toEqual(["Island"]);
  });

  it("basic Forests, everyone's, are Islands and tap for blue — not other basics, nor a nonbasic Forest", () => {
    const { game } = terrain("Forest", "Island");
    const mine = spawn(game, "Forest", A);
    const theirs = spawn(game, "Forest", B);
    const snowy = spawn(game, "Snow-Covered Forest", B);
    const plains = spawn(game, "Plains", B);
    const arbor = spawn(game, "Dryad Arbor", B);
    for (const id of [mine, theirs, snowy]) {
      expect(subtypes(game, id)).toEqual(["Island"]);
      expect(colors(game, id)).toEqual(["U"]);
    }
    // Supertypes stay: still basic, still snow.
    expect(supertypes(game, snowy)).toEqual(expect.arrayContaining(["basic", "snow"]));
    expect(subtypes(game, plains)).toEqual(["Plains"]);
    expect(subtypes(game, arbor)).toContain("Forest");
  });

  it("once it leaves, the Forests are Forests again", () => {
    const { game, id } = terrain("Forest", "Swamp");
    const forest = spawn(game, "Forest", B);
    expect(subtypes(game, forest)).toEqual(["Swamp"]);
    game.debugMove(id, "graveyard");
    expect(subtypes(game, forest)).toEqual(["Forest"]);
    expect(colors(game, forest)).toEqual(["G"]);
  });

  it("ofChosenLandType reads the source's first choice, and matches nothing without one", () => {
    const { game, id } = terrain("Plains", "Mountain");
    const plains = spawn(game, "Plains", B);
    const reg = registryOf(game);
    // The Plains is a Mountain now, so it no longer has the first type itself.
    expect(matchesFilter(game.state, reg, plains, { ofChosenLandType: true }, { you: A, source: id })).toBe(false);
    // Savannah (nonbasic, Forest Plains) isn't reached, and has the first type.
    const savannah = spawn(game, "Savannah", B);
    expect(subtypes(game, savannah)).toEqual(expect.arrayContaining(["Forest", "Plains"]));
    expect(matchesFilter(game.state, reg, savannah, { ofChosenLandType: true }, { you: A, source: id })).toBe(true);
    const swamp = spawn(game, "Swamp", B);
    expect(matchesFilter(game.state, reg, swamp, { ofChosenLandType: true }, { you: A, source: id })).toBe(false);
    expect(matchesFilter(game.state, reg, savannah, { ofChosenLandType: true }, { you: A })).toBe(false);
    expect(subtypes(game, plains)).toEqual(["Mountain"]);
  });
});
