import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { TutorialCoachStep, TutorialInfo } from 'protocol'
import { getCoach, startTour, stopTour } from './coach.ts'
import { finishLesson } from './progress.ts'
import type { Anchor, Step, StepButton, Tour } from './types.ts'

/**
 * A tutorial room's lesson on the coach overlay. The server runs the lesson
 * (`server/src/tutorials/`) and every frame says where it stands
 * (`TutorialInfo`); this turns that into a one-step tour for `CoachLayer` —
 * the card the frame on screen carries, or the lesson's last card once it's
 * complete — and keeps the overlay showing it as frames are shown.
 *
 * The conversion (`lessonTour`) is pure and unit-tested; `useLessonCoach` is
 * the effect that applies it.
 */

/** The lesson the "?" menu's *Learn Commander* opens
 * (`server/src/tutorials/learn-commander.ts`). */
export const LEARN_COMMANDER_LESSON = 'learn-commander'

/** The board tour: the site tour's second half, on a practice table
 * (`server/src/tutorials/board-tour.ts`). */
export const BOARD_TOUR_LESSON = 'board-tour'

/** The URL parameter that opens a lesson as the page loads (`lessonUrl`). */
export const LESSON_PARAM = 'tutorial'

/** The URL that opens lesson `lesson` in a tutorial room of its own as the
 * page loads — a lesson's "Play again", and the way in from a room's lobby,
 * which a page load leaves as a game's "Leave the room" does. */
export const lessonUrl = (lesson: string): string => `/?${LESSON_PARAM}=${encodeURIComponent(lesson)}`

/** The URL parameter that starts a first real game as the page loads, on a
 * starter deck against three bots: the way on from Learn Commander, for someone
 * with no decklist to blitz. */
export const FIRST_GAME_PARAM = 'first-game'
export const FIRST_GAME_URL = `/?${FIRST_GAME_PARAM}=1`

/** What a lesson's card can do, wired by the game screen. */
export interface LessonControls {
  /** Next on a card that only explains (`tutorial-next`). */
  readonly next: (stepId: string) => void
  /** Back to the start of the chapter (`tutorial-retry`). */
  readonly retry: () => void
  /** Out of the room, back to the landing page. */
  readonly exit: () => void
  /** Lesson `lesson` again from the beginning, in a room of its own. */
  readonly again: (lesson: string) => void
  /** On to a real game, on a starter deck against bots. */
  readonly realGame: () => void
}

/** The tour id a lesson's cards go under: one per lesson, so a card that
 * stays up from one frame to the next is the same card to the overlay. */
export const lessonTourId = (lesson: string): string => `lesson:${lesson}`

/** What a lesson card's goal leaves blocked: the top strip's menus (the Game
 * menu could concede or leave, History would cover the board). The board,
 * the hand, the Pass buttons and the decision banner all stay clickable. */
export const LESSON_GUARD = '.top-strip .ts-menu'

/**
 * The tour for a lesson as `info` has it, or `null` when no card is up — a
 * lesson between chapters, while the game plays on to what opens the next.
 *
 * - A **Next card** (`advance: 'next'`) blocks the page as any explaining
 *   step does; its Next sends `tutorial-next` and the server's next frame
 *   brings the card after it.
 * - A **goal card** (`advance: 'goal'`) has no Next: its goals are a
 *   checklist, ticked as the server marks them done, and it's open to the
 *   whole page but the top strip's menus (`reach: 'page'`) — playing a land
 *   is one click in the spotlight, but a block is a blocker, an attacker and
 *   the banner's Confirm, two of them outside any one card's spotlight.
 * - Once the lesson is **complete**, a last card to say well done, with the
 *   way back to the menu and the way to play it again.
 *
 * Every card offers Exit, Retry chapter while the server says there's something
 * to undo (not in the first chapter, which is only reading), and Back with
 * `back`, a look at the card before it.
 */
