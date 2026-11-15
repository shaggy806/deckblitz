#!/usr/bin/env node
// Ranks the engine features that stand between the pool and the top
// commanders, from `src/cards/top-commanders-gaps.json` (the per-commander
// triage of the first 500, normalized onto one feature vocabulary — see
// neededCards-features.md, "The commander gap"). The list is 1000 long since
// 2026-11-14; an unimplemented commander with no record here is named, with
// where its triage is (the sweep records, which `cards:needs` reads).
//
// Commanders already implemented (marked [x] in top-commanders.txt — run
// `npm run cmdrs:mark` first) and features listed in the JSON's `built`
// array are left out, so the numbers move as work lands. No network.
//
// Usage: node scripts/commander-gaps.mjs [--top 40] [--order 30] [--ui]
//   --top N    features by how many commanders need them (default 40)
//   --order N  greedy build order: the feature that fully unblocks the most
//              commanders per unit of effort next, engine-only unless --ui
//              (default 30)

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const gapsPath = path.join(here, "../src/cards/top-commanders-gaps.json");
const listPath = path.join(here, "../src/cards/top-commanders.txt");

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const TOP = opt("--top", 40);
const ORDER = opt("--order", 30);
const WITH_UI = args.includes("--ui");
const EFFORT = { small: 1, medium: 3, large: 10 };

const data = JSON.parse(readFileSync(gapsPath, "utf8"));
const built = new Set(data.built ?? []);
/** The list as it stands: name → its rank today and whether it's in the pool.
 * The ranks in the gaps file are the 2026-09-22 list's, so they're read here. */
const listed = new Map();
for (const line of readFileSync(listPath, "utf8").split("\n")) {
  const m = /^\[([x ])\]\s+(\d+)\s+(.+?)\s{2,}/.exec(line);
  if (m) listed.set(m[3], { rank: Number(m[2]), done: m[1] === "x" });
}
// The list names a double-faced commander by its front face alone.
const entryOf = (name) => listed.get(name) ?? listed.get(name.split(" // ")[0]);

const open = data.commanders
  .filter((c) => entryOf(c.name)?.done !== true)
  .map((c) => ({
    ...c,
    rank: entryOf(c.name)?.rank ?? c.rank,
    needs: c.needs.filter((k) => !built.has(k)),
  }));

/** Unimplemented commanders on the list that the gaps file has no record for:
 * the file triaged the first 500 (2026-09-22), and the list has been 1000
 * since 2026-11-14. Their needs are in the sweep records, on the same keys. */
const triagedHere = new Set(data.commanders.map((c) => c.name.split(" // ")[0]));
const elsewhere = [...listed.entries()]
  .filter(([name, entry]) => !entry.done && !triagedHere.has(name.split(" // ")[0]))
  .map(([name, entry]) => ({ name, rank: entry.rank }));

const need = new Map();
const sole = new Map();
for (const c of open) {
  for (const k of c.needs) need.set(k, (need.get(k) ?? 0) + 1);
  if (c.needs.length === 1) sole.set(c.needs[0], (sole.get(c.needs[0]) ?? 0) + 1);
}

const ready = open.filter((c) => c.needs.length === 0);
console.log(
  `${open.length + elsewhere.length} of the top ${listed.size} commanders not yet implemented. ` +
    `${open.length} are triaged here; ${ready.length} of those need no engine work:`,
);
console.log(`  ${ready.map((c) => `${c.rank} ${c.name}`).join(" · ")}\n`);
if (elsewhere.length > 0) {
  console.log(
    `${elsewhere.length} more are triaged in the sweep records, not here ` +
      "(`npm run cards:needs -w engine -- --by-rank` ranks their keys; `card:brief` shows one's):",
  );
  console.log(`  ${elsewhere.map((c) => `${c.rank} ${c.name}`).join(" · ")}\n`);
}

const byCount = new Map();
for (const c of open) byCount.set(c.needs.length, (byCount.get(c.needs.length) ?? 0) + 1);
console.log(
  "Features still needed per commander: " +
    [...byCount.entries()].sort((a, b) => a[0] - b[0]).map(([n, k]) => `${n}→${k}`).join("  ") +
    "\n",
);

const f = (k) => data.features[k] ?? { size: "medium", ui: false, description: "" };
console.log(`Top ${TOP} features by commanders that need them (sole = the only thing blocking one):`);
for (const [k, n] of [...need.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP)) {
  console.log(
    `${String(n).padStart(3)}  sole ${String(sole.get(k) ?? 0).padStart(2)}  ${f(k).size.padEnd(6)} ${f(k).ui ? "UI" : "  "}  ${k}`,
  );
}

const remaining = open.filter((c) => c.needs.length > 0);
const have = new Set();
console.log(`\nGreedy build order (${WITH_UI ? "all features" : "engine-only"}): feature, newly unblocked, running total`);
let total = 0;
for (let step = 0; step < ORDER; step += 1) {
  let best = null;
  for (const k of need.keys()) {
    if (have.has(k) || (!WITH_UI && f(k).ui)) continue;
    const gain = remaining.filter(
      (c) => c.needs.includes(k) && c.needs.every((n) => n === k || have.has(n)),
    ).length;
    if (gain === 0) continue;
    const score = gain / (EFFORT[f(k).size] ?? 3);
    if (best === null || score > best.score) best = { k, gain, score };
  }
  if (best === null) break;
  have.add(best.k);
  total += best.gain;
  console.log(`  ${best.k.padEnd(52)} +${String(best.gain).padStart(2)}  ${total}`);
}
