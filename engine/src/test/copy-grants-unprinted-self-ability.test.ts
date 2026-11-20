/**
 * A copy exception that gives an ability not printed on the card, which names itself through
 * `thisAbility.inCopyOnEnter` (Vesuvan Doppelganger), and "except it doesn't copy that creature's
 * color" (`keepOwnColors`, rule 707.9c).
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import { A, B, cast, lands, pickModes, pickTargets, pt, settle, spawn, subtypes, table, toHand, toStep, zone } from "./harness.js";

const colors = (game: Game, id: ObjectId): readonly string[] => [...computeCharacteristics(game.state, game.registry, id).colors];
const nameOf = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);

describe("Vesuvan Doppelganger", () => {
  it("enters as a copy that keeps its own blue, with the upkeep ability", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    a.chooseCopyFn = () => bears;
    const vesuvan = toHand(game, "Vesuvan Doppelganger");
    cast(game, vesuvan);
    expect(zone(game, vesuvan)).toBe("battlefield");
    expect(nameOf(game, vesuvan)).toBe("Grizzly Bears");
    expect(pt(game, vesuvan)).toEqual({ power: 2, toughness: 2 });
    expect(colors(game, vesuvan)).toEqual(["U"]);
    expect(subtypes(game, vesuvan)).toEqual(["Bear"]);
  });

  it("at its upkeep may become a copy of another creature, still blue and still with the ability", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const dragon = spawn(game, "Shivan Dragon", B);
    lands(game, "Island", 5);
    a.chooseCopyFn = () => bears;
    const vesuvan = toHand(game, "Vesuvan Doppelganger");
    cast(game, vesuvan);
    pickTargets(a, dragon);
    pickModes(a, 0);
    toStep(game, "upkeep", A);
    settle(game);
    expect(nameOf(game, vesuvan)).toBe("Shivan Dragon");
    expect(colors(game, vesuvan)).toEqual(["U"]);
    // The next upkeep it changes again: the ability came along.
    pickTargets(a, bears);
    toStep(game, "upkeep", A);
    settle(game);
    expect(nameOf(game, vesuvan)).toBe("Grizzly Bears");
    expect(colors(game, vesuvan)).toEqual(["U"]);
  });

  it("a Clone copying it copies its blue and gains the ability", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const dragon = spawn(game, "Shivan Dragon", B);
    lands(game, "Island", 9);
    a.chooseCopyFn = () => bears;
    const vesuvan = toHand(game, "Vesuvan Doppelganger");
    cast(game, vesuvan);
    a.chooseCopyFn = () => vesuvan;
    const clone = toHand(game, "Clone");
    cast(game, clone);
    expect(nameOf(game, clone)).toBe("Grizzly Bears");
    expect(colors(game, clone)).toEqual(["U"]);
    pickTargets(a, dragon);
    pickModes(a, 0);
    toStep(game, "upkeep", A);
    settle(game);
    expect(nameOf(game, clone)).toBe("Shivan Dragon");
    expect(colors(game, clone)).toEqual(["U"]);
  });

  it("not copying anything, it has no upkeep ability", () => {
    const { game, a } = table();
    spawn(game, "Glorious Anthem", A);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    a.chooseCopyFn = () => null;
    const vesuvan = toHand(game, "Vesuvan Doppelganger");
    cast(game, vesuvan);
    expect(zone(game, vesuvan)).toBe("battlefield");
    expect(nameOf(game, vesuvan)).toBe("Vesuvan Doppelganger");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    toStep(game, "upkeep", A);
    settle(game);
    expect(asked).toBe(0);
    expect(nameOf(game, vesuvan)).toBe("Vesuvan Doppelganger");
  });
});
