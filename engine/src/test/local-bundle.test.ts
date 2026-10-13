/**
 * `engine/local` bundled for real: Rolldown (Vite's bundler) over the built
 * `dist/local.js` with `engineLocalPlugin`. The entry and every chunk it loads
 * up front carry no card definition — only the card shards, each its own
 * chunk loaded on demand — and the bundle runs: a registry built from the
 * shards the way a page builds one plays a few turns of a bot game, and a game
 * built without one is refused. `local-entry.test.ts` checks the sources; this
 * checks that the swap holds in a bundler.
 *
 * Runs what `tsc` built last, so it's skipped when `dist/` is older than the
 * sources it checks (CI and `npm run verify` build first).
 */

import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { rolldown } from "rolldown";
import { describe, expect, it } from "vitest";
import { engineLocalPlugin } from "../local-plugin.js";
import type * as Local from "../local.js";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const ENTRY = path.join(ROOT, "dist", "local.js");

/** Whether `dist/` was built from the sources this bundle is made of. */
function distIsFresh(): boolean {
  if (!existsSync(ENTRY)) return false;
  const built = statSync(ENTRY).mtimeMs;
  return ["src", "src/bot", "src/cards", "src/decisions", "src/combat"].every((dir) =>
    readdirSync(path.join(ROOT, dir)).every(
      (f) => !f.endsWith(".ts") || f.endsWith(".test.ts") || statSync(path.join(ROOT, dir, f)).mtimeMs <= built,
    ),
  );
}

const isCardModule = (id: string) => /[\\/]cards[\\/](generated\.js|pool[\\/]|tokens[\\/])/.test(id);

describe.skipIf(!distIsFresh())("engine/local, bundled", () => {
  it("loads no card definition up front, and runs a bot game from the shards", { timeout: 120_000 }, async () => {
    const bundle = await rolldown({ input: ENTRY, platform: "browser", plugins: [engineLocalPlugin()] });
    const dir = mkdtempSync(path.join(tmpdir(), "engine-local-"));
    try {
      const { output } = await bundle.write({ dir, format: "esm" });
      await bundle.close();
      const chunks = output.flatMap((o) => (o.type === "chunk" ? [o] : []));
      const byFile = new Map(chunks.map((c) => [c.fileName, c]));
      const entry = chunks.find((c) => c.isEntry)!;

      // What a page loads before anything asks for a card: the entry and its
      // static imports, transitively.
      const upFront = new Set<string>();
      const queue = [entry.fileName];
      while (queue.length > 0) {
        const file = queue.shift()!;
        if (upFront.has(file)) continue;
        upFront.add(file);
        queue.push(...byFile.get(file)!.imports);
      }
      const upFrontModules = [...upFront].flatMap((f) => byFile.get(f)!.moduleIds);
      expect(upFrontModules.filter(isCardModule)).toEqual([]);
      expect(upFrontModules.some((id) => id.endsWith("default-registry.browser.js"))).toBe(true);
      expect(upFrontModules.some((id) => /[\\/]default-registry\.js$/.test(id))).toBe(false);
      // The shards are there, each loaded on demand.
      expect(chunks.filter((c) => c.isDynamicEntry && c.moduleIds.some((id) => /shard-\d+/.test(id)))).toHaveLength(32);

      const local = (await import(pathToFileURL(path.join(dir, entry.fileName)).href)) as typeof Local;
      const shards = await Promise.all(Array.from({ length: local.CARD_SHARD_COUNT }, (_, i) => local.loadCardShard(i)));
      const registry = local.registryFrom(shards.flatMap((s) => [...s.pool, ...s.tokens]));

      const [first, second] = local.SAMPLE_DECKS;
      const decks = [
        { player: local.asPlayerId("alice"), cards: first.cards, commanders: first.commanders },
        { player: local.asPlayerId("bob"), cards: second.cards, commanders: second.commanders },
      ];
      // No registry: the browser's stand-in for the whole pool refuses.
      expect(() => local.Game.create({ seed: 1, decks, rules: local.COMMANDER_RULES })).toThrow(/no card registry was passed/);
      expect(() => new local.HeuristicBotController(local.asPlayerId("alice"))).toThrow(/no card registry was passed/);

      const controllers = Object.fromEntries(
        decks.map((d) => [d.player, new local.EvalBotController(d.player, registry, { maxSimulations: 8 })]),
      );
      const game = local.Game.create({ seed: 1, registry, controllers, decks, rules: local.COMMANDER_RULES });
      game.advanceUntil((s) => s.result.over || s.turn.number >= 5);
      expect(game.state.turn.number).toBeGreaterThanOrEqual(5);
      expect(game.events.some((e) => e.type === "land-played")).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
