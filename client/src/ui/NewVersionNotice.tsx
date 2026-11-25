import { useState } from 'react'
import { reloadForNewVersion, useNewVersion } from './newVersion.ts'

/**
 * "A new version is out": a quiet line at the bottom of a page that isn't a
 * game (the landing page, a lobby, the library, the deck builder, About),
 * once a newer build than this page's has been deployed (`newVersion.ts`).
 * It never reloads by itself, and "Later" puts it away for this page load.
 * In a game the Game menu says it instead (`SeatMenu`): nothing goes over
 * the board.
 */
export function NewVersionNotice() {
  const available = useNewVersion()
  const [putAway, setPutAway] = useState(false)
  if (!available || putAway) return null
  return (
    <div className="new-version" role="status">
      <span>A new version of Deck Blitz is out.</span>
      <button type="button" className="primary" onClick={reloadForNewVersion}>
        Reload
      </button>
      <button type="button" onClick={() => setPutAway(true)}>
        Later
      </button>
    </div>
  )
}
