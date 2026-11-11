import { describe, expect, it } from "vitest";
import { candidateActions } from "../bot/candidates.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const [A, B] = ["alice", "bob"].map(asPlayerId);
const registry = createDefaultRegistry();

describe("a convoke cast at a taxed target", () => {
  it("is never a candidate the engine refuses", () => {
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry,
      startingPlayer: A,
      decks: [A, B].map((player) => ({ player, cards: Array(40).fill("Plains") })),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    game.state.zones.perPlayer[A].hand = [];
    for (let i = 0; i < 7; i += 1) game.debugSpawn("Goblin Piker", A, "battlefield");
    game.debugSpawn("Boreal Elemental", B, "battlefield");
    game.debugSpawn("Grizzly Bears", B, "battlefield");
    const stoke = game.debugSpawn("Stoke the Flames", A, "hand");
    const offer = game.legalActions(A).find((l) => l.kind === "cast-spell" && l.card === stoke);
    expect(offer).toBeDefined();
    const casts = candidateActions(offer!, A);
    expect(casts.length).toBeGreaterThan(0);
    for (const cast of casts) {
      const sim = Game.fromSnapshot(game.snapshot(), { registry });
      expect(() => sim.dispatch(cast), JSON.stringify(cast)).not.toThrow();
    }
  });
});
