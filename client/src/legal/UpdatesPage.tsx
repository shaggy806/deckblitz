import { useEffect, useState } from 'react'
import { SITE_TITLE } from './notice.ts'
import { UPDATES_URL, parseUpdates, updateDayLabel } from './updates.ts'
import type { UpdateEntry } from './updates.ts'
import './legal.css'

/**
 * `/updates`: what changed on the site in each deploy, newest first. A
 * network-free page like About: no room, no WebSocket, no card pool. It
 * fetches the notes rather than carrying them, so a page loaded before a
 * deploy still shows that deploy's notes (`updates.ts`).
 */
export function UpdatesPage() {
  // `null` while loading; `'failed'` when the notes couldn't be read.
  const [entries, setEntries] = useState<readonly UpdateEntry[] | 'failed' | null>(null)
  useEffect(() => {
    let live = true
    fetch(`${UPDATES_URL}?${Date.now().toString(36)}`, { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((payload: unknown) => {
        if (live) setEntries(parseUpdates(payload))
      })
      .catch(() => {
        if (live) setEntries('failed')
      })
    return () => {
      live = false
    }
  }, [])

  const list = entries === null || entries === 'failed' ? null : entries
  return (
    <main className="about-page updates-page">
      <a className="link-button about-home" href="/">
        ← Main menu
      </a>
      <h1>Updates</h1>
      <p className="about-lead">What has changed on {SITE_TITLE}, newest first.</p>
      {entries === null ? <p>Loading…</p> : null}
      {entries === 'failed' ? <p>The update notes couldn&apos;t be loaded. Reload the page to try again.</p> : null}
      {list !== null && list.length === 0 ? <p>No update notes yet.</p> : null}
      {list !== null
        ? list.map((entry, i) => (
            <section key={`${entry.date}.${i}`}>
              <h2>{updateDayLabel(entry.date)}</h2>
              <ul className="updates-notes">
                {entry.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          ))
        : null}
    </main>
  )
}
