#!/usr/bin/env node
// The card-triage records, read through one need vocabulary.
//
// Every unimplemented card a triage pass looked at has a record — `{ name,
// needs, why }` in a `blocked` list under `data/sweep-2/` or `data/sweep-3/`,
// and the top-500 commanders' in `src/cards/top-commanders-gaps.json`. The
// commanders' needs use that file's ~250 `features`; the sweep records were
// written batch by batch with keys of their own (`new:retrace` beside
// `keyword:retrace`). `data/needs-vocabulary.json` maps every one of those keys
// (`aliases`) onto a gaps-file feature or onto a narrower feature of its own
// (`features`, each filed under a gaps-file `family`), so that "what does
// building X unblock" is one question, and a feature added to the gaps file's
// `built` array marks every record that waits on it as worth rechecking.
//
// A record is triage, not a verdict: the engine moves on after it's written.
// A built need means "recheck this card", never "author it blind".
//
// Usage: node scripts/needs-vocabulary.mjs <command>
//   --check            raw keys the vocabulary doesn't know (a new record's
//                      needs must be canonical keys or aliased ones)
//   --rank [--top N]   needs by how many unimplemented cards wait on them
//                      (default 40), with how many each would fully unblock,
//                      and the families they roll up into
//   --stale            unimplemented cards with a need that has since been
//                      built: every need built ("recheck now") first, then
//                      the rest
//   --feature <key>    the unimplemented cards waiting on one need (a raw key,
//                      an alias or a family all work)
//   --next [N]         the next N (default 60) Commander-legal cards by EDHREC
//                      rank that are neither in the pool nor triaged — the
//                      next batch to look at
//   --audit            what to fix before building from the records: counts,
//                      and to needs-audit.txt in the OS temp dir the lists —
//                      records with every need built (since triage or before),
//                      cards whose records disagree, undocumented open keys,
//                      and merge candidates (same suffix under two prefixes;
//                      in one family, one suffix inside another or most tokens
//                      shared)
//   --greedy [--top N] [--family F]
//                      the build order over every record, each step what fully
//                      unblocks the most cards — a pair of keys when two free
//                      more together than the best one key would per key —
//                      with milestones, and the pairs (cards needing exactly
//                      two keys); --family builds only F's keys
//   --brief <family> [--open-only] [--page N]
//                      the compact text a model judges a family from: each
//                      open key with its cards waiting, description and up to
//                      two whys, then the family's built keys; paged at ~4K
//                      tokens
//
// The library half (`loadVocabulary`, `loadRecords`, `poolNames`) is what
// `card-brief.mjs` reads records through (`poolNames` by way of the pool
// index, `pool-index.mjs`, which stores its answer).

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadSnapshot } from "./oracle-snapshot.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ENGINE = path.join(here, "..");
const GAPS_PATH = path.join(ENGINE, "src/cards/top-commanders-gaps.json");
const VOCAB_PATH = path.join(ENGINE, "data/needs-vocabulary.json");
const SWEEP_DIRS = ["data/sweep-2", "data/sweep-3"];
const POOL_DIR = path.join(ENGINE, "src/cards/pool");

/** A card's front face: records name double-faced cards either way. */
export const frontName = (name) => name.split(" // ")[0].trim();

/**
 * The vocabulary: `features` (gaps-file features and this file's narrower
 * ones, each `{ family?, description?, example?, size? }`), `aliases`, and
 * `built`. `canonical(raw)` is the key a raw need means, or `undefined` for one
 * nobody has mapped (see `--check`).
 */
export function loadVocabulary() {
  const gaps = JSON.parse(readFileSync(GAPS_PATH, "utf8"));
  const vocab = JSON.parse(readFileSync(VOCAB_PATH, "utf8"));
  const features = new Map();
  for (const [key, f] of Object.entries(gaps.features)) features.set(key, { ...f, from: "gaps" });
  for (const [key, f] of Object.entries(vocab.features)) features.set(key, { ...f, from: "vocabulary" });
  const aliases = new Map(Object.entries(vocab.aliases));
  const built = new Set(gaps.built ?? []);
  const canonical = (raw) => {
    if (features.has(raw) || built.has(raw)) return raw;
    const alias = aliases.get(raw);
    if (alias !== undefined) return alias;
    return undefined;
  };
  /** The family a key rolls up into: its own `family`, or itself. */
  const familyOf = (key) => features.get(key)?.family ?? key;
  /** Built, either itself or (for a gaps-file feature) wholesale. */
  const isBuilt = (key) => built.has(key);
  /** Not a feature at all — `meta:unverified-in-mass-pass` and the like. */
  const isMeta = (key) => key.startsWith("meta:");
  const dates = builtDates(built);
  /** Built after `date` (a record's triage date): the record didn't know.
   * A record with no date counts as older than everything. */
  const builtSince = (key, date) => built.has(key) && (date === undefined || (dates.get(key) ?? "") > date);
  return { features, aliases, built, builtDates: dates, canonical, familyOf, isBuilt, builtSince, isMeta };
}

