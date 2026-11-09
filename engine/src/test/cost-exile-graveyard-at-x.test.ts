/**
 * An activated ability's "exile a card with mana value X from your graveyard"
 * reads the X announced (rules 107.3a, 602.2b): its legality, its payment and
 * the values it's offered at (Osgir, the Reconstructor).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import { A, activate, lands, spawn, table, toGraveyard, tokensNamed, zone } from "./harness.js";

const osgir = (game: Game) => {
  const id = spawn(game, "Osgir, the Reconstructor", A);
  game.state.objects[id].summoningSick = false;
  return id;
};

describe("Osgir: Exile an artifact card with mana value X", () => {
  it("copies a card of exactly X", () => {
    const { game } = table();
    const source = osgir(game);
    const walker = toGraveyard(game, "Palladium Myr", A); // mana value 3
    lands(game, "Mountain", 3);
    activate(game, source, 1, { x: 3 });
    expect(zone(game, walker)).toBe("exile");
    expect(tokensNamed(game, "Palladium Myr", A)).toBe(2);
  });

  it("refuses an X with no card of that mana value", () => {
    const { game } = table();
    const source = osgir(game);
    toGraveyard(game, "Palladium Myr", A);
    lands(game, "Mountain", 4);
    expect(() => activate(game, source, 1, { x: 2 })).toThrow(/too few cards/);
  });

  it("is offered only at the mana values in the graveyard", () => {
    const { game } = table();
    const source = osgir(game);
    toGraveyard(game, "Palladium Myr", A);
    toGraveyard(game, "Ornithopter", A);
    toGraveyard(game, "Grizzly Bears", A); // not an artifact, so its 2 isn't offered
    lands(game, "Mountain", 4);
    const offers = game
      .legalActions(A)
      .filter((a): a is Extract<LegalAction, { kind: "activate-ability" }> => a.kind === "activate-ability" && a.source === source && a.abilityIndex === 1)
      .map((a) => a.xCost?.minX);
    expect(offers.sort()).toEqual([0, 3]);
  });
});
