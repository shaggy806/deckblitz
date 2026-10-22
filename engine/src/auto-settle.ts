/**
 * Advances a {@link Game} past everything it can decide on its own, stopping
 * only where an external decision-maker must act: game over, an `awaiting`
 * declaration, or someone holding priority. Also fast-forwards "dead"
 * priority windows — where the holder's only legal action is
 * `pass-priority` — so a caller is never asked to prompt for a no-op pass.
 *
 * Every driver that sits on top of `Game` (the client's hot-seat UI, the
 * multiplayer server) calls this after each dispatch so a game always
 * settles the same way regardless of who's driving it.
 */

import type { Game } from "./game.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type { GameState } from "./state.js";

export function isSettled(state: GameState): boolean {
  return (
    state.result.over ||
    state.awaiting !== null ||
    (state.priority.active && state.priority.holder !== null)
  );
}

function isDeadWindow(game: Game, holder: PlayerId): boolean {
  const acts = game.legalActions(holder);
  return acts.length === 1 && acts[0].kind === "pass-priority";
}

/**
 * A zone choice with nothing to choose: every card shown must be taken (all
 * of them eligible, `min` = `max` = how many there are), with no order, no
 * split and no rule over the set to pick, going somewhere the player still
 * sees them — Dark Confidant's and Yuriko's "reveal the top card and put it
 * into your hand". Answered here rather than opening a one-card picker; the
 * cards are no less seen (`ids` excludes any card only looked at and left).
 */
const SEEN_DESTINATIONS: ReadonlySet<string> = new Set(["hand", "battlefield", "graveyard"]);

export function forcedZoneChoice(state: GameState): { readonly player: PlayerId; readonly chosen: readonly ObjectId[] } | null {
  const a = state.awaiting;
  if (a === null || a.kind !== "choose-from-zone") return null;
  const forced =
    a.ids.length > 0 &&
    a.eligible.length === a.ids.length &&
    a.min === a.ids.length &&
    a.max === a.ids.length &&
    SEEN_DESTINATIONS.has(a.destination) &&
    a.forPlayer === undefined &&
    a.order !== true &&
    a.thenOrder === undefined &&
    a.restDestination === undefined &&
    a.together === undefined &&
    a.secondPick === undefined &&
    a.behold === undefined &&
    a.collectEvidence === undefined;
  return forced ? { player: a.player, chosen: [...a.eligible] } : null;
}

export function autoSettle(game: Game): void {
  game.advanceUntil(isSettled);
  for (let i = 0; i < 1000; i += 1) {
    const s = game.state;
    const zoneChoice = forcedZoneChoice(s);
    if (zoneChoice !== null && !s.result.over) {
      game.dispatch({ type: "choose-from-zone", ...zoneChoice });
      game.advanceUntil(isSettled);
      continue;
    }
    if (s.result.over || s.awaiting !== null || !s.priority.active) return;
    const holder = s.priority.holder;
    if (holder === null || !isDeadWindow(game, holder)) return;
    game.dispatch({ type: "pass-priority", player: holder });
    game.advanceUntil(isSettled);
  }
}