/**
 * When each `built` key landed: the date of the commit that first added it
 * to the gaps file (one `git log -p` over its history), or today for one not
 * committed yet. A key in the file's first version dates from then.
 */
function builtDates(built) {
  const dates = new Map();
  try {
    const out = execFileSync(
      "git",
      ["log", "-p", "--reverse", "-U0", "--format=DATE %cs", "--", "src/cards/top-commanders-gaps.json"],
      { cwd: ENGINE, encoding: "utf8", maxBuffer: 1 << 28 },
    );
    let date = "";
    for (const line of out.split("\n")) {
      if (line.startsWith("DATE ")) date = line.slice(5).trim();
      const m = /^\+\s*"([a-z]+:[a-z0-9-]+)",?\s*$/.exec(line.replace(/\r$/, ""));
      if (m !== null && built.has(m[1]) && !dates.has(m[1])) dates.set(m[1], date);
    }
  } catch {
    // No git: every built key reads as undated, so nothing looks stale.
  }
  const today = new Date().toISOString().slice(0, 10);
  for (const key of built) if (!dates.has(key)) dates.set(key, today);
  return dates;
}

/** When each sweep file was first committed, as `YYYY-MM-DD` — a record's
 * triage date. Files git doesn't know are left out. */
function firstCommitDates() {
  const dates = new Map();
  try {
    const out = execFileSync("git", ["log", "--format=@%cs", "--name-only", "--", ...SWEEP_DIRS], {
      cwd: ENGINE,
      encoding: "utf8",
      maxBuffer: 1 << 26,
    });
    let date = "";
    for (const line of out.split("\n")) {
      if (line.startsWith("@")) date = line.slice(1).trim();
      else if (line.trim() !== "") dates.set(path.basename(line.trim()), date); // oldest wins: log is newest first
    }
  } catch {
    // No git (a tarball): records just carry no date.
  }
  return dates;
}

/**
 * Every triage record: `{ name, needs: string[], why, batch, file, date? }`.
 * A record whose `needs` is a single string (a few old ones) is read as one
 * key. Commanders come from the gaps file, batch `"top-500 commanders"`.
 */
export function loadRecords() {
  const dates = firstCommitDates();
  const records = [];
  const walk = (node, batch, file) => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item, batch, file);
      return;
    }
    if (node === null || typeof node !== "object") return;
    if (typeof node.name === "string" && node.needs !== undefined) {
      const needs = typeof node.needs === "string" ? [node.needs] : [...node.needs];
      records.push({ name: node.name, needs, why: node.why ?? "", batch, file, date: dates.get(path.basename(file)) });
    }
    for (const value of Object.values(node)) if (typeof value === "object") walk(value, batch, file);
  };
  for (const dir of SWEEP_DIRS) {
    const abs = path.join(ENGINE, dir);
    for (const name of readdirSync(abs).filter((n) => n.endsWith(".json")).sort()) {
      const data = JSON.parse(readFileSync(path.join(abs, name), "utf8"));
      walk(data, data.batch ?? name.replace(/\.json$/, ""), `${dir}/${name}`);
    }
  }
  const gaps = JSON.parse(readFileSync(GAPS_PATH, "utf8"));
  for (const c of gaps.commanders ?? []) {
    records.push({
      name: c.name,
      needs: [...(c.needs ?? [])],
      why: c.why ?? "",
      batch: "top-500 commanders",
      file: "src/cards/top-commanders-gaps.json",
      date: gaps.generated,
    });
  }
  return records;
}

/** Card names in the pool, front faces, read from the sources (no build
 * needed): the first `name:` of each file's `defineCard`, and every face's —
 * and, with `faces` (the default), every name of a multi-face card authored
 * under one face's (from the Oracle snapshot). */
