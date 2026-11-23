#!/usr/bin/env node
// Plays a kept game again (`server/src/game-record.ts`): the game dealt as it
// was and every input fed back in order, so the whole game is there to look
// at, every hand and library in it, with no bot or person asked anything.
//
//   npm run game:replay -- games/2026-11-22/ABCD-1-123.json.gz
//   npm run game:replay -- <file> --log                 # the whole game as text, to <file>.log.txt
//   npm run game:replay -- <file> --turn 31             # stop as turn 31 begins; saves the position
//   npm run game:replay -- <file> --to 400              # stop after 400 inputs; saves the position
//   npm run game:replay -- <file> --bots                # the bot moves made out of time (v1's cast, unscored)
//   npm run game:replay -- <file> --bots all            # every bot move that wasn't a finished search
//
// A saved position (`.scratch/replays/<name>-t<turn>.json`) is a snapshot
// `npm run bot:replay -w engine -- --from <it>` starts from, and what a probe
// or a training scenario is built from.
//
// A record plays exactly only on the build it was played on (its `build`, a
// commit). On another the replay says where it first went wrong; check that
// commit out (`git worktree add ../at-<sha> <sha>`, build, run this there).
//
// Needs `engine/dist` and `server/dist` built.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? null : (args[i + 1] ?? "");
};
const has = (name) => args.includes(`--${name}`);
const file = args.find((a) => /\.json(\.gz)?$/.test(a));
if (file === undefined || has("help")) {
  console.log("usage: npm run game:replay -- <record.json[.gz]> [--log] [--turn N | --to N] [--bots]");
  process.exit(file === undefined ? 1 : 0);
}

const raw = readFileSync(file);
const record = JSON.parse((file.endsWith(".gz") ? gunzipSync(raw) : raw).toString("utf8"));
if (record.version !== 1) throw new Error(`a version ${record.version} record: this script reads version 1`);

const { createDefaultRegistry } = await import(new URL("../engine/dist/index.js", import.meta.url).href);
const { replayRecord } = await import(new URL("../server/dist/game-record.js", import.meta.url).href);

const here = (() => {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
})();

const seat = (player) => {
  const s = record.seats.find((x) => x.player === player);
  return s === undefined ? player : `${s.name ?? player}${s.bot ? " (bot)" : ""}`;
};
const when = (ms) => new Date(ms).toISOString().replace("T", " ").slice(0, 16);
const by = { person: 0, bot: 0, room: 0 };
for (const input of record.inputs) by[input.by] += 1;

console.log(`${basename(file)}: room ${record.roomId}, game ${record.gameNumber}, seed ${record.config.seed ?? "?"}, played ${record.where === "browser" ? "in a browser" : record.where === "table" ? "at a table (every player's device)" : "on the server"}`);
console.log(`  ${when(record.startedAt)} to ${when(record.endedAt)} UTC${record.country ? `, from ${record.country}` : ""}${record.tag ? `, browser tag ${record.tag}` : ""}`);
console.log(`  seats: ${record.seats.map((s) => seat(s.player)).join(", ")}`);
console.log(`  ${record.inputs.length} inputs: ${by.person} a person's, ${by.bot} a bot's, ${by.room} the room's own`);
console.log(`  ended: ${record.end.reason}${record.end.winner ? `, ${seat(record.end.winner)} won` : ""}${record.end.turn !== null ? `, turn ${record.end.turn}` : ""}`);
console.log(`  build ${record.build ?? "unknown"}${here !== null && record.build !== null ? (record.build === here ? " (this checkout)" : `; this checkout is ${here.slice(0, 9)}`) : ""}`);

const turn = flag("turn") === null ? null : Number(flag("turn"));
const to = flag("to") === null ? null : Number(flag("to"));
const registry = createDefaultRegistry();

// The turn each input was made in, for `--bots`, and the stop for `--turn`.
const turnOf = [];
let turnNow = 1;
const replay = replayRecord(record, registry, {
  ...(to !== null ? { upTo: to } : {}),
  stop: (game, applied) => {
    turnOf[applied - 1] = turnNow;
    turnNow = game.state.turn.number;
    return turn !== null && turnNow >= turn;
  },
});
const game = replay.game;

