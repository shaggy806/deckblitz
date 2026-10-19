#!/usr/bin/env node
// Everything known about a card before authoring it, in one read:
//
//   - its Oracle text, stats and rulings (the offline snapshot);
//   - where it stands: in the pool, a stand-in in a sample deck, its place in
//     the backlog lists;
//   - every triage record that looked at it (data/sweep-*/, the commanders'
//     gaps file), each need read through the need vocabulary
//     (`needs-vocabulary.mjs`) — and flagged when it has been built since the
//     record was written, so a stale "blocked" is visible as one;
//   - for each line of its Oracle text, the abilities already in the pool that
//     read most like it, with the file they're in and how they're authored.
//
// The last part is the point: most of a card is something the engine already
// does for another card, worded a little differently. The match is TF-IDF
// cosine over normalised text (the card's own name and "this creature" become
// "~", numbers "N", reminder text dropped, single words and word pairs), so
// "sacrifice any number of other permanents" finds "exile any number of other
// nonland permanents you control". A high score is a lead, not a proof: read
// the analog's card before copying its shape.
//
// The analogs come from the pool index (`pool-index.mjs`: every ability of
// every card, read from the sources into `engine/.cache/pool-index.jsonl` by
// `npm run gen:cards`), rebuilt first when a card file is newer than it — no
// `npm run build` needed. Everything else reads sources and data directly.
// `card:find` searches the same index for a phrase of your own.
//
// Usage: node scripts/card-brief.mjs "Card Name" ["Another" ...]
//   --analogs N   analogs per Oracle line (default 3)
//   --width N     characters of each analog's authored shape to print
//                 (default 500; 0 prints it whole)
//   --no-rulings  leave the rulings out
//   --test        end with a test outline on src/test/harness.ts: one
//                 it.todo per ability and per ruling, to fill in

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { findCard, suggest } from "./oracle-snapshot.mjs";
import { frontName, loadRecords, loadVocabulary } from "./needs-vocabulary.mjs";
import { ENGINE, indexCorpus, loadPoolIndex, normalise } from "./pool-index.mjs";

/** The analogs' corpus — the pool's abilities with rules text (not tokens',
 * not bare keywords) — and the pool's card names (`poolNames()`, kept in the
 * index). */
async function loadCorpus() {
  const { docs, names } = await loadPoolIndex();
  return { docs: docs.filter((d) => d.kind !== "keyword" && d.file.startsWith("src/cards/pool/")), names };
}

// ------------------------------------------------------------------ status

function standIns() {
  const src = readFileSync(path.join(ENGINE, "src/sample-decks.ts"), "utf8");
  const out = new Map();
  let deck = "";
  for (const line of src.split("\n")) {
    const d = /^ {4}name: "([^"]+)"/.exec(line);
    if (d) deck = d[1];
    const m = /sub\("((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)"\)/.exec(line);
    if (m) out.set(JSON.parse(`"${m[1]}"`), { deck, substitute: JSON.parse(`"${m[2]}"`), reason: JSON.parse(`"${m[3]}"`) });
  }
  return out;
}

function listRank(file, name) {
  const p = path.join(ENGINE, "src/cards", file);
  if (!existsSync(p)) return undefined;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = /^\[([x ])\]\s+(\d+)\s+(.+?)\s{2,}/.exec(line);
    if (m && m[3] === name) return { rank: Number(m[2]), done: m[1] === "x" };
  }
  return undefined;
}

/** Keywords the engine models as `Keyword`s (cards/define.ts). */
function engineKeywords() {
  const src = readFileSync(path.join(ENGINE, "src/cards/define.ts"), "utf8");
  const start = src.indexOf("export type Keyword =");
  const end = src.indexOf(";", start);
  return new Set([...src.slice(start, end).matchAll(/"([a-z-]+)"/g)].map((m) => m[1]));
}

// ------------------------------------------------------------------ output

const clip = (s, width) => (width > 0 && s.length > width ? `${s.slice(0, width)}…` : s);

