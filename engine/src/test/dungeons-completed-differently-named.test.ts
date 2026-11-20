/**
 * "For each differently named dungeon you've completed" (rule 309.7: a
 * dungeon is completed as it's removed from the game): `grantPtPerCount`'s
 * `dungeonsCompleted: "differently-named"`, read off
 * `PlayerState.completedDungeons` with each name counted once — Ellywick
 * Tumblestrum's emblem.
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import { A, B, enter, keywords, life, loyalty, pickFromZone, pt, spawn, table, toLibrary, zone } from "./harness.js";

describe("Ellywick Tumblestrum", () => {
  it("−7: the emblem's creatures get +2/+2 for each differently named dungeon completed, live", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const ellywick = enter(game, "Ellywick Tumblestrum");
    loyalty(game, ellywick, -7, { atLeast: 7 });
    expect(game.state.emblems.some((e) => e.owner === A)).toBe(true);
    // None completed: the keywords alone.
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(keywords(game, theirs).has("haste")).toBe(false);
    // Lost Mine twice is one name.
    game.state.players[A].completedDungeons = ["Lost Mine of Phandelver", "Lost Mine of Phandelver"];
    invalidateComputedCache();
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    game.state.players[A].completedDungeons = ["Lost Mine of Phandelver", "Tomb of Annihilation", "Lost Mine of Phandelver"];
    invalidateComputedCache();
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    // Another player's dungeons don't count, nor do their creatures get it.
    game.state.players[B].completedDungeons = ["Dungeon of the Mad Mage"];
    invalidateComputedCache();
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("−2: a legendary creature card put into hand gains 3 life; a nonlegendary one doesn't", () => {
    const { game, a } = table();
    const ellywick = enter(game, "Ellywick Tumblestrum");
    const legend = toLibrary(game, "Isamaru, Hound of Konda");
    const before = life(game);
    pickFromZone(a, legend);
    loyalty(game, ellywick, -2);
    expect(zone(game, legend)).toBe("hand");
    expect(life(game)).toBe(before + 3);

    const second = table();
    const walker = enter(second.game, "Ellywick Tumblestrum");
    const bear = toLibrary(second.game, "Grizzly Bears");
    const was = life(second.game);
    pickFromZone(second.a, bear);
    loyalty(second.game, walker, -2);
    expect(zone(second.game, bear)).toBe("hand");
    expect(life(second.game)).toBe(was);
  });

  it("+1: ventures into the dungeon", () => {
    const { game } = table();
    const ellywick = enter(game, "Ellywick Tumblestrum");
    loyalty(game, ellywick, 1);
    expect(game.state.players[A].dungeon).toBeDefined();
  });
});
