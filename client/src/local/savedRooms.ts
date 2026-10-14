/**
 * Where the room worker keeps its games between page loads: one IndexedDB
 * record per room (`SavedLocalRoom`, by code), so a reload picks a local game
 * up again (`docs/plans/local-rooms.md`, step 5). Used from the worker only;
 * every call is best-effort — no IndexedDB (a locked-down browser) means a
 * reload ends the game, as before.
 */

import type { SavedLocalRoom } from 'server/dist/local-host.js'

const DB = 'mtg-local-rooms'
const STORE = 'rooms'
/** A save older than this is a game nobody came back to. */
const KEEP_MS = 24 * 60 * 60 * 1000

interface Record {
  readonly id: string
  readonly savedAt: number
  readonly room: SavedLocalRoom
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

/** Every saved game young enough to pick up; older ones are deleted. */
export async function loadSavedRooms(now: number = Date.now()): Promise<SavedLocalRoom[]> {
  try {
    const db = await open()
    const records = await new Promise<Record[]>((resolve, reject) => {
      const request = db.transaction(STORE).objectStore(STORE).getAll()
      request.onsuccess = () => resolve(request.result as Record[])
      request.onerror = () => reject(request.error)
    })
    const stale = records.filter((r) => now - r.savedAt > KEEP_MS)
    if (stale.length > 0) {
      const tx = db.transaction(STORE, 'readwrite')
      for (const r of stale) tx.objectStore(STORE).delete(r.id)
      await done(tx)
    }
    db.close()
    return records.filter((r) => now - r.savedAt <= KEEP_MS).map((r) => r.room)
  } catch {
    return []
  }
}

/** Writes `rooms` and deletes the saves of `ended` (games over, or gone). */
export async function saveRooms(rooms: readonly SavedLocalRoom[], ended: readonly string[]): Promise<void> {
  try {
    const db = await open()
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const savedAt = Date.now()
    for (const room of rooms) store.put({ id: room.id, savedAt, room } satisfies Record)
    for (const id of ended) store.delete(id)
    await done(tx)
    db.close()
  } catch {
    // Best-effort: the game goes on; only a reload would lose it.
  }
}