if (replay.refused !== null) {
  console.log(`\nNOT THE SAME GAME: input ${replay.refused.at} of ${record.inputs.length} was refused on this build (turn ${game.state.turn.number}): ${replay.refused.why}`);
  console.log(`  the input: ${JSON.stringify(record.inputs[replay.refused.at]).slice(0, 300)}`);
  console.log(`  it plays exactly on ${record.build ?? "the build it was played on"}`);
} else if (replay.matches === true) {
  console.log(`\nreplayed all ${replay.applied} inputs: the same game, to the last event`);
} else if (replay.matches === false) {
  console.log(`\nNOT THE SAME GAME: every input was taken, but the game ended up somewhere else (${game.events.length} events against ${record.end.events}). It plays exactly on ${record.build ?? "the build it was played on"}`);
} else if (replay.applied === record.inputs.length) {
  console.log(`\nreplayed all ${replay.applied} inputs${replay.dropped > 0 ? ` (${replay.dropped} the game dropped, as the table did)` : ""}; this record has no end state to check against`);
} else {
  console.log(`\nstopped after ${replay.applied} of ${record.inputs.length} inputs`);
}

const state = game.state;
const nameOf = (id) => state.objects[id]?.cardName ?? String(id);
console.log(`  turn ${state.turn.number} (${state.turn.step}), ${state.result.over ? `over: ${state.result.winner ? `${seat(state.result.winner)} won` : "no winner"}${state.result.reason ? ` — ${state.result.reason}` : ""}` : "not over"}`);
for (const player of state.turnOrder) {
  const p = state.players[player];
  const zones = state.zones.perPlayer[player];
  const board = state.zones.shared.battlefield.filter((id) => state.objects[id]?.controller === player).length;
  console.log(`  ${seat(player).padEnd(24)} life ${String(p.life).padStart(3)}${p.hasLost ? " (out)" : ""}  hand ${zones.hand.length}  library ${zones.library.length}  graveyard ${zones.graveyard.length}  permanents ${board}`);
}

if (has("bots")) {
  const all = flag("bots") === "all";
  console.log(`\nbot moves ${all ? "that weren't a finished search" : "made out of time"} (input, turn, how, the move):`);
  let shown = 0;
  record.inputs.slice(0, replay.applied).forEach((input, i) => {
    if (input.by !== "bot" || (input.via === "search" && input.expired !== true) || input.via === undefined) return;
    const action = input.input.kind === "action" ? input.input.action : input.input;
    if (action.type === "pass-priority" && input.expired !== true) return;
    if (!all && input.expired !== true && input.via !== "v1's cast" && input.via !== "no time") return;
    shown += 1;
    console.log(`  ${String(i).padStart(5)}  t${String(turnOf[i] ?? "?").padEnd(3)} ${`${input.via}${input.expired ? " (out of time)" : ""}`.padEnd(28)} ${seat(action.player)}: ${describe(action)}`);
  });
  if (shown === 0) console.log("  none");
}

function describe(action) {
  const card = action.card ?? action.source;
  const what = card !== undefined ? ` ${nameOf(card)}` : "";
  const rest = { ...action };
  delete rest.type;
  delete rest.player;
  delete rest.card;
  delete rest.source;
  const more = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest).slice(0, 160)}` : "";
  return `${action.type}${what}${more}`;
}

if (has("log")) {
  // The client's own sentences (`client/src/format.ts`, plain TypeScript Node
  // runs as it is), every card named: nothing is hidden from a replay.
  const { describeEvent } = await import(new URL("../client/src/format.ts", import.meta.url).href);
  const seats = record.seats.map((s) => ({ player: s.player, displayName: s.name, bot: s.bot }));
  const lines = game.events.map((event) => {
    let sentence;
    try {
      sentence = describeEvent(event, nameOf, seats);
    } catch {
      sentence = JSON.stringify(event).slice(0, 200);
    }
    return `${event.seq}\t${String(sentence).replace(/\s*[\r\n]+\s*/g, " ")}`;
  });
  const out = `${file.replace(/\.json(\.gz)?$/, "")}.log.txt`;
  writeFileSync(out, `${lines.join("\n")}\n`);
  console.log(`\nlog: ${lines.length} events written to ${out}`);
}

if (turn !== null || to !== null) {
  const dir = join(root, ".scratch", "replays");
  mkdirSync(dir, { recursive: true });
  const out = join(dir, `${basename(file).replace(/\.json(\.gz)?$/, "")}-t${state.turn.number}-i${replay.applied}.json`);
  writeFileSync(out, JSON.stringify(game.snapshot()));
  console.log(`\nposition saved: ${out}`);
  console.log(`  play on from it:  npm run bot:replay -w engine -- --from "${out}"`);
}
