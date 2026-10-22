import { useSyncExternalStore } from 'react'

import {
  getArtCacheVersion,
  isArtBlocked,
  isArtPending,
  queueArtLookup,
  recordArtFailure,
  resolveArtUrl,
  subscribeArtCache,
} from './art.ts'
import type { ArtVersion } from './art.ts'

export interface CardArt {
  /** The image URL to draw. */
  readonly src: string
  /** The batched by-name lookup is still out: draw nothing yet, so the eager
   * by-name `<img>` never mounts (see `isArtPending` in art.ts). */
  readonly pending: boolean
  /** Nothing to draw: the image failed, or there was no lookup to make. */
  readonly failed: boolean
  /** Neither: draw `src`. */
  readonly ready: boolean
  /** An `<img>`'s `onError`: remembers the URL as failed. */
  readonly onError: () => void
}

/**
 * A card's art, as every tile, chip and image draws it: the batched lookup
 * queued for a card with no pinned printing (`art`), the URL resolved —
 * re-rendering once the lookup lands, so the direct CDN file replaces the
 * by-name fallback — and a failed image remembered. `skip` is a card with no
 * art to show (a face-down permanent, a token with no printing): nothing is
 * looked up and it's `failed`.
 *
 * The lookup is queued during render, not from an effect: an effect fires
 * after the browser has committed the `<img>` and started loading whatever
 * the first render said. Queued here, `isArtPending` already sees the name in
 * that same render. `queueArtLookup` is idempotent, so a re-render costs
 * nothing.
 */
export function useCardArt(
  art: string | null | undefined,
  name: string,
  opts: { readonly version?: ArtVersion; readonly backFace?: boolean; readonly skip?: boolean } = {},
): CardArt {
  useSyncExternalStore(subscribeArtCache, getArtCacheVersion, getArtCacheVersion)
  const skip = opts.skip === true
  if (!art && !skip) queueArtLookup(name)
  const pending = !art && !skip && isArtPending(name)
  // `backFace` comes from the engine: a chosen printing is named by card id,
  // which serves the front image unless asked otherwise, and only the
  // registry knows a two-entry `faces` list is a real back face rather than
  // an adventure's spell half.
  const src = resolveArtUrl(art, name, opts.version ?? 'art_crop', { backFace: opts.backFace })
  // Derived fresh from `src`, which can change once the lookup resolves.
  const failed = !pending && (skip || isArtBlocked(src))
  return { src, pending, failed, ready: !pending && !failed, onError: () => recordArtFailure(src) }
}
