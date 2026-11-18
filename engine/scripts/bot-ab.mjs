// The current engine's bot against the same bot at an older commit: one seat
// on the working build, the rest on the baseline, seeded and seated as
// `bot:bench` seats them (`bot-seating.mjs`), count budgets unless --budget.
//
//   npm run bot:ab -w engine -- --base origin/main --bot v2 --games 400
//
// Flags: --base REF (default origin/main), --bot v1|v2 (default v2),
// --games N (default 400; rounded up to a multiple of --players),
// --players 2-4 (default 4), --workers N (default cores - 2),
// --timeout SECONDS per game (default 1500), --out FILE (an NDJSON of every
// game; rerun the same command to resume it), --budget MS|live (v2's
// wall-clock budget per decision on every seat, `live` the rooms' own: games
// then depend on the machine's load, so keep --workers at 8 or fewer).
//
// A game that errors or times out counts as an even share, like a draw, and
// is listed with its seed so it can be replayed (`npm run bot:replay`).

import { existsSync, readFileSync, appendFileSync, mkdirSync } from "node:fs";
import os from "node:os";
import { join, dirname } from "node:path";

import { ROOT, baselineDist, workingDist } from "./baseline-build.mjs";
import { TWO_BUILD_LIMITS } from "./worker-limits.mjs";
import { startWatch } from "./watch.mjs";
import { runPool } from "./worker-pool.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const base = flag("base", "origin/main");
const bot = flag("bot", "v2");
const players = Math.min(4, Math.max(2, Number(flag("players", "4"))));
const games = Math.ceil(Number(flag("games", "400")) / players) * players;
// Each worker holds two builds, so two card pools, under a cap of 1.5 GB
// (`TWO_BUILD_LIMITS`): as many as the cores, and no more than the free
// memory holds at 1.7 GB each with 3 GB left over. At the one-build cap
// every game of an 18-worker run ended "JS heap out of memory" (2026-11-16,
// a 32 GB machine).
const fitMemory = Math.floor((os.freemem() / 2 ** 30 - 3) / 1.7);
const workers = Number(flag("workers", String(Math.max(1, Math.min(os.cpus().length - 2, fitMemory)))));
const timeoutMs = Number(flag("timeout", "1500")) * 1000;
const budget = flag("budget", null);
const baseline = baselineDist(base);
const out = flag(
  "out",
  join(ROOT, ".scratch", `ab-${bot}-${baseline.sha}-${players}p${budget === null ? "" : `-budget-${budget}`}.ndjson`),
);
mkdirSync(dirname(out), { recursive: true });
const working = workingDist();

const done = new Set();
const even = 1 / players;
// The measured seat's share so far (a game not played out counts as even),
// for the watch page's score line.
const tally = { games: 0, share: 0 };
const count = (row) => {
  tally.games += 1;
  tally.share += row.outcome === "win" ? 1 : row.outcome === "loss" ? 0 : even;
};
const earlier = [];
if (existsSync(out)) {
  for (const line of readFileSync(out, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    done.add(row.seed);
    count(row);
    earlier.push(row);
  }
}
/** A share of `n` games with its 95% Wilson interval, in percent. */
function interval(share, n) {
  const p = share / n;
  const z = 1.96;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return { p: 100 * p, low: 100 * (c - h), high: 100 * (c + h) };
}
const queue = [];
for (let seed = 1; seed <= games; seed += 1) if (!done.has(seed)) queue.push(seed);
console.log(
  `bot:ab — ${bot}, working build vs ${base} (${baseline.sha}), ${players}p, ${games} games` +
    (done.size > 0 ? `, ${done.size} already in ${out}` : "") +
    `; ${workers} workers` +
    (budget === null ? "" : `; budget ${budget}${budget === "live" ? "" : " ms"} a decision`),
);

function summary() {
  const rows = readFileSync(out, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const n = rows.length;
  const bad = rows.filter((r) => r.outcome !== "win" && r.outcome !== "loss" && r.outcome !== "draw");
  const share = rows.reduce((a, r) => a + (r.outcome === "win" ? 1 : r.outcome === "loss" ? 0 : even), 0);
  const { p, low, high } = interval(share, n);
  console.log(
    `${bot} working vs ${baseline.sha}: ${p.toFixed(1)}% [${low.toFixed(1)}, ` +
      `${high.toFixed(1)}] over ${n} games (even ${(100 * even).toFixed(0)}%)`,
  );
  if (bad.length > 0) {
    console.log(`not finished (counted as even): ${bad.map((r) => `seed ${r.seed} ${r.outcome}${r.error ? `: ${r.error}` : ""}`).join("; ")}`);
  }
  console.log(`results: ${out}`);
}

// The games as they play, on a localhost page (`watch.mjs`): --no-watch to go
// without, --watch-port N for another port than 4020.
const watch = args.includes("--no-watch")
  ? null
  : await startWatch({
      title: `bot:ab: ${bot}, working build vs ${base} (${baseline.sha}), ${players} players`,
      total: games,
      port: Number(flag("watch-port", "4020")),
      score: () => {
        if (tally.games === 0) return "";
        const { p, low, high } = interval(tally.share, tally.games);
        return `new build ${p.toFixed(1)}% of ${tally.games} games, 95% ${low.toFixed(1)} to ${high.toFixed(1)} (even ${(100 * even).toFixed(0)}%)`;
      },
    });
if (watch !== null) {
  // A resumed run shows the games it had already played.
  for (const row of earlier) watch.finish(row);
  console.log(`watch the games at ${watch.url}`);
}

let finished = done.size;
const record = (row) => {
  appendFileSync(out, JSON.stringify(row) + "\n");
  count(row);
  watch?.finish(row);
  finished += 1;
  if (finished % 20 === 0) process.stderr.write(`  ${finished}/${games}\n`);
};
runPool({
  url: new URL("./bot-ab-worker.mjs", import.meta.url),
  workerData: { working: working.dist, baseline: baseline.dist, bot, players, budget, watch: watch !== null },
  jobs: queue,
  workers,
  timeoutMs,
  resourceLimits: TWO_BUILD_LIMITS,
  // A game's snapshots for the watch page come between its results.
  isFinal: (message) => message.watch === undefined,
  onMessage: (message) => (message.watch === undefined ? record(message) : watch?.update(message.watch)),
  onLost: (seed, reason) =>
    record(reason === "timeout" ? { seed, outcome: "timeout" } : { seed, outcome: "error", error: reason }),
  onDone: () => {
    if (finished > 0) summary();
  },
});
