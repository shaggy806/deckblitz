#!/usr/bin/env node
// Turns a kept game (`server/src/game-record.ts`, `npm run games:pull`) into
// a replay file the site's viewer opens (Settings on the landing page, "Watch
// a replay…"; `client/src/replay/`): the game played again here, once, and a
// board written after every input that added to the log, so the viewer only
// shows boards and works nothing out.
//
//   npm run game:to-replay -- games/2026-11-24/ABCD-1-123.json.gz
//   npm run game:to-replay -- gamelog-ABCD-123.txt     # a plain exported log: its game's record, found in games/
//   npm run game:to-replay -- <file> --seat bob        # from bob's seat (a player id or a seat's name)
//   npm run game:to-replay -- <file> --open            # every hand open, from the first person's seat
//   npm run game:to-replay -- <file> --out some.txt
//   npm run game:to-replay -- --clean                  # remove the old builds it made (.scratch/builds/)
//
// A plain log (the History's Export log from before replays, or one saved
// without them) names its room and seed; the record of that game is looked
// for in `games/`, so `npm run games:pull` first.
//
// From one seat, each board is what that seat was shown (`Game.viewFor`). With
// `--open` the other seats' hand cards are put into it too, so a player's
// panel opens their hand face up (the History then names those cards as
// well). Libraries stay hidden either way.
//
// A record plays exactly only on the build it was played on (its `build`).
// Where the engine, cards, server or protocol have changed since, this builds
// that commit once in `.scratch/builds/<sha>` (a worktree whose node_modules
// are junctions into this checkout's, the workspaces its own) and converts
// there; later records of the same build reuse it. `--here` converts on this
// checkout anyway, stopping where an input is refused.
//
// Needs `engine/dist` and `server/dist` built. The file is written beside the
// record as `<record>.replay.txt` unless `--out` says otherwise.

