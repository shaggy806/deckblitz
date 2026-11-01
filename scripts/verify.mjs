#!/usr/bin/env node
// Everything a card or engine change must pass before it ships, in one
// command, in the order that fails fastest — the checks the `ship` skill
// lists, run for you. Node, not bash: a CRLF checkout breaks a shell script.
//
//   1. gen:cards (the card barrel and shards)
//   2. build (every workspace) — and, from here on, in the background beside
//      everything below (they need only the build): the fuzzer at 2 and 4
//      players; for every card this change adds (or `--with` names), the
//      situation fuzzer (`situation-fuzz.mjs`: each card cast or activated
//      in small random boards, `SITUATIONS`) and a few 4-player games with
//      them forced in (at most 10 a deck: `fuzzWithPlan`), stopped at turn
//      `MAX_TURNS` (and `UNCAPPED` more played out in a full run); each
//      4-player run as two processes over halves of its seeds; and the bot
//      gate (on 4 cores or fewer, after the test suites instead, each
//      4-player run one process)
//   3. the backlog lists re-marked against the build and any sample-deck
//      stand-in for a card now in the pool dropped
//   4. typecheck (the engine's tests included — vitest never type-checks a
//      test, so a wrong chooser signature or a cast could make one pass
//      without testing) + lint, side by side
//   5. the engine suite (a worker per core, at most 8), then server + client
//      side by side
//   6. card:verify against the Oracle snapshot (offline)
//
// Before step 1 it takes the machine (`machine-slots.mjs`): one verify at a
// time, with no typecheck or build beside it — several sessions on one PC
// share it (the `author-walks-local` skill).
//
// Steps 1, 2, 4 and 5 stop the run on failure (later results would mean
// nothing), stopping the background runs too; the rest all run, and the exit
// code is 1 if anything failed. Logs go to the OS temp dir, one per step,
// named in the output.
//
// "Cards this change adds" are the pool files not yet on `origin/main` (the
// upstream branch where there's no `origin/main`) — committed since it, or not
// committed at all — so a batch committed locally before verifying is still
// forced into the fuzzer. Main, not the upstream: a cloud session pushes its
// own branch after every commit (the stop hook asks it to), so by the time it
// verifies, its upstream already holds the batch and nothing would count as
// new (batch 156's first verify skipped the new-cards fuzzer that way).
//
// **Full or quick.** A full run every few card batches is enough: on its
// own, `verify` decides. It reads the batch number of the last full run from
// `scripts/verify-state.json` (committed, so it outlives a session) and the
// newest batch record (`engine/data/sweep-3/B<N>.json`); three batches or
// more since, it runs everything and, if everything passed, writes the newest
// batch number back — commit the file with the batch. Otherwise it runs
// quick: no plain fuzzer and no bot gate (the new-card checks still run, at
// fewer scenarios and games), and the server and client suites only
// when the change touches `server/`, `client/` or `protocol/` — the bot gate
// too when it touches the bots (`engine/src/bot/`, `controller.ts`,
// `effect-worth.ts`, `target-polarity.ts`). `--full` or `--quick` forces one.
// A full run skips the plain fuzzer and the bot gate too when nothing but
// cards has changed since the last full run (`lastFullCommit` in the state
// file): over batches 173-175 they found nothing a card batch broke — the
// new-cards fuzzer found both bugs — and CI fuzzes every push to main anyway.
//
// **The new-card checks, early.** They are the steps that find bugs, and on a
// small machine they run last, alone. `--fuzz-new` runs just them (gen:cards,
// build, then the situation fuzzer and the new-cards fuzzer, at a full run's
// size) as soon as a batch's cards are written, while the lead writes the
// batch record; on a pass it leaves a stamp in the OS temp dir naming the
// cards, their files and the engine source they ran against, and a later
// verify skips each step the stamp covers while all three still match (a
// merge that brings engine code in, or an edited card, runs them again).
//
// Usage: node scripts/verify.mjs [--full | --quick | --fuzz-new | --landing] [--with "Card Name"]...
//                                [--skip step,step | --only step,step] [--games N]
//   steps for --skip / --only: marks, lint, server, client, cardverify,
//   fuzz, situations, fuzzwith, gate (gen:cards, build, typecheck and the
//   engine suite always run; `--only situations` re-checks a fix to what
//   that step found)
//   --games N   2-player fuzz games (default 60; 4-player gets half)
//   --landing   the landing lock's check after a merge: --only marks,situations,fuzzwith,
//               and the engine suite cut to its pool-wide tests and the
//               merge's test files when the merge brought no engine code

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { release, takeMachine, takeSlot } from "./machine-slots.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENGINE = path.join(ROOT, "engine");
const LOGS = os.tmpdir();
/** A long `--with` list as a file, one name per line (`--with-file`). */
const withFile = (names) => {
  const file = path.join(LOGS, "verify-with-cards.txt");
  writeFileSync(file, names.join("\n"));
  return file;
};

