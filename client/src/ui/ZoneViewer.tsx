import { useEffect, useState } from 'react'
import { useEscape } from './useEscape.ts'
import type { ObjectId, VisibleObject } from 'engine/client'
import { CardTile } from './CardTile.tsx'
import { Symbols } from './Symbols.tsx'
import { otherFaceOf } from './otherFace.ts'
import { requestCards, useCardData } from '../cards/cardData.ts'
import { StableLabel } from './StableLabel.tsx'
import { clickFolded, foldSearch } from './zoneFold.ts'

/** Where a card in a zone-spanning choice is, under its tile. */
const ZONE_CAPTION: Partial<Record<VisibleObject['zone'], string>> = {
  // A search of an opponent's hand (Memoricide) as well as your own (a
  // behold): the title says whose.
  hand: 'In a hand',
  battlefield: 'On the battlefield',
  graveyard: 'In a graveyard',
  exile: 'In exile',
  library: 'In a library',
}

export interface ZoneViewerProps {
  readonly title: string
  readonly ids: readonly ObjectId[]
  /** Looks up each id's full face — `undefined` for one that's hidden from
   * this viewer (e.g. an opponent's unrevealed hand card), which renders as
   * a face-down placeholder instead of being silently dropped. */
  readonly resolve: (id: ObjectId) => VisibleObject | undefined
  /** Read-only mode (graveyard/exile browsing): omit `selection` and pass this. */
  readonly onClose?: () => void
  /** Cards in this zone that can be cast from here (Phase 6 flashback) — each
   * gets a "Cast" button. Ignored in `selection` mode. */
  readonly castable?: {
    readonly ids: readonly ObjectId[]
    readonly label: (id: ObjectId) => string
    readonly onCast: (id: ObjectId) => void
    /** When a card can be played from here more than one way (Muldrotha
     * offering an artifact creature as either type, a modal double-faced
     * card's two faces), a button per way, in place of the single one —
     * the choice stays explicit, so a bare click on the card does nothing.
     * `ownButton`: so even when it's the only way, as a cast that sacrifices a
     * permanent must be. */
    readonly variants?: (id: ObjectId) => readonly { label: string; ownButton?: boolean; onChoose: () => void }[]
  }
  /** Turns this into a forced "choose between min and max of these" decision
   * (a `choose-from-zone` effect, e.g. looking at the top of your library) —
   * no close button, just a pick-then-confirm footer. */
  readonly selection?: {
    readonly min: number
    readonly max: number
    /** The subset of `cards` that can actually be picked — narrower than
     * `cards` when the effect restricts the choice (e.g. only a Dragon
     * card). Everything in `cards` still renders at full size either way;
     * this only decides which tiles respond to a click. */
    readonly eligible: readonly ObjectId[]
    readonly onConfirm: (chosen: readonly ObjectId[]) => void
    /** For a choice that can be backed out of — a cost being picked for a
     * cast not yet made (escape's "exile N other cards"), unlike an effect's
     * forced decision: a Cancel button in the header, which calls this. */
    readonly onCancel?: () => void
    /** The confirm button's label with nothing picked, when `min` is 0 —
     * "Put none" unless the choice says otherwise (an optional target's
     * "Skip"). */
    readonly noneLabel?: string
    /** The order picked is the answer (Ponder's "put them back in any
     * order"): each picked card shows its place, 1 first. */
    readonly ordered?: boolean
    /** A rule over the picks as a set (Myriad Landscape's "that share a
     * land type"): Confirm waits until the picks obey it. */
    readonly fits?: (picked: readonly ObjectId[]) => boolean
    /** The rule is pairwise ("with different powers"): a click takes the pick
     * off whatever it can't sit beside. */
    readonly swaps?: boolean
    /** The rule is met only by the whole set ("one card of each color"), so
     * this says whether picks can still become it; `fits` waits for the set. */
    readonly sits?: (picked: readonly ObjectId[]) => boolean
    /** The answer isn't a card at all, only informed by these (a hand looked
     * at before a card type is chosen — Arachne, Psionic Weaver): a button per
     * answer in the footer, in place of Confirm. */
    readonly answers?: readonly { readonly label: string; readonly onChoose: () => void }[]
    /** The cards' order means nothing (a library search's finds, shuffled
     * away afterwards): they're sorted, and identical ones are one tile with
     * a count (`zoneFold.ts`). Never with `ordered`. */
    readonly unordered?: boolean
  }
  /** Selection mode only: hidden so the board can be seen ("View board").
   * The component stays mounted, so picks made so far survive; the owner
   * renders the way back (the decision strip's "Show choices"). */
  readonly collapsed?: boolean
  readonly onCollapse?: () => void
  /** A caption under each card, where the zone's own isn't enough — whose
   * library a card is in when several are searched at once (Jace, Architect
   * of Thought's −8). Shown in place of the zone caption. */
  readonly captionOf?: (id: ObjectId) => string | undefined
}

