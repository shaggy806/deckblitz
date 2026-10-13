/**
 * The room code bundled for a browser, for real: Rolldown (Vite's bundler)
 * over the built room code (`dist/room-service.js` and the rest) with the engine's `engineLocalPlugin`,
 * as a page running a solo game will bundle it (`docs/plans/local-rooms.md`).
 * Nothing it loads up front is a Node built-in or a card definition — only the
 * card shards, each a chunk loaded on demand — with tree-shaking off, since
 * Vite's dev server doesn't tree-shake either. `room-core-imports.test.ts`
 * checks the sources; this checks the bundle.
 *
 * Runs what `tsc` built last, so it's skipped when `dist/` is older than the
 * sources (CI and `npm run verify` build first).
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rolldown } from "rolldown";
import { describe, expect, it } from "vitest";
import { engineLocalPlugin } from "engine/local-plugin";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
/** The room code's entries, as `room-core-imports.test.ts` walks them. */
const ENTRIES = ["local-host", "room-service", "room-manager", "tutorial-session", "builder", "card-registry"].map((name) =>
  path.join(ROOT, "dist", `${name}.js`),
);

/** Whether `dist/` was built from the sources as they are now. */
function distIsFresh(): boolean {
  if (!ENTRIES.every((entry) => existsSync(entry))) return false;
  const built = Math.min(...ENTRIES.map((entry) => statSync(entry).mtimeMs));
  return ["src", "src/tutorials"].every((dir) =>
    readdirSync(path.join(ROOT, dir)).every(
      (f) => !f.endsWith(".ts") || statSync(path.join(ROOT, dir, f)).mtimeMs <= built,
    ),
  );
}

const isCardModule = (id: string) => /[\\/]cards[\\/](generated\.js|pool[\\/]|tokens[\\/])/.test(id);

describe.skipIf(!distIsFresh())("the room code, bundled for a browser", () => {
  it("loads no Node module and no card definition up front", { timeout: 120_000 }, async () => {
    const nodeImports: string[] = [];
    const bundle = await rolldown({
      input: ENTRIES,
      platform: "browser",
      // Everything the imports reach, as Vite's dev server loads it: a
      // tree-shaken bundle could hide a module whose code went unused.
      treeshake: false,
      plugins: [
        engineLocalPlugin(),
        {
          name: "no-node",
          resolveId(source: string) {
            if (source.startsWith("node:") || source === "ws") {
              nodeImports.push(source);
              return { id: source, external: true };
            }
            return null;
          },
        },
      ],
    });
    const { output } = await bundle.generate({ format: "esm" });
    await bundle.close();
    expect(nodeImports).toEqual([]);

    const chunks = output.flatMap((o) => (o.type === "chunk" ? [o] : []));
    const byFile = new Map(chunks.map((c) => [c.fileName, c]));
    const upFront = new Set<string>();
    const queue = chunks.filter((c) => c.isEntry).map((c) => c.fileName);
    while (queue.length > 0) {
      const file = queue.shift()!;
      if (upFront.has(file)) continue;
      upFront.add(file);
      queue.push(...byFile.get(file)!.imports);
    }
    const modules = [...upFront].flatMap((f) => byFile.get(f)!.moduleIds);
    expect(modules.filter(isCardModule)).toEqual([]);
    // The walk saw the room code and the engine it runs on.
    expect(modules.some((id) => /[\\/]server[\\/]dist[\\/]room\.js$/.test(id))).toBe(true);
    expect(modules.some((id) => id.endsWith("default-registry.browser.js"))).toBe(true);
  });
});
