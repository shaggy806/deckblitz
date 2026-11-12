import type { VisibleObject } from 'engine/client'
import { KeywordIcon } from './KeywordIcon.tsx'
import { stripReminders, tipsFor } from './textKeywords.ts'
import { Symbols } from './Symbols.tsx'

/**
 * What each term on a card means, as a column of small boxes beside it —
 * after Hearthstone's keyword tooltips: the term's name (with its icon, for
 * one of the engine's keywords), then its reminder text. Its own keywords
 * first, then the terms its rules text uses (ward, scry, Treasure… — see
 * `textKeywords.ts`), whose reminder text the card face itself leaves out.
 * Nothing for a card with none.
 *
 * Shown beside a permanent's hover card and a hand card grown under the
 * pointer, fading in only after the pointer has rested there a moment (the
 * CSS's delay), so sweeping across the board or the hand doesn't flash a
 * column of boxes over everything.
 */
export function KeywordTips({
  obj,
  className = '',
  notes = [],
}: {
  readonly obj: VisibleObject
  readonly className?: string
  /** What else the board's hover card says about the permanent — summoning
   * sickness, counters, a goad (`CardFlags`' `flagNotes`) — first in the
   * column, in the same boxes as the keywords (the user, 2026-11-11). */
  readonly notes?: readonly { readonly key: string; readonly name: string; readonly text: string }[]
}) {
  const text = stripReminders([obj.text, obj.spellFace?.text ?? ''].filter(Boolean).join('\n'))
  const tips = tipsFor(obj.keywords, text)
  if (tips.length === 0 && notes.length === 0) return null
  return (
    <div className={`keyword-tips ${className}`}>
      {notes.map((note) => (
        <div key={note.key} className="keyword-tip keyword-note">
          <span className="kt-head">{note.name}</span>
          <span className="kt-text">
            <Symbols text={note.text} />
          </span>
        </div>
      ))}
      {tips.map((tip) => (
        <div key={tip.key} className="keyword-tip">
          <span className="kt-head">
            {tip.keyword !== undefined ? (
              <span className="kt-glyph">
                <KeywordIcon keyword={tip.keyword} />
              </span>
            ) : null}
            {tip.name}
          </span>
          <span className="kt-text">
            <Symbols text={tip.text} />
          </span>
        </div>
      ))}
    </div>
  )
}
