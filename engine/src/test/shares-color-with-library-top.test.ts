/**
 * "Creatures you control that share a color with [the top card of your
 * library]" (Crown of Convergence): `ShareReference`'s `{ libraryTop: "you" }`,
 * read live in a static's scope, under a `library-top` condition. Colorless
 * shares no color (rule 105.2c). And `bottom-of-library`'s `top`: the top card
 * put on the bottom.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, lands, pt, spawn, table, toLibrary } from "./harness.js";

describe("shares a color with the top card of your library", () => {
  it("Crown of Convergence: a creature card on top pumps the creatures you control of its colors", () => {
    const { game } = table({ deck: "Plains" });
    spawn(game, "Crown of Convergence");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const thopter = spawn(game, "Ornithopter");
    const theirs = spawn(game, "Grizzly Bears", B);
    // A Plains on top: no creature card, no bonus.
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    toLibrary(game, "Llanowar Elves");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, thopter)).toEqual({ power: 0, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    // A green-and-red creature card: both.
    toLibrary(game, "Burning-Tree Emissary");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
    // A colorless creature card: none (the ruling).
    toLibrary(game, "Ornithopter");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, thopter)).toEqual({ power: 0, toughness: 2 });
    // A green non-creature card: the condition fails.
    toLibrary(game, "Giant Growth");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Crown of Convergence: {G}{W} puts the top card on the bottom", () => {
    const { game } = table({ deck: "Plains" });
    const crown = spawn(game, "Crown of Convergence");
    const bears = spawn(game, "Grizzly Bears");
    const swamp = toLibrary(game, "Swamp");
    const elves = toLibrary(game, "Llanowar Elves");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    activate(game, crown, 0);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.at(-1)).toBe(elves);
    expect(library[0]).toBe(swamp);
    expect(game.state.objects[elves].zone).toBe("library");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});
