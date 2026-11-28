import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { EvalBotController } from "../bot/eval-bot.js";
import { readAsOf, roundOf } from "../bot/features.js";
import type { Game } from "../game.js";
import { A, B, C, spawn, table, toHand } from "./harness.js";

/**
 * `EvalBotOptions.rolloutSwingBack` (`EvalBotController.swingBack`,
 * `docs/plans/bot-next-steps.md` 1c): our own turn's moves scored with the
 * opponents' attacks at the board each leaves.
 */
const swingBot = (game: Game) => new EvalBotController(A, game.registry, { rolloutSwingBack: true });

/** The swing backs the bot's last decision played, by what each changed. */
const swingsOf = (bot: EvalBotController): number[] => [
  ...(bot as unknown as { swingBacks: Map<string, number> }).swingBacks.values(),
];

const castOf = (game: Game, action: Action): string | null =>
  action.type === "cast-spell" ? (game.state.objects[action.card]?.cardName ?? null) : null;

/** The bot's move on `game`, once the turn's land (the card alice drew) is
 * down: the land is played on the board, so every bot asked after decides
 * the same window. */
function moveOf(bot: EvalBotController, game: Game): Action {
  for (;;) {
    const action = bot.act(game.controllerView(A));
    if (action.type !== "play-land") return action;
    game.dispatch(action);
  }
}

describe("the swing back in our own turn's rollouts", () => {
  it("still casts when even passing dies in it", () => {
    // Four Shivan Dragons over a seat at 20 with nothing that blocks a
    // flyer: dead in the swing back whatever it does. As first built the
    // rollouts ran on to our next turn, "a move we don't live through never
    // beats passing" dropped every cast, and the bot passed (Ureni of the
    // Unwritten and Scion of Calamity left in hand, a kept game's turns 27
    // and 32). Where the pass dies, no swing back is added to anything.
    const { game } = table({ openingHandSize: 0 });
    for (let i = 0; i < 6; i += 1) spawn(game, "Forest");
    for (let i = 0; i < 4; i += 1) spawn(game, "Shivan Dragon", B);
    toHand(game, "Craw Wurm");
    const plain = moveOf(new EvalBotController(A, game.registry), game);
    expect(castOf(game, plain)).toBe("Craw Wurm");
    const bot = swingBot(game);
    expect(castOf(game, moveOf(bot, game))).toBe("Craw Wurm");
    // The pass's was played and read as lost, and it was the only one.
    expect(swingsOf(bot)).toEqual([-1e4]);
  });

  it("plays the attack at the board each move leaves", () => {
    // Grizzly Bears swings into an empty board and stays home from a Giant
    // Spider: passing costs the two life, the Spider doesn't.
    const { game } = table({ openingHandSize: 0 });
    for (let i = 0; i < 4; i += 1) spawn(game, "Forest");
    spawn(game, "Grizzly Bears", B);
    toHand(game, "Giant Spider");
    const bot = swingBot(game);
    expect(castOf(game, moveOf(bot, game))).toBe("Giant Spider");
    const swings = swingsOf(bot);
    expect(swings.length).toBe(2);
    expect(Math.max(...swings) - Math.min(...swings)).toBeGreaterThan(0.05);
  });

  it("at a table of four, plays only the attacks of those who have been attacking us", () => {
    // v1 sends every attacker at the lowest life total, ties to the first
    // seat: taken as fact, that had the bot steer the table with its
    // removal. Whoever attacked us within the last round attacks us again;
    // the rest hold, and the evaluation's split estimate stands for them.
    const board = (): Game => {
      const { game } = table({ players: 4, openingHandSize: 0 });
      game.state.turn.number = 9;
      for (let i = 0; i < 4; i += 1) spawn(game, "Forest");
      spawn(game, "Grizzly Bears", B);
      spawn(game, "Grizzly Bears", C);
      toHand(game, "Giant Spider");
      return game;
    };
    const quiet = board();
    const unaimed = swingBot(quiet);
    moveOf(unaimed, quiet);
    expect(swingsOf(unaimed)).toEqual([]);

    const attacked = board();
    attacked.state.players[A].lastAttackedBy = { [C]: attacked.state.turn.number - 2 };
    const aimed = swingBot(attacked);
    expect(castOf(attacked, moveOf(aimed, attacked))).toBe("Giant Spider");
    expect(swingsOf(aimed).length).toBe(2);
  });

  it("reads a later board in the round of the one it came from", () => {
    const { game } = table({ players: 4, openingHandSize: 0 });
    const earlier = { ...game.state, turn: { ...game.state.turn, number: 6 } };
    const later = { ...game.state, turn: { ...game.state.turn, number: 9 } };
    expect(roundOf(earlier)).toBe(2);
    expect(roundOf(later)).toBe(3);
    expect(readAsOf(earlier, () => roundOf(later))).toBe(2);
    expect(roundOf(later)).toBe(3);
  });
});
