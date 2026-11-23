/**
 * The tag a kept game carries (the server's `game-store.ts`), so that the
 * site's maker can tell how many different players a pile of kept games came
 * from: ten games from one browser read differently from ten players' one
 * each when a bot's mistake is counted.
 *
 * **It says nothing about who.** The browser makes up a random number the
 * first time a game is played here and keeps it in `localStorage`. That
 * number never leaves the browser. What goes with a game is a short code
 * worked out from it one way (the first ten hex digits of its SHA-256), so
 * the same browser gives the same code and nothing can be worked back from a
 * code to the number, the browser or the person. It is sent with kept games
 * and nothing else: not with a visit, an import or an error (`usage.ts`), and
 * not to a room. Clearing the site's data makes a new number, and a new code.
 * The About page says so.
 *
 * No tag at all where there is no storage or no `crypto.subtle` (a private
 * window that refuses storage, a page not served over https), and none from a
 * browser driven by automation, as `usage.ts` sends nothing from one.
 */

/** Where the browser keeps its number. */
export const PLAYER_NUMBER_KEY = 'deckblitz:player-number'

/** The shape of a tag: ten lowercase hex digits. The server keeps no other. */
export const PLAYER_TAG = /^[0-9a-f]{10}$/

const hex = (bytes: Uint8Array): string => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

/** The browser's number, made up and kept the first time it is asked for. */
function playerNumber(storage: Storage): string {
  const kept = storage.getItem(PLAYER_NUMBER_KEY)
  if (kept !== null && /^[0-9a-f]{32}$/.test(kept)) return kept
  const made = hex(crypto.getRandomValues(new Uint8Array(16)))
  storage.setItem(PLAYER_NUMBER_KEY, made)
  return made
}

/** The code worked out from `number`: one way, and short. */
export async function tagOf(number: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(number))
  return hex(new Uint8Array(digest)).slice(0, 10)
}

let asked: Promise<string | null> | null = null

/** This browser's tag, or `null` where it has none. Never throws. */
export function playerTag(): Promise<string | null> {
  asked ??= (async () => {
    try {
      if (typeof window === 'undefined' || typeof navigator === 'undefined' || navigator.webdriver) return null
      if (typeof crypto === 'undefined' || crypto.subtle === undefined) return null
      return await tagOf(playerNumber(window.localStorage))
    } catch {
      // Storage refused, or no digest here: games go untagged.
      return null
    }
  })()
  return asked
}
