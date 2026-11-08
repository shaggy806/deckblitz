// A log of `bot:bench` results (data/bench-log.jsonl, checked in), so a session
// can start from the figure the last one ended on instead of playing the same
// games again.
//
// A result is only worth reusing for the same engine code on the same machine,
// so each entry records a hash of the engine's non-card source — `engine/src`
// without the tests and the card files — taken as the bench finished, whether
// or not that code had been committed yet. Card files are left out because a
// batch of new cards changes nothing about how the bench's games are played
// (the sample decks are in `sample-decks.ts`, which is hashed); a session that
// edits a card those decks run should bench again.
//
//   npm run bot:bench:last -w engine            # is there a figure for this code?
//   npm run bot:bench:last -w engine -- --all   # every entry, oldest first
//
// `bot:bench` appends an entry itself, for the plain configuration only (v1 as
// the opponent, default weights and options, from the first seed): nothing else
// is comparable from one run to the next. Pass `--no-log` to keep a run out.
//
// Bench noise is wide. Two runs of the same code have differed by 10% in time;
// compare a figure with a later one, and don't read a small swing as real.

import { createHash } from "node:crypto";
import { appendFileSync, existsSync, readFileSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ENGINE = fileURLToPath(new URL("..", import.meta.url));
const SRC = path.join(ENGINE, "src");
const LOG = path.join(ENGINE, "data", "bench-log.jsonl");

/** Directories under `src/` that aren't the engine's code. */
const LEFT_OUT = new Set(["test", path.join("cards", "pool"), path.join("cards", "tokens"), path.join("cards", "scaffold")]);

function sourceFiles(dir = SRC, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relative = path.relative(SRC, full);
    if (entry.isDirectory()) {
      if (!LEFT_OUT.has(relative)) sourceFiles(full, out);
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") && !entry.name.startsWith("generated")) {
      out.push(relative);
    }
  }
  return out;
}

/** A hash of the engine's non-card source as it is on disk now, line endings
 * aside (a checkout may have either). */
export function engineCodeHash() {
  const hash = createHash("sha1");
  for (const relative of sourceFiles().sort()) {
    hash.update(relative.split(path.sep).join("/"));
    hash.update(readFileSync(path.join(SRC, relative), "latin1").replaceAll("\r\n", "\n"));
  }
  return hash.digest("hex").slice(0, 12);
}

/** This machine, as far as a timing cares. */
export function machineName() {
  const cpus = os.cpus();
  return `${cpus[0]?.model.trim() ?? "unknown cpu"} x${cpus.length}`;
}

/** Append one result: `{ date, games, workers, players, wins, losses, draws,
 * wallSeconds, gameSeconds, decisionMs, worstDecisionMs, turns, note? }`. */
export function appendBench(result) {
  const entry = { ...result, code: engineCodeHash(), machine: machineName() };
  appendFileSync(LOG, `${JSON.stringify(entry)}\n`);
  return entry;
}

function entries() {
  if (!existsSync(LOG)) return [];
  return readFileSync(LOG, "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line));
}

const describe = (e) =>
  `${e.date}  ${e.games} games, ${e.workers} workers: ${e.wins}-${e.losses}-${e.draws}, ${e.turns} turns, ` +
  `${e.gameSeconds} s a game, ${e.decisionMs} ms a decision (worst ${e.worstDecisionMs} ms), ${e.wallSeconds} s wall` +
  `  [${e.code}]${e.note !== undefined ? ` — ${e.note}` : ""}`;

function main(args) {
  const all = entries();
  if (args.includes("--all")) {
    for (const e of all) console.log(describe(e));
    return;
  }
  const code = engineCodeHash();
  const machine = machineName();
  const same = all.filter((e) => e.code === code && e.machine === machine);
  const match = same.at(-1);
  if (match !== undefined) {
    console.log(`This engine code on this machine has a bench figure, so there's no need to rerun it:\n  ${describe(match)}`);
    return;
  }
  console.log(`No bench figure for this engine code [${code}] on this machine (${machine}): run a bench for a "before".`);
  const latest = all.at(-1);
  if (latest !== undefined) console.log(`The latest entry, for other code or another machine:\n  ${describe(latest)}`);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
