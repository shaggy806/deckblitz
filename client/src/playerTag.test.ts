import { describe, expect, it } from 'vitest'
import { PLAYER_TAG, tagOf } from './playerTag.ts'

describe("a browser's tag", () => {
  it('is ten hex digits, the same for the same number and different for another', async () => {
    const one = await tagOf('00112233445566778899aabbccddeeff')
    expect(one).toMatch(PLAYER_TAG)
    expect(await tagOf('00112233445566778899aabbccddeeff')).toBe(one)
    expect(await tagOf('00112233445566778899aabbccddeefe')).not.toBe(one)
  })

  it("is worked out one way: it isn't the number, or any part of it", async () => {
    const number = '00112233445566778899aabbccddeeff'
    const tag = await tagOf(number)
    expect(number).not.toContain(tag)
    // The first ten hex digits of the SHA-256 of the number's text.
    expect(tag).toBe('5947d7c33d')
  })
})
