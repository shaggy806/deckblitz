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
})
