import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { EvalBotController } from "../bot/eval-bot.js";
import { boardKey } from "../bot/turn-plan.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, lands, table, toGraveyard, toHand, toLibrary } from "./harness.js";

/**
 * A turn plan is made on a state whose unseen cards are dealt afresh
 * (`withHiddenCards`), so a line that milled or drew may name a card the
 * real game put somewhere else. Found by `bot:ab`, 2026-11-17 (seed 18, a
 * seat on the build that first hid the libraries' order): a planned Treasure
 * Cruise delved away a Putrefy the plan's own mill had put in the graveyard,
 * and the real mill hadn't — "Putrefy can't be exiled for Treasure Cruise:
 * it's not in alice's graveyard", thrown at the table.
 */
describe("the next step of a turn plan, replayed", () => {
  /** Alice with Treasure Cruise in hand, an Island, and seven cards to delve. */
  const position = (): { game: Game; cruise: ObjectId; fodder: ObjectId[] } => {
    const { game } = table({ openingHandSize: 0 });
    for (const card of [...game.state.zones.perPlayer[A].hand]) game.dispatch({ type: "play-land", player: A, card });
    lands(game, "Island", 1);
    const fodder = Array.from({ length: 7 }, () => toGraveyard(game, "Opt"));
    return { game, cruise: toHand(game, "Treasure Cruise"), fodder };
  };
  /** A v2 seat holding `step` as the rest of its plan for this board. */
  const planning = (game: Game, step: Action): EvalBotController => {
    const bot = new EvalBotController(A, game.registry, { maxSimulations: 8 });
    (bot as unknown as { turnPlan: unknown }).turnPlan = {
      turn: game.state.turn.number,
      steps: [step],
      boards: [boardKey(game.state, A)],
    };
    return bot;
  };

  it("is played when the cards it names are where the plan had them", () => {
    const { game, cruise, fodder } = position();
    const step: Action = { type: "cast-spell", player: A, card: cruise, delve: fodder, targets: [] };
    const bot = planning(game, step);
    expect(bot.act(game.controllerView(A))).toEqual(step);
    expect(bot.lastDecision?.via).toBe("turn plan replay");
  });

  it("is dropped when it names a card that is somewhere else, and the window searched", () => {
    const { game, cruise, fodder } = position();
    // The plan's line milled this card and then delved it; the game didn't.
    const elsewhere = toLibrary(game, "Putrefy");
    const step: Action = { type: "cast-spell", player: A, card: cruise, delve: [...fodder.slice(0, 6), elsewhere], targets: [] };
    const bot = planning(game, step);
    const action = bot.act(game.controllerView(A));
    expect(action).not.toEqual(step);
    expect(bot.lastDecision?.via).not.toBe("turn plan replay");
    expect(() => game.dispatch(action)).not.toThrow();
  });
});
