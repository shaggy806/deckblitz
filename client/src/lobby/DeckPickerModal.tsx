import { useState } from 'react'
import { commanderPrintings, deckLabel, listPickableDecks, listStrongDecks } from '../deck-builder/decks.ts'
import type { PickableDeck } from '../deck-builder/decks.ts'
import { CommanderArt } from './CommanderArt.tsx'
import { DeckIdentityPips } from '../ui/DeckIdentityPips.tsx'
import './lobby.css'

/**
 * The popup the seat board opens when you click a seat's deck slot — lets
 * you pick from this browser's saved decks or the built-in starters without
 * ever leaving the room (see `SeatBoard.tsx`'s header comment for why that
 * matters). Purely a picker: it hands the chosen deck back via `onPick` and
 * lets the caller decide what that means (stage it for your own seat's
 * `Join`, or immediately assign it to a bot).
 *
 * `includeSaved` gates this browser's saved decks (and the "build a new
 * one" link, which only makes sense alongside them) — on for your own seat,
 * off for a bot's: a bot only ever plays a curated starter deck, never a
 * deck you're still building or one meant for you to actually play.
 *
 * The decks are in groups, one shown at a time (the user, 2026-11-15: "they
 * should be sorted into 3 strength categories rather than a long list"):
 * for a bot Precon, Upgraded and Strong, the strengths its "+ Bot" buttons
 * deal from; for your own seat My decks, Precon and Upgraded (the strong
 * decks are real players' lists, dealt to bots only). It opens on the group
 * holding `current`, the seat's deck by name, so the choice already made is
 * in view.
 */
export function DeckPickerModal({
  title,
  roomId,
  includeSaved,
  current,
  onPick,
  onClose,
}: {
  readonly title: string
  readonly roomId: string | null
  readonly includeSaved: boolean
  readonly current?: string | null
  readonly onPick: (deck: PickableDeck) => void
  readonly onClose: () => void
}) {
  const decks = listPickableDecks()
  const starters = decks.filter((d) => d.key.startsWith('starter:'))
  const groups: readonly { readonly id: string; readonly label: string; readonly decks: readonly PickableDeck[] }[] = [
    { id: 'saved', label: 'My decks', decks: includeSaved ? decks.filter((d) => d.key.startsWith('saved:')) : [] },
    { id: 'precon', label: 'Precon', decks: starters.filter((d) => d.strength === 'precon') },
    { id: 'upgraded', label: 'Upgraded', decks: starters.filter((d) => d.strength === 'upgraded') },
    { id: 'strong', label: 'Strong', decks: includeSaved ? [] : listStrongDecks() },
  ].filter((g) => g.decks.length > 0)
  const [chosen, setChosen] = useState<string | null>(null)
  const open =
    groups.find((g) => g.id === chosen) ??
    groups.find((g) => current != null && g.decks.some((d) => d.name === current)) ??
    groups[0]

  return (
    <div className="deck-picker-overlay" onClick={onClose}>
      <div className="deck-picker-box" onClick={(e) => e.stopPropagation()}>
        <div className="deck-picker-head">
          <h3>{title}</h3>
          <button type="button" className="deck-picker-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="deck-picker-tabs" role="tablist" aria-label="Kind of deck">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={g === open}
              className={`seg-option${g === open ? ' active' : ''}`}
              onClick={() => setChosen(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="deck-picker-list" role="tabpanel">
          {(open?.decks ?? []).map((d) => (
            <DeckPickerRow key={d.key} deck={d} onPick={onPick} current={d.name === current} />
          ))}
        </div>
        {includeSaved ? (
          <a
            className="link-button deck-picker-build"
            href={roomId ? `/deck-builder?room=${roomId}` : '/deck-builder'}
          >
            + Build or import a deck
          </a>
        ) : null}
      </div>
    </div>
  )
}

function DeckPickerRow({
  deck,
  onPick,
  current,
}: {
  readonly deck: PickableDeck
  readonly onPick: (deck: PickableDeck) => void
  /** The deck the seat has now. */
  readonly current: boolean
}) {
  return (
    <button
      type="button"
      className={`deck-picker-row${current ? ' current' : ''}`}
      aria-current={current ? 'true' : undefined}
      onClick={() => onPick(deck)}
    >
      <CommanderArt
        commanders={commanderPrintings(deck)}
        className="deck-picker-row-art"
        blankClass="deck-picker-row-art-blank"
      />
      <span className="deck-picker-row-text">
        <span className="deck-picker-row-name">{deckLabel(deck.name)}</span>
        {deck.commanders.length > 0 ? (
          <span className="deck-picker-row-commander">
            {deck.commanders.join(' & ')}
            {deck.author !== undefined ? ` · by ${deck.author}` : ''}
          </span>
        ) : (
          <span className="deck-picker-row-commander muted">{deck.cards.length} cards</span>
        )}
      </span>
      <DeckIdentityPips commanders={deck.commanders} />
    </button>
  )
}