/** The situation fuzzer's scenarios per new card (`situation-fuzz.mjs`): the
 * main per-card check since 2026-10-31 — each card played in small random
 * boards, cast or activated at once, ~0.4 s a scenario at 4-6 workers. */
const SITUATIONS = { full: 100, quick: 60 };
/** The new-cards fuzzer beside it, cut down once the situation fuzzer took
 * over the per-card check: whole 4-player games, which average 80-130 turns
 * because random players rarely finish anyone off — so quick and full runs
 * stop each game at `MAX_TURNS` (a draw by turn cap), and a full run adds
 * `UNCAPPED` games played to the end, for what only a whole game reaches
 * (decking, a game's end, commander damage). Before (2026-10-31): 20 games
 * quick, 40 full, all uncapped — 100-200 s a half. */
const FUZZ_WITH = { full: 12, quick: 8 };
const MAX_TURNS = 60;
const UNCAPPED = 4;

/** The new-cards fuzzer's games for `cards` at `games` (`FUZZ_WITH`):
 * at most PER_DECK new cards in a deck. Up to PER_DECK, every card is in every
 * seat's deck in all `games` games, as always. A longer list (several features
 * landed between pushes) is packed into groups of like colour identity, one
 * group per game in turn (`random-demo.mjs --per-deck`), at `games` games in
 * all (rounded up to a whole number per group), so neither the game count nor
 * a game's deck grows with the list — but never fewer than MIN_SHARE of
 * `games` per card (beyond 40 cards the total grows by that): every card stays
 * in several games, in every seat's deck. Forcing all 25 of a list into one
 * deck took a commander of their whole identity (five colours) and made a deck
 * a quarter new cards. Measured on 25 cards, quick (2026-10-31): 20 games of
 * all 25, 28.6 s a game (one timed out at 120 s); 21 games in groups of 9, 9
 * and 7, 25.7 s a game — a game's length is mostly its seed's luck, so what
 * this buys is the bound, not a faster step. Twice the games (each card in 14)
 * took 444 s against 297 s, so the total stays at `games`. `games` is what
 * the stamp records. */
const PER_DECK = 10;
const MIN_SHARE = 1 / 4;
function fuzzWithPlan(cards, games) {
  const names = cards.length > 40 ? ["--with-file", withFile(cards)] : cards.flatMap((c) => ["--with", c]);
  const groups = Math.ceil(cards.length / PER_DECK);
  if (groups <= 1) return { total: games, perCard: games, args: names };
  const perCard = Math.max(Math.ceil(games * MIN_SHARE), Math.ceil(games / groups));
  return { total: groups * perCard, perCard, args: [...names, "--per-deck", String(PER_DECK)] };
}

const USAGE = `usage: node scripts/verify.mjs [--full | --quick | --fuzz-new | --landing] [--with "Card Name"]...
                               [--skip step,step | --only step,step] [--games N]
  steps: ${"marks, lint, server, client, cardverify, fuzz, situations, fuzzwith, gate"}`;
