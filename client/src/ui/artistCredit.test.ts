import { describe, expect, it } from 'vitest'

import { artTarget } from './artistCredit.ts'

const ID = '94a50acd-ac2d-47bf-b331-0bcf5edd9c75'

describe('artTarget', () => {
  it('names a card by name when nothing is pinned', () => {
    expect(artTarget(undefined, 'Sol Ring')).toEqual({
      key: 'n:sol ring',
      identifier: { name: 'Sol Ring' },
      back: false,
      faceName: 'Sol Ring',
    })
  })

  it('reads a pinned printing the way resolveArtUrl does', () => {
    expect(artTarget(ID, 'X')?.identifier).toEqual({ id: ID })
    expect(artTarget(ID, 'X', true)?.key).toBe(`i:${ID}:b`)
    // A CDN file says which face it is.
    expect(artTarget(`https://cards.scryfall.io/art_crop/back/9/4/${ID}.jpg`, 'X')).toMatchObject({
      identifier: { id: ID },
      back: true,
    })
    expect(artTarget('https://scryfall.com/card/neo/25/light-paws-emperors-voice', 'X')?.identifier).toEqual({
      set: 'neo',
      collector_number: '25',
    })
    expect(artTarget(`https://api.scryfall.com/cards/${ID}?format=image`, 'X')?.identifier).toEqual({ id: ID })
    expect(artTarget('https://api.scryfall.com/cards/cmr/10', 'X')?.identifier).toEqual({
      set: 'cmr',
      collector_number: '10',
    })
  })

  it('has nothing to look up for an image off Scryfall', () => {
    expect(artTarget('https://example.com/art.jpg', 'X')).toBeNull()
  })
})
