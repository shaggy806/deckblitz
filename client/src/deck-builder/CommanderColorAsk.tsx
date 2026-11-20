import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Color } from 'engine/client'
import { ChosenColorPicker } from './ChosenColorPicker.tsx'
import './commander-picker.css'

/**
 * "Choose a color before the game begins" (rule 903.4b — Clara Oswald, The
 * Prismatic Piper), asked when an imported list's cards don't settle the
 * colour (`DeckFormatReport.commanderColorOpen`): any colour is legal, so it's
 * the player's to pick before the game starts. The commander picker's popup,
 * portalled to the page for the same reason (the landing column is zoomed).
 */
export function CommanderColorAsk({
  open,
  settled,
  onDone,
  onCancel,
}: {
  /** The commanders still to choose for. */
  readonly open: readonly string[]
  /** What the list's cards already settled, kept as it is. */
  readonly settled: Readonly<Record<string, Color>>
  readonly onDone: (colors: Readonly<Record<string, Color>>) => void
  readonly onCancel: () => void
}) {
  const [chosen, setChosen] = useState<Readonly<Record<string, Color>>>(settled)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const ready = open.every((name) => chosen[name] !== undefined)
  return createPortal(
    <div className="commander-picker" role="dialog" aria-modal="true" aria-label="Choose your commander's colour" onClick={onCancel}>
      <div className="commander-picker-box" onClick={(e) => e.stopPropagation()}>
        <div className="commander-picker-head">
          <h3>Choose your commander&apos;s colour</h3>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <p className="muted commander-picker-note">
          It&apos;s chosen as the deck is built: the commander is that colour all game, and it&apos;s part of the
          deck&apos;s colour identity.
        </p>
        {open.map((name) => (
          <p key={name} className="chosen-color-ask">
            <strong>{name}</strong>
            <ChosenColorPicker
              commander={name}
              chosen={chosen[name] ?? null}
              onChoose={(color) => setChosen({ ...chosen, [name]: color })}
            />
          </p>
        ))}
        <button type="button" disabled={!ready} onClick={() => onDone(chosen)}>
          Play
        </button>
      </div>
    </div>,
    document.body,
  )
}
