/**
 * Take-backs: a house rule, not a rule of the game. Where a game allows them
 * (`GameConfig.takeBacks`), it keeps the state as it stood when each of the
 * last few turns first waited on a player (`Game.markTurnStart`,
 * `GameState.takeBacks.turnStarts`: one turn per player, so a player's own
 * last turn is among them), and any player still in the game may spend one of
 * their take-backs to put the game back to one of those: everything since is
 * gone, for everyone, and the game is played on from there.
 *
 * What is put back is the whole state, the random stream's position with it,
 * so a card drawn or a library shuffled since comes out the same the second
 * time: a take-back changes what the players choose, never what the deck
 * deals. What isn't put back is the count of take-backs used.
 *
 * Pure over state, as everything but `Game` is. Whoever holds the game puts
 * the state `takeBackState` returns in the old one's place (the server's
 * `Room`, through `Game.fromSnapshot`).
 */

import type { GameEvent } from "./events.js";
import type { PlayerId } from "./primitives.js";
import type { GameState, TakeBacks, TurnStart } from "./state.js";
import { activePlayerOf, cloneGameState } from "./state.js";

/** How many take-backs `player` has left: a number, `"unlimited"`, or 0 where
 * the game allows none. */
export function takeBacksLeft(state: GameState, player: PlayerId): number | "unlimited" {
  const rule = state.takeBacks;
  if (rule === undefined) return 0;
  if (rule.limit === "unlimited") return "unlimited";
  return Math.max(0, rule.limit - (rule.used[player] ?? 0));
}

/** Whether going back to `start` would bring back a player who has since
 * conceded: they chose to leave, and their device may be gone. */
function undoesConcession(state: GameState, start: TurnStart): boolean {
  return state.turnOrder.some(
    (p) => state.players[p]?.lossReason === "conceded" && start.state.players[p]?.hasLost !== true,
  );
}

/** The turns `player` could take the game back to the start of now, oldest
 * first: none where they can't take anything back. */
export function takeBackTurns(state: GameState, player: PlayerId): readonly TurnStart[] {
  const rule = state.takeBacks;
  const seat = state.players[player];
  if (rule === undefined || seat === undefined || seat.hasLost || state.result.over) return [];
  if (takeBacksLeft(state, player) === 0) return [];
  return (rule.turnStarts ?? []).filter(
    (start) =>
      // The start of the turn in progress with nothing done since is where
      // the game already is.
      !(start.turn === state.turn.number && start.state.eventSeq === state.eventSeq) &&
      !undoesConcession(state, start),
  );
}

/** Why `player` can't take the game back to the start of turn `turn` now
 * (any turn at all, with none named), or `null` if they can. */
export function whyCannotTakeBack(state: GameState, player: PlayerId, turn?: number): string | null {
  const rule = state.takeBacks;
  if (rule === undefined) return "this game doesn't allow take-backs";
  const seat = state.players[player];
  if (seat === undefined) return `${player} isn't in this game`;
  if (state.result.over) return "the game is over";
  if (seat.hasLost) return "you've left the game";
  if (takeBacksLeft(state, player) === 0) return "you have no take-backs left";
  const turns = takeBackTurns(state, player);
  if (turn === undefined) return turns.length > 0 ? null : "nothing has happened yet to take back";
  if (turns.some((start) => start.turn === turn)) return null;
  const kept = (rule.turnStarts ?? []).find((start) => start.turn === turn);
  if (kept === undefined) return `the start of turn ${turn} isn't kept any more`;
  if (undoesConcession(state, kept)) return "a player has conceded since then";
  return "nothing has happened this turn yet";
}

/** The state as the turn in progress begins, to be kept on `state`
 * (`Game.markTurnStart`): a copy of everything but the rule's own record and
 * the event log, which only grows and so is kept by its length. */
export function turnStartOf(state: GameState): TurnStart {
  const { takeBacks: _rule, eventLog, ...rest } = state;
  return {
    turn: state.turn.number,
    player: activePlayerOf(state),
    events: eventLog.length,
    state: cloneGameState({ ...rest, eventLog: [] } as GameState),
  };
}

/**
 * The game after `player` takes it back to the start of turn `turn`: that
 * moment again, with one more take-back of theirs used and a
 * `turn-taken-back` event at the end of the log as it stood then. Throws
 * where `whyCannotTakeBack` has a reason. `state` is left as it was.
 */
export function takeBackState(state: GameState, player: PlayerId, turn: number): GameState {
  const why = whyCannotTakeBack(state, player, turn);
  if (why !== null) throw new Error(why);
  const rule = state.takeBacks as TakeBacks;
  const starts = rule.turnStarts ?? [];
  const start = starts.find((s) => s.turn === turn) as TurnStart;
  const next = cloneGameState(start.state);
  const event: GameEvent = { type: "turn-taken-back", player, turn, seq: next.eventSeq };
  next.eventLog = [...state.eventLog.slice(0, start.events), event];
  next.eventSeq += 1;
  next.takeBacks = {
    limit: rule.limit,
    used: { ...rule.used, [player]: (rule.used[player] ?? 0) + 1 },
    // The starts up to this one, itself included: a second take-back to it
    // lands on the same moment, without the event above.
    turnStarts: starts.filter((s) => s.turn <= turn),
  };
  return next;
}
