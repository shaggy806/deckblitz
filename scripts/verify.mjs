#!/usr/bin/env node
// Everything a card or engine change must pass before it ships, in one
// command, in the order that fails fastest — the checks the `ship` skill
// lists, run for you. Node, not bash: a CRLF checkout breaks a shell script.
//
//   1. gen:cards (the card barrel and shards)
//   2. build (every workspace) — and, from here on, in the background beside
//      everything below (they need only the build): the fuzzer at 2 and 4
//      players, the fuzzer with every card this change adds (or `--with`
//      names) forced in — each 4-player run as two processes over halves of
//      its seeds — and the bot gate (on 4 cores or fewer, after the test
//      suites instead, each 4-player run one process)
//   3. the backlog lists re-marked against the build and any sample-deck
//      stand-in for a card now in the pool dropped
//   4. typecheck (the engine's tests included — vitest never type-checks a
//      test, so a wrong chooser signature or a cast could make one pass
//      without testing) + lint, side by side
//   5. the engine suite (a worker per core, at most 8), then server + client
//      side by side
//   6. card:verify against the Oracle snapshot (offline)
//
// Steps 1, 2, 4 and 5 stop the run on failure (later results would mean
// nothing), stopping the background runs too; the rest all run, and the exit
// code is 1 if anything failed. Logs go to the OS temp dir, one per step,
// named in the output.
//
// "Cards this change adds" are the pool files not yet on the upstream branch
// — committed since it, or not committed at all — so a batch committed
// locally before verifying is still forced into the fuzzer.
//
// **Full or quick.** A full run every few card batches is enough: on its
// own, `verify` decides. It reads the batch number of the last full run from
// `scripts/verify-state.json` (committed, so it outlives a session) and the
// newest batch record (`engine/data/sweep-3/B<N>.json`); three batches or
// more since, it runs everything and, if everything passed, writes the newest
// batch number back — commit the file with the batch. Otherwise it runs
// quick: no plain fuzzer and no bot gate (the fuzzer with the new cards forced
// in still runs, at half its games), and the server and client suites only
// when the change touches `server/`, `client/` or `protocol/` — the bot gate
// too when it touches the bots (`engine/src/bot/`, `controller.ts`,
// `effect-worth.ts`, `target-polarity.ts`). `--full` or `--quick` forces one.
//
// Usage: node scripts/verify.mjs [--full | --quick] [--with "Card Name"]... [--skip step,step]
//   steps for --skip: marks, lint, server, client, cardverify,
//   fuzz, fuzzwith, gate
//   --games N   2-player fuzz games (default 60; 4-player gets half)

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENGINE = path.join(ROOT, "engine");
const LOGS = os.tmpdir();
/** A long `--with` list as a file, one name per line (`--with-file`). */
const withFile = (names) => {
  const file = path.join(LOGS, "verify-with-cards.txt");
  writeFileSync(file, names.join("\n"));
  return file;
};

const args = process.argv.slice(2);
const withNames = [];
let skip = new Set();
let games = 60;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--with") withNames.push(args[++i]);
  else if (args[i] === "--skip") skip = new Set(args[++i].split(","));
  else if (args[i] === "--games") games = Number(args[++i]);
}
const forced = args.includes("--full") ? "full" : args.includes("--quick") ? "quick" : null;

const failures = [];
const started = Date.now();
const secs = (t) => `${Math.round((Date.now() - t) / 1000)}s`;

/** Every step still running — the background ones, when a failure stops
 * the run. */
const live = new Set();
function stopLive() {
  for (const child of live) {
    // npm and npx run through a shell, whose children `kill` would leave
    // running on Windows: take the whole tree.
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
    else child.kill();
  }
  live.clear();
}

/** Run `cmd args` (a shell only for npm/npx, whose Windows shims need one),
 * logging to a temp file. Resolves to { ok, log, out }. */
