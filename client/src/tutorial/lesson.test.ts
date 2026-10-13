import { describe, expect, it } from 'vitest'
import type { TutorialInfo } from 'protocol'
import { isInteractive } from './coach.ts'
import { LESSON_GUARD, lessonKey, lessonTour, lessonTourId, lessonUrl } from './lesson.ts'
import type { LessonControls } from './lesson.ts'
import type { Anchor } from './types.ts'

const INFO: TutorialInfo = {
  lesson: 'basics-proof',
  title: 'The basics',
  chapter: 'welcome',
  chapterTitle: 'Welcome',
  chapterIndex: 0,
  chapterCount: 5,
  step: { id: 'welcome', title: 'Welcome!', body: 'Hello.\n\nOne step at a time.', advance: 'next' },
  goals: [],
  canRetry: true,
  complete: false,
}

const GOAL: TutorialInfo = {
  ...INFO,
  chapter: 'land',
  chapterTitle: 'Play a land',
  chapterIndex: 1,
  step: { id: 'play-land', title: 'Play a land', body: 'Click a Forest.', anchor: 'card:Forest', placement: 'top', advance: 'goal' },
  goals: [{ id: 'land-played', label: 'Play a Forest', done: false }],
}

/** Controls that record what was pressed. */
function recorder() {
  const calls: string[] = []
  const controls: LessonControls = {
    next: (id) => calls.push(`next ${id}`),
    retry: () => calls.push('retry'),
    exit: () => calls.push('exit'),
    again: (lesson) => calls.push(`again ${lesson}`),
  }
  return { calls, controls }
}

const anchors: string[] = []
const anchorFor = (a: string | undefined): Anchor | undefined => {
  if (a === undefined) return undefined
  anchors.push(a)
  return () => null
}

const press = (tour: ReturnType<typeof lessonTour>, label: string) => {
  const b = tour?.steps[0].buttons?.find((x) => x.label === label)
  if (b === undefined) throw new Error(`no ${label} button`)
  b.onClick()
}
const labels = (tour: ReturnType<typeof lessonTour>) => tour?.steps[0].buttons?.map((b) => b.label)

describe("a lesson's card on the overlay", () => {
  it('is a one-step game tour that Escape leaves alone, counted by chapter', () => {
    const { controls } = recorder()
    const tour = lessonTour(INFO, anchorFor, controls)
    expect(tour).toMatchObject({ id: lessonTourId('basics-proof'), keepOnEscape: true, counter: 'The basics · chapter 1 of 5' })
    expect(tour?.persist).toBeUndefined()
    expect(tour?.steps).toHaveLength(1)
    expect(tour?.steps[0]).toMatchObject({ id: 'welcome', page: 'game', title: 'Welcome!', body: 'Hello.\n\nOne step at a time.' })
  })

  it("a Next card blocks the page and sends Next on for the card it's on", () => {
    const { calls, controls } = recorder()
    const tour = lessonTour(INFO, anchorFor, controls)
    const step = tour!.steps[0]
    expect(step.advance).toBe('next')
    expect(step.anchor).toBeUndefined()
    expect(step.reach).toBeUndefined()
    expect(isInteractive(step)).toBe(false)
    // No Retry in the first chapter: nothing has happened to undo.
    expect(labels(tour)).toEqual(['Exit lesson', 'Next'])
    press(tour, 'Next')
    press(tour, 'Exit lesson')
    expect(calls).toEqual(['next welcome', 'exit'])
  })

  it('a goal card has no Next, lists its goals, and is open to the page but its menus', () => {
    const { calls, controls } = recorder()
    const tour = lessonTour(GOAL, anchorFor, controls)
    const step = tour!.steps[0]
    expect(labels(tour)).toEqual(['Exit lesson', 'Retry chapter'])
    expect(step.goals).toEqual([{ id: 'land-played', label: 'Play a Forest', done: false }])
    expect(step).toMatchObject({ reach: 'page', guard: LESSON_GUARD, placement: 'top' })
    expect(isInteractive(step)).toBe(true)
    expect(typeof step.anchor).toBe('function')
    expect(anchors.at(-1)).toBe('card:Forest')
    // The server moves a goal card on, never the overlay.
    expect(typeof step.advance === 'object' && 'when' in step.advance && step.advance.when()).toBe(false)
    press(tour, 'Retry chapter')
    expect(calls).toEqual(['retry'])
  })

  it('offers Retry only while the server says it can', () => {
    const { controls } = recorder()
    expect(labels(lessonTour({ ...GOAL, canRetry: false }, anchorFor, controls))).toEqual(['Exit lesson'])
    const nextLater = { ...GOAL, step: { ...INFO.step!, id: 'well-done' }, goals: [] }
    expect(labels(lessonTour(nextLater, anchorFor, controls))).toEqual(['Exit lesson', 'Retry chapter', 'Next'])
  })

  it('shows nothing between chapters', () => {
    expect(lessonTour({ ...GOAL, step: null, goals: [] }, anchorFor, recorder().controls)).toBeNull()
  })

  it('ends on a card of its own, back to the menu or round again', () => {
    const { calls, controls } = recorder()
    const tour = lessonTour({ ...INFO, step: null, goals: [], canRetry: false, complete: true }, anchorFor, controls)
    expect(tour?.steps[0]).toMatchObject({ id: 'lesson-complete', page: 'game', title: 'You did it!', advance: 'next' })
    expect(tour?.steps[0].anchor).toBeUndefined()
    expect(labels(tour)).toEqual(['Back to menu', 'Play again'])
    expect(tour?.steps[0].buttons?.find((b) => b.primary === true)?.label).toBe('Play again')
    press(tour, 'Play again')
    press(tour, 'Back to menu')
    expect(calls).toEqual(['again basics-proof', 'exit'])
  })

  it('changes only when the card would: a goal ticked, a new card, Retry gone', () => {
    const frameLater = { ...GOAL }
    expect(lessonKey(frameLater)).toBe(lessonKey(GOAL))
    expect(lessonKey({ ...GOAL, goals: [{ ...GOAL.goals[0], done: true }] })).not.toBe(lessonKey(GOAL))
    expect(lessonKey({ ...GOAL, canRetry: false })).not.toBe(lessonKey(GOAL))
    expect(lessonKey(INFO)).not.toBe(lessonKey(GOAL))
    expect(lessonKey(null)).toBe('')
  })

  it('opens from a URL of its own', () => {
    expect(lessonUrl('basics-proof')).toBe('/?tutorial=basics-proof')
    expect(lessonUrl('a b')).toBe('/?tutorial=a%20b')
  })
})
