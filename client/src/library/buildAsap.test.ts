import { describe, expect, it } from 'vitest'
import { asapNames } from './buildAsap.ts'

describe('asapNames', () => {
  it("is the flagged cards' names", () => {
    const body = { cards: [{ name: 'Mycosynth Lattice', flagged: '2026-11-06' }, { name: 'Winding Constrictor', flagged: '2026-11-06' }] }
    expect([...asapNames(body)]).toEqual(['Mycosynth Lattice', 'Winding Constrictor'])
  })

  it('skips an entry with no name, and refuses a body with no list', () => {
    expect([...asapNames({ cards: [{ flagged: '2026-11-06' }, null] })]).toEqual([])
    expect(() => asapNames({})).toThrow()
  })
})