function run(name, cmd, cmdArgs, cwd = ROOT) {
  const log = path.join(LOGS, `verify-${name}.txt`);
  const t = Date.now();
  const useShell = cmd === "npm" || cmd === "npx";
  // A shell gets one command string (Node warns on args beside shell: true);
  // only npm/npx need it, and their arguments here are fixed, never a card name.
  const line = [cmd, ...cmdArgs.map((a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a))].join(" ");
  return new Promise((resolve) => {
    const child = useShell
      ? spawn(line, { cwd, shell: true, env: process.env })
      : spawn(cmd, cmdArgs, { cwd, env: process.env });
    live.add(child);
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => {
      live.delete(child);
      writeFileSync(log, out);
      resolve({ name, ok: code === 0, log, out, time: secs(t) });
    });
  });
}

function report(r, summary = "") {
  console.log(`${r.ok ? "✓" : "✗"} ${r.name} (${r.time})${summary ? `  ${summary}` : ""}${r.ok ? "" : `  — log: ${r.log}`}`);
  if (!r.ok) {
    failures.push(r.name);
    console.log(r.out.split("\n").filter(Boolean).slice(-15).map((l) => `    ${l}`).join("\n"));
  }
}

const grab = (out, re) => out.split("\n").filter((l) => re.test(l)).map((l) => l.trim()).join("; ");

async function stopOnFailure(...results) {
  for (const r of results) report(r);
  if (results.some((r) => !r.ok)) stop();
}

function stop() {
  stopLive();
  console.log(`\nStopped: ${failures.join(", ")} failed (${secs(started)}).`);
  process.exit(1);
}

/** Pool cards this change adds: files under engine/src/cards/pool not on the
 * upstream branch — added in a commit since it, or not committed yet. */
function addedCards() {
  const git = (...a) => spawnSync("git", a, { cwd: ROOT, encoding: "utf8" });
  const pool = "engine/src/cards/pool";
  const files = git("status", "--porcelain", "--", pool)
    .stdout.split("\n")
    .filter((line) => /^(\?\?|A )/.test(line))
    .map((line) => line.slice(3).trim());
  const upstream = git("rev-parse", "--verify", "--quiet", "@{upstream}");
  if (upstream.status === 0) {
    files.push(...git("diff", "--name-only", "--diff-filter=A", "@{upstream}", "HEAD", "--", pool).stdout.split("\n"));
  }
  const names = [];
  for (const rel of new Set(files.map((f) => f.trim()).filter(Boolean))) {
    const file = path.join(ROOT, rel);
    if (!file.endsWith(".ts") || !existsSync(file)) continue;
    const source = readFileSync(file, "utf8");
    // A Room's whole card is `roomCard("Name", left, right)`, with no `name:`.
    const m = /^\s*name:\s*"((?:[^"\\]|\\.)*)"/m.exec(source) ?? /roomCard\(\s*"((?:[^"\\]|\\.)*)"/.exec(source);
    if (m === null) continue;
    const name = JSON.parse(`"${m[1]}"`);
    // A double-faced card's back face, or a split card's half, has its own
    // file but isn't a card a deck can hold: the faces list's first name (the
    // front face, the whole split card — also new) stands for it. The list is
    // inline (`faces: [...]`) or a `const FACES = [...]` the file shares.
    const front = /^\s*(?:faces:|const FACES =)\s*\[\s*"((?:[^"\\]|\\.)*)"/m.exec(source);
    if (front !== null && JSON.parse(`"${front[1]}"`) !== name) continue;
    // Nor is a prepare spell that is no card of its own (rule 722 — Enroot):
    // the preparation card that names it (also new) brings it into games.
    if (/^\s*prepareSpellOnly:\s*true/m.test(source)) continue;
    names.push(name);
  }
  return names;
}

// ------------------------------------------------------------------ run

/** Files this change touches: uncommitted, or committed since the upstream
 * branch — `null` with no upstream (then everything counts as touched). */