function oracleLines(card) {
  const faces = card.faces ?? [card];
  const out = [];
  for (const face of faces) {
    for (const line of (face.oracle_text ?? "").split("\n")) {
      if (line.trim() !== "") out.push({ face: face.name ?? card.name, line });
    }
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (name, fallback) => {
    const i = args.indexOf(name);
    return i >= 0 && args[i + 1] !== undefined ? Number(args[i + 1]) : fallback;
  };
  const optionValues = new Set(["--analogs", "--width"].flatMap((o) => {
    const i = args.indexOf(o);
    return i >= 0 ? [args[i + 1]] : [];
  }));
  const names = args.filter((a) => !a.startsWith("--") && !optionValues.has(a));
  if (names.length === 0) {
    console.error('Usage: node scripts/card-brief.mjs "Card Name" ["Another" ...] [--analogs N] [--width N] [--no-rulings]');
    process.exit(1);
  }
  const k = opt("--analogs", 3);
  const width = opt("--width", 500);
  const showRulings = !args.includes("--no-rulings");
  const outline = args.includes("--test");

  const vocab = loadVocabulary();
  const records = loadRecords();
  const corpus = await loadCorpus();
  const pool = corpus.names;
  const subs = standIns();
  const keywords = engineKeywords();
  const index = indexCorpus(corpus.docs);

  for (const asked of names) {
    const card = findCard(asked);
    if (card === undefined) {
      console.log(`## ${asked}: not in the Oracle snapshot.${suggest(asked).length ? ` Did you mean: ${suggest(asked).join(", ")}?` : ""}\n`);
      continue;
    }
    const name = card.name;
    const stats = [card.mana_cost, card.type_line, card.power !== undefined ? `${card.power}/${card.toughness}` : "", card.loyalty ? `loyalty ${card.loyalty}` : ""]
      .filter(Boolean)
      .join("  ");
    console.log(`## ${name}   ${stats}`);

    // Where it stands.
    const status = [];
    const inPool = pool.get(name) ?? pool.get(frontName(name));
    status.push(inPool ? `in the pool: ${inPool}` : "not in the pool");
    const sub = subs.get(name);
    if (sub) status.push(`stand-in in ${sub.deck}: ${sub.substitute} (${sub.reason})`);
    const cardRank = listRank("top-commander-cards.txt", name);
    if (cardRank) status.push(`top-5000 #${cardRank.rank}`);
    const cmdrRank = listRank("top-commanders.txt", name);
    if (cmdrRank) status.push(`top-500 commander #${cmdrRank.rank}`);
    if (card.edhrec_rank) status.push(`EDHREC ${card.edhrec_rank}`);
    console.log(status.join(" · "));
    if (card.keywords?.length) {
      const marks = card.keywords.map((kw) => {
        const key = kw.toLowerCase().replace(/\s+/g, "-");
        return keywords.has(key) ? `${kw} ✓` : `${kw}`;
      });
      console.log(`Keywords: ${marks.join(", ")}   (✓ = an engine Keyword; others are abilities, built or not)`);
    }

    console.log("\nOracle:");
    for (const { face, line } of oracleLines(card)) console.log(`  ${face !== name ? `[${face}] ` : ""}${line}`);
    if (showRulings && card.rulings?.length) {
      console.log(`\nRulings (${card.rulings.length}):`);
      for (const r of card.rulings) console.log(`  - ${typeof r === "string" ? r : (r.text ?? JSON.stringify(r))}`);
    }

    // Triage records.
    const mine = records.filter((r) => r.name === name || frontName(r.name) === frontName(name));
    console.log(`\nTriage records (${mine.length}):`);
    if (mine.length === 0) console.log("  none");
    for (const r of mine) {
      const needs = r.needs.map((raw) => {
        const key = vocab.canonical(raw);
        if (key === undefined) return `${raw} [not in the vocabulary]`;
        const shown = key === raw ? raw : `${raw} → ${key}`;
        if (vocab.isMeta(key)) return `${shown} [not a feature]`;
        if (vocab.builtSince(key, r.date)) return `${shown} [BUILT ${vocab.builtDates.get(key)}, since this record — recheck]`;
        if (vocab.isBuilt(key)) return `${shown} [built before this record: it means a part still missing]`;
        const fam = vocab.familyOf(key);
        return fam !== key ? `${shown} (family ${fam})` : shown;
      });
      console.log(`  ${r.batch} (${r.file}${r.date ? `, ${r.date}` : ""})`);
      for (const n of needs) console.log(`    - ${n}`);
      if (r.why) console.log(`    why: ${r.why}`);
    }

    // Analogs.
    console.log(`\nAnalogs (closest authored abilities per line; score 0–1):`);
    const exclude = new Set([name, frontName(name)]);
    for (const { line } of oracleLines(card)) {
      const grams = normalise(line, name);
      if (grams.filter((g) => !g.includes("_")).length <= 2) continue; // a bare keyword line
      console.log(`  ▸ ${clip(line, 160)}`);
      for (const hit of index.search(grams, k, exclude)) {
        console.log(`    ${hit.score.toFixed(2)}  ${hit.card} — ${hit.file}`);
        console.log(`          "${clip(hit.text, 200)}"`);
        console.log(`          ${clip(JSON.stringify(hit.spec), width)}`);
      }
    }
    if (outline) printOutline(card);
    console.log("");
  }
}

/** A describe block for the card on the shared harness: an `it.todo` per
 * Oracle line that does something, and per ruling — each ruling is usually
 * a test case. Fill in, delete what a sibling test already covers. */
function printOutline(card) {
  const q = (s) => JSON.stringify(s.length > 150 ? `${s.slice(0, 150)}…` : s);
  console.log(`\nTest outline (src/test/harness.ts — table, spawn, enter, cast, pick*, reads):`);
  console.log(`describe(${JSON.stringify(card.name)}, () => {`);
  for (const { line } of oracleLines(card)) {
    if (normalise(line, card.name).filter((g) => !g.includes("_")).length <= 2) continue;
    console.log(`  it.todo(${q(line.replace(/\s*\([^)]*\)/g, ""))});`);
  }
  for (const r of card.rulings ?? []) {
    const text = typeof r === "string" ? r : (r.text ?? "");
    if (text) console.log(`  it.todo(${q(`ruling: ${text}`)});`);
  }
  console.log("});");
}

await main();