const STEPS = new Set(["marks", "lint", "server", "client", "cardverify", "fuzz", "situations", "fuzzwith", "gate"]);
const args = process.argv.slice(2);
const withNames = [];
let skip = new Set();
let only = null;
let games = 60;
const stepList = (value, flag) => {
  const list = (value ?? "").split(",").filter(Boolean);
  const bad = list.filter((s) => !STEPS.has(s));
  if (list.length === 0 || bad.length > 0) {
    console.error(`verify: ${flag} takes steps from: ${[...STEPS].join(", ")}${bad.length ? ` (not ${bad.join(", ")})` : ""}`);
    process.exit(2);
  }
  return new Set(list);
};
// An unknown flag stops here rather than starting a run (a `--help` once
// started a full one).
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--with") withNames.push(args[++i]);
  else if (a === "--skip") skip = stepList(args[++i], "--skip");
  else if (a === "--only") only = stepList(args[++i], "--only");
  else if (a === "--landing") only = new Set(["marks", "situations", "fuzzwith"]);
  else if (a === "--games") games = Number(args[++i]);
  else if (a === "--help" || a === "-h") {
    console.log(USAGE);
    process.exit(0);
  } else if (!["--full", "--quick", "--fuzz-new", "--landing"].includes(a)) {
    console.error(`verify: unknown argument ${a}\n${USAGE}`);
    process.exit(2);
  }
}
const forced = args.includes("--full") ? "full" : args.includes("--quick") ? "quick" : null;
const fuzzNewOnly = args.includes("--fuzz-new");
const landing = args.includes("--landing");
/** A step left out by hand: such a full run isn't recorded as one. */
const userSkipped = skip.size > 0 || only !== null;
if (only !== null) for (const step of STEPS) if (!only.has(step)) skip.add(step);

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

/** What "this change" is measured from: `origin/main`, else the upstream
 * branch, else `null`. */
function baseRef() {
  for (const ref of ["origin/main", "@{upstream}"]) {
    if (spawnSync("git", ["rev-parse", "--verify", "--quiet", ref], { cwd: ROOT }).status === 0) return ref;
  }
  return null;
}

/** `spawnSync`'s output limit for git's file lists: its 1 MB default cut
 * `ls-files` over engine/src off mid-path once the pool passed ~24,000 card
 * files (2026-10-26), and the cut-off path named a directory. */
const GIT_MAX_BUFFER = 256 * 1024 * 1024;

/** Pool cards this change adds: files under engine/src/cards/pool not on the
 * base (`baseRef`) — added in a commit since it, or not committed yet. Each
 * card's name, with every file read for it in `addedFiles`. */
const addedFiles = [];
function addedCards() {
  const git = (...a) => spawnSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: GIT_MAX_BUFFER });
  const pool = "engine/src/cards/pool";
  const files = git("status", "--porcelain", "--", pool)
    .stdout.split("\n")
    .filter((line) => /^(\?\?|A )/.test(line))
    .map((line) => line.slice(3).trim());
  const base = baseRef();
  if (base !== null) {
    files.push(...git("diff", "--name-only", "--diff-filter=A", `${base}...HEAD`, "--", pool).stdout.split("\n"));
  }
  const names = [];
  for (const rel of new Set(files.map((f) => f.trim()).filter(Boolean))) {
    const file = path.join(ROOT, rel);
    if (!file.endsWith(".ts") || !existsSync(file)) continue;
    const source = readFileSync(file, "utf8");
    addedFiles.push(rel);
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
    // Nor is a melded permanent's combined back face (rule 712.4a — Chittering
    // Host): its two front cards bring it into games.
    if (/^\s*meldOf:\s*\[/m.test(source)) continue;
    names.push(name);
  }
  return names;
}

// ------------------------------------------------------------------ run

/** Files this change touches: uncommitted, or committed since the base
 * (`baseRef`) — `null` with no base (then everything counts as touched). */
function changedFiles() {
  const git = (...a) => spawnSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: GIT_MAX_BUFFER });
  const base = baseRef();
  if (base === null) return null;
  const files = git("status", "--porcelain").stdout.split("\n").map((l) => l.slice(3).trim());
  files.push(...git("diff", "--name-only", `${base}...HEAD`).stdout.split("\n"));
  return [...new Set(files.filter(Boolean))];
}

/** Engine code that isn't card data: everything under `engine/src` but the
 * pool, the tokens, the scaffolds, the generated barrel and shards, the
 * card lists, and tests — plus the fuzzer's own scripts. */
