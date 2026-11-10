// Where one v2 decision's time goes, from a saved position (the bot audit's
// probe, docs/plans/bot-audit-2026-11.md; the yardstick for the speed steps of
// docs/plans/bot-audit-fixes.md).
//
// Loads a snapshot, seats v2 everywhere, plays on, and for each of the first
// --decisions decisions that searched reports: wall ms, the audit's counts,
// and (unless --plain) what the engine did underneath: clones, rollout
// segments with their ticks (`steps`) and turns crossed, legalActions and v1
// act() calls with their inclusive time, GC pauses. Before any of that, the
// position's unit costs: one clone, one legalActions, one evaluation, warm
// and cold. Instrumentation is by patching runtime prototypes in THIS process
// only. Count budgets by default, so the decisions and their simulation and
// tick counts repeat exactly; only the milliseconds vary. Run it alone on a
// quiet machine. A rollout that searches a decision of its own runs rollouts
// inside itself, and each is a segment: their time is counted in both, so
// "rollouts" can exceed the decisions' own time and ms a tick reads high on
// such a position. Compare a position with itself, before and after.
//
//   npm run bot:anatomy -w engine -- --from data/bot-positions/seed-50-t40.json
//
// Flags: --from FILE (a snapshot, a capture, or a position from
// `data/bot-positions/`; a path is read from engine/), --decisions N (default
// 6), --min-sims N (skip decisions with fewer simulations, default 3),
// --budget MS|live (a wall-clock budget; default none), --plain (no
// instrumentation: the timings as play has them), --units N (repeats for the
// unit costs, default 20), --cap-s S (stop after this long, default 600),
// --label L, --dist PATH (another build's index.js), --json (one JSON line a
// decision and a summary line, the audit's format, instead of the table).
import { readFileSync } from "node:fs";
import { performance, PerformanceObserver } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const flag = (n, f) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : f;
};
const has = (n) => args.includes(`--${n}`);
const from = flag("from", null);
const HERE = dirname(fileURLToPath(import.meta.url));
const dist = resolve(flag("dist", resolve(HERE, "../dist/index.js")));
const wanted = Number(flag("decisions", "6"));
const budgetFlag = flag("budget", "0");
const json = has("json");
const plain = has("plain");
const capS = Number(flag("cap-s", "600"));
const label = flag("label", "");
const minSims = Number(flag("min-sims", "3"));
const units = Number(flag("units", "20"));

if (from === null) {
  console.error("bot:anatomy needs --from FILE (see data/bot-positions/)");
  process.exit(1);
}
const engine = await import(pathToFileURL(dist).href);
const { EvalBotController, HeuristicBotController, Game, createDefaultRegistry } = engine;
const budgetMs = budgetFlag === "live" ? (engine.LIVE_BOT_BUDGET_MS ?? 1000) : Number(budgetFlag);
const registry = createDefaultRegistry();
const saved = JSON.parse(readFileSync(from, "utf8"));
const snapshot = saved.state ?? saved;

let gcMs = 0;
let gcN = 0;
const obs = new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    gcMs += e.duration;
    gcN += 1;
  }
});
obs.observe({ entryTypes: ["gc"] });
const flushGc = () => {
  for (const e of obs.takeRecords()) {
    gcMs += e.duration;
    gcN += 1;
  }
};

// ---- unit costs at the saved position (before any patching) ----------------
const boardOf = (s) => s.zones.shared.battlefield.length;
const unit = {};
{
  const g0 = Game.fromSnapshot(snapshot, { registry });
  const me = snapshot.turnOrder[snapshot.turn.activePlayerIndex];
  const time = (fn) => {
    fn();
    const t = performance.now();
    for (let i = 0; i < units; i += 1) fn();
    return +((performance.now() - t) / units).toFixed(3);
  };
  unit.cloneMs = time(() => Game.fromSnapshot(snapshot, { registry }));
  unit.jsonBytes = JSON.stringify(snapshot).length;
  unit.legalActionsMs = time(() => g0.legalActions(me));
  if (typeof engine.evaluateState === "function") unit.evaluateMs = time(() => engine.evaluateState(g0.state, registry, me));
  // A fresh copy each time: the computed cache starts cold, as a simulation's does.
  if (typeof engine.evaluateState === "function")
    unit.evaluateColdMs = time(() => engine.evaluateState(Game.fromSnapshot(snapshot, { registry }).state, registry, me)) - unit.cloneMs;
  unit.legalActionsColdMs = time(() => Game.fromSnapshot(snapshot, { registry }).legalActions(me)) - unit.cloneMs;
  unit.objects = Object.keys(snapshot.objects).length;
  unit.board = boardOf(snapshot);
}

