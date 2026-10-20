/**
 * Party (rule 700.8): up to one each of Cleric, Rogue, Warrior and Wizard
 * among the creatures a player controls, a creature filling at most one role,
 * chosen to make the party as large as possible (700.8b). Zendikar Rising's
 * cards (B114) read it as a count and as "a full party" (700.8c).
 */
import { describe, expect, it } from "vitest";

import { partySizeOf } from "../characteristics.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, registryOf, spawn, table } from "./harness.js";

const party = (game: Game, player: PlayerId = A): number => partySizeOf(game.state, registryOf(game), player);

describe("party size", () => {
  it("counts one creature per role, up to four", () => {
    const { game } = table();
    expect(party(game)).toBe(0);
    spawn(game, "Abbey Matron"); // Cleric
    expect(party(game)).toBe(1);
    spawn(game, "Acolyte of Xathrid"); // a second Cleric fills nothing
    expect(party(game)).toBe(1);
    spawn(game, "Academy Raider"); // Warrior
    spawn(game, "Aetherblade Agent"); // Rogue
    expect(party(game)).toBe(3);
    spawn(game, "Aether Adept"); // Wizard
    expect(party(game)).toBe(4);
  });

  it("gives a creature of two roles the one that makes the party largest (700.8b)", () => {
    const { game } = table();
    spawn(game, "Siegfried, Famed Swordsman"); // Warrior Rogue
    expect(party(game)).toBe(1);
    spawn(game, "Academy Raider"); // Warrior: Siegfried is then the Rogue
    expect(party(game)).toBe(2);
    spawn(game, "Aetherblade Agent"); // Rogue: the two Warriors can't both count
    expect(party(game)).toBe(2);
  });

  it("counts a changeling in any one role", () => {
    const { game } = table();
    spawn(game, "Avian Changeling");
    expect(party(game)).toBe(1);
    spawn(game, "Abbey Matron");
    spawn(game, "Aether Adept");
    expect(party(game)).toBe(3);
    spawn(game, "Avian Changeling");
    expect(party(game)).toBe(4);
  });

  it("counts only the player's own creatures", () => {
    const { game } = table();
    spawn(game, "Abbey Matron", B);
    spawn(game, "Academy Raider");
    expect(party(game)).toBe(1);
    expect(party(game, B)).toBe(1);
  });

  it("counts each token of a compacted stack as a creature of its own", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Shapeshifter Token (Blue)", count: 10 });
    expect(game.state.zones.shared.battlefield).toHaveLength(1);
    expect(party(game)).toBe(4);
  });
});
