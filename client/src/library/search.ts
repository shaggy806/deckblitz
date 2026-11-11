/**
 * The card search's query: every word must appear somewhere in a card's
 * searchable text (its name, type line and rules text), in any order, so
 * "flying dragon" finds Dragons with flying and "atraxa praetors" finds
 * Atraxa, Praetors' Voice. Words inside double quotes stay one phrase
 * ("draw a card").
 */

/** `query`'s terms, lowercased: each quoted phrase, and each other word. */
export function searchTerms(query: string): readonly string[] {
  const terms: string[] = []
  for (const match of query.toLowerCase().matchAll(/"([^"]*)"?|(\S+)/g)) {
    const term = (match[1] ?? match[2]).trim()
    if (term !== '') terms.push(term)
  }
  return terms
}

/** Whether `haystack` (already lowercase) holds every one of `terms`. */
export const matchesTerms = (haystack: string, terms: readonly string[]): boolean =>
  terms.every((term) => haystack.includes(term))
