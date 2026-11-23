#!/usr/bin/env node
// How many different browsers the kept games in `games/` came from, by the
// tag each carries (`server/src/game-store.ts`, the client's `playerTag.ts`):
// ten games from one player aren't ten players.
//
//   npm run games:players                 # every day's folder under games/
//   npm run games:players -- 2026-11-22   # one day's
//
// A tag says two games came from one browser and nothing of whose. A game
// with none is one a room on the server or a table played, one posted before
// tags (2026-11-22), or one from a browser that keeps no storage.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "games");
const only = process.argv.slice(2).filter((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));

let days;
try {
  days = readdirSync(root).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && statSync(join(root, d)).isDirectory());
} catch {
  console.log(`no games here (${root}): npm run games:pull fetches them`);
  process.exit(0);
}
if (only.length > 0) days = days.filter((d) => only.includes(d));

/** tag (or null) → { games, finished, days, countries } */
const players = new Map();
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
    const seen = players.get(tag) ?? { games: 0, finished: 0, days: new Set(), countries: new Set() };
    seen.games += 1;
    if (record.end?.reason === "over") seen.finished += 1;
    seen.days.add(day);
    if (typeof record.country === "string") seen.countries.add(record.country);
    players.set(tag, seen);
  }
}

const tagged = [...players].filter(([tag]) => tag !== null).sort((a, b) => b[1].games - a[1].games);
const untagged = players.get(null);
console.log(`${total} game(s) over ${days.length} day(s): ${tagged.length} browser(s) by tag${untagged ? `, ${untagged.games} game(s) with no tag` : ""}`);
for (const [tag, seen] of tagged) {
  console.log(
    `  ${tag}  ${String(seen.games).padStart(4)} game(s), ${String(seen.finished).padStart(3)} played out, ${seen.days.size} day(s)${seen.countries.size > 0 ? `, ${[...seen.countries].join("/")}` : ""}`,
  );
}
