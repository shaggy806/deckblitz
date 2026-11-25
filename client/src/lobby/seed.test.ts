import { describe, expect, it } from 'vitest'
import { parseSeed } from './seed.ts'

describe('parseSeed', () => {
  it('reads a pasted seed, bare or as a game log names it', () => {
    expect(parseSeed('123456')).toBe(123456)
    expect(parseSeed('  seed 3141592653 ')).toBe(3141592653)
    expect(parseSeed('Seed7')).toBe(7)
    expect(parseSeed('0')).toBe(0)
    expect(parseSeed('4294967295')).toBe(4294967295)
  })

  it('is random when left blank', () => {
    expect(parseSeed('')).toBeNull()
    expect(parseSeed('   ')).toBeNull()
  })

  it("refuses what isn't a 32-bit seed", () => {
    for (const text of ['4294967296', '-1', '12.5', 'abc', '1e5', '12 34', '99999999999']) {
      expect(parseSeed(text)).toBeUndefined()
    }
  })
})
