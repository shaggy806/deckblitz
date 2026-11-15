import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/eval-bot.js";
import type { GameState } from "../state.js";
import { A, B, cast, spawn, table, toHand } from "./harness.js";

/**
 * The outs guard (`EvalBotController.crackbackGuard`'s second kind, step 5 of
 * `docs/plans/bot-next-steps.md`): dead on the board whatever blocks, with an
 * instant in hand that saves it, the bot must not spend that instant's mana.
 * The board is the gate scenario's ("holds the mana for Aetherize when the
 * board has it dead without it"): 10 life, ten lands, three Grizzly Bears,
 * against ten Craw Wurms.
 */
function board() {
  const { game } = table({ life: 10 });
  for (let i = 0; i < 5; i += 1) spawn(game, "Island");
  for (let i = 0; i < 5; i += 1) spawn(game, "Plains");
  for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears");
  for (let i = 0; i < 10; i += 1) spawn(game, "Craw Wurm", B);
  const aetherize = toHand(game, "Aetherize");
  const creatures = ["Tide Skimmer", "Skycat Sovereign", "Hanged Executioner"].map((name) => toHand(game, name));
  return { game, aetherize, creatures };
}

/** The guard a priority decision on `state` would be made under. */
const guardOn = (bot: EvalBotController, state: GameState): unknown =>
  (bot as unknown as { crackbackGuard(s: GameState): unknown }).crackbackGuard(state);

describe("the outs guard", () => {
  it("is set when an instant in hand is what lives through the swing back", () => {
    const { game } = board();
    const bot = new EvalBotController(A, game.registry);
    expect(guardOn(bot, game.state)).toEqual({ grown: false, outs: true });
  });

  it("is not set without the instant: dead either way, nothing to hold for", () => {
    const { game, aetherize } = board();
    // The same board with the Aetherize already cast at nothing.
    cast(game, aetherize);
    const bot = new EvalBotController(A, game.registry);
    expect(guardOn(bot, game.state)).toBeNull();
  });

  it("reads each decision's board afresh: the game's state is one object, changed in place", () => {
    // The guard remembered a swing back by the state it started from, and
    // the live game's state is the same object all game: an answer from an
    // earlier turn was read back three turns later, and the bot held its
    // mana for an out it no longer had (a replayed game, 2026-11-15).
    const { game, creatures } = board();
    const bot = new EvalBotController(A, game.registry);
    const state = game.state;
    expect(guardOn(bot, state)).toEqual({ grown: false, outs: true });
    // Tapped out by hand: nine of the ten lands, one left for a four-mana out.
    for (const card of creatures) cast(game, card);
    expect(game.state).toBe(state);
    expect(guardOn(bot, game.state)).toBeNull();
  });
});
