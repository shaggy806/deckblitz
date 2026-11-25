import { describe, expect, it } from 'vitest'
import type { PlayerId } from 'engine/client'
import { lastingEndsLabel, lastingToVisible } from './lastingEffects.ts'

const alice = 'alice' as PlayerId
const bob = 'bob' as PlayerId
const whose = (p: PlayerId) => (p === alice ? 'your' : 'Bob’s')

describe('lastingEndsLabel', () => {
  it('says when each kind of lasting effect ends', () => {
    expect(lastingEndsLabel('end-of-turn', whose)).toBe('Until end of turn')
    expect(lastingEndsLabel('end-of-combat', whose)).toBe('Until end of combat')
    expect(lastingEndsLabel({ untilTurnOf: alice }, whose)).toBe('Until your next turn')
    expect(lastingEndsLabel({ untilEndOfTurnOf: bob }, whose)).toBe('Until the end of Bob’s next turn')
    expect(lastingEndsLabel('permanent', whose)).toBe('For the rest of the game')
    expect(lastingEndsLabel('later', whose)).toBeNull()
  })
})

describe('lastingToVisible', () => {
  it('leads with when it ends, unless its words say, and names its source', () => {
    const card = lastingToVisible(
      { player: alice, source: 'Reinforced Bulwark', text: '{T}: Prevent the next 1 damage that would be dealt to you this turn.', ends: 'end-of-turn' },
      0,
      whose,
    )
    expect(card.name).toBe('Effect — Reinforced Bulwark')
    // "this turn" already says it ends with the turn.
    expect(card.text).toBe('{T}: Prevent the next 1 damage that would be dealt to you this turn.')
    const until = lastingToVisible({ player: alice, source: 'Example', text: 'You have hexproof.', ends: 'end-of-turn' }, 2, whose)
    expect(until.text).toBe('Until end of turn:\nYou have hexproof.')
  })

  it("doesn't repeat an ending its words already say, and has a plain title with no source", () => {
    const card = lastingToVisible(
      { player: alice, source: null, text: 'Until your next turn, your life total can’t change.', ends: { untilTurnOf: alice } },
      1,
      whose,
    )
    expect(card.name).toBe('Effect')
    expect(card.text).toBe('Until your next turn, your life total can’t change.')
  })
})
