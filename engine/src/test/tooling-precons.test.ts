/**
 * The tooling precons (`data/tooling-precons.json`, seated by the bot tools
 * through `scripts/tool-decks.mjs`): each still a legal deck of cards the
 * pool has, and none of them reachable from the engine's exports, which is
 * what keeps them out of every list a player sees (the user's condition,
 * 2026-11-16).
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { createDefaultRegistry } from "../cards.js";
import { validateCommanderDeck } from "../deck-validation.js";
import { SAMPLE_DECKS, STARTER_DECKS, STRONG_DECKS } from "../sample-decks.js";

interface ToolingPrecon {
  readonly name: string;
  readonly code: string;
  readonly released: string;
  readonly commanders: readonly string[];
  readonly cards: readonly string[];
}

const file = fileURLToPath(new URL("../../data/tooling-precons.json", import.meta.url));
const decks = JSON.parse(readFileSync(file, "utf8")) as ToolingPrecon[];
const reg = createDefaultRegistry();

describe("the tooling precons", () => {
  it("are each a legal 100-card Commander deck of implemented cards", () => {
    expect(decks.length).toBeGreaterThan(60);
    const problems: string[] = [];
    for (const deck of decks) {
      const missing = [...deck.commanders, ...deck.cards].filter((name) => !reg.has(name));
      const verdict = validateCommanderDeck({ commanders: deck.commanders, cards: deck.cards, size: 100 }, reg);
      if (missing.length > 0 || !verdict.legal) {
        problems.push(`${deck.name}: ${[...missing.map((n) => `no ${n}`), ...verdict.violations].slice(0, 3).join("; ")}`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("have names of their own, that a tool's --decks can carry", () => {
    const names = decks.map((deck) => deck.name);
    expect(new Set(names).size).toBe(names.length);
    const taken = new Set([...SAMPLE_DECKS, ...STARTER_DECKS, ...STRONG_DECKS].map((deck) => deck.name));
    expect(names.filter((name) => taken.has(name))).toEqual([]);
    // `--decks "A,B;C,D"` splits on these.
    expect(names.filter((name) => /[,;]/.test(name))).toEqual([]);
  });

  it("are read by no engine source file", () => {
    const src = fileURLToPath(new URL("..", import.meta.url));
    // Everything but the tests and the card files (33,000 of them, none a
    // place a deck list would be read).
    const scanned = readdirSync(src, { recursive: true, encoding: "utf8" }).filter(
      (path) => path.endsWith(".ts") && !path.includes("test") && !path.startsWith("cards"),
    );
    expect(scanned).toContain("sample-decks.ts");
    expect(scanned).toContain("index.ts");
    const reads = scanned.filter((path) => readFileSync(`${src}/${path}`, "utf8").includes("tooling-precons"));
    expect(reads).toEqual([]);
  });
});
