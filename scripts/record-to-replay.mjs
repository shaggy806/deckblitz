#!/usr/bin/env node
// Turns a kept game (`server/src/game-record.ts`, `npm run games:pull`) into
// a replay file the site's viewer opens (Settings on the landing page, "Watch
// a replay…"; `client/src/replay/`): the game played again here, once, and a
// board written after every input that added to the log, so the viewer only
// shows boards and works nothing out.
//
//   npm run game:to-replay -- games/2026-11-24/ABCD-1-123.json.gz
//   npm run game:to-replay -- <file> --seat bob        # from bob's seat (a player id or a seat's name)
//   npm run game:to-replay -- <file> --open            # every hand open, from the first person's seat
//   npm run game:to-replay -- <file> --out some.txt
//
// From one seat, each board is what that seat was shown (`Game.viewFor`). With
// `--open` the other seats' hand cards are put into it too, so a player's
// panel opens their hand face up (the History then names those cards as
// well). Libraries stay hidden either way.
//
// A record plays exactly only on the build it was played on (its `build`):
// on another the game can go somewhere else, and this stops where an input is
// refused, writing what it had. Check that commit out to convert it whole
// (`git worktree add ../at-<sha> <sha>`, build, run this there).
//
// Needs `engine/dist` and `server/dist` built. The file is written beside the
// record as `<record>.replay.txt` unless `--out` says otherwise.

import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? null : (args[i + 1] ?? "");
};
const has = (name) => args.includes(`--${name}`);
const file = args.find((a) => /\.json(\.gz)?$/.test(a));
if (file === undefined || has("help")) {
  console.log("usage: npm run game:to-replay -- <record.json[.gz]> [--seat <player or name>] [--open] [--out <file.txt>]");
  process.exit(file === undefined ? 1 : 0);
}

const raw = readFileSync(file);
const record = JSON.parse((file.endsWith(".gz") ? gunzipSync(raw) : raw).toString("utf8"));
if (record.version !== 1) throw new Error(`a version ${record.version} record: this script reads version 1`);

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
  const view = boardOf(game);
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
const out = flag("out") ?? `${file.replace(/\.json(\.gz)?$/, "")}.replay.txt`;
writeFileSync(out, lines.join("") + (await encodeReplay(data)));
const who = record.seats.find((s) => s.player === seat);
console.log(
  `${out}: ${frames} boards over ${replay.applied} inputs, from ${who?.name ?? seat}'s seat${open ? ", every hand open" : ""}`,
);
