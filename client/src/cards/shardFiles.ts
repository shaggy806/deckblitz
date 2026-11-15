/**
 * Each card shard's built file, and each catalog piece's, so one whose request
 * never answers can be asked for again (`cardData.ts`).
 *
 * A shard is reached through the engine's `import()` of it (a catalog piece
 * through `catalogChunks.ts`'s), and a browser keeps one module per URL:
 * importing the same URL again waits on the same stuck request. A new attempt
 * needs a URL of its own, the file with a query added, and only the build
 * knows the file's hashed name. So the build writes the names into
 * `index.html` (the `pieceFiles` plugin in `vite.config.ts`), which is never
 * cached, so the lists always match the files deployed beside it. The dev
 * server writes none, and there a file is never asked for twice.
 */

/** The ids of the `<script type="application/json">`s the build writes. Also
 * in `vite.config.ts`. */
export const SHARD_FILES_ID = 'card-shard-files'
export const CATALOG_FILES_ID = 'card-catalog-files'

const lists = new Map<string, readonly unknown[] | null>()

/** File `index` of the list written under `id`, or `undefined` where the
 * page doesn't list it. */
function listedFile(id: string, index: number): string | undefined {
  let files = lists.get(id)
  if (files === undefined) {
    try {
      const listed: unknown = JSON.parse(document.getElementById(id)?.textContent ?? 'null')
      files = Array.isArray(listed) ? listed : null
    } catch {
      files = null
    }
    lists.set(id, files)
  }
  const file = files?.[index]
  return typeof file === 'string' ? `${import.meta.env.BASE_URL}${file}` : undefined
}

/** Shard `index`'s URL, or `undefined` where the page doesn't list it. */
export const shardFile = (index: number): string | undefined => listedFile(SHARD_FILES_ID, index)

/** Catalog piece `index`'s URL, likewise. */
export const catalogFile = (index: number): string | undefined => listedFile(CATALOG_FILES_ID, index)

/** Loads the shard or catalog piece at `url` again, as attempt `attempt`. Its
 * own imports resolve to the URLs the first attempt used, so only the file
 * itself is fetched anew. */
export async function loadShardFile<T>(url: string, attempt: number): Promise<T> {
  const module = (await import(/* @vite-ignore */ `${url}?retry=${attempt}`)) as { readonly default: T }
  return module.default
}
