import { useState } from 'react'
import type { ObjectId, VisibleObject } from 'engine/client'
import { CardTile } from './CardTile.tsx'

export interface PileViewerProps {
  readonly title: string
  /** Looks up each id's face — `undefined` for one hidden from this viewer
   * (a face-down pile it didn't look at), drawn as a card back. */
  readonly resolve: (id: ObjectId) => VisibleObject | undefined
  /** The piles' names ("Pile 1 (face down)"), in order. */
  readonly labels: readonly string[]
  /** Separating (rule 700.3): every card starts in the last pile, and a
   * click moves it on to the next (from the last, back to the first) — with
   * two piles, to the other; Confirm sends them all. `count` piles, two when
   * absent. */
  readonly separate?: {
    readonly objects: readonly ObjectId[]
    readonly count?: number
    readonly onConfirm: (piles: readonly (readonly ObjectId[])[]) => void
  }
  /** Choosing: a button under each pile. */
  readonly choose?: {
    readonly piles: readonly (readonly ObjectId[])[]
    readonly onChoose: (pile: number) => void
  }
  /** Hidden so the board can be seen; the owner renders the way back. */
  readonly collapsed?: boolean
  readonly onCollapse?: () => void
}

/**
 * Piles of cards (rule 700.3) — Fact or Fiction's revealed cards being
 * separated, or the piles being chosen between. A forced decision, so no
 * close button, only "View board".
 */
export function PileViewer({ title, resolve, labels, separate, choose, collapsed = false, onCollapse }: PileViewerProps) {
  // Each card's pile while separating; a card not in it is in the last.
  const [pileOf, setPileOf] = useState<Readonly<Record<ObjectId, number>>>({})
  if (collapsed) return null

  const count = Math.max(2, separate?.count ?? 2)
  const last = count - 1
  const piles: readonly (readonly ObjectId[])[] = separate
    ? Array.from({ length: count }, (_, k) => separate.objects.filter((id) => (pileOf[id] ?? last) === k))
    : (choose?.piles ?? [[], []])
  const move = (id: ObjectId) =>
    setPileOf((cur) => {
      const next = ((cur[id] ?? last) + 1) % count
      const rest = { ...cur }
      delete rest[id]
      return next === last ? rest : { ...rest, [id]: next }
    })

  return (
    <div className="zone-viewer-overlay">
      <div className="zone-viewer-box" role="dialog" aria-label={title}>
        <div className="zone-viewer-head">
          <h2>{title}</h2>
          <span className="zone-viewer-head-actions">
            {separate ? (
              <span className="muted">
                click a card to move it to the {count === 2 ? 'other' : 'next'} pile
              </span>
            ) : null}
            {onCollapse ? (
              <button type="button" onClick={onCollapse}>
                View board
              </button>
            ) : null}
          </span>
        </div>
        {piles.map((pile, i) => (
          <div key={i} className="pile-section" data-pile={i}>
            <div className="pile-head">
              <strong>{labels[i]}</strong>
              <span className="muted">
                {' '}
                ({pile.length} {pile.length === 1 ? 'card' : 'cards'})
              </span>
              {choose ? (
                <button type="button" onClick={() => choose.onChoose(i)}>
                  Choose {labels[i].split(' (')[0].toLowerCase()}
                </button>
              ) : null}
            </div>
            <div className="zone-viewer-cards">
              {pile.map((id) => {
                const obj = resolve(id)
                if (!obj) return <div key={id} className="card-back" title="face-down card" />
                return (
                  <div key={id} className="zone-viewer-card">
                    <CardTile
                      obj={obj}
                      highlight={Boolean(separate)}
                      onClick={separate ? () => move(id) : undefined}
                    />
                  </div>
                )
              })}
              {pile.length === 0 ? <span className="muted">empty</span> : null}
            </div>
          </div>
        ))}
        {separate ? (
          <div className="zone-viewer-footer">
            <button type="button" onClick={() => separate.onConfirm(piles)}>
              Confirm piles
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
