import { useEffect, useState } from 'react'
import type { CommanderCandidate } from 'protocol'
import { commanderPrintings, deckLabel, deckSourceNote, listPickableDecks } from '../deck-builder/decks.ts'
import type { PickableDeck } from '../deck-builder/decks.ts'
import { CommanderPicker } from '../deck-builder/CommanderPicker.tsx'
import { importAndSave } from '../deck-builder/importAndSave.ts'
import type { ImportProgress, ImportReport } from '../deck-builder/importDeck.ts'
import { CommanderArt } from './CommanderArt.tsx'
import { DeckIdentityPips } from '../ui/DeckIdentityPips.tsx'
import { poolLabel } from './randomBotDeck.ts'
import './lobby.css'

/** The tab that imports a pasted list (`DeckImportTab`). */
const IMPORT_TAB = 'import'

/** The bot picker's tab last open, kept in this browser: a bot added to an
 * open seat starts on it (the user, 2026-11-25). */
const BOT_TAB_KEY = 'mtg.lobby.botDeckTab'

function readBotTab(): string | null {
  try {
    return window.localStorage.getItem(BOT_TAB_KEY)
  } catch {
    return null
  }
}

function writeBotTab(id: string): void {
  try {
    window.localStorage.setItem(BOT_TAB_KEY, id)
  } catch {
    // Not remembered; the picker opens on its first tab next time.
  }
}

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
 * for your own seat My decks, then Brackets 2, 3 and 4 (the precons, the
 * upgraded precons, and the strong decks: a player's to bring too since
 * 2026-11-24, a bot's only before), then Import list (`DeckImportTab`, a
 * pasted list saved and brought); for a bot (`forBot`) Brackets 2, 3 and 4,
 * the pools its "+ Bot" buttons deal from (`BOT_DECK_POOLS`), then My decks.
 * A bot plays one of your saved decks only when you pick it here (the user,
 * 2026-11-22: "it should remain a manual choice"): the "+ Bot" buttons and
 * Fill with bots never deal one, and the tab comes last so the picker opens
 * on the bot decks. It opens on the group holding `current`, the seat's deck
 * by name, so the choice already made is in view; a bot's picker with no
 * deck yet opens on the tab it last had open (`BOT_TAB_KEY`, the user,
 * 2026-11-25), so adding bots from one bracket is a click each. The "build a new one" link
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
    { id: 'precon', label: poolLabel('precon'), decks: starters.filter((d) => d.strength === 'precon') },
    { id: 'upgraded', label: poolLabel('upgraded'), decks: starters.filter((d) => d.strength === 'upgraded') },
    { id: 'strong', label: poolLabel('strong'), decks: decks.filter((d) => d.strength === 'strong') },
    ...(forBot ? [saved] : []),
  ]
    .filter((g) => g.decks.length > 0)
    // A pasted list, for your own seat: no visit to the deck builder first.
    .concat(forBot ? [] : [{ id: IMPORT_TAB, label: 'Import list', decks: [] }])
  const [chosen, setChosen] = useState<string | null>(null)
  const [remembered] = useState(() => (forBot ? readBotTab() : null))
  const open =
    groups.find((g) => g.id === chosen) ??
    groups.find((g) => current != null && g.decks.some((d) => d.name === current)) ??
    groups.find((g) => g.id === remembered) ??
    groups[0]
  const openId = open?.id ?? null
  useEffect(() => {
    if (forBot && openId !== null) writeBotTab(openId)
  }, [forBot, openId])

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
          {open?.id === IMPORT_TAB ? (
            <DeckImportTab onPick={onPick} />
          ) : (
            (open?.decks ?? []).map((d) => (
              <DeckPickerRow key={d.key} deck={d} onPick={onPick} current={d.name === current} />
            ))
          )}
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

/**
 * The picker's Import tab, for your own seat: a pasted list imported as the
 * deck builder imports one (`importAndSave`: an unimplemented card swapped
 * for a stand-in, one with none dropped) and saved to your decks, so it's in
 * My decks and the deck builder afterwards and survives a reload of the room
 * (the user, 2026-11-24: to test a deck against the bots without visiting the
 * deck builder first). A list the import didn't change is brought to the seat
 * at once; one it did shows what changed first, with a button to bring it.
 */
