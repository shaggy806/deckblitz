import { useEffect, useState } from 'react'
import type { Color } from 'engine/client'
import type { CommanderCandidate, WireDeck } from 'protocol'
import type { NetworkGame } from '../net/useNetworkGame.ts'
import { CommanderPicker } from '../deck-builder/CommanderPicker.tsx'
import { CommanderColorAsk } from '../deck-builder/CommanderColorAsk.tsx'
import { importDecklist, looksLikeDecklist, resolveImport } from '../deck-builder/importDeck.ts'
import type { ImportProgress } from '../deck-builder/importDeck.ts'

type Phase =
  | { readonly kind: 'idle' }
  /** The clipboard couldn't be read, or held no list: a box to paste into. */
  | { readonly kind: 'paste'; readonly note: string }
  | { readonly kind: 'importing'; readonly progress: ImportProgress | null }
  /** The list didn't say which card is its commander, and more than one
   * could be: asked (`CommanderPicker`), then imported again with the answer. */
  | { readonly kind: 'choosing'; readonly text: string; readonly candidates: readonly CommanderCandidate[] }
  /** Its commander chooses its colour as the deck is built (rule 903.4b —
   * Clara Oswald, The Prismatic Piper) and the list's cards don't settle
   * which: asked (`ChosenColorPicker`), then the game starts. */
  | {
      readonly kind: 'colour'
      readonly deck: WireDeck
      readonly report: BlitzReport
      readonly open: readonly string[]
      readonly chosen: Readonly<Record<string, Color>>
    }

/** What `NetworkGame.blitz` is told about the import, beside the deck. */
type BlitzReport = Parameters<NetworkGame['blitz']>[1]

/**
 * Blitzing — goldfishing against bots. One button at the foot of the landing
 * page, no explanation beyond its label: the decklist on the clipboard, run
 * through the deck import (an unimplemented card swapped for its stand-in,
 * one with none dropped) and played at once, nothing saved,
 * against three bots on random starter decks (`NetworkGame.blitz`), with no
 * seat board in between.
 *
 * The clipboard is read on the click itself, which is what lets a browser
 * allow it. Where it won't (a refused permission, an older browser), or the
 * clipboard holds no "N Card Name" line, a box opens to paste the list into
 * instead, so the button never just does nothing.
 */
/** A Commander deck's size, commander included (rule 903.5a). */
const COMMANDER_DECK_SIZE = 100

