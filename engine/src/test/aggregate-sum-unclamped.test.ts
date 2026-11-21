/**
 * "Their total power" over the creatures a player controlled, some destroyed
 * and some not (rules 107.1b, 608.2h): a signed `sum` of an aggregate over
 * the destroyed ones (as they last existed) and one over the survivors (as
 * they are), so a negative power lowers the total and only the result is
 * clamped at 0.
 *
 * Cards: Angrath, Minotaur Pirate.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, life, loyalty, ref, spawn, table, toGraveyard, zone } from "./harness.js";

const shrink = (game: Game, id: ObjectId, power: number): void => {
  game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power, toughness: 0, duration: "end-of-turn" }, [ref(id)]);
};

describe("Angrath, Minotaur Pirate", () => {
  it("−11: destroys the opponent's creatures and deals their total power to them", () => {
    const { game } = table();
    const angrath = spawn(game, "Angrath, Minotaur Pirate");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears", A);
    loyalty(game, angrath, -11, { atLeast: 11, targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(life(game, B)).toBe(15);
  });

  it("−11: a creature with negative power lowers the total; a survivor counts as it is", () => {
    const { game } = table();
    const angrath = spawn(game, "Angrath, Minotaur Pirate");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    shrink(game, bears, -4); // -2/2
    const myr = spawn(game, "Darksteel Myr", B); // 0/1 indestructible
    shrink(game, myr, -1); // -1/1
    loyalty(game, angrath, -11, { atLeast: 11, targets: [ref(B)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, myr)).toBe("battlefield");
    // 3 + (-2) + (-1) = 0.
    expect(life(game, B)).toBe(20);
  });

  it("−11: the total is clamped at 0, not dealt as negative damage", () => {
    const { game } = table();
    const angrath = spawn(game, "Angrath, Minotaur Pirate");
    const bears = spawn(game, "Grizzly Bears", B);
    shrink(game, bears, -5); // -3/2
    loyalty(game, angrath, -11, { atLeast: 11, targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
  });

  it("+2: 1 damage to the opponent and each creature they control", () => {
    const { game } = table();
    const angrath = spawn(game, "Angrath, Minotaur Pirate");
    const elves = spawn(game, "Llanowar Elves", B);
    const mine = spawn(game, "Llanowar Elves", A);
    loyalty(game, angrath, 2, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[angrath].counters.loyalty).toBe(7);
  });

  it("−3: returns a Pirate card from the graveyard", () => {
    const { game } = table();
    const angrath = spawn(game, "Angrath, Minotaur Pirate");
    const pirate = toGraveyard(game, "Fathom Fleet Captain");
    loyalty(game, angrath, -3, { targets: [ref(pirate)] });
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Fathom Fleet Captain")).toBe(true);
  });
});