export function poolNames({ faces = true } = {}) {
  const names = new Map();
  for (const file of readdirSync(POOL_DIR).filter((n) => n.endsWith(".ts"))) {
    const src = readFileSync(path.join(POOL_DIR, file), "utf8");
    // A helper's first argument is the name too (`fetchLand("Polluted Delta", …)`).
    const helper = /^(?:export default|const \w+ =) [A-Za-z_]\w*\(\s*"((?:[^"\\]|\\.)*)"/gm;
    for (const m of [...src.matchAll(helper), ...src.matchAll(/^\s*name:\s*"((?:[^"\\]|\\.)*)"/gm)]) {
      const name = JSON.parse(`"${m[1]}"`);
      if (!names.has(name)) names.set(name, `src/cards/pool/${file}`);
    }
  }
  // A multi-face card authored under one face's name is in the pool by its
  // full name and every face, so a record naming it any way drops out. Only a
  // face that names no other card counts: a prepare card's back face can be a
  // card of its own (Stensian Sanguinist // Exsanguinate beside Exsanguinate),
  // or shared by several fronts (Soul Tether).
  if (!faces) return names;
  const byCard = new Map();
  for (const [face, full] of uniqueFaces()) byCard.set(full, [...(byCard.get(full) ?? []), face]);
  for (const [full, cardFaces] of byCard) {
    const file = [full, ...cardFaces].map((n) => names.get(n)).find((f) => f !== undefined);
    if (file === undefined) continue;
    for (const n of [full, ...cardFaces]) if (!names.has(n)) names.set(n, file);
  }
  return names;
}

/** Each face name of the Oracle snapshot's multi-face cards that names only
 * that one card, mapped to the card's full name. Empty without a snapshot. */
function uniqueFaces() {
  let entries;
  try {
    entries = loadSnapshot().entries;
  } catch {
    return new Map();
  }
  const whole = new Set(entries.map((e) => e.name));
  const owners = new Map();
  for (const e of entries) {
    if (!e.name.includes(" // ")) continue;
    for (const face of new Set(e.name.split(" // ").map((f) => f.trim()))) {
      owners.set(face, [...new Set([...(owners.get(face) ?? []), e.name])]);
    }
  }
  const unique = new Map();
  for (const [face, cards] of owners) if (cards.length === 1 && !whole.has(face)) unique.set(face, cards[0]);
  return unique;
}

// ------------------------------------------------------------------ CLI

function openNeeds(record, vocab) {
  return record.needs
    .map((raw) => vocab.canonical(raw) ?? raw)
    .filter((key) => !vocab.isMeta(key) && !vocab.isBuilt(key));
}

