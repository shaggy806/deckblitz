// Writes `data/tooling-precons.json`: every Wizards Commander precon the pool
// can play exactly as printed that isn't a starter deck already — decks for
// the bot tooling to seat (`tool-decks.mjs`: `bot:watch`, `bot:losses`,
// `bot:judge`), so the bots are watched on cards and plans the fourteen
// starter decks don't have. Tooling only, on purpose: the file is read by
// scripts, never by `src/`, so no deck in it reaches the engine's exports,
// the server or the client, and no player is offered one.
//
//   node scripts/gen-tooling-precons.mjs [--decks <dir>]
//
// Reads MTGJSON's per-deck files (https://mtgjson.com/downloads/all-decks/,
// one `<Name>_<SET>.json` per product) from the git-ignored
// `.scratch/precons/decks/` where the precon survey left them (as
// `gen-starter-printings.mjs` does); it downloads nothing. Run after
// `npm run build -w engine`: a deck is kept only if the built pool has every
// card and `validateCommanderDeck` calls it legal. No stand-ins: a deck one
// card short is left out and listed, and comes in on a rerun once the card
// lands. A reprint of a deck (the same hundred cards under another product)
// is kept once, under its first release.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { SAMPLE_DECKS, createDefaultRegistry, validateCommanderDeck } from "../dist/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const at = args.indexOf("--decks");
const dir = at >= 0 ? args[at + 1] : join(here, "..", "..", ".scratch", "precons", "decks");
const out = join(here, "..", "data", "tooling-precons.json");

const TYPES = new Set(["Commander Deck", "MTGO Commander Deck"]);
const registry = createDefaultRegistry();
/** MTGJSON names a double-faced or Adventure card "Front // Back"; the pool
 * keys it by its front face, and a split card by both halves. */
const poolName = (name) => (registry.has(name) ? name : registry.has(name.split(" // ")[0]) ? name.split(" // ")[0] : null);

const starters = new Set(SAMPLE_DECKS.map((d) => d.name));
const kept = [];
const short = [];
const illegal = [];
const seen = new Map();

const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
const decks = files
  .map((file) => JSON.parse(readFileSync(join(dir, file), "utf8")).data)
  .filter((d) => d !== undefined && TYPES.has(d.type))
  .sort((a, b) => a.releaseDate.localeCompare(b.releaseDate) || a.name.localeCompare(b.name));

for (const deck of decks) {
  if (starters.has(deck.name)) continue;
  const missing = new Set();
  const named = (entries) =>
    entries.flatMap((card) => {
      const name = poolName(card.name);
      if (name === null) missing.add(card.name);
      return Array(card.count ?? 1).fill(name ?? card.name);
    });
  const commanders = named(deck.commander ?? []);
  const cards = named(deck.mainBoard ?? []);
  if (missing.size > 0) {
    short.push(`${deck.name} (${deck.code}): ${[...missing].join(", ")}`);
    continue;
  }
  const signature = [...commanders, "|", ...[...cards].sort()].join("\n");
  if (seen.has(signature)) continue;
  const verdict = validateCommanderDeck({ commanders, cards }, registry);
  if (!verdict.legal) {
    illegal.push(`${deck.name} (${deck.code}): ${verdict.violations.slice(0, 3).join("; ")}`);
    continue;
  }
  seen.set(signature, deck.name);
  kept.push({ name: deck.name, code: deck.code, released: deck.releaseDate, commanders, cards });
}

// A name two products share (a deck revised between printings) carries its
// set code, so every deck can be asked for by name.
const count = new Map();
for (const deck of kept) count.set(deck.name, (count.get(deck.name) ?? 0) + 1);
for (const deck of kept) if (count.get(deck.name) > 1) deck.name = `${deck.name} (${deck.code})`;
// `--decks "A,B;C,D"` splits on these.
for (const deck of kept) deck.name = deck.name.replace(/[,;]/g, "");

kept.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(out, `[\n${kept.map((deck) => JSON.stringify(deck)).join(",\n")}\n]\n`);
console.log(`${kept.length} decks written to data/tooling-precons.json (${decks.length} Commander precons read, ${starters.size} starter decks skipped by name)`);
if (illegal.length > 0) console.log(`\nIn the pool but not a legal deck here (${illegal.length}):\n  ${illegal.join("\n  ")}`);
if (args.includes("--short")) console.log(`\nA card or more short (${short.length}):\n  ${short.join("\n  ")}`);
else console.log(`${short.length} more are a card or more short (--short lists them)`);
