/**
 * `takesLastExiledCard` — Duplicant: "As long as a card exiled with this
 * creature is a creature card, this creature has the power, toughness, and
 * creature types of the last creature card exiled with it. It's still a
 * Shapeshifter."
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import { B, enter, pickModes, pickTargets, pt, spawn, subtypes, table, toExile, types, zone } from "./harness.js";

describe("Duplicant", () => {
  it("takes the exiled creature's power, toughness and creature types, and stays a Shapeshifter", () => {
    const seats = table();
    const { game } = seats;
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(seats.a, wurm);
    pickModes(seats.a, 0);
    const duplicant = enter(game, "Duplicant");
    expect(zone(game, wurm)).toBe("exile");
    expect(pt(game, duplicant)).toEqual({ power: 6, toughness: 4 });
    expect([...subtypes(game, duplicant)].sort()).toEqual(["Shapeshifter", "Wurm"]);
    expect(types(game, duplicant)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    // Base P/T: a counter still counts (layer 7c).
    game.state.objects[duplicant].counters = { "+1/+1": 1 };
    invalidateComputedCache();
    expect(pt(game, duplicant)).toEqual({ power: 7, toughness: 5 });
  });

  it("reads the last creature card exiled with it", () => {
    const seats = table();
    const { game } = seats;
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(seats.a, wurm);
    pickModes(seats.a, 0);
    const duplicant = enter(game, "Duplicant");
    const bears = toExile(game, "Grizzly Bears", B);
    game.state.objects[bears].exiledWith = { ...game.state.objects[wurm].exiledWith! };
    invalidateComputedCache();
    expect(pt(game, duplicant)).toEqual({ power: 2, toughness: 2 });
    expect([...subtypes(game, duplicant)].sort()).toEqual(["Bear", "Shapeshifter"]);
  });

  it("with nothing exiled, it's a 2/4 Shapeshifter", () => {
    const { game } = table();
    const duplicant = enter(game, "Duplicant");
    expect(pt(game, duplicant)).toEqual({ power: 2, toughness: 4 });
    expect(subtypes(game, duplicant)).toEqual(["Shapeshifter"]);
  });
});
