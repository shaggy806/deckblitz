/** Cards freed by the need-key themes and the last engine gaps (B293). */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, activate, lands, spawn, table, toHand, zone } from "./harness.js";

const pool = (game: Game): readonly string[] => game.state.players[A].manaPool.map((unit) => unit.type);

describe("a mana ability with a discard cost, on the real cards", () => {
  it("Bog Witch: {B}, {T}, discard a card makes {B}{B}{B}", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const witch = spawn(game, "Bog Witch");
    const first = toHand(game, "Grizzly Bears");
    toHand(game, "Forest");
    activate(game, witch, 0, { settle: false });
    expect(game.state.awaiting?.kind).toBe("discard");
    game.dispatch({ type: "discard", player: A, cards: [first] });
    expect(zone(game, first)).toBe("graveyard");
    expect(game.state.objects[witch].tapped).toBe(true);
    expect(pool(game)).toEqual(["B", "B", "B"]);
  });

  it("Skirge Familiar: discard a card makes {B}, with no tap", () => {
    const { game } = table();
    const familiar = spawn(game, "Skirge Familiar");
    const first = toHand(game, "Grizzly Bears");
    toHand(game, "Forest");
    activate(game, familiar, 0, { settle: false });
    game.dispatch({ type: "discard", player: A, cards: [first] });
    expect(pool(game)).toEqual(["B"]);
    expect(game.state.objects[familiar].tapped).toBe(false);
  });
});
