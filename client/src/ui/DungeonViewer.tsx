import type { DungeonMap as DungeonMapData } from 'engine/client'
import { DungeonMap } from './DungeonMap.tsx'
import { useEscape } from './useEscape.ts'

/** Looking at a player's dungeon (their progress chip opened it). */
interface ViewProps {
  readonly kind: 'view'
  readonly title: string
  readonly map: DungeonMapData | null
  readonly marker: number | null
  readonly completed: readonly string[]
  readonly onClose: () => void
}

/** Answering a venture: a room at a fork, on the map. */
interface RoomChoiceProps {
  readonly kind: 'room'
  readonly title: string
  readonly map: DungeonMapData
  readonly marker: number
  readonly rooms: readonly number[]
  readonly onPick: (room: number) => void
  readonly collapsed: boolean
  readonly onCollapse: () => void
}

/** Answering a venture: which dungeon to enter, the candidates side by side. */
interface DungeonChoiceProps {
  readonly kind: 'dungeon'
  readonly title: string
  readonly maps: readonly DungeonMapData[]
  readonly onPick: (dungeon: string) => void
  readonly collapsed: boolean
  readonly onCollapse: () => void
}

export type DungeonViewerProps = ViewProps | RoomChoiceProps | DungeonChoiceProps

/**
 * A dungeon in a popup (rule 309): a player's progress, read from their
 * dungeon chip, or a venture's choice (rule 701.49) — the room to move into
 * at a fork, picked on the map, or the dungeon to enter. A choice is
 * mandatory, so it has no close button, only "View board" to look first (the
 * banner brings it back), as the creature-type picker does.
 */
export function DungeonViewer(props: DungeonViewerProps) {
  useEscape(props.kind === 'view' ? props.onClose : undefined)
  if (props.kind !== 'view' && props.collapsed) return null
  return (
    <div className="zone-viewer-overlay dungeon-overlay" onClick={props.kind === 'view' ? props.onClose : undefined}>
      <div
        className={`zone-viewer-box dungeon-box${props.kind === 'dungeon' ? ' dungeon-box--wide' : ''}`}
        role="dialog"
        aria-label={props.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="zone-viewer-head">
          <h2>{props.title}</h2>
          {props.kind === 'view' ? (
            <button type="button" onClick={props.onClose}>
              Close
            </button>
          ) : (
            <button type="button" onClick={props.onCollapse}>
              View board
            </button>
          )}
        </div>
        {props.kind === 'view' ? (
          <>
            {props.map !== null ? (
              <DungeonMap map={props.map} marker={props.marker} />
            ) : (
              <p className="dungeon-empty">Not in a dungeon.</p>
            )}
            {props.completed.length > 0 ? (
              <p className="dungeon-completed">Completed: {props.completed.join(', ')}</p>
            ) : null}
          </>
        ) : props.kind === 'room' ? (
          <DungeonMap map={props.map} marker={props.marker} choices={props.rooms} onPick={props.onPick} />
        ) : (
          <div className="dungeon-choices">
            {props.maps.map((map) => (
              <div key={map.name} className="dungeon-choice">
                <button type="button" className="dungeon-choice-pick" onClick={() => props.onPick(map.name)}>
                  Enter {map.name}
                </button>
                <DungeonMap map={map} marker={null} compact />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
