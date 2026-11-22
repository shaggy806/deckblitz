import { describe, expect, it } from 'vitest'
import tap from '../../public/mana/T.svg?raw'
import untap from '../../public/mana/Q.svg?raw'

// A bug report, 2026-11-21: every {T} drew the untap symbol. The two files
// had each other's artwork. Tap is the grey disc with a black arrow; untap
// the black disc with a white one.
describe('tap and untap artwork', () => {
  const disc = (svg: string): string => /<circle fill="(#[0-9A-F]+)"/i.exec(svg)?.[1] ?? ''

  it('{T} is the grey disc, {Q} the black one', () => {
    expect(disc(tap)).toBe('#CAC5C0')
    expect(disc(untap)).toBe('#0D0F0F')
  })
})
