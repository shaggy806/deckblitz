import { useEffect } from 'react'

/**
 * What the page tells the room server about how it's used (`POST /usage`,
 * the server's `usage.ts`, which keeps the numbers for the operator and has
 * the privacy rules): a page opened, a game begun and ended, a decklist
 * imported, an error thrown. The page has to say, because the server sees
 * none of it: the pages are static files, and a solo game runs in this tab.
 *
 * Each is one small anonymous event, sent blind (`sendBeacon`: nothing is
 * read back, and a failure is nobody's problem). No cookie and no id: the
 * only thing kept on the device for this is a flag that it has been here
 * before. (A kept game carries a browser's tag, `playerTag.ts`; nothing sent
 * from here does.)
 * Nothing is sent from a browser driven by automation (`navigator.webdriver`:
 * the Playwright suites, and most crawlers), or with no `window` at all (a
 * unit test).
 */

/** The events the server takes (`USAGE_KINDS` there). */
export type UsageKind = 'view' | 'game-start' | 'game-end' | 'import' | 'import-failed' | 'error'

type UsageFields = Readonly<Record<string, string | number | boolean | readonly string[]>>

/** Same host/port convention as `useNetworkGame`'s SERVER_URL, over http(s). */
const usageUrl = (): string =>
  `${((import.meta.env.VITE_SERVER_URL as string | undefined) ?? `ws://${window.location.hostname}:4000`).replace(/^ws/, 'http')}/usage`

/** Sends one event. Never throws. */
export function track(kind: UsageKind, fields: UsageFields = {}): void {
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || navigator.webdriver) return
    const body = JSON.stringify({ ...fields, kind })
    // A string body goes as text/plain: no CORS preflight for a blind post.
    if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(usageUrl(), body)) return
    void fetch(usageUrl(), { method: 'POST', body, keepalive: true, mode: 'no-cors' }).catch(() => {})
  } catch {
    // Not worth a player's notice.
  }
}

/** The `localStorage` flag that this device has opened the site before. */
const VISITED_KEY = 'deckblitz.visited'

/** Which page an address is, as the report names it: `room` is someone
 * arriving by a room's link (`/?room=CODE`). */
export function pageOf(path: string, search = ''): string {
  if (path.startsWith('/library')) return 'library'
  if (path.startsWith('/deck-builder')) return 'deck-builder'
  if (path.startsWith('/about')) return 'about'
  return new URLSearchParams(search).has('room') ? 'room' : 'landing'
}

/** Another site's host, when the visitor followed a link from one. */
function referrerHost(): string {
  try {
    if (document.referrer === '') return ''
    const host = new URL(document.referrer).host
    return host === window.location.host ? '' : host
  } catch {
    return ''
  }
}

/**
 * Reports this page load, and from here on its uncaught errors (five at
 * most, so a loop of them is five events). Called once, as the page starts.
 */
export function trackPage(): void {
  if (typeof window === 'undefined') return
  const page = pageOf(window.location.pathname, window.location.search)
  let firstVisit = false
  try {
    firstVisit = window.localStorage.getItem(VISITED_KEY) === null
    if (firstVisit) window.localStorage.setItem(VISITED_KEY, '1')
  } catch {
    // Storage blocked: can't tell, so not counted as new.
  }
  const sendView = (): void =>
    track('view', {
      page,
      firstVisit,
      referrer: referrerHost(),
      screen: `${window.innerWidth}x${window.innerHeight}`,
      cores: navigator.hardwareConcurrency ?? 0,
      // How long until the page's own code was running.
      loadMs: Math.round(performance.now()),
    })
  sendView()

  let errors = 0
  const report = (message: string, at: string): void => {
    if (errors >= 5) return
    errors++
    track('error', { page, message: message.slice(0, 300), at: at.slice(0, 120) })
  }
  window.addEventListener('error', (e) => {
    // A script or image that failed to load fires this too, with no message.
    if (typeof e.message !== 'string' || e.message === '') return
    report(e.message, `${(e.filename ?? '').split('/').pop() ?? ''}:${e.lineno}:${e.colno}`)
  })
  window.addEventListener('unhandledrejection', (e) => {
    const reason: unknown = e.reason
    report(reason instanceof Error ? reason.message : String(reason), 'promise')
  })
}

/** What {@link useGameUsage} keeps of a game as it begins, under the room's
 * code. A marker from before 2026-11-26 is the start time alone. */
interface GameStart {
  readonly at: number
  readonly mode: GameUsage['mode'] | undefined
  readonly humans: number | undefined
}

export function parseStart(marker: string): GameStart {
  try {
    const parsed: unknown = JSON.parse(marker)
    if (typeof parsed === 'number') return { at: parsed, mode: undefined, humans: undefined }
    if (typeof parsed === 'object' && parsed !== null) {
      const { at, mode, humans } = parsed as Record<string, unknown>
      return {
        at: typeof at === 'number' ? at : Date.now(),
        mode: mode === 'solo' || mode === 'multiplayer' || mode === 'tutorial' ? mode : undefined,
        humans: typeof humans === 'number' ? humans : undefined,
      }
    }
  } catch {
    // Not ours: report the end as it reads now.
  }
  return { at: Date.now(), mode: undefined, humans: undefined }
}

/** What {@link useGameUsage} reads of a game on screen. */
export interface GameUsage {
  /** The room's code: names the game on this tab, never sent. */
  readonly roomId: string | null
  /** `null` until the board is up; no report for a spectator or the scenario
   * builder (pass `null`). */
  readonly mode: 'solo' | 'multiplayer' | 'tutorial' | null
  readonly players: number
  /** People at the table: a game with several is reported by each. */
  readonly humans: number
  readonly turn: number
  readonly over: boolean
  /** How it stands for this seat. */
  readonly outcome: 'won' | 'lost' | 'draw' | null
}

/**
 * Reports a game once as it begins and once as it ends for this seat (won,
 * lost or knocked out, or a draw), with how long it ran. A marker in
 * `sessionStorage` under the room's code is what makes it once: a reload
 * mid-game finds it and reports nothing, and a rematch, after the end took
 * it away, begins again. A game that's left reports no end, which is how the
 * report tells the abandoned ones.
 */
export function useGameUsage(game: GameUsage): void {
  const { roomId, mode, players, humans, turn, over, outcome } = game
  const ended = over || outcome === 'lost'
  useEffect(() => {
    if (roomId === null || mode === null) return
    const key = `deckblitz.game.${roomId}`
    try {
      const began = window.sessionStorage.getItem(key)
      if (!ended && began === null) {
        window.sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), mode, humans }))
        track('game-start', { mode, players, humans })
      } else if (ended && began !== null) {
        window.sessionStorage.removeItem(key)
        // The end is reported as the game began: by its end a seat handed to a
        // bot no longer counts as a person, so read now a table of three came
        // out "solo, 0 people", and the report, which counts each person's
        // report of a game as its share of one, counted it three times over.
        const start = parseStart(began)
        track('game-end', {
          mode: start.mode ?? mode,
          players,
          humans: start.humans ?? humans,
          turns: turn,
          outcome: outcome ?? 'draw',
          minutes: Math.round((Date.now() - start.at) / 6000) / 10,
        })
      }
    } catch {
      // No storage to mark it in: better no report than one per frame.
    }
    // `turn` is read as the game ends, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, mode, ended])
}
