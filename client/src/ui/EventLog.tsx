import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CardDefinition, GameEvent, ObjectId, PlayerId } from 'engine/client'
import type { SeatStatus } from 'protocol'
import { HIDDEN_CARD, describeEvent, isDetailOnlyEvent } from '../format.ts'
import { requestCards, useCardData } from '../cards/cardData.ts'
import type { SeenPrinting } from '../game/seenPrintings.ts'
import { CardTile } from './CardTile.tsx'
import { defToVisible } from './defToVisible.ts'
import { markCard, splitMarked } from './logMarks.ts'
import { OtherFace } from './OtherFace.tsx'
import { useHoverPopover } from './useHoverPopover.ts'

type CardLookup = (name: string) => CardDefinition | null | undefined

/** What to call object `id` in the line for event `seq` — the name it was
 * known by then (`publicNameAt`), so a line keeps its card's name after the
 * card goes somewhere hidden. */
export type NameAt = (id: ObjectId, seq: number, heldBy?: PlayerId) => string

/** The printing object `id` was drawn in while it was called `name`
 * (`game/seenPrintings.ts`), or `undefined` when it had none of its own or
 * this page never saw it. */
export type PrintingOf = (id: ObjectId, name: string) => SeenPrinting | undefined

export interface EventLogProps {
  readonly events: readonly GameEvent[]
  readonly nameAt: NameAt
  /** The room's seats, for the players' display names. */
  readonly seats: readonly SeatStatus[]
  /** Each named card's own printing, so its preview is the card the board
   * showed and not the name's default art. Without it, the default. */
  readonly printingOf?: PrintingOf
  /** Picks an entry: the caller points out on the board what it was about. */
  readonly onSelect?: (event: GameEvent) => void
  /** Picks one card's name in an entry: the caller points out that card,
   * not the entry's first. Without it a name's click is the entry's. */
  readonly onSelectCard?: (id: ObjectId, event: GameEvent) => void
}

/** The History panel a log name sits in: its card preview opens beside it,
 * not over the lines under the name (`useHoverPopover`'s `beside`). Module
 * level, so its identity is stable across renders. */
const besideHistory = (anchor: HTMLElement): Element | null => anchor.closest('.history-box')

/**
 * A card name in a log line (marked as it's substituted — `logMarks.ts`), which shows the whole card on hover or focus,
 * portalled out of the log's scroll box the way the board's previews are
 * (`useHoverPopover`). The definition is fetched the first time the pointer
 * reaches the name rather than for every name the log holds.
 */
function LogCardName({
  name,
  printing,
  lookup,
  onPick,
}: {
  readonly name: string
  /** The printing the game drew this card in under this name, when known:
   * the preview is that one, not the name's default. */
  readonly printing?: SeenPrinting
  readonly lookup: CardLookup
  /** A click on this name, when the log's entries can be picked. */
  readonly onPick?: () => void
}) {
  const def = lookup(name)
  // Drawn as the face the log names, which for a double-faced card can be
  // its back (`defToVisible` titles one by its front), and in the printing
  // the board showed it in: which of that printing's images the name is
  // comes with it.
  const card = def
    ? {
        ...defToVisible(def, printing?.art),
        faceName: def.name,
        ...(printing !== undefined ? { faceIsBack: printing.faceIsBack } : {}),
      }
    : null
  const { wrapRef, popoverRef, open, handlers } = useHoverPopover<HTMLElement>(def, besideHistory)
  const load = () => requestCards([name])
  return (
    <strong
      className="ev-card"
      ref={wrapRef}
      tabIndex={0}
      {...handlers}
      title={onPick ? 'Show this card' : undefined}
      onClick={
        onPick
          ? (e) => {
              // This card, not the entry's first: the line's own click
              // would point out whichever card it finds first.
              e.stopPropagation()
              onPick()
            }
          : undefined
      }
      onMouseEnter={() => {
        load()
        handlers.onMouseEnter()
      }}
      onFocus={() => {
        load()
        handlers.onFocus()
      }}
    >
      {name}
      {open && card
        ? createPortal(
            <div className="mini-tile-popover over-history" ref={popoverRef}>
              <CardTile obj={card} />
              <OtherFace obj={card} />
            </div>,
            document.body,
          )
        : null}
    </strong>
  )
}