import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmdirSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const builds = join(root, ".scratch", "builds");
const WORKSPACES = new Set(["engine", "protocol", "server", "client"]);
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? null : (args[i + 1] ?? "");
};
const has = (name) => args.includes(`--${name}`);
const git = (...rest) => execFileSync("git", rest, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

if (has("clean")) {
  clean();
  process.exit(0);
}

// The file named: whatever isn't a flag or a flag's value.
const valued = new Set(["--seat", "--out"]);
const given = args.find((a, i) => !a.startsWith("--") && !valued.has(args[i - 1] ?? ""));
if (given === undefined || has("help")) {
  console.log(
    "usage: npm run game:to-replay -- <record.json[.gz] | gamelog.txt> [--seat <player or name>] [--open] [--out <file.txt>] [--here]\n" +
      "       npm run game:to-replay -- --clean",
  );
  process.exit(given === undefined && !has("help") ? 1 : 0);
}
const file = /\.json(\.gz)?$/.test(given) ? given : recordOfLog(given);

const raw = readFileSync(file);
const record = JSON.parse((file.endsWith(".gz") ? gunzipSync(raw) : raw).toString("utf8"));
if (record.version !== 1) throw new Error(`a version ${record.version} record: this script reads version 1`);

// Not this checkout's game: convert it on its own build.
if (!has("here") && record.build && needsOwnBuild(record.build)) {
  process.exit(runAtBuild(record.build, file));
}

/** The record a plain exported log is of: its room and seed, from its name
 * (`gamelog-<room>-<seed>.txt`) or its first line, found in `games/`. */
function recordOfLog(path) {
  const named = /gamelog-([A-Za-z0-9]+)-(\d+)/.exec(basename(path));
  const header = /seed (\d+)/.exec(readFileSync(path, "utf8").split("\n", 1)[0] ?? "");
  const seed = named?.[2] ?? header?.[1];
  const room = named?.[1];
  if (seed === undefined) {
    console.error(`${path}: no seed in its name or its first line, so no game to find`);
    process.exit(1);
  }
  const dir = join(root, "games");
  const found = existsSync(dir)
    ? readdirSync(dir).flatMap((day) =>
        existsSync(join(dir, day)) && lstatSync(join(dir, day)).isDirectory()
          ? readdirSync(join(dir, day))
              .filter((f) => f.endsWith(`-${seed}.json.gz`) && (room === undefined || f.startsWith(`${room}-`)))
              .map((f) => join(dir, day, f))
          : [],
      )
    : [];
  if (found.length === 0) {
    console.error(`no record of ${room ?? "the"} game with seed ${seed} in games/: fetch the kept games with \`npm run games:pull\``);
    process.exit(1);
  }
  console.log(`${basename(path)} is ${found[0]}`);
  return found[0];
}

/** Whether `sha` plays games differently from this checkout: the engine, its
 * cards, the server's rooms or the protocol changed between them. */
function needsOwnBuild(sha) {
  try {
    git("cat-file", "-e", `${sha}^{commit}`);
  } catch {
    console.log(`the record's build ${sha.slice(0, 9)} isn't in this clone (git fetch?): converting on this checkout`);
    return false;
  }
  const changed = spawnSync("git", ["diff", "--quiet", sha, "HEAD", "--", "engine/src", "engine/data", "server/src", "protocol/src"], {
    cwd: root,
  });
  return changed.status !== 0;
}

/** Converts on `sha`'s build: made once in `.scratch/builds/<sha>`, this
 * script and the replay format copied in (an older commit may not have them),
 * then run there with `--here`. Returns its exit code. */
function runAtBuild(sha, recordPath) {
  const at = join(builds, sha.slice(0, 12));
  if (!existsSync(at)) {
    console.log(`the record was played on ${sha.slice(0, 9)}: building it once in ${at}`);
    mkdirSync(builds, { recursive: true });
    git("worktree", "add", "--detach", at, sha);
  }
  const modules = join(at, "node_modules");
  if (!existsSync(modules)) {
    mkdirSync(modules);
    for (const entry of readdirSync(join(root, "node_modules"))) {
      const target = WORKSPACES.has(entry) ? join(at, entry) : join(root, "node_modules", entry);
      symlinkSync(target, join(modules, entry), "junction");
    }
  }
  if (!existsSync(join(at, "engine", "dist", "index.js")) || !existsSync(join(at, "server", "dist", "game-record.js"))) {
    const built = spawnSync("npm run build -w engine -w protocol -w server", { cwd: at, stdio: "inherit", shell: true });
    if (built.status !== 0) {
      console.error(`building ${sha.slice(0, 9)} failed`);
      return 1;
    }
  }
  mkdirSync(join(at, "client", "src", "replay"), { recursive: true });
  copyFileSync(join(root, "scripts", "record-to-replay.mjs"), join(at, "scripts", "record-to-replay.mjs"));
  copyFileSync(join(root, "client", "src", "replay", "replayFile.ts"), join(at, "client", "src", "replay", "replayFile.ts"));
  const rest = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === given) continue;
    rest.push(args[i] === "--out" ? args[i] : args[i - 1] === "--out" ? resolve(args[i]) : args[i]);
  }
  if (flag("out") === null) rest.push("--out", outFor(resolve(recordPath), has("open")));
  const run = spawnSync(process.execPath, [join(at, "scripts", "record-to-replay.mjs"), resolve(recordPath), "--here", ...rest], {
    stdio: "inherit",
  });
  return run.status ?? 1;
}

/** Removes the builds `runAtBuild` made: each worktree's junctions first, so
 * nothing they point into (this checkout's node_modules) is touched. */
function clean() {
  if (!existsSync(builds)) return console.log("no builds to remove");
  for (const sha of readdirSync(builds)) {
    const at = join(builds, sha);
    const modules = join(at, "node_modules");
    if (existsSync(modules)) {
      for (const entry of readdirSync(modules)) unlink(join(modules, entry));
      rmdirSync(modules);
    }
    git("worktree", "remove", "--force", at);
    console.log(`removed ${at}`);
  }
}

/** Removes a junction (Windows) or a symlink, never what it points to. */
function unlink(path) {
  try {
    rmdirSync(path);
  } catch {
    unlinkSync(path);
  }
}

/** Where the replay goes without `--out`: beside the record. */
function outFor(recordPath, open) {
  return `${recordPath.replace(/\.json(\.gz)?$/, "")}${open ? ".open" : ""}.replay.txt`;
}

const { createDefaultRegistry, artManifest } = await import(new URL("../engine/dist/index.js", import.meta.url).href);
const { replayRecord } = await import(new URL("../server/dist/game-record.js", import.meta.url).href);
// The client's own replay format and sentences: plain TypeScript Node runs as it is.
const { ReplayRecorder, encodeReplay } = await import(new URL("../client/src/replay/replayFile.ts", import.meta.url).href);
const { abilitySourcesOf, describeEvent, logNameAt } = await import(new URL("../client/src/format.ts", import.meta.url).href);

