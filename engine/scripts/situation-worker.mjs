// Worker half of `situation-fuzz.mjs`: plays one scenario per job
// (`situation-scenario.mjs`) and posts back how it went. A thread of its own
// so the parent can kill a scenario stuck inside one `tick()`, which no step
// cap can stop (see `random-game-worker.mjs`).

import { parentPort } from "node:worker_threads";

import { setComputedCacheCheck } from "../dist/index.js";
import { runScenario } from "./situation-scenario.mjs";

parentPort.on("message", ({ card, seed, players, cacheCheck }) => {
  // The computed-value cache checked on every hit (MTG_CACHE_CHECK=1 on the
  // full fuzzer) — in the scenarios the parent picks: it costs ~5x.
  setComputedCacheCheck(cacheCheck === true);
  const startedAt = Date.now();
  try {
    const result = runScenario(card, seed, {
      players,
      // The board first, so a scenario the parent kills for its time is
      // reported with it.
      onBoard: (description) => parentPort.postMessage({ board: description }),
    });
    parentPort.postMessage({
      done: true,
      ok: true,
      ms: Date.now() - startedAt,
      ticks: result.ticks,
      acted: result.acted,
      entered: result.startZone === "battlefield",
      holes: result.holes,
    });
  } catch (error) {
    parentPort.postMessage({
      done: true,
      ok: false,
      ms: Date.now() - startedAt,
      stage: error?.stage ?? "setup",
      error: error instanceof Error ? (error.stack ?? error.message) : String(error),
      description: error?.description ?? null,
      actions: error?.actions ?? [],
    });
  }
});