/** One event's sentence, with its card names as hoverable bold runs. */
function EventText({
  event,
  nameAt,
  seats,
  lookup,
  printingOf,
  onSelectCard,
}: {
  readonly event: GameEvent
  readonly nameAt: NameAt
  readonly seats: readonly SeatStatus[]
  readonly lookup: CardLookup
  readonly printingOf?: PrintingOf
  readonly onSelectCard?: (id: ObjectId, event: GameEvent) => void
}) {
  // A card this seat was never shown is plain words: there's nothing to hover.
  const marked = describeEvent(
    event,
    (id, heldBy) => {
      const name = nameAt(id, event.seq, heldBy)
      return name === HIDDEN_CARD ? name : markCard(id, name)
    },
    seats,
  )
  return (
    <span className="ev-text">
      {splitMarked(marked).map((part, i) => {
        if (part.text.length === 0) return null
        if (!part.card) return <span key={i}>{part.text}</span>
        const id = part.id
        return (
          <LogCardName
            key={i}
            name={part.text}
            printing={id !== undefined ? printingOf?.(id, part.text) : undefined}
            lookup={lookup}
            onPick={onSelectCard !== undefined && id !== undefined ? () => onSelectCard(id, event) : undefined}
          />
        )
      })}
    </span>
  )
}

/**
 * The game's history. Opens **concise**: priority passing, step boundaries,
 * mana entering a pool and the lands tapping to fill it are the bulk of the
 * log by volume and none of it is what anyone opens the history to find
 * (see `isDetailOnlyEvent`). "Detailed" puts every event back for when
 * something needs actually debugging.
 *
 * The choice is per-session rather than persisted — it's a debugging mode,
 * and the useful default is the one you get on every fresh visit.
 */
export function EventLog({ events, nameAt, seats, printingOf, onSelect, onSelectCard }: EventLogProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [detailed, setDetailed] = useState(false)
  const lookup = useCardData()

  const shown = useMemo(() => {
    if (detailed) return events
    // Everything drawn before the first turn began is the opening hand and
    // whatever the mulligans redrew — up to seven lines per player before the
    // game has even started, and the `mulligan-taken` / `hand-kept` lines
    // already say what happened. Dropped by position rather than by event
    // type, so an ordinary draw on turn one still shows.
    const firstTurn = events.find((e) => e.type === 'turn-began')?.seq ?? Infinity
    return events.filter(
      (e) => !isDetailOnlyEvent(e) && !(e.type === 'card-drawn' && e.seq < firstTurn),
    )
  }, [events, detailed])

  // New lines are followed only while the reader is at the newest one (the
  // user, 2026-11-14): scrolled up to read something, the list stays where
  // it is as lines arrive below. It opens at the bottom. "At the bottom" has
  // a line's slack, so a sub-pixel scroll offset doesn't count as scrolled up.
  const following = useRef(true)
  const noteScroll = () => {
    const box = boxRef.current
    if (!box) return
    const slack = parseFloat(getComputedStyle(box).lineHeight) || box.clientHeight * 0.05
    following.current = box.scrollHeight - box.scrollTop - box.clientHeight <= slack
  }
  useLayoutEffect(() => {
    const box = boxRef.current
    if (box && following.current) box.scrollTop = box.scrollHeight
  }, [shown.length])

  return (
    <div className={detailed ? 'event-log detailed' : 'event-log'} ref={boxRef} onScroll={noteScroll}>
      <div className="event-log-head">
        <h3>Log</h3>
        <label className="event-log-toggle">
          <input
            type="checkbox"
            checked={detailed}
            onChange={(e) => setDetailed(e.target.checked)}
          />
          Detailed
        </label>
      </div>
      <ul>
        {shown.map((event) => (
          <li
            key={event.seq}
            className={`ev ev-${event.type}${onSelect ? ' selectable' : ''}`}
            onClick={onSelect ? () => onSelect(event) : undefined}
            title={onSelect ? 'Show on the board' : undefined}
          >
            {/* The event's number is for telling a bug report's lines apart:
                only the detailed view carries it. */}
            {detailed ? <span className="ev-seq">{event.seq}</span> : null}
            <EventText
              event={event}
              nameAt={nameAt}
              seats={seats}
              lookup={lookup}
              printingOf={printingOf}
              onSelectCard={onSelectCard}
            />
          </li>
        ))}
      </ul>
      {shown.length === 0 ? <p className="event-log-empty">Nothing yet.</p> : null}
    </div>
  )
}
