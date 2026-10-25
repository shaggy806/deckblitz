/**
 * The dev-rooms server's preloaded boards (`server/scripts/dev-rooms.mjs`),
 * as the landing page's dev menu lists them. Read from dev-rooms' command
 * port through the Vite dev server's `/__dev-rooms` proxy (`vite.config.ts`),
 * so a dev build only: the public site has neither the proxy nor the rooms.
 */

/** One room as dev-rooms' `list` op reports it. */
export interface DevRoom {
  readonly code: string
  /** The scenario's own description, starting "2p." or "4p.". */
  readonly about: string
  readonly players: readonly string[]
  readonly bots: readonly string[]
  /** Where its game stands now, e.g. "turn 3, declare-blockers". */
  readonly step: string
}

/** Where the Vite dev server forwards dev-rooms' commands. */
export const DEV_ROOMS_PATH = '/__dev-rooms'

/** Sends one command to dev-rooms' command port; throws if it isn't running. */
async function devRoomsCommand(command: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(DEV_ROOMS_PATH, { method: 'POST', body: JSON.stringify(command) })
  if (!response.ok) throw new Error(`dev-rooms answered ${response.status}`)
  return response.json()
}

/** Every room dev-rooms serves, in its scenario order. */
export async function listDevRooms(): Promise<DevRoom[]> {
  const listed = (await devRoomsCommand({ op: 'list' })) as Record<string, Omit<DevRoom, 'code'>> | null
  if (listed === null || typeof listed !== 'object') throw new Error('dev-rooms sent no room list')
  return Object.entries(listed).map(([code, room]) => ({ ...room, code }))
}

/** Rebuilds a room from its scenario (dev-rooms' `reset`). */
export async function resetDevRoom(code: string): Promise<void> {
  await devRoomsCommand({ op: 'reset', room: code })
}

/**
 * The rooms a filter box's text keeps: every word must appear in the code or
 * the description, case aside, so "4p lure" finds the four-player Lure board.
 */
export function filterDevRooms(rooms: readonly DevRoom[], query: string): DevRoom[] {
  const words = query.toLowerCase().split(/\s+/).filter((word) => word !== '')
  return rooms.filter((room) => {
    const haystack = `${room.code} ${room.about}`.toLowerCase()
    return words.every((word) => haystack.includes(word))
  })
}
