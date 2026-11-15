import { describe, expect, it } from 'vitest'
import type { LegalAction } from 'engine/client'
import { abilitiesBySource, foldManaCombinations } from './abilityMenu.ts'
import type { AbilityAction } from './abilityMenu.ts'

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

/** Every multiset of `amount` over `colors`, as the engine lists them. */
const combinations = (colors: readonly string[], amount: number): string[][] =>
  amount === 0
    ? [[]]
    : colors.flatMap((c, i) => combinations(colors.slice(i), amount - 1).map((rest) => [c, ...rest]))

const manaOffer = (index: number, text: string, picks: readonly string[]) =>
  ({
    ...(ability('baxter', index, `${text} (add ${picks.map((c) => `{${c}}`).join('')})`) as object),
    manaColors: picks,
  }) as unknown as AbilityAction

describe('foldManaCombinations', () => {
  const FOUR = '{4}, {T}: Add four mana in any combination of colors.'

  it("makes Baxter Building's 70 combinations one offer that asks the split", () => {
    const colorless = ability('baxter', 0, '{T}: Add {C}.', 'C') as AbilityAction
    const draw = ability('baxter', 2, '{4}, {T}: Draw a card.') as AbilityAction
    const four = combinations(['W', 'U', 'B', 'R', 'G'], 4).map((picks) => manaOffer(1, FOUR, picks))
    expect(four).toHaveLength(70)
    const menu = foldManaCombinations([colorless, ...four, draw])
    expect(menu.map((a) => a.text)).toEqual(['{T}: Add {C}.', `${FOUR} (choose how much of each)`, '{4}, {T}: Draw a card.'])
    expect(menu[1].manaSplit).toEqual({ colors: ['W', 'U', 'B', 'R', 'G'], amount: 4 })
    // Through the map every consumer reads, too.
    expect(abilitiesBySource([colorless, ...four, draw]).get('baxter' as never)).toHaveLength(3)
  })

  it('leaves a short list as rows (Orcish Lumberjack: three of {R} and/or {G})', () => {
    const three = combinations(['R', 'G'], 3).map((picks) => manaOffer(0, 'Add three mana.', picks))
    expect(foldManaCombinations(three)).toEqual(three)
  })

  it("leaves a list that isn't every combination, so no pick is one the engine didn't offer", () => {
    const most = combinations(['W', 'U', 'B', 'R', 'G'], 2)
      .slice(1)
      .map((picks) => manaOffer(0, 'Add two mana.', picks))
    expect(foldManaCombinations(most)).toEqual(most)
  })
})
