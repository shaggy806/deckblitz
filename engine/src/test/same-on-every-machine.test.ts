/**
 * A game copied onto several devices stays one game only if the engine does
 * the same thing on each of them (`docs/plans/replicated-rooms.md`; the
 * fuzzer's `MTG_REPLICA=1` plays that out). Nothing the engine computes may
 * depend on the machine it runs on, and the one such dependence a source can
 * be checked for is the machine's language: `localeCompare`, the
 * `toLocale…` methods and `Intl` order and format text by the browser's
 * locale and its collation data. `primitives.ts`'s `compareNames` and
 * `sortedNames` are what to sort names with.
 *
 * Tests are free to use them; card files aren't walked (33,000 of them, none
 * using any: `git grep -l localeCompare -- engine/src/cards`).
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("../", import.meta.url));

/** Card files, generated barrels and tests: not walked. */
const SKIPPED_DIRS = new Set(["test", "pool", "tokens", "scaffold"]);

function sources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) sources(path.join(dir, entry.name), out);
    } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") && entry.name !== "generated.ts") {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

const LOCALE_READS = /\.localeCompare\(|\.toLocale[A-Z]\w*\(|\bIntl\.\w/;

describe("the engine reads nothing of the machine's language", () => {
  it("has no localeCompare, toLocale… or Intl in its sources", () => {
    const files = sources(SRC);
    // The walk found the engine, not an empty folder.
    expect(files.length).toBeGreaterThan(100);
    expect(files.some((f) => f.endsWith(`${path.sep}game.ts`))).toBe(true);
    const offenders: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (LOCALE_READS.test(line)) offenders.push(`${path.relative(SRC, file)}:${i + 1}: ${line.trim().slice(0, 100)}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});
