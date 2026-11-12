import { describe, expect, it } from 'vitest'
import type { ObjectId, VisibleObject } from 'engine/client'
import { clickFolded, foldSearch } from './zoneFold.ts'

const id = (n: number) => `obj-${n}` as ObjectId

function card(n: number, cardName: string, types: readonly string[], more: Record<string, unknown> = {}): VisibleObject {
  return { id: id(n), cardName, types, supertypes: [], zone: 'library', counters: {}, ...more } as unknown as VisibleObject
}

// A fetch land's finds as the engine lists them, in library order: Forests
// scattered among the rest (the site check, 2026-11-11).
const forest = (n: number) => card(n, 'Forest', ['land'], { supertypes: ['basic'] })
const finds = [
  forest(1),
  forest(2),
  card(3, 'Overgrown Tomb', ['land']),
  card(4, 'Taiga', ['land']),
  forest(5),
  card(6, 'Dryad Arbor', ['land', 'creature']),
  forest(7),
]
const byId = new Map(finds.map((c) => [c.id, c]))
const resolve = (x: ObjectId) => byId.get(x)
const all = finds.map((c) => c.id)

describe('foldSearch', () => {
  it('shows identical cards as one tile, sorted by type and name with basics last', () => {
    expect(foldSearch(all, resolve, all)).toEqual([
      // The land creature sits with the creatures, ahead of the lands.
      [id(6)],
      [id(3)],
      [id(4)],
      [id(1), id(2), id(5), id(7)],
    ])
  })

  it('keeps apart two cards that look different, and the ones that cannot be picked', () => {
    const marked = card(8, 'Forest', ['land'], { supertypes: ['basic'], counters: { charge: 1 } })
    const withMarked = (x: ObjectId) => (x === marked.id ? marked : resolve(x))
    const tiles = foldSearch([...all, marked.id], withMarked, all)
    // Not picked from, so after everything that can be; not folded into the
    // other Forests either.
    expect(tiles.at(-1)).toEqual([marked.id])
    expect(tiles).toHaveLength(5)
  })

  it('gives a card the viewer cannot see a tile of its own, last', () => {
    const hidden = id(99)
    expect(foldSearch([hidden, ...all], resolve, all).at(-1)).toEqual([hidden])
  })
})

describe('clickFolded', () => {
  const forests = [id(1), id(2), id(5), id(7)]
  // The viewer's rule for "up to `max`", with a choice of one moving the pick.
  const upTo = (max: number) => (picked: readonly ObjectId[], next: ObjectId) =>
    picked.length >= max ? (max === 1 ? [next] : picked) : [...picked, next]

  it('picks one more of a folded tile on each click, then takes them all back', () => {
    let picked: readonly ObjectId[] = []
    picked = clickFolded(picked, forests, upTo(2))
    expect(picked).toEqual([id(1)])
    picked = clickFolded(picked, forests, upTo(2))
    expect(picked).toEqual([id(1), id(2)])
    // No third under "up to two": the click clears the tile.
    picked = clickFolded(picked, forests, upTo(2))
    expect(picked).toEqual([])
  })

  it('toggles a tile of one card', () => {
    expect(clickFolded([], [id(3)], upTo(2))).toEqual([id(3)])
    expect(clickFolded([id(3)], [id(3)], upTo(2))).toEqual([])
  })

  it("moves a choice of one to the tile clicked, and clicks it off its own tile", () => {
    expect(clickFolded([id(3)], forests, upTo(1))).toEqual([id(1)])
    expect(clickFolded([id(1)], forests, upTo(1))).toEqual([])
  })

  it('leaves the picks alone when the tile clicked can take none', () => {
    const picked = [id(3), id(4)]
    expect(clickFolded(picked, forests, upTo(2))).toBe(picked)
  })
})
