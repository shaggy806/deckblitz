/**
 * A `this-way` condition's `acrossPasses`: over everything a `repeat` has done
 * so far, not the pass under way — Tainted Pact (a choice inside the pass, and
 * the stop) and Helm of Obedience (the stop, with `atLeast: "x"`).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import {
  A,
  activate,
  B,
  cast,
  controller,
  graveyard,
  hand,
  lands,
  named,
  pickFromZone,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const isIn = (game: Game, ids: readonly ObjectId[], where: string): void => {
  for (const id of ids) expect(zone(game, id)).toBe(where);
};

/** How many times the seat is asked yes-or-no, answering from `answers`. */
const answering = (seat: ScriptedController, answers: readonly boolean[]): { asked: number } => {
  const seen = { asked: 0 };
  seat.chooseModesFn = () => {
    const yes = answers[seen.asked] ?? false;
    seen.asked += 1;
    return yes ? [0] : [];
  };
  return seen;
};

describe("Tainted Pact", () => {
  it("stops as soon as a card goes to your hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const third = toLibrary(game, "Hill Giant");
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Shock");
    const seen = answering(a, [false, true]);
    const before = hand(game).length;
    cast(game, toHand(game, "Tainted Pact"));
    expect(seen.asked).toBe(2);
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("hand");
    expect(hand(game)).toHaveLength(before + 1);
    expect(zone(game, third)).toBe("library");
  });

  it("offers nothing and stops on a card with the name of one exiled before", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const next = toLibrary(game, "Hill Giant");
    const repeat = toLibrary(game, "Shock");
    const between = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Shock");
    const seen = answering(a, [false, false, true]);
    cast(game, toHand(game, "Tainted Pact"));
    // Asked of the first Shock and the Bears, not the second Shock.
    expect(seen.asked).toBe(2);
    isIn(game, [first, between, repeat], "exile");
    expect(zone(game, next)).toBe("library");
  });

  it("goes on past two cards of different names, each pass offered", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const names = ["Shock", "Grizzly Bears", "Hill Giant", "Boomerang", "Opt"];
    const ids = names.map((name) => toLibrary(game, name)).reverse();
    const seen = answering(a, [false, false, false, false, true]);
    cast(game, toHand(game, "Tainted Pact"));
    expect(seen.asked).toBe(5);
    // Put on top one after another: Opt goes first, Shock last.
    isIn(game, ids.slice(0, 4), "exile");
    expect(zone(game, ids[4])).toBe("hand");
  });

  it("ends when the library runs out, and you don't lose for it", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    // A library of 40 Wastes: the second has the first's name, so empty it to one.
    const library = game.state.zones.perPlayer[A].library;
    const only = toLibrary(game, "Shock");
    library.splice(0, library.length, only);
    const seen = answering(a, [false]);
    cast(game, toHand(game, "Tainted Pact"));
    expect(seen.asked).toBe(1);
    expect(zone(game, only)).toBe("exile");
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("the condition's reach ends with the repeat", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    toLibrary(game, "Shock");
    answering(a, [true]);
    cast(game, toHand(game, "Tainted Pact"));
    expect(game.state.repeatSince).toBeUndefined();
  });
});

describe("Helm of Obedience", () => {
  const helm = (game: Game, x: number): ObjectId => {
    const id = spawn(game, "Helm of Obedience");
    lands(game, "Swamp", x);
    return id;
  };

  it("mills until X cards have been put into the graveyard", () => {
    const { game, a } = table();
    const id = helm(game, 3);
    a.chooseFromZoneFn = () => [];
    const milled = graveyard(game, B).length;
    activate(game, id, 0, { x: 3, targets: [ref(B)] });
    expect(graveyard(game, B)).toHaveLength(milled + 3);
    expect(zone(game, id)).toBe("battlefield");
  });

  it("stops at a creature card, sacrifices itself and takes it", () => {
    const { game, a } = table();
    const id = helm(game, 5);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const under = toLibrary(game, "Shock", B);
    const over = toLibrary(game, "Boomerang", B);
    const seen = pickFromZone(a, bears);
    activate(game, id, 0, { x: 5, targets: [ref(B)] });
    expect(zone(game, over)).toBe("graveyard");
    expect(zone(game, under)).toBe("graveyard");
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(zone(game, id)).toBe("graveyard");
    expect(named(game, "Wastes", B).filter((w) => zone(game, w) === "graveyard")).toHaveLength(0);
  });

  it("under Rest in Peace, nothing reaches the graveyard: the whole library goes", () => {
    const { game } = table();
    const id = helm(game, 2);
    spawn(game, "Rest in Peace");
    const library = game.state.zones.perPlayer[B].library;
    library.length = 5;
    activate(game, id, 0, { x: 2, targets: [ref(B)] });
    expect(game.state.zones.perPlayer[B].library).toHaveLength(0);
    expect(zone(game, id)).toBe("battlefield");
    expect(game.state.zones.perPlayer[B].graveyard).toHaveLength(0);
  });

  it("X can't be 0", () => {
    const { game } = table();
    const id = helm(game, 0);
    expect(() => activate(game, id, 0, { x: 0, targets: [ref(B)] })).toThrow();
  });
});