function changedFiles() {
  const git = (...a) => spawnSync("git", a, { cwd: ROOT, encoding: "utf8" });
  if (git("rev-parse", "--verify", "--quiet", "@{upstream}").status !== 0) return null;
  const files = git("status", "--porcelain").stdout.split("\n").map((l) => l.slice(3).trim());
  files.push(...git("diff", "--name-only", "@{upstream}", "HEAD").stdout.split("\n"));
  return [...new Set(files.filter(Boolean))];
}

const STATE = path.join(ROOT, "scripts", "verify-state.json");
/** The newest batch record's number (`engine/data/sweep-3/B<N>.json`). */
const newestBatch = () =>
  Math.max(
    0,
    ...readdirSync(path.join(ENGINE, "data", "sweep-3"))
      .map((f) => /^B(\d+)\.json$/.exec(f))
      .filter(Boolean)
      .map((m) => Number(m[1])),
  );
const lastFull = existsSync(STATE) ? (JSON.parse(readFileSync(STATE, "utf8")).lastFullBatch ?? 0) : 0;
const EVERY = 3;
const batch = newestBatch();
const mode = forced ?? (batch - lastFull >= EVERY ? "full" : "quick");
let fuzzWithGames = 40;
if (mode === "quick") {
  const touched = changedFiles();
  const touches = (re) => touched === null || touched.some((f) => re.test(f));
  skip.add("fuzz");
  fuzzWithGames = 20;
  if (!touches(/^engine\/src\/(bot\/|controller\.ts|effect-worth\.ts|target-polarity\.ts)/)) skip.add("gate");
  if (!touches(/^(server|protocol)\//)) skip.add("server");
  if (!touches(/^(client|protocol)\//)) skip.add("client");
}
console.log(
  `verify: ${mode}${forced ? "" : ` (last full run at batch ${lastFull}, newest batch ${batch}; full every ${EVERY})`}`,
);

const cards = [...new Set([...withNames, ...addedCards()])];
console.log(`verify: ${cards.length ? `new/forced cards: ${cards.join(", ")}` : "no new cards"}${skip.size ? `; skipping ${[...skip].join(", ")}` : ""}\n`);

await stopOnFailure(await run("gen:cards", "npm", ["run", "-s", "gen:cards", "-w", "engine"]));
await stopOnFailure(await run("build", "npm", ["run", "build"]));

// The fuzzers and the bot gate need only the build: they run in the
// background beside everything from here on, and report at the end.
// Four-player games get CI's 120 s each rather than the fuzzer's default 30:
// one runs ~25 s alone (2026-10-14), and here they share the machine with
// the test suites, the other fuzz runs and the bot gate, so 30 s timed out
// games that finish.
const FOUR_PLAYER_TIMEOUT = ["--timeout", "120"];
const late = [];
// A small machine (a 4-core cloud session) can't hold the engine suite's
// workers beside five fuzz and gate processes: the suite was killed for memory
// there (2026-10-25), and the server suite's timed tests timed out beside
// them. The background runs wait for the three suites instead, and a
// 4-player run stays one process.
const CORES = os.availableParallelism();
const SMALL = CORES <= 4;
let startLate = () => {};
const background = (start) => {
  if (SMALL) {
    const before = startLate;
    startLate = () => {
      before();
      start();
    };
  } else start();
};
/** A 4-player run of `count` games, as two processes over halves of its
 * seeds (`--start`): the same games, in about half the time — it's the
 * longest step, and the machine has the cores. */
const fourPlayer = (name, count, extra) => {
  const half = SMALL ? count : Math.ceil(count / 2);
  return [
    [1, half],
    [half + 1, count - half],
  ]
    .filter(([, n]) => n > 0)
    .map(([start, n], i) =>
      run(
        SMALL ? name : `${name} (${i + 1} of 2)`,
        "node",
        ["scripts/random-demo.mjs", "--games", String(n), "--start", String(start), "--players", "4", ...FOUR_PLAYER_TIMEOUT, ...extra],
        ENGINE,
      ),
    );
};
if (!skip.has("fuzz")) {
  background(() => {
    late.push(run("fuzz 2p", "node", ["scripts/random-demo.mjs", "--games", String(games)], ENGINE));
    late.push(...fourPlayer("fuzz 4p", Math.ceil(games / 2), []));
  });
}
if (!skip.has("fuzzwith") && cards.length > 0) {
  background(() =>
    late.push(
      ...fourPlayer(
        "fuzz with new cards",
        fuzzWithGames,
        // A long list goes in a file: a command line has a length limit.
        cards.length > 40 ? ["--with-file", withFile(cards)] : cards.flatMap((c) => ["--with", c]),
      ),
    ),
  );
}
if (!skip.has("gate")) background(() => late.push(run("bot gate", "npm", ["run", "-s", "bot:scenarios", "-w", "engine"])));

if (!skip.has("marks")) {
  const marks = await Promise.all([
    run("cards:mark", "node", ["scripts/top-commander-cards.mjs", "--refresh"], ENGINE),
    run("cmdrs:mark", "node", ["scripts/top-commanders.mjs", "--refresh"], ENGINE),
  ]);
  for (const m of marks) report(m, grab(m.out, /implemented/));
  // A sample deck's stand-in for a card that's now in the pool goes (and
  // BACKLOG's count with it) — `sample-decks.test.ts` would fail on it.
  const subs = await run("stand-ins", "node", ["scripts/stand-ins.mjs", "--implemented"], ENGINE);
  report(subs, grab(subs.out, /Removed|No stand-in/));
}
await stopOnFailure(
  ...(await Promise.all([
    run("typecheck", "npm", ["run", "typecheck"]),
    ...(skip.has("lint") ? [] : [run("lint", "npm", ["run", "lint"])]),
  ])),
);

const engineTests = await run("engine tests", "npx", ["vitest", "run", `--maxWorkers=${Math.min(8, CORES)}`], ENGINE);
report(engineTests, grab(engineTests.out, /^\s*Tests\s/));
if (!engineTests.ok) stop();
// Side by side at 4 workers each — but on a small machine one after the
// other at vitest's default, or the server's timed capture tests run past
// their 5 s (they take 2 s alone; 2026-10-25).
const suite = (name, dir) => () =>
  run(name, "npx", ["vitest", "run", ...(SMALL ? [] : ["--maxWorkers=4"])], path.join(ROOT, dir));
const suites = [
  ...(skip.has("server") ? [] : [suite("server tests", "server")]),
  ...(skip.has("client") ? [] : [suite("client tests", "client")]),
];
const others = [];
if (SMALL) for (const s of suites) others.push(await s());
else others.push(...(await Promise.all(suites.map((s) => s()))));
for (const r of others) report(r, grab(r.out, /^\s*Tests\s/));
if (others.some((r) => !r.ok)) stop();
startLate();

if (!skip.has("cardverify")) {
  const r = await run("card:verify", "node", ["scripts/verify-cards.mjs", "--offline"], ENGINE);
  report(r, grab(r.out, /checked,/));
}

for (const r of await Promise.all(late)) report(r, grab(r.out, /games —|avg turns|\d+\/\d+ passed/));

console.log(failures.length === 0 ? `
All green (${secs(started)}).` : `
Failed: ${failures.join(", ")} (${secs(started)}).`);
// A full run that passed is the one the next quick runs count from.
if (failures.length === 0 && mode === "full" && skip.size === 0) {
  writeFileSync(STATE, JSON.stringify({ lastFullBatch: batch, date: new Date().toISOString().slice(0, 10) }, null, 1) + "\n");
  console.log(`Recorded a full run at batch ${batch} in scripts/verify-state.json — commit it.`);
}
process.exit(failures.length === 0 ? 0 : 1);
