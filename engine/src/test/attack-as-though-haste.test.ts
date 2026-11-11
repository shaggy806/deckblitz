/**
 * "Can attack as though it had haste" (`StaticAbility.attackAsThoughHaste`):
 * a permission read as attackers are declared (rules 302.6, 508.1a,
 * 702.10b), never haste itself — Instill Energy's enchanted creature, and
 * Frenzied Saddlebrute's every creature, against its controller's opponents
 * and their planeswalkers only.
 */

import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, activate, attack, B, C, cast, keywords, lands, life, ref, registryOf, spawn, table, toHand } from "./harness.js";

const can = (game: Game, attacker: ObjectId, defender: PlayerId | ObjectId, player: PlayerId = A): boolean =>
  whyCannotAttack(game.state, registryOf(game), player, attacker, defender) === null;
const sick = (game: Game, name: string, player: PlayerId = A): ObjectId => spawn(game, name, player, { sick: true });

describe("Instill Energy", () => {
  it("lets the enchanted creature attack the turn it arrived, without haste", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const bears = sick(game, "Grizzly Bears");
    const other = sick(game, "Hill Giant");
    expect(can(game, bears, B)).toBe(false);
    cast(game, toHand(game, "Instill Energy"), { targets: [ref(bears)] });
    expect(can(game, bears, B)).toBe(true);
    expect(can(game, other, B)).toBe(false);
    expect(keywords(game, bears)).not.toContain("haste");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
  });

  it("opens no {T} ability (rule 702.10c), and untaps once a turn", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const pyro = sick(game, "Prodigal Pyromancer");
    const aura = toHand(game, "Instill Energy");
    cast(game, aura, { targets: [ref(pyro)] });
    expect(() => activate(game, pyro, 0, { targets: [ref(B)] })).toThrow();
    attack(game, a, [pyro]);
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[pyro].tapped).toBe(true);
    activate(game, aura, 0);
    expect(game.state.objects[pyro].tapped).toBe(false);
    expect(() => activate(game, aura, 0)).toThrow();
  });
});

describe("Frenzied Saddlebrute", () => {
  it("lets every creature attack its controller's opponents and their planeswalkers", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Frenzied Saddlebrute");
    const mine = sick(game, "Grizzly Bears");
    const bobs = sick(game, "Grizzly Bears", B);
    const myWalker = spawn(game, "Jace Beleren");
    const carolsWalker = spawn(game, "Jace Beleren", C);
    expect(can(game, mine, B)).toBe(true);
    expect(can(game, mine, carolsWalker)).toBe(true);
    // Bob's creature: at Carol, not at the Saddlebrute's controller.
    expect(can(game, bobs, C, B)).toBe(true);
    expect(can(game, bobs, carolsWalker, B)).toBe(true);
    expect(whyCannotAttack(game.state, registryOf(game), B, bobs, A)).toMatch(/summoning sickness/);
    expect(whyCannotAttack(game.state, registryOf(game), B, bobs, myWalker)).toMatch(/summoning sickness/);
    expect(keywords(game, mine)).not.toContain("haste");
  });

  it("reads 'your' as its controller, whoever attacks", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Frenzied Saddlebrute", B);
    const mine = sick(game, "Grizzly Bears");
    expect(can(game, mine, C)).toBe(true);
    expect(can(game, mine, B)).toBe(false);
  });

  it("is declared at an opponent through the engine", () => {
    const { game, a } = table();
    spawn(game, "Frenzied Saddlebrute");
    const bears = sick(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
  });
});
