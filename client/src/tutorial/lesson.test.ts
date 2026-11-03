import { describe, expect, it } from 'vitest'
import type { TutorialInfo } from 'protocol'
import { isInteractive } from './coach.ts'
import { cardsSeen, LESSON_GUARD, lessonKey, lessonTour, lessonTourId, lessonUrl, reviewTour } from './lesson.ts'
import type { LessonControls } from './lesson.ts'
import type { Anchor } from './types.ts'

const INFO: TutorialInfo = {
  lesson: 'learn-commander',
  title: 'The basics',
  chapter: 'welcome',
  chapterTitle: 'Welcome',
  chapterIndex: 0,
  chapterCount: 5,
  step: { id: 'welcome', title: 'Welcome!', body: 'Hello.\n\nOne step at a time.', advance: 'next' },
  goals: [],
  canRetry: true,
  allows: { passTurn: false, autoPass: false, declareAtLeast: 0, attackAt: {}, leaveCommander: false },
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
    realGame: () => calls.push('real game'),
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
    expect(tour).toMatchObject({ id: lessonTourId('learn-commander'), keepOnEscape: true, counter: 'The basics · chapter 1 of 5' })
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

  it('ends each lesson on a card saying where to go next', () => {
    const { calls, controls } = recorder()
    const done = { ...INFO, step: null, goals: [], canRetry: false, complete: true }
    const primary = (tour: ReturnType<typeof lessonTour>) => tour?.steps[0].buttons?.find((b) => b.primary === true)?.label

    // The first game leads on to the second.
    const first = lessonTour(done, anchorFor, controls)
    expect(first?.steps[0]).toMatchObject({ id: 'lesson-complete', page: 'game', title: 'You did it!', advance: 'next' })
    expect(first?.steps[0].anchor).toBeUndefined()
    expect(labels(first)).toEqual(['Back to menu', 'Play a real game', "Commander's rules"])
    expect(primary(first)).toBe("Commander's rules")
    press(first, "Commander's rules")
    press(first, 'Play a real game')
    press(first, 'Back to menu')
    expect(calls).toEqual(['again commander-rules', 'real game', 'exit'])

    // The second leads on to a real game.
    const second = lessonTour({ ...done, lesson: 'commander-rules' }, anchorFor, controls)
    expect(second?.steps[0].title).toBe("That's Commander")
    expect(labels(second)).toEqual(['Back to menu', 'Play again', 'Play a real game'])
    expect(primary(second)).toBe('Play a real game')

    // The board tour isn't a game, and doesn't say it was.
    const tour = lessonTour({ ...done, lesson: 'board-tour' }, anchorFor, controls)
    expect(tour?.steps[0].title).toBe("That's the tour")
    expect(tour?.steps[0].body).not.toMatch(/whole game/)
    expect(labels(tour)).toEqual(['Back to menu', 'Play again'])
  })

  it('offers Back when given a way back, and shows an earlier card in words alone', () => {
    const { controls } = recorder()
    const backs: string[] = []
    expect(labels(lessonTour(GOAL, anchorFor, controls))).not.toContain('Back')
    const tour = lessonTour(GOAL, anchorFor, controls, () => backs.push('back'))
    expect(labels(tour)).toContain('Back')
    press(tour, 'Back')
    expect(backs).toEqual(['back'])

    const card = GOAL.step!
    const review = reviewTour(GOAL, card, () => backs.push('resume'), () => backs.push('further'))
    expect(review.steps[0]).toMatchObject({ id: 'review:play-land', title: card.title, body: card.body, advance: 'next' })
    expect(review.steps[0].anchor).toBeUndefined()
    expect(labels(review)).toEqual(['Back', 'Return to the lesson'])
    press(review, 'Return to the lesson')
    press(review, 'Back')
    expect(backs).toEqual(['back', 'resume', 'further'])
    expect(labels(reviewTour(GOAL, card, () => {}))).toEqual(['Return to the lesson'])
  })

  it('remembers the cards seen, and forgets those after one a retry goes back to', () => {
    const a = INFO.step!
    const b = GOAL.step!
    const c = { ...b, id: 'c' }
    expect(cardsSeen([], a)).toEqual([a])
    expect(cardsSeen([a, b], c)).toEqual([a, b, c])
    expect(cardsSeen([a, b, c], b)).toEqual([a, b])
    expect(cardsSeen([a, b], b)).toEqual([a, b])
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
    expect(lessonUrl('learn-commander')).toBe('/?tutorial=learn-commander')
    expect(lessonUrl('a b')).toBe('/?tutorial=a%20b')
  })
})
