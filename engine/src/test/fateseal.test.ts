/**
 * Fateseal N (rule 701.29a — `cards/helpers.ts`'s `fateseal`): look at the
 * top N cards of an opponent's library, chosen as it resolves, then put any
 * number on the bottom and the rest on top in any order. Mesmeric Sliver's
 * granted "you may fateseal 1"; Spin into Myth's creature put on top first,
 * then fateseal 2.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, enter, lands, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

type Game = ReturnType<typeof table>["game"];

const libraryOf = (game: Game, player: typeof A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Mesmeric Sliver", () => {
  it("may fateseal 1 as it enters: the opponent's top card to the bottom", () => {
    const { game, a } = table();
    const top = toLibrary(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [0];
    let shown: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      shown = eligible;
      return eligible;
    };
    enter(game, "Mesmeric Sliver");
    expect(shown).toEqual([top]);
    expect(libraryOf(game, B).at(-1)).toBe(top);
    expect(zone(game, top)).toBe("library");
  });

  it("declined, looks at nothing", () => {
    const { game, a } = table();
    const top = toLibrary(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [];
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    enter(game, "Mesmeric Sliver");
    expect(asked).toBe(0);
    expect(libraryOf(game, B)[0]).toBe(top);
  });

  it("gives every Sliver the trigger: an opponent's Sliver fateseals its controller's opponent", () => {
    const { game, b } = table();
    spawn(game, "Mesmeric Sliver");
    const top = toLibrary(game, "Grizzly Bears", A);
    b.chooseModesFn = () => [0];
    b.chooseFromZoneFn = (_view, eligible) => eligible;
    enter(game, "Muscle Sliver", B);
    expect(libraryOf(game, A).at(-1)).toBe(top);
  });

  it("with two opponents, its controller chooses whose library", () => {
    const { game, a } = table({ players: 3 });
    const bobs = toLibrary(game, "Grizzly Bears", B);
    const carols = toLibrary(game, "Gray Ogre", C);
    // The "may", then which opponent: the second (Carol).
    const answers = [[0], [1]];
    a.chooseModesFn = () => answers.shift() ?? [];
    let shown: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      shown = eligible;
      return [];
    };
    enter(game, "Mesmeric Sliver");
    expect(shown).toEqual([carols]);
    expect(libraryOf(game, B)[0]).toBe(bobs);
    expect(libraryOf(game, C)[0]).toBe(carols);
  });
});

describe("Spin into Myth", () => {
  it("puts the creature on top, then fateseals 2: one to the bottom, the other kept on top", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const under = toLibrary(game, "Gray Ogre", B);
    const bears = spawn(game, "Grizzly Bears", B);
    let shown: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      shown = eligible;
      return [under];
    };
    cast(game, toHand(game, "Spin into Myth"), { targets: [ref(bears)] });
    expect([...shown].sort()).toEqual([bears, under].sort());
    expect(libraryOf(game, B)[0]).toBe(bears);
    expect(libraryOf(game, B).at(-1)).toBe(under);
  });
});
