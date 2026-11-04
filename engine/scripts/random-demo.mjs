// Random-vs-random games: both seats pick uniformly from legalActions().
// Doubles as an engine fuzzer — if legalActions ever offers something dispatch
// refuses, this crashes.
//
//   npm run play:random -w engine
//   npm run play:random -w engine -- --games 50
//   npm run play:random -w engine -- --log        # print the last game's log
//   npm run play:random -w engine -- --players 3  # or 4 — exercises multi-opponent combat
//   npm run play:random -w engine -- --seed 19    # replay exactly one seed
//   npm run play:random -w engine -- --games 15 --start 16  # seeds 16-30 (a run split across processes)
//   npm run play:random -w engine -- --timeout 90 # per-game limit, seconds (default 60, 180 past 2 players)
//   npm run play:random -w engine -- --max-turns 60  # a game reaching turn 61 ends as a draw (default 100, 120 past 2 players; 0 plays it out)
//   npm run play:random -w engine -- --with "Card Name"  # in every seat's deck
//   ... --with A --with B ... --per-deck 10  # at most 10 forced cards a deck, a group per seed
//   npm run play:random -w engine -- --games 100 --coverage  # how much of the pool the decks reach
//   MTG_ORDER_TRIGGERS=1 node scripts/random-demo.mjs  # every seat orders its own triggers
//
// Every seed deals each seat its own 100-card Commander deck from the whole
// pool (`fuzz-decks.mjs`), so a new card needs no edit here to be fuzzed.
//
// Each game runs in a worker thread with a wall-clock limit. A game that
// never finishes is killed and reported as a failure naming its seed and how
// the game last looked (the worker's once-a-second heartbeat), instead
// of stalling the whole run — a runaway loop inside one `tick()` never yields,
// so nothing short of terminating the thread can stop it. Any failure (a
// timeout, or a thrown error) makes the process exit non-zero. A game that's
// merely long isn't one: it stops at the turn cap and passes (`--max-turns`).

import { Worker } from "node:worker_threads";

import { Game, RandomController, asPlayerId, createRng } from "../dist/index.js";
import { readFileSync } from "node:fs";

import { coverage, forcedChunks, packedChunks, seatsFor, unknownCards } from "./fuzz-decks.mjs";
import { printLog, printSummary } from "./format.mjs";
import { progress } from "./progress.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
let games = Number(flag("games", "10"));
const showLog = args.includes("--log");
const numPlayers = Number(flag("players", "2"));
// Long runs print nothing until the very end, so a game that never terminates
// looks identical to one that's merely slow. `--progress` announces each seed
// on stderr *before* playing it — the last line printed names the culprit.
const showProgress = args.includes("--progress");
const onlySeed = flag("seed", null);
// The first seed: `npm run verify` splits the 4-player run across two
// processes this way, the same seeds as one run of them all.
const firstSeed = Number(flag("start", "1"));
// The limit is there to catch a hang, so it leaves room for a game to reach its
// turn cap on a busy machine: at the slowest seen under a full verify (2026-11-04)
// a 2-player game was at turn 63 after 30 s and a 4-player one at 132 after 120 s.
const timeoutMs = Number(flag("timeout", numPlayers === 2 ? "60" : "180")) * 1000;
// `--max-turns N`: a game still going after turn N stops there, reported as
// a draw by turn cap, and passes. Random players rarely finish anyone off, so a
// game's length is mostly its seed's luck (2 players about 40 turns, 4 about 100,
// the slow ones past 275), and a long game only ever failed a run on the clock.
// The defaults leave most games to finish, so decking and commander damage are
// still reached. `--max-turns 0` plays a game right out. `npm run verify`'s new-card
// runs cap lower, and the situation fuzzer (`situation-fuzz.mjs`) is the per-card check.
const maxTurnsFlag = Number(flag("max-turns", numPlayers === 2 ? "100" : "120"));
const maxTurns = maxTurnsFlag === 0 ? null : maxTurnsFlag;

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const C = asPlayerId("carol");
const D = asPlayerId("dave");

const players = [A, B, C, D].slice(0, numPlayers);
// Each seed builds its own decks: a commander and 99 cards drawn from the
// whole pool (`fuzz-decks.mjs`). `--with "Card"` (repeatable) puts a card in
// every seat's deck — the way to fuzz a card you just authored.
// `--with-file <path>`: one name per line, for more than a command line holds.
const withFile = flag("with-file", null);
const forced = [
  ...args.flatMap((a, i) => (a === "--with" && args[i + 1] !== undefined ? [args[i + 1]] : [])),
  ...(withFile === null ? [] : readFileSync(withFile, "utf8").split(/\r?\n/).filter(Boolean)),
];
const unknown = unknownCards(forced);
if (unknown.length > 0) {
  console.error(`--with: not a deckable pool card: ${unknown.join(", ")}`);
  process.exit(1);
}
// More than a deck holds: groups of cards sharing a colour identity, each
// forced into games of its own — at least one game per group.
// `--per-deck N`: at most N of them in a deck — the cards packed into
// ceil(count / N) groups of near-equal size, like colour identities together
// (`packedChunks`), seed s playing group (s - 1) mod groups. `npm run verify`
// fuzzes a long list of new cards this way, so no deck is a pile of them.
const CHUNK = 30;
const perDeck = flag("per-deck", null);
const chunks =
  perDeck !== null && forced.length > Number(perDeck)
    ? packedChunks(forced, Number(perDeck))
    : forced.length > CHUNK
      ? forcedChunks(forced, CHUNK)
      : [forced];
