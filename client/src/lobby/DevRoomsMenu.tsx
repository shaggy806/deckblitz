import { useCallback, useEffect, useState } from 'react'
import { filterDevRooms, listDevRooms, resetDevRoom } from './devRooms.ts'
import type { DevRoom } from './devRooms.ts'

type Listing =
  | { readonly kind: 'loading' }
  | { readonly kind: 'down' }
  | { readonly kind: 'up'; readonly rooms: readonly DevRoom[] }

/**
 * The landing page's dev-only menu of dev-rooms' boards (`devRooms.ts`),
 * fixed down the right side beside the column: a click opens a room, the ↺
 * beside it rebuilds the board from its scenario first. With the real server
 * running instead of dev-rooms there is nothing to list, so it says how to
 * start dev-rooms rather than going blank.
 */
export function DevRoomsMenu() {
  const [listing, setListing] = useState<Listing>({ kind: 'loading' })
  const [query, setQuery] = useState('')
  const [resetting, setResetting] = useState<string | null>(null)

  const refresh = useCallback(() => {
    listDevRooms().then(
      (rooms) => setListing({ kind: 'up', rooms }),
      () => setListing({ kind: 'down' }),
    )
  }, [])
  useEffect(refresh, [refresh])

  const open = (code: string) => {
    window.location.assign(`/?room=${encodeURIComponent(code)}`)
  }
  const resetAndOpen = (code: string) => {
    setResetting(code)
    resetDevRoom(code).then(
      () => open(code),
      () => {
        setResetting(null)
        refresh()
      },
    )
  }

  const shown = listing.kind === 'up' ? filterDevRooms(listing.rooms, query) : []

  return (
    <aside className="dev-rooms" aria-label="Test rooms">
      <header className="dev-rooms-head">
        <h2>Test rooms</h2>
        <button type="button" className="dev-rooms-refresh" onClick={refresh} title="Reload the list">
          ↻
        </button>
      </header>
      {listing.kind === 'loading' ? <p className="dev-rooms-note">Looking for dev-rooms…</p> : null}
      {listing.kind === 'down' ? (
        <p className="dev-rooms-note">
          dev-rooms isn't running. Start it in place of the room server with{' '}
          <code>npm run dev-rooms -w server</code>, then ↻.
        </p>
      ) : null}
      {listing.kind === 'up' ? (
        <>
          <input
            className="dev-rooms-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${listing.rooms.length} rooms`}
            aria-label="Filter the test rooms"
            spellCheck={false}
          />
          <ul className="dev-rooms-list">
            {shown.map((room) => (
              <li key={room.code} className="dev-rooms-item">
                <button
                  type="button"
                  className="dev-rooms-open"
                  onClick={() => open(room.code)}
                  title={`${room.about}\n\nNow: ${room.step}`}
                >
                  <span className="dev-rooms-code">
                    {room.code}
                    <span className="dev-rooms-seats">{room.players.length}p</span>
                  </span>
                  <span className="dev-rooms-about">{room.about.replace(/^\d+p\.\s*/, '')}</span>
                </button>
                <button
                  type="button"
                  className="dev-rooms-reset"
                  onClick={() => resetAndOpen(room.code)}
                  disabled={resetting !== null}
                  title="Reset the board to its scenario, then open it"
                  aria-label={`Reset and open ${room.code}`}
                >
                  ↺
                </button>
              </li>
            ))}
            {shown.length === 0 ? <li className="dev-rooms-note">No room matches.</li> : null}
          </ul>
        </>
      ) : null}
    </aside>
  )
}
