/**
 * Combat damage to a player replaced by that player milling (rule 614.1a,
 * 614.6): Undead Alchemist's "if a Zombie you control would deal combat
 * damage to a player, instead that player mills that many cards" — a
 * `would-deal-damage` replacement whose `instead` is an effect, the damaged
 * player its `"trigger-player"` — and its trigger on a creature card put
 * into an opponent's graveyard from their library.
 */

import { describe, expect, it } from "vitest";

import { A, B, attack, graveyard, life, named, settle, spawn, table, toLibrary, tokensNamed, zone } from "./harness.js";

const ALCHEMIST = "Undead Alchemist";
const library = (game: ReturnType<typeof table>["game"], player = B): number => game.state.zones.perPlayer[player].library.length;

describe("Undead Alchemist", () => {
  it("a Zombie's combat damage to a player is that player milling that many cards instead", () => {
    const { game, a } = table();
    const alchemist = spawn(game, ALCHEMIST);
    const before = library(game);
    attack(game, a, [alchemist]);
    expect(life(game, B)).toBe(20);
    expect(library(game)).toBe(before - 4);
    expect(graveyard(game, B)).toHaveLength(4);
  });

  it("replaces every Zombie's damage, and nothing else's", () => {
    const { game, a } = table();
    spawn(game, ALCHEMIST);
    const corpse = spawn(game, "Walking Corpse");
    const bears = spawn(game, "Grizzly Bears");
    const before = library(game);
    attack(game, a, [corpse, bears]);
    // The 2/2 Zombie mills two; the Bear deals its 2 damage.
    expect(life(game, B)).toBe(18);
    expect(library(game)).toBe(before - 2);
  });

  it("isn't an opponent's Zombie's damage", () => {
    const { game, a } = table();
    spawn(game, ALCHEMIST, B);
    const corpse = spawn(game, "Walking Corpse");
    const before = library(game);
    attack(game, a, [corpse]);
    expect(life(game, B)).toBe(18);
    expect(library(game)).toBe(before);
  });

  it("exiles a creature card milled from an opponent's library and makes a Zombie", () => {
    const { game, a } = table();
    const alchemist = spawn(game, ALCHEMIST);
    const bears = toLibrary(game, "Grizzly Bears", B);
    attack(game, a, [alchemist]);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    // The three lands milled with it stay in the graveyard.
    expect(graveyard(game, B)).toHaveLength(3);
  });

  it("two Alchemists replace the damage once, and each makes a Zombie for the card", () => {
    const { game, a } = table();
    const alchemist = spawn(game, ALCHEMIST);
    spawn(game, ALCHEMIST);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const before = library(game);
    attack(game, a, [alchemist]);
    expect(library(game)).toBe(before - 4);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(2);
    expect(named(game, ALCHEMIST)).toHaveLength(2);
  });

  it("doesn't see a creature card milled from its controller's own library", () => {
    const { game } = table();
    spawn(game, ALCHEMIST);
    const bears = toLibrary(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
  });
});
