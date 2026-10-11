import { describe, expect, it } from 'vitest'
import { namesOf, offeredSets } from './setFilter.ts'

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
