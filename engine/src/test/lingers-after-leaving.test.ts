/**
 * A static whose effect "continues until end of turn" once its permanent
 * leaves the battlefield (`StaticAbility.lingersAfterLeaving`): it carries on
 * as a timed static, in every layer it worked in — Titania's Song.
 */

import { describe, expect, it } from "vitest";

import { hasLostAbilities } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { destroy, nextTurn, pt, registryOf, settle, spawn, table, types } from "./harness.js";

const lost = (game: Game, id: ObjectId): boolean => hasLostAbilities(game.state, registryOf(game), game.state.objects[id]);

describe("Titania's Song", () => {
  it("makes noncreature artifacts creatures by mana value with no abilities", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    const walker = spawn(game, "Ornithopter");
    spawn(game, "Titania's Song");
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, ring)).toEqual({ power: 1, toughness: 1 });
    expect(lost(game, ring)).toBe(true);
    // Already a creature: not reached.
    expect(pt(game, walker)).toEqual({ power: 0, toughness: 2 });
    expect(lost(game, walker)).toBe(false);
  });

  it("goes on after it leaves the battlefield until end of turn, reaching later artifacts", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    const song = spawn(game, "Titania's Song");
    destroy(game, song);
    settle(game);
    expect(game.state.objects[song].zone).toBe("graveyard");
    expect(types(game, ring)).toContain("creature");
    expect(pt(game, ring)).toEqual({ power: 1, toughness: 1 });
    expect(lost(game, ring)).toBe(true);
    const stone = spawn(game, "Mind Stone");
    expect(pt(game, stone)).toEqual({ power: 2, toughness: 2 });
    expect(lost(game, stone)).toBe(true);
    // Not an emblem at the table.
    expect(game.state.emblems.every((e) => e.expires !== undefined)).toBe(true);
    nextTurn(game);
    expect(types(game, ring)).not.toContain("creature");
    expect(lost(game, ring)).toBe(false);
    expect(game.state.emblems).toHaveLength(0);
  });
});
