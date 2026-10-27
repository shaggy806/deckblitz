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
// quick: no plain fuzzer and no bot gate (the fuzzer with the new cards forced
// in still runs, at half its games), and the server and client suites only
// when the change touches `server/`, `client/` or `protocol/` — the bot gate
// too when it touches the bots (`engine/src/bot/`, `controller.ts`,
// `effect-worth.ts`, `target-polarity.ts`). `--full` or `--quick` forces one.
// A full run skips the plain fuzzer and the bot gate too when nothing but
// cards has changed since the last full run (`lastFullCommit` in the state
// file): over batches 173-175 they found nothing a card batch broke — the
// new-cards fuzzer found both bugs — and CI fuzzes every push to main anyway.
//
// **The new-cards fuzzer, early.** It is the step that finds bugs, and on a
// small machine it runs last, alone, for 5-10 minutes. `--fuzz-new` runs just
// it (gen:cards, build, then the fuzzer) as soon as a batch's cards are
// written, while the lead writes the batch record; on a pass it leaves a stamp
// in the OS temp dir naming the cards, their files and the engine source it
// ran against, and a later verify skips the step while all three still match
// (a merge that brings engine code in, or an edited card, runs it again).
//
// Usage: node scripts/verify.mjs [--full | --quick | --fuzz-new] [--with "Card Name"]...
//                                [--skip step,step | --only step,step] [--games N]
//   steps for --skip / --only: marks, lint, server, client, cardverify,
//   fuzz, fuzzwith, gate (gen:cards, build, typecheck and the engine suite
//   always run; `--only fuzzwith` re-checks a fix to what that step found)
//   --games N   2-player fuzz games (default 60; 4-player gets half)

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

const USAGE = `usage: node scripts/verify.mjs [--full | --quick | --fuzz-new] [--with "Card Name"]...
                               [--skip step,step | --only step,step] [--games N]
  steps: ${"marks, lint, server, client, cardverify, fuzz, fuzzwith, gate"}`;
const STEPS = new Set(["marks", "lint", "server", "client", "cardverify", "fuzz", "fuzzwith", "gate"]);
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
  else if (a === "--games") games = Number(args[++i]);
  else if (a === "--help" || a === "-h") {
    console.log(USAGE);
    process.exit(0);
  } else if (!["--full", "--quick", "--fuzz-new"].includes(a)) {
    console.error(`verify: unknown argument ${a}\n${USAGE}`);
    process.exit(2);
  }
}
const forced = args.includes("--full") ? "full" : args.includes("--quick") ? "quick" : null;
const fuzzNewOnly = args.includes("--fuzz-new");
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
  (/^engine\/src\//.test(f) && !CARD_DATA.test(f)) || /^engine\/scripts\/(random-|fuzz-decks)/.test(f);

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
let fuzzWithGames = 40;
if (mode === "fuzz-new") {
  for (const step of STEPS) if (step !== "fuzzwith") skip.add(step);
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
  fuzzWithGames = 20;
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
// The new-cards fuzzer already passed on these cards and this engine code
// (`--fuzz-new`, earlier in this session): not again.
const key = cards.length > 0 ? fuzzKey(cards) : null;
let stamped = false;
if (!fuzzNewOnly && !skip.has("fuzzwith") && key !== null && existsSync(FUZZ_STAMP)) {
  const stamp = JSON.parse(readFileSync(FUZZ_STAMP, "utf8"));
  if (stamp.key === key && stamp.games >= fuzzWithGames) {
    skip.add("fuzzwith");
    stamped = true;
  }
}
console.log(`verify: ${cards.length ? `new/forced cards: ${cards.join(", ")}` : "no new cards"}${skip.size ? `; skipping ${[...skip].join(", ")}` : ""}`);
if (stamped) console.log(`verify: the new-cards fuzzer passed on these cards and this engine code earlier (--fuzz-new): not run again`);
console.log("");

// The machine to itself (`machine-slots.mjs`): the engine suite alone is
// ~18.5 GB, so a verify waits for any other on the machine and for the
// typechecks and builds already running, and holds new ones off until it's
// done. `--fuzz-new` is a build and two fuzzer processes: one slot.
const held = fuzzNewOnly ? await takeSlot((m) => console.log(m)) : await takeMachine();
process.on("exit", () => release(held));

await stopOnFailure(await run("gen:cards", "npm", ["run", "-s", "gen:cards", "-w", "engine"]));
await stopOnFailure(await run("build", "npm", ["run", "build"]));

if (fuzzNewOnly) {
  // Alone on the machine, so split in two even on a small one, at the games a
  // full run plays (which covers a quick run's too).
  const half = Math.ceil(40 / 2);
  const forcedArgs = cards.length > 40 ? ["--with-file", withFile(cards)] : cards.flatMap((c) => ["--with", c]);
  const runs = await Promise.all(
    [
      [1, half],
      [half + 1, 40 - half],
    ].map(([start, n], i) =>
      run(`fuzz with new cards (${i + 1} of 2)`, "node", ["scripts/random-demo.mjs", "--games", String(n), "--start", String(start), "--players", "4", "--timeout", "120", ...forcedArgs], ENGINE),
    ),
  );
  for (const r of runs) report(r, grab(r.out, /games —|avg turns|FAILED seed/));
  if (failures.length === 0) {
    writeFileSync(FUZZ_STAMP, JSON.stringify({ key, games: 40, cards, date: new Date().toISOString() }) + "\n");
    console.log(`\nThe new-cards fuzzer passed (${secs(started)}): verify skips it while these cards and the engine code stay as they are.`);
  } else console.log(`\nFailed: ${failures.join(", ")} (${secs(started)}).`);
  process.exit(failures.length === 0 ? 0 : 1);
}

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
    // On a small machine a 2-player game beside the 4-player runs can pass
    // the default 30 s too (one took 18 s alone, 2026-10-25).
    late.push(
      run("fuzz 2p", "node", ["scripts/random-demo.mjs", "--games", String(games), ...(SMALL ? ["--timeout", "60"] : [])], ENGINE),
    );
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

// A larger heap for vitest's main process: it holds the whole bundled card
// barrel, and past ~21,400 definitions it ran out of the default ~2 GB at
// startup on a cloud session (2026-10-26).
const vitestArgs = ["--max-old-space-size=4096", path.join(ROOT, "node_modules/vitest/vitest.mjs"), "run"];
let engineTests = await run("engine tests", "node", [...vitestArgs, `--maxWorkers=${Math.min(8, CORES)}`], ENGINE);
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

for (const r of await Promise.all(late)) report(r, grab(r.out, /games —|avg turns|\d+\/\d+ passed/));

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
