/**
 * Deck biases (`deck-bias.ts`): a commander's deck reading some effects the
 * other way round. v2's half is pinned by the gate scenarios ("Teval mills
 * itself, not an opponent", "Teval stops milling itself near an empty
 * library", and The First Sliver's nine); this file pins v1's, the table,
 * the lookup, and what a deck's own named cards add to its score. A deck's
 * rule for its opening hands is in `mulligan-policy.test.ts`.
 */

import { describe, expect, it } from "vitest";

import { createDefaultRegistry } from "../cards.js";
import { HeuristicBotController } from "../controller.js";
import { DEFAULT_WEIGHTS, outcomeOf, scoreOutcome } from "../bot/evaluate.js";
import { COMMANDER_BIASES, deckBias, ownCardWorth } from "../deck-bias.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { PlayerId } from "../primitives.js";
import { abilityPolarities } from "../target-polarity.js";

const registry = createDefaultRegistry();
const A = asPlayerId("alice");
const B = asPlayerId("bob");

const forests = (player: PlayerId) => ({ player, cards: Array<string>(40).fill("Forest") });

/** Alice's main phase with `commanders` in her command zone and a Hedron
 * Crab out, after she plays a Forest: the landfall trigger asking whom to
 * mill. */
function crabTrigger(commanders: readonly string[]): Game {
  const game = Game.create({
    seed: 3,
    registry,
    decks: [{ ...forests(A), commanders }, forests(B)],
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  game.debugSpawn("Hedron Crab", A, "battlefield", { summoningSick: false });
  const forest = game.debugSpawn("Forest", A, "hand");
  game.dispatch({ type: "play-land", player: A, card: forest });
  game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || s.result.over);
  expect(game.state.awaiting?.kind).toBe("choose-targets");
  return game;
}

function millTarget(game: Game): PlayerId | undefined {
  const action = new HeuristicBotController(A, registry).act(game.controllerView(A));
  const target = action.type === "choose-targets" ? action.targets[0] : undefined;
  return target?.kind === "player" ? target.player : undefined;
}

describe("deck biases", () => {
  it("v1 mills an opponent by default, and itself under Teval", () => {
    expect(millTarget(crabTrigger([]))).toBe(B);
    expect(millTarget(crabTrigger(["Felothar the Steadfast"]))).toBe(B);
    expect(millTarget(crabTrigger(["Teval, the Balanced Scale"]))).toBe(A);
  });

  it("reads a seat's commanders, and only its own", () => {
    const game = crabTrigger(["Teval, the Balanced Scale"]);
    expect(deckBias(game.state, A)).toBe(COMMANDER_BIASES["Teval, the Balanced Scale"]);
    expect(deckBias(game.state, B)).toBeNull();
  });

  it("flips only the kinds a bias names, and leaves the shared memo alone", () => {
    const crab = registry.get("Hedron Crab").triggered[0];
    const bolt = registry.get("Lightning Bolt");
    const bias = COMMANDER_BIASES["Teval, the Balanced Scale"].polarity;
    expect(abilityPolarities(crab)).toEqual(["harm"]);
    expect(abilityPolarities(crab, bias)).toEqual(["help"]);
    expect(abilityPolarities(crab)).toEqual(["harm"]);
    expect(abilityPolarities({ targets: bolt.targets, effect: bolt.effect }, bias)).toEqual(["harm"]);
  });

  it("is keyed by real cards that can be commanders", () => {
    for (const [name, bias] of Object.entries(COMMANDER_BIASES)) {
      expect(registry.has(name), name).toBe(true);
      const def = registry.get(name);
      expect((def.supertypes ?? []).includes("legendary") && def.types.includes("creature"), name).toBe(true);
      expect(bias.why.length, name).toBeGreaterThan(0);
      // A card it prices is a real one: a misspelt name would price nothing.
      for (const card of Object.keys(bias.cardWorth ?? {})) expect(registry.has(card), `${name}: ${card}`).toBe(true);
    }
  });
});

describe("a deck's own cards, priced by zone", () => {
  /** Alice's main phase, her deck led by The First Sliver. */
  function sliverGame(): Game {
    const game = Game.create({
      seed: 3,
      registry,
      decks: [{ ...forests(A), commanders: ["The First Sliver"] }, forests(B)],
    });
    game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
    return game;
  }
  const vortex = COMMANDER_BIASES["The First Sliver"].cardWorth?.["Monstrous Vortex"] ?? {};

  it("counts each zone's worth, for the cards the deck owns", () => {
    const game = sliverGame();
    expect(ownCardWorth(game.state, A)).toBe(0);
    game.debugSpawn("Monstrous Vortex", A, "library");
    expect(ownCardWorth(game.state, A)).toBe(vortex.library);
    game.debugSpawn("Monstrous Vortex", A, "graveyard");
    game.debugSpawn("Monstrous Vortex", A, "hand");
    const out = game.debugSpawn("Monstrous Vortex", A, "battlefield");
    const all = (vortex.library ?? 0) + (vortex.graveyard ?? 0) + (vortex.hand ?? 0) + (vortex.battlefield ?? 0);
    expect(ownCardWorth(game.state, A)).toBe(all);
    // A card with no entry, and one in exile, are worth nothing more.
    game.debugSpawn("Baneslayer Angel", A, "battlefield");
    game.debugSpawn("Monstrous Vortex", A, "exile");
    expect(ownCardWorth(game.state, A)).toBe(all);
    // Bob's own Vortex is nothing to Alice's deck, and hers nothing to his.
    game.debugSpawn("Monstrous Vortex", B, "battlefield");
    expect(ownCardWorth(game.state, A)).toBe(all);
    expect(ownCardWorth(game.state, B)).toBe(0);
    // Hers under Bob's control is not on her battlefield.
    game.state.objects[out].controller = B;
    expect(ownCardWorth(game.state, A)).toBe(all - (vortex.battlefield ?? 0));
  });

  it("is added to the deck's own score, and nobody else's", () => {
    const game = sliverGame();
    game.debugSpawn("Monstrous Vortex", A, "library");
    const landCap = DEFAULT_WEIGHTS.landCap;
    const mine = outcomeOf(game.state, registry, A, landCap);
    const theirs = outcomeOf(game.state, registry, B, landCap);
    expect(mine.ownCards).toBe(vortex.library);
    expect(theirs.ownCards).toBeUndefined();
    expect(scoreOutcome(mine, DEFAULT_WEIGHTS)).toBe(
      scoreOutcome({ ...mine, ownCards: 0 }, DEFAULT_WEIGHTS) + (vortex.library ?? 0),
    );
  });
});
