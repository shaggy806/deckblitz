/**
 * Shilgengar, Sire of Famine: Blood tokens for a sacrificed creature — an
 * Angel's toughness of them, read as it last existed — and six of them
 * sacrificed to return every creature card from your graveyard with a
 * finality counter, as Vampires.
 */
import { describe, expect, it } from "vitest";

import { A, counters, graveyard, lands, settle, spawn, subtypes, table, toGraveyard, tokensNamed, zone } from "./harness.js";

describe("Shilgengar, Sire of Famine", () => {
  it("makes a Blood token for a creature, and an Angel's toughness of them for an Angel", () => {
    const { game } = table();
    const shilgengar = spawn(game, "Shilgengar, Sire of Famine");
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel");
    game.dispatch({ type: "activate-ability", player: A, source: shilgengar, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
    game.dispatch({ type: "activate-ability", player: A, source: shilgengar, abilityIndex: 0, targets: [], sacrifice: angel });
    settle(game);
    expect(tokensNamed(game, "Blood Token", A)).toBe(5);
  });

  it("sacrifices six Blood tokens to return each creature card with a finality counter, as Vampires", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const shilgengar = spawn(game, "Shilgengar, Sire of Famine");
    game.debugApplyEffect(A, { kind: "create-token", token: "Blood Token", count: 6 });
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Lightning Bolt");
    game.dispatch({ type: "activate-ability", player: A, source: shilgengar, abilityIndex: 1, targets: [] });
    if (game.state.awaiting?.kind === "sacrifice") {
      game.dispatch({ type: "sacrifice", player: A, permanents: game.state.awaiting.eligible.slice(0, 6) });
    }
    settle(game);
    expect(tokensNamed(game, "Blood Token", A)).toBe(0);
    for (const id of [bears, giant]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(counters(game, id, "finality")).toBe(1);
      expect(subtypes(game, id)).toContain("Vampire");
    }
    expect(graveyard(game).length).toBe(1);
  });
});
