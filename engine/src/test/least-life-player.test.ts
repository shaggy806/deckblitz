/**
 * "The player with the lowest life total" (`choose-opponent`'s `leastLife`,
 * with `anyPlayer`): Loxodon Peacekeeper's upkeep trigger, its controller
 * included among the candidates and asked only on a tie. And Puca's Eye,
 * which needed no engine code: a colour chosen after the draw, the artifact
 * becoming it for good, and an activation gated on five colours.
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, activate, controller, enter, hand, lands, registryOf, spawn, table, toLibrary, toStep } from "./harness.js";

const colorsOf = (game: Game, id: ObjectId): readonly string[] => [
  ...computeCharacteristics(game.state, registryOf(game), id).colors,
];

describe("Loxodon Peacekeeper", () => {
  it("goes to the one player with the lowest life, without a question", () => {
    const { game, a } = table({ players: 3 });
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    game.state.players[C].life = 7;
    game.state.players[B].life = 12;
    toLibrary(game, "Island");
    const lox = spawn(game, "Loxodon Peacekeeper", A);
    toStep(game, "draw");
    expect(asked).toBe(false);
    expect(controller(game, lox)).toBe(C);
  });

  it("stays with its controller when they have the lowest life", () => {
    const { game } = table({ players: 3 });
    game.state.players[A].life = 3;
    toLibrary(game, "Island");
    const lox = spawn(game, "Loxodon Peacekeeper", A);
    toStep(game, "draw");
    expect(controller(game, lox)).toBe(A);
  });

  it("asks its controller among those tied for lowest, and no one else", () => {
    const { game, a } = table({ players: 3 });
    game.state.players[B].life = 5;
    game.state.players[C].life = 5;
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [texts.findIndex((t) => t.toLowerCase().includes("bob"))];
    };
    toLibrary(game, "Island");
    const lox = spawn(game, "Loxodon Peacekeeper", A);
    toStep(game, "draw");
    expect(offered).toHaveLength(2);
    expect(offered.some((t) => t.toLowerCase().includes("alice"))).toBe(false);
    expect(controller(game, lox)).toBe(B);
  });
});

describe("Puca's Eye", () => {
  it("draws, then becomes the chosen colour for good", () => {
    const { game, a } = table();
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return "G";
    };
    const before = hand(game).length;
    const eye = enter(game, "Puca's Eye", A);
    expect(hand(game).length).toBe(before + 1);
    expect(offered).toHaveLength(5);
    expect(colorsOf(game, eye)).toEqual(["G"]);
    toStep(game, "precombat-main");
    expect(colorsOf(game, eye)).toEqual(["G"]);
  });

  it("draws only with five colours among your permanents", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "U";
    toLibrary(game, "Island");
    const eye = enter(game, "Puca's Eye", A);
    lands(game, "Wastes", 3);
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    game.state.objects[eye].tapped = false;
    expect(() => activate(game, eye, 0)).toThrow();
    // The Eye is blue: four more colours make five.
    spawn(game, "Savannah Lions", A);
    spawn(game, "Typhoid Rats", A);
    spawn(game, "Goblin Piker", A);
    spawn(game, "Grizzly Bears", A);
    const before = hand(game).length;
    activate(game, eye, 0);
    expect(hand(game).length).toBe(before + 1);
  });
});
