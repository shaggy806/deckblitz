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

/**
 * A card's searchable text from its fields (name, type line, rules text, …),
 * lowercased. Within a field every run of whitespace is one space, so a
 * quoted phrase finds text across a line break ("tap target permanent. draw a
 * card" in Ice's two lines); between fields stays a newline, which no term
 * holds, so a phrase never runs from one field into the next.
 */
export function searchHaystack(fields: readonly (string | null | undefined)[]): string {
  return fields
    .filter((f): f is string => typeof f === 'string' && f !== '')
    .map((f) => f.replace(/\s+/g, ' ').trim())
    .join('\n')
    .toLowerCase()
}

/** Whether `haystack` (already lowercase) holds every one of `terms`. */
export const matchesTerms = (haystack: string, terms: readonly string[]): boolean =>
  terms.every((term) => haystack.includes(term))
