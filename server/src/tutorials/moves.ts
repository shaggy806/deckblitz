/**
 * What a `scripted` lesson leaves open (`LessonStep.allow`), so someone who
 * has never played can't press a button that leaves the lesson waiting for a
 * move that can no longer happen. Pure: the seat's legal actions in, the ones
 * the lesson leaves open out (which is all the client is told about, so what's
 * closed simply can't be clicked), and an action checked against the same list.
 *
 * It can never strand the player. A decision the card doesn't name (a discard,
 * say, or an attack no card is asking for) stays whole, and a priority window
 * where nothing the card names is possible can still be passed: the game has to
 * be able to reach what the card is waiting for.
 */

import type { Action, GameState, LegalAction, ObjectId } from "engine/local";
import type { TutorialAllows } from "protocol";
import type { LessonMove } from "./lesson.js";

/** Between cards there's only the game to watch. */
export const BETWEEN_CARDS: readonly LessonMove[] = [{ do: "pass" }];

const named = (names: string | readonly string[] | undefined, name: string): boolean =>
  names === undefined || [names].flat().includes(name);

/** `legal`, cut down to what `moves` leaves open. */
export function openActions(state: GameState, moves: readonly LessonMove[], legal: readonly LegalAction[]): readonly LegalAction[] {
  const nameOf = (id: ObjectId): string => state.objects[id]?.cardName ?? "";
  const open: LegalAction[] = [];
  for (const action of legal) {
    switch (action.kind) {
      case "pass-priority":
        if (moves.some((m) => m.do === "pass" || m.do === "pass-turn")) open.push(action);
        break;
      case "play-land":
        if (moves.some((m) => m.do === "play-land" && named(m.card, action.cardName))) open.push(action);
        break;
      case "cast-spell": {
        const move = moves.find((m) => m.do === "cast" && named(m.card, action.cardName));
        if (move?.do !== "cast") break;
        const aimed = move.target;
        open.push(
          aimed === undefined
            ? action
            : {
                ...action,
                targetOptions: action.targetOptions.map((slot) =>
                  slot.filter((o) => o.kind === "object" && nameOf(o.object) === aimed),
                ),
              },
        );
        break;
      }
      case "declare-attackers": {
        const move = moves.find((m) => m.do === "attack");
        open.push(
          move?.do === "attack"
            ? { ...action, eligible: action.eligible.filter((id) => named(move.card, nameOf(id))) }
            : action,
        );
        break;
      }
      case "declare-blockers": {
        const move = moves.find((m) => m.do === "block");
        open.push(
          move?.do === "block"
            ? { ...action, eligible: action.eligible.filter((e) => named(move.card, nameOf(e.blocker))) }
            : action,
        );
        break;
      }
      default:
        // The rest of a priority window (abilities, mana) is closed; any other
        // decision is the rules asking, and has to be answerable.
        if (state.awaiting !== null) open.push(action);
    }
  }
  if (open.length > 0 || state.awaiting !== null) return open;
  return legal.filter((action) => action.kind === "pass-priority");
}

/** Why `action` isn't open under `moves`, or `null` if it is. */
export function refusal(
  state: GameState,
  moves: readonly LessonMove[],
  legal: readonly LegalAction[],
  action: Action,
): string | null {
  const open = openActions(state, moves, legal);
  const closed = "The lesson is waiting for something else: see its card.";
  const declaring = (count: number): string | null => (count < allowsOf(moves).declareAtLeast ? closed : null);
  switch (action.type) {
    case "pass-priority":
      return open.some((a) => a.kind === "pass-priority") ? null : closed;
    case "play-land":
      return open.some((a) => a.kind === "play-land" && a.card === action.card) ? null : closed;
    case "cast-spell": {
      if (!open.some((a) => a.kind === "cast-spell" && a.card === action.card)) return closed;
      const move = moves.find((m) => m.do === "cast" && named(m.card, state.objects[action.card]?.cardName ?? ""));
      if (move?.do !== "cast" || move.target === undefined) return null;
      const aimed = (action.targets ?? []).every((t) => t?.kind === "object" && state.objects[t.object]?.cardName === move.target);
      return aimed ? null : closed;
    }
    case "commander-replacement":
      // A commander left in the graveyard couldn't be cast again: no card
      // waiting on it could ever be met.
      return action.toCommandZone ? null : closed;
    case "declare-attackers": {
      const offer = open.find((a) => a.kind === "declare-attackers");
      if (offer?.kind !== "declare-attackers") return closed;
      if (action.attackers.some((d) => !offer.eligible.includes(d.attacker))) return closed;
      const at = allowsOf(moves).attackAt;
      if (action.attackers.some((d) => at[state.objects[d.attacker]?.cardName ?? ""] !== undefined && at[state.objects[d.attacker]?.cardName ?? ""] !== d.defender)) return closed;
      return declaring(action.attackers.length);
    }
    case "declare-blockers": {
      const offer = open.find((a) => a.kind === "declare-blockers");
      if (offer?.kind !== "declare-blockers") return closed;
      if (action.blocks.some((b) => !offer.eligible.some((e) => e.blocker === b.blocker))) return closed;
      return declaring(action.blocks.length);
    }
    default:
      return state.awaiting !== null ? null : closed;
  }
}

/** The buttons `moves` leaves open that the legal actions can't speak for. */
export function allowsOf(moves: readonly LessonMove[]): TutorialAllows {
  const declaring = moves.find((m) => m.do === "attack" || m.do === "block");
  return {
    passTurn: moves.some((m) => m.do === "pass-turn"),
    autoPass: false,
    declareAtLeast: declaring !== undefined && "atLeast" in declaring ? declaring.atLeast : 0,
    attackAt: declaring?.do === "attack" ? (declaring.at ?? {}) : {},
    leaveCommander: false,
  };
}