if (chunks.length > 1) {
  console.log(`forced cards in ${chunks.length} groups (${chunks.map((c) => c.length).join(", ")}), one per seed in turn`);
}
if (chunks.length > games) games = chunks.length;
const seatsForSeed = (seed) => seatsFor(seed, players, { forced: chunks[(seed - 1) % chunks.length] });

const results = [];
const failures = [];

const workerUrl = new URL("./random-game-worker.mjs", import.meta.url);
const spawn = () => new Worker(workerUrl);
let worker = spawn();

/** Play one seed in the worker, or kill it after `timeoutMs` — reporting the
 * worker's last heartbeat, the game as it last looked. */
const play = (seed) =>
  new Promise((resolve) => {
    let last = null;
    const timer = setTimeout(() => {
      worker.removeAllListeners("message");
      // Terminate and replace: the thread may be stuck mid-tick forever.
      void worker.terminate();
      worker = spawn();
      resolve({ seed, ok: false, timedOut: true, ms: timeoutMs, last });
    }, timeoutMs);
    const onMessage = (result) => {
      if (result.heartbeat !== undefined) {
        last = result.heartbeat;
        return;
      }
      worker.off("message", onMessage);
      clearTimeout(timer);
      resolve(result);
    };
    worker.on("message", onMessage);
    worker.postMessage({ seed, seats: seatsForSeed(seed), maxTurns });
  });

const seedsToPlay =
  onlySeed !== null
    ? [Number(onlySeed)]
    : Array.from({ length: games }, (_, k) => firstSeed + k);

// `--coverage`: play nothing; say how much of the pool these seeds' decks hold.
if (args.includes("--coverage")) {
  const { total, seen, missing } = coverage(seedsToPlay, players);
  console.log(`${seedsToPlay.length} seeds x ${players.length} seats: ${seen}/${total} deckable cards in at least one deck`);
  if (missing.length > 0) console.log(`missing: ${missing.join(", ")}`);
  process.exit(0);
}

// The job-progress mod draws this as a bar above Claude Code's prompt.
const bar = progress(`fuzz ${numPlayers}p`, seedsToPlay.length);
for (const seed of seedsToPlay) {
  if (showProgress) process.stderr.write(`seed ${seed}/${games}… `);
  const result = await play(seed);
  if (result.ok) {
    if (showProgress) {
      process.stderr.write(`${result.turns} turns, ${result.events} events, ${result.ms}ms\n`);
    }
    results.push(result);
    bar.tick();
  } else if (result.timedOut) {
    // Where it was when killed: a turn in the hundreds or a battlefield of
    // one card's copies is a game running long, not a hang; the same picture
    // at a longer --timeout only says it again.
    const where = result.last === null ? "before its first heartbeat (still starting, or stuck inside one tick)" : `last seen at ${result.last}`;
    const line = `FAILED seed ${seed}: TIMED OUT after ${timeoutMs / 1000}s, ${where} (replay with --seed ${seed})`;
    process.stderr.write(`${showProgress ? "\n" : ""}${line}\n`);
    failures.push(line);
    bar.tick({ failed: true });
  } else {
    const line = `FAILED seed ${seed}: ${result.error}`;
    process.stderr.write(`${showProgress ? "\n" : ""}${line}\n`);
    failures.push(`FAILED seed ${seed} (replay with --seed ${seed})`);
    bar.tick({ failed: true });
  }
}
bar.finish();
await worker.terminate();

// `--log` needs the Game object itself, which can't cross the worker boundary.
// Games are deterministic per seed, so replay the last successful one here.
let last = null;
if (showLog && results.length > 0) {
  const seed = results[results.length - 1].seed;
  const seats = seatsForSeed(seed);
  const rng = createRng(seed * 7919);
  const pick = () => rng.next();
  last = Game.create({
    seed,
    mulligans: true,
    controllers: Object.fromEntries(
      seats.map(({ player }) => [player, new RandomController(player, pick)]),
    ),
    decks: seats,
  });
  if (maxTurns === null) last.advance();
  else last.advanceUntil((state) => state.turn.number > maxTurns);
}

if (showLog && last !== null) {
  printLog(last);
  printSummary(last);
  console.log("");
}

console.log(`seed  winner  turns  events  reason`);
for (const r of results) {
  console.log(
    `${String(r.seed).padStart(4)}  ${String(r.winner).padEnd(6)}  ${String(
      r.turns,
    ).padStart(5)}  ${String(r.events).padStart(6)}  ${r.reason}`,
  );
}

const wins = (who) => results.filter((r) => r.winner === who).length;
console.log("");
const capped = results.filter((r) => r.capped).length;
const tally = players
  .map((player) => `${player} ${wins(player)}`)
  .concat(`draws ${wins("draw") - capped}`, ...(maxTurns !== null ? [`turn cap ${capped}`] : []))
  .join(", ");
console.log(`${results.length} games — ${tally}`);
console.log(
  `avg turns ${(results.reduce((s, r) => s + r.turns, 0) / Math.max(1, results.length)).toFixed(1)}`,
);
if (failures.length > 0) {
  console.log("");
  console.log(`${failures.length} FAILED:`);
  for (const f of failures) console.log(`  ${f}`);
  process.exitCode = 1;
}
