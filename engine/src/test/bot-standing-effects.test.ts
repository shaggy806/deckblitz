/**
 * `standingEffects` (`bot/features.ts`'s `standingWorth`): a passive
 * permanent the engine terms don't price is brought up to a vanilla creature
 * of its mana value, so v2 no longer casts every creature first and an
 * enchantment only with mana left over (the upgraded decks' card-usage
 * report, 2026-11-11).
 */
import { describe, expect, it } from "vitest";
import { DEFAULT_WEIGHTS } from "../bot/evaluate.js";
import { playerFeatures } from "../bot/features.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const [A, B, C, D] = ["alice", "bob", "carol", "dave"].map(asPlayerId);
const registry = createDefaultRegistry();

/** Bob's features at a four-player table with `name` on his battlefield. */
function features(name: string) {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    startingPlayer: A,
    decks: [A, B, C, D].map((player) => ({ player, cards: Array(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  game.state.turn.number = 40;
  game.debugSpawn(name, B, "battlefield", { summoningSick: false });
  return playerFeatures(game.state, registry, B, false, 7);
}

/** What the permanent's own terms score on the shipped weights. */
function worth(name: string): number {
  const f = features(name);
  const w = DEFAULT_WEIGHTS;
  return (
    w.creatures * f.creatures +
    w.power * f.power +
    w.toughness * f.toughness +
    w.untappedCreatures * f.untappedCreatures +
    w.otherPermanents * f.otherPermanents +
    w.permanentManaValue * f.permanentManaValue +
    w.drawEngines * f.drawEngines +
    w.valueEngines * f.valueEngines +
    w.tokenEngines * f.tokenEngines +
    w.standingEffects * f.standingEffects
  );
}

describe("standing effects", () => {
  it("brings an unpriced passive permanent up to its mana value and a little over", () => {
    // Parallel Lives, Ghostly Prison, Panharmonicon: no rate prices them.
    expect(features("Parallel Lives").standingEffects).toBeCloseTo(4 + 1.5);
    expect(features("Ghostly Prison").standingEffects).toBeCloseTo(3 + 1.5);
    expect(features("Panharmonicon").standingEffects).toBeCloseTo(4 + 1.5);
  });

  it("takes off what the engine terms already score", () => {
    // Smothering Tithe: 0.375 cards a round at four players, 1.5 points.
    expect(features("Smothering Tithe").standingEffects).toBeCloseTo(4 + 1.5 - 1.5);
    // Phyrexian Arena draws a card a round: 4 points of its 4.5.
    expect(features("Phyrexian Arena").standingEffects).toBeCloseTo(0.5);
    // Rhystic Study is priced past the floor already.
    expect(features("Rhystic Study").standingEffects).toBeLessThan(1);
  });

  it("is nothing for a creature, a rock, an Aura or an Equipment", () => {
    expect(features("Beast Whisperer").standingEffects).toBe(0);
    expect(features("Mind Stone").standingEffects).toBe(0);
    expect(features("Pacifism").standingEffects).toBe(0);
    expect(features("Lightning Greaves").standingEffects).toBe(0);
  });

  it("is nothing for a planeswalker, or a permanent whose only trigger is its own entering", () => {
    // `loyalty` prices a planeswalker; found by the first `bot:diff`, where
    // Ajani came down ahead of the commander.
    expect(features("Ajani, Caller of the Pride").standingEffects).toBe(0);
    // Bitter Reunion: "When this enters, you may discard a card. If you do,
    // draw two cards", and an ability that sacrifices it.
    expect(features("Bitter Reunion").standingEffects).toBe(0);
  });

  it("scores a passive permanent just over a vanilla creature of its mana value", () => {
    expect(worth("Parallel Lives")).toBeGreaterThan(worth("Rumbling Baloth"));
    expect(worth("Parallel Lives") - worth("Rumbling Baloth")).toBeLessThan(1.5);
    expect(worth("Ghostly Prison")).toBeGreaterThan(worth("Centaur Courser"));
    expect(worth("Smothering Tithe")).toBeGreaterThan(worth("Rumbling Baloth"));
  });
});
