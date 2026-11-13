import { describe, expect, it } from 'vitest'
import { matchesTerms, searchHaystack, searchTerms } from './search.ts'

const atraxa = "atraxa, praetors' voice \n legendary creature — phyrexian angel horror \n flying, vigilance, deathtouch, lifelink"
const dragon = 'shivan dragon \n creature — dragon \n flying\n{r}: this creature gets +1/+0 until end of turn.'

describe('searchTerms', () => {
  it('splits a query into its words, lowercased', () => {
    expect(searchTerms('  Flying   Dragon ')).toEqual(['flying', 'dragon'])
    expect(searchTerms('')).toEqual([])
  })

  it('keeps a quoted phrase whole, closed or not', () => {
    expect(searchTerms('dragon "until end of turn"')).toEqual(['dragon', 'until end of turn'])
    expect(searchTerms('"draw a card')).toEqual(['draw a card'])
    expect(searchTerms('""')).toEqual([])
  })
})

describe('matchesTerms', () => {
  const finds = (haystack: string, query: string) => matchesTerms(haystack, searchTerms(query))

  it('finds a card by words in any order, across name, type and text', () => {
    expect(finds(atraxa, 'atraxa praetors')).toBe(true)
    expect(finds(dragon, 'flying dragon')).toBe(true)
    expect(finds(dragon, 'dragon flying')).toBe(true)
    expect(finds(atraxa, 'flying dragon')).toBe(false)
  })

  it('needs a quoted phrase as written', () => {
    expect(finds(dragon, '"end of turn"')).toBe(true)
    expect(finds(dragon, '"turn of end"')).toBe(false)
  })

  it('matches everything on an empty query', () => {
    expect(finds(dragon, '')).toBe(true)
  })
})

describe('searchHaystack', () => {
  const finds = (haystack: string, query: string) => matchesTerms(haystack, searchTerms(query))
  const ice = searchHaystack(['Fire // Ice', 'Instant // Instant', 'Tap target permanent.\nDraw a card.', null, ''])

  it('lowercases and finds a quoted phrase across a line break in one field', () => {
    expect(finds(ice, '"tap target permanent. draw a card"')).toBe(true)
  })

  it("never runs a phrase from one field into the next", () => {
    expect(finds(ice, '"instant tap"')).toBe(false)
    expect(finds(ice, '"ice instant"')).toBe(false)
    expect(finds(ice, 'ice instant')).toBe(true)
  })
})
