import type { DungeonMap as DungeonMapData } from 'engine/client'
import { depths } from './dungeon.ts'
import { Symbols } from './Symbols.tsx'

export interface DungeonMapProps {
  readonly map: DungeonMapData
  /** The room the venture marker is on, or `null` (a dungeon not entered —
   * the candidates when choosing which to enter). */
  readonly marker: number | null
  /** Rooms that can be clicked to choose them (a fork's candidates); the
   * rest are drawn but inert. */
  readonly choices?: readonly number[]
  readonly onPick?: (room: number) => void
  /** Smaller, for the three side by side when choosing a dungeon. */
  readonly compact?: boolean
}

/**
 * A dungeon drawn as the card is (rule 309.4): rooms top to bottom, arrows
 * from each to the rooms it leads to. Each room shows its name and what it
 * does; the venture marker's room is outlined, the rooms it can move to next
 * are marked, and at a fork the candidates are buttons.
 *
 * Laid out in percentages of the box — rooms evenly spaced across their row,
 * the arrows one SVG beneath them — so it scales with the viewport and needs
 * no measuring.
 */
export function DungeonMap({ map, marker, choices = [], onPick, compact = false }: DungeonMapProps) {
  const depth = depths(map)
  const rows = Math.max(...depth) + 1
  const byRow: number[][] = Array.from({ length: rows }, () => [])
  depth.forEach((d, i) => byRow[d].push(i))
  const widest = Math.max(...byRow.map((r) => r.length))
  // Centre of each room, in percent of the map box.
  const at = map.rooms.map((_, i) => {
    const row = byRow[depth[i]]
    return { x: ((row.indexOf(i) + 0.5) / row.length) * 100, y: ((depth[i] + 0.5) / rows) * 100 }
  })
  // A room's half-height in percent: rooms fill most of their row — more of
  // a compact one, whose rows are short, so a name and two lines still fit.
  const halfH = (100 / rows) * (compact ? 0.42 : 0.38)
  const next = new Set(marker === null ? [] : map.rooms[marker].next)
  const pickable = new Set(choices)

  return (
    <div
      className={`dungeon-map${compact ? ' dungeon-map--compact' : ''}`}
      style={{ ['--dm-rows' as string]: rows, ['--dm-cols' as string]: widest }}
    >
      <svg className="dungeon-map-arrows" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {map.rooms.flatMap((room, i) =>
          room.next.map((n) => (
            <line
              key={`${i}-${n}`}
              x1={at[i].x}
              y1={at[i].y + halfH}
              x2={at[n].x}
              y2={at[n].y - halfH}
              className={marker === i ? 'dungeon-map-arrow dungeon-map-arrow--live' : 'dungeon-map-arrow'}
              vectorEffect="non-scaling-stroke"
            />
          )),
        )}
      </svg>
      {map.rooms.map((room, i) => {
        const classes = [
          'dungeon-room',
          marker === i ? 'dungeon-room--here' : '',
          next.has(i) ? 'dungeon-room--next' : '',
          pickable.has(i) ? 'dungeon-room--pick' : '',
        ]
          .filter(Boolean)
          .join(' ')
        const body = (
          <>
            <span className="dungeon-room-name">
              {marker === i ? <span className="dungeon-room-marker" aria-label="venture marker">◆ </span> : null}
              {room.name}
            </span>
            <span className="dungeon-room-text">
              <Symbols text={room.text} />
            </span>
          </>
        )
        const style = {
          left: `${at[i].x}%`,
          top: `${at[i].y}%`,
          width: `${(100 / byRow[depth[i]].length) * 0.9}%`,
          height: `${halfH * 2}%`,
        }
        return pickable.has(i) && onPick !== undefined ? (
          <button key={i} type="button" className={classes} style={style} title={room.text} onClick={() => onPick(i)}>
            {body}
          </button>
        ) : (
          <div key={i} className={classes} style={style} title={room.text}>
            {body}
          </div>
        )
      })}
    </div>
  )
}
