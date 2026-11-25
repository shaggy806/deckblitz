import { useState } from 'react'
import type { FormEvent } from 'react'
import { STARTER_DECKS, STRONG_DECKS, commandersOf } from 'engine/client'
import type { PreconSubstitution } from 'engine/client'
import {
  builtInDeck,
  createDeck,
  deckLabel,
  deleteDeck,
  duplicateDeck,
  duplicateStarter,
  getActiveRef,
  listDecks,
  sameRef,
  saveDeck,
  setActive,
} from './decks.ts'
import type { ActiveRef, SavedDeck } from './decks.ts'
import { DeckEditor } from './DeckEditor.tsx'
import type { CommanderCandidate } from 'protocol'
import { CommanderPicker } from './CommanderPicker.tsx'
import { importAndSave } from './importAndSave.ts'
import type { ImportProgress, ImportReport } from './importDeck.ts'
import { ReplacementReview } from './ReplacementReview.tsx'
import { StableLabel } from '../ui/StableLabel.tsx'
import { DeckIdentityPips } from '../ui/DeckIdentityPips.tsx'
import { CONFIDENCE_LABEL } from './replacement-labels.ts'
import './deck-builder.css'
import { SiteNotice } from '../legal/SiteNotice.tsx'
import { cardPool } from '../cards/cardData.ts'
import { blitzReady, blitzUrl } from '../lobby/blitzDeck.ts'
import type { WireDeck } from 'protocol'

type Selection = ActiveRef | null

