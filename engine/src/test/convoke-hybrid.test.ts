/**
 * Convoke pays a hybrid symbol (rule 702.51a): "for each colored mana in this
 * spell's total cost, you may tap an untapped creature of that color" — and a
 * hybrid symbol is a colored one, of each of its colors (rule 107.4e). Merrow
 * Skyswimmer's {W/U}{W/U} is paid by white or blue creatures, never by a
 * colorless one; `payColoredSymbols` matches each payment to a symbol.
 */

import { describe, expect, it } from "vitest";

import { parseManaCost, payColoredSymbols } from "../mana.js";
import { A, cast, spawn, table, toHand, zone } from "./harness.js";

describe("convoke and hybrid mana", () => {
  it("a white and a blue creature pay Merrow Skyswimmer's {W/U}{W/U}, three more its {3}", () => {
    const { game } = table();
    const lions = spawn(game, "Savannah Lions");
    const merfolk = spawn(game, "Merfolk of the Pearl Trident");
    const bots = [spawn(game, "Ornithopter"), spawn(game, "Ornithopter"), spawn(game, "Memnite")];
    const skyswimmer = toHand(game, "Merrow Skyswimmer");
    const offer = game
      .legalActions(A)
      .find((a) => a.kind === "cast-spell" && a.card === skyswimmer);
    expect(offer?.kind === "cast-spell" ? offer.convoke?.maxCreatures : undefined).toBe(5);
    cast(game, skyswimmer, { convoke: [lions, merfolk, ...bots].map((creature) => ({ creature })) });
    expect(zone(game, skyswimmer)).toBe("battlefield");
    for (const id of [lions, merfolk, ...bots]) expect(game.state.objects[id].tapped).toBe(true);
  });

  it("a colorless creature can't pay a hybrid symbol: four artifacts and a white creature aren't enough", () => {
    const { game } = table();
    const lions = spawn(game, "Savannah Lions");
    const bots = [spawn(game, "Ornithopter"), spawn(game, "Ornithopter"), spawn(game, "Memnite"), spawn(game, "Memnite")];
    const skyswimmer = toHand(game, "Merrow Skyswimmer");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === skyswimmer)).toBe(false);
    expect(() =>
      cast(game, skyswimmer, { convoke: [lions, ...bots].map((creature) => ({ creature })) }),
    ).toThrow(/nothing left to pay for by convoking/);
  });

  it("payColoredSymbols matches each payment to a symbol it can pay", () => {
    const cost = parseManaCost("{1}{W/U}{U/B}");
    // A blue payment taking {W/U} would leave the white one nowhere.
    expect(payColoredSymbols(cost, ["U", "W"])?.hybrid).toEqual([]);
    expect(payColoredSymbols(cost, ["W", "W"])).toBeNull();
    expect(payColoredSymbols(parseManaCost("{B}{B/G}"), ["B", "B"])?.hybrid).toEqual([]);
    expect(payColoredSymbols(parseManaCost("{B}{B/G}"), ["B"])?.colored.B).toBe(0);
  });
});
