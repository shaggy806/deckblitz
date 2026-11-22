/**
 * Mana / tap symbol artwork.
 *
 * The pip SVGs live in `public/mana/<token>.svg` — one per symbol, sliced out
 * of `scripts/mana-spritesheet.svg` (a 10x7 grid of every WotC mana symbol) by
 * `scripts/slice-mana.mjs`. This module just maps a `{…}` token to that URL;
 * `KEYS` mirrors the script's filename map.
 *
 * `C.svg` (colorless) is hand-authored — the spritesheet has no `{C}` — so the
 * slicer leaves it alone on regen.
 */

const KEYS = new Set<string>([
  // generic 0..20
  ...Array.from({ length: 21 }, (_, i) => String(i)),
  'X', 'Y', 'Z',
  'W', 'U', 'B', 'R', 'G', 'C', 'S',
  // hybrid (guild order), twobrid, Phyrexian
  'WU', 'WB', 'UB', 'UR', 'BR', 'BG', 'RW', 'RG', 'GW', 'GU',
  '2W', '2U', '2B', '2R', '2G',
  'WP', 'UP', 'BP', 'RP', 'GP',
  // tap / untap / misc
  'T', 'Q', 'INFINITY', 'HALF', 'TAP_ALT', 'TAP_SQUARE', 'CHAOS',
])

/** Bump when a symbol's artwork changes. These files aren't content-hashed,
 * and Cloudflare tells browsers to keep them four hours (`max-age=14400`,
 * whatever Caddy says), so a changed file under the same address isn't seen
 * until then: a new address is. 2: tap and untap swapped back, 2026-11-21. */
const ARTWORK_VERSION = 2

const asset = (key: string): string => `${import.meta.env.BASE_URL}mana/${key}.svg?v=${ARTWORK_VERSION}`

/**
 * The SVG asset URL for a `{…}` symbol token (the raw inner text, e.g. `"W"`,
 * `"2"`, `"W/U"`, `"2/W"`, `"W/P"`, `"T"`), or `null` when we have no artwork
 * for it (`{C}`, exotic symbols) — the caller then renders a plain CSS pip.
 */
export function manaSymbolUrl(token: string): string | null {
  const t = token.trim().toUpperCase()
  if (KEYS.has(t)) return asset(t)
  if (t === '∞') return asset('INFINITY')
  if (t === '½') return asset('HALF')
  if (t.includes('/')) {
    const parts = t.split('/')
    if (KEYS.has(parts.join(''))) return asset(parts.join(''))
    if (parts.length === 2 && KEYS.has(parts[1] + parts[0])) {
      return asset(parts[1] + parts[0])
    }
  }
  return null
}
