import { useState } from 'react'
import type { ObjectId, VisibleObject } from 'engine/client'
import { CardTile } from './CardTile.tsx'

export interface PileViewerProps {
  readonly title: string
  /** Looks up each id's face — `undefined` for one hidden from this viewer
   * (a face-down pile it didn't look at), drawn as a card back. */
  readonly resolve: (id: ObjectId) => VisibleObject | undefined
  /** The two piles' names ("Pile 1 (face down)"), in order. */
  readonly labels: readonly [string, string]
  /** Separating (rule 700.3): every card starts in the second pile, and a
   * click moves it to the other; Confirm sends both. */
  readonly separate?: {
    readonly objects: readonly ObjectId[]
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
 * Two piles of cards (rule 700.3) — Fact or Fiction's revealed cards being
 * separated, or the piles being chosen between. A forced decision, so no
 * close button, only "View board".
 */
export function PileViewer({ title, resolve, labels, separate, choose, collapsed = false, onCollapse }: PileViewerProps) {
  const [first, setFirst] = useState<readonly ObjectId[]>([])
  if (collapsed) return null

  const piles: readonly (readonly ObjectId[])[] = separate
    ? [first, separate.objects.filter((id) => !first.includes(id))]
    : (choose?.piles ?? [[], []])
  const move = (id: ObjectId) =>
    setFirst((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  return (
    <div className="zone-viewer-overlay">
      <div className="zone-viewer-box" role="dialog" aria-label={title}>
        <div className="zone-viewer-head">
          <h2>{title}</h2>
          <span className="zone-viewer-head-actions">
            {separate ? <span className="muted">click a card to move it to the other pile</span> : null}
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
