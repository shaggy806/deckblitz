import { describe, expect, it } from 'vitest'
import { CARD_CATALOG_CHUNKS } from 'engine/client'
import { CATALOG_CHUNK_COUNT } from './catalogChunks.ts'

describe('the catalog loaders', () => {
  it('are one a piece of the catalog the engine makes', () => {
    // Each is a literal import, so their number is written out here; the
    // build would otherwise leave a piece unfetched, or ask for one that
    // isn't there.
    expect(CATALOG_CHUNK_COUNT).toBe(CARD_CATALOG_CHUNKS)
  })
})
