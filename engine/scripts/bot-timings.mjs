// What v2's decisions cost in play, at a wall-clock budget (the bot audit's
// "harvest" probe, docs/plans/bot-audit-2026-11.md; the before-and-after
// measurement for the clock steps of docs/plans/bot-audit-fixes.md).
//
// Plays four-player Commander games between the bench decks (`bot-seating.mjs`,
// the seatings `bot:bench` deals), every seat v2 at the live rooms' budget, and
// records one row per decision that searched: board size, wall ms, the
// decision's own counts (`lastDecision`), and, for a priority search the clock
// cut to its baselines, what a fresh v1 would have played. Then prints the
// summary: all searched decisions, by board size, by kind, and the slowest.
//
//   npm run bot:timings -w engine -- --games 12
//   npm run bot:timings -w engine -- --sum .scratch/bot-timings     # the summary again
//
// Timing under a clock depends on how busy the machine is: nothing else
// running, at most 8 workers (the default is 6), and compare runs only at the
// same worker count. A clocked game doesn't replay exactly, so the same seeds
// give nearby figures, not equal ones.
//
// Flags: --games N (default 12), --first-seed N (default 1), --workers N
// (default 6, at most 8), --budget MS|live|none (default live:
// `LIVE_BOT_BUDGET_MS`), --game-cap S (stop a game after this long, default
// 720), --out DIR (default .scratch/bot-timings, emptied first; git-ignored),
// --snaps (also save the position before the first searched decision in each
// board-size bucket, and before up to four decisions a game slower than --slow
// MS, default 4000: bare snapshots `bot:anatomy --from` and `bot:replay --from`
// read), --dist PATH (another build's index.js), --sum DIR (print the summary
// of an earlier run and stop).
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { performance } from "node:perf_hooks";
import { appendFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (n, f) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : f;
};

const lines = (file) => {
  const text = readFileSync(file, "utf8").trim();
  return text === "" ? [] : text.split("\n").map((l) => JSON.parse(l));
};

function summarise(dir) {
  const rows = lines(join(dir, "decisions.ndjson"));
  const games = lines(join(dir, "games.ndjson"));
  const q = (a, p) => (a.length === 0 ? 0 : a[Math.min(a.length - 1, Math.floor(a.length * p))]);
  const pad = (v, n) => String(v).padStart(n);
  console.log(
    `${"".padEnd(26)}${pad("n", 6)}${pad("p50", 7)}${pad("p90", 7)}${pad("max", 7)}${pad(">1s", 6)}${pad(">1.5s", 6)}` +
      `${pad("sims", 7)}${pad("ms/sim", 8)}${pad("cut%", 6)}${pad("1-sim", 6)}${pad("total s", 9)}`,
  );
  const line = (label, rs) => {
    if (rs.length === 0) return;
    const ms = rs.map((r) => r.ms).sort((a, b) => a - b);
    const sims = rs.reduce((n, r) => n + r.sims, 0);
    const simMs = rs.reduce((n, r) => n + r.simMs, 0);
    const total = ms.reduce((n, x) => n + x, 0);
    console.log(
      label.padEnd(26) +
        pad(rs.length, 6) +
        pad(q(ms, 0.5), 7) +
        pad(q(ms, 0.9), 7) +
        pad(ms[ms.length - 1], 7) +
        pad(rs.filter((r) => r.ms > 1000).length, 6) +
        pad(rs.filter((r) => r.ms > 1500).length, 6) +
        pad((sims / rs.length).toFixed(1), 7) +
        pad((simMs / Math.max(1, sims)).toFixed(1), 8) +
        pad(((100 * rs.filter((r) => r.cut || r.expired).length) / rs.length).toFixed(0), 6) +
        pad(rs.filter((r) => r.sims === 1).length, 6) +
        pad((total / 1000).toFixed(0), 9),
    );
  };
  const searched = rows.filter((r) => r.sims > 0);
  line("all searched", searched);
  console.log("by board size");
  const B = [0, 10, 20, 30, 40, 50, 60, 80, 100, 130, 9999];
  for (let i = 0; i < B.length - 1; i += 1) {
    line(`  ${B[i]}-${i === B.length - 2 ? "" : B[i + 1] - 1}`, searched.filter((r) => r.board >= B[i] && r.board < B[i + 1]));
  }
  console.log("by kind");
  const groups = {};
  for (const r of searched) (groups[`  ${r.kind}: ${r.via ?? "-"}`] ??= []).push(r);
  for (const [k, rs] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) line(k, rs);
  const pri = searched.filter((r) => r.kind === "priority");
  line("  priority, own turn", pri.filter((r) => r.seat === r.active));
  line("  priority, others' turn", pri.filter((r) => r.seat !== r.active));
  const cut = rows.filter((r) => r.v1 !== undefined);
  if (cut.length > 0) {
    const t = {};
    for (const r of cut) {
      const k = `v2 ${r.action}, v1 ${r.v1}, ${r.sims} sim${r.sims === 1 ? "" : "s"}`;
      t[k] = (t[k] ?? 0) + 1;
    }
    console.log(`priority searches the clock cut to their baselines (${cut.length}):`);
    for (const [k, n] of Object.entries(t).sort((a, b) => b[1] - a[1])) console.log(`  ${pad(n, 4)}  ${k}`);
  }
  console.log("slowest");
  for (const r of [...rows].sort((a, b) => b.ms - a.ms).slice(0, 8)) {
    console.log(
      `  ${pad(r.ms, 6)} ms  seed ${r.seed} t${r.turn} ${r.seat} ${r.step}, board ${r.board}: ${r.kind}/${r.via}, ${r.sims} sims in ${r.simMs} ms` +
        `${r.cut ? ", cut" : ""}${r.expired ? ", expired" : ""} -> ${r.action}`,
    );
  }
  const sum = (k) => games.reduce((n, g) => n + (g[k] ?? 0), 0);
  console.log(
    `${games.length} games (${games.filter((g) => g.over).length} finished, turns ${games.map((g) => g.turns).join(",")}; biggest boards ${games.map((g) => g.maxBoard).join(",")}): ` +
      `${sum("searched") + sum("trivial")} decisions, ${sum("searched")} searched, ${sum("over1s")} over 1 s, ${sum("wallS")} s of games`,
  );
  const errors = games.filter((g) => g.error);
  for (const g of errors) console.log(`  seed ${g.seed} ERROR: ${g.error}`);
}

