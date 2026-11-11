import { useEffect, useState } from 'react'
import type { ReplacementOption } from 'protocol'
import { cardPool } from '../cards/cardData.ts'
import { Symbols } from '../ui/Symbols.tsx'
import { suggestReplacement } from './importDeck.ts'
import { CONFIDENCE_LABEL, tagLabel } from './replacement-labels.ts'

/**
 * "Suggest a replacement…" on the deck builder's right-click menu (the user,
 * 2026-11-02): the import's card replacer asked about one card of the deck.
 * Lists the pool's closest stand-ins — in the deck's colour identity and not
 * already in it — each with how close a match it is and what the two have in
 * common; choosing one swaps it in for every copy of the card.
 */
export function ReplacementPicker({
  card,
  cards,
  commanders,
  onChoose,
  onClose,
}: {
  readonly card: string
  readonly cards: readonly string[]
  readonly commanders: readonly string[]
  readonly onChoose: (replacement: string) => void
  readonly onClose: () => void
}) {
  const [options, setOptions] = useState<readonly ReplacementOption[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    suggestReplacement(card, cards, commanders)
      .then((found) => {
        if (live) setOptions(found)
      })
      .catch((e: unknown) => {
        if (live) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      live = false
    }
    // Asked once, for the deck as it was when the menu item was picked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="db-modal" role="dialog" aria-modal="true" aria-label={`Replace ${card}`} onClick={onClose}>
      <div className="db-modal-box db-replacement-picker" onClick={(e) => e.stopPropagation()}>
        <div className="db-modal-head">
          <h3>Replace {card}</h3>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="muted db-printing-note">
          Cards that do much the same job, in your commander's colours and not already in the deck.
        </p>
        {error ? <div className="error-banner">⚠ {error}</div> : null}
        {options === null && error === null ? <p className="muted">Looking for replacements…</p> : null}
        {options !== null && options.length === 0 ? (
          <p className="muted">Nothing in the pool is a close enough match.</p>
        ) : null}
        {options !== null && options.length > 0 ? (
          <ul className="db-replacement-list">
            {options.map((option) => {
              const def = cardPool().byName.get(option.name)
              return (
                <li key={option.name}>
                  <button type="button" className="db-replacement-option" onClick={() => onChoose(option.name)}>
                    <span className="db-replacement-name">
                      <strong>{option.name}</strong>
                      {def?.manaCost ? <Symbols text={def.manaCost} /> : null}
                    </span>
                    <span className={`db-replacement-confidence ${option.confidence}`}>
                      {CONFIDENCE_LABEL[option.confidence]}
                    </span>
                    {option.sharedTags.length > 0 ? (
                      <span className="muted db-replacement-tags">
                        Both: {option.sharedTags.slice(0, 4).map(tagLabel).join(', ')}
                      </span>
                    ) : null}
                    {def ? <span className="db-replacement-text">{def.text}</span> : null}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