function main() {
  const args = process.argv.slice(2);
  const opt = (name, fallback) => {
    const i = args.indexOf(name);
    return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
  };
  const vocab = loadVocabulary();
  const records = loadRecords();
  const pool = poolNames();
  const waiting = records.filter((r) => !pool.has(frontName(r.name)));

  if (args.includes("--check")) {
    const unknown = new Map();
    let strings = 0;
    for (const r of records) for (const raw of r.needs) {
      if (vocab.canonical(raw) === undefined) unknown.set(raw, [...(unknown.get(raw) ?? []), `${r.name} (${r.file})`]);
    }
    for (const r of loadRecordsRawStrings()) strings += r;
    if (unknown.size === 0) console.log(`Every need key is in the vocabulary (${records.length} records).`);
    for (const [raw, where] of unknown) console.log(`${raw}\t${where.slice(0, 3).join("; ")}`);
    if (strings > 0) console.log(`${strings} record(s) give needs as a string, not a list.`);
    process.exitCode = unknown.size === 0 ? 0 : 1;
    return;
  }

  if (args.includes("--feature")) {
    const asked = opt("--feature", "");
    const key = vocab.canonical(asked) ?? asked;
    const hits = waiting.filter((r) =>
      r.needs.some((raw) => {
        const k = vocab.canonical(raw) ?? raw;
        return k === key || vocab.familyOf(k) === key;
      }),
    );
    const f = vocab.features.get(key);
    console.log(`${key}${vocab.isBuilt(key) ? " (built)" : ""}${f?.family ? ` — family ${f.family}` : ""}`);
    if (f?.description) console.log(`  ${f.description}`);
    const seen = new Set();
    for (const r of hits) {
      if (seen.has(r.name)) continue;
      seen.add(r.name);
      const others = openNeeds(r, vocab).filter((k) => k !== key && vocab.familyOf(k) !== key);
      console.log(`- ${r.name} [${r.batch}]${others.length ? `  also: ${others.join(", ")}` : "  (only this)"}`);
    }
    console.log(`${seen.size} card(s).`);
    return;
  }

  if (args.includes("--next")) {
    // Front faces too: a double-faced card's snapshot name is "A // B".
    const triaged = new Set(records.map((r) => frontName(r.name)));
    const n = Number(opt("--next", 60));
    const next = loadSnapshot()
      .entries.filter((e) => e.commander === "legal" && typeof e.edhrec_rank === "number")
      .filter((e) => !pool.has(frontName(e.name)) && !triaged.has(frontName(e.name)))
      .sort((a, b) => a.edhrec_rank - b.edhrec_rank)
      .slice(0, n);
    for (const e of next) console.log(`${String(e.edhrec_rank).padStart(6)}  ${e.name}  — ${e.type_line}`);
    console.log(`${next.length} untriaged card(s), from rank ${next[0]?.edhrec_rank ?? "—"}.`);
    return;
  }

  if (args.includes("--stale")) {
    // A card's newest record wins: it was triaged against a later engine.
    // Picked before asking what's been built, so an older record can't
    // stand in for a newer one that has nothing built since.
    // Keyed by the front face, so a split card's record by its full name
    // ("Commit // Memory") supersedes an older one by its first half.
    const newest = new Map();
    for (const r of waiting) {
      const prev = newest.get(frontName(r.name));
      if (prev === undefined || (r.date ?? "") > (prev.date ?? "")) newest.set(frontName(r.name), r);
    }
    const byCard = new Map();
    for (const r of newest.values()) {
      const keys = r.needs.map((raw) => vocab.canonical(raw) ?? raw).filter((k) => !vocab.isMeta(k));
      const built = keys.filter((k) => vocab.builtSince(k, r.date));
      if (built.length === 0) continue;
      const open = keys.filter((k) => !vocab.isBuilt(k));
      byCard.set(r.name, { ...r, built, open });
    }
    const all = [...byCard.values()].sort((a, b) => a.open.length - b.open.length || a.name.localeCompare(b.name));
    const ready = all.filter((r) => r.open.length === 0);
    console.log(`Every need built since triage — recheck these (${ready.length}):`);
    const when = (k) => `${k} (${vocab.builtDates.get(k)})`;
    for (const r of ready) console.log(`- ${r.name} [${r.batch}${r.date ? `, ${r.date}` : ""}] built: ${r.built.map(when).join(", ")}`);
    console.log(`\nSome needs built (${all.length - ready.length}):`);
    for (const r of all.filter((x) => x.open.length > 0)) {
      console.log(`- ${r.name} [${r.batch}] built: ${r.built.join(", ")}; still: ${r.open.join(", ")}`);
    }
    return;
  }

  if (args.includes("--audit")) return audit(vocab, records, pool, waiting);
  if (args.includes("--greedy")) return greedy(vocab, waiting, Number(opt("--top", 50)), opt("--family", undefined));
  if (args.includes("--brief")) {
    return brief(vocab, waiting, opt("--brief", ""), args.includes("--open-only"), Number(opt("--page", 1)));
  }

  // --rank (the default)
  const top = Number(opt("--top", 40));
  const cardsByNeed = new Map();
  const onlyNeed = new Map();
  const latest = latestByCard(waiting);
  for (const r of latest.values()) {
    const open = [...new Set(openNeeds(r, vocab))];
    for (const k of open) cardsByNeed.set(k, (cardsByNeed.get(k) ?? 0) + 1);
    if (open.length === 1) onlyNeed.set(open[0], (onlyNeed.get(open[0]) ?? 0) + 1);
  }
  const families = new Map();
  for (const [k, n] of cardsByNeed) families.set(vocab.familyOf(k), (families.get(vocab.familyOf(k)) ?? 0) + n);
  console.log(`${latest.size} unimplemented cards with a record; needs by cards waiting (fully unblocks):`);
  for (const [k, n] of [...cardsByNeed].sort((a, b) => b[1] - a[1]).slice(0, top)) {
    const fam = vocab.familyOf(k);
    console.log(`${String(n).padStart(4)} (${String(onlyNeed.get(k) ?? 0).padStart(3)})  ${k}${fam !== k ? `  ← ${fam}` : ""}`);
  }
  console.log(`\nFamilies (needs rolled up):`);
  for (const [k, n] of [...families].sort((a, b) => b[1] - a[1]).slice(0, Math.min(top, 25))) {
    console.log(`${String(n).padStart(4)}  ${k}`);
  }
}

