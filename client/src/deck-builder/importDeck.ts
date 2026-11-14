import type {
  DeckFormatReport,
  ImportDeckLine,
  ImportedAttractionReport,
  ImportedCardReport,
  ReplacementOption,
} from 'protocol'
import type { AttractionEntry } from './decks.ts'

// Same host/port convention as useNetworkGame's SERVER_URL, but http(s) for
// this one-off request/response endpoint rather than the room's WebSocket.
// A function, so importing this module reads no `window` (its unit test
// runs without one).
const importDeckUrl = (): string =>
  `${((import.meta.env.VITE_SERVER_URL as string | undefined) ?? `ws://${window.location.hostname}:4000`).replace(
    /^ws/,
    'http',
  )}/import-deck`

/**
 * The card replacer asked about one card of a deck being built (`POST
 * /suggest-replacement`): cards the pool has that do much the same job,
 * inside the deck's colour identity and not already in it, best first.
 */
export async function suggestReplacement(
  card: string,
  cards: readonly string[],
  commanders: readonly string[],
): Promise<readonly ReplacementOption[]> {
  const res = await fetch(importDeckUrl().replace(/\/import-deck$/, '/suggest-replacement'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ card, cards, commanders }),
  })
  const body = (await res.text()).trim()
  const parsed = JSON.parse(body === '' ? '{}' : body) as { options?: readonly ReplacementOption[]; error?: string }
  if (!res.ok || parsed.options === undefined) {
    throw new Error(parsed.error ?? `the server couldn't suggest a replacement (${res.status})`)
  }
  return parsed.options
}

/** How far along the server is, as reported by the import endpoint's
 * `progress` lines. `name` is the card just resolved (null before the first
 * one lands). */
export interface ImportProgress {
  readonly done: number
  readonly total: number
  readonly name: string | null
}

/** One card the engine doesn't implement, and the stand-in playing for it. */
export interface ImportSubstitution {
  readonly from: string
  /** The stand-in currently in the deck. */
  readonly to: string
  /** Every stand-in the server suggested, best first — `to` is one of them. */
  readonly options: readonly ReplacementOption[]
}

/** What an import changed, for the deck builder's banner and a blitz game's
 * notice. */
export interface ImportReport {
  /** Cards, copies counted: "30 Forest" is thirty. The next three add up to it. */
  readonly total: number
  readonly asIs: number
  readonly substitutedCards: number
  readonly droppedCards: number
  /** One entry a name, however many copies of it the list had. */
  readonly substituted: readonly ImportSubstitution[]
  readonly dropped: readonly string[]
  /** How many cards kept the specific printing the pasted list named. */
  readonly printings: number
}

/** A pasted list resolved into a deck the engine can play right now. */
export interface ResolvedImport {
  readonly name: string
  readonly cards: readonly string[]
  readonly commanders: readonly string[]
  readonly printings: Readonly<Record<string, string>>
  /** The list's sideboard (rule 100.4), resolved the same way as the deck. */
  readonly sideboard: readonly string[]
  /** The list's Attraction deck (rule 717.2), a card an entry: an Attraction
   * the pool has is kept, with the printing the list named; anything else is
   * dropped, since nothing but an Attraction can stand in for one. */
  readonly attractions: readonly AttractionEntry[]
  readonly report: ImportReport
}

/**
 * Whether `text` looks like a decklist at all: at least one "N Card Name"
 * line, the only line the server's parser reads as a card. Lets the landing
 * page's blitz tell an unrelated clipboard apart from a list before sending
 * it anywhere.
 */
export function looksLikeDecklist(text: string): boolean {
  return text.split(/\r?\n/).some((line) => /^\s*\d+\s+\S/.test(line))
}

/**
 * POSTs a pasted decklist and consumes the endpoint's newline-delimited JSON
 * response, calling `onProgress` as each card is resolved and returning the
 * terminal `result` line. Streamed rather than awaited whole because a list
 * can wait on the network: a card the server's Oracle snapshot doesn't have
 * (one printed since it was made) or a named printing is looked up on
 * Scryfall, 75 to a request. Most lists resolve locally, in well under a
 * second.
 */
