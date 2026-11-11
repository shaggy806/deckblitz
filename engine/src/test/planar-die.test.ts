/**
 * "Roll the planar die" (`roll-dice` with `sides: "planar"` — Fractured
 * Powerstone). The planar die belongs to the Planechase variant (rule 901.3),
 * which the engine doesn't play, so the instruction can't be performed and is
 * ignored (rule 101.3; the card's ruling: "In non-Planechase games, Fractured
 * Powerstone's second ability will have no effect"): the ability is
 * activated and resolves, no die is thrown, nothing that watches for a roll
 * sees one, and the random stream isn't drawn from.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, life, spawn, table } from "./harness.js";

describe("Fractured Powerstone", () => {
  it("taps for {C}", () => {
    const { game } = table();
    const stone = spawn(game, "Fractured Powerstone");
    activate(game, stone, 0, { settle: false });
    expect(game.state.players[A].manaPool.map((unit) => unit.type)).toEqual(["C"]);
    expect(game.state.objects[stone].tapped).toBe(true);
  });

  it("rolling the planar die taps it and does nothing: no roll, no roll trigger, no random draw", () => {
    const { game } = table();
    const stone = spawn(game, "Fractured Powerstone");
    // "Whenever you roll one or more dice, this creature deals 1 damage to each opponent."
    spawn(game, "Brazen Dwarf");
    const rng = game.state.rngState;
    const rolls = game.state.eventLog.filter((e) => e.type === "dice-rolled").length;
    activate(game, stone, 1);
    expect(game.state.objects[stone].tapped).toBe(true);
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(game.state.eventLog.filter((e) => e.type === "dice-rolled")).toHaveLength(rolls);
    expect(life(game, B)).toBe(20);
    expect(game.state.rngState).toBe(rng);
  });

  it("only as a sorcery: not in your upkeep, though the mana ability is", () => {
    const { game } = table({ step: "upkeep" });
    const stone = spawn(game, "Fractured Powerstone");
    expect(() => activate(game, stone, 1)).toThrow(/during a main phase/i);
    expect(game.state.objects[stone].tapped).toBe(false);
    activate(game, stone, 0, { settle: false });
    expect(game.state.objects[stone].tapped).toBe(true);
  });
});
