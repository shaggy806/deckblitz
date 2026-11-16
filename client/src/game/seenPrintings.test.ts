import { describe, expect, it } from 'vitest'
import type { ObjectId, VisibleObject } from 'engine/client'
import { notePrintings, printingSeen } from './seenPrintings.ts'

/** As much of a `VisibleObject` as the printings read. */
const shown = (faceName: string, art: string | null, faceIsBack = false): VisibleObject =>
  ({ cardName: faceName, faceName, art, faceIsBack }) as unknown as VisibleObject

const id = (s: string) => s as ObjectId

describe('the printings a game has shown', () => {
  it("remembers a card's printing after the card has left every frame", () => {
    notePrintings('room:1', { a: shown('Sol Ring', 'printing-1'), b: shown('Sol Ring', 'printing-2') })
    // The next frame has neither: one was shuffled away, the other died.
    notePrintings('room:1', {})
    // Two copies of one name, each its own printing: by object, not by name.
    expect(printingSeen(id('a'), 'Sol Ring')).toEqual({ art: 'printing-1', faceIsBack: false })
    expect(printingSeen(id('b'), 'Sol Ring')).toEqual({ art: 'printing-2', faceIsBack: false })
  })

  it('has nothing for a card with no printing of its own, or one never seen', () => {
    notePrintings('room:1', { c: shown('Forest', null) })
    expect(printingSeen(id('c'), 'Forest')).toBeUndefined()
    expect(printingSeen(id('zz'), 'Forest')).toBeUndefined()
  })

  it("keeps each face of a double-faced card under that face's name", () => {
    notePrintings('room:1', { d: shown('Delver of Secrets', 'printing-3') })
    notePrintings('room:1', { d: shown('Insectile Aberration', 'printing-3', true) })
    expect(printingSeen(id('d'), 'Delver of Secrets')).toEqual({ art: 'printing-3', faceIsBack: false })
    expect(printingSeen(id('d'), 'Insectile Aberration')).toEqual({ art: 'printing-3', faceIsBack: true })
  })

  it("forgets the last game's cards: an id there is another card here", () => {
    notePrintings('room:1', { e: shown('Sol Ring', 'printing-1') })
    notePrintings('room:2', {})
    expect(printingSeen(id('e'), 'Sol Ring')).toBeUndefined()
  })
})
