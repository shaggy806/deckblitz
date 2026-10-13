import { describe, expect, it } from 'vitest'
import type { CardDefinition, ObjectId, PlayerId, PlayerView, VisibleObject } from 'engine/client'
import { defToVisible } from '../ui/defToVisible.ts'
import { computeBoardEntries } from './board.ts'

const me = 'you' as PlayerId

const plant = (n: number, counters: Record<string, number> = {}): VisibleObject => ({
  ...defToVisible({
    name: 'Plant Token',
    manaCost: '',
    colors: ['G'],
    types: ['creature'],
    supertypes: [],
    subtypes: ['Plant'],
    power: 0,
    toughness: 1,
    loyalty: null,
    keywords: [],
    text: '',
  } as unknown as CardDefinition),
  id: `obj-${n}` as ObjectId,
  isToken: true,
  isCommander: false,
  counters,
})

const forest = (n: number, summoningSick: boolean): VisibleObject => ({
  ...defToVisible({
    name: 'Forest',
    manaCost: null,
    colors: [],
    types: ['land'],
    supertypes: ['basic'],
    subtypes: ['Forest'],
    power: null,
    toughness: null,
    loyalty: null,
    keywords: [],
    text: '({T}: Add {G}.)',
  } as unknown as CardDefinition),
  id: `obj-${n}` as ObjectId,
  isCommander: false,
  summoningSick,
})

const treasure = (n: number, summoningSick: boolean): VisibleObject => ({
  ...defToVisible({
    name: 'Treasure',
    manaCost: '',
    colors: [],
    types: ['artifact'],
    supertypes: [],
    subtypes: ['Treasure'],
    power: null,
    toughness: null,
    loyalty: null,
    keywords: [],
    text: '{T}, Sacrifice this token: Add one mana of any color.',
  } as unknown as CardDefinition),
  id: `obj-${n}` as ObjectId,
  isToken: true,
  isCommander: false,
  summoningSick,
})

const board = (objects: readonly VisibleObject[]): PlayerView =>
  ({
    zones: { battlefield: objects.map((o) => o.id) },
    objects: Object.fromEntries(objects.map((o) => [o.id, o])),
  }) as unknown as PlayerView

const tiles = (objects: readonly VisibleObject[]) =>
  computeBoardEntries(board(objects), me).map((e) => e.count)

describe('computeBoardEntries', () => {
  it('draws identical tokens with the same counters on one tile', () => {
    // Avenger of Zendikar's seven Plants, each given a +1/+1 counter.
    const plants = [1, 2, 3, 4, 5, 6, 7].map((n) => plant(n, { '+1/+1': 1 }))
    expect(tiles(plants)).toEqual([7])
  })

  it('keeps tokens with different counters on separate tiles', () => {
    expect(tiles([plant(1, { '+1/+1': 1 }), plant(2, { '+1/+1': 1 }), plant(3, { '+1/+1': 2 }), plant(4)])).toEqual([
      2, 1, 1,
    ])
  })

  it('folds a land played this turn into the stack of identical lands', () => {
    // The engine marks every permanent that enters "summoning sick" until its
    // controller's next turn; that only means anything to a creature (rule
    // 302.6), so a Forest just played joins the two already there (the
    // user, 2026-10-12: it stayed its own tile until the next turn).
    expect(tiles([forest(1, false), forest(2, false), forest(3, true)])).toEqual([3])
  })

  it('folds a noncreature token made this turn into its fellows', () => {
    expect(tiles([treasure(1, false), treasure(2, true)])).toEqual([2])
  })

  it('still keeps a summoning-sick creature token apart from one that can attack', () => {
    expect(tiles([{ ...plant(1), summoningSick: true }, plant(2)])).toEqual([1, 1])
  })
})
