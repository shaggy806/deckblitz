// Worker half of `random-demo.mjs`: plays one random game per request and
// posts back a summary.
//
// It lives in a worker thread for one reason — so the parent can *kill* a game
// that never finishes. A runaway loop inside a single `tick()` is synchronous
// and never yields, so no timer in the same thread can interrupt it, and
// `Game.advance`'s tick budget can't either (it only counts ticks that
// return). `Worker.terminate()` stops the thread wherever it is.

import { parentPort } from "node:worker_threads";

import { Game, RandomController, createRng, setComputedCacheCheck, setFreezeSharedSnapshots } from "../dist/index.js";

import { playWithReplicas } from "./replica-check.mjs";

// MTG_CACHE_CHECK=1 turns every computed-cache hit into a recompute +
// deep-compare that throws on divergence — the empirical verification that
// every mutation inside a cache region invalidates (see characteristics.ts).
if (process.env.MTG_CACHE_CHECK) setComputedCacheCheck(true);
// MTG_FREEZE_SNAPSHOTS=1 freezes the snapshots a copy of the state shares
// (`cloneGameState`), so a write into one throws. The freeze happens only as
// something copies the state, and random players never do — so with the
// switch on, the loop below copies it every few ticks itself (until the
// 2026-11-18 review the switch froze nothing here).
const freezeSnapshots = Boolean(process.env.MTG_FREEZE_SNAPSHOTS);
if (freezeSnapshots) setFreezeSharedSnapshots(true);
// MTG_ORDER_TRIGGERS=1 has every seat order its own simultaneous triggers, so
// the `order-triggers` decision is fuzzed too (off, the engine orders them and
// nobody is asked). Changes every seed's trajectory, so it's opt-in.
const orderTriggers = Boolean(process.env.MTG_ORDER_TRIGGERS);
// MTG_REPLICA=1 plays every game the way a room plays one (no controllers in
// the game: on to the next decision, the seat that owes it asked) and keeps
// two copies of it that are given only its actions — one built from the seed,
// one restored from the state as it is sent to another device — failing the
// seed if either stops matching it (`replica-check.mjs`): what rooms copied
// onto every player's device rest on (`docs/plans/replicated-rooms.md`).
// A room's game has no `priority-received` where the controller loop hands
// priority to a waiting decision's player, so a seed's events (and the
// random picks after them) aren't the default mode's: it's opt-in, and about
// three times slower.
const replicas = Boolean(process.env.MTG_REPLICA);

/** A short picture of a game in progress: its turn and step, the stack, and
 * the battlefield's size with the names most repeated on it (a token stack
 * counts every token in it). */
function snapshot(state, events) {
  const counts = new Map();
  let permanents = 0;
  for (const id of state.zones.shared.battlefield) {
    const o = state.objects[id];
    if (o === undefined) continue;
    const n = o.stackCount ?? 1;
    const name = o.copyOf ?? o.cardName;
    permanents += n;
    counts.set(name, (counts.get(name) ?? 0) + n);
  }
  const stack = state.zones.shared.stack.length;
  const most = [...counts]
    .sort((x, y) => y[1] - x[1])
    .slice(0, 3)
    .map(([name, n]) => `${n}x ${name}`)
    .join(", ");
  return `turn ${state.turn.number} (${state.turn.step}), ${stack} on the stack, ${permanents} permanents (most: ${most}), ${events} events`;
}

// Each game's decks come with its seed: they're built per seed (fuzz-decks.mjs).
parentPort.on("message", ({ seed, seats, maxTurns = null }) => {
  const startedAt = Date.now();
  try {
    const rng = createRng(seed * 7919);
    const pick = () => rng.next();
    const ordered = (g) => {
      if (orderTriggers) for (const { player } of seats) g.setOrdersOwnTriggers(player, true);
      return g;
    };
    const controllers = Object.fromEntries(seats.map(({ player }) => [player, new RandomController(player, pick)]));
    // A heartbeat every second: what the game looks like, so a game the
    // parent kills for its time is reported with where it was (a turn, a
    // stack, a battlefield filling up) rather than replayed at a longer limit
    // to find out — batch 174 waited ten minutes on one that way. It only
    // reads the state, so the seed plays exactly as before.
    let beatAt = startedAt;
    const beat = (state, events) => {
      const now = Date.now();
      if (now - beatAt < 1000) return;
      beatAt = now;
      parentPort.postMessage({ seed, heartbeat: snapshot(state, events) });
    };
    // `--max-turns`: stop as the turn after the cap begins.
    const pastCap = (state) => maxTurns !== null && state.turn.number > maxTurns;
    let game;
    let copied;
    if (replicas) {
      // Played as a room plays it, two copies beside it.
      ({ game, copied } = playWithReplicas({
        create: () => ordered(Game.create({ seed, mulligans: true, decks: seats })),
        controllers,
        stopAt: pastCap,
        onDecision: (g) => beat(g.state, g.events.length),
      }));
    } else {
      game = ordered(Game.create({ seed, mulligans: true, controllers, decks: seats }));
      let ticks = 0;
      game.advanceUntil((state) => {
        // A copy shares, and so freezes, the live game's snapshots; it draws
        // nothing from the game's stream, so the seed plays as before.
        if (freezeSnapshots && (ticks += 1) % 25 === 0) game.snapshot();
        beat(state, game.events.length);
        return pastCap(state);
      });
    }
    const capped = !game.state.result.over;
    parentPort.postMessage({
      seed,
      ok: true,
      ...(copied !== undefined ? { copied } : {}),
      winner: capped ? "draw" : (game.winner ?? "draw"),
      reason: capped ? `turn cap (${maxTurns})` : game.state.result.reason,
      capped,
      turns: capped ? maxTurns : game.state.turn.number,
      events: game.events.length,
      ms: Date.now() - startedAt,
    });
  } catch (error) {
    parentPort.postMessage({
      seed,
      ok: false,
      error: error instanceof Error ? (error.stack ?? error.message) : String(error),
      ms: Date.now() - startedAt,
    });
  }
});
