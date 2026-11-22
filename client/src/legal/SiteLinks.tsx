import { useId, useState } from 'react'

import { BUILT_WITH, BUILT_WITH_NOTE, CLAUDE_CODE_URL, FEEDBACK_HREF } from './notice.ts'
import './legal.css'

/**
 * Two small buttons above the landing page's legal footer: one mails
 * feedback, the other says the site was built with Claude Code and opens a
 * short note on what that means, in the page's flow (the landing column is
 * zoomed, so a popup would have to be portalled). The Claude Code button is
 * words only: Anthropic's trademark guidelines want its approval before its
 * logo is used, and allow saying in plain text what a thing was built with.
 */
export function SiteLinks() {
  const [open, setOpen] = useState(false)
  const noteId = useId()
  return (
    <div className="site-links">
      <div className="site-links-row">
        <a className="site-link-btn" href={FEEDBACK_HREF}>
          Send feedback
        </a>
        <button
          type="button"
          className="site-link-btn"
          aria-expanded={open}
          aria-controls={noteId}
          onClick={() => setOpen((was) => !was)}
        >
          {BUILT_WITH}
        </button>
      </div>
      {open ? (
        <p className="site-links-note" id={noteId}>
          {BUILT_WITH_NOTE}{' '}
          <a href={CLAUDE_CODE_URL} target="_blank" rel="noreferrer">
            About Claude Code
          </a>
        </p>
      ) : null}
    </div>
  )
}
