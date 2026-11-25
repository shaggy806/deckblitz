import { describe, expect, it } from 'vitest'
import type { ObjectId, PlayerId, VisibleObject } from 'engine/client'
import { delayedToVisible, delayedWhen } from './delayedTriggers.ts'
import type { DelayedTrigger } from './delayedTriggers.ts'

const alice = 'alice' as PlayerId
const bob = 'bob' as PlayerId
const whose = (p: PlayerId) => (p === alice ? 'your' : 'Bob’s')

describe('delayedWhen', () => {
  it('says which step, whose and how far off', () => {
    expect(delayedWhen({ step: 'end', whose: 'any', which: 'next' }, whose)).toBe('At the beginning of the next end step')
    expect(delayedWhen({ step: 'upkeep', whose: alice, which: 'next' }, whose)).toBe('At the beginning of your next upkeep')
    expect(delayedWhen({ step: 'end', whose: bob, which: 'this-turn' }, whose)).toBe('At the beginning of Bob’s next end step this turn')
    expect(delayedWhen({ step: 'end-combat', whose: 'any', which: 'next' }, whose)).toBe('At the next end of combat')
    expect(delayedWhen(null, whose)).toBeNull()
  })
})

describe('delayedToVisible', () => {
  const bears = { id: 'o7', name: 'Grizzly Bears', cardName: 'Grizzly Bears' } as unknown as VisibleObject
  const objects = { o7: bears } as Record<ObjectId, VisibleObject>
  const delayed = (text: string, at: DelayedTrigger['at']): DelayedTrigger => ({
    controller: alice,
    source: 'Flickerwisp',
    text,
    at,
    objects: ['o7' as ObjectId],
  })

  it('leads with when it triggers and names the cards it acts on', () => {
    const card = delayedToVisible(delayed('Return that card to the battlefield under its owner’s control.', { step: 'end', whose: 'any', which: 'next' }), 0, whose, objects)
    expect(card.name).toBe('Delayed — Flickerwisp')
    expect(card.text).toBe('At the beginning of the next end step:\nReturn that card to the battlefield under its owner’s control.\n(Grizzly Bears)')
    expect(card.id).toBe('delayed-0')
  })

  it("doesn't say when twice where its text already does", () => {
    const card = delayedToVisible(delayed('Return it to your hand at the beginning of the next end step.', { step: 'end', whose: 'any', which: 'next' }), 1, whose, {})
    expect(card.text).toBe('Return it to your hand at the beginning of the next end step.')
  })
})
