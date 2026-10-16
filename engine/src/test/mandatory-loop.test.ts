/**
 * A loop of mandatory actions is a draw (rules 104.4b, 732.4): a test card
 * whose trigger sets itself off forever ("whenever a token you control
 * enters, create a 1/1 Soldier token") ends the game in a draw once the
 * resolutions with nobody acting repeat one cycle, rather than running the
 * engine into its tick budget. A loop that ends by itself isn't a draw. A loop
 * that goes round on a player's "you may" isn't one either (104.4b): once its
 * cycle has repeated, that player must choose differently (732.3), and their
 * next "you may" is a no. One whose choices can't stop it — a target chosen
 * each round — is a draw after that.
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
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

const TEST_MAY_LOOP = defineCard({
  name: "Test Optional Muster",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever a token you control enters, you may create a 1/1 white Soldier creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: true } },
      targets: [],
      effect: { kind: "may", prompt: "Create a Soldier?", effect: { kind: "create-token", token: "Soldier Token", count: 1 } },
      resolve: null,
      text: "Whenever a token you control enters, you may create a 1/1 white Soldier creature token.",
    },
  ],
});

const TEST_TARGET_LOOP = defineCard({
  name: "Test Restless Muster",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Whenever a token you control enters, create a 1/1 white Soldier creature token and untap target permanent.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: true } },
      targets: ["permanent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Soldier Token", count: 1 },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: "Whenever a token you control enters, create a 1/1 white Soldier creature token and untap target permanent.",
    },
  ],
});

const makeGame = (seats?: { readonly a: ScriptedController; readonly b: ScriptedController }) => {
  const registry = createDefaultRegistry();
  registry.register(TEST_TOKEN_LOOP);
  registry.register(TEST_MAY_LOOP);
  registry.register(TEST_TARGET_LOOP);
  const game = Game.create({
    ...(seats !== undefined ? { controllers: { [A]: seats.a, [B]: seats.b } } : {}),
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

  it("a loop on a player's 'you may' isn't a draw: they must stop it, and do", () => {
    const seats = { a: new ScriptedController(A), b: new ScriptedController(B) };
    seats.a.chooseModesFn = () => [0]; // always "yes"
    const game = makeGame(seats);
    game.debugSpawn("Test Optional Muster", A, "battlefield");
    startWithTokens(game);
    game.advanceUntil((s) => s.result.over || (s.zones.shared.stack.length === 0 && s.awaiting === null));
    expect(game.state.result.over).toBe(false);
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });

  it("a loop whose choices can't stop it — a target each round — is a draw", () => {
    const seats = { a: new ScriptedController(A), b: new ScriptedController(B) };
    const game = makeGame(seats);
    game.debugSpawn("Test Restless Muster", A, "battlefield");
    startWithTokens(game);
    game.advanceUntil((s) => s.result.over);
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
