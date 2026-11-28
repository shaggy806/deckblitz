/**
 * "Each opponent and planeswalker it has dealt damage to this game" (The
 * Fallen): the `"opponents-dealt-damage-by-source-this-game"` player scope
 * and `CardFilter.damagedThisGameBySource`, both off the journal's
 * whole-game record of what a permanent dealt damage to, each object in
 * its stint (rule 400.7; gaps key
 * `effect:damage-players-source-damaged-this-game`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, life, ref, settle, spawn, table, toStep } from "./harness.js";

const hit = (game: Game, source: ObjectId, target: Parameters<typeof ref>[0], amount = 1): void =>
  game.debugApplyEffect(A, { kind: "damage", target: 0, amount }, [ref(target)], { source });

const loyaltyOf = (game: Game, id: ObjectId): number => game.state.objects[id].counters.loyalty ?? 0;

describe("The Fallen", () => {
  it("hits only the opponents and planeswalkers it has dealt damage to", () => {
    const { game } = table({ players: 3 });
    const fallen = spawn(game, "The Fallen");
    const jace = spawn(game, "Jace Beleren", C);
    const other = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters.loyalty = 5;
    game.state.objects[other].counters.loyalty = 5;
    hit(game, fallen, B);
    hit(game, fallen, jace);
    settle(game);
    const bob = life(game, B);
    const carol = life(game, C);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(bob - 1);
    expect(life(game, C)).toBe(carol);
    expect(loyaltyOf(game, jace)).toBe(3);
    expect(loyaltyOf(game, other)).toBe(5);
  });

  it("forgets what it dealt damage to before it left the battlefield", () => {
    const { game } = table({ players: 3 });
    const fallen = spawn(game, "The Fallen");
    hit(game, fallen, B);
    game.debugMove(fallen, "hand");
    game.debugMove(fallen, "battlefield");
    const bob = life(game, B);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(bob);
  });

  it("doesn't count damage another permanent dealt", () => {
    const { game } = table({ players: 3 });
    spawn(game, "The Fallen");
    const bears = spawn(game, "Grizzly Bears");
    hit(game, bears, B);
    const bob = life(game, B);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(bob);
  });
});
