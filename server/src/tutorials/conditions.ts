/**
 * What a lesson waits for: a chapter's opening moment and a coach card's
 * goals, as predicates over the game's event log since a given index — the
 * pattern `Room.interruptSince` scans with. Checked on the server, where the
 * truth is, every time the tutorial room publishes a frame.
 */

import type { GameEvent, GameState, ObjectId, PlayerId, Step } from "engine/local";

/**
 * One thing to wait for. Every `event` condition is met by the first such
 * event in the log since the index it's checked from; `player` and `card`,
 * where given, narrow it. `lifeAtMost` is met by the board as it stands.
 *
 * - `land-played`, `spell-cast`, `ability-activated`: by `player`, of a card
 *   named `card` (an ability: its source's name).
 * - `attackers-declared`: `player` attacked with at least `atLeast` (1)
 *   creatures.
 * - `blocker-declared`: a creature `player` controls, named `card`, blocked.
 * - `turn-began`: turn number `turn`, or `player`'s turn.
 * - `step-began`: step `step`, of `player`'s turn when given.
 * - `player-lost`: `player` (or anyone) lost.
 */
export type TutorialCondition =
  | { readonly event: "land-played"; readonly player?: PlayerId; readonly card?: string }
  | { readonly event: "spell-cast"; readonly player?: PlayerId; readonly card?: string }
  | { readonly event: "ability-activated"; readonly player?: PlayerId; readonly card?: string }
  | { readonly event: "attackers-declared"; readonly player?: PlayerId; readonly atLeast?: number }
  | { readonly event: "blocker-declared"; readonly player?: PlayerId; readonly card?: string }
  | { readonly event: "turn-began"; readonly turn?: number; readonly player?: PlayerId }
  | { readonly event: "step-began"; readonly step: Step; readonly player?: PlayerId }
  | { readonly event: "player-lost"; readonly player?: PlayerId }
  | { readonly lifeAtMost: { readonly player: PlayerId; readonly value: number } };

/** The card names a condition mentions, for checking a lesson against the
 * card pool. */
export function conditionCards(condition: TutorialCondition): string[] {
  return "card" in condition && condition.card !== undefined ? [condition.card] : [];
}

/** The active player as of log index `at`: whose turn last began before it. */
function activeAt(log: readonly GameEvent[], at: number): PlayerId | null {
  for (let i = Math.min(at, log.length) - 1; i >= 0; i -= 1) {
    const event = log[i];
    if (event.type === "turn-began") return event.activePlayer;
  }
  return null;
}

/**
 * Where `condition` was first met in `state`'s event log at or after index
 * `from`: the index just past the event that met it — so whatever is waited
 * for next starts from there — or the log's length for a condition the
 * board meets as it stands. `null` while it isn't met.
 */
export function metAt(state: GameState, from: number, condition: TutorialCondition): number | null {
  const log = state.eventLog;
  if ("lifeAtMost" in condition) {
    const player = state.players[condition.lifeAtMost.player];
    return player !== undefined && player.life <= condition.lifeAtMost.value ? log.length : null;
  }
  const name = (id: ObjectId): string => state.objects[id]?.cardName ?? "";
  const by = (player: PlayerId): boolean => condition.player === undefined || condition.player === player;
  const named = (id: ObjectId): boolean => !("card" in condition) || condition.card === undefined || name(id) === condition.card;
  let active = activeAt(log, from);
  for (let i = Math.max(0, from); i < log.length; i += 1) {
    const event = log[i];
    if (event.type === "turn-began") active = event.activePlayer;
    if (event.type !== condition.event) continue;
    let met = false;
    switch (event.type) {
      case "land-played":
      case "spell-cast":
        met = by(event.player) && named(event.object);
        break;
      case "ability-activated":
        met = by(event.player) && named(event.source);
        break;
      case "attackers-declared":
        met =
          by(event.player) &&
          event.attackers.length >= (condition.event === "attackers-declared" ? (condition.atLeast ?? 1) : 1);
        break;
      case "blocker-declared": {
        const controller = state.objects[event.blocker]?.controller;
        met = controller !== undefined && by(controller) && named(event.blocker);
        break;
      }
      case "turn-began":
        met = by(event.activePlayer) && (condition.event !== "turn-began" || condition.turn === undefined || condition.turn === event.turn);
        break;
      case "step-began":
        met = condition.event === "step-began" && event.step === condition.step && (condition.player === undefined || active === condition.player);
        break;
      case "player-lost":
        met = by(event.player);
        break;
    }
    if (met) return i + 1;
  }
  return null;
}
