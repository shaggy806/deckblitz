/**
 * Engines that make neither cards nor creature tokens (`bot/features.ts`'s
 * `valueRate` and `reductionPerTurn`; the bot audit's Q4): resource tokens
 * and life taken from opponents are `valueEngines`, in cards a round, and a
 * cost reduction is mana in `nonlandMana`.
 */
import { describe, expect, it } from "vitest";
import { engineScore, playerFeatures, trackRecordOf } from "../bot/features.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

const [A, B, C, D] = ["alice", "bob", "carol", "dave"].map(asPlayerId);
const registry = createDefaultRegistry();

/** Four players, bob with `name` on the battlefield. */
function fourPlayers(name: string): { game: Game; id: ObjectId } {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    startingPlayer: A,
    decks: [A, B, C, D].map((player) => ({ player, cards: Array(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  game.state.turn.number = 40;
  const id = game.debugSpawn(name, B, "battlefield", { summoningSick: false });
  return { game, id };
}

const features = (name: string) => {
  const { game } = fourPlayers(name);
  return playerFeatures(game.state, registry, B, false, 7);
};

describe("value engines", () => {
  it("prices Smothering Tithe's Treasures: half of one per opponent a round, four to a card", () => {
    expect(features("Smothering Tithe").valueEngines).toBeCloseTo((3 * 0.5) / 4);
  });

  it("prices a drain from each opponent by the opponents it hits", () => {
    // Zulaport Cutthroat: one firing a round, a life from each of three.
    expect(features("Zulaport Cutthroat").valueEngines).toBeCloseTo(3 / 4);
    // Purphoros: 2 damage to each of three, capped at a card and a half.
    expect(features("Purphoros, God of the Forge").valueEngines).toBeCloseTo(1.5);
  });

  it("prices a drain from one target as one player's life", () => {
    expect(features("Blood Artist").valueEngines).toBeCloseTo(1 / 4);
  });

  it("counts nothing for a blank body, a one-shot, or a creature-token engine", () => {
    expect(features("Grizzly Bears").valueEngines).toBe(0);
    expect(features("Hero of Bladehold").valueEngines).toBe(0);
    // Gray Merchant of Asphodel drains once, as it enters.
    expect(features("Gray Merchant of Asphodel").valueEngines).toBe(0);
  });

  it("counts a cost reduction as the mana it saves a turn", () => {
    expect(features("Goblin Electromancer").nonlandMana).toBe(1);
    expect(features("Urza's Incubator").nonlandMana).toBe(2);
    expect(features("Grizzly Bears").nonlandMana).toBe(0);
    // Thalia taxes; she saves nobody anything.
    expect(features("Thalia, Guardian of Thraben").nonlandMana).toBe(0);
  });

  it("puts a value engine among the engines removal is aimed at", () => {
    const { game, id } = fourPlayers("Smothering Tithe");
    expect(engineScore(game.state, registry, id)).toBeCloseTo(0.375);
  });

  it("doesn't count a printed drain a second time as a track record", () => {
    const { game, id } = fourPlayers("Zulaport Cutthroat");
    game.state.objects[id].enteredBattlefieldOnTurn = game.state.turn.number - 8;
    // Two rounds on the battlefield: six life is what its text says it takes.
    const settled = { turn: game.state.turn.number - 1, lifeTaken: 0, cardsDrawn: 0 };
    game.state.objects[id].tally = { lifeTaken: 6, cardsDrawn: 0, thisTurn: settled };
    expect(trackRecordOf(game.state, registry, id, 3)).toBe(0);
    // Twelve more is a record of its own: six past its text, over two rounds.
    game.state.objects[id].tally = { lifeTaken: 18, cardsDrawn: 0, thisTurn: settled };
    expect(trackRecordOf(game.state, registry, id, 3)).toBeCloseTo(12 / 4 / 2);
  });
});
