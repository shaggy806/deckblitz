#!/usr/bin/env node
// The rank goal's work list: every card up to an EDHREC rank that isn't in the
// pool, best rank first, with its latest triage record's open need keys and
// the size that record gave what it needs ("small", "major", or "unsized" for
// a record written before sizes were recorded, B297).
//
// Usage: node scripts/rank-goal.mjs [--rank 10000] [--size small|major|unsized]
//                                   [--keys] [--json]
//   --keys   group by need key instead: each open key with its cards, the
//            keys serving the best-ranked cards first (one build unit a key)
//   --json   the list as JSON (name, rank, keys, size, why, batch)
//   --lane <name>  only the keys of one lane (`data/lanes.json`: the part of
//            the engine a key is built in, for parallel feature agents —
//            build-family's overnight lanes), and the cards waiting on them;
//            with --keys, each key's lane is shown ("?" for one not laned)
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { frontName, keysOf, latestByCard, loadRecords, loadVocabulary, poolNames } from "./needs-vocabulary.mjs";
import { findCard, loadSnapshot } from "./oracle-snapshot.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const ceiling = Number(option("--rank") ?? 10000);
const wantSize = option("--size");
const wantLane = option("--lane");
const lanes = JSON.parse(readFileSync(path.join(here, "..", "data", "lanes.json"), "utf8"));
if (wantLane !== undefined && lanes.lanes[wantLane] === undefined) {
  console.error(`No lane "${wantLane}": ${Object.keys(lanes.lanes).join(", ")}`);
  process.exit(1);
}
const laneOf = (key) => lanes.keys[key] ?? "?";

const vocab = loadVocabulary();
const pool = poolNames();
const latest = latestByCard(loadRecords());
/** The size a record carries, read from its batch file (the loader drops it). */
const sizes = new Map();
for (const [, record] of latest) {
  if (!record.file.startsWith("data/sweep-3/")) continue;
  const data = JSON.parse(readFileSync(path.join(here, "..", record.file), "utf8"));
  for (const b of data.blocked ?? []) if (b.size !== undefined) sizes.set(`${record.file}|${b.name}`, b.size);
}

const cards = [];
const recorded = new Set();
for (const [name, record] of latest) {
  recorded.add(name);
  if (pool.has(name) || pool.has(record.name)) continue;
  const card = findCard(record.name) ?? findCard(name);
  const rank = card?.edhrec_rank;
  if (rank === undefined || rank === null || rank > ceiling) continue;
  cards.push({
    name: record.name,
    rank,
    keys: keysOf(record, vocab).filter((k) => !vocab.isBuilt(k)),
    size: sizes.get(`${record.file}|${record.name}`) ?? "unsized",
    why: record.why,
    batch: String(record.batch),
  });
}
for (const card of loadSnapshot().entries) {
  const rank = card.edhrec_rank;
  if (rank === undefined || rank === null || rank > ceiling || card.commander !== "legal") continue;
  const front = frontName(card.name);
  if (pool.has(card.name) || pool.has(front) || recorded.has(front)) continue;
  cards.push({ name: card.name, rank, keys: [], size: "untriaged", why: "", batch: "" });
}
cards.sort((a, b) => a.rank - b.rank);
const shown = cards.filter(
  (c) => (wantSize === undefined || c.size === wantSize) && (wantLane === undefined || c.keys.some((k) => laneOf(k) === wantLane)),
);

if (args.includes("--json")) {
  console.log(JSON.stringify(shown, null, 1));
} else if (args.includes("--keys")) {
  const byKey = new Map();
  for (const c of shown) {
    for (const k of c.keys.length > 0 ? c.keys : ["(no open key: recheck)"]) {
      if (wantLane !== undefined && laneOf(k) !== wantLane) continue;
      byKey.set(k, [...(byKey.get(k) ?? []), c]);
    }
  }
  const units = [...byKey].sort((a, b) => a[1][0].rank - b[1][0].rank);
  console.log(
    `${units.length} keys over ${shown.length} cards to rank ${ceiling}${wantSize ? `, size ${wantSize}` : ""}${wantLane ? `, lane ${wantLane}` : ""}:`,
  );
  for (const [key, list] of units) {
    // A major isn't laned: the user approves each one, and it runs alone.
    const laned = laneOf(key) === "?" && list.every((c) => c.size === "major") ? "major" : laneOf(key);
    const lane = wantLane === undefined ? `  [${laned}]` : "";
    console.log(`${key}${lane}  ← ${list.map((c) => `${c.name} (${c.rank}${c.keys.length > 1 ? `, +${c.keys.length - 1} more key` : ""})`).join("; ")}`);
  }
} else {
  const tally = {};
  for (const c of cards) tally[c.size] = (tally[c.size] ?? 0) + 1;
  console.log(`${cards.length} cards to rank ${ceiling} not in the pool: ${Object.entries(tally).map(([k, n]) => `${n} ${k}`).join(", ")}`);
  for (const c of shown) console.log(`${String(c.rank).padStart(6)}  ${c.size.padEnd(9)} ${c.name}  ← ${c.keys.join(", ") || "-"}  [${c.batch}]`);
}
