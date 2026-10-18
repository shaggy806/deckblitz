/**
 * The commander tax beside a commander's cost: the "+N" still owed on a cast
 * from the command zone (`VisibleObject.commanderTax`). A cost reduction that
 * outran the printed generic part pays the tax down too (rule 601.2f — affinity
 * on a commander), and then the badge is marked reduced, with the whole tax on
 * its tooltip, down to "+0" when the reduction covers all of it (a bug report,
 * 2026-10-18: the badge showed the whole tax whatever affinity paid).
 */
export function TaxBadge({ owed, reducedFrom }: { readonly owed: number; readonly reducedFrom?: number }) {
  if (owed <= 0 && reducedFrom === undefined) return null
  const reduced = reducedFrom !== undefined
  return (
    <span
      className={`ct-tax${reduced ? ' reduced' : ''}`}
      title={reduced ? `Commander tax +${reducedFrom}, ${reducedFrom - owed} of it paid by cost reductions` : 'Commander tax'}
    >
      +{owed}
    </span>
  )
}
