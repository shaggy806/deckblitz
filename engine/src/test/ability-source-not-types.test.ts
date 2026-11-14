/**
 * An ability target's `sourceFilter: { notTypes }` — "counter target
 * activated or triggered ability from a **noncreature** source" (Emerald
 * Dragon's Adventure, Dissonant Wave).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("an ability from a noncreature source — Dissonant Wave", () => {
  it("counters an artifact's ability, and the card goes on an Adventure", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    lands(game, "Forest", 3);
    const rod = spawn(game, "Rod of Ruin");
    activate(game, rod, 0, { targets: [ref(B)], settle: false });
    const ability = game.state.zones.shared.stack[0];
    const dragon = toHand(game, "Emerald Dragon");
    game.dispatch({ type: "cast-spell", player: A, card: dragon, face: 1, targets: [ref(ability)] });
    settle(game);
    expect(life(game, B)).toBe(20);
    expect(zone(game, dragon)).toBe("exile");
  });

  it("can't target a creature's ability", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    activate(game, sorcerer, 0, { targets: [ref(B)], settle: false });
    const ability = game.state.zones.shared.stack[0];
    const dragon = toHand(game, "Emerald Dragon");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: dragon, face: 1, targets: [ref(ability)] })).not.toBeNull();
    expect(
      game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === dragon && o.face === 1),
    ).toBe(false);
  });
});
