// Ark of Hunger's "{T}: Mill a card. You may play that card this turn." —
// `grant-graveyard-cast`'s `cards: "milled-this-way"` with `play` (B273, Tablet
// of Discovery) on an activated ability — and its batched "whenever one or
// more cards leave your graveyard", which playing that card sets off.

import { describe, expect, it } from "vitest";
import { A, B, activate, cast, life, lands, nextTurn, ref, settle, spawn, table, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);
const playable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "play-land" && a.card === card);

describe("Ark of Hunger", () => {
  it("mills a land that may be played from the graveyard, which drains each opponent", () => {
    const { game } = table();
    const ark = spawn(game, "Ark of Hunger");
    const forest = toLibrary(game, "Forest");
    activate(game, ark, 0);
    expect(zone(game, forest)).toBe("graveyard");
    expect(playable(game, forest)).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });

  it("lets a milled spell be cast from the graveyard this turn, and not on a later one", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const ark = spawn(game, "Ark of Hunger");
    const bolt = toLibrary(game, "Lightning Bolt");
    activate(game, ark, 0);
    expect(castable(game, bolt)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(castable(game, bolt)).toBe(false);
  });

  it("casting the milled spell is a card leaving the graveyard too", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const ark = spawn(game, "Ark of Hunger");
    const bolt = toLibrary(game, "Lightning Bolt");
    activate(game, ark, 0);
    cast(game, bolt, { targets: [ref(B)], via: "graveyard-permission" });
    // 3 from the Bolt, 1 from the Ark.
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(21);
  });
});
