/**
 * Mutavault: a land that becomes a 2/2 with all creature types for a turn, and
 * doesn't have changeling (its ruling).
 */
import { describe, expect, it } from "vitest";

import { A, activate, keywords, lands, nextTurn, pt, spawn, subtypes, table, types } from "./harness.js";
import { hasSubtype } from "../subtypes.js";

describe("Mutavault", () => {
  it("taps for {C}", () => {
    const { game } = table();
    const vault = spawn(game, "Mutavault");
    activate(game, vault, 0, { settle: false });
    expect(game.state.objects[vault].tapped).toBe(true);
    expect(game.state.players[A].manaPool.length).toBe(1);
  });

  it("becomes a 2/2 creature with every creature type until end of turn, still a land", () => {
    const { game } = table();
    const vault = spawn(game, "Mutavault");
    lands(game, "Wastes", 1);
    activate(game, vault, 1);
    expect(pt(game, vault)).toEqual({ power: 2, toughness: 2 });
    expect(types(game, vault)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(hasSubtype(subtypes(game, vault), "Goblin")).toBe(true);
    expect(hasSubtype(subtypes(game, vault), "Sliver")).toBe(true);
    expect(keywords(game, vault).has("changeling")).toBe(false);
    nextTurn(game);
    expect(types(game, vault)).not.toContain("creature");
    expect(hasSubtype(subtypes(game, vault), "Goblin")).toBe(false);
  });
});
