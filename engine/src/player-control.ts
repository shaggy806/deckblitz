/**
 * Who answers for whom (rule 723, "you choose which creatures attack", and
 * "you choose how each player votes").
 *
 * `Game` asks a *player* for every decision, and the action that answers it
 * names that player, whoever's hand pressed the button: the spell they cast is
 * theirs, the mana theirs, the discard from their hand (723.3, 723.5a). So
 * nothing in the rules reads this file. It is read only by what stands between
 * a person or a bot and `dispatch`: `Game`'s controller loop, the server's seat
 * check and bots, and `viewFor`.
 *
 * Asked: the player a decision is put to (`askedPlayer`). Answering: who makes
 * it (`answeringPlayer`), usually the same player.
 *
 * The readers are pure, over `GameState`.
 */

import type { CombatChoice, GameState, PlayerControl } from "./state.js";
import type { PlayerId } from "./primitives.js";

const inGame = (state: GameState, player: PlayerId): boolean => state.players[player]?.hasLost !== true;

/**
 * The control working on `player` now, if any. The last one created (723.1a);
 * one whose controller has left the game ended with them (800.4a). A player
 * given control of themselves counts: it is the last, and they answer (723.9).
 */
export function controlOf(state: GameState, player: PlayerId): PlayerControl | undefined {
  const all = state.playerControl;
  if (all === undefined) return undefined;
  for (let i = all.length - 1; i >= 0; i -= 1) {
    const control = all[i];
    if (control.controlled === player && control.began !== undefined && inGame(state, control.controller)) {
      return control;
    }
  }
  return undefined;
}

/** Who makes `player`'s decisions now. Follows the chain: a player controlling
 * another while being controlled themselves decides nothing (Word of Command
 * cast under Mindslaver would be one). */
export function decidingPlayer(state: GameState, player: PlayerId): PlayerId {
  if (state.playerControl === undefined) return player;
  const seen = new Set<PlayerId>([player]);
  let at = player;
  for (;;) {
    const next = controlOf(state, at)?.controller;
    if (next === undefined || seen.has(next)) return at;
    seen.add(next);
    at = next;
  }
}

/** The players `seat` makes the decisions of now, not counting itself. */
export function playersControlledBy(state: GameState, seat: PlayerId): readonly PlayerId[] {
  if (state.playerControl === undefined) return [];
  return state.turnOrder.filter((player) => player !== seat && decidingPlayer(state, player) === seat);
}

/** Who decides which of `player`'s creatures attack this turn, if that's been
 * given away: the last such effect (its chooser still in the game). The player
 * themselves choosing is no change, so none. */
export function attackChooser(state: GameState, player: PlayerId): PlayerId | null {
  const last = lastCombatChoice(state, (choice) => choice.attackers === true);
  return last === undefined || last.chooser === player ? null : last.chooser;
}

/** Who decides how `player`'s creatures block this turn, if that's been given
 * away. Brutal Hordechief's ruling: with two of them, the last ability to
 * resolve that covers this player. */
export function blockChooser(state: GameState, player: PlayerId): PlayerId | null {
  const last = lastCombatChoice(state, (choice) => coversBlocks(choice, player));
  return last === undefined || last.chooser === player ? null : last.chooser;
}

/** Who chooses how `player` votes this turn, if that's been given away
 * (Illusion of Choice): the last such effect to resolve, its chooser still in
 * the game (the card's ruling). */
export function voteChooser(state: GameState, player: PlayerId): PlayerId | null {
  const last = lastCombatChoice(state, (choice) => choice.votes === true);
  return last === undefined || last.chooser === player ? null : last.chooser;
}

/** Whether the decision raised now is one vote's result (rule 701.38) — not an
 * "each player chooses" (rule 101.4), which is held the same way. */
export function isVoteQuestion(state: GameState): boolean {
  const awaiting = state.awaiting;
  if (awaiting === null) return false;
  const castsVote =
    awaiting.kind === "choose-modes"
      ? awaiting.modes.length > 0 && awaiting.modes.every((mode) => mode.effect.kind === "cast-vote")
      : awaiting.kind === "choose-permanents"
        ? awaiting.then?.kind === "cast-vote"
        : false;
  if (!castsVote || !("source" in awaiting) || awaiting.source === undefined) return false;
  const held = state.voting?.[awaiting.source];
  return held !== undefined && held.choice !== true;
}

/** Whether "creatures your opponents control block this turn if able" holds of
 * `player`'s creatures. */
export function mustBlockByChoice(state: GameState, player: PlayerId): boolean {
  return (state.combatChoices ?? []).some(
    (choice) => choice.blockIfAble === true && coversBlocks(choice, player) && inGame(state, choice.chooser),
  );
}

function coversBlocks(choice: CombatChoice, player: PlayerId): boolean {
  return choice.blocks === "all" || (choice.blocks === "opponents" && choice.chooser !== player);
}

function lastCombatChoice(state: GameState, matches: (choice: CombatChoice) => boolean): CombatChoice | undefined {
  const all = state.combatChoices;
  if (all === undefined) return undefined;
  for (let i = all.length - 1; i >= 0; i -= 1) {
    if (matches(all[i]) && inGame(state, all[i].chooser)) return all[i];
  }
  return undefined;
}

/** The player the next decision is put to: the raised decision's, or whoever
 * holds priority. `null` for a mulligan, asked of every seat at once and before
 * any turn there could be control in. */
export function askedPlayer(state: GameState): PlayerId | null {
  const awaiting = state.awaiting;
  if (awaiting === null) return state.priority.holder;
  return awaiting.kind === "mulligan" ? null : awaiting.player;
}

/**
 * Who makes the decision being put to `asked`. A "you choose" effect first, for
 * the declarations it names: Cruel Entertainment's ruling has it take precedence
 * over a player being controlled. Then whoever controls that player.
 */
export function answeringPlayer(state: GameState, asked: PlayerId): PlayerId {
  const awaiting = state.awaiting;
  if (awaiting !== null && awaiting.kind !== "mulligan" && awaiting.player === asked) {
    const chooser =
      awaiting.kind === "attackers" && awaiting.group === undefined
        ? attackChooser(state, asked)
        : awaiting.kind === "blockers"
          ? blockChooser(state, asked)
          : state.combatChoices !== undefined && isVoteQuestion(state)
            ? voteChooser(state, asked)
            : null;
    if (chooser !== null) return decidingPlayer(state, chooser);
  }
  return decidingPlayer(state, asked);
}

/** The player a device on `seat` should see the table as: the one it's being
 * asked for now, or the player it controls while it's waiting, so a seat playing
 * another's turn doesn't swing back whenever a third player has priority. */
export function perspectiveOf(state: GameState, seat: PlayerId): PlayerId {
  const asked = askedPlayer(state);
  if (asked !== null && answeringPlayer(state, asked) === seat) return asked;
  return playersControlledBy(state, seat)[0] ?? seat;
}
