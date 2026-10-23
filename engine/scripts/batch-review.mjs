// Review aid for a batch the agents authored: every card file the batch added
// or changed, set beside its Oracle text, written to one file — and on stdout
// only the cards worth reading in full, each with why. The lead reads those
// from the file (`grep -A40 "=== <file>"`) instead of printing every card into
// its own context: a 130-card batch's dump is ~300 KB, its flag list ~3 KB.
//
//   node scripts/batch-review.mjs --since <commit> [--out <file>] [--all]
//
// `--since` is the commit before the batch (the files are `git diff
// <since>` plus untracked pool files); `--out` defaults to the OS temp dir;
// `--all` prints every card's flags, not only the flagged ones. A flag is a
// pointer, not a verdict: an untested card with a condition, a replacement, a
// cost paid as it resolves, a delayed trigger, several target slots or a
// stats/type mismatch against Oracle. card:text and card:verify still check
// the text and the structure of the whole pool.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const engine = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
};
const since = flag("since", null);
if (since === null) {
  console.error("usage: node scripts/batch-review.mjs --since <commit> [--out <file>] [--all]");
  process.exit(1);
}
const out = flag("out", join(tmpdir(), "batch-review.txt"));
const showAll = args.includes("--all");

const git = (...a) => execFileSync("git", a, { cwd: engine, encoding: "utf8" });
const changed = (dir) => [
  ...git("diff", "--name-only", "--relative", since, "--", dir).split("\n"),
  ...git("ls-files", "--others", "--exclude-standard", dir).split("\n"),
];
const files = [...new Set([...changed("src/cards/pool"), ...changed("src/cards/tokens")])]
  .filter((f) => f.endsWith(".ts") && existsSync(join(engine, f)));
const tests = [...new Set(changed("src/test"))]
  .filter((f) => f.endsWith(".test.ts") && existsSync(join(engine, f)))
  .map((f) => readFileSync(join(engine, f), "utf8"))
  .join("\n");

// Oracle cards by name, each face by its own name too.
const oracle = new Map();
for (const line of readFileSync(join(engine, "data/oracle/cards.jsonl"), "utf8").split("\n")) {
  if (line.trim() === "") continue;
  const card = JSON.parse(line);
  oracle.set(card.name, card);
  for (const face of card.faces ?? card.card_faces ?? []) if (!oracle.has(face.name)) oracle.set(face.name, face);
}

const MARKERS = [
  // A plain delirium static is a pattern copied a hundred times; anything else
  // gated is worth a look.
  [/condition: \{ kind: "(?!delirium" \})/, "condition"],
  [/replacement:/, "replacement"],
  [/costEnergy|kind: "may",\s*(prompt: "[^"]*",\s*)?cost:/, "cost paid as it resolves"],
  [/kind: "delayed-trigger"/, "delayed trigger"],
  [/kind: "look-and-choose"|kind: "search-library"/, "library choice"],
  [/kind: "cast-now"/, "cast during resolution"],
  [/controlledBy: "active-player"|who: "active-player"|"trigger-player"|"trigger-controller"/, "names a player from the event"],
  [/otherOnly|exceptSource|excludeSelf/, "\"another\""],
  [/sameAbilityAs/, "one ability, two events"],
];

const lines = [];
const flagged = [];
for (const file of files.sort()) {
  const src = readFileSync(join(engine, file), "utf8");
  const body = src.slice(src.indexOf("defineCard"));
  const name = /name: "((?:[^"\\]|\\.)*)"/.exec(body)?.[1]?.replace(/\\"/g, '"') ?? "?";
  const isToken = file.includes("/tokens/");
  const card = oracle.get(name);
  const reasons = [];
  if (!isToken && card === undefined) reasons.push("not in the Oracle snapshot by this name");
  if (card !== undefined) {
    const pt = /power: (-?\d+),\s*toughness: (-?\d+)/.exec(body);
    if (pt !== null && card.power !== undefined && /^\d+$/.test(card.power) && `${pt[1]}/${pt[2]}` !== `${card.power}/${card.toughness}`) {
      reasons.push(`P/T ${pt[1]}/${pt[2]} but Oracle ${card.power}/${card.toughness}`);
    }
    const cost = /manaCost: "([^"]*)"/.exec(body)?.[1];
    if (cost !== undefined && card.mana_cost !== undefined && cost !== card.mana_cost) {
      reasons.push(`mana cost ${cost} but Oracle ${card.mana_cost}`);
    }
  }
  const tested = tests.includes(name) || tests.includes(name.split(",")[0]);
  const marks = MARKERS.filter(([re]) => re.test(body)).map(([, label]) => label);
  const slots = (body.match(/kind: "optional"/g) ?? []).length;
  if (slots >= 2) marks.push(`${slots} optional target slots`);
  if (!isToken && !tested && marks.length > 0) reasons.push(`untested, with: ${marks.join(", ")}`);
  else if (marks.length >= 3) reasons.push(`tested; dense: ${marks.join(", ")}`);
  if (/TODO\(scaffold\)|effect: null/.test(body)) reasons.push("an unfinished draft line");

  lines.push(`=== ${file}  [${name}]${tested ? "  (tested)" : ""}`);
  if (card !== undefined) {
    lines.push(`ORACLE: ${card.mana_cost ?? ""} ${card.type_line ?? ""} ${card.power ?? ""}${card.power !== undefined ? "/" : ""}${card.toughness ?? ""}`);
    lines.push(`  ${(card.oracle_text ?? "").replace(/\n/g, "\n  ")}`);
  }
  for (const l of body.split("\n")) {
    const t = l.trim();
    if (t === "" || t.startsWith("//") || /^(text|prompt|art): /.test(t)) continue;
    lines.push(l);
  }
  lines.push("");
  if (reasons.length > 0 || showAll) flagged.push(`${name}  (${file.replace("src/cards/", "")})\n    ${reasons.join("; ") || "—"}`);
}

writeFileSync(out, lines.join("\n"));
console.log(`${files.length} files; the full dump (Oracle beside each definition) is in ${out}`);
console.log(`${flagged.length} worth reading in full:`);
for (const f of flagged) console.log(`  ${f}`);
