/**
 * "Add one mana of any color. This creature becomes that color until end of
 * turn" (Foraging Wickermaw): an `add-mana`'s `also` of a `become` with
 * `setColorsToManaMade`, reading the color the mana ability made — picked by
 * hand, or by the auto-payer paying a cost with it.
 */
import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, nextTurn, spawn, table, toHand, zone } from "./harness.js";

const colorsOf = (game: Game, id: ObjectId): readonly string[] => [
  ...computeCharacteristics(game.state, game.registry, id).colors,
];
const pool = (game: Game) => game.state.players[A].manaPool;

describe("Foraging Wickermaw", () => {
  it("becomes the color of the mana it made, until end of turn", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const wickermaw = spawn(game, "Foraging Wickermaw", A);
    expect(colorsOf(game, wickermaw)).toEqual([]);
    game.dispatch({ type: "activate-ability", player: A, source: wickermaw, abilityIndex: 0, targets: [], manaColors: ["G"] });
    expect(pool(game).map((m) => m.type)).toEqual(["G"]);
    expect(colorsOf(game, wickermaw)).toEqual(["G"]);
    expect(game.state.zones.shared.stack).toEqual([]);
    nextTurn(game);
    expect(colorsOf(game, wickermaw)).toEqual([]);
  });

  it("activates only once each turn", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const wickermaw = spawn(game, "Foraging Wickermaw", A);
    game.dispatch({ type: "activate-ability", player: A, source: wickermaw, abilityIndex: 0, targets: [], manaColors: ["U"] });
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: wickermaw, abilityIndex: 0, targets: [], manaColors: ["R"] }),
    ).not.toBeNull();
    expect(colorsOf(game, wickermaw)).toEqual(["U"]);
  });

  it("takes the color the auto-payer made with it", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const wickermaw = spawn(game, "Foraging Wickermaw", A);
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(zone(game, elves)).toBe("battlefield");
    expect(colorsOf(game, wickermaw)).toEqual(["G"]);
  });
});
