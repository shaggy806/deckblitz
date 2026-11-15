import type { CatalogChunk } from 'engine/client'

/**
 * The card catalog's pieces (`engine`'s `cards/catalog.ts`): every card with
 * its behaviour cut away, which is all the library and the deck builder read.
 *
 * The catalog isn't a file in the repo. The `cardCatalog` plugin in
 * `vite.config.ts` makes it from the built engine's pool as the dev server
 * or a build starts, and serves each piece as a module of its own, one
 * `JSON.parse` of a string, under a virtual id. Each import below is a literal
 * so the bundler gives each piece its own file — as the engine's shard
 * loaders are, and for the same reason. Their number is the engine's
 * `CARD_CATALOG_CHUNKS` (`catalogChunks.test.ts` checks).
 */
const LOADERS: readonly (() => Promise<{ readonly default: CatalogChunk }>)[] = [
  () => import('virtual:card-catalog/card-catalog-0'),
  () => import('virtual:card-catalog/card-catalog-1'),
  () => import('virtual:card-catalog/card-catalog-2'),
  () => import('virtual:card-catalog/card-catalog-3'),
  () => import('virtual:card-catalog/card-catalog-4'),
  () => import('virtual:card-catalog/card-catalog-5'),
  () => import('virtual:card-catalog/card-catalog-6'),
  () => import('virtual:card-catalog/card-catalog-7'),
]

/** How many pieces the catalog comes in. */
export const CATALOG_CHUNK_COUNT = LOADERS.length

/** Loads piece `index` (0 to `CATALOG_CHUNK_COUNT - 1`). */
export async function loadCatalogChunk(index: number): Promise<CatalogChunk> {
  const load = LOADERS[index]
  if (load === undefined) throw new RangeError(`no card catalog piece ${index}`)
  return (await load()).default
}
