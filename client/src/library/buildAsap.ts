/**
 * The library's dev-only "Build ASAP" flags (the user, 2026-11-06): cards not
 * in the pool yet, picked by hand to be built ahead of their EDHREC rank. They
 * live in `engine/data/build-asap.json`, read and written through the Vite dev
 * server's `/__build-asap` endpoint (`vite.config.ts`), so a flag lands in the
 * repo to commit; `npm run cards:needs -w engine` lists flagged cards first and
 * the `author-flagged` skill works through them. A production build has no
 * endpoint, and the page asks for none (`import.meta.env.DEV`).
 */

export interface AsapFlag {
  readonly name: string
  /** The day it was flagged, `YYYY-MM-DD`. */
  readonly flagged: string
}

/** The names flagged, from the endpoint's answer. */
export function asapNames(body: unknown): ReadonlySet<string> {
  const cards = (body as { cards?: unknown } | null)?.cards
  if (!Array.isArray(cards)) throw new Error('/__build-asap: no cards list')
  return new Set(
    (cards as AsapFlag[]).flatMap((c) => (typeof c?.name === 'string' ? [c.name] : [])),
  )
}

/** Every flagged name. */
export async function fetchAsap(): Promise<ReadonlySet<string>> {
  const res = await fetch('/__build-asap')
  if (!res.ok) throw new Error(`/__build-asap: ${res.status}`)
  return asapNames(await res.json())
}

/** Flags (`on`) or unflags `name`, answering with every flagged name after. */
export async function setAsap(name: string, on: boolean): Promise<ReadonlySet<string>> {
  const res = await fetch('/__build-asap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, on }),
  })
  if (!res.ok) throw new Error(`/__build-asap: ${res.status}`)
  return asapNames(await res.json())
}
