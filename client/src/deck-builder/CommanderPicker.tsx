import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CommanderCandidate } from 'protocol'
import { cssUrl, resolveArtUrl } from '../ui/art.ts'
import { Symbols } from '../ui/Symbols.tsx'
import './commander-picker.css'

/**
 * "Which card is this deck's commander?" — asked when an imported list
 * doesn't say (an alphabetical export has no `Commander` section and no
 * trailing commander line) and more than one of its cards could be: the
 * import used to guess the first legend it met (the user, 2026-11-12). The
 * candidates come from the import's `format.commanderCandidates`; the answer
 * goes back through `importDecklist`'s `commanders`, so the stand-ins are
 * chosen for the right colours.
 *
 * One click picks a commander. One that can share the command zone with
 * another card of the list (Partner, Friends forever, a Background) asks a
 * second question: with which, or alone.
 *
 * Used on the landing page (blitzing) and in the deck builder, so it's a
 * popup of its own, portalled to the page: the landing column is zoomed.
 */
export function CommanderPicker({
  candidates,
  onPick,
  onCancel,
}: {
  readonly candidates: readonly CommanderCandidate[]
  /** One name, or two for a pair, as the list names them. */
  readonly onPick: (commanders: readonly string[]) => void
  readonly onCancel: () => void
}) {
  // The commander picked first, while its partner is asked.
  const [lead, setLead] = useState<CommanderCandidate | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const card = (name: string, detail: CommanderCandidate | undefined, onClick: () => void) => (
    <button key={name} type="button" className="commander-choice" onClick={onClick}>
      <span
        className="commander-choice-art"
        style={{ backgroundImage: cssUrl(resolveArtUrl(null, name, 'art_crop')) }}
        aria-hidden="true"
      />
      <span className="commander-choice-text">
        <span className="commander-choice-name">
          <strong>{name}</strong>
          {detail?.manaCost ? <Symbols text={detail.manaCost} /> : null}
        </span>
        {detail !== undefined ? <span className="commander-choice-type">{detail.typeLine}</span> : null}
        {detail !== undefined && !detail.implemented ? (
          <span className="commander-choice-note">Not in the card pool yet: a stand-in plays in its place.</span>
        ) : null}
        {detail !== undefined && detail.pairsWith.length > 0 && lead === null ? (
          <span className="commander-choice-note">Can have a partner from this list.</span>
        ) : null}
      </span>
    </button>
  )

  return createPortal(
    <div className="commander-picker" role="dialog" aria-modal="true" aria-label="Choose the commander" onClick={onCancel}>
      <div className="commander-picker-box" onClick={(e) => e.stopPropagation()}>
        <div className="commander-picker-head">
          <h3>{lead === null ? "Which card is this deck's commander?" : `${lead.name}: with a partner?`}</h3>
          <button type="button" onClick={lead === null ? onCancel : () => setLead(null)}>
            {lead === null ? 'Cancel' : 'Back'}
          </button>
        </div>
        <p className="muted commander-picker-note">
          {lead === null
            ? "The list doesn't say which, and more than one of its cards could be."
            : 'These cards of the list can share the command zone with it.'}
        </p>
        {lead === null ? (
          <div className="commander-picker-list">
            {candidates.map((c) =>
              card(c.name, c, () => (c.pairsWith.length > 0 ? setLead(c) : onPick([c.name]))),
            )}
          </div>
        ) : (
          <div className="commander-picker-list">
            {lead.pairsWith.map((name) =>
              card(
                name,
                candidates.find((c) => c.name === name),
                () => onPick([lead.name, name]),
              ),
            )}
            <button type="button" className="commander-choice commander-choice-alone" onClick={() => onPick([lead.name])}>
              <span className="commander-choice-text">
                <span className="commander-choice-name">
                  <strong>No partner</strong>
                </span>
                <span className="commander-choice-note">{lead.name} alone</span>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
