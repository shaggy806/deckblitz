// The situation fuzzer: each card under test played in many small random
// board states, seconds per card, as a complement to the full-game fuzzer
// (`random-demo.mjs`).
//
//   npm run play:situations -w engine -- --with "Card Name"          # 60 scenarios
//   npm run play:situations -w engine -- --with A --with B --scenarios 300
//   npm run play:situations -w engine -- --with-file cards.txt       # one name a line
//   npm run play:situations -w engine -- --with "Card" --seed 42 --scenarios 1  # replay one
//   ... --players 2 | 4      every scenario at that many seats (default: the seed's pick)
//   ... --workers N          threads (default: the cores less one, at most 6)
//   ... --timeout S          per scenario, seconds (default 30; five times that with the cache check)
//   ... --cache-check-every N   check the computed-value cache in every Nth
//                            scenario by seed (default 10; 1 = all, 0 = none)
//
// Why: a full random game runs 80-130 turns (random players rarely finish
// anyone off) to play a new card a handful of times, and a card's bugs nearly
// always show when it is first cast, activated or resolved. A scenario
// (`situation-scenario.mjs`) builds a small board through the engine's own
// entry paths — both sides' permanents drawn from the pool, token stacks, a
// hexproof/ward/protection creature, an Aura and Equipment attached, a token
// copy, varied life, 2 or 4 players, sometimes a spell on the stack — puts
// the card in hand (with the lands to cast it), on the battlefield (its entry
// announced), in the graveyard or exile when it does something from there,
// or in the command zone; has its seat cast or activate it with every choice
// a `RandomController`'s; plays two more turns at random; and checks the
// state: no throw, no step cap reached, a plain state that survives a JSON
// round trip with the same legal actions, every seat's view hiding hands and
// libraries, and the computed-value cache agreeing (MTG_CACHE_CHECK — in one
// scenario in ten, as it costs ~5x).
//
// Scenario k of a run is seed `--seed` + k (default 1), the same scenario on
// every machine; a failure prints the card, its seed, the board and the
// command that replays exactly it. Each scenario runs in a worker thread with
// a wall-clock limit, as the full fuzzer's games do. Exit code 1 on any
// failure.

import os from "node:os";
import { readFileSync } from "node:fs";

import { runPool } from "./worker-pool.mjs";
import { isTestable } from "./situation-scenario.mjs";

const args = process.argv.slice(2);
const USAGE = `usage: node scripts/situation-fuzz.mjs --with "Card" [--with …] [--with-file F] [--scenarios N]
                                     [--seed S] [--players 2|4] [--workers N] [--timeout S] [--cache-check-every N]`;
const VALUED = new Set(["--with", "--with-file", "--scenarios", "--seed", "--players", "--workers", "--timeout", "--cache-check-every"]);
const cards = [];
const opts = {};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--help" || a === "-h") {
    console.log(USAGE);
    process.exit(0);
  } else if (VALUED.has(a) && args[i + 1] !== undefined) {
    const v = args[++i];
    if (a === "--with") cards.push(v);
    else if (a === "--with-file") cards.push(...readFileSync(v, "utf8").split(/\r?\n/).map((l) => l.trim()).filter(Boolean));
    else opts[a.slice(2)] = Number(v);
  } else {
    console.error(`situation-fuzz: unknown argument ${a}\n${USAGE}`);
    process.exit(2);
  }
}
const names = [...new Set(cards)];
if (names.length === 0) {
  console.error(`situation-fuzz: no cards (--with or --with-file)\n${USAGE}`);
  process.exit(2);
}
const unknown = names.filter((n) => !isTestable(n));
if (unknown.length > 0) {
  console.error(`situation-fuzz: not a deckable pool card: ${unknown.join(", ")}`);
  process.exit(2);
}
const scenarios = opts.scenarios ?? 60;
const firstSeed = opts.seed ?? 1;
const players = opts.players ?? null;
if (players !== null && players !== 2 && players !== 4) {
  console.error("situation-fuzz: --players takes 2 or 4");
  process.exit(2);
}
// Six at most: on the i5-13600K this was measured on (6 performance cores, 8
// efficiency) 4 and 8 workers ran the same scenarios per second, and 12
// fewer — the engine is bound by memory, not cores.
const workers = opts.workers ?? Math.max(1, Math.min(6, os.availableParallelism() - 1));
const timeoutMs = (opts.timeout ?? 30) * 1000;
// A scenario with the cache check on gets five times as long: the check made
// one board (Enemy of Enlightenment, seed 24) 56 times slower, 0.47 s to 27 s,
// and under six workers' load that passed 30 s.
const limitOf = (job) => (job.cacheCheck ? 5 : 1) * timeoutMs;
const cacheEvery = opts["cache-check-every"] ?? 10;
const cacheChecked = (seed) => cacheEvery > 0 && seed % cacheEvery === 0;

// Card by card within each seed, so every card is under way from the start.
const jobs = [];
for (let k = 0; k < scenarios; k++) for (const card of names) jobs.push({ card, seed: firstSeed + k, players, cacheCheck: cacheChecked(firstSeed + k) });