export function lessonTour(
  info: TutorialInfo,
  anchorFor: (anchor: string | undefined) => Anchor | undefined,
  controls: LessonControls,
  back?: () => void,
): Tour | null {
  const base = {
    id: lessonTourId(info.lesson),
    title: info.title,
    keepOnEscape: true,
  } as const
  if (info.complete) {
    const step: Step = {
      id: 'lesson-complete',
      page: 'game',
      title: 'You did it!',
      body:
        "You've just played a whole game: those are the moves every game is built from. Real decks have far more kinds of card, so read each one as it comes.\n\n" +
        'Ready for a real game? You get a starter deck against three bots. It opens by asking whether to keep your seven cards or draw a new hand.',
      advance: 'next',
      buttons: [
        { label: 'Back to menu', onClick: controls.exit, link: true },
        { label: 'Play again', onClick: () => controls.again(info.lesson) },
        { label: 'Play a real game', onClick: controls.realGame, primary: true },
      ],
    }
    return { ...base, counter: `${info.title} · complete`, steps: [step] }
  }
  const card = info.step
  if (card === null) return null
  const goal = card.advance === 'goal'
  const buttons: StepButton[] = [{ label: 'Exit lesson', onClick: controls.exit, link: true }]
  if (info.canRetry && info.chapterIndex > 0) buttons.push({ label: 'Retry chapter', onClick: controls.retry, link: true })
  if (back !== undefined) buttons.push({ label: 'Back', onClick: back })
  if (!goal) buttons.push({ label: 'Next', onClick: () => controls.next(card.id), primary: true })
  const anchor = anchorFor(card.anchor)
  const step: Step = {
    id: card.id,
    page: 'game',
    title: card.title,
    body: card.body,
    ...(anchor !== undefined ? { anchor } : {}),
    ...(card.placement !== undefined ? { placement: card.placement } : {}),
    // A goal card never moves itself on: the server's next frame does.
    advance: goal ? { when: () => false } : 'next',
    ...(goal ? { reach: 'page' as const, guard: LESSON_GUARD, goals: info.goals } : {}),
    buttons,
  }
  return {
    ...base,
    counter: `${info.title} · chapter ${info.chapterIndex + 1} of ${info.chapterCount}`,
    steps: [step],
  }
}

/**
 * A card already gone, for reading again: words only, in the middle of the
 * page, since what it pointed at may have moved on. Nothing in the game changes
 * while it's up; `back` goes further back, `resume` returns to the card up now.
 */
export function reviewTour(
  info: TutorialInfo,
  card: TutorialCoachStep,
  resume: () => void,
  back?: () => void,
): Tour {
  const buttons: StepButton[] = []
  if (back !== undefined) buttons.push({ label: 'Back', onClick: back })
  buttons.push({ label: 'Return to the lesson', onClick: resume, primary: true })
  const step: Step = { id: `review:${card.id}`, page: 'game', title: card.title, body: card.body, advance: 'next', buttons }
  return { id: lessonTourId(info.lesson), title: info.title, keepOnEscape: true, counter: `${info.title} · looking back`, steps: [step] }
}

/** The cards seen so far with `card` the latest: a card seen before (a retry
 * going back to it) drops those after it. */
export function cardsSeen(seen: readonly TutorialCoachStep[], card: TutorialCoachStep): readonly TutorialCoachStep[] {
  const at = seen.findIndex((c) => c.id === card.id)
  return at === -1 ? [...seen, card] : seen.slice(0, at + 1)
}

/** What about `info` changes the card: a frame that only moved the board
 * along leaves the card as it was. */
export function lessonKey(info: TutorialInfo | null): string {
  if (info === null) return ''
  return JSON.stringify([
    info.lesson,
    info.chapterIndex,
    info.step,
    info.goals,
    info.canRetry,
    info.complete,
  ])
}

/**
 * Keeps the coach overlay on the lesson's card as `info` — the frame on
 * screen's, so a card never comes up ahead of the board it describes —
 * changes: the card it carries, nothing between chapters, the last card once
 * the lesson is complete (and the lesson recorded as done). Leaving the game
 * screen takes the card with it.
 */
export function useLessonCoach(
  info: TutorialInfo | null,
  anchorFor: (anchor: string | undefined) => Anchor | undefined,
  controls: LessonControls,
): void {
  // The card is rebuilt only when it would change (`key`): `info` itself is
  // a new object on every frame, read here through a ref.
  const key = lessonKey(info)
  const latest = useRef(info)
  useLayoutEffect(() => {
    latest.current = info
  }, [info])
  const lesson = info?.lesson ?? null
  const complete = info?.complete === true
  useEffect(() => {
    if (complete && lesson !== null) finishLesson(lesson)
  }, [complete, lesson])
  // The cards seen, for Back: read back through `reviewing`, the index of the
  // one on show instead of the card that's up. Kept here, as Back only looks.
  const seen = useRef<readonly TutorialCoachStep[]>([])
  const [reviewing, setReviewing] = useState<number | null>(null)
  useEffect(() => {
    const now = latest.current
    if (now?.step != null) seen.current = cardsSeen(seen.current, now.step)
    const cards = seen.current
    const earlier = (i: number) => (i > 0 ? () => setReviewing(i - 1) : undefined)
    const review = now === null || now.complete || reviewing === null ? undefined : cards[reviewing]
    const tour =
      now === null
        ? null
        : review !== undefined && reviewing !== null
          ? reviewTour(now, review, () => setReviewing(null), earlier(reviewing))
          : lessonTour(now, anchorFor, controls, now.step === null ? undefined : earlier(cards.length - 1))
    if (tour !== null) startTour(tour, 0)
    else if (getCoach().tour?.id.startsWith('lesson:') === true) stopTour()
  }, [key, reviewing, anchorFor, controls])
  useEffect(
    () => () => {
      if (getCoach().tour?.id.startsWith('lesson:') === true) stopTour()
    },
    [],
  )
}
