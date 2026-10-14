import { describe, expect, it } from 'vitest'
import {
  advance,
  autoAdvanced,
  back,
  backFrom,
  continueFrom,
  getCoach,
  isInteractive,
  moveTo,
  resumeAt,
  setCoachPage,
  startIndex,
  startTour,
  stopTour,
} from './coach.ts'
import { SITE_TOUR } from './tours/site.ts'
import type { Step, Tour } from './types.ts'

const step = (id: string, page: Step['page'], advance: Step['advance'] = 'next'): Step => ({
  id,
  page,
  title: id,
  body: id,
  advance,
})

const TOUR: Tour = {
  id: 't',
  title: 'T',
  pages: { landing: { path: '/' }, library: { path: '/library' }, lobby: { via: 'go' } },
  steps: [
    step('a', 'landing'),
    step('b', 'landing'),
    step('c', 'library'),
    step('go', 'landing', { click: '#create' }),
    step('d', 'lobby'),
    step('e', 'lobby'),
  ],
}

describe('autoAdvanced', () => {
  it('waits on the player for next and click', () => {
    expect(autoAdvanced('next', () => true)).toBe(false)
    expect(autoAdvanced({ click: '#x' }, () => true)).toBe(false)
  })

  it('moves on when what it waits for appears', () => {
    expect(autoAdvanced({ visible: '#lobby' }, (s) => s === '#lobby')).toBe(true)
    expect(autoAdvanced({ visible: '#lobby' }, () => false)).toBe(false)
  })

  it('polls a predicate, and takes one that throws as not yet', () => {
    let met = false
    const adv = { when: () => met }
    expect(autoAdvanced(adv, () => false)).toBe(false)
    met = true
    expect(autoAdvanced(adv, () => false)).toBe(true)
    expect(
      autoAdvanced(
        {
          when: () => {
            throw new Error('no view yet')
          },
        },
        () => false,
      ),
    ).toBe(false)
  })
})

describe('isInteractive', () => {
  it('lets clicks through for a step that waits on the player, not for a Next step', () => {
    expect(isInteractive(step('x', 'landing'))).toBe(false)
    expect(isInteractive(step('x', 'landing', { click: '#y' }))).toBe(true)
    expect(isInteractive(step('x', 'landing', { when: () => false }))).toBe(true)
    expect(isInteractive({ ...step('x', 'landing'), interactive: true })).toBe(true)
  })
})

describe('moveTo', () => {
  it('stays on the page for a step on the same page', () => {
    expect(moveTo(TOUR, 1, 'landing', 'next')).toEqual({ kind: 'show', index: 1 })
  })

  it('loads the next page when Next crosses to it', () => {
    expect(moveTo(TOUR, 2, 'landing', 'next')).toEqual({ kind: 'navigate', index: 2, path: '/library' })
  })

  it("doesn't load a page a click took the player to already", () => {
    expect(moveTo(TOUR, 2, 'landing', 'click')).toEqual({ kind: 'show', index: 2 })
  })

  it('waits for a page with no path (a lobby) to appear', () => {
    expect(moveTo(TOUR, 4, 'landing', 'click')).toEqual({ kind: 'show', index: 4 })
    expect(moveTo(TOUR, 4, 'landing', 'next')).toEqual({ kind: 'show', index: 4 })
  })

  it('finishes past the last step', () => {
    expect(moveTo(TOUR, 6, 'lobby', 'next')).toEqual({ kind: 'finish' })
  })
})

describe('backFrom', () => {
  it('goes back within a page only', () => {
    expect(backFrom(TOUR, 0, 'landing')).toBeNull()
    expect(backFrom(TOUR, 1, 'landing')).toBe(0)
    expect(backFrom(TOUR, 2, 'library')).toBeNull()
    expect(backFrom(TOUR, 5, 'lobby')).toBe(4)
  })
})

describe('resumeAt and continueFrom', () => {
  it('carries on at once on the step\'s own page', () => {
    expect(resumeAt(TOUR, 'c', 'library')).toEqual({ kind: 'show', index: 2 })
  })

  it('asks first on another page, and says nothing in a game', () => {
    expect(resumeAt(TOUR, 'c', 'landing')).toEqual({ kind: 'offer', index: 2 })
    expect(resumeAt(TOUR, 'c', 'game')).toEqual({ kind: 'quiet' })
  })

  it('drops a step the tour no longer has', () => {
    expect(resumeAt(TOUR, 'gone', 'landing')).toEqual({ kind: 'gone' })
  })

  it('continues by loading the step\'s page', () => {
    expect(continueFrom(TOUR, 2, 'landing')).toEqual({ kind: 'navigate', index: 2, path: '/library' })
  })

  it('reaches a lobby step through its via step: here, or on its own page', () => {
    expect(continueFrom(TOUR, 4, 'landing')).toEqual({ kind: 'show', index: 3 })
    expect(continueFrom(TOUR, 5, 'library')).toEqual({ kind: 'navigate', index: 3, path: '/' })
  })
})

describe('startIndex', () => {
  it("starts at this page's first step, or the beginning", () => {
    expect(startIndex(TOUR, 'lobby')).toBe(4)
    expect(startIndex(TOUR, 'landing')).toBe(0)
    expect(startIndex(TOUR, 'deck-builder')).toBe(0)
  })
})

describe('the coach store', () => {
  it('starts, advances once per step, goes back and stops', () => {
    setCoachPage('landing')
    startTour(TOUR)
    expect(getCoach()).toMatchObject({ index: 0, offer: false })
    advance(0, 'next')
    // A second advance for the same step (a click and a frame together) is
    // ignored.
    advance(0, 'auto')
    expect(getCoach().index).toBe(1)
    back()
    expect(getCoach().index).toBe(0)
    stopTour()
    expect(getCoach().tour).toBeNull()
  })

  it('finishes past the last step', () => {
    setCoachPage('lobby')
    startTour(TOUR)
    expect(getCoach().index).toBe(4)
    advance(4, 'next')
    advance(5, 'next')
    expect(getCoach().tour).toBeNull()
  })
})

describe('the site tour', () => {
  const ids = SITE_TOUR.steps.map((s) => s.id)

  it('has unique step ids, each on a page the tour knows how to reach', () => {
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of SITE_TOUR.steps) {
      expect(s.page, s.id).toBeDefined()
      expect(SITE_TOUR.pages?.[s.page!], s.id).toBeDefined()
    }
  })

  it('points only through data-tour anchors', () => {
    for (const s of SITE_TOUR.steps) {
      if (typeof s.anchor === 'string') expect(s.anchor, s.id).toMatch(/^\[data-tour="[a-z-]+"\]$/)
    }
  })

  it('keeps every card to three sentences', () => {
    for (const s of SITE_TOUR.steps) {
      const sentences = s.body.split(/[.!?](\s|$)/).filter((x) => x.trim().length > 1)
      expect(sentences.length, s.id).toBeLessThanOrEqual(3)
    }
  })

  it('stays on the front page and ends on the offer of the board tour', () => {
    expect(new Set(SITE_TOUR.steps.map((s) => s.page))).toEqual(new Set(['landing']))
    const last = SITE_TOUR.steps.at(-1)!
    expect(last.id).toBe('to-the-board')
    expect(last.buttons?.map((b) => b.label)).toEqual(['Not now', 'Tour the board'])
  })
})
