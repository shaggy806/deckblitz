import { describe, expect, it } from 'vitest'
import type { DeckFormatReport, ImportedCardReport } from 'protocol'
import { looksLikeDecklist, resolveImport } from './importDeck.ts'

const card = (name: string, extra: Partial<ImportedCardReport> = {}): ImportedCardReport => ({
  name,
  count: 1,
  implemented: true,
  found: true,
  manaCost: null,
  typeLine: '',
  suggestedReplacement: null,
  replacements: [],
  printingId: null,
  ...extra,
})

const format = (commanders: readonly string[]): DeckFormatReport => ({
  legal: true,
  violations: [],
  banned: [],
  identity: 'G',
  commanders,
})

describe('looksLikeDecklist', () => {
  it('wants at least one "N Card Name" line', () => {
    expect(looksLikeDecklist('Commander\n1 Ghalta, Primal Hunger\n\n30 Forest')).toBe(true)
    expect(looksLikeDecklist('https://example.com/some/link')).toBe(false)
    expect(looksLikeDecklist('')).toBe(false)
  })
})

describe('resolveImport', () => {
  it('keeps implemented cards, swaps in stand-ins and drops what has none', () => {
    const resolved = resolveImport(
      [
        card('Ghalta, Primal Hunger'),
        card('Forest', { count: 3, printingId: 'abc' }),
        card('Tooth and Nail', { implemented: false, suggestedReplacement: 'Natural Order' }),
        card('Nothing Like It', { implemented: false }),
      ],
      format(['Ghalta, Primal Hunger']),
    )
    expect(resolved.name).toBe('Imported: Ghalta, Primal Hunger')
    expect(resolved.commanders).toEqual(['Ghalta, Primal Hunger'])
    expect(resolved.cards).toEqual(['Forest', 'Forest', 'Forest', 'Natural Order'])
    expect(resolved.printings).toEqual({ Forest: 'abc' })
    expect(resolved.report.substituted.map((s) => [s.from, s.to])).toEqual([['Tooth and Nail', 'Natural Order']])
    expect(resolved.report.dropped).toEqual(['Nothing Like It'])
    expect(resolved.report.asIs).toBe(4)
  })

  it('counts copies, so the report adds up to the list', () => {
    const { report } = resolveImport(
      [
        card('Forest', { count: 30 }),
        card('Sol Ring'),
        card('Rat Colony', { count: 4, implemented: false, suggestedReplacement: 'Grizzly Bears' }),
        card('Nothing Like It', { count: 2, implemented: false }),
      ],
      null,
    )
    expect(report.total).toBe(37)
    expect(report.asIs).toBe(31)
    expect(report.substitutedCards).toBe(4)
    expect(report.droppedCards).toBe(2)
    expect(report.substituted).toHaveLength(1)
    expect(report.dropped).toEqual(['Nothing Like It'])
  })

  it('stands a commander in by its replacement, and has none when the list named none', () => {
    const swapped = resolveImport(
      [card('Unimplemented Legend', { implemented: false, suggestedReplacement: 'Ghalta, Primal Hunger' })],
      format(['Unimplemented Legend']),
    )
    expect(swapped.commanders).toEqual(['Ghalta, Primal Hunger'])
    expect(swapped.cards).toEqual([])

    expect(resolveImport([card('Forest')], null).commanders).toEqual([])
  })
})

describe('resolveImport — a sideboard', () => {
  it('resolves the sideboard rows apart from the deck, stand-ins and drops alike', () => {
    const resolved = resolveImport(
      [card('Forest', { count: 20 })],
      null,
      [
        card('Burning Wish', { count: 2 }),
        card('Unknown Wish', { implemented: false, suggestedReplacement: 'Demonic Tutor' }),
        card('Nothing Like It', { implemented: false }),
      ],
    )
    expect(resolved.cards).toHaveLength(20)
    expect(resolved.sideboard).toEqual(['Burning Wish', 'Burning Wish', 'Demonic Tutor'])
    expect(resolved.report.total).toBe(24)
    expect(resolved.report.substituted.map((s) => s.to)).toEqual(['Demonic Tutor'])
    expect(resolved.report.dropped).toEqual(['Nothing Like It'])
  })
})

describe('resolveImport — an Attraction deck', () => {
  it('keeps each Attraction with the printing it named, out of the 99, and drops what the pool lacks', () => {
    const resolved = resolveImport([card('Forest', { count: 3 })], null, [], [
      { name: 'Balloon Stand', count: 1, implemented: true, collector: '200b' },
      { name: 'Bumper Cars', count: 2, implemented: true, collector: null },
      { name: 'Costume Shop', count: 1, implemented: false, collector: null },
    ])
    expect(resolved.cards).toEqual(['Forest', 'Forest', 'Forest'])
    expect(resolved.attractions).toEqual([{ name: 'Balloon Stand', collector: '200b' }, 'Bumper Cars', 'Bumper Cars'])
    expect(resolved.report.total).toBe(7)
    expect(resolved.report.dropped).toEqual(['Costume Shop'])
    expect(resolved.report.droppedCards).toBe(1)
  })
})
