// Regenerates `src/cards/salt-score.ts` — how much Commander players dislike
// facing each pool card, as EDHREC's salt score (0 = nobody minds, about 3 at
// the very top: Stasis, Armageddon, Winter Orb).
//
//   npm run gen:salt-score -w engine              (offline, from the snapshot)
//   npm run gen:salt-score -w engine -- --online  (refresh the snapshot first)
//
// The score is the average of EDHREC's yearly salt survey, where players rate
// how unpleasant a card is to play against from 0 to 4. It's here as an input
// for the bots: removal could lean towards what players hate to see resolve
// (BACKLOG.md, Bots, "Explore aiming bot removal by EDHREC rank or salt
// score"), beside `edhrec-rank.ts`'s popularity.
//
// **Source, and the risk it carries.** Like `top-commanders.mjs`, this reads
// json.edhrec.com, which is not a documented API: the `top/salt` list, 100
// cards a page, saltiest first. That's why the network run only refreshes a
// checked-in snapshot (`data/edhrec-salt.json`, every card EDHREC scores above
// 0, not just the pool's) and the table is built from that snapshot: a card
// that joins the pool later gets its score with no request, and if the
// endpoint changes only `--online` stops working. The walk stops at the first
// card scored 0, so a card missing from the snapshot either scored 0 or has no
// score yet (too new for a survey); `saltScoreOf` reports both as 0.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { POOL_CARDS } from "../dist/cards/generated.js";
import { isDeckableCard } from "../dist/cards/classify.js";

const online = process.argv.includes("--online");

const USER_AGENT = "MTG-Engine-CardAuthoring/1.0";
/** One request a second, sequentially, as `top-commanders.mjs` does: the
 * whole walk is ~250 pages. */
const EDHREC_INTERVAL_MS = 1000;
/** Three decimals tell every card apart that EDHREC does, near enough. */
const DECIMALS = 3;

const here = dirname(fileURLToPath(import.meta.url));
const snapshotPath = join(here, "..", "data", "edhrec-salt.json");
const out = join(here, "..", "src", "cards", "salt-score.ts");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url, { attempts = 3 } = {}) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    });
    if (res.ok) return res.json();
    if (attempt === attempts) throw new Error(`${url}: HTTP ${res.status}`);
    await delay(EDHREC_INTERVAL_MS * 2 ** attempt);
  }
}

/** Walks `top/salt` until a card scores 0, returning name → salt. */
async function fetchSalt() {
  const first = await getJson("https://json.edhrec.com/pages/top/salt.json");
  const list = first.container?.json_dict?.cardlists?.[0];
  if (list === undefined) throw new Error("top/salt.json: no card list (has the page changed?)");
  const scores = new Map();
  let cardviews = list.cardviews;
  let more = list.more;
  let page = 0;
  for (;;) {
    let reachedZero = false;
    for (const card of cardviews) {
      if (typeof card.salt !== "number") continue;
      if (card.salt <= 0) {
        reachedZero = true;
        break;
      }
      if (!scores.has(card.name)) scores.set(card.name, card.salt);
    }
    page += 1;
    process.stderr.write(`  page ${page}, ${scores.size} scored\n`);
    if (reachedZero || !more) break;
    await delay(EDHREC_INTERVAL_MS);
    const next = await getJson(`https://json.edhrec.com/pages/${more}`);
    cardviews = next.cardviews ?? [];
    more = next.more;
  }
  return { scores, description: first.description ?? "" };
}

if (online) {
  const { scores, description } = await fetchSalt();
  const sorted = [...scores].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const lines = sorted.map(
    ([name, salt]) => `    ${JSON.stringify(name)}: ${Number(salt.toFixed(DECIMALS))}`,
  );
  const fetched = new Date().toISOString().slice(0, 10);
  writeFileSync(
    snapshotPath,
    `{\n  "source": "https://json.edhrec.com/pages/top/salt.json",\n` +
      `  "fetched": ${JSON.stringify(fetched)},\n` +
      `  "description": ${JSON.stringify(description.replace(/<[^>]*>/g, "").trim())},\n` +
      `  "cards": {\n${lines.join(",\n")}\n  }\n}\n`,
    "utf8",
  );
  console.log(`wrote ${snapshotPath}: ${scores.size} cards scored above 0`);
}

const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
/** EDHREC names a double-faced card "Front // Back"; a decklist, and the pool,
 * by its front face. */
const byName = new Map();
for (const [name, salt] of Object.entries(snapshot.cards)) {
  byName.set(name, salt);
  if (name.includes(" // ")) {
    const front = name.split(" // ")[0];
    if (!byName.has(front)) byName.set(front, salt);
  }
}

/** Front faces of real cards only: a token is never surveyed. */
const names = [
  ...new Set(POOL_CARDS.filter(isDeckableCard).map((def) => def.name)),
].sort((a, b) => a.localeCompare(b));
const scored = names.filter((name) => byName.has(name));
const body = scored
  .map((name) => `  ${JSON.stringify(name)}: ${byName.get(name)},`)
  .join("\n");

writeFileSync(
  out,
  `/**
 * How much Commander players dislike facing each pool card, as EDHREC's salt
 * score: the average rating, 0 to 4, from EDHREC's yearly salt survey (as of
 * ${snapshot.fetched}). **Generated** — run \`npm run gen:salt-score -w engine\`
 * (\`-- --online\` to refresh \`data/edhrec-salt.json\` first); do not edit by hand.
 *
 * Only cards scored above 0 are listed. {@link saltScoreOf} reports a missing
 * card as 0, which covers both a card nobody minds and one too new to have
 * been surveyed.
 */

export const SALT_SCORE: Readonly<Record<string, number>> = {
${body}
};

/** This card's EDHREC salt score, 0 to 4; 0 when it has none. */
export const saltScoreOf = (cardName: string): number => SALT_SCORE[cardName] ?? 0;
`,
  "utf8",
);

console.log(`wrote ${out}: ${scored.length} of ${names.length} pool cards scored above 0`);
