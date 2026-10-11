#!/usr/bin/env node
// The card backlog set by set: each set's own new cards — its Commander-legal
// first printings — newest set first, keeping the ones popular *for their
// set*. A card from a set out last month isn't ranked high on EDHREC yet,
// however often it's played, so the threshold is a share of each set (by
// default its top half by EDHREC rank), not one rank for every set.
//
//   npm run cards:sets -w engine -- --next 60          the next untriaged cards, set by set
//   npm run cards:sets -w engine -- --sets [N]         the newest N sets (default 12): new cards, done, left
//   npm run cards:sets -w engine -- --set FRA          one set's cards above the threshold, each marked
//   … --top 50        the share of each set's ranked new cards kept (percent, default 50)
//   … --unranked      keep the cards EDHREC hasn't ranked yet too (a brand-new set's)
//   … --refresh       fetch Scryfall's set list and first printings again (cached 3 days)
//
// Which sets: Scryfall's paper expansions, core sets, Commander products,
// draft-innovation sets, masters sets and starter products released by today;
// a card counts for the set that first printed it (`is:firstprint`). "Done"
// is a pool card by that name (a double-faced card by its front face too);
// "triaged" is a record in `data/sweep-*/` that named it, authored or
// blocked — the same skip `cards:needs -- --next` makes. A card missing from
// the Oracle snapshot (`data/oracle/cards.jsonl`) can't be briefed or
// scaffolded until `npm run gen:oracle -w engine` refreshes it: flagged.
// Reads `dist/`: build first.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { POOL_CARDS, TOKEN_CARDS } from "../dist/cards/generated.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const cacheDir = join(root, ".cache", "scryfall", "sets");
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};

const SET_TYPES = new Set(["expansion", "core", "commander", "draft_innovation", "masters", "starter"]);
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const HEADERS = { "User-Agent": "MTG-Engine/1.0 (set backlog)", Accept: "application/json" };
const top = Number(option("--top", "50"));
const withUnranked = flag("--unranked");
const refresh = flag("--refresh");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A cached Scryfall JSON fetch: fresh for three days unless `--refresh`. */
async function cached(file, fetcher) {
  const path = join(cacheDir, file);
  if (!refresh && existsSync(path) && Date.now() - statSync(path).mtimeMs < MAX_AGE_MS) {
    return JSON.parse(readFileSync(path, "utf8"));
  }
  const data = await fetcher();
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(path, JSON.stringify(data));
  return data;
}

async function getJson(url) {
  // Scryfall asks for 50–100 ms between requests.
  await sleep(100);
  const res = await fetch(url, { headers: HEADERS });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

/** Every set worth walking, newest first. */
async function sets() {
  const all = await cached("sets.json", async () => (await getJson("https://api.scryfall.com/sets")).data);
  const today = new Date().toISOString().slice(0, 10);
  return all
    .filter((s) => !s.digital && SET_TYPES.has(s.set_type) && s.released_at !== undefined && s.released_at <= today)
    .sort((a, b) => b.released_at.localeCompare(a.released_at) || a.code.localeCompare(b.code));
}

/** A set's Commander-legal first printings: name, EDHREC rank (or null), type line. */
async function newCards(code) {
  return cached(`${code}.json`, async () => {
    const out = [];
    const q = encodeURIComponent(`e:${code} is:firstprint legal:commander`);
    let url = `https://api.scryfall.com/cards/search?q=${q}&order=edhrec&unique=cards`;
    while (url) {
      const page = await getJson(url);
      if (page === null) break;
      for (const c of page.data) out.push({ name: c.name, rank: c.edhrec_rank ?? null, type: c.type_line ?? "" });
      url = page.has_more ? page.next_page : null;
    }
    return out;
  });
}

// What's done and what's been looked at.
const pool = new Set();
for (const def of [...POOL_CARDS, ...TOKEN_CARDS]) pool.add(def.name);
const inPool = (name) => pool.has(name) || pool.has(name.split(" // ")[0]);
const triaged = new Set();
for (const dir of ["sweep-2", "sweep-3"]) {
  const d = join(root, "data", dir);
  if (!existsSync(d)) continue;
  for (const f of readdirSync(d).filter((f) => f.endsWith(".json"))) {
    const r = JSON.parse(readFileSync(join(d, f), "utf8"));
    for (const a of r.authored ?? []) triaged.add(a.name);
    for (const b of r.blocked ?? []) triaged.add(b.name);
  }
}
const isTriaged = (name) => triaged.has(name) || triaged.has(name.split(" // ")[0]);
const snapshot = new Set();
for (const line of readFileSync(join(root, "data", "oracle", "cards.jsonl"), "utf8").split("\n")) {
  const m = /^\{"name":"((?:[^"\\]|\\.)*)"/.exec(line);
  if (m) snapshot.add(JSON.parse(`"${m[1]}"`));
}

