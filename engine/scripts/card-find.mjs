#!/usr/bin/env node
// Which cards in the pool already do this? A search over every authored
// ability — its printed text and its authored shape — answered from the pool
// index (`pool-index.mjs`, `engine/.cache/pool-index.jsonl`) in well under a
// second, so it's the first thing to run when a card needs an example to copy.
//
// The phrase is ranked the way `card:brief` ranks its analogs: TF-IDF cosine
// over normalised text (numbers read as "N", "this creature" as "~", reminder
// text dropped, single words and word pairs), one ability per card. A phrase no
// ability's words match falls back to a plain substring search of the text and
// the shape. `--json` narrows to abilities whose shape contains a substring
// (`--json create-token`, `--json '"on":"dies"'`); with no phrase it lists them
// smallest shape first, the easiest to copy.
//
// Usage: node scripts/card-find.mjs "<phrase>" [--kind K] [--json "<substring>"]
//   --kind K      only abilities of this kind: triggered, activated, static,
//                 spell, keyword, or the field one sits under (modes,
//                 chapters, grantsTriggered …); a prefix is enough
//   --json S      only abilities whose shape (compact JSON) contains S,
//                 ignoring case — and quotes, when S has none (`on:dies`)
//   --limit N     how many to print (default 10)
//   --width N     characters of each shape to print (default 500; 0 = whole)
//   --tokens      include token definitions (left out by default)

import { indexCorpus, loadPoolIndex, normalise } from "./pool-index.mjs";

const VALUE_OPTIONS = ["--kind", "--json", "--limit", "--width"];

function parseArgs(argv) {
  const opts = { phrase: [], kind: undefined, json: undefined, limit: 10, width: 500, tokens: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (VALUE_OPTIONS.includes(a)) {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} needs a value`);
      if (a === "--kind") opts.kind = v.toLowerCase();
      else if (a === "--json") opts.json = v.toLowerCase();
      else if (a === "--limit") opts.limit = Number(v);
      else opts.width = Number(v);
    } else if (a === "--tokens") opts.tokens = true;
    else if (a.startsWith("--")) throw new Error(`unknown option ${a}`);
    else opts.phrase.push(a);
  }
  opts.phrase = opts.phrase.join(" ").trim();
  return opts;
}

const clip = (s, width) => (width > 0 && s.length > width ? `${s.slice(0, width)}…` : s);

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    opts = undefined;
  }
  if (opts === undefined || (opts.phrase === "" && opts.json === undefined && opts.kind === undefined)) {
    console.error('Usage: node scripts/card-find.mjs "<phrase>" [--kind triggered] [--json "<substring of spec>"] [--limit N] [--width N] [--tokens]');
    process.exit(1);
  }

  const { docs: all } = await loadPoolIndex();
  const docs = opts.tokens ? all : all.filter((d) => d.file.startsWith("src/cards/pool/"));
  const specText = new Map();
  const specOf = (d) => {
    let s = specText.get(d);
    if (s === undefined) specText.set(d, (s = JSON.stringify(d.spec)));
    return s;
  };
  // A --json without quotes matches the shape with its quotes dropped, so
  // `on:dies` finds `"on":"dies"` (and a shell that eats quotes doesn't matter).
  const quoted = opts.json?.includes('"') ?? false;
  const shapeMatches = (d) => {
    const s = specOf(d).toLowerCase();
    return (quoted ? s : s.replaceAll('"', "")).includes(opts.json);
  };
  const accept = (d) =>
    (opts.kind === undefined || d.kind.toLowerCase().startsWith(opts.kind) || d.where.toLowerCase().startsWith(opts.kind)) &&
    (opts.json === undefined || shapeMatches(d));

  let hits = [];
  let how = "";
  const grams = opts.phrase === "" ? [] : normalise(opts.phrase);
  if (grams.length > 0) {
    // Ranked: the same corpus card:brief scores against (abilities with
    // rules text, bare keywords left out), filtered after scoring.
    const index = indexCorpus(docs.filter((d) => d.kind !== "keyword"));
    hits = index.search(grams, opts.limit, new Set(), accept);
    how = "ranked by likeness to the phrase";
  }
  if (hits.length === 0) {
    // Unranked: a substring of text or shape (or just the filters), the
    // smallest shape first.
    const needle = opts.phrase.toLowerCase();
    const seen = new Set();
    const matches = docs
      .filter((d) => accept(d) && (needle === "" || d.text.toLowerCase().includes(needle) || specOf(d).toLowerCase().includes(needle)))
      .sort((a, b) => specOf(a).length - specOf(b).length);
    for (const d of matches) {
      if (seen.has(d.card)) continue;
      seen.add(d.card);
      hits.push(d);
      if (hits.length >= opts.limit) break;
    }
    how = needle === "" ? "smallest shape first" : "substring match, smallest shape first";
  }

  const filters = [opts.kind && `kind ${opts.kind}`, opts.json && `shape contains '${opts.json}'`].filter(Boolean);
  console.log(`${hits.length} abilit${hits.length === 1 ? "y" : "ies"}${filters.length ? ` (${filters.join(", ")})` : ""}, ${how}, one per card:`);
  for (const hit of hits) {
    const score = hit.score === undefined ? "    " : hit.score.toFixed(2);
    console.log(`  ${score}  ${hit.card} — ${hit.file}  [${hit.kind}]`);
    console.log(`        "${clip(hit.text, 200)}"`);
    // A keyword's line is its name twice: print it once.
    if (specOf(hit) !== JSON.stringify(hit.text)) console.log(`        ${clip(specOf(hit), opts.width)}`);
  }
}

await main();
