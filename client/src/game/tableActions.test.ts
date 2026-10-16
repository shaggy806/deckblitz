import { describe, expect, it } from 'vitest'
import type { LegalAction } from 'engine/client'
import { mulliganLive, tableActions } from './tableActions.ts'

const mulligan = (count: number) => ({ kind: 'mulligan', player: 'p1', count }) as unknown as LegalAction
const pass = { kind: 'pass-priority' } as unknown as LegalAction

describe('tableActions', () => {
  it('offers what the shown board offers once nothing is playing', () => {
    expect(tableActions([pass], [pass], false, false)).toEqual([pass])
  })

  it('offers nothing while a frame plays out, or while a bot plays the seat', () => {
    expect(tableActions([pass], [pass], true, false)).toEqual([])
    expect(tableActions([mulligan(0)], [mulligan(0)], false, true)).toEqual([])
  })

  it('holds the shown mulligan up through a frame, while the newest still asks it', () => {
    // An opponent's shuffle, or your own hand going back: the popup stays, as
    // the shown board has it (not yet the newest frame's count).
    expect(tableActions([mulligan(0), pass], [mulligan(1)], true, false)).toEqual([mulligan(0)])
  })

  it("lets an answered mulligan go, though the frame showing it hasn't finished", () => {
    expect(tableActions([mulligan(0)], [pass], true, false)).toEqual([])
    expect(tableActions([mulligan(0)], [], true, false)).toEqual([])
  })
})

describe('mulliganLive', () => {
  it("keeps the mulligan's buttons live through another player's shuffle", () => {
    // A bot's mulligan: the viewer's own decision is the same in both frames.
    expect(mulliganLive([mulligan(0)], [mulligan(0)], true)).toBe(true)
    expect(mulliganLive([mulligan(1), pass], [mulligan(1)], true)).toBe(true)
  })

  it("locks them while the viewer's own hand is changing, or once answered", () => {
    // Your own mulligan going back and the new hand dealt: the counts differ.
    expect(mulliganLive([mulligan(0)], [mulligan(1)], true)).toBe(false)
    // Kept: the newest frame no longer asks.
    expect(mulliganLive([mulligan(0)], [pass], true)).toBe(false)
  })

  it('has nothing to say when no frame is playing, or no mulligan is asked', () => {
    expect(mulliganLive([mulligan(0)], [mulligan(0)], false)).toBe(false)
    expect(mulliganLive([pass], [pass], true)).toBe(false)
  })
})
