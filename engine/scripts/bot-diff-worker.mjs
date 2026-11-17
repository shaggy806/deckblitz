// Games of `bot-diff.mjs`, one per seed it is sent (`worker-pool.mjs`): the
// builds are imported once. Each game: every seat on the working build, each
// decision also asked of the baseline's bot, disagreements posted back in
// words, then a final "done" (or "error").

import { parentPort, workerData } from "node:worker_threads";

import { importBuild } from "./baseline-build.mjs";
import { tableFor } from "./bot-seating.mjs";
import { findDeck } from "./tool-decks.mjs";

const { working, baseline, bot, players, decks: named } = workerData;
const W = await importBuild(working);
const B = await importBuild(baseline);
const regW = W.createDefaultRegistry();
const regB = B.createDefaultRegistry();
const make = (lib, registry, seat) =>
  bot === "v1" ? new lib.HeuristicBotController(seat, registry) : new lib.EvalBotController(seat, registry, {});

function play(seed) {
  let decisions = 0;
  let diffs = 0;
  const table = tableFor(seed, players);
  const seats = table.seats;
  // `--decks`: the named decks, a seat each, in place of the seed's seating.
  const decks = named === null || named === undefined ? table.decks : named.map(findDeck);
  const controllers = {};
  for (const seat of seats) {
    const current = make(W, regW, seat);
    const old = make(B, regB, seat);
    const act = current.act.bind(current);
    current.act = (view) => {
      const action = act(view);
      let theirs;
      try {
        // The baseline reads the working game's state through its own
        // module's caches, which that game's mutations never reach: without
        // this it answered from stale statics (a 7/7 read as 5/5), and a
        // build diffed against itself disagreed on attacks and blocks
        // (2026-11-14).
        B.invalidateComputedCache?.();
        // v1 counts an activation as it's handed to the engine (`act`), and
        // the baseline's never is: asked through `act`, it spent its four a
        // turn on proposals and stopped proposing. So it is asked what it
        // would do (`propose`), and told below what was played.
        theirs = bot === "v1" && typeof old.propose === "function" ? old.propose(view) : old.act(view);
        if (bot === "v1" && action.type === "activate-ability") {
          old.noteActivation?.(view.state.turn.number, action.source, action.abilityIndex);
        }
      } catch (error) {
        theirs = { type: `baseline threw: ${String(error?.message ?? error)}` };
      }
      decisions += 1;
      if (!W.sameMove(action, theirs)) {
        diffs += 1;
        const s = view.state;
        const awaiting = s.awaiting;
        parentPort.postMessage({
          type: "diff",
          row: {
            seed,
            turn: s.turn.number,
            step: s.turn.step,
            seat,
            life: s.players[seat].life,
            kind: awaiting?.kind ?? "priority",
            source: awaiting?.source !== undefined ? s.objects[awaiting.source]?.cardName : undefined,
            new: W.describeMove(s, action, regW),
            old: typeof theirs.type === "string" && theirs.type.startsWith("baseline threw")
              ? theirs.type
              : W.describeMove(s, theirs, regW),
          },
        });
      }
      return action;
    };
    controllers[seat] = current;
  }

  try {
    const game = W.Game.create({
      seed,
      registry: regW,
      controllers,
      mulligans: true,
      rules: W.COMMANDER_RULES,
      decks: seats.map((player, i) => ({ player, cards: decks[i].cards, commanders: decks[i].commanders })),
    });
    game.advance();
    parentPort.postMessage({ type: "done", seed, decisions, diffs, turn: game.state.turn.number });
  } catch (error) {
    parentPort.postMessage({ type: "error", seed, error: String(error?.message ?? error) });
  }
}

parentPort.on("message", play);
