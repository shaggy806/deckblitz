/**
 * "Less than half their starting life total" — the `life-total` condition's
 * `atMost: "below-half-starting"`: strictly under half, which may be a
 * fraction (a starting 41's half is 20½, so 20 or less is under it). Anya,
 * Merciless Angel: +3/+3 for each opponent below it (`grantPtPerCount`'s
 * `opponents: { where }`), and indestructible while any opponent is.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, keywords, pt, spawn, table } from "./harness.js";

/** `player` loses life until they're at `life`. */
const setLife = (game: Game, player: PlayerId, life: number): void =>
  game.debugApplyEffect(player, { kind: "lose-life", amount: game.state.players[player].life - life, who: "you" }, []);

describe("Anya, Merciless Angel", () => {
  it("+3/+3 for each opponent under half their starting life total; exactly half isn't under it", () => {
    const { game } = table({ players: 3, life: 40 });
    const anya = spawn(game, "Anya, Merciless Angel", A);
    expect(pt(game, anya)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, anya).has("indestructible")).toBe(false);
    setLife(game, B, 20);
    expect(pt(game, anya)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, anya).has("indestructible")).toBe(false);
    setLife(game, B, 19);
    expect(pt(game, anya)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, anya).has("indestructible")).toBe(true);
    setLife(game, C, 3);
    expect(pt(game, anya)).toEqual({ power: 10, toughness: 10 });
  });

  it("an odd starting life total: 20 is under half of 41 (its ruling), 21 isn't", () => {
    const { game } = table({ life: 41 });
    const anya = spawn(game, "Anya, Merciless Angel", A);
    setLife(game, B, 21);
    expect(pt(game, anya)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, anya).has("indestructible")).toBe(false);
    setLife(game, B, 20);
    expect(pt(game, anya)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, anya).has("indestructible")).toBe(true);
  });

  it("its controller's own life total counts for neither", () => {
    const { game } = table();
    const anya = spawn(game, "Anya, Merciless Angel", A);
    setLife(game, A, 1);
    expect(pt(game, anya)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, anya).has("indestructible")).toBe(false);
  });
});
