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

// MTG_CACHE_CHECK=1 turns every computed-cache hit into a recompute +
// deep-compare that throws on divergence — the empirical verification that
// every mutation inside a cache region invalidates (see characteristics.ts).
if (process.env.MTG_CACHE_CHECK) setComputedCacheCheck(true);
// MTG_FREEZE_SNAPSHOTS=1 freezes the snapshots a copy of the state shares
// (`cloneGameState`), so a write into one throws.
if (process.env.MTG_FREEZE_SNAPSHOTS) setFreezeSharedSnapshots(true);
// MTG_ORDER_TRIGGERS=1 has every seat order its own simultaneous triggers, so
// the `order-triggers` decision is fuzzed too (off, the engine orders them and
// nobody is asked). Changes every seed's trajectory, so it's opt-in.
const orderTriggers = Boolean(process.env.MTG_ORDER_TRIGGERS);

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
parentPort.on("message", ({ seed, seats }) => {
  const startedAt = Date.now();
  try {
    const rng = createRng(seed * 7919);
    const pick = () => rng.next();
    const game = Game.create({
      seed,
      mulligans: true,
      controllers: Object.fromEntries(
        seats.map(({ player }) => [player, new RandomController(player, pick)]),
      ),
      decks: seats,
    });
    if (orderTriggers) for (const { player } of seats) game.setOrdersOwnTriggers(player, true);
    // A heartbeat every second: what the game looks like, so a game the
    // parent kills for its time is reported with where it was (a turn, a
    // stack, a battlefield filling up) rather than replayed at a longer limit
    // to find out — batch 174 waited ten minutes on one that way. It only
    // reads the state, so the seed plays exactly as before.
    let beatAt = startedAt;
    game.advanceUntil((state) => {
      const now = Date.now();
      if (now - beatAt >= 1000) {
        beatAt = now;
        parentPort.postMessage({ seed, heartbeat: snapshot(state, game.events.length) });
      }
      return false;
    });
    parentPort.postMessage({
      seed,
      ok: true,
      winner: game.winner ?? "draw",
      reason: game.state.result.reason,
      turns: game.state.turn.number,
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