export async function importDecklist(
  text: string,
  onProgress: (progress: ImportProgress) => void,
): Promise<{
  readonly cards: readonly ImportedCardReport[]
  readonly format: DeckFormatReport | null
  readonly sideboard: readonly ImportedCardReport[]
  readonly attractions: readonly ImportedAttractionReport[]
}> {
  const res = await fetch(importDeckUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? `import failed (${res.status})`)
  }
  const reader = res.body?.getReader()
  if (!reader) throw new Error('import failed: no response body')

  const decoder = new TextDecoder()
  let buffer = ''
  let outcome: {
    cards: readonly ImportedCardReport[]
    format: DeckFormatReport | null
    sideboard: readonly ImportedCardReport[]
    attractions: readonly ImportedAttractionReport[]
  } | null = null
  let finished = false
  while (!finished) {
    const chunk = await reader.read()
    finished = chunk.done
    if (chunk.value) buffer += decoder.decode(chunk.value, { stream: true })
    const parts = buffer.split('\n')
    // The last piece is a partial line until the stream ends, at which point
    // everything left is complete.
    buffer = finished ? '' : (parts.pop() ?? '')
    for (const part of parts) {
      if (part.trim() === '') continue
      const line = JSON.parse(part) as ImportDeckLine
      if (line.type === 'progress') onProgress(line)
      else if (line.type === 'result') {
        outcome = {
          cards: line.cards,
          format: line.format,
          sideboard: line.sideboard ?? [],
          attractions: line.attractions ?? [],
        }
      }
      else throw new Error(line.error)
    }
  }
  if (outcome === null) throw new Error('import ended before the deck was resolved')
  return outcome
}

/**
 * The import endpoint's answer as a deck: an implemented card kept as-is, an
 * unimplemented one with a `suggestedReplacement` (`engine`'s
 * `assignReplacements`, run server-side against the pool) swapped for it,
 * and anything with no match at all (or not found on Scryfall) dropped.
 */
export function resolveImport(
  cardReports: readonly ImportedCardReport[],
  format: DeckFormatReport | null,
  sideboardReports: readonly ImportedCardReport[] = [],
  attractionReports: readonly ImportedAttractionReport[] = [],
): ResolvedImport {
  const commanderNames = format?.commanders ?? []

  const cards: string[] = []
  const substituted: ImportSubstitution[] = []
  const dropped: string[] = []
  let substitutedCards = 0
  let droppedCards = 0
  // Which printing each kept card arrived with, from the pasted list's own
  // `(SET) number` suffixes — only ever present for a card kept as-is, since
  // a substitution is a different card entirely.
  const printings: Record<string, string> = {}
  // What each of the list's commanders resolved to, kept apart from the
  // loop's order so a pair stays in the order the list gave it.
  const commanderAs = new Map<string, string>()

  for (const c of cardReports) {
    let resolvedName: string | null = null
    if (c.implemented) {
      resolvedName = c.name
      if (c.printingId !== null) printings[c.name] = c.printingId
    } else if (c.suggestedReplacement) {
      resolvedName = c.suggestedReplacement
      substituted.push({ from: c.name, to: c.suggestedReplacement, options: c.replacements })
      substitutedCards += c.count
    } else {
      dropped.push(c.name)
      droppedCards += c.count
      continue
    }
    if (commanderNames.includes(c.name)) {
      commanderAs.set(c.name, resolvedName)
    } else {
      for (let i = 0; i < c.count; i += 1) cards.push(resolvedName)
    }
  }
  const commanders = commanderNames.flatMap((n) => {
    const as = commanderAs.get(n)
    return as === undefined ? [] : [as]
  })
  // The sideboard, card by card as the deck was (rule 100.4).
  const sideboard: string[] = []
  for (const c of sideboardReports) {
    const resolvedName = c.implemented ? c.name : c.suggestedReplacement
    if (!resolvedName) {
      dropped.push(c.name)
      droppedCards += c.count
      continue
    }
    if (c.implemented && c.printingId !== null) printings[c.name] ??= c.printingId
    if (!c.implemented) {
      substituted.push({ from: c.name, to: resolvedName, options: c.replacements })
      substitutedCards += c.count
    }
    for (let i = 0; i < c.count; i += 1) sideboard.push(resolvedName)
  }
  // The Attraction deck, a card a copy, each with the printing it named.
  const attractions: AttractionEntry[] = []
  for (const a of attractionReports) {
    if (!a.implemented) {
      dropped.push(a.name)
      droppedCards += a.count
      continue
    }
    for (let i = 0; i < a.count; i += 1) {
      attractions.push(a.collector === null ? a.name : { name: a.name, collector: a.collector })
    }
  }
  const total = [...cardReports, ...sideboardReports, ...attractionReports].reduce((sum, c) => sum + c.count, 0)

  return {
    name: commanders.length > 0 ? `Imported: ${commanders.join(' & ')}` : 'Imported deck',
    cards,
    commanders,
    printings,
    sideboard,
    attractions,
    report: {
      total,
      asIs: total - substitutedCards - droppedCards,
      substitutedCards,
      droppedCards,
      substituted,
      dropped,
      printings: Object.keys(printings).length,
    },
  }
}