const seats = record.seats.map((s) => ({
  player: s.player,
  claimed: true,
  online: true,
  displayName: s.name,
  isBot: s.bot,
  deck: null,
  ready: true,
  isHost: false,
  deckProblem: null,
}));
const asked = flag("seat");
const seat =
  asked === null
    ? (record.seats.find((s) => !s.bot) ?? record.seats[0]).player
    : record.seats.find((s) => s.player === asked || s.name === asked)?.player;
if (seat === undefined) {
  console.error(`no seat "${asked}": ${record.seats.map((s) => `${s.player}${s.name ? ` (${s.name})` : ""}`).join(", ")}`);
  process.exit(1);
}
const open = has("open");

const registry = createDefaultRegistry();
const recorder = new ReplayRecorder(record.build ?? "unknown", () => clock);
const roomId = `${record.roomId}`;
let clock = record.startedAt;
let lastEvents = -1;
let frames = 0;
let lastView = null;
let lastGame = null;

/** The board `seat` is shown — with `--open`, every hand's cards in it. */
function boardOf(game) {
  const view = game.viewFor(seat);
  if (!open) return view;
  const objects = { ...view.objects };
  for (const other of game.state.turnOrder) {
    if (other === seat) continue;
    const theirs = game.viewFor(other);
    for (const id of theirs.zones.hands[other] ?? []) {
      if (theirs.objects[id] !== undefined) objects[id] = theirs.objects[id];
    }
  }
  return { ...view, objects };
}

function keep(game, force = false) {
  lastGame = game;
  if (!force && game.events.length === lastEvents) return;
  lastEvents = game.events.length;
  // A copy, as a page gets its board: a view shares parts with the game's
  // state (its log is the game's own array), which the next input changes.
  const view = JSON.parse(JSON.stringify(boardOf(game)));
  lastView = view;
  recorder.record({
    roomId,
    game: record.gameNumber ?? 1,
    seat,
    spectating: false,
    view,
    seats,
    replaced: false,
    ...(frames === 0 ? { art: artManifest(game.state, registry) } : {}),
  });
  frames += 1;
  clock += 1000;
}

const replay = replayRecord(record, registry, {
  start: (game) => keep(game, true),
  stop: (game) => {
    keep(game);
    return false;
  },
});
if (lastGame !== null && replay.game !== lastGame) keep(replay.game, true);

if (replay.refused !== null) {
  console.log(`input ${replay.refused.at} of ${record.inputs.length} was refused on this build: ${replay.refused.why}`);
  console.log(`  the replay stops there; it plays whole on ${record.build ?? "the build it was played on"}`);
} else if (replay.matches === false) {
  console.log(`every input was taken, but the game ended somewhere else than it did (this build isn't ${record.build ?? "its build"}): the replay is this build's game`);
}

// The log's lines first, as the History's Export log writes them (the
// client's `logNameAt`): a card by the name it was known by, "a card" where
// the seat never saw it — with `--open`, every card by its name.
const nameOf = (id) => {
  const o = lastView?.objects[id];
  if (o !== undefined) return o.faceName ?? o.cardName;
  return open ? (replay.game.state.objects[id]?.cardName ?? String(id)) : String(id);
};
const events = lastView?.events ?? [];
const abilities = abilitySourcesOf(events);
const lines = events.map((event) => {
  let sentence;
  try {
    sentence = describeEvent(
      event,
      (id, heldBy) =>
        logNameAt(lastView.publicStints, nameOf, id, event.seq, !open && heldBy !== undefined && heldBy !== seat, abilities),
      seats,
    );
  } catch {
    sentence = JSON.stringify(event).slice(0, 200);
  }
  return `${event.seq}\t${String(sentence).replace(/\s*[\r\n]+\s*/g, " ")}\n`;
});

const data = recorder.data();
const out = flag("out") ?? outFor(file, open);
writeFileSync(out, lines.join("") + (await encodeReplay(data)));
const who = record.seats.find((s) => s.player === seat);
console.log(
  `${out}: ${frames} boards over ${replay.applied} inputs, from ${who?.name ?? seat}'s seat${open ? ", every hand open" : ""}`,
);