const stats = new Map(names.map((n) => [n, { runs: 0, played: 0, ms: 0, ticks: 0, failures: [] }]));
/** Blank target slots left `undefined` (the known gap — see `plainProblem`):
 * path → the cards and seeds that left one. */
const holes = new Map();
const boards = new Map();
const replay = (card, seed) =>
  `node scripts/situation-fuzz.mjs --with ${JSON.stringify(card)} --seed ${seed} --scenarios 1${players !== null ? ` --players ${players}` : ""}${cacheChecked(seed) ? " --cache-check-every 1" : ""}`;
const started = Date.now();
console.log(`situation fuzz: ${names.length} card${names.length === 1 ? "" : "s"} x ${scenarios} scenarios (seeds ${firstSeed}-${firstSeed + scenarios - 1}), ${Math.min(workers, jobs.length)} workers`);

await new Promise((resolve) =>
  runPool({
    url: new URL("./situation-worker.mjs", import.meta.url),
    jobs,
    workers,
    timeoutMs: limitOf,
    label: "situations",
    // Room above the pool's own footprint: at the shared 768 MB cap
    // (`worker-limits.mjs`) a scenario took 424 ms, nearly all of it
    // collecting garbage, against 236 ms here.
    resourceLimits: { maxOldGenerationSizeMb: 2048 },
    isFinal: (m) => m.done === true,
    onMessage: (m, job) => {
      if (m.board !== undefined) {
        boards.set(job, m.board);
        return;
      }
      const s = stats.get(job.card);
      s.runs += 1;
      s.ms += m.ms;
      boards.delete(job);
      if (m.ok) {
        s.ticks += m.ticks;
        if (m.acted > 0 || m.entered) s.played += 1;
        for (const at of m.holes ?? []) {
          if (!holes.has(at)) holes.set(at, []);
          holes.get(at).push(`${job.card} seed ${job.seed}`);
        }
      } else {
        s.failures.push({ seed: job.seed, stage: m.stage, error: m.error, description: m.description, actions: m.actions });
      }
    },
    onLost: (job, reason) => {
      const s = stats.get(job.card);
      s.runs += 1;
      s.ms += limitOf(job);
      s.failures.push({
        seed: job.seed,
        stage: "?",
        error: reason === "timeout" ? `TIMED OUT after ${limitOf(job) / 1000}s (stuck inside one tick, or its worker starved)` : `worker lost: ${reason}`,
        description: boards.get(job) ?? "(before the board was laid out)",
        actions: [],
      });
      boards.delete(job);
    },
    onDone: resolve,
  }),
);

// What a failure is, for grouping: its message's first line, object ids
// blanked.
const kindOf = (error) => String(error).split("\n")[0].replace(/obj-\d+/g, "obj-N").slice(0, 200);
const secs = (ms) => `${(ms / 1000).toFixed(1)}s`;

console.log("");
console.log("card                                       scenarios  played  failed  cpu     ms/scenario  ticks");
let failed = 0;
for (const [card, s] of stats) {
  failed += s.failures.length;
  console.log(
    `${card.slice(0, 42).padEnd(42)} ${String(s.runs).padStart(9)}  ${String(s.played).padStart(6)}  ${String(s.failures.length).padStart(6)}  ${secs(s.ms).padStart(6)}  ${String(Math.round(s.ms / Math.max(1, s.runs))).padStart(11)}  ${String(Math.round(s.ticks / Math.max(1, s.runs - s.failures.length))).padStart(5)}`,
  );
}
const total = jobs.length;
const wall = Date.now() - started;
console.log("");
console.log(`${total} scenarios, ${failed} failed, ${secs(wall)} (${secs(wall / names.length)} per card, ${Math.round([...stats.values()].reduce((n, s) => n + s.ms, 0) / total)} ms cpu per scenario)`);

for (const [card, s] of stats) {
  if (s.failures.length === 0) continue;
  const groups = new Map();
  for (const f of s.failures) {
    const k = kindOf(f.error);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(f);
  }
  for (const [kind, list] of groups) {
    const first = list[0];
    console.log("");
    console.log(`FAILED ${card}: ${kind}`);
    console.log(`  ${list.length} scenario${list.length === 1 ? "" : "s"} (seeds ${list.slice(0, 8).map((f) => f.seed).join(", ")}${list.length > 8 ? ", …" : ""}); the first, in the ${first.stage} stage:`);
    if (first.description) console.log(first.description);
    if (first.actions?.length) console.log(`  card actions: ${first.actions.join(" / ")}`);
    const stack = String(first.error).split("\n").slice(1, 7).map((l) => `    ${l.trim()}`);
    if (stack.length > 0) console.log(stack.join("\n"));
    console.log(`  replay: ${replay(card, first.seed)}`);
  }
}
if (holes.size > 0) {
  console.log("");
  console.log(`known gap, not failed — a blank target slot left undefined, which JSON reads back as null (BACKLOG "Blank target slots don't survive JSON"):`);
  for (const [at, where] of holes) console.log(`  ${at}: ${where.length} scenario${where.length === 1 ? "" : "s"} (${where.slice(0, 3).join(", ")}${where.length > 3 ? ", …" : ""})`);
}
if (failed > 0) {
  console.log("");
  console.log(`${failed} FAILED`);
  process.exitCode = 1;
}
