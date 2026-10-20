/**
 * Runs after `tsc` (the engine's `build`): bundles each card shard in `dist/`
 * into one file, with its cards inlined — and the card barrel,
 * `dist/cards/generated.js`, the same way.
 *
 * `tsc` emits `dist/cards/shards/shard-NN.js` as it was written — ~180 imports,
 * one per card file. A production bundle folds those into one chunk per shard
 * anyway, but Vite's dev server doesn't bundle: the library and the deck
 * builder, which load all 32 shards, made one request per card (5,800 of
 * them) and took 39 s to open after the dev server started, then 4-5 s on
 * every load while the browser revalidated each file.
 *
 * The barrel is the same story for everything that runs on Node: the server,
 * its tests, the fuzzer, the bots' benches — each import of it was 16,000
 * module loads (5 s natively, far more through vitest's module runner, once
 * per server test file: 2026-10-20).
 *
 * Only the card files are inlined — `cards/pool/*` and `cards/tokens/*`, which
 * nothing else imports on the way to a shard or the barrel. Everything they
 * import (the definitions' helpers, the effect vocabulary) stays an ordinary
 * import of the shared module, so a page still has one copy of each and the
 * rest of `dist/` is untouched. `pool/`, `tokens/` and `shards/` are all
 * children of `cards/`, so a card's own relative import ("../define.js",
 * "../../effects.js") means the same thing written in its shard.
 *
 * Only the web client loads shards (`loadCardShard`); the server reaches cards
 * through the barrel, never a shard. A shard's cards and the barrel's are
 * separate copies in `dist/` — nothing loads both and compares them (the
 * engine's tests, which do, read `src/`).
 */

import { readdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rolldown } from "rolldown";

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, "../dist");
const cardsDir = path.join(distDir, "cards");
const shardsDir = path.join(cardsDir, "shards");
const inlined = [path.join(cardsDir, "pool") + path.sep, path.join(cardsDir, "tokens") + path.sep];

const shards = readdirSync(shardsDir).filter((f) => /^shard-\d+\.js$/.test(f));
if (shards.length === 0) throw new Error(`no shards in ${shardsDir} — run tsc first`);

let cards = 0;

/** Bundle `input` in place, its card files inlined. The staging directory
 * sits beside the input's own, at the same depth, so the file name in its
 * source-map comment and the map's relative source paths come out right. */
async function bundleInPlace(input, stagingDir) {
  const ownDir = path.dirname(input);
  const bundle = await rolldown({
    input,
    platform: "neutral",
    // The card files are the whole of the shard's own code; a tree-shaken
    // definition would be a card missing from the pool.
    treeshake: false,
    plugins: [
      {
        name: "inline-cards-only",
        resolveId(source, importer) {
          if (importer === undefined || !source.startsWith(".")) return null;
          const resolved = path.resolve(path.dirname(importer), source);
          if (inlined.some((dir) => resolved.startsWith(dir))) {
            cards += 1;
            return resolved;
          }
          // Shared: keep it an import, written as the input sees it.
          const fromInput = path.relative(ownDir, resolved).split(path.sep).join("/");
          return { id: fromInput.startsWith(".") ? fromInput : `./${fromInput}`, external: true };
        },
      },
    ],
  });
  const tmp = path.join(stagingDir, path.basename(input));
  await bundle.write({ file: tmp, format: "esm", sourcemap: true });
  await bundle.close();
  renameSync(tmp, input);
  renameSync(`${tmp}.map`, `${input}.map`);
}

const t0 = Date.now();
const shardStaging = path.join(cardsDir, ".shards-bundling");
rmSync(shardStaging, { recursive: true, force: true });
for (const file of shards) await bundleInPlace(path.join(shardsDir, file), shardStaging);
rmSync(shardStaging, { recursive: true, force: true });
const shardCards = cards;

const barrelStaging = path.join(distDir, ".barrel-bundling");
rmSync(barrelStaging, { recursive: true, force: true });
await bundleInPlace(path.join(cardsDir, "generated.js"), barrelStaging);
rmSync(barrelStaging, { recursive: true, force: true });

console.log(
  `bundled ${shards.length} card shards (${shardCards} card modules inlined) and the card barrel (${cards - shardCards}) in ${Date.now() - t0} ms`,
);
