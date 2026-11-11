// Generates `src/strong-decks.ts` from the real decklists the user copied by
// hand from Archidekt (`data/archidekt-decks/lists.txt`, each deck's link in
// `sources.json`). Nothing here touches the network: Archidekt's terms bar
// automated requests (`docs/plans/strong-bot-decks.md`).
//
// Each list is the creator's own, and ships only whole: `sample-decks.test.ts`
// fails on any stand-in. A newly copied list with a card the pool lacks still
// generates, with a stand-in from the card replacer chosen as the deck import
// chooses them, so it can be piloted while that card is built
// (`docs/plans/strong-bot-decks.md`); it can't be committed until then.
//
//   npm run build -w engine && npm run decks:strong -w engine

import { readFileSync, writeFileSync } from "node:fs";
import { assignReplacements, createDefaultRegistry, createOracleTagIndex } from "../dist/index.js";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const sources = JSON.parse(read("data/archidekt-decks/sources.json"));
const tags = createOracleTagIndex(JSON.parse(read("../server/data/oracle-tags/index.json")));
const registry = createDefaultRegistry();

const oracle = new Map();
for (const line of read("data/oracle/cards.jsonl").split("\n")) {
  if (line === "") continue;
  const card = JSON.parse(line);
  for (const name of [card.name, card.name.split(" // ")[0]]) {
    if (!oracle.has(name)) oracle.set(name, card);
  }
}

// Archidekt lists a deck's tokens and helper cards beside its cards: a token
// printing's set code is "t" and the real set's code ("tmom", "twoe").
const isTokenRow = (set) => /^t[a-z0-9]{3,}$/.test(set);
// A meld result is the back of two cards the deck already holds.
const NOT_DECK_CARDS = new Set(["Brisela, Voice of Nightmares"]);

function parseLists(text) {
  const decks = [];
  let deck = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") continue;
    const header = line.match(/^(\d+)\. "(.+)" by (.+):$/);
    if (header !== null) {
      deck = { id: header[1], title: header[2], author: header[3], commander: null, rows: [] };
      decks.push(deck);
      continue;
    }
    const row = line.match(/^(C|\d+)\s+(.+?)\s+\(([^)]+)\)\s+\S+$/);
    if (row === null || deck === null) throw new Error(`can't read: ${line}`);
    const [, count, name, set] = row;
    if (isTokenRow(set) || NOT_DECK_CARDS.has(name)) continue;
    if (count === "C") {
      if (deck.commander !== null) throw new Error(`${deck.title}: two commanders marked`);
      deck.commander = name;
    } else {
      deck.rows.push([name, Number(count)]);
    }
  }
  return decks;
}

/** The name the registry knows a card by: a double-faced card's front face. */
const poolName = (name) => {
  for (const candidate of [name, name.split(" // ")[0]]) if (registry.has(candidate)) return candidate;
  return null;
};

const out = [];
for (const deck of parseLists(read("data/archidekt-decks/lists.txt"))) {
  if (deck.commander === null) throw new Error(`${deck.title}: no commander marked`);
  const merged = new Map();
  for (const [name, count] of deck.rows) merged.set(name, (merged.get(name) ?? 0) + count);
  const total = [...merged.values()].reduce((a, b) => a + b, 0);
  if (total !== 99) throw new Error(`${deck.title}: ${total + 1} cards, not 100`);

  const commander = poolName(deck.commander);
  if (commander === null) throw new Error(`${deck.title}: commander ${deck.commander} isn't in the pool`);
  const identity = oracle.get(deck.commander).color_identity;
  const missing = [...merged.keys()].filter((name) => poolName(name) === null);
  const inDeck = new Set([commander, ...[...merged.keys()].map((n) => poolName(n)).filter((n) => n !== null)]);
  const targets = missing.map((name) => {
    const card = oracle.get(name) ?? oracle.get(name.split(" // ")[0]);
    return {
      name: card.name,
      manaCost: card.mana_cost ?? null,
      typeLine: card.type_line,
      power: card.power ?? null,
      toughness: card.toughness ?? null,
      keywords: card.keywords ?? [],
    };
  });
  const assigned = assignReplacements(targets, { identity, exclude: inDeck, tags });
  const substitutions = assigned.map((a, i) => {
    if (a.choice === null) throw new Error(`${deck.title}: no stand-in for ${missing[i]}`);
    const shared = a.choice.sharedTags.slice(0, 3).join(", ");
    return {
      original: missing[i].split(" // ")[0],
      substitute: a.choice.name,
      reason: `Card replacer, ${a.choice.confidence} confidence${shared === "" ? "" : `: ${shared}`}.`,
    };
  });
  const printed = [...merged].map(([name, count]) => [poolName(name) ?? name.split(" // ")[0], count]);
  const archidektId = sources.archidektIds[deck.id];
  if (archidektId === undefined) throw new Error(`${deck.title}: no link in sources.json`);
  out.push({
    name: `${commander.split(",")[0]} by ${deck.author}`,
    commander,
    description: `A real deck, "${deck.title}", built by ${deck.author} on Archidekt.`,
    credit: { author: deck.author, title: deck.title, archidektId, taken: sources.taken },
    printed,
    substitutions,
  });
  console.log(`${out.at(-1).name}: ${substitutions.length} stand-ins`);
  for (const s of substitutions) console.log(`  ${s.original} -> ${s.substitute} (${s.reason})`);
}

const cardLines = (printed) =>
  printed.map(([name, count]) => `      [${JSON.stringify(name)}, ${count}],`).join("\n");
const body = out
  .map(
    (d) => `  {
    name: ${JSON.stringify(d.name)},
    commander: ${JSON.stringify(d.commander)},
    description: ${JSON.stringify(d.description)},
    credit: ${JSON.stringify(d.credit)},
    substitutions: ${JSON.stringify(d.substitutions, null, 6).replace(/\n\]$/, "\n    ]")},
    printed: [
${cardLines(d.printed)}
    ],
  },`,
  )
  .join("\n");

writeFileSync(
  new URL("src/strong-decks.ts", root),
  `// GENERATED by scripts/gen-strong-decks.mjs from data/archidekt-decks/ — don't edit.
// See docs/plans/strong-bot-decks.md.

export interface DeckCredit {
  /** The creator's Archidekt username. */
  readonly author: string;
  /** The creator's own title for the deck. */
  readonly title: string;
  /** Its page is https://archidekt.com/decks/<id>. */
  readonly archidektId: number;
  /** When the list was copied: their page shows their latest version. */
  readonly taken: string;
}

export interface StrongDeckData {
  readonly name: string;
  readonly commander: string;
  readonly description: string;
  readonly credit: DeckCredit;
  readonly substitutions: readonly {
    readonly original: string;
    readonly substitute: string;
    readonly reason: string;
  }[];
  readonly printed: readonly (readonly [string, number])[];
}

export const STRONG_DECK_DATA: readonly StrongDeckData[] = [
${body}
];
`,
);
