// Rules of the Comprehensive Rules that the engine's source never cites: the
// leads a rules audit starts from (docs/plans/rules-audit-2026-11.md).
//
//   npm run rules:uncited -w engine -- 506 508 800      # uncited rules of those sections
//   npm run rules:uncited -w engine -- --all            # cited / total, section by section
//
// A rule counts as cited when its number appears anywhere under engine/src
// outside the card pool, the tokens and the tests (game.ts is read as text:
// it holds a NUL byte). An uncited rule is a lead, not a verdict: the engine
// may implement it under its parent's number, or under another rule that says
// the same thing (508.8 is restated in 506.1). In the listing, `~` marks a
// lettered subrule whose parent is cited, and `T` one that only a test cites.

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const rulesDir = join(ROOT, "docs", "rules");
const rulesFile = readdirSync(rulesDir)
  .filter((name) => /^MagicCompRules_\d+\.txt$/.test(name))
  .sort()
  .at(-1);
if (rulesFile === undefined) throw new Error(`no MagicCompRules_*.txt in ${rulesDir}`);

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("usage: rules:uncited -- <section> [<section> …]   or   rules:uncited -- --all");
  process.exit(1);
}

/** Every rule once, in the book's order: its number and its text. */
const rules = [];
const seen = new Set();
for (const line of readFileSync(join(rulesDir, rulesFile), "utf8").split(/\r?\n/)) {
  const match = /^(\d{3}\.\d+[a-z]?)\.? (.*)/.exec(line.trim());
  if (match === null || seen.has(match[1])) continue;
  seen.add(match[1]);
  rules.push({ number: match[1], text: match[2] });
}

/** The rule numbers written anywhere under `paths`. */
function numbersIn(paths) {
  let out = "";
  try {
    out = execFileSync("git", ["-C", ROOT, "grep", "-a", "-ohE", "[1-9][0-9]{2}\\.[0-9]+[a-z]?", "--", ...paths], {
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch (error) {
    // git grep exits 1 when nothing matches.
    if (error.status !== 1) throw error;
  }
  return new Set(out.split(/\s+/));
}
const cited = numbersIn([
  "engine/src",
  ":!engine/src/cards/pool",
  ":!engine/src/cards/tokens",
  ":!engine/src/cards/*.txt",
  ":!engine/src/test",
]);
const inTests = numbersIn(["engine/src/test"]);

if (args[0] === "--all") {
  const bySection = new Map();
  for (const { number } of rules) {
    const section = number.split(".")[0];
    const tally = bySection.get(section) ?? { total: 0, cited: 0 };
    tally.total += 1;
    if (cited.has(number)) tally.cited += 1;
    bySection.set(section, tally);
  }
  for (const [section, tally] of bySection) console.log(`${section}: ${tally.cited}/${tally.total} cited`);
} else {
  console.log(`${rulesFile}: uncited rules of ${args.join(", ")} (~ parent cited, T cited by a test only)`);
  for (const { number, text } of rules) {
    if (!args.includes(number.split(".")[0]) || cited.has(number)) continue;
    const parent = number.replace(/[a-z]$/, "");
    const mark = parent !== number && cited.has(parent) ? "~" : " ";
    console.log(`${mark}${inTests.has(number) ? "T" : " "} ${number}  ${text.slice(0, 150)}`);
  }
}
