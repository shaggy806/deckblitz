/**
 * An optional payment on v2's own turn that v1 declines "to keep a spell
 * castable" (`payingCostsASpell`). v2's rollouts pass its own seat, so they
 * never see that spell and price the payment as free; v2 used to keep v1's
 * answer outright for that reason. But v1 declines whenever a spell is lost,
 * whatever declining costs, so v2 kept "let the 4/4 go to its echo and cast
 * the Grizzly Bears" too. It searches now, and v1's answer stands unless
 * paying beats it by `KEPT_PER_MANA` for each mana of the spells it was
 * declined for (`EvalBotController.decide`).
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { EvalBotController } from "../bot/eval-bot.js";
import { createDefaultRegistry } from "../cards.js";
import { HeuristicBotController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const registry = createDefaultRegistry();

/** Alice's first main phase, both hands empty, `setup`'s board in place. */
function mainPhase(setup: (game: Game) => void): Game {
  const game = Game.create({
    seed: 3,
    registry,
    decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  for (const player of [A, B]) game.state.zones.perPlayer[player].hand = [];
  setup(game);
  return game;
}

const onBoard = (game: Game, name: string, player = A): ObjectId =>
  game.debugSpawn(name, player, "battlefield", { summoningSick: false });

const forests = (game: Game, count: number): void => {
  for (let i = 0; i < count; i += 1) onBoard(game, "Forest");
};

/** Alice's next turn, asked a "you may pay" of her own. */
const asked = (game: Game): Game => {
  const turn = game.state.turn.number;
  game.advanceUntil(
    (s) =>
      (s.turn.number > turn &&
        s.turnOrder[s.turn.activePlayerIndex] === A &&
        s.awaiting?.kind === "choose-modes" &&
        s.awaiting.player === A) ||
      s.result.over ||
      s.turn.number > turn + 3,
  );
  expect(game.state.awaiting?.kind).toBe("choose-modes");
  return game;
};

/** Alice's draw step, asked whether to pay Bob's Smothering Tithe its {2},
 * with `lands` untapped Forests and a Rumbling Baloth ({2}{G}{G}) in hand. */
function titheAsked(lands: number): Game {
  const game = asked(
    mainPhase((g) => {
      forests(g, lands);
      onBoard(g, "Smothering Tithe", B);
    }),
  );
  expect(game.state.turn.step).toBe("draw");
  game.state.zones.perPlayer[A].hand = [];
  game.debugSpawn("Rumbling Baloth", A, "hand");
  return game;
}

/** Alice's upkeep, asked to pay Summoner's Pact its {2}{G}{G} or lose, with
 * `lands` untapped Forests and a Rumbling Baloth in hand. */
function pactAsked(lands: number): Game {
  const game = mainPhase((g) => {
    forests(g, lands);
    const pact = g.debugSpawn("Summoner's Pact", A, "hand");
    g.dispatch({ type: "cast-spell", player: A, card: pact, targets: [] });
  });
  asked(game);
  expect(game.state.turn.step).toBe("upkeep");
  game.state.zones.perPlayer[A].hand = [];
  game.debugSpawn("Rumbling Baloth", A, "hand");
  return game;
}

/** Alice's upkeep, asked to pay Cradle Guard's echo ({1}{G}{G}, a 4/4
 * trampler) or sacrifice it, with three Forests and a Grizzly Bears in hand:
 * paying leaves nothing for the Bears. */
function echoAsked(): Game {
  const game = asked(
    mainPhase((g) => {
      forests(g, 3);
      onBoard(g, "Cradle Guard");
    }),
  );
  expect(game.state.turn.step).toBe("upkeep");
  game.state.zones.perPlayer[A].hand = [];
  game.debugSpawn("Grizzly Bears", A, "hand");
  return game;
}

const modes = (action: Action): readonly number[] => (action.type === "choose-modes" ? action.modes : [-1]);
const v1 = (game: Game): Action => new HeuristicBotController(A, registry).act(game.controllerView(A));

describe("v2 keeps v1's declined payment unless declining costs more than the spell's delay", () => {
  it("declines Smothering Tithe's {2} when the mana is the turn's spell", () => {
    const bot = new EvalBotController(A, registry);
    expect(modes(bot.act(titheAsked(4).controllerView(A)))).toEqual([]);
    // Searched, and v1's answer kept: paying scored better, by less than
    // the margin (a Treasure denied).
    expect(bot.lastDecision).toMatchObject({ kind: "decision", via: "search", simulations: 2 });
  });

  it("pays it with mana to spare", () => {
    const bot = new EvalBotController(A, registry);
    expect(modes(bot.act(titheAsked(6).controllerView(A)))).toEqual([0]);
  });

  it("pays echo on a 4/4 rather than sacrifice it to cast a 2/2", () => {
    // v1's answer is to decline, the Bears being lost to the payment (a
    // sacrifice is one card to its worth, whatever is sacrificed), and v2
    // kept it unsearched.
    const game = echoAsked();
    expect(modes(v1(game))).toEqual([]);
    expect(modes(new EvalBotController(A, registry).act(game.controllerView(A)))).toEqual([0]);
  });

  it("pays a pact's upkeep cost though it costs the turn's spell", () => {
    // Four Forests: paying {2}{G}{G} leaves nothing for the Baloth. v1 pays
    // (its look ahead stops at the lost game), and so does the search.
    const game = pactAsked(4);
    expect(modes(v1(game))).toEqual([0]);
    const answer = new EvalBotController(A, registry).act(game.controllerView(A));
    expect(modes(answer)).toEqual([0]);
    game.dispatch(answer);
    game.advanceUntil((s) => s.turn.step === "draw" || s.result.over);
    expect(game.state.players[A].hasLost).toBe(false);
  });
});
