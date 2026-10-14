/**
 * Whether this tab plays its solo games — a blitz, a lesson — locally, in a Web
 * Worker in this browser (`localSocket.ts`), instead of on the room server
 * (`docs/plans/local-rooms.md`).
 *
 * **On by default in a production build** (the site, `vite preview`); `?local=0`
 * turns it off for the tab and `?local=1` back on, the choice kept in
 * `sessionStorage` so the room URLs the game navigates to, which drop the
 * parameter, keep it. Under `vite dev` it's **off unless `?local=1`**: a
 * developer's server records captures and answers the e2e suite's control
 * port, both about rooms it holds. Never on where the browser can't run a
 * module worker; and a tab whose worker fails to start falls back to the
 * server by itself (`HybridSocket`).
 */

const KEY = 'mtg.local'

/** What this build does when the tab hasn't said. */
const BY_DEFAULT = import.meta.env.PROD

/** Reads, and remembers, the tab's choice. */
export function localMode(href: string = window.location.href, byDefault: boolean = BY_DEFAULT): boolean {
  return chosen(href, byDefault) && moduleWorkers()
}

function chosen(href: string, byDefault: boolean): boolean {
  let flag: string | null = null
  try {
    flag = new URL(href).searchParams.get('local')
  } catch {
    // Not a URL: the tab's stored choice, or the default.
  }
  try {
    if (flag === '1' || flag === '0') sessionStorage.setItem(KEY, flag)
    const stored = sessionStorage.getItem(KEY)
    return stored === null ? byDefault : stored === '1'
  } catch {
    // No storage (a locked-down browser): the parameter, else the default.
    return flag === null ? byDefault : flag === '1'
  }
}

let workersChecked: boolean | null = null

/** Whether `new Worker(url, { type: 'module' })` works here: a browser that
 * doesn't know the option never reads it. Checked once a page. */
function moduleWorkers(): boolean {
  workersChecked ??= probeModuleWorkers()
  return workersChecked
}

function probeModuleWorkers(): boolean {
  if (typeof Worker === 'undefined') return false
  let read = false
  try {
    const probe = {
      get type(): 'module' {
        read = true
        return 'module'
      },
    }
    // An empty data URL: nothing loads or runs, and it's ended at once.
    new Worker('data:text/javascript,', probe).terminate()
  } catch {
    // Refused (a strict page policy): it read the option or it didn't.
  }
  return read
}
