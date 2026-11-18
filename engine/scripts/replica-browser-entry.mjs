// The browser half of `replica-browsers.mjs`: the engine as a page runs it
// (`engine/local`, the pool from its 32 shards), given games recorded in Node
// — each a seed, its decks and every action taken — and replaying them the
// way a room feeds a game, comparing the state's digest with Node's at every
// checkpoint. Bundled by the Node half; nothing here is Node's.

import { CARD_SHARD_COUNT, Game, isSettled, loadCardShard, registryFrom, stateDigest } from "../dist/local.js";

/** One recorded game replayed: where it first disagreed with the recording,
 * if anywhere. */
function replay(registry, recorded) {
  const started = performance.now();
  const out = { players: recorded.seats.length, seed: recorded.seed, actions: recorded.actions.length, checks: 0, mismatch: null, error: null, ms: 0 };
  const check = (label, expected, at) => {
    out.checks += 1;
    const whole = stateDigest(game.state, { events: true });
    const brief = stateDigest(game.state);
    if (out.mismatch === null && (whole !== expected.whole || brief !== expected.brief)) {
      out.mismatch = { at, label, expected, got: { whole, brief }, turn: game.state.turn.number, step: game.state.turn.step };
    }
  };
  let game;
  try {
    game = Game.create({ seed: recorded.seed, mulligans: true, registry, decks: recorded.seats });
    game.advanceUntil(isSettled);
    check("the opening", recorded.opening, 0);
    for (let i = 0; i < recorded.actions.length && out.mismatch === null; i += 1) {
      game.dispatch(recorded.actions[i]);
      game.advanceUntil(isSettled);
      const done = i + 1;
      if (done % recorded.every === 0) check(`after ${done} actions`, recorded.digests[done / recorded.every - 1], done);
    }
    if (out.mismatch === null) check("the end", recorded.end, recorded.actions.length);
  } catch (error) {
    out.error = error instanceof Error ? (error.stack ?? error.message).split("\n").slice(0, 4).join(" | ") : String(error);
  }
  out.ms = Math.round(performance.now() - started);
  return out;
}

/** Loads the pool, replays every game, and says how it went. */
export async function run(games) {
  const started = performance.now();
  const shards = await Promise.all(Array.from({ length: CARD_SHARD_COUNT }, (_, i) => loadCardShard(i)));
  const registry = registryFrom(shards.flatMap((shard) => [...shard.pool, ...shard.tokens]));
  const poolMs = Math.round(performance.now() - started);
  const results = games.map((recorded) => replay(registry, recorded));
  const actions = results.reduce((n, r) => n + r.actions, 0);
  const replayMs = results.reduce((n, r) => n + r.ms, 0);
  return {
    agent: navigator.userAgent,
    cores: navigator.hardwareConcurrency ?? null,
    poolMs,
    replayMs,
    msPerAction: actions === 0 ? 0 : +(replayMs / actions).toFixed(3),
    games: results,
    ok: results.every((r) => r.mismatch === null && r.error === null),
  };
}