const CARD_DATA = /^engine\/src\/(cards\/(pool|tokens|scaffold|shards)\/|cards\/generated[^/]*\.ts$|cards\/[^/]*\.(txt|json|md)$|test\/|sample-decks\.ts$)|\.test\.ts$/;
const isEngineCode = (f) =>
  (/^engine\/src\//.test(f) && !CARD_DATA.test(f)) || /^engine\/scripts\/(random-|fuzz-decks|situation-|worker-)/.test(f);

/** Files changed since `ref` (committed or not), or `null` if `ref` isn't a
 * commit this checkout has. */
function changedSince(ref) {
  if (typeof ref !== "string" || spawnSync("git", ["cat-file", "-e", `${ref}^{commit}`], { cwd: ROOT }).status !== 0) return null;
  const git = (...a) => spawnSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: GIT_MAX_BUFFER }).stdout.split("\n");
  return [...new Set([...git("diff", "--name-only", ref), ...git("ls-files", "--others", "--exclude-standard")].filter(Boolean))];
}

/** What the new-cards fuzzer ran against: the forced cards, their files'
 * contents and the engine code's (`isEngineCode`), as one hash. */
function fuzzKey(cards) {
  const hash = createHash("sha1");
  hash.update(JSON.stringify([...cards].sort()));
  const files = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "engine/src", "engine/scripts"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: GIT_MAX_BUFFER,
  })
    .stdout.split("\n")
    .filter((f) => f && isEngineCode(f));
  for (const f of [...new Set([...files, ...addedFiles])].sort()) {
    const file = path.join(ROOT, f);
    if (!existsSync(file)) continue;
    hash.update(f);
    hash.update(readFileSync(file));
  }
  return hash.digest("hex");
}
const FUZZ_STAMP = path.join(LOGS, "verify-fuzzwith-pass.json");

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
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
const lastFull = state.lastFullBatch ?? 0;
const EVERY = 3;
const batch = newestBatch();
const mode = fuzzNewOnly ? "fuzz-new" : (forced ?? (batch - lastFull >= EVERY ? "full" : "quick"));
let fuzzWithGames = FUZZ_WITH.full;
let situationScenarios = SITUATIONS.full;
if (mode === "fuzz-new") {
  for (const step of STEPS) if (step !== "fuzzwith" && step !== "situations") skip.add(step);
} else if (mode === "full" && forced === null) {
  // Only cards since the last full run: the plain fuzzer and the bot gate
  // have nothing new to find (see the header).
  const since = changedSince(state.lastFullCommit);
  if (since !== null && !since.some(isEngineCode)) {
    skip.add("fuzz");
    if (!since.some((f) => /^engine\/src\/(bot\/|controller\.ts|effect-worth\.ts|target-polarity\.ts)/.test(f))) skip.add("gate");
    console.log(`verify: nothing but cards since the last full run (${state.lastFullCommit.slice(0, 8)}): no plain fuzzer${skip.has("gate") ? " or bot gate" : ""}`);
  }
} else if (mode === "quick") {
  const touched = changedFiles();
  const touches = (re) => touched === null || touched.some((f) => re.test(f));
  skip.add("fuzz");
  fuzzWithGames = FUZZ_WITH.quick;
  situationScenarios = SITUATIONS.quick;
  if (!touches(/^engine\/src\/(bot\/|controller\.ts|effect-worth\.ts|target-polarity\.ts)/)) skip.add("gate");
  if (!touches(/^(server|protocol)\//)) skip.add("server");
  if (!touches(/^(client|protocol)\//)) skip.add("client");
}
console.log(
  `verify: ${mode}${forced || fuzzNewOnly ? "" : ` (last full run at batch ${lastFull}, newest batch ${batch}; full every ${EVERY})`}`,
);

const cards = [...new Set([...withNames, ...addedCards()])];
if (fuzzNewOnly && cards.length === 0) {
  console.error("verify --fuzz-new: no new cards (commit or write the batch's card files first, or name them with --with)");
  process.exit(2);
}
// The new-card checks already passed on these cards and this engine code
// (`--fuzz-new`, earlier in this session): not again. Each step on its own:
// a stamp from before the situation fuzzer has no `scenarios`.
const key = cards.length > 0 ? fuzzKey(cards) : null;
const stamped = [];
if (!fuzzNewOnly && key !== null && existsSync(FUZZ_STAMP)) {
  const stamp = JSON.parse(readFileSync(FUZZ_STAMP, "utf8"));
  if (stamp.key === key) {
    if (!skip.has("fuzzwith") && stamp.games >= fuzzWithGames && (mode !== "full" || (stamp.uncapped ?? 0) >= UNCAPPED)) stamped.push("fuzzwith");
    if (!skip.has("situations") && (stamp.scenarios ?? 0) >= situationScenarios) stamped.push("situations");
    for (const step of stamped) skip.add(step);
  }
}
console.log(`verify: ${cards.length ? `new/forced cards: ${cards.join(", ")}` : "no new cards"}${skip.size ? `; skipping ${[...skip].join(", ")}` : ""}`);
if (stamped.length > 0) console.log(`verify: ${stamped.join(" and ")} passed on these cards and this engine code earlier (--fuzz-new): not run again`);
console.log("");

// The machine to itself (`machine-slots.mjs`): the engine suite alone is
// ~18.5 GB, so a verify waits for any other on the machine and for the
// typechecks and builds already running, and holds new ones off until it's
// done. `--fuzz-new` is a build, then the situation fuzzer's four workers
// beside three fuzzer processes (~7 GB together): one slot.
const held = fuzzNewOnly ? await takeSlot((m) => console.log(m)) : await takeMachine();
process.on("exit", () => release(held));

await stopOnFailure(await run("gen:cards", "npm", ["run", "-s", "gen:cards", "-w", "engine"]));
await stopOnFailure(await run("build", "npm", ["run", "build"]));

// Four-player games get CI's 120 s each rather than the fuzzer's default 30:
// one runs ~25 s alone (2026-10-14), and here they share the machine with
// the test suites, the other fuzz runs and the bot gate, so 30 s timed out
// games that finish.
const FOUR_PLAYER_TIMEOUT = ["--timeout", "120"];
// A small machine (a 4-core cloud session) can't hold the engine suite's
// workers beside five fuzz and gate processes: the suite was killed for memory
// there (2026-10-25), and the server suite's timed tests timed out beside
// them. The background runs wait for the three suites instead, and a
// 4-player run stays one process.
const CORES = os.availableParallelism();
const SMALL = CORES <= 4;
const cardArgs = () => (cards.length > 40 ? ["--with-file", withFile(cards)] : cards.flatMap((c) => ["--with", c]));

/** The situation fuzzer over the new cards: `scenarios` each, on `workers`
 * threads. */
const situationRun = (scenarios, workers) =>
  run("situations", "node", ["scripts/situation-fuzz.mjs", ...cardArgs(), "--scenarios", String(scenarios), "--workers", String(workers)], ENGINE);

/** The new-cards fuzzer's runs, each a thunk that starts it: `games` 4-player
 * games stopped at turn MAX_TURNS — as two processes over halves of its seeds
 * (`--start`) when `split`, the same games in about half the time — then
 * `uncapped` games played to the end, on the seeds after. */
function fuzzWithRuns(games, uncapped, split) {
  const plan = fuzzWithPlan(cards, games);
  if (plan.total !== games) console.log(`verify: ${cards.length} new cards, at most ${PER_DECK} a deck: ${plan.total} capped games, each card in ${plan.perCard}`);
  const one = (name, start, n, extra) => () =>
    run(name, "node", ["scripts/random-demo.mjs", "--games", String(n), "--start", String(start), "--players", "4", ...FOUR_PLAYER_TIMEOUT, ...plan.args, ...extra], ENGINE);
  const half = split ? Math.ceil(plan.total / 2) : plan.total;
  const parts = [
    [1, half],
    [half + 1, plan.total - half],
  ].filter(([, n]) => n > 0);
  const runs = parts.map(([start, n], i) =>
    one(`fuzz with new cards${parts.length > 1 ? ` (${i + 1} of ${parts.length})` : ""}`, start, n, ["--max-turns", String(MAX_TURNS)]),
  );
  if (uncapped > 0) runs.push(one("fuzz with new cards, uncapped", plan.total + 1, uncapped, []));
  return runs;
}
const FUZZ_SUMMARY = /games —|avg turns|FAILED seed/;
const SITUATION_SUMMARY = /scenarios, \d+ failed|^FAILED /;

if (fuzzNewOnly) {
  // Alone on the machine: everything at once, at what a full run plays
  // (which covers a quick run's too).
  const runs = await Promise.all([
    ...(cards.length > 0 ? [situationRun(SITUATIONS.full, Math.max(1, Math.min(4, CORES - 1)))] : []),
    ...fuzzWithRuns(FUZZ_WITH.full, UNCAPPED, true).map((start) => start()),
  ]);
  for (const r of runs) report(r, grab(r.out, r.name === "situations" ? SITUATION_SUMMARY : FUZZ_SUMMARY));
  if (failures.length === 0) {
    writeFileSync(
      FUZZ_STAMP,
      JSON.stringify({ key, games: FUZZ_WITH.full, uncapped: UNCAPPED, scenarios: SITUATIONS.full, cards, date: new Date().toISOString() }) + "\n",
    );
    console.log(`\nThe new-card checks passed (${secs(started)}): verify skips them while these cards and the engine code stay as they are.`);
  } else console.log(`\nFailed: ${failures.join(", ")} (${secs(started)}).`);
  process.exit(failures.length === 0 ? 0 : 1);
}

// The fuzzers and the bot gate need only the build: they run in the
// background beside everything from here on, and report at the end.
const late = [];
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
    // On a small machine a 2-player game beside the 4-player runs can pass
    // the default 30 s too (one took 18 s alone, 2026-10-25).
    late.push(
      run("fuzz 2p", "node", ["scripts/random-demo.mjs", "--games", String(games), ...(SMALL ? ["--timeout", "60"] : [])], ENGINE),
    );
    late.push(...fourPlayer("fuzz 4p", Math.ceil(games / 2), []));
  });
}
// The situation fuzzer beside the suites at 4 workers (the engine suite takes
// 8); on a small machine after them, on every core but one.
if (!skip.has("situations") && cards.length > 0) {
  background(() => late.push(situationRun(situationScenarios, SMALL ? Math.max(1, CORES - 1) : 4)));
}
if (!skip.has("fuzzwith") && cards.length > 0) {
  const runs = fuzzWithRuns(fuzzWithGames, mode === "full" ? UNCAPPED : 0, !SMALL);
  background(() => late.push(...runs.map((start) => start())));
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

/** `--landing`: the engine tests a merge needs. When everything since the
 * last merge's first parent (the branch's own tip, verified whole before the
 * lock) leaves the engine's source and config alone, no engine code changed
 * under the branch's tests, so they stand: the tests that read the whole pool (names,
 * shards, the bundle, the vocabulary, the decks and their stand-ins) run, and
 * the test files the merge brought, against this branch's engine. Anything
 * else, or no merge to measure from: `null`, the whole suite. B219's landing
 * check (2026-10-27) ran all 21,500 tests, ~10 minutes, under the lock. */
function landingTests() {
  const git = (...a) => spawnSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: GIT_MAX_BUFFER });
  // The newest merge on the first-parent line, a few commits back at most
  // (gen:cards' regenerated files may be committed after it).
  let base = null;
  for (let i = 0; i < 5 && base === null; i++) {
    const parents = git("rev-list", "--parents", "-n", "1", `HEAD~${i}`).stdout.trim().split(" ");
    if (parents.length === 0 || parents[0] === "") break;
    if (parents.length > 2) base = parents[1];
  }
  if (base === null) {
    console.log("verify --landing: no merge in the last 5 commits to measure from: the whole engine suite");
    return null;
  }
  const changed = git("diff", "--name-only", `${base}...HEAD`).stdout.split("\n").filter(Boolean);
  // What the engine's tests run against: its source and its config. Cards,
  // card data and tests aside, a change there means the whole suite. Client,
  // server and protocol code isn't in an engine test; the scaffolder's scripts
  // are, by their own test files, which run when they change.
  const CARD_SOURCE = [
    /^engine\/src\/cards\/(pool|tokens|shards|review|scaffold)\//,
    /^engine\/src\/cards\/generated[^/]*\.ts$/,
    /^engine\/src\/cards\/[^/]+\.(json|txt)$/,
    /^engine\/src\/.+\.test\.ts$/,
  ];
  const ENGINE_INPUT = [/^engine\/src\//, /^engine\/[^/]+\.(json|ts|mjs)$/, /^package(-lock)?\.json$/];
  const code = changed.filter((f) => ENGINE_INPUT.some((re) => re.test(f)) && !CARD_SOURCE.some((re) => re.test(f)));
  if (code.length > 0) {
    console.log(`verify --landing: the merge brought engine code (${code.slice(0, 3).join(", ")}${code.length > 3 ? ", …" : ""}): the whole engine suite`);
    return null;
  }
  const brought = changed
    .filter((f) => /^engine\/src\/.+\.test\.ts$/.test(f) && existsSync(path.join(ROOT, f)))
    .map((f) => f.slice("engine/".length));
  const scripts = changed.some((f) => /^engine\/scripts\//.test(f)) ? ["src/test/oracle-parse.test.ts"] : [];
  const POOL_WIDE = ["src/cards/pool.test.ts", "src/test/needs-vocabulary.test.ts", "src/test/sample-decks.test.ts", "src/test/precon-standins.test.ts", "src/test/local-bundle.test.ts"];
  console.log(`verify --landing: the merge brought no engine code: the pool-wide tests and the ${brought.length + scripts.length} test file(s) it brought or touched`);
  return [...new Set([...POOL_WIDE, ...scripts, ...brought])];
}

// A larger heap for vitest's main process: it holds the whole bundled card
// barrel, and past ~21,400 definitions it ran out of the default ~2 GB at
// startup on a cloud session (2026-10-26).
const vitestArgs = ["--max-old-space-size=4096", path.join(ROOT, "node_modules/vitest/vitest.mjs"), "run"];
const narrowed = landing ? landingTests() : null;
let engineTests = await run(
  narrowed ? "engine tests (cards-only merge)" : "engine tests",
  "node",
  [...vitestArgs, `--maxWorkers=${Math.min(8, CORES)}`, ...(narrowed ?? [])],
  ENGINE,
);
// Every failure a timeout: those files again, alone, once — not the whole
// suite. A random-games test that takes 17 s alone passed its 30 s under the
// full suite's load on a 4-core session, and B219 (2026-10-27) re-ran the
// whole `--only` check, ~15 minutes, for it. A timeout that recurs alone is
// a real failure.
const timedOutFiles = (out) => {
  const failed = Number(/^\s*Tests\s+(\d+) failed/m.exec(out)?.[1] ?? 0);
  const timeouts = (out.match(/Test timed out in \d+ms/g) ?? []).length;
  const files = [...new Set([...out.matchAll(/FAIL\s+(\S+\.test\.tsx?)/g)].map((m) => m[1]))];
  return failed > 0 && timeouts >= failed && files.length > 0 ? files : null;
};
const retryFiles = engineTests.ok ? null : timedOutFiles(engineTests.out);
if (retryFiles) {
  console.log(`  engine tests: only timeouts (${retryFiles.join(", ")}): re-running ${retryFiles.length === 1 ? "that file" : "those files"} alone`);
  const again = await run("engine tests (timeouts, alone)", "node", [...vitestArgs, "--maxWorkers=1", ...retryFiles], ENGINE);
  if (again.ok) {
    console.log(`  passed alone: a timeout under load, not a failure`);
    engineTests = { ...engineTests, ok: true };
  } else engineTests = again;
}
report(engineTests, grab(engineTests.out, /^\s*Tests\s/));
if (!engineTests.ok) stop();
// Side by side at 4 workers each — but on a small machine one after the
// other at vitest's default, or the server's timed capture tests run past
// their 5 s (they take 2 s alone; 2026-10-25).
// The server's suite loads the card barrel too, and past ~24,600 definitions
// its main process ran out of the default heap at startup as well (2026-10-27).
const suite = (name, dir) => () =>
  run(
    name,
    "node",
    ["--max-old-space-size=4096", path.join(ROOT, "node_modules/vitest/vitest.mjs"), "run", ...(SMALL ? [] : ["--maxWorkers=4"])],
    path.join(ROOT, dir),
  );
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

for (const r of await Promise.all(late)) report(r, grab(r.out, r.name === "situations" ? SITUATION_SUMMARY : /games —|avg turns|\d+\/\d+ passed/));

console.log(failures.length === 0 ? `
All green (${secs(started)}).` : `
Failed: ${failures.join(", ")} (${secs(started)}).`);
// A full run that passed is the one the next quick runs count from.
if (failures.length === 0 && mode === "full" && !userSkipped) {
  const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8", maxBuffer: GIT_MAX_BUFFER }).stdout.trim();
  writeFileSync(STATE, JSON.stringify({ lastFullBatch: batch, lastFullCommit: head, date: new Date().toISOString().slice(0, 10) }, null, 1) + "\n");
  console.log(`Recorded a full run at batch ${batch} in scripts/verify-state.json — commit it.`);
}
process.exit(failures.length === 0 ? 0 : 1);
