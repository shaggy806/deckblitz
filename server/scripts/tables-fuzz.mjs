// A table with everything racing, fuzzed: step 5 of
// `docs/plans/replicated-rooms.md`. Each game is played over the server's
// real order (`src/tables.ts`) by a real device copy a person
// (`src/table-copy.ts`), their messages delivered one at a time from queues
// picked at random (`src/table-fuzz.ts`): devices fall behind and stall,
// people move the moment their own copy asks them, and concessions,
// settings, auto-pass and seats handed to bots happen at any moment. A game
// fails where the copies don't hold the same game once everything sent has
// arrived, where a copy falls out of step, or where nobody moves for a seat.
//
//   npm run tables:fuzz -w server                      # 40 games
//   npm run tables:fuzz -w server -- --games 200 --max-turn 25
//   npm run tables:fuzz -w server -- --seed 17         # one seed again
//   npm run tables:fuzz -w server -- --own-decks       # the server's four decks, not the pool's
//   npm run tables:fuzz -w server -- --side 0.1        # more done out of turn (default 0.03 a tick)
//   npm run tables:fuzz -w server -- --stalls 0.05     # devices stall more often (default 0.02 a tick)
//   npm run tables:fuzz -w server -- --leaves 0.01     # tabs close and reopen, the host's too (default 0: nobody leaves)
//   npm run tables:fuzz -w server -- --paced           # each copy paced as a live room is
//   npm run tables:fuzz -w server -- --verbose         # names each seed as it starts
//
// Decks come from the whole pool by default, a different four each seed,
// under the engine's plain rules. Runs `dist/`: build first (the npm script
// does).

import { asPlayerId } from "engine";

import { seatsFor } from "../../engine/scripts/fuzz-decks.mjs";
import { playTable } from "../dist/table-fuzz.js";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const games = Number(flag("--games", "40"));
const start = Number(flag("--start", "1"));
const only = flag("--seed", null);
const maxTurn = Number(flag("--max-turn", "16"));
const side = Number(flag("--side", "0.03"));
const stalls = Number(flag("--stalls", "0.02"));
const leaves = Number(flag("--leaves", "0"));
const ownDecks = args.includes("--own-decks");
const paced = args.includes("--paced");
/** Says which seed it is starting, for finding one that never ends. */
const verbose = args.includes("--verbose");

/** Who sits where, a different table each seed. */
const TABLES = [
  ["person", "person"],
  ["person", "bot"],
  ["person", "bot", "person", "bot"],
  ["person", "person", "person", "bot"],
  ["person", "person", "person", "person"],
  ["person", "person", "bot"],
  ["bot", "person", "person", "person"],
  ["person", "bot", "bot", "person"],
];
const SEATS = ["alice", "bob", "carol", "dave"].map(asPlayerId);

const seeds = only !== null ? [Number(only)] : Array.from({ length: games }, (_, k) => start + k);
const failures = [];
const totals = { moves: 0, inputs: 0, refused: 0, undone: 0, checks: 0, over: 0 };
const did = {};
const startedAt = Date.now();
for (const seed of seeds) {
  const seats = TABLES[(seed - 1) % TABLES.length];
  const label = seats.map((s) => (s === "person" ? "P" : "b")).join("");
  let table = null;
  if (verbose) console.error(`seed ${seed} (${label}) at ${Math.round((Date.now() - startedAt) / 1000)} s`);
  try {
    const decks = ownDecks ? undefined : seatsFor(seed, SEATS.slice(0, seats.length));
    const result = playTable({
      seed,
      seats,
      maxTurn,
      sideEvents: side,
      stalls,
      leaves,
      watch: (dealt) => {
        table = dealt;
      },
      ...(paced ? { pacing: "realtime" } : {}),
      ...(decks !== undefined ? { decks, rules: "plain" } : {}),
    });
    for (const key of ["moves", "inputs", "refused", "undone", "checks"]) totals[key] += result[key];
    if (result.over) totals.over += 1;
    for (const [what, n] of Object.entries(result.did)) did[what] = (did[what] ?? 0) + n;
    if (only !== null) console.log(`seed ${seed} (${label}): ${JSON.stringify(result)}`);
  } catch (error) {
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
    console.error(`FAILED seed ${seed} (${label}): ${message.split("\n").slice(0, 16).join("\n")}`);
    if (table !== null) {
      // Where each device stands, what was last done out of turn, the last inputs.
      for (const device of table.devices) {
        const copy = device.copy;
        if (copy === null) {
          console.error(`  ${device.player}: never dealt`);
          continue;
        }
        const { turn, priority, awaiting } = copy.room.game.state;
        console.error(
          `  ${device.player}${copy.isHost ? " (host)" : ""}: holds ${copy.head} inputs, undone ${copy.undone}, turn ${turn.number} ${turn.step}, ` +
            `priority ${priority.holder}, awaiting ${awaiting === null ? "nothing" : `${awaiting.kind} of ${awaiting.player}`}, ` +
            `${device.up.length} up ${device.down.length} down` +
            `${copy.outOfStep !== null ? `, OUT OF STEP: ${copy.outOfStep}` : ""}` +
            `${copy.room.stopped !== null ? `, STOPPED: ${copy.room.stopped}` : ""}`,
        );
      }
      console.error(`  out of turn, latest last: ${table.did.slice(-5).join("; ")}`);
      for (const entry of table.log.slice(-10)) {
        console.error(`    ${entry.index} ${entry.from} sent ${JSON.stringify(entry.input).slice(0, 150)}`);
      }
    }
    failures.push(
      `seed ${seed} (${label}) — replay with --seed ${seed}${ownDecks ? " --own-decks" : ""}${paced ? " --paced" : ""} ` +
        `--max-turn ${maxTurn} --side ${side} --stalls ${stalls} --leaves ${leaves}`,
    );
  }
}

const seconds = Math.round((Date.now() - startedAt) / 1000);
console.log(
  `${seeds.length} games at racing tables in ${seconds} s: ${totals.moves} moves by people, ${totals.inputs} inputs put in order, ` +
    `${totals.refused} refused, ${totals.undone} undos, ${totals.checks} checks that every copy held the same game, ` +
    `${totals.over} played to the end`,
);
console.log(
  `done out of turn: ${
    Object.entries(did)
      .sort((a, b) => b[1] - a[1])
      .map(([what, n]) => `${what} ${n}`)
      .join(", ") || "nothing"
  }`,
);
if (failures.length > 0) {
  console.log(`\n${failures.length} FAILED:`);
  for (const f of failures) console.log(`  ${f}`);
  process.exitCode = 1;
}
