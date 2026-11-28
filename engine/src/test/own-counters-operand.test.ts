/**
 * The `{ ownCounters }` filter operand: a `NumCompare` against how many
 * counters of a kind are on the very object being matched — Corrosion's
 * "destroy each artifact with mana value less than or equal to the number of
 * rust counters on it".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, counters, destroy, lands, nextTurn, pickModes, spawn, table, zone } from "./harness.js";

/** Alice's Corrosion, its cumulative upkeep paid each upkeep. */
function corrosion(): ReturnType<typeof table> & { corrosion: ObjectId } {
  const t = table();
  const id = spawn(t.game, "Corrosion");
  lands(t.game, "Swamp", 4);
  pickModes(t.a, 0);
  return { ...t, corrosion: id };
}

/** On to alice's next main phase, her upkeep triggers resolved. */
const toHerNextTurn = (game: Game): void => {
  nextTurn(game);
  nextTurn(game);
};

describe("Corrosion", () => {
  it("rusts each artifact the opponent controls, destroying those whose mana value its counters reach", () => {
    const { game, corrosion: c } = corrosion();
    const ring = spawn(game, "Sol Ring", B);
    const stone = spawn(game, "Mind Stone", B);
    toHerNextTurn(game);
    expect(zone(game, c)).toBe("battlefield");
    expect(counters(game, c, "age")).toBe(1);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, stone)).toBe("battlefield");
    expect(counters(game, stone, "rust")).toBe(1);
    toHerNextTurn(game);
    expect(zone(game, stone)).toBe("graveyard");
  });

  it("destroys every artifact its counters reach, its controller's own too", () => {
    const { game } = corrosion();
    const thopter = spawn(game, "Ornithopter", A);
    const stone = spawn(game, "Mind Stone", A);
    toHerNextTurn(game);
    // Mana value 0, no rust counters: 0 ≤ 0.
    expect(zone(game, thopter)).toBe("graveyard");
    // Her own get no counters.
    expect(counters(game, stone, "rust")).toBe(0);
    expect(zone(game, stone)).toBe("battlefield");
  });

  it("as it leaves, every rust counter comes off every permanent", () => {
    const { game, corrosion: c } = corrosion();
    const stone = spawn(game, "Mind Stone", B);
    toHerNextTurn(game);
    expect(counters(game, stone, "rust")).toBe(1);
    destroy(game, c, A);
    expect(zone(game, c)).toBe("graveyard");
    expect(counters(game, stone, "rust")).toBe(0);
  });
});
