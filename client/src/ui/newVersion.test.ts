import { describe, expect, it } from 'vitest'
import { newerBuild } from './newVersion.ts'

describe('newerBuild', () => {
  it('is the build version.json names when it is not this page\'s', () => {
    expect(newerBuild('abc', { build: 'def', commit: null })).toBe('def')
  })

  it('is nothing for this page\'s own build', () => {
    expect(newerBuild('abc', { build: 'abc' })).toBeNull()
  })

  it('is nothing for anything that is not a build id', () => {
    // The site's fallback page parsed as nothing, a proxy's error, an empty id.
    for (const payload of [null, undefined, 'abc', 7, [], {}, { build: 7 }, { build: '' }, { commit: 'def' }]) {
      expect(newerBuild('abc', payload)).toBeNull()
    }
  })
})
