/**
 * "As long as it attacked a battle this turn" (War Historian): the
 * `attackedBattleThisTurn` history clause, set as the creature is declared
 * attacking a battle (rule 506.3) and held for the rest of the turn whatever
 * becomes of the battle (the card's ruling), reset as the next turn begins
 * and by a change of zone (rule 400.7).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { B, attack, cast, destroy, keywords, lands, nextTurn, spawn, table, toHand, zone } from "./harness.js";

function invade(game: Parameters<typeof lands>[0]): ObjectId {
  lands(game, "Swamp", 3);
  lands(game, "Forest", 3);
  const battle = toHand(game, "Invasion of Lorwyn");
  cast(game, battle);
  return battle;
}

describe("War Historian", () => {
  it("has reach, and no indestructible before it attacks", () => {
    const { game } = table();
    const historian = spawn(game, "War Historian");
    expect(keywords(game, historian).has("reach")).toBe(true);
    expect(keywords(game, historian).has("indestructible")).toBe(false);
  });

  it("attacking a battle, it's indestructible for the rest of the turn", () => {
    const { game, a } = table();
    const battle = invade(game);
    const historian = spawn(game, "War Historian");
    attack(game, a, [historian], battle);
    expect(game.state.objects[battle].counters.defense).toBe(2);
    expect(keywords(game, historian).has("indestructible")).toBe(true);
    destroy(game, historian);
    expect(zone(game, historian)).toBe("battlefield");
  });

  it("stays indestructible after the battle it attacked is defeated", () => {
    const { game, a } = table();
    const battle = invade(game);
    const historian = spawn(game, "War Historian");
    const wurm = spawn(game, "Craw Wurm");
    a.chooseCastNowFn = () => null;
    attack(game, a, [historian, wurm], battle);
    expect(zone(game, battle)).not.toBe("battlefield");
    expect(keywords(game, historian).has("indestructible")).toBe(true);
  });

  it("attacking a player instead, it isn't", () => {
    const { game, a } = table();
    invade(game);
    const historian = spawn(game, "War Historian");
    attack(game, a, [historian], B);
    expect(keywords(game, historian).has("indestructible")).toBe(false);
    destroy(game, historian);
    expect(zone(game, historian)).toBe("graveyard");
  });

  it("the next turn it's gone", () => {
    const { game, a } = table();
    const battle = invade(game);
    const historian = spawn(game, "War Historian");
    attack(game, a, [historian], battle);
    nextTurn(game);
    expect(keywords(game, historian).has("indestructible")).toBe(false);
  });
});