function DeckImportTab({ onPick }: { readonly onPick: (deck: PickableDeck) => void }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [asking, setAsking] = useState<readonly CommanderCandidate[] | null>(null)
  const [imported, setImported] = useState<{ readonly deck: PickableDeck; readonly report: ImportReport } | null>(null)

  const run = (commanders?: readonly string[]) => {
    setAsking(null)
    setBusy(true)
    setProgress(null)
    setError(null)
    importAndSave(text, setProgress, commanders)
      .then((outcome) => {
        if (outcome.kind === 'ask') {
          setAsking(outcome.candidates)
          return
        }
        const deck = listPickableDecks().find((d) => d.key === `saved:${outcome.deck.id}`)
        if (deck === undefined) throw new Error('The deck could not be saved in this browser.')
        if (outcome.report.substituted.length === 0 && outcome.report.dropped.length === 0) onPick(deck)
        else setImported({ deck, report: outcome.report })
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setBusy(false))
  }

  // The clipboard, read on the click (which is what lets a browser allow it).
  const paste = () => {
    setError(null)
    const read = navigator.clipboard?.readText?.bind(navigator.clipboard)
    if (read === undefined) {
      setError("This browser won't let the page read the clipboard: press Ctrl+V in the box.")
      return
    }
    read()
      .then((clip) => {
        if (clip.trim() === '') setError('The clipboard is empty.')
        else setText(clip)
      })
      .catch(() => setError("The browser didn't allow reading the clipboard: press Ctrl+V in the box."))
  }

  if (imported !== null) {
    const { deck, report } = imported
    return (
      <div className="deck-picker-import">
        <p className="deck-picker-import-head">
          <strong>{deck.name}</strong> is saved to your decks: {report.asIs} as-is, {report.substitutedCards} swapped
          for a stand-in, {report.droppedCards} dropped.
        </p>
        {report.substituted.length > 0 ? (
          <ul className="deck-picker-import-changes">
            {report.substituted.map((s) => (
              <li key={s.from}>
                {s.from} <span aria-hidden="true">→</span> <strong>{s.to}</strong>
              </li>
            ))}
          </ul>
        ) : null}
        {report.dropped.length > 0 ? (
          <p className="deck-picker-import-note">No stand-in for: {report.dropped.join(', ')}</p>
        ) : null}
        <button type="button" className="primary" onClick={() => onPick(deck)}>
          Bring this deck
        </button>
      </div>
    )
  }

  return (
    <form
      className="deck-picker-import"
      onSubmit={(e) => {
        e.preventDefault()
        if (text.trim() !== '' && !busy) run()
      }}
    >
      <label className="deck-picker-import-note" htmlFor="deck-picker-import-list">
        Paste a decklist (a Moxfield or Archidekt export, or "1 Card Name" lines). It&apos;s saved to your decks; a
        card the engine doesn&apos;t have yet is swapped for a similar one.
      </label>
      <textarea
        id="deck-picker-import-list"
        className="deck-picker-import-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'Commander\n1 Ureni of the Unwritten\n\nDeck\n1 Sol Ring\n...'}
        spellCheck={false}
        disabled={busy}
      />
      <div className="deck-picker-import-actions">
        <button type="button" onClick={paste} disabled={busy}>
          Paste from clipboard
        </button>
        <button type="submit" className="primary" disabled={busy || text.trim() === ''}>
          {busy ? 'Importing…' : 'Import'}
        </button>
      </div>
      {busy ? (
        <p className="deck-picker-import-note" role="status">
          {progress === null ? 'Reading your list…' : `Reading your list: ${progress.done} of ${progress.total} cards`}
        </p>
      ) : null}
      {error !== null ? (
        <p className="deck-picker-import-error" role="alert">
          ⚠ {error}
        </p>
      ) : null}
      {asking !== null ? (
        <CommanderPicker candidates={asking} onPick={run} onCancel={() => setAsking(null)} />
      ) : null}
    </form>
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
            {deckSourceNote(deck)}
          </span>
        ) : (
          <span className="deck-picker-row-commander muted">{deck.cards.length} cards</span>
        )}
      </span>
      <DeckIdentityPips commanders={deck.commanders} colors={deck.commanderColors} />
    </button>
  )
}
