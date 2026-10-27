// The pool's abilities, indexed once instead of loaded on every run.
//
// `card:brief`, `card:find` and `card:vocab` all want the same thing: every
// card definition in `src/cards/pool/` and `src/cards/tokens/`, walked for its
// abilities or its vocabulary. Importing ~15,000 card modules to get it took
// seconds on every run (minutes on a loaded Windows machine), so this module
// builds two files under `engine/.cache/` (gitignored) and the tools read them:
//
//   - `pool-index.jsonl` — a header line (version, build time, file count, and
//     `poolNames()`'s card-name → file map), then one line per ability:
//     `{ card, file, kind, where, text, spec, grams }`. `kind` is triggered,
//     activated, static, spell, keyword, or the field the ability sits under
//     when it's none of those (`modes`, `chapters` …); `spec` is the ability's
//     authored shape (`text` and nulls dropped), `grams` its normalised words
//     for the TF-IDF match (`normalise` below). Keyword lines carry the
//     keyword as both text and spec, and no grams.
//   - `pool-vocab.json` — for `card:vocab`: every definition's vocabulary
//     terms, in the order its walk met them (`vocabTerms`), as indexes into one
//     term table, with the definition's size.
//
// Both are built straight from the sources (rolldown bundles every card file
// into one module, a few seconds), so they never wait on `npm run build`.
// `npm run gen:cards` (and so every engine build and typecheck) writes them
// when they're stale (`ensurePoolIndex`); the tools' loads check every source
// file's mtime against the index's build time (on a worker thread, while the
// index is read) and rebuild a stale one rather than answer from it. Stale
// means: a card file, or a helper they call (`src/cards/*.ts`, `src/*.ts`),
// newer than the build; a card file added or removed; or an index written by
// an older version of this script (`VERSION`).

import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Worker } from "node:worker_threads";

import { poolNames } from "./needs-vocabulary.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
export const ENGINE = path.join(here, "..");
const CACHE = path.join(ENGINE, ".cache");
export const INDEX_FILE = path.join(CACHE, "pool-index.jsonl");
export const VOCAB_FILE = path.join(CACHE, "pool-vocab.json");
const VERSION = 3; // 3: `names` carries a multi-face card's every name (poolNames' faces)
const SUBDIRS = ["pool", "tokens"];
/** Besides the card files themselves, what shapes a definition: the helpers
 * and vocabulary a card file calls (`src/cards/*.ts`, `src/*.ts`). */
const SHAPING_DIRS = ["src/cards", "src"];

// ------------------------------------------------------------------ text

const NUMBER_WORDS =
  /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|half)\b/g;
const SELF_NOUNS =
  /\bthis (creature|artifact|enchantment|land|permanent|card|spell|equipment|aura|vehicle|saga|planeswalker|class|room|token|battle|siege|case|ability)\b/g;
const STOP = new Set(["a", "an", "the", "of", "to", "and", "is", "be", "as", "that", "on", "in", "for", "with", "s"]);

/** Comparable words for a rules text written for `name`: lower case, the
 * card's own name and "this creature" become "~", numbers "N", reminder text
 * dropped; single words and word pairs. */
