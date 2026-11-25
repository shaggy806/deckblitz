import { describe, expect, it } from 'vitest'

import { needsOwnButton } from './castWay.ts'

describe('needsOwnButton', () => {
  it('a cast that sacrifices a permanent, or asks for help paying, has a button of its own', () => {
    expect(needsOwnButton({ kind: 'cast-spell', emergeSacrifice: { object: 'obj-1' } })).toBe(true)
    expect(needsOwnButton({ kind: 'cast-spell', assist: 'bob' })).toBe(true)
  })

  it('a cast that returns or taps a permanent of yours has a button of its own', () => {
    expect(needsOwnButton({ kind: 'cast-spell', sneakReturn: { object: 'obj-1' } })).toBe(true)
    expect(needsOwnButton({ kind: 'cast-spell', webSlingingReturn: { object: 'obj-1' } })).toBe(true)
    expect(needsOwnButton({ kind: 'cast-spell', harmonizeTap: { object: 'obj-1' } })).toBe(true)
  })

  it('a plain cast, or a land, is a click on the card', () => {
    expect(needsOwnButton({ kind: 'cast-spell' })).toBe(false)
    expect(needsOwnButton({ kind: 'play-land' })).toBe(false)
  })
})
