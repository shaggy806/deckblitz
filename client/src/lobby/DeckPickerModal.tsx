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
 * The decks are in groups, one shown at a time (the user, 2026-11-15: "they
 * should be sorted into 3 strength categories rather than a long list"):
 * for your own seat My decks, Precon and Upgraded (the strong decks are real
 * players' lists, dealt to bots only); for a bot (`forBot`) Precon, Upgraded
 * and Strong, the strengths its "+ Bot" buttons deal from, then My decks.
 * A bot plays one of your saved decks only when you pick it here (the user,
 * 2026-11-22: "it should remain a manual choice"): the "+ Bot" buttons and
 * Fill with bots never deal one, and the tab comes last so the picker opens
 * on the bot decks. It opens on the group holding `current`, the seat's deck
 * by name, so the choice already made is in view. The "build a new one" link
 * is for your own seat: it leaves the room's page.
 */
export function DeckPickerModal({
  title,
  roomId,
  forBot,
  current,
  onPick,
  onClose,
}: {
  readonly title: string
  readonly roomId: string | null
  readonly forBot: boolean
  readonly current?: string | null
  readonly onPick: (deck: PickableDeck) => void
  readonly onClose: () => void
}) {
  const decks = listPickableDecks()
  const starters = decks.filter((d) => d.key.startsWith('starter:'))
  const saved = { id: 'saved', label: 'My decks', decks: decks.filter((d) => d.key.startsWith('saved:')) }
  const groups: readonly { readonly id: string; readonly label: string; readonly decks: readonly PickableDeck[] }[] = [
    ...(forBot ? [] : [saved]),
    { id: 'precon', label: 'Precon', decks: starters.filter((d) => d.strength === 'precon') },
    { id: 'upgraded', label: 'Upgraded', decks: starters.filter((d) => d.strength === 'upgraded') },
    { id: 'strong', label: 'Strong', decks: forBot ? listStrongDecks() : [] },
    ...(forBot ? [saved] : []),
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
          {/* The word, as the zone viewer, History and the deck builder's
              pickers close: this and the library's overlay had a bare ×. */}
          <button type="button" onClick={onClose}>
            Close
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
        {forBot && open?.id === 'saved' ? (
          // The user, 2026-11-22: the bots' play is tuned on the preset
          // decks, so say so where a bot is handed any other.
          <p className="deck-picker-warning" role="note">
            Bots are tuned for the preset decks. With one of your own decks a bot will almost always make misplays.
          </p>
        ) : null}
        <div className="deck-picker-list" role="tabpanel">
          {(open?.decks ?? []).map((d) => (
            <DeckPickerRow key={d.key} deck={d} onPick={onPick} current={d.name === current} />
          ))}
        </div>
        {!forBot ? (
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
      <DeckIdentityPips commanders={deck.commanders} colors={deck.commanderColors} />
    </button>
  )
}
