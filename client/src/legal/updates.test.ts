import { describe, expect, it } from 'vitest'
// The notes as the site serves them: the file's text, not a module of it.
import notesFile from '../../public/updates.json?raw'
import { parseUpdates, updateDayLabel } from './updates.ts'

describe('parseUpdates', () => {
  it('keeps the entries with a real day and a note, newest first', () => {
    expect(
      parseUpdates([
        { date: '2026-11-20', notes: ['older'] },
        { date: '2026-11-25', notes: ['newer', '  ', 7] },
        { date: '2026-13-01', notes: ['no such month'] },
        { date: '2026-11-21', notes: [] },
        { date: 20261122, notes: ['not a string'] },
        'nonsense',
        null,
      ]),
    ).toEqual([
      { date: '2026-11-25', notes: ['newer'] },
      { date: '2026-11-20', notes: ['older'] },
    ])
  })

  it('is no entries for anything that is not a list', () => {
    for (const payload of [null, undefined, {}, 'x', 3]) expect(parseUpdates(payload)).toEqual([])
  })
})

describe('updateDayLabel', () => {
  it('writes the day out', () => {
    expect(updateDayLabel('2026-11-25')).toBe('November 25, 2026')
    expect(updateDayLabel('whenever')).toBe('whenever')
  })
})

describe('public/updates.json', () => {
  const written = JSON.parse(notesFile) as unknown

  it('is a list every entry of which is kept, newest first as written', () => {
    expect(Array.isArray(written)).toBe(true)
    const parsed = parseUpdates(written)
    // Nothing dropped (a bad date, an empty note) and nothing out of order.
    expect(parsed).toEqual(written)
    expect(parsed.length).toBeGreaterThan(0)
  })

  it('has notes a player can read: a sentence each, no commit hashes', () => {
    for (const entry of parseUpdates(written)) {
      for (const note of entry.notes) {
        expect(note).toMatch(/[.!?)]$/)
        expect(note).not.toMatch(/\b[0-9a-f]{7,40}\b/)
        expect(note.length).toBeLessThan(260)
      }
    }
  })
})
