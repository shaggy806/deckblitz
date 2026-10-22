import { describe, expect, it } from 'vitest'
import type { ObjectId, PlayerView } from 'engine/client'
import { stackCopiesOf, stackRuns } from './stackCopies.ts'

/** A view with only the stack objects `stackRuns` reads. */
function viewOf(objects: Record<string, Record<string, unknown>>, stack: readonly string[]): PlayerView {
  const full = Object.fromEntries(
    Object.entries(objects).map(([id, o]) => [
      id,
      { id, kind: 'ability', cardName: 'Mesmeric Orb', abilityIndex: 0, controller: 'p1', targets: null, xValue: null, ...o },
    ]),
  )
  return { objects: full, zones: { stack } } as unknown as PlayerView
}

describe('stackRuns', () => {
  it('groups consecutive copies of one ability, and nothing else', () => {
    const view = viewOf(
      {
        a: {},
        b: {},
        c: { cardName: 'Scute Swarm' },
        d: {},
        e: { targets: [{ kind: 'player', player: 'p2' }] },
        f: { controller: 'p2' },
        g: { controller: 'p2' },
      },
      ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    )
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as ObjectId[]
    expect(stackRuns(view, ids)).toEqual([['a', 'b'], ['c'], ['d'], ['e'], ['f', 'g']])
  })

  it('keys every untargeted ability on the stack', () => {
    const view = viewOf({ a: {}, b: { kind: 'card' }, c: { xValue: 3 } }, ['a', 'b', 'c'])
    expect([...stackCopiesOf(view).keys()]).toEqual(['a'])
  })
})
