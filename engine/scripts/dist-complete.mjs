/**
 * Runs before `tsc` in the engine's `build`: makes the incremental build
 * re-emit any output that has gone missing from `dist/`.
 *
 * `tsc` is incremental (`tsconfig.json`, its state in `dist/.tsbuildinfo`). The
 * build info records what was emitted, and `tsc` trusts it: a source file
 * whose text hasn't changed is never emitted again, even when its `.js` was
 * deleted since. Deleting all of `dist/` is safe (the build info goes with
 * it); deleting part of it is not. So this checks that every file `tsc` emits
 * for a source in `src/` (the `.js`, `.d.ts` and their maps) is still there,
 * and so is `bundle-shards.mjs`'s copy of each card shard's and the barrel's
 * raw emit (`dist/.raw/`); if anything is missing it deletes the build info,
 * so this `tsc` is a full one. Two directory walks, ~0.1 s.
 */

import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "../src");
const distDir = path.resolve(here, "../dist");
const buildInfo = path.join(distDir, ".tsbuildinfo");

if (existsSync(buildInfo)) {
  /** Every file under `root`, as paths relative to it with "/" separators.
   * By hand: `readdirSync`'s own `recursive` takes 3-7 s over dist's 111,000
   * files on Windows, this ~60 ms. */
  const walk = (root) => {
    const files = [];
    const dirs = [""];
    while (dirs.length > 0) {
      const dir = dirs.pop();
      for (const e of readdirSync(dir === "" ? root : path.join(root, dir), { withFileTypes: true })) {
        const rel = dir === "" ? e.name : `${dir}/${e.name}`;
        if (e.isDirectory()) dirs.push(rel);
        else files.push(rel);
      }
    }
    return files;
  };

  const have = new Set(walk(distDir));
  const missing = [];
  // What `tsconfig.json` compiles: `src/**`, less `*.test.ts` and `src/test/`.
  for (const rel of walk(srcDir)) {
    if (!rel.endsWith(".ts") || rel.endsWith(".d.ts") || rel.endsWith(".test.ts")) continue;
    if (rel.startsWith("test/")) continue;
    const base = rel.slice(0, -3);
    const outputs = [`${base}.js`, `${base}.js.map`, `${base}.d.ts`, `${base}.d.ts.map`];
    // bundle-shards.mjs re-bundles each shard and the barrel from these.
    if (/^cards\/(shards\/shard-\d+|generated)$/.test(base)) outputs.push(`.raw/${base}.js`);
    for (const out of outputs) if (!have.has(out)) missing.push(out);
  }
  if (missing.length > 0) {
    rmSync(buildInfo, { force: true });
    console.log(
      `dist-complete: ${missing.length} output(s) missing (${missing.slice(0, 3).join(", ")}${missing.length > 3 ? ", …" : ""}) — full emit`,
    );
  }
}
