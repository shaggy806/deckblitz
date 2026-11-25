import { describe, expect, it } from 'vitest'
import { hasTapAbility, isTapAbilityLine } from './tapAbility.ts'

describe('hasTapAbility', () => {
  const card = (text: string, types: string[] = ['artifact']) => ({ text, types: types as never })

  it('finds a {T} ability anywhere in the text', () => {
    expect(hasTapAbility(card('{T}: Add {C}{C}.'))).toBe(true)
    expect(hasTapAbility(card('Flying\n{1}, {T}, Sacrifice a creature: Draw a card.', ['creature']))).toBe(true)
    expect(hasTapAbility(card('Exhaust — {T}: Untap target land.', ['creature']))).toBe(true)
  })

  it("doesn't count an ability given to something else, or reminder text", () => {
    expect(isTapAbilityLine('Equipped creature has "{T}: This creature deals 1 damage to any target."')).toBe(false)
    expect(isTapAbilityLine('Crew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)')).toBe(false)
    expect(hasTapAbility(card('Equipped creature gets +2/+0.\nEquip {1}'))).toBe(false)
  })

  it('leaves lands out', () => {
    expect(hasTapAbility(card('{T}: Add {G}.', ['land']))).toBe(false)
    expect(hasTapAbility(card('{T}: Add {C}.\n{2}, {T}: Draw a card.', ['artifact', 'land']))).toBe(false)
  })
})
