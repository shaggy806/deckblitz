import type { DungeonMap } from 'engine/client'

/** Each room's depth: one more than the deepest room with an arrow into it
 * (rooms are listed topmost first, every arrow pointing down). */
export function depths(map: DungeonMap): number[] {
  const depth = map.rooms.map(() => 0)
  map.rooms.forEach((room, i) => {
    for (const next of room.next) depth[next] = Math.max(depth[next], depth[i] + 1)
  })
  return depth
}

/** How far down a dungeon a room is, and how many rows it has — the player
 * panel's "Undercity 3/5". */
export function dungeonProgress(map: DungeonMap, room: number): { readonly at: number; readonly of: number } {
  const depth = depths(map)
  return { at: depth[room] + 1, of: Math.max(...depth) + 1 }
}
