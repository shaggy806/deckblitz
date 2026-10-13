import { useEffect, useRef, useState } from 'react'
import { apply, coachPage, continueFrom, startTour, useCoach } from './coach.ts'
import { markIntroSeen, setTourAt, useTutorialProgress } from './progress.ts'
import { SITE_TOUR } from './tours/site.ts'
import { LEARN_COMMANDER_LESSON, lessonUrl } from './lesson.ts'
import './coach.css'

/**
 * The corner toolbar's "?" button, beside the Settings cog: a small menu of
 * the tutorials, each with its progress — *Tour the site* (not started, the
 * step it's at, or done and ready to replay) and *Learn Commander* (a guided
 * game, or done and ready to play again).
 *
 * With `intro` (the landing page), a first visit — nothing in the progress
 * store yet — also gets a small callout rising above the button, offering
 * the tour and the lesson. It blocks nothing and covers only the corner;
 * dismissed or followed, it's recorded and never shown again.
 *
 * *Learn Commander* opens a tutorial room on {@link LEARN_COMMANDER_LESSON}
 * through `onLearn`: the landing page creates it over its own connection;
 * anywhere else (the default) a page load to {@link lessonUrl} does, which
 * leaves a lobby's room the way a game's "Leave the room" does.
 */
export function HelpMenu({
  intro = false,
  onLearn = () => window.location.assign(lessonUrl(LEARN_COMMANDER_LESSON)),
}: {
  readonly intro?: boolean
  readonly onLearn?: () => void
}) {
  const progress = useTutorialProgress()
  const coach = useCoach()
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  // Closes on a click anywhere else, or Escape — as the Settings panel does.
  useEffect(() => {
    if (!open) return
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
  }, [open])

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

  const learn = () => {
    setOpen(false)
    markIntroSeen()
    onLearn()
  }

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
          <p>Take a quick tour of the site, or learn to play Commander in a short guided game.</p>
          <div className="help-callout-actions">
            <button type="button" className="coach-next" onClick={() => takeTour()}>
              Take the tour
            </button>
            <button type="button" onClick={learn}>
              Learn to play
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
          <button type="button" role="menuitem" className="help-item" onClick={learn}>
            <span>{lessonDone ? 'Learn Commander again' : 'Learn Commander'}</span>
            <span className={`help-item-note${lessonDone ? ' help-item-done' : ''}`}>
              {lessonDone ? 'Done ✓' : 'A guided game'}
            </span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
