import { describe, expect, it } from 'vitest'

import { counterSummary } from './counterSummary.ts'

describe('counterSummary', () => {
  it('separates each kind of counter with a comma', () => {
    expect(
      counterSummary(
        [
          ['+1/+1', 2],
          ['oil', 1],
        ],
        0,
      ),
    ).toBe('2× +1/+1, 1× oil')
  })

  it('ends with the regeneration shields, singular or plural', () => {
    expect(counterSummary([['+1/+1', 1]], 1)).toBe('1× +1/+1, 1 regeneration shield')
    expect(counterSummary([], 2)).toBe('2 regeneration shields')
  })

  it('one kind alone has no comma', () => {
    expect(counterSummary([['charge', 3]], 0)).toBe('3× charge')
  })
})
