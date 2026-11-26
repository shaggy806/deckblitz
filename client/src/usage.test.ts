import { describe, expect, it } from 'vitest'
import { parseStart } from './usage.ts'

describe('parseStart', () => {
  it('keeps the table a game began with, so its end is reported the same way', () => {
    const marker = JSON.stringify({ at: 1000, mode: 'multiplayer', humans: 3 })
    expect(parseStart(marker)).toEqual({ at: 1000, mode: 'multiplayer', humans: 3 })
  })

  it('reads a marker from before 2026-11-26, the start time alone', () => {
    expect(parseStart('1795564850754')).toEqual({ at: 1795564850754, mode: undefined, humans: undefined })
  })

  it('reads anything else as no start known', () => {
    const start = parseStart('not json')
    expect(start.mode).toBeUndefined()
    expect(start.humans).toBeUndefined()
    expect(typeof start.at).toBe('number')
  })
})
