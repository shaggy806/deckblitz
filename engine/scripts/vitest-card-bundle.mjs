/**
 * A vitest (Vite) plugin: the card barrel, `src/cards/generated.ts`, served as
 * one module with every card file inlined, instead of 16,000 imports.
 *
 * Every engine test reaches the pool through that barrel, and Vite transforms
 * and evaluates a module graph one file at a time: before this, each worker
 * spent more than a minute transforming and importing the card files before
 * its first test ran (the suite's own report, 2026-10-20: 575 s of transform
 * and 758 s of import across eight workers, against 282 s of tests), and a
 * single test file took over a minute to start; with it, about seven seconds.
 *
 * Bundled once per run, from the sources as they are now, with rolldown (as
 * `bundle-shards.mjs` bundles the built shards). Only the card files —
 * `cards/pool/*` and `cards/tokens/*` — are inlined; everything they import
 * (`define.ts`, the helpers, the effect vocabulary) stays an ordinary import,
 * written relative to the barrel, so the tests and the cards share one copy
 * of each module, as they did before.
 *
 * The card shards (`cards/shards/shard-NN.ts`) import the same card files.
 * They take each card from the bundled barrel instead (its `CARD_FILES`), so a
 * card is one object however a test reaches it — `pool.test.ts` checks a
 * shard's definitions are the barrel's own — and nothing loads the card files
 * one at a time.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { rolldown } from "rolldown";

const here = path.dirname(fileURLToPath(import.meta.url));
const cardsDir = path.resolve(here, "../src/cards");
const barrel = path.join(cardsDir, "generated.ts");
const shardsDir = path.join(cardsDir, "shards") + path.sep;
const inlined = [path.join(cardsDir, "pool") + path.sep, path.join(cardsDir, "tokens") + path.sep];

/** A shard's `import _poolX from "../pool/x.js";`. */
const CARD_IMPORT = /^import (\w+) from "\.\.\/((?:pool|tokens)\/[^"]+)\.js";\r?$/gm;

/** The barrel's bundled source, or a rejection: built on first request. */
let bundled;

async function bundle() {
  const build = await rolldown({
    input: barrel,
    platform: "neutral",
    // Every definition is the point; a tree-shaken card is a missing card.
    treeshake: false,
    plugins: [
      {
        name: "inline-cards-only",
        resolveId(source, importer) {
          if (importer === undefined || !source.startsWith(".")) return null;
          const resolved = path.resolve(path.dirname(importer), source);
          // Sources import each other as ".js" (NodeNext); the file is ".ts".
          const file = resolved.replace(/\.js$/, ".ts");
          if (inlined.some((dir) => file.startsWith(dir))) return file;
          // Shared: an import as the barrel would write it.
          const fromBarrel = path.relative(cardsDir, resolved).split(path.sep).join("/");
          return { id: fromBarrel.startsWith(".") ? fromBarrel : `./${fromBarrel}`, external: true };
        },
      },
    ],
  });
  const { output } = await build.generate({ format: "esm" });
  await build.close();
  return output[0].code;
}

export function cardBarrelBundle() {
  return {
    name: "card-barrel-bundle",
    enforce: "pre",
    load(id) {
      if (path.resolve(id.split("?")[0]) !== barrel) return null;
      bundled ??= bundle();
      return bundled;
    },
    transform(code, id) {
      const file = path.resolve(id.split("?")[0]);
      if (!file.startsWith(shardsDir) || !/shard-\d+\.ts$/.test(file)) return null;
      const locals = [];
      const rest = code.replace(CARD_IMPORT, (_line, local, card) => {
        locals.push(`const ${local} = CARD_FILES[${JSON.stringify(card)}];`);
        return "";
      });
      if (locals.length === 0) return null;
      return `import { CARD_FILES } from "../generated.js";\n${locals.join("\n")}\n${rest}`;
    },
  };
}
