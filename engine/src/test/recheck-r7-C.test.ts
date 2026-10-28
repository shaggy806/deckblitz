/**
 * Batch B241 (need-keys recheck R7), group C: Angel of Suffering, Blessed
 * Sanctuary, Bloatfly Swarm.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, counters, enter, graveyard, life, ref, settle, spawn, table, tokensNamed } from "./harness.js";

const damage = (game: Game, n: number, to: PlayerId | ObjectId, by: PlayerId = B): void => {
  game.debugApplyEffect(by, { kind: "damage", amount: n, target: 0 }, [ref(to)]);
  settle(game);
};
const rad = (game: Game, player: PlayerId): number => game.state.players[player].counters.rad ?? 0;

describe("Angel of Suffering", () => {
  it("prevents damage dealt to you and mills twice that many", () => {
    const { game } = table();
    spawn(game, "Angel of Suffering");
    const before = graveyard(game, A).length;
    damage(game, 3, A);
    expect(life(game, A)).toBe(20);
    expect(graveyard(game, A).length - before).toBe(6);
  });
});

describe("Blessed Sanctuary", () => {
  it("prevents noncombat damage to you and your creatures, and makes a Unicorn per nontoken creature", () => {
    const { game } = table();
    spawn(game, "Blessed Sanctuary");
    const bears = enter(game, "Grizzly Bears");
    expect(tokensNamed(game, "Unicorn Token", A)).toBe(1);
    damage(game, 3, A);
    damage(game, 3, bears);
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    const theirs = spawn(game, "Grizzly Bears", B);
    damage(game, 1, theirs, A);
    expect(game.state.objects[theirs].damageMarked).toBe(1);
  });
});

describe("Bloatfly Swarm", () => {
  it("gives each player a rad counter per counter actually removed", () => {
    const { game } = table();
    const swarm = enter(game, "Bloatfly Swarm");
    expect(counters(game, swarm)).toBe(5);
    damage(game, 2, swarm);
    expect(counters(game, swarm)).toBe(3);
    expect(rad(game, A)).toBe(2);
    expect(rad(game, B)).toBe(2);
    damage(game, 7, swarm);
    // Only three counters left to remove: three rad counters, not seven.
    expect(rad(game, A)).toBe(5);
    expect(rad(game, B)).toBe(5);
    expect(counters(game, swarm)).toBe(0);
    expect(game.state.objects[swarm].damageMarked).toBe(0);
  });
});
