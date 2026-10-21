/**
 * The green counters line along the bottom of a card tile (`.ct-counters`):
 * each kind of counter on the permanent, then its regeneration shields, as
 * one comma-separated line — "2× +1/+1, 1× oil, 1 regeneration shield".
 * Each kind used to be its own inline element with nothing between them, so
 * they ran together ("2× +1/+11× oil" — a bug report, 2026-10-21).
 */
export function counterSummary(
  counters: readonly (readonly [string, number])[],
  regenerationShields: number,
): string {
  const parts = counters.map(([kind, n]) => `${n}× ${kind}`)
  if (regenerationShields > 0) {
    parts.push(`${regenerationShields} regeneration shield${regenerationShields === 1 ? '' : 's'}`)
  }
  return parts.join(', ')
}