/** Each card's newest record, keyed by its front face: a later triage saw a
 * later engine, and a split card's record by its full name supersedes an
 * older one by its first half. */
export function latestByCard(records) {
  const latest = new Map();
  for (const r of records) {
    const prev = latest.get(frontName(r.name));
    if (prev === undefined || (r.date ?? "") > (prev.date ?? "")) latest.set(frontName(r.name), r);
  }
  return latest;
}

/** A record's needs as canonical keys, meta keys dropped, each once. */
export const keysOf = (record, vocab) => [
  ...new Set(record.needs.map((raw) => vocab.canonical(raw) ?? raw).filter((k) => !vocab.isMeta(k))),
];

const clip = (text, n) => {
  const flat = String(text ?? "").replace(/\s+/g, " ").trim();
  return flat.length <= n ? flat : `${flat.slice(0, n - 1)}…`;
};

/**
 * `--audit`: what in the records is wrong or worth merging before anything is
 * built from them. Counts to stdout, the lists to `needs-audit.txt` in the OS
 * temp dir.
 */
function audit(vocab, records, pool, waiting) {
  const out = [];
  const section = (title, lines) => out.push(`## ${title} (${lines.length})`, ...lines, "");

  // Records whose card is in the pool only by a face name (poolNames' faces).
  const byFile = poolNames({ faces: false });
  const faceNamed = records.filter((r) => pool.has(frontName(r.name)) && !byFile.has(frontName(r.name)));
  section(
    "Records whose card is in the pool by a face name (dropped everywhere)",
    faceNamed.map((r) => `- ${r.name} [${r.batch}] → ${pool.get(frontName(r.name))}`),
  );

  const latest = latestByCard(waiting);
  const noneOpen = [...latest.values()].filter((r) => keysOf(r, vocab).every((k) => vocab.isBuilt(k)));
  const metaOnly = noneOpen.filter((r) => keysOf(r, vocab).length === 0);
  const since = noneOpen.filter((r) => keysOf(r, vocab).some((k) => vocab.builtSince(k, r.date)));
  const before = noneOpen.filter((r) => !metaOnly.includes(r) && !since.includes(r));
  const line = (r) => `- ${r.name} [${r.batch}${r.date ? `, ${r.date}` : ""}] ${keysOf(r, vocab).join(", ")}`;
  section("Every need built since triage (--stale's recheck list)", since.map(line));
  section("Every need built before triage (key too coarse, or never rechecked)", before.map(line));
  section("Only meta needs (no feature named)", metaOnly.map((r) => `- ${r.name} [${r.batch}] ${r.needs.join(", ")}`));

  const groups = new Map();
  for (const r of waiting) groups.set(frontName(r.name), [...(groups.get(frontName(r.name)) ?? []), r]);
  const multi = [...groups].filter(([, rs]) => rs.length > 1);
  const sig = (r) => keysOf(r, vocab).sort().join(",");
  const disagree = multi.filter(([, rs]) => new Set(rs.map(sig)).size > 1);
  section(
    "Cards with more than one record whose needs disagree (the latest wins)",
    disagree.map(([name, rs]) => `- ${name}: ${rs.map((r) => `[${r.batch}${r.date ? ` ${r.date}` : ""}] ${sig(r) || "—"}`).join("  |  ")}`),
  );

  // Open keys: named by a latest record and not built.
  const cards = new Map();
  for (const r of latest.values()) for (const k of keysOf(r, vocab)) if (!vocab.isBuilt(k)) cards.set(k, (cards.get(k) ?? 0) + 1);
  const bare = (k) => {
    const f = vocab.features.get(k);
    return f === undefined || (!f.description && !f.example);
  };
  const undocumented = [...cards.keys()].filter(bare).sort((a, b) => cards.get(b) - cards.get(a) || a.localeCompare(b));
  section("Open keys with no description and no example", undocumented.map((k) => `- ${k} (${cards.get(k)})`));

  const candidates = mergeCandidates(vocab, cards);
  section(
    "Merge candidates (keys in one family sharing most suffix tokens, differing only by prefix, or one suffix inside another)",
    candidates.map((c) => `- [${c.family}] ${c.a} (${c.na}) ~ ${c.b} (${c.nb}) — ${c.rule}`),
  );

  const file = path.join(tmpdir(), "needs-audit.txt");
  writeFileSync(file, out.join("\n"));
  const rules = (rule) => candidates.filter((c) => c.rule === rule).length;
  console.log(`${latest.size} unimplemented cards with a record, ${cards.size} open keys.`);
  console.log(`Records in the pool by a face name: ${faceNamed.length} (dropped everywhere now).`);
  console.log(
    `No open need: ${noneOpen.length} — every need built since triage ${since.length}, before triage ${before.length}, only meta needs ${metaOnly.length}.`,
  );
  console.log(`Cards with more than one record: ${multi.length}; their needs disagree: ${disagree.length}.`);
  console.log(`Open keys with no description and no example: ${undocumented.length}.`);
  console.log(
    `Merge candidates: ${candidates.length} pairs (prefix only ${rules("prefix only")}, suffix inside ${rules("suffix inside")}, shared tokens ${rules("shared tokens")}) in ${new Set(candidates.map((c) => c.family)).size} families.`,
  );
  console.log(`Lists: ${file}`);
}