/** The cards a set keeps: its ranked new cards' top share by EDHREC rank,
 * plus (with `--unranked`) the ones not ranked yet. */
function aboveThreshold(cards) {
  const ranked = cards.filter((c) => c.rank !== null).sort((a, b) => a.rank - b.rank);
  const kept = ranked.slice(0, Math.ceil((ranked.length * top) / 100));
  return withUnranked ? [...kept, ...cards.filter((c) => c.rank === null)] : kept;
}

const mark = (c) =>
  inPool(c.name) ? "done" : isTriaged(c.name) ? "triaged" : snapshot.has(c.name) ? "todo" : "todo (not in the snapshot — npm run gen:oracle)";

const all = await sets();
if (option("--set") !== undefined) {
  const code = option("--set").toLowerCase();
  const set = all.find((s) => s.code === code);
  if (set === undefined) throw new Error(`no set ${code} among the sets walked`);
  const cards = aboveThreshold(await newCards(code));
  console.log(`${set.name} (${code.toUpperCase()}, ${set.released_at}, ${set.set_type}) — ${cards.length} above the threshold (top ${top}%):`);
  for (const c of cards) console.log(`  ${String(c.rank ?? "—").padStart(6)}  ${c.name}  — ${c.type}  [${mark(c)}]`);
} else if (flag("--sets")) {
  const n = Number(option("--sets", "12"));
  console.log(`set        released    new  above  done  triaged  left   (threshold: top ${top}% by EDHREC rank${withUnranked ? ", unranked kept" : ""})`);
  for (const set of all.slice(0, n)) {
    const cards = await newCards(set.code);
    const kept = aboveThreshold(cards);
    const done = kept.filter((c) => inPool(c.name)).length;
    const tri = kept.filter((c) => !inPool(c.name) && isTriaged(c.name)).length;
    console.log(
      `${set.code.toUpperCase().padEnd(10)} ${set.released_at}  ${String(cards.length).padStart(4)}  ${String(kept.length).padStart(5)}  ${String(done).padStart(4)}  ${String(tri).padStart(7)}  ${String(kept.length - done - tri).padStart(4)}   ${set.name}`,
    );
  }
} else {
  const n = Number(option("--next", "60"));
  let listed = 0;
  for (const set of all) {
    if (listed >= n) break;
    const left = aboveThreshold(await newCards(set.code)).filter((c) => !inPool(c.name) && !isTriaged(c.name));
    if (left.length === 0) continue;
    console.log(`${set.name} (${set.code.toUpperCase()}, ${set.released_at}):`);
    for (const c of left.slice(0, n - listed)) {
      console.log(`  ${String(c.rank ?? "—").padStart(6)}  ${c.name}  — ${c.type}${snapshot.has(c.name) ? "" : "  [not in the snapshot — npm run gen:oracle]"}`);
      listed += 1;
    }
  }
  console.log(`${listed} untriaged card(s), newest set first (top ${top}% of each set by EDHREC rank${withUnranked ? ", unranked kept" : ""}).`);
}
