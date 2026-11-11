/**
 * What a card in hand is worth (`bot/hand-worth.ts`, the bot audit's Q2):
 * the `handQuality` feature, and the two things the evaluation could not
 * tell apart before it — a cantrip from the card it draws, a tutor from the
 * card it finds.
 */

import { describe, expect, it } from "vitest";

import { DEFAULT_WEIGHTS, evaluateState } from "../bot/evaluate.js";
import { handCardQuality, handQuality, QUALITY_MAX, QUALITY_MIN } from "../bot/hand-worth.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const registry = createDefaultRegistry();
const A = asPlayerId("alice");
const B = asPlayerId("bob");

function emptyHanded(): Game {
  const game = Game.create({
    seed: 3,
    registry,
    decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  game.state.zones.perPlayer[A].hand = [];
  return game;
}

/** The quality of `name`, were it added to alice's hand, with `lands` in play. */
function quality(game: Game, name: string, lands: number): number {
  return handCardQuality(game.state, registry, A, game.debugSpawn(name, A, "library"), lands, 7);
}

describe("a card's quality in hand", () => {
  it("prices card flow under the least each card it nets could be", () => {
    const game = emptyHanded();
    for (const cantrip of ["Opt", "Ponder", "Brainstorm", "Expressive Iteration", "Compulsive Research"]) {
      expect(quality(game, cantrip, 4), cantrip).toBe(0.4);
    }
    expect(quality(game, "Divination", 4)).toBe(0.8);
    expect(quality(game, "Harmonize", 4)).toBeCloseTo(1.2);
    // Two cards for the one its cost discards.
    expect(quality(game, "Thrill of Possibility", 4)).toBe(0.4);
    // Under any card a draw could be, a spare land included.
    expect(quality(game, "Forest", 7)).toBeGreaterThan(0.4);
  });

  it("leaves what it can't read at an average card", () => {
    const game = emptyHanded();
    // A target, an additional cost, a noncreature permanent, a creature with
    // an ability and a small body.
    for (const name of ["Swords to Plowshares", "Counterspell", "Deadly Dispute", "Sol Ring", "Rhystic Study", "Llanowar Elves"]) {
      expect(quality(game, name, 4), name).toBe(1);
    }
  });

  it("reads a creature off its body", () => {
    const game = emptyHanded();
    expect(quality(game, "Grizzly Bears", 6)).toBeCloseTo(0.9);
    expect(quality(game, "Craw Wurm", 6)).toBe(QUALITY_MAX);
    expect(quality(game, "Memnite", 6)).toBeCloseTo(0.7);
  });

  it("marks down a spell the lands can't reach, never below half", () => {
    const game = emptyHanded();
    // Six mana on three lands: two past the one-more a land drop gives.
    expect(quality(game, "Craw Wurm", 3)).toBeCloseTo(1.5 * 0.7);
    expect(quality(game, "Craw Wurm", 0)).toBeCloseTo(1.5 * 0.5);
    expect(quality(game, "Grizzly Bears", 0)).toBeCloseTo(0.9 * 0.85);
    expect(quality(game, "Memnite", 0)).toBeGreaterThanOrEqual(QUALITY_MIN);
  });

  it("reads reach off a split card's cheaper half", () => {
    const game = emptyHanded();
    // Expansion is {U/R}{U/R}; the whole card's mana value is 8.
    expect(quality(game, "Expansion // Explosion", 2)).toBe(1);
  });

  it("prices the first land as the next land drop, and a land past seven as spare", () => {
    const game = emptyHanded();
    expect(quality(game, "Forest", 3)).toBe(1.25);
    game.debugSpawn("Forest", A, "hand");
    expect(quality(game, "Forest", 3)).toBe(1);
    expect(quality(game, "Forest", 7)).toBe(QUALITY_MIN);
  });

  it("prices a tutor by the best card its filter finds", () => {
    const game = emptyHanded();
    game.debugSpawn("Forest", A, "hand");
    // Forests only: an average card to find, and the tutor 0.85 of it.
    expect(quality(game, "Demonic Tutor", 6)).toBeCloseTo(0.85);
    game.debugSpawn("Craw Wurm", A, "library");
    expect(quality(game, "Demonic Tutor", 6)).toBeCloseTo(0.85 * 1.5);
    // The Wurm is no land: Dig Up, uncleaved, still finds a Forest.
    expect(quality(game, "Dig Up", 6)).toBeCloseTo(0.85);
  });
});

describe("the handQuality feature", () => {
  it("is zero for a hand of average cards, and the sum of each card's distance from one", () => {
    const game = emptyHanded();
    for (let i = 0; i < 4; i += 1) game.debugSpawn("Forest", A, "battlefield");
    game.debugSpawn("Sol Ring", A, "hand");
    game.debugSpawn("Counterspell", A, "hand");
    expect(handQuality(game.state, registry, A, 4, 7)).toBe(0);
    game.debugSpawn("Opt", A, "hand");
    game.debugSpawn("Forest", A, "hand");
    game.debugSpawn("Forest", A, "hand");
    expect(handQuality(game.state, registry, A, 4, 7)).toBeCloseTo(-0.6 + 0.25);
  });

  it("scores a hand's cards for their owner only", () => {
    const game = emptyHanded();
    const before = evaluateState(game.state, registry, B, DEFAULT_WEIGHTS);
    game.debugSpawn("Opt", A, "hand");
    const opt = evaluateState(game.state, registry, B, DEFAULT_WEIGHTS);
    game.state.zones.perPlayer[A].hand = [];
    game.debugSpawn("Divination", A, "hand");
    const divination = evaluateState(game.state, registry, B, DEFAULT_WEIGHTS);
    expect(opt).toBeLessThan(before);
    expect(divination).toBe(opt);
  });
});