// ---- instrumentation ------------------------------------------------------
let cur = null;
const fresh = () => ({ clones: 0, cloneMs: 0, segs: [], legalN: 0, legalMs: 0, v1N: 0, v1Ms: 0, dispatches: 0 });
let realGame = null;
if (!plain) {
  const origFrom = Game.fromSnapshot;
  Game.fromSnapshot = function (snap, env) {
    const t = performance.now();
    const g = origFrom.call(this, snap, env);
    if (cur !== null) {
      cur.cloneMs += performance.now() - t;
      cur.clones += 1;
    }
    return g;
  };
  const origAdv = Game.prototype.advanceUntil;
  Game.prototype.advanceUntil = function (pred) {
    if (this === realGame || cur === null) return origAdv.call(this, pred);
    const t = performance.now();
    let steps = 0;
    const turn0 = this.state.turn.number;
    const r = origAdv.call(this, (s) => {
      steps += 1;
      return pred(s);
    });
    cur.segs.push({ ms: performance.now() - t, steps, turns: this.state.turn.number - turn0 });
    return r;
  };
  const origDispatch = Game.prototype.dispatch;
  Game.prototype.dispatch = function (action) {
    if (cur !== null && this !== realGame) cur.dispatches += 1;
    return origDispatch.call(this, action);
  };
  let legalDepth = 0;
  const origLegal = Game.prototype.legalActions;
  Game.prototype.legalActions = function (player) {
    if (cur === null || legalDepth > 0) return origLegal.call(this, player);
    legalDepth += 1;
    const t = performance.now();
    try {
      return origLegal.call(this, player);
    } finally {
      cur.legalMs += performance.now() - t;
      cur.legalN += 1;
      legalDepth -= 1;
    }
  };
  let v1Depth = 0;
  const origV1 = HeuristicBotController.prototype.act;
  HeuristicBotController.prototype.act = function (view) {
    if (cur === null || v1Depth > 0) return origV1.call(this, view);
    v1Depth += 1;
    const t = performance.now();
    try {
      return origV1.call(this, view);
    } finally {
      cur.v1Ms += performance.now() - t;
      cur.v1N += 1;
      v1Depth -= 1;
    }
  };
}