export function DeckBuilderPage() {
  const [decks, setDecks] = useState<readonly SavedDeck[]>(() => listDecks())
  const [activeRef, setActiveRefState] = useState(() => getActiveRef())
  const [selection, setSelection] = useState<Selection>(() => {
    const ref = getActiveRef()
    return ref
  })
  const [importing, setImporting] = useState(false)
  const [importReport, setImportReport] = useState<ImportReport | null>(null)
  /** The stand-in review popup, open over the freshly imported deck. */
  const [reviewing, setReviewing] = useState(false)
  /** Why a deck's Blitz button didn't start a game, under that deck's row
   * (`key`: `saved:<id>`, `starter:<index>` or `strong:<index>`, as
   * `blitzUrl` takes it). */
  const [blitzProblem, setBlitzProblem] = useState<{ readonly key: string; readonly text: string } | null>(null)

  /** A deck's Blitz button: the game page, blitzing it against three bots
   * (`blitzUrl`) — or, for a deck that can't be played, why not, the same
   * check a pasted list's blitz makes (`blitzReady`), with the pool at hand
   * to refuse a card the engine no longer has. */
  const blitz = (key: string, deck: WireDeck) => {
    const ready = blitzReady(deck, 'saved', undefined, (name) => cardPool().byName.has(name))
    if ('problem' in ready) {
      setBlitzProblem({ key, text: ready.problem })
      return
    }
    setBlitzProblem(null)
    window.location.assign(blitzUrl(key))
  }
  const blitzButton = (key: string, deck: WireDeck, label: string) => (
    <button
      type="button"
      className="db-blitz-btn"
      aria-label={`Blitz ${label}`}
      title="Play this deck now against three bots"
      onClick={() => blitz(key, deck)}
    >
      Blitz
    </button>
  )
  const blitzNote = (key: string) =>
    blitzProblem?.key === key ? (
      <p className="db-blitz-problem" role="alert">
        ⚠ {blitzProblem.text}
      </p>
    ) : null

  const refreshDecks = () => setDecks(listDecks())
  const markActive = (ref: NonNullable<Selection>) => {
    setActive(ref)
    setActiveRefState(ref)
  }
  // Clears any lingering import report when navigating away from the deck
  // it belongs to, so it never shows up next to an unrelated deck.
  const selectDeck = (sel: Selection) => {
    setImportReport(null)
    setReviewing(false)
    setSelection(sel)
  }

  const selectedDeck =
    selection?.kind === 'saved' ? (decks.find((d) => d.id === selection.id) ?? null) : null
  /** The built-in deck selected: a starter, or a real player's deck. */
  const starterRef = selection !== null && selection.kind !== 'saved' ? selection : null
  const selectedStarter = starterRef !== null ? builtInDeck(starterRef) : null
  const starterKey = starterRef === null ? '' : starterRef.kind === 'starter' ? `starter-${starterRef.index}` : `strong-${starterRef.name}`

  const isActive = (ref: NonNullable<Selection>): boolean => sameRef(activeRef, ref)

  // A visit from the room seat-picker's deck-picker popup carries the room
  // code along (`?room=<code>`) specifically so this link can return to that
  // same room instead of dropping you back at the bare lobby — see
  // `client/src/lobby/DeckPickerModal.tsx`.
  const roomId = new URLSearchParams(window.location.search).get('room')
  const backHref = roomId ? `/?room=${roomId}` : '/'

  /** Puts `to` in the deck in place of `from`'s current stand-in — from the
   * review popup. */
  const swapStandIn = (from: string, to: string) => {
    if (!importReport || !selectedDeck) return
    const current = importReport.substituted.find((s) => s.from === from)
    if (!current || current.to === to) return
    // Never a card the deck already holds — the picker disables
    // those, but the rule belongs here too.
    if (selectedDeck.commanders.includes(to) || selectedDeck.cards.includes(to)) return
    // Exactly this card's one slot: a commander if that's what
    // it stood in for, otherwise the first copy in the 99.
    // Replacing every copy by name broke singleton the moment
    // two originals shared a first choice somewhere down the
    // list and one was swapped back.
    const commanderSlot = selectedDeck.commanders.indexOf(current.to)
    const isCommander = commanderSlot !== -1
    const slot = isCommander ? -1 : selectedDeck.cards.indexOf(current.to)
    if (!isCommander && slot === -1) return
    saveDeck({
      ...selectedDeck,
      cards: isCommander
        ? selectedDeck.cards
        : selectedDeck.cards.map((n, i) => (i === slot ? to : n)),
      commanders: isCommander
        ? selectedDeck.commanders.map((n, i) => (i === commanderSlot ? to : n))
        : selectedDeck.commanders,
    })
    refreshDecks()
    setImportReport({
      ...importReport,
      substituted: importReport.substituted.map((s) =>
        s.from === from ? { ...s, to } : s,
      ),
    })
  }

  return (
    <div className="db-page">
      <aside className="db-list">
        <a className="link-button db-back" href={backHref}>
          {/* The one label every page's way home has; from a room's deck
              picker it goes back to that room instead. */}
          {roomId ? '← Back to the room' : '← Main menu'}
        </a>
        <h1>Deck Builder</h1>

        <div className="db-list-section" data-tour="db-my-decks">
          <div className="db-list-head">
            <span>My decks</span>
            <div className="db-list-head-actions">
              <button type="button" data-tour="db-import" onClick={() => setImporting(true)}>
                Import
              </button>
              <button
                type="button"
                onClick={() => {
                  const deck = createDeck(`Deck ${decks.length + 1}`)
                  refreshDecks()
                  selectDeck({ kind: 'saved', id: deck.id })
                  markActive({ kind: 'saved', id: deck.id })
                }}
              >
                + New
              </button>
            </div>
          </div>
          {decks.length === 0 ? <p className="muted db-empty">No decks yet</p> : null}
          <ul>
            {decks.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className={selection?.kind === 'saved' && selection.id === d.id ? 'selected' : undefined}
                  onClick={() => selectDeck({ kind: 'saved', id: d.id })}
                >
                  <span className="db-deck-name">{d.name}</span>
                  <DeckIdentityPips commanders={d.commanders} colors={d.commanderColors} />
                  {isActive({ kind: 'saved', id: d.id }) ? <span className="db-active-badge">active</span> : null}
                </button>
                {blitzButton(`saved:${d.id}`, { cards: d.cards, commanders: d.commanders, name: d.name }, d.name)}
                {blitzNote(`saved:${d.id}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="db-list-section" data-tour="db-starters">
          <div className="db-list-head">
            <span>Starter decks</span>
          </div>
          <p className="muted db-note">Ready to play as-is, or duplicate to edit.</p>
          <ul>
            {STARTER_DECKS.map((d, i) => (
              <li key={d.name}>
                <button
                  type="button"
                  className={selection?.kind === 'starter' && selection.index === i ? 'selected' : undefined}
                  onClick={() => selectDeck({ kind: 'starter', index: i })}
                >
                  {/* With its commander, as the lobby's deck picker lists it:
                      the name alone doesn't say what the deck plays. */}
                  <span className="db-starter-text">
                    <span>{d.name}</span>
                    <span className="db-starter-commander">{commandersOf(d).join(' & ')}</span>
                  </span>
                  <DeckIdentityPips commanders={commandersOf(d)} />
                  {isActive({ kind: 'starter', index: i }) ? <span className="db-active-badge">active</span> : null}
                </button>
                {blitzButton(`starter:${i}`, { cards: d.cards, commanders: commandersOf(d), name: d.name }, d.name)}
                {blitzNote(`starter:${i}`)}
              </li>
            ))}
            {/* Real players' decks (Bracket 4), each by its creator's own
                title and credited to them, as the lobby's picker lists it. */}
            {STRONG_DECKS.map((d, i) => {
              const ref = { kind: 'strong', name: d.name } as const
              return (
                <li key={d.name}>
                  <button
                    type="button"
                    className={sameRef(selection, ref) ? 'selected' : undefined}
                    onClick={() => selectDeck(ref)}
                  >
                    <span className="db-starter-text">
                      <span>{deckLabel(d.name)}</span>
                      <span className="db-starter-commander">
                        {commandersOf(d).join(' & ')}
                        {d.credit !== undefined ? ` · by ${d.credit.author}` : ''}
                      </span>
                    </span>
                    <DeckIdentityPips commanders={commandersOf(d)} />
                    {isActive(ref) ? <span className="db-active-badge">active</span> : null}
                  </button>
                  {blitzButton(`strong:${i}`, { cards: d.cards, commanders: commandersOf(d), name: d.name }, deckLabel(d.name))}
                  {blitzNote(`strong:${i}`)}
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      <main className="db-detail">
        {importing ? (
          <ImportPanel
            onCancel={() => setImporting(false)}
            onImported={(deck, report) => {
              refreshDecks()
              setActiveRefState(getActiveRef())
              setSelection({ kind: 'saved', id: deck.id })
              setImportReport(report)
              // Straight into choosing stand-ins, card by card — they were
              // filled with each card's first suggestion so the deck is
              // playable either way.
              setReviewing(report.substituted.some((s) => s.options.length > 1))
              setImporting(false)
            }}
          />
        ) : selectedDeck ? (
          <>
            {importReport ? (
              <ImportReportBanner
                report={importReport}
                onDismiss={() => setImportReport(null)}
                onReview={() => setReviewing(true)}
              />
            ) : null}
            {importReport && reviewing ? (
              <ReplacementReview
                substitutions={importReport.substituted.filter((s) => s.options.length > 0)}
                deckCards={[...selectedDeck.cards, ...selectedDeck.commanders]}
                onChoose={swapStandIn}
                onClose={() => setReviewing(false)}
              />
            ) : null}
            {/* Keyed by deck, so switching decks starts the editor over —
                its name field is local state seeded from the deck, and kept
                the last deck's name, which leaving the field then saved
                onto this one. */}
            <DeckEditor
              key={selectedDeck.id}
              deck={selectedDeck}
              isActive={isActive({ kind: 'saved', id: selectedDeck.id })}
              onChange={(next) => {
                saveDeck(next)
                refreshDecks()
              }}
              onMakeActive={() => markActive({ kind: 'saved', id: selectedDeck.id })}
              onDuplicate={() => {
                const copy = duplicateDeck(selectedDeck.id)
                refreshDecks()
                if (copy) selectDeck({ kind: 'saved', id: copy.id })
              }}
              onDelete={() => {
                deleteDeck(selectedDeck.id)
                refreshDecks()
                selectDeck(null)
                setActiveRefState(getActiveRef())
              }}
            />
          </>
        ) : selectedStarter && starterRef !== null ? (
          <DeckEditor
            key={starterKey}
            deck={{
              id: starterKey,
              // A real player's deck by its own title, as its row has it.
              name: deckLabel(selectedStarter.name),
              commanders: commandersOf(selectedStarter),
              cards: selectedStarter.cards,
              // Its precon's art (`SampleDeck.printings`).
              ...(selectedStarter.printings !== undefined ? { printings: selectedStarter.printings } : {}),
            }}
            isActive={isActive(starterRef)}
            onMakeActive={() => markActive(starterRef)}
            onDuplicate={() => {
              const copy = duplicateStarter(starterRef)
              refreshDecks()
              if (copy) selectDeck({ kind: 'saved', id: copy.id })
            }}
            intro={<StarterIntro description={selectedStarter.description} substitutions={selectedStarter.substitutions} />}
            standIns={new Set((selectedStarter.substitutions ?? []).map((sub) => sub.substitute))}
          />
        ) : (
          <p className="muted db-prompt">Pick a deck on the left, or start a new one.</p>
        )}
        <SiteNotice />
      </main>
    </div>
  )
}

/**
 * Paste a decklist export, resolve it into a deck the engine can actually
 * play right now: an implemented card is kept as-is, an unimplemented one
 * with a `suggestedReplacement` (see `engine`'s `assignReplacements`, run
 * server-side against the pool) is swapped in instead, and anything with no
 * match at all (or not found on Scryfall) is dropped. Saves the result
 * (`importAndSave`, which the lobby's deck picker imports through too) and hands the new deck + a summary back to the
 * caller — this component's own job ends there, it doesn't render the
 * summary itself (see `ImportReportBanner`, shown above the editor once
 * this closes).
 */
function ImportPanel({
  onImported,
  onCancel,
}: {
  readonly onImported: (deck: SavedDeck, report: ImportReport) => void
  readonly onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  /** Why the Paste button couldn't fill the box, when it couldn't. */
  const [pasteNote, setPasteNote] = useState<string | null>(null)

  // The clipboard, read on the click (which is what lets a browser allow
  // it). Where it's refused, or the browser has no `readText`, the box still
  // takes Ctrl+V, so the button says so rather than doing nothing.
  const paste = () => {
    setPasteNote(null)
    const read = navigator.clipboard?.readText?.bind(navigator.clipboard)
    if (read === undefined) {
      setPasteNote("This browser won't let the page read the clipboard: press Ctrl+V in the box.")
      return
    }
    read()
      .then((clip) => {
        if (clip.trim() === '') setPasteNote('The clipboard is empty.')
        else setText(clip)
      })
      .catch(() => setPasteNote("The browser didn't allow reading the clipboard: press Ctrl+V in the box."))
  }

  // The cards that could be the list's commander, while the player is asked
  // which (`CommanderPicker`): a list that doesn't say has it guessed.
  const [asking, setAsking] = useState<readonly CommanderCandidate[] | null>(null)

  const runImport = (commanders?: readonly string[]) => {
    setAsking(null)
    setLoading(true)
    setProgress(null)
    setError(null)
    importAndSave(text, setProgress, commanders)
      .then((outcome) => {
        if (outcome.kind === 'ask') setAsking(outcome.candidates)
        else onImported(outcome.deck, outcome.report)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    runImport()
  }

  return (
    <div className="db-editor db-import-panel">
      <div className="db-editor-head">
        <h2>Import a decklist</h2>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <p className="muted">
        Paste a plain-text decklist export (Moxfield's "Export" feature, either with or without
        the "(SET) collector-number" printing suffix). Any card the engine doesn't implement yet
        is automatically swapped for a similar one already in the pool — you'll see exactly what
        changed before you keep it.
      </p>
      <form onSubmit={submit}>
        <textarea
          className="db-import-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={'Commander\n1 Ureni of the Unwritten\n\nDeck\n1 Sol Ring\n...'}
        />
        <div className="db-import-actions">
          <button type="button" onClick={paste} disabled={loading}>
            Paste from clipboard
          </button>
          <button type="submit" className="primary" disabled={!text.trim() || loading}>
            <StableLabel widest={['Importing…']}>{loading ? 'Importing…' : 'Import'}</StableLabel>
          </button>
        </div>
        {pasteNote !== null ? <p className="muted db-import-note">{pasteNote}</p> : null}
      </form>
      {loading ? <ImportProgressBar progress={progress} /> : null}
      {asking !== null ? (
        <CommanderPicker candidates={asking} onPick={runImport} onCancel={() => setAsking(null)} />
      ) : null}
      {error ? <div className="error-banner">⚠ {error}</div> : null}
    </div>
  )
}

/** Live progress while the server resolves a pasted list. Before the first
 * line lands (the request is still in flight) there's no total yet, so it
 * shows an indeterminate "Contacting the server…" state rather than a
 * misleading 0%. */
function ImportProgressBar({ progress }: { readonly progress: ImportProgress | null }) {
  const pct =
    progress === null || progress.total === 0
      ? 0
      : Math.round((progress.done / progress.total) * 100)
  return (
    <div className="db-import-progress">
      <div className="db-import-progress-track">
        <div
          className={`db-import-progress-fill${progress === null ? ' indeterminate' : ''}`}
          style={progress === null ? undefined : { width: `${pct}%` }}
        />
      </div>
      <div className="db-import-progress-label">
        {progress === null ? (
          <span className="muted">Contacting the server…</span>
        ) : (
          <>
            <span>
              {progress.done} / {progress.total} cards
            </span>
            <span className="muted db-import-progress-card">
              {progress.name ?? 'Looking up cards…'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function ImportReportBanner({
  report,
  onDismiss,
  onReview,
}: {
  readonly report: ImportReport
  readonly onDismiss: () => void
  /** Opens the card-by-card stand-in review. */
  readonly onReview: () => void
}) {
  return (
    <div className="db-import-report">
      <div className="db-import-report-head">
        <strong>
          Imported {report.total} card{report.total === 1 ? '' : 's'} — {report.asIs} as-is,{' '}
          {report.substitutedCards} substituted, {report.droppedCards} dropped
          {report.printings > 0 ? `, ${report.printings} keeping their printing` : ''}
        </strong>
        <span className="db-import-report-actions">
          {report.substituted.some((s) => s.options.length > 1) ? (
            <button type="button" onClick={onReview}>
              Review stand-ins
            </button>
          ) : null}
          <button type="button" onClick={onDismiss}>
            Dismiss
          </button>
        </span>
      </div>
      {report.substituted.length > 0 ? (
        <ul className="db-import-report-list">
          {report.substituted.map((s) => {
            const chosen = s.options.find((o) => o.name === s.to)
            return (
              <li key={s.from} className="db-import-sub">
                <span className="db-import-sub-from">{s.from}</span>
                <span aria-hidden="true">→</span>
                <strong>{s.to}</strong>
                {chosen ? (
                  <span className={`db-match db-match-${chosen.confidence}`}>
                    {CONFIDENCE_LABEL[chosen.confidence]}
                  </span>
                ) : null}

              </li>
            )
          })}
        </ul>
      ) : null}
      {report.dropped.length > 0 ? (
        <p className="muted">Couldn't find a match for: {report.dropped.join(', ')}</p>
      ) : null}
    </div>
  )
}

/** What a starter deck shows above its list: its one-line description, and
 * the stand-ins playing for cards the engine doesn't implement yet (each
 * marked in the list with an asterisk). */
function StarterIntro({
  description,
  substitutions = [],
}: {
  readonly description?: string
  readonly substitutions?: readonly PreconSubstitution[]
}) {
  return (
    <>
      {description ? <p className="db-starter-description">{description}</p> : null}
      {substitutions.length > 0 ? (
        <details className="db-substitutions" data-tour="db-stand-ins">
          <summary>
            {substitutions.length} stand-in{substitutions.length === 1 ? '' : 's'} for cards the
            engine doesn't support yet
          </summary>
          <ul>
            {substitutions.map((sub) => (
              <li key={sub.original}>
                <strong>{sub.substitute}</strong> plays as <em>{sub.original}</em>
                <span className="muted"> — {sub.reason}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  )
}
