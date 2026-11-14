/**
 * Damage doubled to the chosen player's side (`would-deal-damage`'s `to:
 * "chosen-player-side"` — Sawhorn Nemesis): the player chosen as the
 * permanent entered (rule 614.1c, `choosePlayerOnEnter`) and the permanents
 * that player controls are dealt double damage, from any source; nobody else.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, C, cast, destroy, lands, life, named, ref, spawn, table, toHand } from "./harness.js";

/** `source` deals `amount` damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("damage doubled to the chosen player and their permanents", () => {
  it("Sawhorn Nemesis doubles damage to the chosen player and what they control, from any source, and nobody else", () => {
    const { game, a } = table({ players: 3 });
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return B;
    };
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Sawhorn Nemesis"));
    // "Choose a player": you are among them.
    expect(offered).toContain(A);
    const [nemesis] = named(game, "Sawhorn Nemesis");
    expect(game.state.objects[nemesis].chosenPlayer).toBe(B);
    const goblin = spawn(game, "Raging Goblin", A);
    const theirGoblin = spawn(game, "Raging Goblin", B);
    const theirWall = spawn(game, "Wall of Stone", B);
    const carolsWall = spawn(game, "Wall of Stone", C);
    const myWall = spawn(game, "Wall of Stone", A);
    hit(game, goblin, ref(B), 3);
    expect(life(game, B)).toBe(14);
    // Their own source too.
    hit(game, theirGoblin, ref(theirWall), 3);
    expect(damage(game, theirWall)).toBe(6);
    hit(game, goblin, ref(C), 3);
    expect(life(game, C)).toBe(17);
    hit(game, goblin, ref(carolsWall), 3);
    expect(damage(game, carolsWall)).toBe(3);
    hit(game, theirGoblin, ref(myWall), 2);
    expect(damage(game, myWall)).toBe(2);
    hit(game, theirGoblin, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });

  it("stops once Sawhorn Nemesis leaves, its choice gone with it (rule 400.7)", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => B;
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Sawhorn Nemesis"));
    const [nemesis] = named(game, "Sawhorn Nemesis");
    const goblin = spawn(game, "Raging Goblin", A);
    hit(game, goblin, ref(B), 2);
    expect(life(game, B)).toBe(16);
    destroy(game, nemesis);
    hit(game, goblin, ref(B), 2);
    expect(life(game, B)).toBe(14);
  });

  it("choosing yourself doubles the damage dealt to you", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => A;
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Sawhorn Nemesis"));
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(16);
    hit(game, goblin, ref(B), 2);
    expect(life(game, B)).toBe(18);
  });
});