// ---- play on ---------------------------------------------------------------
const rows = [];
let trivial = 0;
const started = performance.now();
const controllers = {};
for (const seat of snapshot.turnOrder) {
  const c = new EvalBotController(seat, registry, budgetMs > 0 ? { timeBudgetMs: budgetMs } : {});
  const act = c.act.bind(c);
  c.act = (view) => {
    flushGc();
    const gc0 = gcMs;
    const gcN0 = gcN;
    cur = fresh();
    const t0 = performance.now();
    const action = act(view);
    const ms = performance.now() - t0;
    const mine = cur;
    cur = null;
    flushGc();
    const a = c.lastDecision;
    const sims = a?.simulations ?? 0;
    if (sims < minSims) {
      trivial += 1;
      return action;
    }
    const s = view.state;
    const segMs = mine.segs.reduce((n, x) => n + x.ms, 0);
    const steps = mine.segs.reduce((n, x) => n + x.steps, 0);
    const byTurns = {};
    for (const x of mine.segs) {
      const k = x.turns >= 4 ? "4+" : String(x.turns);
      const b = (byTurns[k] ??= { n: 0, ms: 0, steps: 0, max: 0 });
      b.n += 1;
      b.ms += x.ms;
      b.steps += x.steps;
      if (x.ms > b.max) b.max = x.ms;
    }
    for (const b of Object.values(byTurns)) {
      b.ms = Math.round(b.ms);
      b.max = Math.round(b.max);
    }
    rows.push({
      label,
      turn: s.turn.number,
      step: s.turn.step,
      seat,
      active: s.turnOrder[s.turn.activePlayerIndex] === seat,
      board: boardOf(s),
      stack: s.zones.shared.stack.length,
      awaiting: s.awaiting?.kind ?? null,
      ms: Math.round(ms),
      kind: a?.kind ?? null,
      via: a?.via ?? null,
      sims,
      simMs: Math.round(a?.ms ?? 0),
      cut: a?.cut ?? false,
      expired: a?.expired ?? false,
      action: action.type,
      gcMs: Math.round(gcMs - gc0),
      gcN: gcN - gcN0,
      ...(plain
        ? {}
        : {
            clones: mine.clones,
            cloneMs: Math.round(mine.cloneMs),
            segs: mine.segs.length,
            segMs: Math.round(segMs),
            steps,
            maxSteps: Math.max(0, ...mine.segs.map((x) => x.steps)),
            ceil400: mine.segs.filter((x) => x.steps > 400).length,
            dispatches: mine.dispatches,
            legalN: mine.legalN,
            legalMs: Math.round(mine.legalMs),
            v1N: mine.v1N,
            v1Ms: Math.round(mine.v1Ms),
            byTurns,
          }),
    });
    const row = rows[rows.length - 1];
    if (json) console.log(JSON.stringify(row));
    else
      console.log(
        `t${row.turn} ${row.seat} ${row.step}${row.awaiting ? ` (${row.awaiting})` : ""} board ${row.board} ${row.kind}/${row.via}` +
          ` -> ${row.action}: ${row.ms} ms, ${row.sims} sims` +
          (plain ? "" : `, ${row.steps} ticks, ${row.clones} clones ${row.cloneMs} ms, legal ${row.legalN}x ${row.legalMs} ms, v1 ${row.v1N}x ${row.v1Ms} ms`) +
          `, gc ${row.gcMs} ms${row.cut ? ", cut" : ""}${row.expired ? ", expired" : ""}`,
      );
    return action;
  };
  controllers[seat] = c;
}
realGame = Game.fromSnapshot(snapshot, { registry, controllers });
let error = null;
try {
  realGame.advanceUntil((s) => s.result.over || rows.length >= wanted || performance.now() - started > capS * 1000);
} catch (e) {
  error = String(e?.stack ?? e).slice(0, 400);
}
const total = (k) => rows.reduce((n, r) => n + (r[k] ?? 0), 0);
const summary = ({
    summary: true,
    label,
    from,
    plain,
    budgetMs,
    unit,
    decisions: rows.length,
    trivial,
    wallS: +((performance.now() - started) / 1000).toFixed(1),
    ms: total("ms"),
    sims: total("sims"),
    gcMs: total("gcMs"),
    cloneMs: total("cloneMs"),
    segMs: total("segMs"),
    steps: total("steps"),
    legalMs: total("legalMs"),
    v1Ms: total("v1Ms"),
    error,
  });
if (json) console.log(JSON.stringify(summary));
else {
  const u = unit;
  const per = (a, b, digits = 0) => (b > 0 ? (a / b).toFixed(digits) : "-");
  console.log(
    `
position: board ${u.board}, ${u.objects} objects, ${(u.jsonBytes / 1024).toFixed(0)} KB` +
      `
unit costs (ms): clone ${u.cloneMs}, legalActions ${u.legalActionsMs} (cold ${u.legalActionsColdMs.toFixed(3)})` +
      (u.evaluateMs !== undefined ? `, evaluate ${u.evaluateMs} (cold ${u.evaluateColdMs.toFixed(3)})` : "") +
      `
${summary.decisions} decisions (${trivial} under ${minSims} sims skipped), ${summary.wallS} s wall: ` +
      `${summary.sims} sims, ${per(summary.ms, summary.sims)} ms a simulation` +
      (plain ? "" : `, ${summary.steps} ticks, ${per(summary.segMs, summary.steps, 2)} ms a tick`) +
      `
time (ms): decisions ${summary.ms}` +
      (plain ? "" : `, rollouts ${summary.segMs}, clones ${summary.cloneMs}, legalActions ${summary.legalMs}, v1 ${summary.v1Ms}`) +
      `, gc ${summary.gcMs}` +
      (error !== null ? `
ERROR: ${error}` : ""),
  );
}
process.exit(0);
