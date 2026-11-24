import type { CommanderCandidate } from 'protocol'
import { createDeckFromImport } from './decks.ts'
import type { SavedDeck } from './decks.ts'
import { importDecklist, resolveImport } from './importDeck.ts'
import type { ImportProgress, ImportReport } from './importDeck.ts'

/** What importing a pasted list came to: a deck saved, or a question first. */
export type ImportOutcome =
  /** The list didn't say which card is its commander, and more than one
   * could be: ask (`CommanderPicker`), then import again with the answer. */
  | { readonly kind: 'ask'; readonly candidates: readonly CommanderCandidate[] }
  | { readonly kind: 'saved'; readonly deck: SavedDeck; readonly report: ImportReport }

/**
 * A pasted decklist made one of this browser's decks, and the active one:
 * read by the server (`importDecklist`), an unimplemented card swapped for its
 * first stand-in and one with none dropped (`resolveImport`), then saved
 * (`createDeckFromImport`). The deck builder's Import and the lobby deck
 * picker's Import tab both import this way, so a list brought to a room's seat
 * is in the deck builder afterwards, as one imported there is. `commanders`
 * is the answer to an earlier `ask`.
 */
export async function importAndSave(
  text: string,
  onProgress: (progress: ImportProgress) => void,
  commanders?: readonly string[],
): Promise<ImportOutcome> {
  const { cards, format, sideboard, attractions } = await importDecklist(text, onProgress, commanders)
  // Asked once: the answer goes back with the list, read again for it.
  const candidates = commanders === undefined ? (format?.commanderCandidates ?? []) : []
  if (candidates.length > 1) return { kind: 'ask', candidates }
  const resolved = resolveImport(cards, format, sideboard, attractions)
  const deck = createDeckFromImport(
    resolved.name,
    resolved.cards,
    resolved.commanders,
    resolved.printings,
    resolved.sideboard,
    resolved.attractions,
    // A commander's colour chosen before the game (rule 903.4b), as the
    // list's cards settled it; the deck editor's pips change it.
    format?.commanderColors ?? {},
  )
  return { kind: 'saved', deck, report: resolved.report }
}