const STOP = new Set(["a", "an", "the", "of", "to", "as", "on", "in", "for", "with", "from", "or", "and", "by", "per"]);

/**
 * Pairs of keys that may mean one feature, at least one of them open (`cards`:
 * open key → cards waiting). Three tests: the same suffix under two prefixes
 * (`effect:x`, `static:x`, any family); within a family, one suffix's tokens a
 * run inside the other's; or most tokens shared (Jaccard ≥ 0.6, two or more).
 */
export function mergeCandidates(vocab, cards) {
  const split = (k) => {
    const i = k.indexOf(":");
    const suffix = i < 0 ? k : k.slice(i + 1);
    return { suffix, tokens: suffix.split("-").filter((t) => t !== "" && !STOP.has(t)) };
  };
  const keys = new Set([...cards.keys(), ...vocab.built]);
  const out = [];
  const seen = new Set();
  const add = (a, b, family, rule) => {
    const id = [a, b].sort().join("|");
    if (seen.has(id) || (!cards.has(a) && !cards.has(b))) return;
    seen.add(id);
    const n = (k) => (cards.has(k) ? String(cards.get(k)) : "built");
    out.push({ a, b, na: n(a), nb: n(b), family, rule });
  };
  const bySuffix = new Map();
  for (const k of keys) bySuffix.set(split(k).suffix, [...(bySuffix.get(split(k).suffix) ?? []), k]);
  for (const [, ks] of bySuffix) {
    for (let i = 0; i < ks.length; i += 1) for (let j = i + 1; j < ks.length; j += 1) {
      add(ks[i], ks[j], vocab.familyOf(ks[i]) === vocab.familyOf(ks[j]) ? vocab.familyOf(ks[i]) : "—", "prefix only");
    }
  }
  const families = new Map();
  for (const k of keys) families.set(vocab.familyOf(k), [...(families.get(vocab.familyOf(k)) ?? []), k]);
  for (const [family, ks] of families) {
    const parts = ks.map((k) => ({ k, ...split(k) }));
    for (let i = 0; i < parts.length; i += 1) for (let j = i + 1; j < parts.length; j += 1) {
      const [x, y] = [parts[i], parts[j]];
      if (x.suffix === y.suffix) continue;
      const [short, long] = x.tokens.length <= y.tokens.length ? [x, y] : [y, x];
      if (short.tokens.length > 0 && `-${long.tokens.join("-")}-`.includes(`-${short.tokens.join("-")}-`)) {
        add(x.k, y.k, family, "suffix inside");
        continue;
      }
      const shared = x.tokens.filter((t) => y.tokens.includes(t)).length;
      const union = new Set([...x.tokens, ...y.tokens]).size;
      if (shared >= 2 && shared / union >= 0.6) add(x.k, y.k, family, "shared tokens");
    }
  }
  const weight = (c) => (c.na === "built" ? 0 : Number(c.na)) + (c.nb === "built" ? 0 : Number(c.nb));
  return out.sort((p, q) => p.family.localeCompare(q.family) || weight(q) - weight(p) || p.a.localeCompare(q.a));
}

/**
 * `--greedy`: the build order over every record — each step builds what fully
 * unblocks the most cards. A step is one key, or a **pair** when two keys
 * free more cards together (cards needing exactly those two) than the best
 * single key would free per key built. `--family F` builds only F's keys.
 */
