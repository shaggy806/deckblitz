import { describe, expect, it } from 'vitest'

import { attackTaxCost, isOwnDefender, phyrexianPipCount } from './attackGroups.ts'
import type { ObjectId } from 'engine/client'
import type { AttackAssign } from './attackGroups.ts'

const assign = (entries: Record<string, string>): AttackAssign => entries as unknown as AttackAssign

describe('isOwnDefender', () => {
  it('is a planeswalker or a battle, whatever else it is', () => {
    expect(isOwnDefender(['planeswalker'])).toBe(true)
    expect(isOwnDefender(['battle'])).toBe(true)
    expect(isOwnDefender(['creature', 'planeswalker'])).toBe(true)
    expect(isOwnDefender(['creature'])).toBe(false)
    expect(isOwnDefender(['artifact', 'land'])).toBe(false)
  })
})

describe('attackTaxCost', () => {
  it('is nothing without a tax', () => {
    expect(attackTaxCost(assign({ a: 'bob' }), undefined)).toEqual({
      mana: 0,
      life: 0,
      phyrexian: '',
      permanents: [],
      overBudget: false,
    })
  })

  it('reads a planeswalker defender at its own rate', () => {
    const tax = { perCreature: { bob: 3, walker: 1 }, budget: 4 }
    expect(attackTaxCost(assign({ a: 'bob', b: 'walker', c: 'carol' }), tax)).toEqual({
      mana: 4,
      life: 0,
      phyrexian: '',
      permanents: [],
      overBudget: false,
    })
  })

  it('adds what a creature costs on its own, permanents included', () => {
    const among = ['x', 'y'] as unknown as readonly ObjectId[]
    const land = { do: 'sacrifice', count: 1, noun: 'land', among } as const
    const tax = {
      perCreature: {},
      budget: 1,
      perAttacker: {
        a: { bob: { generic: 1, life: 0 } },
        b: { bob: { generic: 0, life: 0, permanents: [land] } },
        c: { bob: { generic: 0, life: 0, permanents: [land] } },
        d: { bob: { generic: 0, life: 0, permanents: [land] } },
      },
    }
    expect(attackTaxCost(assign({ a: 'bob', b: 'bob', c: 'bob' }), tax)).toEqual({
      mana: 1,
      life: 0,
      phyrexian: '',
      permanents: ['sacrifice 2 lands'],
      overBudget: false,
    })
    // One more than there are lands to pay with.
    expect(attackTaxCost(assign({ b: 'bob', c: 'bob', d: 'bob' }), tax).overBudget).toBe(true)
  })

  it('adds a tax in life beside the mana', () => {
    const tax = { perCreature: { bob: 2 }, budget: 2, lifePerCreature: { bob: 2, walker: 2 }, lifeBudget: 20 }
    expect(attackTaxCost(assign({ a: 'bob', b: 'walker' }), tax)).toEqual({
      mana: 2,
      life: 4,
      phyrexian: '',
      permanents: [],
      overBudget: false,
    })
  })

  it('adds Phyrexian pips beside the mana, a creature at a time (Norn\'s Annex)', () => {
    const tax = { perCreature: {}, budget: 0, phyrexianPerCreature: { bob: '{W/P}', walker: '{W/P}{W/P}' }, lifeBudget: 20 }
    const cost = attackTaxCost(assign({ a: 'bob', b: 'walker', c: 'carol' }), tax)
    expect(cost.phyrexian).toBe('{W/P}{W/P}{W/P}')
    expect(phyrexianPipCount(cost.phyrexian)).toBe(3)
    expect(phyrexianPipCount('')).toBe(0)
  })

  it('warns past either budget', () => {
    const mana = { perCreature: { bob: 2 }, budget: 1 }
    expect(attackTaxCost(assign({ a: 'bob' }), mana).overBudget).toBe(true)
    const life = { perCreature: {}, budget: 0, lifePerCreature: { bob: 2 }, lifeBudget: 1 }
    expect(attackTaxCost(assign({ a: 'bob' }), life).overBudget).toBe(true)
  })
})
