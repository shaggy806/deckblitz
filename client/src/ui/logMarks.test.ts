import { describe, expect, it } from 'vitest'
import type { ObjectId } from 'engine/client'
import { markCard, splitMarked } from './logMarks.ts'

const id = (s: string) => s as ObjectId

describe('a history line marked with its cards', () => {
  it('keeps each name with the id of the card it names', () => {
    // "casts Beast Within at Felothar": two cards in one line, and a click on
    // the second has to be about the second (a bug report, 2026-11-14 — the
    // line as a whole pointed out whichever it found first).
    const line = `Jodah casts ${markCard(id('obj-12'), 'Beast Within')} at ${markCard(id('obj-99'), 'Felothar the Steadfast')}`
    expect(splitMarked(line)).toEqual([
      { text: 'Jodah casts ', card: false },
      { text: 'Beast Within', card: true, id: 'obj-12' },
      { text: ' at ', card: false },
      { text: 'Felothar the Steadfast', card: true, id: 'obj-99' },
      { text: '', card: false },
    ])
  })

  it('leaves a line with no card as one plain run', () => {
    expect(splitMarked('Jodah passes')).toEqual([{ text: 'Jodah passes', card: false }])
  })

  it("keeps a name's punctuation, and an id never shows in the text", () => {
    const parts = splitMarked(`${markCard(id('obj-7'), "Urza's Incubator")} resolves`)
    expect(parts.map((p) => p.text).join('')).toBe("Urza's Incubator resolves")
    expect(parts[1]).toEqual({ text: "Urza's Incubator", card: true, id: 'obj-7' })
  })
})
