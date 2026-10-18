/**
 * What the stack overlay draws for the decision you're being asked.
 *
 * A sacrifice or discard effect raises its prompt *after* the spell that
 * ordered it has finished resolving and gone to a graveyard, so a forced
 * choice used to arrive with nothing on screen explaining it. The engine
 * names the cause on `PlayerView.decisionSource`; this decides whether
 * there's a card face to show for it, and `Stack` renders it at depth 0
 * alongside the real stack.
 *
 * Lives here rather than in `Stack.tsx` so that file exports only components
 * (React Fast Refresh).
 */
import type { ObjectId, PlayerView } from 'engine/client'

/** The object to draw as the decision's cause, or `null` if there's nothing
 * extra to draw — nothing pending, the cause is already on the stack, or the
 * card isn't in a zone this viewer can see (the decision strip still names it
 * in words either way). */
export function decisionGhostOf(view: PlayerView, answered = false): ObjectId | null {
  if (answered) return null
  const source = view.decisionSource
  if (!source) return null
  if (view.zones.stack.includes(source.object)) return null
  // A permanent's ability resolving and asking: the ability itself is on top
  // of the stack (it leaves only once it's done, rule 608.2n) and is drawn
  // as that permanent's card, so another copy of the card above it would be
  // a card that isn't on the stack sitting on top of it.
  const top = view.zones.stack[view.zones.stack.length - 1]
  if (top !== undefined && view.objects[top]?.sourceObjectId === source.object) return null
  if (!view.objects[source.object]) return null
  return source.object
}

/** Whether the stack overlay has anything at all to draw. */
export function stackShowsSomething(view: PlayerView, answered = false): boolean {
  return view.zones.stack.length > 0 || decisionGhostOf(view, answered) !== null
}
