// One game per message for `deck-winrates.mjs`: four (or `players`) of the
// starter decks, every seat the same bot, played the way a live room plays —
// Commander rules, mulligans on. Reports the winner's deck and the order the
// others were knocked out, so a deck's average finish can be read as well as
// its wins.

import { parentPort, workerData } from "node:worker_threads";
import { performance } from "node:perf_hooks";

import {
  COMMANDER_RULES,
  EvalBotController,
  Game,
  HeuristicBotController,
  SAMPLE_DECKS,
  asPlayerId,
  createDefaultRegistry,
} from "../dist/index.js";
import { DECK_POOL } from "./deck-pool.mjs";

const registry = createDefaultRegistry();
const SEATS = ["alice", "bob", "carol", "dave"].map(asPlayerId);
const { bot, budgetMs = 0 } = workerData;
const v2Options = budgetMs > 0 ? { timeBudgetMs: budgetMs } : {};

/**
 * Watches a seat's decisions for the card-usage report: which spells it could
 * legally have cast at some point this game, and which it did. Only the real
 * seat is wrapped, so a bot's rollouts aren't counted.
 */
function watchUsage(controller, usage) {
  const act = controller.act.bind(controller);
  controller.act = (view) => {
    // Keyed by the card, not the face offered: a double-faced or modal card
    // is offered as each face it can be cast as (Marang River Regent's Coil
    // and Catch), and cast as one of them.
    for (const legal of view.legalActions()) {
      if (legal.kind !== "cast-spell") continue;
      usage.castable.add(view.state.objects[legal.card]?.cardName ?? legal.cardName);
    }
    const action = act(view);
    if (action.type === "cast-spell") {
      const name = view.state.objects[action.card]?.cardName;
      if (name !== undefined) usage.cast.add(name);
    }
    return action;
  };
  return controller;
}

parentPort.on("message", ({ seed, decks: deckIndices }) => {
  const seats = SEATS.slice(0, deckIndices.length);
  const decks = deckIndices.map((i) => DECK_POOL[i]);
  const usages = seats.map(() => ({ castable: new Set(), cast: new Set() }));
  const controllers = Object.fromEntries(
    seats.map((seat, i) => [
      seat,
      watchUsage(
        bot === "v1" ? new HeuristicBotController(seat, registry) : new EvalBotController(seat, registry, v2Options),
        usages[i],
      ),
    ]),
  );
  const startedAt = performance.now();
  try {
    const game = Game.create({
      seed,
      registry,
      controllers,
      mulligans: true,
      rules: COMMANDER_RULES,
      decks: seats.map((player, i) => ({ player, cards: decks[i].cards, commanders: decks[i].commanders })),
    });
    game.advance();
    const winner = game.winner;
    const deckOf = (p) => decks[seats.indexOf(p)].name;
    parentPort.postMessage({
      seed,
      decks: decks.map((d) => d.name),
      winner: winner === null ? null : deckOf(winner),
      // First knocked out first.
      eliminated: game.eventsOfType("player-lost").map((e) => deckOf(e.player)),
      turns: game.state.turn.number,
      ms: Math.round(performance.now() - startedAt),
      usage: usages.map((u) => ({ castable: [...u.castable], cast: [...u.cast] })),
    });
  } catch (error) {
    parentPort.postMessage({ seed, decks: decks.map((d) => d.name), error: String(error?.message ?? error) });
  }
});
