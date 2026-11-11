#!/usr/bin/env node
// Regenerates `src/cards/release-date.ts`: the day each card was first
// printed, for the card library's "Release date" sort.
//
//   npm run gen:release-dates -w engine [-- --refresh]
//
// The output is checked in, so nothing needs the network at runtime. Rerun it
// when the pool grows or a new set is out (with `gen:oracle`); a card it
// doesn't list sorts last.
//
// The Oracle snapshot can't answer this: it keeps one printing a card, and
// not the first. So this asks Scryfall for every card's first printing
// (`is:firstprint`, about 200 pages of 175 at Scryfall's search rate, two to
// three minutes), kept three days in `.cache/scryfall/firstprints.json`
// (`--refresh` asks again). The table holds the pool's cards and the ones in
// `client/public/missing-cards.json`, grouped by date so each name is written
// once. A double-faced card is listed under its front face, as a decklist
// names it; a split card under its whole name.
// Reads `dist/`: build first.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { POOL_CARDS } from "../dist/cards/generated.js";
import { isDeckableCard } from "../dist/cards/classify.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const out = join(root, "src", "cards", "release-date.ts");
const cachePath = join(root, ".cache", "scryfall", "firstprints.json");
const missingPath = join(root, "..", "client", "public", "missing-cards.json");
const refresh = process.argv.includes("--refresh");
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const HEADERS = { "User-Agent": "MTG-Engine/1.0 (release dates)", Accept: "application/json" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, tries = 5) {
  await sleep(500);
  const res = await fetch(url, { headers: HEADERS });
  if (res.status === 429 && tries > 1) {
    const wait = Number(res.headers.get("retry-after") ?? "30");
    console.error(`(Scryfall rate limit: waiting ${wait} s)`);
    await sleep((Number.isFinite(wait) ? wait + 1 : 30) * 1000);
    return getJson(url, tries - 1);
  }
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

/** Every card's first printing: `[name, released_at]` pairs. */
async function firstPrintings() {
  if (!refresh && existsSync(cachePath) && Date.now() - statSync(cachePath).mtimeMs < MAX_AGE_MS) {
    return JSON.parse(readFileSync(cachePath, "utf8"));
  }
  const pairs = [];
  let url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent("is:firstprint")}&unique=cards&order=released&dir=asc`;
  let page = 0;
  while (url) {
    const body = await getJson(url);
    for (const c of body.data) pairs.push([c.name, c.released_at]);
    page += 1;
    if (page % 20 === 0) console.error(`  ${pairs.length} of ${body.total_cards} cards…`);
    url = body.has_more ? body.next_page : null;
  }
  mkdirSync(dirname(cachePath), { recursive: true });
  writeFileSync(cachePath, JSON.stringify(pairs));
  return pairs;
}

// The earliest date each name was printed under: its whole name, and a
// double-faced card's front face too.
const earliest = new Map();
const note = (name, date) => {
  const had = earliest.get(name);
  if (had === undefined || date < had) earliest.set(name, date);
};
for (const [name, date] of await firstPrintings()) {
  if (typeof date !== "string") continue;
  note(name, date);
  if (name.includes(" // ")) note(name.split(" // ")[0], date);
}

const wanted = new Set(POOL_CARDS.filter(isDeckableCard).map((def) => def.name));
if (existsSync(missingPath)) {
  // Each row is an array, the name first.
  for (const row of JSON.parse(readFileSync(missingPath, "utf8")).cards ?? []) wanted.add(row[0]);
}

const byDate = new Map();
let unknown = 0;
for (const name of wanted) {
  const date = earliest.get(name) ?? earliest.get(name.split(" // ")[0]);
  if (date === undefined) {
    unknown += 1;
    continue;
  }
  if (!byDate.has(date)) byDate.set(date, []);
  byDate.get(date).push(name);
}

const lines = [...byDate.keys()]
  .sort()
  .map((date) => `  ${JSON.stringify(date)}: ${JSON.stringify(byDate.get(date).sort((a, b) => a.localeCompare(b)))},`);

const source = `/**
 * The day each card was first printed, for the card library's "Release date"
 * sort. **Generated** — run \`npm run gen:release-dates -w engine\`; do not
 * edit by hand.
 *
 * Grouped by date so each name is written once. A card missing from the
 * table has no known date ({@link releaseDateOf} answers \`null\`) and sorts
 * last.
 */

export const FIRST_PRINTED: Readonly<Record<string, readonly string[]>> = {
${lines.join("\n")}
};

let byName: Map<string, string> | null = null;

/** The day \`cardName\` was first printed, as \`YYYY-MM-DD\`, or \`null\` when
 * the table doesn't know it. */
export function releaseDateOf(cardName: string): string | null {
  if (byName === null) {
    byName = new Map();
    for (const [date, names] of Object.entries(FIRST_PRINTED)) {
      for (const name of names) byName.set(name, date);
    }
  }
  return byName.get(cardName) ?? null;
}
`;

const before = existsSync(out) ? readFileSync(out, "utf8") : null;
if (before === source) console.log(`release-date.ts already up to date (${wanted.size - unknown} cards, ${unknown} unknown)`);
else {
  writeFileSync(out, source, "utf8");
  console.log(`wrote release-date.ts: ${wanted.size - unknown} cards over ${byDate.size} dates, ${unknown} with no known date`);
}
