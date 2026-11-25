/**
 * The site's update notes: what changed for players in each deploy, newest
 * first, kept in `public/updates.json` and written as part of deploying
 * (the `deploy` skill, DEPLOYMENT.md). The page reads the file from the
 * site each time rather than bundling it, so a page still running an older
 * build shows the notes of the build that replaced it (`ui/newVersion.ts`).
 */

/** One deploy's notes: its day (`YYYY-MM-DD`) and a sentence a change. */
export interface UpdateEntry {
  readonly date: string
  readonly notes: readonly string[]
}

/** Where the notes are served, beside `index.html` and never cached. */
export const UPDATES_URL = '/updates.json'

/**
 * The entries in `payload` (the notes file's content, whatever came back),
 * newest first: each with a real day and at least one note. Anything else in
 * the list is left out, and anything that isn't a list is no entries.
 */
export function parseUpdates(payload: unknown): UpdateEntry[] {
  if (!Array.isArray(payload)) return []
  const entries: UpdateEntry[] = []
  for (const item of payload as readonly unknown[]) {
    if (typeof item !== 'object' || item === null) continue
    const { date, notes } = item as { date?: unknown; notes?: unknown }
    if (typeof date !== 'string' || dayOf(date) === null || !Array.isArray(notes)) continue
    const kept = (notes as readonly unknown[]).filter((n): n is string => typeof n === 'string' && n.trim() !== '')
    if (kept.length > 0) entries.push({ date, notes: kept })
  }
  // Newest first, whatever order the file has them in; a stable sort keeps
  // two deploys of one day as the file wrote them.
  return entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

/** `YYYY-MM-DD` as a UTC day, or null when it isn't one. */
function dayOf(date: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (m === null) return null
  const day = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  return day.getUTCMonth() === Number(m[2]) - 1 && day.getUTCDate() === Number(m[3]) ? day : null
}

/** "November 25, 2026" for `2026-11-25`. */
export function updateDayLabel(date: string): string {
  const day = dayOf(date)
  return day === null ? date : day.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}