function greedy(vocab, waiting, top, familyArg) {
  const family = familyArg === undefined ? undefined : (vocab.canonical(familyArg) ?? familyArg);
  const buildable = (k) => family === undefined || k === family || vocab.familyOf(k) === family;
  const cards = [...latestByCard(waiting).values()]
    .map((r) => ({ name: r.name, open: new Set(keysOf(r, vocab).filter((k) => !vocab.isBuilt(k))) }))
    .filter((c) => c.open.size > 0);

  const run = (withPairs) => {
    const left = cards.map((c) => new Set(c.open));
    const steps = [];
    let total = 0;
    for (;;) {
      const single = new Map();
      const joint = new Map();
      for (const open of left) {
        if (open.size === 0 || ![...open].every(buildable)) continue;
        if (open.size === 1) {
          const [k] = open;
          single.set(k, (single.get(k) ?? 0) + 1);
        } else if (open.size === 2 && withPairs) {
          const id = [...open].sort().join("|");
          joint.set(id, (joint.get(id) ?? 0) + 1);
        }
      }
      const better = (cand, best) => best === null || cand.gain > best.gain || (cand.gain === best.gain && cand.id < best.id);
      let one = null;
      for (const [k, n] of single) if (better({ id: k, gain: n }, one)) one = { id: k, keys: [k], gain: n };
      let two = null;
      for (const [id, n] of joint) {
        const keys = id.split("|");
        const cand = { id, keys, gain: n + keys.reduce((s, k) => s + (single.get(k) ?? 0), 0) };
        if (better(cand, two)) two = cand;
      }
      const best = two !== null && two.gain / 2 > (one?.gain ?? 0) ? two : one;
      if (best === null) break;
      for (const open of left) for (const k of best.keys) open.delete(k);
      total += best.gain;
      steps.push({ ...best, total });
    }
    return steps;
  };

  const steps = run(true);
  const milestones = (list) => {
    const at = [10, 25, 50, 100, 200, 400];
    let keys = 0;
    const hit = [];
    for (const s of list) {
      const before = keys;
      keys += s.keys.length;
      for (const m of at) if (before < m && keys >= m) hit.push(`${m} keys free ${s.total}`);
    }
    const last = list.at(-1);
    return `${hit.join(", ")}${last ? `; all ${keys} keys free ${last.total}` : ""}`;
  };
  const twoNeed = cards.filter((c) => c.open.size === 2 && [...c.open].every(buildable)).length;
  console.log(
    `${cards.length} cards with an open need${family ? `; building only family ${family}` : ""}. Greedy order (cards freed, running total; a + b is a pair built together):`,
  );
  let keys = 0;
  for (const [i, s] of steps.slice(0, top).entries()) {
    keys += s.keys.length;
    console.log(`${String(i + 1).padStart(4)}  ${String(keys).padStart(4)}  +${String(s.gain).padStart(3)}  ${String(s.total).padStart(5)}  ${s.keys.join(" + ")}`);
  }
  console.log(`\nWith pairs:   ${milestones(steps)}`);
  console.log(`Single keys:  ${milestones(run(false))}`);

  // Pairs from the start: two keys that free cards only together.
  const single = new Map();
  const joint = new Map();
  for (const c of cards) {
    if (![...c.open].every(buildable)) continue;
    if (c.open.size === 1) single.set([...c.open][0], (single.get([...c.open][0]) ?? 0) + 1);
    if (c.open.size === 2) {
      const id = [...c.open].sort().join("|");
      joint.set(id, (joint.get(id) ?? 0) + 1);
    }
  }
  const pairs = [...joint].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  console.log(`\n${twoNeed} cards wait on exactly two keys, ${pairs.length} distinct pairs; the top ${Math.min(top, 25)} (alone, alone, together):`);
  for (const [id, n] of pairs.slice(0, Math.min(top, 25))) {
    const [a, b] = id.split("|");
    const sa = single.get(a) ?? 0;
    const sb = single.get(b) ?? 0;
    console.log(`  ${String(sa).padStart(3)} ${String(sb).padStart(3)} → ${String(sa + sb + n).padStart(3)}  ${a} + ${b}`);
  }
}

/**
 * Every open key over the cards' latest records: `{ cards, only, whys }` — the
 * cards waiting, those it alone blocks, and up to two short `why`s (one that
 * repeats the key's own example adds nothing). What `--brief` and the
 * judging agents' pages are made of.
 */
