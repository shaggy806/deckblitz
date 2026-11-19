// Several copies of one room, fuzzed: step 2 of
// `docs/plans/replicated-rooms.md`. Each game is played on a table of rooms
// in this process (`src/room-copies.ts`), one copy a person, each answering
// only for its own seat and one of them for the bots, wired through an
// in-memory order; random players, and on the way everything people do out
// of turn (auto-pass, pass the turn, resolve the stack, settings, a seat
// handed to a bot, a concession, the host changing, a copy taking another's
// state). A game fails where two copies stop holding the same game, or where
// nobody moves for a seat.
//
//   npm run copies:fuzz -w server                      # 40 games
//   npm run copies:fuzz -w server -- --games 200 --max-turn 25
//   npm run copies:fuzz -w server -- --seed 17         # one seed again
//   npm run copies:fuzz -w server -- --own-decks       # the server's four decks, not the pool's
//   npm run copies:fuzz -w server -- --side 0.15       # more done out of turn (default 0.06 a step)
//   npm run copies:fuzz -w server -- --paced           # each copy paced as a live room is, on a clock nobody waits on
//
// Decks come from the whole pool by default, a different four each seed
// (`engine/scripts/fuzz-decks.mjs`), under the engine's plain rules as the
// engine's own fuzzer plays them. Runs `dist/`: build first (the npm script
// does).

import { asPlayerId } from "engine";

import { seatsFor } from "../../engine/scripts/fuzz-decks.mjs";
import { playCopies } from "../dist/room-copies.js";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const games = Number(flag("--games", "40"));
const start = Number(flag("--start", "1"));
const only = flag("--seed", null);
const maxTurn = Number(flag("--max-turn", "16"));
const side = Number(flag("--side", "0.06"));
const ownDecks = args.includes("--own-decks");
const paced = args.includes("--paced");

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
const totals = { steps: 0, inputs: 0, checks: 0, over: 0 };
const did = {};
const startedAt = Date.now();
for (const seed of seeds) {
  const seats = TABLES[(seed - 1) % TABLES.length];
  const label = seats.map((s) => (s === "person" ? "P" : "b")).join("");
  let table = null;
  try {
    const decks = ownDecks ? undefined : seatsFor(seed, SEATS.slice(0, seats.length));
    const result = playCopies({
      seed,
      seats,
      maxTurn,
      sideEvents: side,
      watch: (dealt) => {
        table = dealt;
      },
      ...(paced ? { pacing: "realtime" } : {}),
      ...(decks !== undefined ? { decks, rules: "plain" } : {}),
    });
    totals.steps += result.steps;
    totals.inputs += result.inputs;
    totals.checks += result.checks;
    if (result.over) totals.over += 1;
    for (const [what, n] of Object.entries(result.did)) did[what] = (did[what] ?? 0) + n;
    if (only !== null) console.log(`seed ${seed} (${label}): ${JSON.stringify(result)}`);
  } catch (error) {
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
    console.error(`FAILED seed ${seed} (${label}): ${message.split("\n").slice(0, 16).join("\n")}`);
    if (table !== null) {
      // Where each copy stands, what was last done out of turn, the last inputs.
      for (const copy of table.copies) {
        const { turn, priority, awaiting } = copy.room.game.state;
        console.error(
          `  ${copy.player}${copy === table.host ? " (host)" : ""}: turn ${turn.number} ${turn.step}, priority ${priority.holder}, ` +
            `awaiting ${awaiting === null ? "nothing" : `${awaiting.kind} of ${awaiting.player}`}, ${copy.room.game.events.length} events` +
            `${copy.room.stopped !== null ? `, STOPPED: ${copy.room.stopped}` : ""}`,
        );
      }
      console.error(`  out of turn, latest last: ${table.did.slice(-5).join("; ")}`);
      for (const entry of table.log.slice(-10)) {
        console.error(`    ${table.copies[entry.from].player} sent ${JSON.stringify(entry.input).slice(0, 150)}`);
      }
    }
    failures.push(
      `seed ${seed} (${label}) — replay with --seed ${seed}${ownDecks ? " --own-decks" : ""}${paced ? " --paced" : ""} --max-turn ${maxTurn} --side ${side}`,
    );
  }
}

const seconds = Math.round((Date.now() - startedAt) / 1000);
console.log(
  `${seeds.length} games on tables of copies in ${seconds} s: ${totals.steps} moves by people, ${totals.inputs} inputs in all, ` +
    `${totals.checks} checks that every copy held the same game, ${totals.over} played to the end`,
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
