import type { CardShard } from 'engine/client'

/**
 * Each card shard's built file, so a shard whose request never answers can be
 * asked for again (`cardData.ts`).
 *
 * A shard is reached through the engine's `import()` of it, and a browser
 * keeps one module per URL: importing the same URL again waits on the same
 * stuck request. A new attempt needs a URL of its own, the shard's file with
 * a query added, and only the build knows the file's hashed name. So the
 * build writes the names into `index.html` (the `shardFiles` plugin in
 * `vite.config.ts`), which is never cached, so the list always matches the
 * files deployed beside it. The dev server writes none, and there a shard is
 * never asked for twice.
 */

/** The id of the `<script type="application/json">` the build writes. Also
 * in `vite.config.ts`. */
export const SHARD_FILES_ID = 'card-shard-files'

let files: readonly unknown[] | null | undefined

/** Shard `index`'s URL, or `undefined` where the page doesn't list it. */
export function shardFile(index: number): string | undefined {
  if (files === undefined) {
    try {
      const listed: unknown = JSON.parse(document.getElementById(SHARD_FILES_ID)?.textContent ?? 'null')
      files = Array.isArray(listed) ? listed : null
    } catch {
      files = null
    }
  }
  const file = files?.[index]
  return typeof file === 'string' ? `${import.meta.env.BASE_URL}${file}` : undefined
}

/** Loads the shard at `url` again, as attempt `attempt`. Its own imports
 * resolve to the URLs the first attempt used, so only the shard is fetched
 * anew. */
export async function loadShardFile(url: string, attempt: number): Promise<CardShard> {
  const module = (await import(/* @vite-ignore */ `${url}?retry=${attempt}`)) as { readonly default: CardShard }
  return module.default
}
