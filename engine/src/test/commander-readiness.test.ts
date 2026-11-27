/**
 * `land-colors.ts`'s `commanderReadiness`, the evaluation's `commanderReady`:
 * how near our commander is to being cast next turn, by its mana value
 * (kept game HK3Z2-1, 2026-11-27: The First Sliver a round late for want of
 * its colours).
 */

import { describe, expect, it } from "vitest";

import { createDefaultRegistry } from "../cards.js";
import { AutomaticController } from "../controller.js";
import { Game } from "../game.js";
import { commanderReadiness } from "../land-colors.js";
import { asPlayerId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const registry = createDefaultRegistry();

/** Alice's main phase, The First Sliver (WUBRG) waiting in her command zone,
 * `lands` on her battlefield and `hand` in her hand. */
function board(lands: readonly string[], hand: readonly string[]): Game {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    startingPlayer: A,
    rules: { skipFirstDraw: false, maxHandSize: 99, maxLandsPerTurn: 0 },
    controllers: { [A]: new AutomaticController(A), [B]: new AutomaticController(B) },
    decks: [
      { player: A, cards: Array(40).fill("Mountain") },
      { player: B, cards: Array(40).fill("Island") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main");
  game.state.players[A].commanderIdentity = ["W", "U", "B", "R", "G"];
  game.state.zones.perPlayer[A].hand = [];
  const sliver = game.debugSpawn("The First Sliver", A, "command");
  game.state.objects[sliver].isCommander = true;
  for (const land of lands) game.debugSpawn(land, A, "battlefield");
  for (const card of hand) game.debugSpawn(card, A, "hand");
  return game;
}

describe("commanderReadiness", () => {
  it("is the commander's mana value when lands and one land drop pay every colour", () => {
    const game = board(["Plains", "Island", "Swamp", "Mountain"], ["Forest"]);
    expect(commanderReadiness(game.state, registry, A)).toBe(5);
  });

  it("is a quarter of the share paid, by its mana value, when a colour is missing", () => {
    // Four sources, four colours, no green in hand: 4 of 5 symbols.
    const game = board(["Plains", "Island", "Swamp", "Mountain"], []);
    expect(commanderReadiness(game.state, registry, A)).toBeCloseTo(0.25 * (4 / 5) * 5);
  });

  it("counts a fetch land in hand by what it can find, and not a land that enters tapped", () => {
    const fetch = board(["Plains", "Island", "Swamp", "Mountain"], ["Windswept Heath"]);
    fetch.debugSpawn("Forest", A, "library");
    expect(commanderReadiness(fetch.state, registry, A)).toBe(5);
    // Turbulent Moor makes no mana the turn it's played.
    const tapped = board(["Plains", "Island", "Mountain", "Forest"], ["Turbulent Moor"]);
    expect(commanderReadiness(tapped.state, registry, A)).toBeLessThan(5);
  });

  it("counts a commander already cast in full, so casting it gives nothing up", () => {
    const game = board([], []);
    const sliver = game.state.zones.shared.command.find((id) => game.state.objects[id]?.cardName === "The First Sliver");
    game.state.zones.shared.command = game.state.zones.shared.command.filter((id) => id !== sliver);
    game.state.zones.shared.battlefield.push(sliver!);
    game.state.objects[sliver!].zone = "battlefield";
    game.state.objects[sliver!].controller = A;
    expect(commanderReadiness(game.state, registry, A)).toBe(5);
  });
});
