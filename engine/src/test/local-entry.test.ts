/**
 * `engine/local` (`local.ts`) is the engine as a browser runs a game with it,
 * and like `engine/client` must never reach a card definition — Vite's dev
 * server doesn't tree-shake, so whatever a page's imports reach, it loads.
 * The one route to the pool is the registry a game falls back on
 * (`cards/default-registry.ts`), which a browser build resolves to
 * `default-registry.browser.ts`; this walks the entry's static imports (as
 * `client-entry.test.ts` does) with that same swap, and fails if any lead to a
 * card file.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("../", import.meta.url));

const STATIC_IMPORT = /^\s*(?:import|export)\s+(?!type\s)(?:[^'";]*?\sfrom\s+)?["'](\.[^"']+)["']/gm;

/** What a browser build resolves in place of a module (see `local.ts`). */
const BROWSER_SWAPS = new Map([
  [path.join(SRC, "cards", "default-registry.ts"), path.join(SRC, "cards", "default-registry.browser.ts")],
]);

/** Every source file `entry`'s static imports reach, `entry` included, with
 * `swaps` applied to each resolved file. */
function reachedFrom(entry: string, swaps: ReadonlyMap<string, string>): Set<string> {
  const reached = new Set<string>([entry]);
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.shift()!;
    for (const match of readFileSync(file, "utf8").matchAll(STATIC_IMPORT)) {
      const resolved = path.resolve(path.dirname(file), match[1].replace(/\.js$/, ".ts"));
      const next = swaps.get(resolved) ?? resolved;
      if (!reached.has(next)) {
        reached.add(next);
        queue.push(next);
      }
    }
  }
  return reached;
}

const relative = (file: string) => path.relative(SRC, file).split(path.sep).join("/");
const isCardFile = (f: string) => /^cards\/(generated\.ts|pool\/|tokens\/|shards\/shard-)/.test(f);

describe("engine/local", () => {
  const reached = [...reachedFrom(path.join(SRC, "local.ts"), BROWSER_SWAPS)].map(relative);

  it("reaches no card definition, with the browser's registry swap", () => {
    expect(reached.filter(isCardFile)).toEqual([]);
  });

  it("is walked for real", () => {
    // It gets to the game, the bots and the swapped-in registry…
    expect(reached).toContain("game.ts");
    expect(reached).toContain("bot/eval-bot.ts");
    expect(reached).toContain("cards/default-registry.browser.ts");
    expect(reached).not.toContain("cards/default-registry.ts");
    // …and without the swap the same walk would reach the whole pool.
    const unswapped = [...reachedFrom(path.join(SRC, "local.ts"), new Map())].map(relative);
    expect(unswapped).toContain("cards/generated.ts");
  });
});