export function normalise(text, name) {
  let t = text.toLowerCase().replace(/\([^)]*\)/g, " ");
  if (name) {
    const full = name.toLowerCase();
    const short = full.split(",")[0];
    for (const n of [full, short]) if (n.length > 2) t = t.split(n).join(" ~ ");
  }
  t = t
    .replace(SELF_NOUNS, " ~ ")
    .replace(/\{t\}/g, " tapsymbol ")
    .replace(/\{q\}/g, " untapsymbol ")
    .replace(/\{[^}]+\}/g, " mana ")
    .replace(NUMBER_WORDS, " N ")
    // X stays its own word: "mana value X or less" is a different engine
    // question from "mana value 3 or less".
    .replace(/\bx\b/g, " X ")
    .replace(/\b(his|her|their)\b/g, "its")
    .replace(/\b(he|she|him)\b/g, "it")
    .replace(/[−–—]/g, " - ");
  const words = (t.match(/[a-z~NX+\-']+/g) ?? []).filter((w) => !STOP.has(w) && w !== "-");
  const grams = [...words];
  for (let i = 0; i + 1 < words.length; i++) grams.push(`${words[i]}_${words[i + 1]}`);
  return grams;
}

/** An authored shape as one line of JSON: its `text` (already shown) and
 * null fields left out. */
export const shapeOf = (shape) =>
  JSON.stringify(shape, (key, value) => (key === "text" || value === null ? undefined : value));

// ------------------------------------------------------------------ walks

/** Every ability of a definition with its own rules text: any object under
 * the definition that has a `text` beside other fields (triggered, activated
 * and static abilities, modes, granted abilities), and the spell itself (its
 * `effect`, `targets`, `castModal`) under the card's `text`. */
export function abilitiesOf(def) {
  const out = [];
  const walk = (node, where) => {
    if (Array.isArray(node)) {
      node.forEach((item) => walk(item, where));
      return;
    }
    if (node === null || typeof node !== "object") return;
    if (node !== def && typeof node.text === "string" && Object.keys(node).length > 1) {
      out.push({ text: node.text, shape: node, where });
    }
    for (const [key, value] of Object.entries(node)) {
      if (node === def && key === "faces") continue;
      if (typeof value === "object") walk(value, key);
    }
  };
  walk(def, "card");
  // `!= null`: a permanent's definition can carry `castModal: null`.
  if (def.effect != null || def.castModal != null) {
    const shape = {};
    for (const key of ["targets", "effect", "castModal", "additionalCost", "alternativeCost", "kicker", "x"]) {
      if (def[key] !== undefined) shape[key] = def[key];
    }
    out.push({ text: def.text ?? "", shape, where: "spell" });
  }
  for (const face of def.faces ?? []) if (face !== def) out.push(...abilitiesOf(face));
  return out;
}

/** The keywords a definition (and each face) prints. */
function keywordsOf(def) {
  const out = [...(Array.isArray(def.keywords) ? def.keywords : [])];
  for (const face of def.faces ?? []) if (face !== def && typeof face === "object") out.push(...keywordsOf(face));
  return out;
}

/** What an ability is, from the field it was found under. */
function kindOf(where) {
  if (where === "spell") return "spell";
  if (/triggered/i.test(where)) return "triggered";
  if (/activated/i.test(where)) return "activated";
  if (/static/i.test(where)) return "static";
  return where;
}

const ENUMISH = /^[a-z][a-z0-9-]{0,40}$/;
const SKIP_FIELDS = new Set(["text", "name", "prompt", "art", "flavor", "token", "tokenName", "chosen"]);

/** A definition's vocabulary terms, each once, in the order the walk meets
 * them. An object with a `kind` is the term `kind=<value>`; one with an `on`
 * is `on=<value>`; every field an object carries is `<owner>.<field>`, where
 * the owner is that `kind=`/`on=` term or, for an object without one, where it
 * sits; an enum-like string value adds `<owner>.<field>=<value>`. */
export function vocabTerms(def) {
  const terms = [];
  const seen = new Set();
  const note = (term) => {
    if (seen.has(term)) return;
    seen.add(term);
    terms.push(term);
  };
  const walk = (node, place) => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item, `${place}[]`);
      return;
    }
    if (node === null || typeof node !== "object") return;
    let owner = place;
    if (typeof node.kind === "string") owner = `kind=${node.kind}`;
    else if (typeof node.on === "string") owner = `on=${node.on}`;
    if (owner !== place) note(owner);
    for (const [field, value] of Object.entries(node)) {
      if (value === undefined || value === null) continue;
      if (field === "kind" && owner.startsWith("kind=")) continue;
      if (field === "on" && owner.startsWith("on=")) continue;
      note(`${owner}.${field}`);
      if (typeof value === "string" && ENUMISH.test(value) && !SKIP_FIELDS.has(field)) {
        note(`${owner}.${field}=${value}`);
      }
      if (typeof value === "object") walk(value, owner === place ? `${place}.${field}` : field);
    }
  };
  walk(def, "card");
  return terms;
}

