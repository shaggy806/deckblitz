/**
 * v2's cast candidates take the convoke payment the offer proved
 * (`castExtras` in `bot/candidates.ts`), as v1 does. They used to tap the
 * first creatures for generic mana, which can't pay a coloured pip only a
 * creature can: the search dropped such a cast (its simulation was refused),
 * and under a clock an unscored search dispatched it and threw "cannot pay
 * the cost of Devouring Light" (found by the bot audit's step 5 A/B at the
 * live budget, 2026-11-10: 12 of 215 games).
 */
import { describe, expect, it } from "vitest";
import { candidateActions } from "../bot/candidates.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const [A, B] = ["alice", "bob"].map(asPlayerId);
const registry = createDefaultRegistry();

describe("a convoke cast's candidates", () => {
  it("pay coloured pips with the creatures the offer proved", () => {
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry,
      startingPlayer: A,
      decks: [A, B].map((player) => ({ player, cards: Array(40).fill("Forest") })),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    game.state.zones.perPlayer[A].hand = [];
    // Stoke the Flames is {2}{R}{R}: two Forests pay the generic, and only
    // the two red creatures can pay the red.
    for (let i = 0; i < 2; i += 1) game.debugSpawn("Forest", A, "battlefield");
    for (let i = 0; i < 2; i += 1) game.debugSpawn("Goblin Piker", A, "battlefield");
    const stoke = game.debugSpawn("Stoke the Flames", A, "hand");
    const offer = game.legalActions(A).find((l) => l.kind === "cast-spell" && l.card === stoke);
    expect(offer).toBeDefined();
    const casts = candidateActions(offer!, A);
    expect(casts.length).toBeGreaterThan(0);
    for (const cast of casts) {
      const sim = Game.fromSnapshot(game.snapshot(), { registry });
      expect(() => sim.dispatch(cast)).not.toThrow();
    }
  });
});
