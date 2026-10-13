import { describe, expect, it } from 'vitest'
import { namesOf, offeredSets, setCardsOf } from './setFilter.ts'
import type { ScryfallPrint } from './setFilter.ts'

const set = (code: string, set_type: string, released_at: string, extra: object = {}) => ({
  code,
  name: code.toUpperCase(),
  set_type,
  released_at,
  card_count: 100,
  ...extra,
})

describe('offeredSets', () => {
  it('offers paper expansions, core, Commander, masters and the like, newest first', () => {
    const offered = offeredSets(
      [
        set('dmu', 'expansion', '2022-09-09'),
        set('fra', 'expansion', '2026-10-02'),
        set('fdn', 'core', '2024-11-15'),
        set('fdc', 'commander', '2024-11-15'),
        set('sld', 'box', '2019-12-02'),
        set('tfra', 'token', '2026-10-02'),
        set('pfra', 'promo', '2026-10-02'),
      ],
      '2026-10-11',
    )
    expect(offered.map((s) => s.code)).toEqual(['fra', 'fdc', 'fdn', 'dmu'])
  })

  it('leaves out a digital set, one with no cards, and one not out yet', () => {
    const offered = offeredSets(
      [
        set('ymid', 'expansion', '2021-12-09', { digital: true }),
        set('emp', 'expansion', '2026-01-01', { card_count: 0 }),
        set('nxt', 'expansion', '2027-02-05'),
        set('fra', 'expansion', '2026-10-02'),
      ],
      '2026-10-11',
    )
    expect(offered.map((s) => s.code)).toEqual(['fra'])
  })
})

describe('namesOf', () => {
  it("answers to a double-faced or split card's full name and each face's", () => {
    expect(namesOf('Bloodline Keeper // Lord of Lineage')).toEqual([
      'Bloodline Keeper // Lord of Lineage',
      'Bloodline Keeper',
      'Lord of Lineage',
    ])
    expect(namesOf('Sol Ring')).toEqual(['Sol Ring'])
  })
})

const img = (id: string, face = 'front') => `https://cards.scryfall.io/normal/${face}/${id}.jpg`
const print = (name: string, collector_number: string, extra: Partial<ScryfallPrint> = {}): ScryfallPrint => ({
  id: `${name}#${collector_number}`,
  name,
  collector_number,
  image_uris: { normal: img(`${name}-${collector_number}`) },
  ...extra,
})

describe('setCardsOf', () => {
  it("gives each card its printing from the set: the lowest-numbered, ahead of a variant or a reprint numbered past the set's end", () => {
    // Scryfall's own `unique: 'cards'` pick for Foundations' Serra Angel is
    // #740; the set's card is #147.
    const cards = setCardsOf([
      print('Serra Angel', '740'),
      print('Overlord of the Hauntwoods', '395'),
      print('Serra Angel', '147'),
      print('Overlord of the Hauntwoods', '194'),
      print('Overlord of the Hauntwoods', '383'),
      print('Plains', '277'),
      print('Plains', '272'),
      print('Plains', '272a'),
    ])
    expect(cards.total).toBe(3)
    expect(cards.printings.get('Serra Angel')).toEqual({
      id: 'Serra Angel#147',
      collectorNumber: '147',
      image: img('Serra Angel-147'),
    })
    expect(cards.printings.get('Overlord of the Hauntwoods')?.collectorNumber).toBe('194')
    expect(cards.printings.get('Plains')?.collectorNumber).toBe('272')
  })

  it("gives a double-faced card's faces their own images, and a split card's one image to every name", () => {
    const cards = setCardsOf([
      print('Bloodline Keeper // Lord of Lineage', '90', {
        image_uris: undefined,
        card_faces: [
          { name: 'Bloodline Keeper', image_uris: { normal: img('bk') } },
          { name: 'Lord of Lineage', image_uris: { normal: img('bk', 'back') } },
        ],
      }),
      print('Fire // Ice', '128', {
        image_uris: { normal: img('fire-ice') },
        card_faces: [{ name: 'Fire' }, { name: 'Ice' }],
      }),
    ])
    expect(cards.total).toBe(2)
    expect(cards.printings.get('Bloodline Keeper')?.image).toBe(img('bk'))
    expect(cards.printings.get('Lord of Lineage')?.image).toBe(img('bk', 'back'))
    expect(cards.printings.get('Bloodline Keeper // Lord of Lineage')?.image).toBe(img('bk'))
    expect(cards.printings.get('Fire // Ice')?.image).toBe(img('fire-ice'))
    expect(cards.printings.get('Ice')?.image).toBe(img('fire-ice'))
    expect([...cards.names]).toEqual(
      expect.arrayContaining(['Bloodline Keeper', 'Lord of Lineage', 'Fire // Ice', 'Fire', 'Ice']),
    )
  })
})
