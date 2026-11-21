import { useEffect, useRef, useState } from 'react'
import { apply, coachPage, continueFrom, startTour, useCoach } from './coach.ts'
import { markIntroSeen, setTourAt, useTutorialProgress } from './progress.ts'
import { SITE_TOUR } from './tours/site.ts'
import { BOARD_TOUR_LESSON, COMMANDER_RULES_LESSON, LEARN_COMMANDER_LESSON, lessonUrl } from './lesson.ts'
import './coach.css'

/**
 * The corner toolbar's "?" button, beside the Settings cog: a small menu of
 * the tutorials, each with its progress — *Tour the site* (not started, the
 * step it's at, or done and ready to replay), *Tour the board* (a practice
 * table, {@link BOARD_TOUR_LESSON}) and *Learn Commander* (a guided game);
 * each lesson done and ready to play again once finished.
 *
 * With `intro` (the landing page), a first visit — nothing in the progress
 * store yet — also gets a small callout rising above the button, offering
 * the tour and the lesson. It blocks nothing and covers only the corner;
 * dismissed or followed, it's recorded and never shown again.
 *
 * A lesson opens in a tutorial room of its own through `onLesson`: the
 * landing page creates it over its own connection; anywhere else (the
 * default) a page load to {@link lessonUrl} does, which leaves a lobby's
 * room the way a game's "Leave the room" does.
 */
export function HelpMenu({
  intro = false,
  onLesson = (lesson) => window.location.assign(lessonUrl(lesson)),
  starting,
}: {
  readonly intro?: boolean
  readonly onLesson?: (lesson: string) => void
  /** Whether the lesson `onLesson` asked for is still on its way (the
   * landing's `tutorialStarting`). Given, the menu stays open on that lesson,
   * saying "Starting…", until its room's first frame takes the page — as the
   * lobby's Start game does — rather than closing on a page that then sits
   * there looking as though the click did nothing (the user, 2026-11-14). */
  readonly starting?: boolean
}) {
  const progress = useTutorialProgress()
  const coach = useCoach()
  const [open, setOpen] = useState(false)
  const [startingLesson, setStartingLesson] = useState<string | null>(null)
  const pendingLesson = starting === true ? startingLesson : null
  const boxRef = useRef<HTMLDivElement>(null)

  // Closes on a click anywhere else, or Escape — as the Settings panel does.
  // Not while a lesson is starting: the menu is what says so.
  useEffect(() => {
    if (!open || pendingLesson !== null) return
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, pendingLesson])

  const tourRunning = coach.tour !== null
  const showCallout = intro && !progress.seenIntro && !tourRunning && !open

  const at = progress.tour.at === null ? -1 : SITE_TOUR.steps.findIndex((s) => s.id === progress.tour.at)
  const tourNote =
    at !== -1
      ? `Step ${at + 1} of ${SITE_TOUR.steps.length}`
      : progress.tour.done
        ? 'Done ✓'
        : `${SITE_TOUR.steps.length} stops`
  const lessonDone = progress.lessons[LEARN_COMMANDER_LESSON] === 'done'
  const boardDone = progress.lessons[BOARD_TOUR_LESSON] === 'done'
  const rulesDone = progress.lessons[COMMANDER_RULES_LESSON] === 'done'

  const openLesson = (lesson: string) => {
    if (pendingLesson !== null) return
    // The callout's "Learn to play" opens the menu, to show it starting.
    setOpen(starting !== undefined)
    setStartingLesson(lesson)
    markIntroSeen()
    onLesson(lesson)
  }
  /** A lesson's menu item: "Starting…" with the lobby's spinner while it's
   * on its way, and none of the menu clickable meanwhile. */
  const lessonItem = (lesson: string, label: string, note: string, done: boolean) => (
    <button
      type="button"
      role="menuitem"
      className={`help-item${pendingLesson === lesson ? ' pending' : ''}`}
      disabled={pendingLesson !== null}
      aria-busy={pendingLesson === lesson}
      onClick={() => openLesson(lesson)}
    >
      <span>{pendingLesson === lesson ? 'Starting…' : label}</span>
      <span className={`help-item-note${done ? ' help-item-done' : ''}`}>{note}</span>
    </button>
  )
  const learn = () => openLesson(LEARN_COMMANDER_LESSON)

  /** From where it stands (on this page, or by the way to its page), or —
   * not running — from the start of this page's part. */
  const takeTour = () => {
    setOpen(false)
    markIntroSeen()
    const page = coachPage()
    if (at !== -1 && page !== null) apply(SITE_TOUR, continueFrom(SITE_TOUR, at, page))
    else startTour(SITE_TOUR)
  }

  return (
    <div className="help-control" ref={boxRef}>
      {showCallout ? (
        <div className="help-callout" role="status" data-tour="help-callout">
          <button
            type="button"
            className="help-callout-close"
            aria-label="Dismiss"
            title="Dismiss"
            onClick={markIntroSeen}
          >
            ×
          </button>
          <p className="help-callout-title">New here?</p>
          <p>Never played? Learn Commander in a short guided game. Know Magic already? Take a quick tour of the site.</p>
          <div className="help-callout-actions">
            <button type="button" className="coach-next" onClick={learn}>
              Learn to play
            </button>
            <button type="button" onClick={() => takeTour()}>
              Take the tour
            </button>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        className="help-button"
        aria-expanded={open}
        aria-label="Help and tutorials"
        title="Help and tutorials"
        data-tour="corner-help"
        onClick={() => {
          markIntroSeen()
          setOpen((o) => !o)
        }}
      >
        ?
      </button>
      {open ? (
        <div className="help-menu" role="menu" aria-label="Tutorials">
          <div className="help-menu-heading">Tutorials</div>
          <button
            type="button"
            role="menuitem"
            className="help-item"
            onClick={takeTour}
          >
            <span>{at !== -1 ? 'Continue the site tour' : progress.tour.done ? 'Replay the site tour' : 'Tour the site'}</span>
            <span className={`help-item-note${progress.tour.done && at === -1 ? ' help-item-done' : ''}`}>{tourNote}</span>
          </button>
          {at !== -1 ? (
            <button
              type="button"
              className="link-button help-restart"
              onClick={() => {
                setOpen(false)
                setTourAt(null)
                startTour(SITE_TOUR)
              }}
            >
              Start it over
            </button>
          ) : null}
          {lessonItem(
            BOARD_TOUR_LESSON,
            boardDone ? 'Tour the board again' : 'Tour the board',
            boardDone ? 'Done ✓' : 'A practice table',
            boardDone,
          )}
          {lessonItem(
            LEARN_COMMANDER_LESSON,
            lessonDone ? 'Learn Commander again' : 'Learn Commander',
            lessonDone ? 'Done ✓' : 'A guided game',
            lessonDone,
          )}
          {lessonItem(
            COMMANDER_RULES_LESSON,
            rulesDone ? "Commander's rules again" : "Commander's rules",
            rulesDone ? 'Done ✓' : 'A second game',
            rulesDone,
          )}
        </div>
      ) : null}
    </div>
  )
}
