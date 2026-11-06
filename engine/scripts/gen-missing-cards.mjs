// Regenerates `client/public/missing-cards.json`: every Commander-legal card
// the pool doesn't have yet, for the card library's "Not in the pool yet"
// filter (the user, 2026-11-06).
//
//   npm run gen:missing-cards -w engine
//
// Runs on `dist/` (build first). `npm run verify` reruns it with the backlog
// re-marks, so it shrinks as cards land; commit it when it changes. The library
// also drops any name its pool has, so a list a batch behind only shows a card
// that has since landed as present, never the other way round.
//
// From the checked-in Oracle snapshot (`data/oracle/cards.jsonl`), so no
// network. It's a static file the library fetches only when the filter is
// turned on — the snapshot itself (~39 MB) is far too big to ship, and this is
// ~120 KB gzipped. One row per card, a tuple to keep it small:
//
//   [name, printing, typeLine, colors, edhrecRank | null, manaValue]
//
// `printing` is a Scryfall card id, which `resolveArtUrl` turns into the card's
// image on Scryfall's CDN. Rules text is left out (it would triple the size);
// the library links each card to Scryfall instead.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { POOL_CARDS } from "../dist/cards/generated.js";
import { SNAPSHOT_PATH } from "./oracle-snapshot.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "..", "client", "public", "missing-cards.json");
const meta = JSON.parse(readFileSync(join(dirname(SNAPSHOT_PATH), "meta.json"), "utf8"));

const pool = new Set(POOL_CARDS.map((def) => def.name));

const rows = [];
for (const line of readFileSync(SNAPSHOT_PATH, "utf8").split("\n")) {
  if (line.trim() === "") continue;
  const card = JSON.parse(line);
  // Commander-legal, or banned there (the pool keeps those for casual play).
  if (card.commander !== "legal" && card.commander !== "banned") continue;
  const faces = card.faces ?? card.card_faces ?? [];
  if (pool.has(card.name) || faces.some((f) => pool.has(f.name))) continue;
  const front = faces[0] ?? card;
  rows.push([
    card.name,
    card.printing,
    card.type_line ?? front.type_line ?? "",
    (card.colors ?? front.colors ?? []).join(""),
    typeof card.edhrec_rank === "number" ? card.edhrec_rank : null,
    card.cmc ?? 0,
  ]);
}
rows.sort((a, b) => a[0].localeCompare(b[0]));

// One row a line, so a regeneration's diff shows the cards that landed.
const body = rows.map((r) => JSON.stringify(r)).join(",\n");
const json = `{"oracle":${JSON.stringify(meta.oracle_cards ?? null)},"cards":[\n${body}\n]}\n`;
mkdirSync(dirname(out), { recursive: true });
let before = null;
try {
  before = readFileSync(out, "utf8");
} catch {
  // first run
}
if (before === json) console.log(`missing-cards.json already up to date (${rows.length} cards not in the pool)`);
else {
  writeFileSync(out, json, "utf8");
  console.log(`wrote missing-cards.json: ${rows.length} cards not in the pool`);
}
