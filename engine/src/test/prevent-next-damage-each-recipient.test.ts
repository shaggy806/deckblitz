/**
 * "Prevent the next 1 damage that would be dealt to **each** creature and
 * each player this turn" (Kitsune Palliator): a `damage-rule` with
 * `eachRecipient`, a template (`ActiveReplacement.eachRecipient`) that gives
 * each recipient a shield of its own the first time damage would be dealt to
 * it (rule 615.7) — one arriving later included (rule 611.2c). Samite
 * Censer-Bearer (each creature you control) and Wojek Apothecary (radiance).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, attack, lands, life, nextTurn, ref, settle, spawn, table } from "./harness.js";

const hit = (game: Game, target: ObjectId | PlayerId, amount: number): void => {
  game.debugApplyEffect(B, { kind: "damage", amount, target: 0 }, [ref(target)]);
  settle(game);
};

const marked = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Kitsune Palliator", () => {
  it("prevents the next 1 to each creature and each player, each its own", () => {
    const { game } = table();
    const fox = spawn(game, "Kitsune Palliator", A);
    const giant = spawn(game, "Hill Giant", B);
    const ogre = spawn(game, "Gray Ogre", A);
    activate(game, fox);
    hit(game, giant, 2);
    hit(game, ogre, 2);
    hit(game, A, 3);
    hit(game, B, 3);
    expect(marked(game, giant)).toBe(1);
    expect(marked(game, ogre)).toBe(1);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
    // Each shield is spent: the next hit is dealt in full.
    hit(game, giant, 1);
    expect(marked(game, giant)).toBe(2);
    hit(game, A, 1);
    expect(life(game, A)).toBe(17);
  });

  it("one simultaneous event to many recipients: 1 off each", () => {
    const { game } = table();
    const fox = spawn(game, "Kitsune Palliator", A);
    const giant = spawn(game, "Hill Giant", B);
    const ogre = spawn(game, "Gray Ogre", A);
    activate(game, fox);
    game.debugApplyEffect(B, { kind: "damage-all", amount: 2, filter: { type: "creature" } }, []);
    settle(game);
    expect(marked(game, giant)).toBe(1);
    expect(marked(game, ogre)).toBe(1);
    expect(marked(game, fox)).toBe(1);
  });

  it("combat damage: 1 off the attacker's hit on the player", () => {
    const { game, a } = table();
    const fox = spawn(game, "Kitsune Palliator", B);
    const giant = spawn(game, "Hill Giant", A);
    game.debugApplyEffect(B, { kind: "damage-rule", to: { players: "each", permanents: { type: "creature" } }, amount: 1, eachRecipient: true }, []);
    settle(game);
    void fox;
    attack(game, a, [giant]);
    expect(life(game, B)).toBe(18);
  });

  it("covers a creature that arrives after it resolves (611.2c)", () => {
    const { game } = table();
    const fox = spawn(game, "Kitsune Palliator", A);
    activate(game, fox);
    const late = spawn(game, "Hill Giant", B);
    hit(game, late, 2);
    expect(marked(game, late)).toBe(1);
  });

  it("two activations stack: two shields each", () => {
    const { game } = table();
    const fox = spawn(game, "Kitsune Palliator", A);
    const fox2 = spawn(game, "Kitsune Palliator", A);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, fox);
    activate(game, fox2);
    hit(game, giant, 3);
    expect(marked(game, giant)).toBe(1);
  });

  it("a shield is gone at end of turn", () => {
    const { game } = table();
    const fox = spawn(game, "Kitsune Palliator", A);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, fox);
    expect(game.state.activeReplacements.some((r) => r.eachRecipient !== undefined)).toBe(true);
    nextTurn(game);
    expect(game.state.activeReplacements.some((r) => r.eachRecipient !== undefined)).toBe(false);
    hit(game, giant, 2);
    expect(marked(game, giant)).toBe(2);
  });
});

describe("Samite Censer-Bearer", () => {
  it("only creatures you control", () => {
    const { game } = table();
    const monk = spawn(game, "Samite Censer-Bearer", A);
    const ogre = spawn(game, "Gray Ogre", A);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 1);
    activate(game, monk);
    hit(game, ogre, 2);
    hit(game, giant, 2);
    hit(game, A, 2);
    expect(marked(game, ogre)).toBe(1);
    expect(marked(game, giant)).toBe(2);
    expect(life(game, A)).toBe(18);
  });
});

describe("Wojek Apothecary", () => {
  it("the target and each other creature sharing a color with it", () => {
    const { game } = table();
    const cleric = spawn(game, "Wojek Apothecary", A);
    const ogre = spawn(game, "Gray Ogre", A);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, cleric, 0, { targets: [ref(ogre)] });
    hit(game, ogre, 2);
    hit(game, giant, 2);
    hit(game, bears, 1);
    expect(marked(game, ogre)).toBe(1);
    expect(marked(game, giant)).toBe(1);
    expect(marked(game, bears)).toBe(1);
  });
});
