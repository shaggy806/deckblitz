import { describe, expect, it } from 'vitest'
import type { LegalAction } from 'engine/client'
import { abilitiesBySource } from './abilityMenu.ts'

const ability = (source: string, abilityIndex: number, text: string, plainMana?: string) =>
  ({
    kind: 'activate-ability',
    source,
    abilityIndex,
    cardName: source,
    text,
    targetSpecs: [],
    targetOptions: [],
    manaAbility: true,
    ...(plainMana !== undefined ? { plainMana } : {}),
  }) as unknown as LegalAction

describe('abilitiesBySource', () => {
  it("offers one of a permanent's interchangeable '{T}: Add {W}'s", () => {
    // City of Brass under Dryad of the Ilysian Grove (a bug report, 2026-10-11).
    const any = ['W', 'U', 'B', 'R', 'G'].map((c) => ability('city', 0, `{T}: Add one mana of any color. (add {${c}})`, c))
    const intrinsic = ['W', 'U', 'B', 'R', 'G'].map((c, i) => ability('city', i + 1, `{T}: Add {${c}}.`, c))
    const offered = abilitiesBySource([...any, ...intrinsic]).get('city' as never) ?? []
    expect(offered.map((a) => a.text)).toEqual(any.map((a) => (a as { text: string }).text))
  })

  it("keeps one that isn't plain (a life cost), and other permanents' alike", () => {
    const confluence = ability('confluence', 0, '{T}, Pay 1 life: Add one mana of any color. (add {W})')
    const plain = ability('confluence', 1, '{T}: Add {W}.', 'W')
    const forest = ability('forest', 0, '{T}: Add {W}.', 'W')
    const m = abilitiesBySource([confluence, plain, forest])
    expect(m.get('confluence' as never)).toEqual([confluence, plain])
    expect(m.get('forest' as never)).toEqual([forest])
  })
})
