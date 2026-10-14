/**
 * A loop of mandatory actions is a draw (rules 104.4b, 732.4): a test card
 * whose trigger sets itself off forever ("whenever a token you control
 * enters, create a 1/1 Soldier token") ends the game in a draw once the
 * resolutions with nobody acting repeat one cycle, rather than running the
 * engine into its tick budget. A loop that ends by itself, and one a player
 * keeps choosing to go round, aren't draws.
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const TEST_TOKEN_LOOP = defineCard({
  name: "Test Endless Muster",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever a token you control enters, create a 1/1 white Soldier creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: true } },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: "Whenever a token you control enters, create a 1/1 white Soldier creature token.",
    },
  ],
});

const makeGame = () => {
  const registry = createDefaultRegistry();
  registry.register(TEST_TOKEN_LOOP);
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    decks: [
      { player: A, cards: Array<string>(40).fill("Plains") },
      { player: B, cards: Array<string>(40).fill("Plains") },
    ],
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  return game;
};

/** Alice casts Raise the Alarm: two Soldier tokens enter. */
const startWithTokens = (game: Game): void => {
  for (let i = 0; i < 2; i += 1) game.debugSpawn("Plains", A, "battlefield");
  const card = game.debugSpawn("Raise the Alarm", A, "hand");
  game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
};

describe("a loop of mandatory actions (rule 104.4b)", () => {
  it("ends the game in a draw", () => {
    const game = makeGame();
    game.debugSpawn("Test Endless Muster", A, "battlefield");
    // A token entering starts it — each Soldier's entering makes the next —
    // and from then on everyone only passes.
    startWithTokens(game);
    game.advanceUntil((s) => s.result.over);
    // Ended where the loop is, not by someone losing turns later.
    expect(game.state.turn.number).toBe(1);
    expect(game.state.result).toMatchObject({ over: true, winner: null });
    expect(game.state.result.reason).toMatch(/104\.4b/);
  });

  it("isn't a draw while there's no loop: a token entering once", () => {
    const game = makeGame();
    startWithTokens(game);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(game.state.result.over).toBe(false);
  });
});