export function openKeyStats(vocab, waiting) {
  const open = new Map();
  for (const r of latestByCard(waiting).values()) {
    const keys = keysOf(r, vocab).filter((k) => !vocab.isBuilt(k));
    for (const k of keys) {
      const e = open.get(k) ?? { cards: 0, only: 0, whys: [] };
      e.cards += 1;
      if (keys.length === 1) e.only += 1;
      const said = clip(`${r.name}: ${r.why}`, 150);
      const example = clip(vocab.features.get(k)?.example ?? "", 150);
      if (e.whys.length < 2 && r.why && said !== example) e.whys.push(said);
      open.set(k, e);
    }
  }
  return open;
}

/** One open key as a brief shows it: count, description, then its whys. */
export function keyBlock(vocab, key, e) {
  const what = clip(vocab.features.get(key)?.description || vocab.features.get(key)?.example || "(no description)", 200);
  const head = `- ${key} [${e.cards} card${e.cards === 1 ? "" : "s"}, ${e.only} only this] ${what}`;
  return [head, ...e.whys.map((w) => `    · ${w}`)].join("\n");
}

/** Text blocks packed into pages of at most `budget` characters. */
export function pageBlocks(blocks, budget = 14000) {
  const pages = [[]];
  let size = 0;
  for (const b of blocks) {
    if (size + b.length > budget && pages.at(-1).length > 0) {
      pages.push([]);
      size = 0;
    }
    pages.at(-1).push(b);
    size += b.length + 1;
  }
  return pages;
}

/**
 * A family's brief as blocks: each open key (most cards first), then — unless
 * `openOnly` — its built keys. `null` for a family with neither.
 */
export function familyBrief(vocab, waiting, familyArg, { openOnly = false, stats } = {}) {
  const family = vocab.canonical(familyArg) ?? familyArg;
  const inFamily = (k) => k === family || vocab.familyOf(k) === family;
  const open = [...(stats ?? openKeyStats(vocab, waiting))].filter(([k]) => inFamily(k));
  const built = [...vocab.built].filter(inFamily).sort();
  if (open.length === 0 && built.length === 0) return null;
  const blocks = open
    .sort((a, b) => b[1].cards - a[1].cards || a[0].localeCompare(b[0]))
    .map(([k, e]) => keyBlock(vocab, k, e));
  if (!openOnly && built.length > 0) {
    blocks.push(`Built in this family (${built.length}):`);
    for (const k of built) blocks.push(`- ${k}: ${clip(vocab.features.get(k)?.description ?? "", 110)}`);
  }
  const cardNeeds = open.reduce((n, [, e]) => n + e.cards, 0);
  const desc = vocab.features.get(family)?.description;
  return { family, head: `# ${family}${desc ? ` — ${clip(desc, 200)}` : ""}`, openKeys: open.length, cardNeeds, built: built.length, blocks };
}

/**
 * `--brief <family>`: what a model judges a family from — each open key with
 * its cards waiting, description and up to two short `why`s, then the family's
 * built keys (`--open-only` leaves those out). Paged at ~4K tokens
 * (`--page N`).
 */
function brief(vocab, waiting, familyArg, openOnly, page) {
  const b = familyBrief(vocab, waiting, familyArg, { openOnly });
  if (b === null) {
    console.log(`No keys in family ${vocab.canonical(familyArg) ?? familyArg}.`);
    process.exitCode = 1;
    return;
  }
  const pages = pageBlocks(b.blocks);
  const n = Math.min(Math.max(1, page), pages.length);
  console.log(b.head);
  console.log(`${b.openKeys} open keys (${b.cardNeeds} card-needs), ${b.built} built. Page ${n} of ${pages.length}${n < pages.length ? ` (next: --page ${n + 1})` : ""}.\n`);
  console.log(pages[n - 1].join("\n"));
}

/** How many records give `needs` as a bare string — for `--check`. */
function loadRecordsRawStrings() {
  const counts = [];
  for (const dir of SWEEP_DIRS) {
    const abs = path.join(ENGINE, dir);
    for (const name of readdirSync(abs).filter((n) => n.endsWith(".json"))) {
      const text = readFileSync(path.join(abs, name), "utf8");
      counts.push((text.match(/"needs":\s*"/g) ?? []).length);
    }
  }
  return counts;
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) main();
