import { useEffect, useRef, useState } from 'react'

import { BUILT_WITH, BUILT_WITH_NOTE, CLAUDE_CODE_URL, FEEDBACK_HREF } from './notice.ts'
import './legal.css'

/**
 * Two text buttons at the head of the landing page's corner toolbar
 * (`ui/CornerToolbar`, beside Help and Settings): one says the site was
 * built with Claude Code and opens a short note above itself, the other
 * mails feedback. The Claude Code button is words only: Anthropic's
 * trademark guidelines want its approval before its logo is used, and allow
 * saying in plain text what a thing was built with.
 *
 * On a device's first visit the note is already up, and stays until it's
 * dismissed (its ×, the button, or Escape) rather than closing on the first
 * click anywhere; that's remembered in `localStorage` ({@link SEEN_KEY}) and
 * it's the button's to open from then on.
 */
export function SiteLinks() {
  const [firstVisit, setFirstVisit] = useState(() => !noteSeen())
  const [open, setOpen] = useState(firstVisit)
  const boxRef = useRef<HTMLDivElement>(null)

  const close = () => {
    setOpen(false)
    if (firstVisit) {
      markNoteSeen()
      setFirstVisit(false)
    }
  }

  // Opened from the button, it closes on a click anywhere else (as the
  // Settings panel does); Escape closes it either way.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!firstVisit && !boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      if (firstVisit) {
        markNoteSeen()
        setFirstVisit(false)
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, firstVisit])

  return (
    <>
      <div className="site-link-box" ref={boxRef}>
        <button type="button" className="site-link-btn" aria-expanded={open} onClick={() => (open ? close() : setOpen(true))}>
          {BUILT_WITH}
        </button>
        {open ? (
          <div className={`site-link-note${firstVisit ? ' first-visit' : ''}`} role="dialog" aria-label={BUILT_WITH}>
            <button type="button" className="help-callout-close" aria-label="Dismiss" title="Dismiss" onClick={close}>
              ×
            </button>
            <p className="site-link-note-title">{BUILT_WITH}</p>
            <p>
              {BUILT_WITH_NOTE}{' '}
              <a href={CLAUDE_CODE_URL} target="_blank" rel="noreferrer">
                About Claude Code
              </a>
            </p>
          </div>
        ) : null}
      </div>
      <a className="site-link-btn" href={FEEDBACK_HREF}>
        Send feedback
      </a>
    </>
  )
}

/** The `localStorage` key that says this device has dismissed the note. */
const SEEN_KEY = 'deckblitz.builtWithSeen'

/** Whether the note was dismissed here before. Storage can throw (private
 * modes, blocked site data): then it's taken as seen, so the note doesn't
 * come back on every visit with no way to remember it was closed. */
function noteSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) !== null
  } catch {
    return true
  }
}

function markNoteSeen(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Nothing to remember it in.
  }
}
