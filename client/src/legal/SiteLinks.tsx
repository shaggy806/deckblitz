import { useEffect, useRef, useState } from 'react'

import { BUILT_WITH, BUILT_WITH_NOTE, CLAUDE_CODE_URL, FEEDBACK_EMAIL, FEEDBACK_HREF, SUPPORT_URL } from './notice.ts'
import { markIntroSeen } from '../tutorial/progress.ts'
import './legal.css'

/**
 * Two text buttons at the head of the landing page's corner toolbar
 * (`ui/CornerToolbar`, beside Help and Settings): one says the site was
 * built with Claude Code and opens a short note above itself, one gives
 * the feedback address, and one links the Ko-fi page for whoever wants to
 * support the site. The Claude Code button is words only (and Ko-fi's too): Anthropic's
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
      {/* What changed in each deploy (`UpdatesPage`). */}
      <a className="site-link-btn" href="/updates">
        Updates
      </a>
      <FeedbackLink />
      <a className="site-link-btn" href={SUPPORT_URL} target="_blank" rel="noreferrer">
        Support on Ko-fi
      </a>
    </>
  )
}

/**
 * "Send feedback": a box with the address to copy, and a link that opens a
 * mail program for whoever has one. Not a bare `mailto:` link, which does
 * nothing at all on a machine with no mail program set (anyone on webmail):
 * the user's own first click, on the live site (2026-11-21).
 */
function FeedbackLink() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  // Closes on a click anywhere else, or Escape.
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

  const copy = () => {
    // The address stays on screen to select by hand where the clipboard is
    // refused.
    navigator.clipboard?.writeText(FEEDBACK_EMAIL).then(
      () => setCopied(true),
      () => {},
    )
  }

  return (
    <div className="site-link-box" ref={boxRef}>
      <button
        type="button"
        className="site-link-btn"
        aria-expanded={open}
        onClick={() => {
          setOpen((was) => !was)
          setCopied(false)
          // The box opens over the tutorials' first-visit callout beside it,
          // so the callout goes, as if dismissed (the user's call,
          // 2026-11-21); the "?" button still has everything it offered.
          markIntroSeen()
        }}
      >
        Send feedback
      </button>
      {open ? (
        <div className="site-link-note" role="dialog" aria-label="Send feedback">
          <p className="site-link-note-title">Send feedback</p>
          <p>Found a bug, a card that plays wrong, or something you&apos;d like to see? Write to:</p>
          <p className="site-link-address">{FEEDBACK_EMAIL}</p>
          <div className="site-link-actions">
            <button type="button" onClick={copy}>
              {copied ? 'Copied' : 'Copy address'}
            </button>
            <a href={FEEDBACK_HREF}>Open in my mail app</a>
          </div>
        </div>
      ) : null}
    </div>
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
