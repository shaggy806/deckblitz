/**
 * A delayed "whenever one or more creatures deal combat damage to a player"
 * fires as a printed one does (rule 603.2c): once per player dealt damage in
 * the simultaneous event, however many creatures dealt it.
 */
import { describe, expect, it } from "vitest";
import { A, attack, B, C, loyalty, spawn, table, toStep } from "./harness.js";

const library = (game: ReturnType<typeof table>["game"]): number => game.state.zones.perPlayer[A].library.length;

describe("Jace, Cunning Castaway's +1", () => {
  it("draws once for two creatures connecting with one player", () => {
    const { game, a } = table({ deck: "Wastes" });
    const jace = spawn(game, "Jace, Cunning Castaway");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Savannah Lions");
    loyalty(game, jace, 1);
    const before = library(game);
    attack(game, a, [one, two]);
    expect(before - library(game)).toBe(1);
  });

  it("draws once for each player dealt damage", () => {
    const { game, a } = table({ players: 3, deck: "Wastes" });
    const jace = spawn(game, "Jace, Cunning Castaway");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Savannah Lions");
    const three = spawn(game, "Llanowar Elves");
    loyalty(game, jace, 1);
    const before = library(game);
    a.declareAttackersFn = () => [
      { attacker: one, defender: B },
      { attacker: two, defender: B },
      { attacker: three, defender: C },
    ];
    toStep(game, "postcombat-main");
    expect(before - library(game)).toBe(2);
  });
});
