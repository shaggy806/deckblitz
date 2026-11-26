#!/usr/bin/env node
// How many different browsers the kept games in `games/` came from, by the
// tag each carries (`server/src/game-store.ts`, the client's `playerTag.ts`):
// ten games from one player aren't ten players.
//
//   npm run games:players                 # every day's folder under games/
//   npm run games:players -- 2026-11-22   # one day's
//   npm run games:players -- --by-day     # a line a day: players who began a
//                                         # game, and who played one out
//
// `--dir <path>` reads another folder of day folders. `--tags-json` prints,
// instead of counts, each day's tags that began and finished a game, for
// `--merge -` on another run to read from its input: that is how the
// site-usage skill counts the games still on the box with the ones fetched
// here, a day's player who has games in both counted once —
//
//   ssh deckblitz "node - --dir /opt/mtg-engine/games --tags-json" < scripts/games-players.mjs \
//     | node scripts/games-players.mjs --by-day --merge -
//
// A tag says two games came from one browser and nothing of whose. A game
// with none is one a room on the server or a table played, one posted before
// tags (2026-11-22), or one from a browser that keeps no storage. A game
// "played out" is one whose record ends with the game over (`end.reason`
// "over"), not one left or still being sent.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
};
// From a file, the folder beside this script's; read from input (`node -`), the one given.
const root = value("--dir") ?? (process.argv[1] ? join(process.argv[1], "..", "..", "games") : "games");
const only = args.filter((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));

let days = [];
try {
  days = readdirSync(root).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && statSync(join(root, d)).isDirectory());
} catch {
  if (!flag("--merge")) {
    console.log(`no games here (${root}): npm run games:pull fetches them`);
    process.exit(0);
  }
}
if (only.length > 0) days = days.filter((d) => only.includes(d));

/** tag (or null) → { games, finished, days, countries } */
const players = new Map();
/** day → { began: Set<tag>, finished: Set<tag>, games, played } */
const byDay = new Map();
const dayOf = (day) => {
  let d = byDay.get(day);
  if (d === undefined) byDay.set(day, (d = { began: new Set(), finished: new Set(), games: 0, played: 0 }));
  return d;
};
let total = 0;
for (const day of days.sort()) {
  for (const file of readdirSync(join(root, day))) {
    if (!file.endsWith(".json.gz")) continue;
    let record;
    try {
      record = JSON.parse(gunzipSync(readFileSync(join(root, day, file))).toString("utf8"));
    } catch {
      continue;
    }
    total += 1;
    const tag = typeof record.tag === "string" ? record.tag : null;
    const over = record.end?.reason === "over";
    const seen = players.get(tag) ?? { games: 0, finished: 0, days: new Set(), countries: new Set() };
    seen.games += 1;
    if (over) seen.finished += 1;
    seen.days.add(day);
    if (typeof record.country === "string") seen.countries.add(record.country);
    players.set(tag, seen);
    if (tag !== null) {
      const d = dayOf(day);
      d.games += 1;
      d.began.add(tag);
      if (over) {
        d.played += 1;
        d.finished.add(tag);
      }
    }
  }
}

if (flag("--tags-json")) {
  const out = {};
  for (const [day, d] of byDay) out[day] = { began: [...d.began], finished: [...d.finished], games: d.games, played: d.played };
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}

if (value("--merge") === "-") {
  const input = readFileSync(0, "utf8").trim();
  const other = input === "" ? {} : JSON.parse(input);
  for (const [day, o] of Object.entries(other)) {
    if (only.length > 0 && !only.includes(day)) continue;
    const d = dayOf(day);
    for (const t of o.began) d.began.add(t);
    for (const t of o.finished) d.finished.add(t);
    d.games += o.games;
    d.played += o.played;
  }
}

if (flag("--by-day")) {
  const rows = [...byDay].sort((a, b) => b[0].localeCompare(a[0]));
  const all = { began: new Set(), finished: new Set(), games: 0, played: 0 };
  console.log("  DAY         BEGAN  FINISHED   GAMES  PLAYED OUT   (players are browsers, by tag; tagged games only)");
  for (const [day, d] of rows) {
    for (const t of d.began) all.began.add(t);
    for (const t of d.finished) all.finished.add(t);
    all.games += d.games;
    all.played += d.played;
    console.log(`  ${day}  ${String(d.began.size).padStart(5)}  ${String(d.finished.size).padStart(8)}  ${String(d.games).padStart(6)}  ${String(d.played).padStart(10)}`);
  }
  console.log(`  all days    ${String(all.began.size).padStart(5)}  ${String(all.finished.size).padStart(8)}  ${String(all.games).padStart(6)}  ${String(all.played).padStart(10)}`);
  process.exit(0);
}

const tagged = [...players].filter(([tag]) => tag !== null).sort((a, b) => b[1].games - a[1].games);
const untagged = players.get(null);
console.log(`${total} game(s) over ${days.length} day(s): ${tagged.length} browser(s) by tag${untagged ? `, ${untagged.games} game(s) with no tag` : ""}`);
for (const [tag, seen] of tagged) {
  console.log(
    `  ${tag}  ${String(seen.games).padStart(4)} game(s), ${String(seen.finished).padStart(3)} played out, ${seen.days.size} day(s)${seen.countries.size > 0 ? `, ${[...seen.countries].join("/")}` : ""}`,
  );
}
