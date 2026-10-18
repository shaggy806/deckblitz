// Play the lookahead benchmarks (`src/bot/benchmarks.ts`) with a bot in
// Alice's seat and report which it solves, and how long each took. Goals, not
// a gate: it always exits 0.
//
//   npm run bot:benchmarks -w engine
//   npm run bot:benchmarks -w engine -- --sims 2000          more simulations per decision
//   npm run bot:benchmarks -w engine -- --time-ms 5000       a wall-clock budget, as live rooms have
//   npm run bot:benchmarks -w engine -- --rollout acting     how the rollouts play the turn out
//   npm run bot:benchmarks -w engine -- --rollout-decisions  search our own decisions inside rollouts
//   npm run bot:benchmarks -w engine -- --no-follow-ups      the one-move search alone
//   npm run bot:benchmarks -w engine -- --horizon round      roll out through the opponents' turns
//   npm run bot:benchmarks -w engine -- --horizon next-turn  ...and through our own next turn too
//   npm run bot:benchmarks -w engine -- --plan turn          plan our own turn (`turn-plan.ts`)
//   npm run bot:benchmarks -w engine -- --plan next-turn     ...and our next one, for close calls
//   npm run bot:benchmarks -w engine -- --plan-sims 200      simulations a plan may spend
//   npm run bot:benchmarks -w engine -- --bot v1             v1 in Alice's seat instead
//   npm run bot:benchmarks -w engine -- --only Bolt          benchmarks whose name contains "Bolt"
//
// Runs `dist/`: build first (`npm run build -w engine`).

import {
  BOT_BENCHMARKS,
  EvalBotController,
  HeuristicBotController,
  createDefaultRegistry,
  runBenchmark,
} from "../dist/index.js";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const has = (name) => args.includes(`--${name}`);

const bot = flag("bot", "v2");
const sims = flag("sims", null);
const timeMs = flag("time-ms", null);
const options = {
  ...(sims !== null ? { maxSimulations: Number(sims) } : {}),
  ...(timeMs !== null ? { timeBudgetMs: Number(timeMs) } : {}),
  ...(flag("rollout", null) !== null ? { rollout: flag("rollout") } : {}),
  ...(flag("horizon", null) !== null ? { horizon: flag("horizon") } : {}),
  ...(has("rollout-decisions") ? { rolloutDecisions: true } : {}),
  ...(has("no-follow-ups") ? { followUps: false } : {}),
  ...(flag("plan", null) !== null ? { plan: flag("plan") } : {}),
  ...(flag("plan-sims", null) !== null ? { planSimulations: Number(flag("plan-sims")) } : {}),
};
const only = flag("only", null);

const alice =
  bot === "v1"
    ? (player, registry) => new HeuristicBotController(player, registry)
    : (player, registry) => new EvalBotController(player, registry, options);

const registry = createDefaultRegistry();
const benchmarks = BOT_BENCHMARKS.filter((b) => only === null || b.name.includes(only));
console.log(`benchmarks: ${bot}${bot === "v1" ? "" : ` ${JSON.stringify(options)}`}`);

const width = Math.max(...benchmarks.map((b) => b.name.length));
const reports = [];
for (const benchmark of benchmarks) {
  const report = runBenchmark(benchmark, registry, alice);
  reports.push(report);
  const ms = `${report.ms}ms`.padStart(8);
  console.log(
    `  ${report.passed ? "solved" : "missed"} ${ms}  ${report.lookahead.padEnd(10)} ${report.name.padEnd(width)}  (${report.detail})`,
  );
}

const solved = reports.filter((r) => r.passed);
const total = reports.reduce((sum, r) => sum + r.ms, 0);
console.log(`${solved.length}/${reports.length} solved in ${(total / 1000).toFixed(1)}s`);
for (const kind of ["sequence", "combat", "their-turn", "next-turn"]) {
  const of = reports.filter((r) => r.lookahead === kind);
  if (of.length > 0) console.log(`  ${kind.padEnd(10)} ${of.filter((r) => r.passed).length}/${of.length}`);
}