// ------------------------------------------------------------------ build

/** The card files of `sub`, in the order `gen-cards.mjs` lists them (and so
 * the order of `POOL_CARDS` / `TOKEN_CARDS`). */
function cardFiles(sub) {
  return readdirSync(path.join(ENGINE, "src/cards", sub))
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .sort();
}

/** Every definition, from the sources: one entry module importing every card
 * file (so it needs no `gen:cards` run first), bundled by rolldown and
 * imported. */
async function loadDefinitions() {
  const require = createRequire(path.join(ENGINE, "package.json"));
  const { rolldown } = await import(pathToFileURL(require.resolve("rolldown")).href);
  const files = SUBDIRS.flatMap((sub) => cardFiles(sub).map((f) => `src/cards/${sub}/${f}`));
  const ENTRY = "\0pool-index-entry";
  const entry =
    files.map((f, i) => `import d${i} from ${JSON.stringify(path.join(ENGINE, f).split(path.sep).join("/"))};`).join("\n") +
    `\nexport default [${files.map((_, i) => `d${i}`).join(",")}];\n`;
  const bundle = await rolldown({
    input: ENTRY,
    platform: "node",
    treeshake: false,
    resolve: { extensionAlias: { ".js": [".ts", ".js"] } },
    logLevel: "silent",
    plugins: [
      {
        name: "pool-index-entry",
        resolveId: (id) => (id === ENTRY ? ENTRY : null),
        load: (id) => (id === ENTRY ? entry : null),
      },
    ],
  });
  mkdirSync(CACHE, { recursive: true });
  const tmp = path.join(CACHE, `pool-bundle-${process.pid}.mjs`);
  try {
    await bundle.write({ file: tmp, format: "esm" });
    await bundle.close();
    const defs = (await import(pathToFileURL(tmp).href)).default;
    return defs.map((def, i) => ({ def, file: files[i] }));
  } finally {
    rmSync(tmp, { force: true });
  }
}

/** Writes `text` to `file` whole: a reader never sees half of it. On Windows
 * the rename fails while another process has the file open (two tools
 * rebuilding at once); the caller still has the text, so that's only a
 * warning. */
function writeAtomically(file, text) {
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, text, "utf8");
  try {
    renameSync(tmp, file);
  } catch (err) {
    rmSync(tmp, { force: true });
    process.stderr.write(`(couldn't replace ${path.relative(ENGINE, file)}: ${err.code ?? err.message})\n`);
  }
}

/** Builds both index files from the sources. Returns the ability count. */
export async function buildPoolIndex() {
  const builtAt = Date.now();
  const defs = await loadDefinitions();
  const lines = [];
  const termIds = new Map();
  const vocabDefs = [];
  let abilities = 0;
  for (const { def, file } of defs) {
    if (def === undefined || def === null || typeof def.name !== "string") continue;
    for (const a of abilitiesOf(def)) {
      if (a.text.trim() === "") continue;
      lines.push(
        `{"card":${JSON.stringify(def.name)},"file":${JSON.stringify(file)},"kind":${JSON.stringify(kindOf(a.where))},` +
          `"where":${JSON.stringify(a.where)},"text":${JSON.stringify(a.text)},"grams":${JSON.stringify(normalise(a.text, def.name))},` +
          `"spec":${shapeOf(a.shape) ?? "null"}}`,
      );
      abilities += 1;
    }
    for (const kw of keywordsOf(def)) {
      const text = typeof kw === "string" ? kw : JSON.stringify(kw);
      lines.push(
        `{"card":${JSON.stringify(def.name)},"file":${JSON.stringify(file)},"kind":"keyword","where":"keywords",` +
          `"text":${JSON.stringify(text)},"grams":[],"spec":${JSON.stringify(kw)}}`,
      );
    }
    const ids = vocabTerms(def).map((t) => {
      let id = termIds.get(t);
      if (id === undefined) termIds.set(t, (id = termIds.size));
      return id;
    });
    vocabDefs.push([def.name, file, JSON.stringify(def).length, ids]);
  }
  // `poolNames()` reads all ~15,000 sources (two thirds of a second); its
  // answer rides in the header for `card:brief`.
  const names = [...poolNames()];
  const header = { version: VERSION, builtAt, files: defs.length, abilities, names };
  const index = `${JSON.stringify(header)}\n${lines.join("\n")}\n`;
  const vocab = JSON.stringify({ version: VERSION, builtAt, files: defs.length, terms: [...termIds.keys()], defs: vocabDefs });
  mkdirSync(CACHE, { recursive: true });
  writeAtomically(INDEX_FILE, index);
  writeAtomically(VOCAB_FILE, vocab);
  return { index, vocab, abilities, definitions: defs.length, ms: Date.now() - builtAt };
}