export function BlitzPanel({ game }: { readonly game: NetworkGame }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [pasted, setPasted] = useState('')
  const [error, setError] = useState<string | null>(null)

  const busy = phase.kind === 'importing' || game.blitzing
  // The paste box on the page: open, or folding away (`closing`) with the
  // note it had. It unfolds into its space and folds out of it rather than
  // popping (the user, 2026-11-14), so it outlives the phase that asked for it
  // by one animation. State adjusted while rendering, not in an effect, so
  // no frame shows the box without its class.
  const [box, setBox] = useState<{ readonly note: string; readonly closing: boolean } | null>(null)
  const note = phase.kind === 'paste' && !busy ? phase.note : null
  if (note !== null && (box === null || box.closing || box.note !== note)) setBox({ note, closing: false })
  else if (note === null && box !== null && !box.closing) setBox({ note: box.note, closing: true })
  // The fold's end drops the box (`onAnimationEnd` below); so does a timer,
  // for a page whose animations aren't running (a tab in the background).
  const closing = box?.closing === true
  useEffect(() => {
    if (!closing) return
    const timer = window.setTimeout(() => setBox((b) => (b?.closing === true ? null : b)), 400)
    return () => window.clearTimeout(timer)
  }, [closing])
  // Indeterminate before the server's first progress line, and once the
  // list is read and the room is being set up.
  const progressPct =
    phase.kind === 'importing' && phase.progress !== null && phase.progress.total > 0
      ? Math.round((phase.progress.done / phase.progress.total) * 100)
      : null

  const run = (text: string, commanders?: readonly string[]) => {
    setError(null)
    setPhase({ kind: 'importing', progress: null })
    importDecklist(text, (progress) => setPhase({ kind: 'importing', progress }), commanders)
      .then(({ cards, format, attractions }) => {
        // Its commander is a guess: ask, and read the list again with the
        // answer (the stand-ins are chosen for the commander's colours).
        const candidates = commanders === undefined ? (format?.commanderCandidates ?? []) : []
        if (candidates.length > 1) {
          setPhase({ kind: 'choosing', text, candidates })
          return
        }
        const resolved = resolveImport(cards, format, [], attractions)
        if (resolved.commanders.length === 0) {
          throw new Error(
            'No commander found in that list. Put it under a "Commander" heading, or on its own at the end.',
          )
        }
        if (resolved.cards.length === 0) throw new Error('None of the cards in that list could be played.')
        // Nothing is saved here: the result screen offers to keep the deck.
        const size = resolved.cards.length + resolved.commanders.length
        const chosen = format?.commanderColors ?? {}
        const deck: WireDeck = {
          cards: resolved.cards,
          commanders: resolved.commanders,
          ...(Object.keys(chosen).length > 0 ? { commanderColors: chosen } : {}),
          name: resolved.name,
          ...(Object.keys(resolved.printings).length > 0 ? { printings: resolved.printings } : {}),
          ...(resolved.attractions.length > 0 ? { attractions: resolved.attractions } : {}),
        }
        const report: BlitzReport = {
          deckName: resolved.name,
          substituted: resolved.report.substituted.map(({ from, to }) => ({ from, to })),
          dropped: resolved.report.dropped,
          ...(size < COMMANDER_DECK_SIZE ? { short: size } : {}),
        }
        const open = format?.commanderColorOpen ?? []
        if (open.length > 0) {
          setPhase({ kind: 'colour', deck, report, open, chosen })
          return
        }
        start(deck, report)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
        setPhase({ kind: 'paste', note: 'Fix the list and try again, or paste a different one.' })
        setPasted(text)
      })
  }

  const start = (deck: WireDeck, report: BlitzReport) => {
    game.blitz(deck, report)
    setPhase({ kind: 'idle' })
    setPasted('')
  }

  const fromClipboard = () => {
    setError(null)
    navigator.clipboard
      .readText()
      .then((text) => {
        if (looksLikeDecklist(text)) run(text)
        else setPhase({ kind: 'paste', note: "Your clipboard doesn't hold a decklist. Paste one here." })
      })
      .catch(() =>
        setPhase({ kind: 'paste', note: "Your browser didn't let the page read the clipboard. Paste the list here." }),
      )
  }

  return (
    <section className="landing-blitz" aria-label="Blitz a deck">
      <button
        type="button"
        className="landing-cta landing-blitz-btn"
        data-tour="landing-blitz"
        onClick={fromClipboard}
        disabled={busy || phase.kind === 'choosing' || phase.kind === 'colour'}
      >
        Have a deck copied? Click here to blitz!
      </button>

      {box !== null ? (
        <div
          className={`landing-blitz-reveal${box.closing ? ' closing' : ''}`}
          inert={box.closing}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget && box.closing) setBox(null)
          }}
        >
        <form
          className="landing-blitz-paste"
          onSubmit={(e) => {
            e.preventDefault()
            if (pasted.trim() !== '') run(pasted)
          }}
        >
          <label className="landing-field-label" htmlFor="landing-blitz-list">
            {box.note}
          </label>
          <textarea
            id="landing-blitz-list"
            className="landing-blitz-textarea"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={6}
            placeholder={'1 Ureni of the Unwritten\n1 Sol Ring\n1 Command Tower\n...'}
            spellCheck={false}
            autoFocus
          />
          <div className="landing-blitz-paste-row">
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setPhase({ kind: 'idle' })
                setError(null)
              }}
            >
              Cancel
            </button>
            <button type="submit" className="landing-join-btn" disabled={pasted.trim() === ''}>
              Blitz
            </button>
          </div>
        </form>
        </div>
      ) : null}

      {busy ? (
        <div className="landing-blitz-progress" aria-hidden="true">
          <div
            className={`landing-blitz-progress-fill${progressPct === null ? ' indeterminate' : ''}`}
            style={progressPct === null ? undefined : { width: `${progressPct}%` }}
          />
        </div>
      ) : null}
      {busy ? (
        <p className="landing-blitz-status" role="status">
          {game.blitzing
            ? 'Shuffling up against three bots…'
            : phase.kind === 'importing' && phase.progress !== null
              ? `Reading your list: ${phase.progress.done} of ${phase.progress.total} cards`
              : 'Reading your list…'}
        </p>
      ) : null}
      {phase.kind === 'choosing' ? (
        <CommanderPicker
          candidates={phase.candidates}
          onPick={(picked) => run(phase.text, picked)}
          onCancel={() => setPhase({ kind: 'idle' })}
        />
      ) : null}
      {phase.kind === 'colour' ? (
        <CommanderColorAsk
          open={phase.open}
          settled={phase.chosen}
          onDone={(colors) => start({ ...phase.deck, commanderColors: colors }, phase.report)}
          onCancel={() => setPhase({ kind: 'idle' })}
        />
      ) : null}
      {error !== null ? (
        <p className="landing-blitz-error" role="alert">
          ⚠ {error}
        </p>
      ) : null}
    </section>
  )
}
