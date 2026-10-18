import { afterEach, describe, expect, it, vi } from 'vitest'
import { isArtPending, lookupNameOf, queueArtLookup, resolveArtUrl } from './art.ts'

// A precon's Sol Ring (Tarkir: Dragonstorm Commander), as decks pin it.
const SOL_RING = '7b0ccfd4-f118-4497-9c5a-54cf12000e16'

describe('resolveArtUrl', () => {
  it("serves a pinned printing straight off Scryfall's CDN, never through the rate-limited API", () => {
    // A bare id went through api.scryfall.com/cards/{id}?format=image, a
    // redirect per image under the API's rate limit: a game's first boards ran
    // past it and the failed images stayed blank (a bug report, 2026-10-13).
    expect(resolveArtUrl(SOL_RING, 'Sol Ring')).toBe(
      `https://cards.scryfall.io/art_crop/front/7/b/${SOL_RING}.jpg`,
    )
    expect(resolveArtUrl(SOL_RING, 'Sol Ring', 'normal')).toBe(
      `https://cards.scryfall.io/normal/front/7/b/${SOL_RING}.jpg`,
    )
    expect(resolveArtUrl(SOL_RING, 'Sol Ring', 'png')).toBe(`https://cards.scryfall.io/png/front/7/b/${SOL_RING}.png`)
    expect(resolveArtUrl(SOL_RING.toUpperCase(), 'Sol Ring')).toBe(
      `https://cards.scryfall.io/art_crop/front/7/b/${SOL_RING}.jpg`,
    )
  })

  it("shows a double-faced card's back from the CDN's back file", () => {
    expect(resolveArtUrl(SOL_RING, 'x', 'large', { backFace: true })).toBe(
      `https://cards.scryfall.io/large/back/7/b/${SOL_RING}.jpg`,
    )
  })

  it('still asks the API for a printing named by its page or API link, which carries no id', () => {
    expect(resolveArtUrl('https://scryfall.com/card/tdc/108/sol-ring', 'Sol Ring')).toBe(
      'https://api.scryfall.com/cards/tdc/108?format=image&version=art_crop',
    )
  })

  it('falls back to the name for anything it would not fetch', () => {
    expect(resolveArtUrl('https://evil.example/x.jpg', 'Sol Ring')).toContain('api.scryfall.com/cards/named?exact=Sol%20Ring')
  })
})

describe('the batched lookup of a two-part card', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('asks for the first face, which Scryfall finds where the full "A // B" name is not found', () => {
    expect(lookupNameOf('Birgi, God of Storytelling // Harnfel, Horn of Bounty')).toBe('Birgi, God of Storytelling')
    expect(lookupNameOf('Fire // Ice')).toBe('Fire')
    expect(lookupNameOf('Sol Ring')).toBe('Sol Ring')
  })

  it("caches the full name's image off the first-face answer (a bug report, 2026-10-18)", async () => {
    const full = 'Birgi, God of Storytelling // Harnfel, Horn of Bounty'
    const front = 'https://cards.scryfall.io/normal/front/4/4/44657ab1-0a6a-4a5f-9688-86f239083821.jpg'
    const sent: string[] = []
    vi.stubGlobal('fetch', async (_url: string, init: { body: string }) => {
      for (const id of JSON.parse(init.body).identifiers as { name: string }[]) sent.push(id.name)
      // What /cards/collection answers for the first face: the whole card,
      // its images on each face (a modal double-faced card has none on top).
      return new Response(
        JSON.stringify({
          data: [
            {
              name: full,
              card_faces: [
                { name: 'Birgi, God of Storytelling', image_uris: { normal: front } },
                { name: 'Harnfel, Horn of Bounty', image_uris: { normal: front.replace('/front/', '/back/') } },
              ],
            },
          ],
          not_found: [],
        }),
        { status: 200 },
      )
    })
    queueArtLookup(full)
    await vi.waitFor(() => expect(isArtPending(full)).toBe(false))
    expect(sent).toEqual(['Birgi, God of Storytelling'])
    expect(resolveArtUrl(undefined, full, 'normal')).toBe(front)
  })
})