// ------------------------------------------------------------------ freshness

/** The freshness check's own thread: stat'ing ~15,500 files costs the thread
 * that asks ~100 ms of its own time on Windows, so a worker does it while the
 * main thread reads and parses the index. CommonJS, as an `eval` worker is. */
const SOURCE_STATE_WORKER = `
const { readdirSync, stat } = require("node:fs");
const path = require("node:path");
const { parentPort, workerData } = require("node:worker_threads");
const { engine, subdirs, shaping } = workerData;
const paths = [];
let files = 0;
for (const sub of subdirs) {
  const dir = path.join(engine, "src/cards", sub);
  paths.push(dir);
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".ts") || f.endsWith(".test.ts")) continue;
    paths.push(path.join(dir, f));
    files += 1;
  }
}
for (const rel of shaping) {
  const dir = path.join(engine, rel);
  for (const f of readdirSync(dir)) if (f.endsWith(".ts") && !f.endsWith(".test.ts")) paths.push(path.join(dir, f));
}
let newest = 0;
let left = paths.length;
for (const p of paths) {
  stat(p, (err, s) => {
    const t = err ? Infinity : s.mtimeMs;
    if (t > newest) newest = t;
    if (--left === 0) parentPort.postMessage({ newest, files });
  });
}
`;

/** The newest mtime among the card files and what shapes them, and how many
 * card files there are — on a worker thread, so it runs while the index is
 * read. */
function sourceState() {
  return new Promise((resolve, reject) => {
    const worker = new Worker(SOURCE_STATE_WORKER, {
      eval: true,
      workerData: { engine: ENGINE, subdirs: SUBDIRS, shaping: SHAPING_DIRS },
    });
    worker.once("message", (state) => {
      resolve(state);
      void worker.terminate();
    });
    worker.once("error", reject);
  });
}

function parseIndex(text) {
  const docs = [];
  let start = text.indexOf("\n") + 1;
  const meta = JSON.parse(text.slice(0, start - 1));
  while (start < text.length) {
    let end = text.indexOf("\n", start);
    if (end < 0) end = text.length;
    if (end > start) docs.push(JSON.parse(text.slice(start, end)));
    start = end + 1;
  }
  return { meta, docs, names: new Map(meta.names) };
}

function parseVocab(text) {
  const meta = JSON.parse(text);
  const defs = meta.defs.map(([name, file, size, ids]) => ({ name, file, size, terms: ids.map((i) => meta.terms[i]) }));
  return { meta, defs };
}

/**
 * One index file, parsed — rebuilt first when it's missing or unreadable, from
 * an older version of this script, older than any card file (or the helpers
 * they call), or counting a different number of card files. The sources are
 * stat'ed while the file is read and parsed.
 */
async function loadFresh(file, parse) {
  const state = sourceState();
  let parsed;
  try {
    if (existsSync(file)) parsed = parse(readFileSync(file, "utf8"));
  } catch {
    parsed = undefined;
  }
  if (isFresh(parsed?.meta, await state)) return parsed;
  process.stderr.write(`(pool index ${parsed === undefined ? "missing" : "stale"}: rebuilding from src/cards …`);
  const built = await buildPoolIndex();
  process.stderr.write(` ${built.definitions} definitions, ${built.abilities} abilities, ${built.ms} ms)\n`);
  return parse(file === VOCAB_FILE ? built.vocab : built.index);
}