if (isMainThread) {
  const sumDir = flag("sum", null);
  if (sumDir !== null) {
    summarise(resolve(sumDir));
    process.exit(0);
  }
  const OUT = resolve(flag("out", join(HERE, "../../.scratch/bot-timings")));
  const workers = Math.max(1, Math.min(8, Number(flag("workers", "6"))));
  const games = Number(flag("games", "12"));
  const data = {
    dist: pathToFileURL(resolve(flag("dist", join(HERE, "../dist/index.js")))).href,
    budget: flag("budget", "live"),
    slowMs: Number(flag("slow", "4000")),
    gameCapMs: Number(flag("game-cap", "720")) * 1000,
    snaps: args.includes("--snaps"),
    out: OUT,
  };
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, "snaps"), { recursive: true });
  writeFileSync(join(OUT, "decisions.ndjson"), "");
  writeFileSync(join(OUT, "games.ndjson"), "");
  const firstSeed = Number(flag("first-seed", "1"));
  const queue = Array.from({ length: games }, (_, i) => firstSeed + i);
  console.error(`bot:timings — ${games} games from seed ${firstSeed}, budget ${data.budget}, ${workers} workers, to ${OUT}`);
  let live = 0;
  await new Promise((done) => {
    const spawn = () => {
      if (queue.length === 0) {
        if (live === 0) done();
        return;
      }
      live += 1;
      const seed = queue.shift();
      const w = new Worker(new URL(import.meta.url), {
        workerData: { ...data, seed },
        resourceLimits: { maxOldGenerationSizeMb: 1536, maxYoungGenerationSizeMb: 32 },
      });
      let finished = false;
      const finish = (row) => {
        if (finished) return;
        finished = true;
        appendFileSync(join(OUT, "games.ndjson"), JSON.stringify(row) + "\n");
        console.error(
          `  seed ${seed}: ${row.error ? `ERROR ${row.error}` : `${row.turns} turns, ${row.wallS} s, ${row.searched} searched, max ${row.maxMs} ms, board ${row.maxBoard}`}`,
        );
        live -= 1;
        spawn();
      };
      w.on("message", finish);
      w.on("error", (e) => finish({ seed, error: String(e?.message ?? e) }));
      w.on("exit", () => finish({ seed, error: "the worker exited without a result" }));
    };
    for (let i = 0; i < workers; i += 1) spawn();
  });
  summarise(OUT);
  process.exit(0);
} else {
  const { dist, budget, slowMs, gameCapMs, seed, snaps, out } = workerData;
  const engine = await import(dist);
  const { COMMANDER_RULES, EvalBotController, HeuristicBotController, Game, createDefaultRegistry } = engine;
  // The seatings come from this checkout's build; `--dist` swaps the bots and
  // the engine under them, not the decks.
  const { tableFor } = await import("./bot-seating.mjs");
  const registry = createDefaultRegistry();
  const { seats, decks } = tableFor(seed, 4);
  const budgetMs = budget === "none" ? null : budget === "live" ? (engine.LIVE_BOT_BUDGET_MS ?? 1000) : Number(budget);

  const BUCKETS = [50, 80, 120, 160, 200, 250];
  const seenBucket = new Set();
  let slowSaved = 0;
  const rows = [];
  let trivial = 0;
  let over1s = 0;
  let searched = 0;
  let maxMs = 0;
  let maxBoard = 0;
  const started = performance.now();
  const controllers = {};
  for (const seat of seats) {
    const c = new EvalBotController(seat, registry, budgetMs === null ? {} : { timeBudgetMs: budgetMs });
    const act = c.act.bind(c);
    c.act = (view) => {
      // The position as asked, kept only if a snapshot may be wanted: the
      // state object is the live one, and the action changes it.
      const s = view.state;
      const board = s.zones.shared.battlefield.length;
      const before = snaps && board >= BUCKETS[0] ? JSON.stringify({ ...s, eventLog: [] }) : null;
      const row0 = {
        seed,
        turn: s.turn.number,
        step: s.turn.step,
        seat,
        active: s.turnOrder[s.turn.activePlayerIndex] ?? null,
        hand: s.zones.perPlayer?.[seat]?.hand?.length ?? null,
        board,
        objects: Object.keys(s.objects).length,
        stack: s.zones.shared.stack.length,
        awaiting: s.awaiting?.kind ?? null,
      };
      const t0 = performance.now();
      const action = act(view);
      const ms = performance.now() - t0;
      const a = c.lastDecision;
      if (board > maxBoard) maxBoard = board;
      if (ms > maxMs) maxMs = ms;
      if (ms > 1000) over1s += 1;
      if (a === null || a === undefined || a.simulations === 0) {
        trivial += 1;
        if (ms < 250) return action;
      } else searched += 1;
      const row = {
        ...row0,
        rollout: c.decisionRollout ?? null,
        ms: Math.round(ms),
        kind: a?.kind ?? null,
        via: a?.via ?? null,
        sims: a?.simulations ?? 0,
        simMs: Math.round(a?.ms ?? 0),
        cut: a?.cut ?? false,
        expired: a?.expired ?? false,
        action: action.type,
      };
      // A priority search the clock cut to its baselines: what would v1 have
      // done? (A fresh v1, so its per-game memory is empty: approximate.)
      if (a !== null && a !== undefined && a.kind === "priority" && a.via === "search" && a.simulations <= 2 && (a.cut || a.expired)) {
        try {
          row.v1 = new HeuristicBotController(seat, registry).act(view).type;
        } catch {
          row.v1 = "error";
        }
      }
      rows.push(row);
      if (before !== null) {
        const bucket = [...BUCKETS].reverse().find((b) => board >= b);
        const firstInBucket = bucket !== undefined && !seenBucket.has(bucket) && a?.via === "search" && (a?.simulations ?? 0) >= 3;
        const slow = ms >= slowMs && slowSaved < 4;
        if (firstInBucket || slow) {
          if (firstInBucket) seenBucket.add(bucket);
          else slowSaved += 1;
          writeFileSync(
            join(out, "snaps", `seed-${seed}-t${s.turn.number}-b${board}-${firstInBucket ? `bucket${bucket}` : "slow"}-${seat}.json`),
            before,
          );
        }
      }
      return action;
    };
    controllers[seat] = c;
  }
  let error = null;
  let game = null;
  try {
    game = Game.create({
      seed,
      registry,
      controllers,
      mulligans: true,
      rules: COMMANDER_RULES,
      decks: seats.map((player, i) => ({ player, cards: decks[i].cards, commanders: decks[i].commanders })),
    });
    game.advanceUntil(() => performance.now() - started > gameCapMs);
  } catch (e) {
    error = String(e?.message ?? e);
  }
  appendFileSync(join(out, "decisions.ndjson"), rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""));
  parentPort.postMessage({
    seed,
    decks: decks.map((d) => d.name),
    over: game?.state.result.over ?? false,
    turns: game?.state.turn.number ?? null,
    wallS: Math.round((performance.now() - started) / 1000),
    searched,
    trivial,
    over1s,
    maxMs: Math.round(maxMs),
    maxBoard,
    error,
  });
}
