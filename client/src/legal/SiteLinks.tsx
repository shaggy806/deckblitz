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
 */
export function SiteLinks() {
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  // Closes on a click anywhere else, or Escape (as the Settings panel does).
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

  return (
    <>
      <div className="site-link-box" ref={boxRef}>
        <button type="button" className="site-link-btn" aria-expanded={open} onClick={() => setOpen((was) => !was)}>
          {BUILT_WITH}
        </button>
        {open ? (
          <p className="site-link-note" role="dialog" aria-label={BUILT_WITH}>
            {BUILT_WITH_NOTE}{' '}
            <a href={CLAUDE_CODE_URL} target="_blank" rel="noreferrer">
              About Claude Code
            </a>
          </p>
        ) : null}
      </div>
      <a className="site-link-btn" href={FEEDBACK_HREF}>
        Send feedback
      </a>
    </>
  )
}
