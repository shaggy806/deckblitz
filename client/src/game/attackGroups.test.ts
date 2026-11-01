import { describe, expect, it } from 'vitest'

import { attackTaxCost } from './attackGroups.ts'
import type { AttackAssign } from './attackGroups.ts'

const assign = (entries: Record<string, string>): AttackAssign => entries as unknown as AttackAssign

describe('attackTaxCost', () => {
  it('is nothing without a tax', () => {
    expect(attackTaxCost(assign({ a: 'bob' }), undefined)).toEqual({ mana: 0, life: 0, overBudget: false })
  })

  it('reads a planeswalker defender at its own rate', () => {
    const tax = { perCreature: { bob: 3, walker: 1 }, budget: 4 }
    expect(attackTaxCost(assign({ a: 'bob', b: 'walker', c: 'carol' }), tax)).toEqual({
      mana: 4,
      life: 0,
      overBudget: false,
    })
  })

  it('adds a tax in life beside the mana', () => {
    const tax = { perCreature: { bob: 2 }, budget: 2, lifePerCreature: { bob: 2, walker: 2 }, lifeBudget: 20 }
    expect(attackTaxCost(assign({ a: 'bob', b: 'walker' }), tax)).toEqual({ mana: 2, life: 4, overBudget: false })
  })

  it('warns past either budget', () => {
    const mana = { perCreature: { bob: 2 }, budget: 1 }
    expect(attackTaxCost(assign({ a: 'bob' }), mana).overBudget).toBe(true)
    const life = { perCreature: {}, budget: 0, lifePerCreature: { bob: 2 }, lifeBudget: 1 }
    expect(attackTaxCost(assign({ a: 'bob' }), life).overBudget).toBe(true)
  })
})