/**
 * A look at a set of cards — read-only for browsing a whole zone (graveyard/
 * exile today), or selectable for a bounded "choose from these" decision
 * (library-look/graveyard-search effects), so both share one component.
 *
 * A selection is a forced decision, so it has no close button — but it can be
 * collapsed ("View board") to check the board before choosing, the same
 * escape hatch `CreatureTypePicker` has. The exception is a cost being picked
 * for a cast (escape's exile), which `selection.onCancel` lets you back out of.
 */
export function ZoneViewer({
  title,
  ids,
  resolve,
  onClose,
  selection,
  castable,
  collapsed = false,
  onCollapse,
  captionOf,
}: ZoneViewerProps) {
  const [picked, setPicked] = useState<readonly ObjectId[]>([])
  // Double-faced cards turned over to their other face, for reading it —
  // purely a view: casting or picking still acts on the card itself.
  const [flipped, setFlipped] = useState<ReadonlySet<ObjectId>>(() => new Set())
  const toggleFlip = (id: ObjectId) =>
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // Both faces of every double-faced card shown, for its turn-over button:
  // fetched as the viewer opens, from the shards those names are in
  // (`cards/cardData.ts`). Keyed by the names, not the array, so a re-render
  // showing the same cards doesn't ask again.
  const lookup = useCardData()
  const faceNames = ids
    .flatMap((id) => {
      const faces = resolve(id)?.faces
      return faces && faces.length > 1 ? faces : []
    })
    .join('\n')
  useEffect(() => {
    if (faceNames.length > 0) requestCards(faceNames.split('\n'))
  }, [faceNames])

  /** The picks with `id` added, or as they were when it can't be. */
  const add = (cur: readonly ObjectId[], id: ObjectId): readonly ObjectId[] => {
    if (!selection) return cur
    // "With different powers": a click swaps out the pick it can't sit beside.
    const sits = selection.sits ?? selection.fits
    let kept = selection.swaps === true ? cur.filter((x) => sits?.([x, id]) ?? true) : cur
    // One of each: the oldest pick gives way to one that can't join them all.
    if (selection.sits !== undefined) {
      while (kept.length > 0 && !selection.sits([...kept, id])) kept = kept.slice(1)
    }
    // A choice of one card: a click on another moves the pick to it, rather
    // than doing nothing until the first is clicked off.
    if (kept.length >= selection.max) return selection.max === 1 ? [id] : cur
    return [...kept, id]
  }
  /** A click on a tile: `members` is the one card it shows, or every identical
   * card a folded tile stands for (`clickFolded` has the rule). */
  const toggle = (members: readonly ObjectId[]) => {
    if (!selection || !members.every((id) => selection.eligible.includes(id))) return
    setPicked((cur) => clickFolded(cur, members, add))
  }

  const canConfirm =
    selection !== undefined &&
    picked.length >= selection.min &&
    picked.length <= selection.max &&
    (selection.fits?.(picked) ?? true)

  // Escape closes a viewer that's only for looking, or cancels a choice that
  // can be cancelled; a choice that must be made stays.
  useEscape(selection ? (collapsed ? undefined : selection.onCancel) : onClose)

  if (selection && collapsed) return null

  // A choice spanning zones (behold: a card in your hand or a permanent you
  // control) says where each one is, or two copies of a card look alike.
  const mixedZones = new Set(ids.map((id) => resolve(id)?.zone).filter((z) => z !== undefined)).size > 1

  // One tile per card, or, for a search's finds, per set of identical cards.
  const tiles: readonly (readonly ObjectId[])[] =
    selection?.unordered === true && selection.ordered !== true
      ? foldSearch(ids, resolve, selection.eligible)
      : ids.map((id) => [id])

  return (
    <div className="zone-viewer-overlay" onClick={selection ? undefined : onClose}>
      <div
        className="zone-viewer-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="zone-viewer-head">
          <h2>
            {title} ({ids.length})
          </h2>
          {selection ? (
            <span className="zone-viewer-head-actions">
              {/* Nothing to pick (a look at a hand): no count to show. */}
              {selection.max > 0 ? (
                <span className="muted">
                  choose {selection.min === selection.max
                    ? selection.min
                    : `${selection.min}-${selection.max}`}
                  {' '}
                  ({picked.length} picked)
                </span>
              ) : null}
              {onCollapse ? (
                <button type="button" onClick={onCollapse}>
                  View board
                </button>
              ) : null}
              {selection.onCancel ? (
                <button type="button" onClick={selection.onCancel}>
                  Cancel
                </button>
              ) : null}
            </span>
          ) : (
            <button type="button" onClick={onClose}>
              Close
            </button>
          )}
        </div>
        <div className="zone-viewer-cards">
          {tiles.map((members) => {
            const id = members[0]!
            const obj = resolve(id)
            if (!obj) {
              // A face-down card in exile a choice may still take — a
              // processor's, by its group, at random (the engine's
              // `faceDownGroups`): picked as its back.
              if (selection && selection.eligible.includes(id)) {
                const isPicked = picked.includes(id)
                return (
                  <div key={id} className="zone-viewer-card">
                    <button
                      type="button"
                      className={`card-back zv-hidden-pick${isPicked ? ' picked' : ''}`}
                      title="face-down card — one of its group is taken at random"
                      aria-pressed={isPicked}
                      onClick={() => toggle(members)}
                    >
                      {isPicked ? '✓ Picked' : 'Face down'}
                    </button>
                  </div>
                )
              }
              return <div key={id} className="card-back" title="face-down card" />
            }
            const isEligible = !selection || selection.eligible.includes(obj.id)
            // How many of the tile's cards are picked: one card's 0 or 1, or a
            // folded tile's count.
            const pickedHere = members.filter((member) => picked.includes(member)).length
            const isPicked = pickedHere > 0
            const castHere =
              !selection && castable && castable.ids.includes(obj.id) ? castable : null
            const variants = castHere?.variants?.(obj.id) ?? []
            const waysHaveButtons = variants.length > 1 || variants.some((v) => v.ownButton === true)
            const other = otherFaceOf(obj, lookup)
            const showOther = other !== null && flipped.has(obj.id)
            return (
              // `data-zone-card`: a History entry about it points it out here
              // (`ui/highlight.ts`).
              <div key={obj.id} className="zone-viewer-card" data-zone-card={obj.id}>
                <CardTile
                  obj={showOther ? other : obj}
                  selected={isPicked}
                  highlight={(Boolean(selection) && isEligible && !isPicked) || Boolean(castHere)}
                  dimmed={Boolean(selection) && !isEligible}
                  badge={
                    selection?.ordered === true && isPicked
                      ? `${picked.indexOf(obj.id) + 1}`
                      : members.length > 1
                      ? // A folded tile: how many it stands for, and how many
                        // of them are picked.
                        isPicked
                        ? `✓ ${pickedHere} of ${members.length}`
                        : `×${members.length}`
                      : isPicked
                      ? '✓ Picked'
                      : obj.suspended
                      ? `⏳${obj.counters.time ?? 0}`
                      : obj.foretold
                        ? 'Foretold'
                        : obj.plotted
                          ? 'Plotted'
                          : undefined
                  }
                  onClick={
                    selection && isEligible
                      ? () => toggle(members)
                      : castHere && !waysHaveButtons
                        ? () => castHere.onCast(obj.id)
                        : undefined
                  }
                />
                {captionOf?.(obj.id) !== undefined ? (
                  <span className="zv-zone">{captionOf(obj.id)}</span>
                ) : mixedZones ? (
                  <span className="zv-zone">{ZONE_CAPTION[obj.zone] ?? obj.zone}</span>
                ) : null}
                {other ? (
                  <button
                    type="button"
                    className="zv-flip"
                    title={`Turn over — ${showOther ? (obj.faceName ?? obj.cardName) : other.cardName}`}
                    aria-label="Turn this card over"
                    onClick={() => toggleFlip(obj.id)}
                  >
                    ⇄
                  </button>
                ) : null}
                {castHere && waysHaveButtons
                  ? variants.map((v, i) => (
                      <button key={i} type="button" onClick={v.onChoose}>
                        {/* A way to cast can name its cost ("Cast kicked {R}"). */}
                        <Symbols text={v.label} />
                      </button>
                    ))
                  : null}
                {castHere && !waysHaveButtons ? (
                  <button type="button" onClick={() => castHere.onCast(obj.id)}>
                    <Symbols text={castHere.label(obj.id)} />
                  </button>
                ) : null}
              </div>
            )
          })}
          {ids.length === 0 ? <span className="muted">empty</span> : null}
        </div>
        {selection?.answers ? (
          <div className="zone-viewer-footer">
            {selection.answers.map((answer) => (
              <button key={answer.label} type="button" onClick={answer.onChoose}>
                {answer.label}
              </button>
            ))}
          </div>
        ) : selection ? (
          <div className="zone-viewer-footer">
            <button
              type="button"
              // With cards picked, confirming is the next thing to do: the
              // page's primary button, not one more plain control in a corner.
              className={picked.length > 0 ? 'primary' : undefined}
              disabled={!canConfirm}
              onClick={() => selection.onConfirm(picked)}
            >
              <StableLabel
                widest={[
                  ...(selection.min === 0 ? [selection.noneLabel ?? 'Put none'] : []),
                  `Confirm (${Math.min(selection.max, ids.length)})`,
                ]}
              >
                {picked.length === 0 && selection.min === 0
                  ? (selection.noneLabel ?? 'Put none')
                  : `Confirm (${picked.length})`}
              </StableLabel>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