const isFresh = (meta, { newest, files }) =>
  meta !== undefined && meta.version === VERSION && meta.files === files && newest < meta.builtAt;

/** Builds both index files unless both are already fresh; what `gen:cards`
 * runs, so a build or typecheck with no card changed costs a freshness check,
 * not a rebuild. Returns the build's counts, or `undefined` when it skipped. */
export async function ensurePoolIndex() {
  const state = sourceState();
  const metaOf = (file) => {
    try {
      const text = readFileSync(file, "utf8");
      return JSON.parse(file === INDEX_FILE ? text.slice(0, text.indexOf("\n")) : text);
    } catch {
      return undefined;
    }
  };
  const metas = [metaOf(INDEX_FILE), metaOf(VOCAB_FILE)];
  const s = await state;
  if (metas.every((m) => isFresh(m, s))) return undefined;
  return buildPoolIndex();
}

/** The index: `docs`, every ability line (`{ card, file, kind, where, text,
 * grams, spec }`), and `names`, `poolNames()`'s map of card names to their
 * files as of the build. */
export async function loadPoolIndex() {
  const { docs, names } = await loadFresh(INDEX_FILE, parseIndex);
  return { docs, names };
}

/** `card:vocab`'s view: `[{ name, file, size, terms }]`, pool then tokens. */
export async function loadPoolVocab() {
  return (await loadFresh(VOCAB_FILE, parseVocab)).defs;
}

// ------------------------------------------------------------------ search

/** TF-IDF cosine over `docs` (each with `grams`), with an inverted index for
 * scoring a query. `search(grams, k, exclude, accept?)` returns the best `k`
 * docs, one per card, skipping cards in `exclude` and docs `accept` refuses. */
export function indexCorpus(docs) {
  const termCounts = (grams) => {
    const tf = new Map();
    for (const g of grams) tf.set(g, (tf.get(g) ?? 0) + 1);
    return tf;
  };
  const tfs = docs.map((d) => termCounts(d.grams));
  const df = new Map();
  for (const tf of tfs) for (const g of tf.keys()) df.set(g, (df.get(g) ?? 0) + 1);
  const n = docs.length;
  const idfs = new Map();
  const idf = (g) => {
    let v = idfs.get(g);
    if (v === undefined) idfs.set(g, (v = Math.log((n + 1) / ((df.get(g) ?? 0) + 1)) + 1));
    return v;
  };
  /** Unit-length weights, in the order the grams first appear. */
  const weigh = (tf, visit) => {
    const ws = [];
    let norm = 0;
    for (const [g, c] of tf) {
      const w = (1 + Math.log(c)) * idf(g);
      ws.push(w);
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    let j = 0;
    for (const g of tf.keys()) visit(g, ws[j++] / norm);
  };
  // gram -> parallel arrays of doc indexes and weights, in doc order.
  const postings = new Map();
  tfs.forEach((tf, i) => {
    weigh(tf, (g, w) => {
      let p = postings.get(g);
      if (p === undefined) postings.set(g, (p = { ids: [], ws: [] }));
      p.ids.push(i);
      p.ws.push(w);
    });
  });
  const search = (grams, k, exclude, accept = () => true) => {
    const scores = new Map();
    weigh(termCounts(grams), (g, w) => {
      const p = postings.get(g);
      if (p === undefined) return;
      for (let j = 0; j < p.ids.length; j++) scores.set(p.ids[j], (scores.get(p.ids[j]) ?? 0) + w * p.ws[j]);
    });
    const hits = [];
    const seenCards = new Set();
    for (const [i, s] of [...scores].sort((a, b) => b[1] - a[1])) {
      const d = docs[i];
      if (exclude.has(d.card) || seenCards.has(d.card) || !accept(d)) continue;
      seenCards.add(d.card);
      hits.push({ ...d, score: s });
      if (hits.length >= k) break;
    }
    return hits;
  };
  return { search };
}
