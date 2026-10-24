/**
 * A mana ability that reads what its cost sacrificed: it never goes on the
 * stack (rule 605.3b), so the sacrificed object is handed to it as it
 * resolves, at once — Priest of Yawgmoth's "an amount of {B} equal to the
 * sacrificed artifact's mana value", read as the artifact last existed
 * (608.2h).
 */
import { describe, expect, it } from "vitest";

import { A, spawn, table, zone } from "./harness.js";

const black = (game: ReturnType<typeof table>["game"]): number =>
  game.state.players[A].manaPool.filter((unit) => unit.type === "B").length;

describe("Priest of Yawgmoth", () => {
  it("adds {B} equal to the sacrificed artifact's mana value", () => {
    const { game } = table();
    const priest = spawn(game, "Priest of Yawgmoth");
    const relic = spawn(game, "Darksteel Relic");
    const stone = spawn(game, "Mind Stone");
    game.dispatch({ type: "activate-ability", player: A, source: priest, abilityIndex: 0, targets: [], sacrifice: stone });
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, relic)).toBe("battlefield");
    expect(black(game)).toBe(2);
  });

  it("a mana value 0 artifact makes no mana", () => {
    const { game } = table();
    const priest = spawn(game, "Priest of Yawgmoth");
    const relic = spawn(game, "Darksteel Relic");
    game.dispatch({ type: "activate-ability", player: A, source: priest, abilityIndex: 0, targets: [], sacrifice: relic });
    expect(zone(game, relic)).toBe("graveyard");
    expect(black(game)).toBe(0);
  });
});
