/**
 * What a coin flip or a die roll came to (rules 705, 706): one record each,
 * carried by the `coin-flipped` and `dice-rolled` events and kept in the
 * journal, so a resolution, a trigger or a later instruction can ask. See
 * docs/plans/need-key-themes.md, theme 12's design note.
 */

import type { JournalEntry } from "./journal.js";
import type { PlayerId } from "./primitives.js";
import type { GameState } from "./state.js";

export type CoinSide = "heads" | "tails";

/**
 * How one coin landed. `won` is absent on a flip that cares only about the
 * side, which no player wins or loses (rule 705.2). A flip with a call lands
 * `"heads"` when won: the call decides nothing a card can read.
 */
export interface FlipLanding {
  readonly came: CoinSide;
  readonly won?: boolean;
}

/**
 * One roll of one or more dice (rule 706). `results` are the natural results
 * of the dice kept (706.2), in the order rolled: an ignored die never
 * happened (706.6) and `ignored` is only for the log.
 */
export interface RollRecord {
  readonly player: PlayerId;
  readonly sides: number;
  readonly results: readonly number[];
  readonly modifier: number;
  /** The natural results' sum plus `modifier`: the roll's result (706.2). */
  readonly total: number;
  readonly ignored?: readonly number[];
}

/** The `dice-rolled` event's fields, as a record. */
export function rollOfEvent(event: {
  readonly player: PlayerId;
  readonly sides: number;
  readonly results: readonly number[];
  readonly modifier?: number;
}): RollRecord {
  const modifier = event.modifier ?? 0;
  return {
    player: event.player,
    sides: event.sides,
    results: event.results,
    modifier,
    total: event.results.reduce((n, r) => n + r, 0) + modifier,
  };
}

/** One die of a roll: "whenever you roll a 4 or higher", "a natural 20". */
export interface DieTest {
  /** The die's result, its modifier included (706.2), is at least this. */
  readonly atLeast?: number;
  /** Its natural result is this; `"highest"` is the die's top face. */
  readonly natural?: number | "highest";
}

/** Each die of the roll that passes `test`, as its result (706.2). */
export function matchingDice(roll: RollRecord, test: DieTest | undefined): readonly number[] {
  const out: number[] = [];
  for (const natural of roll.results) {
    const result = natural + roll.modifier;
    if (test?.atLeast !== undefined && result < test.atLeast) continue;
    if (test?.natural !== undefined && natural !== (test.natural === "highest" ? roll.sides : test.natural)) continue;
    out.push(result);
  }
  return out;
}

/** What a `{ roll }` amount asks about a roll. */
export type RollQuery =
  /** The result: natural results plus the modifier. */
  | "total"
  /** How many dice came up odd, or even. */
  | "odd"
  | "even"
  /** The natural results but the one chosen ({@link ChooseValue}'s `x`). */
  | "other"
  /** The highest natural result. */
  | "highest"
  /** How many different numbers came up: doubles is 1 over two dice (706.5). */
  | "distinct"
  /** How many dice came up exactly N. */
  | { readonly equals: number }
  /** How many dice came up N or higher. */
  | { readonly atLeast: number };

export function rollRead(roll: RollRecord, query: RollQuery, chosen: number): number {
  if (query === "total") return roll.total;
  if (query === "odd") return roll.results.filter((r) => r % 2 === 1).length;
  if (query === "even") return roll.results.filter((r) => r % 2 === 0).length;
  if (query === "other") return roll.results.reduce((n, r) => n + r, 0) - chosen;
  if (query === "highest") return roll.results.reduce((n, r) => Math.max(n, r), 0);
  if (query === "distinct") return new Set(roll.results).size;
  if ("equals" in query) return roll.results.filter((r) => r === query.equals).length;
  return roll.results.filter((r) => r >= query.atLeast).length;
}

/** Natural results to keep of `rolled`, ignoring the lowest (706.6) until
 * `keep` are left, the rest in order. Ties are the same number, so nobody
 * chooses between them. */
export function keepHighest(rolled: readonly number[], keep: number): { kept: readonly number[]; ignored: readonly number[] } {
  const kept = [...rolled];
  const ignored: number[] = [];
  while (kept.length > Math.max(0, keep)) {
    const lowest = kept.indexOf(Math.min(...kept));
    ignored.push(...kept.splice(lowest, 1));
  }
  return { kept, ignored };
}

/** The journal's entries, oldest first. */
function entriesOf(state: GameState): readonly JournalEntry[] {
  return state.journal?.entries ?? [];
}

/** The last roll made, by `player` if named, as far back as the journal
 * keeps (what a `{ roll }` amount reads). */
export function lastRollIn(state: GameState, player?: PlayerId): RollRecord | undefined {
  return lastRollEntry(state, player)?.roll;
}

/** The journal entry of the last roll, by `player` if named. */
export function lastRollEntry(state: GameState, player?: PlayerId): JournalEntry | undefined {
  const entries = entriesOf(state);
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i];
    if (entry.kind === "rolled" && entry.roll !== undefined && (player === undefined || entry.player === player)) return entry;
  }
  return undefined;
}

/** A word `thisWay` and the `this-way` condition take for a coin's landing. */
export type FlipThisWay = "flips-won" | "flips-lost" | "coins-heads" | "coins-tails";

export function isFlipThisWay(kind: string): kind is FlipThisWay {
  return kind === "flips-won" || kind === "flips-lost" || kind === "coins-heads" || kind === "coins-tails";
}

/** How many of the coins flipped since event `since` landed as `what`, by
 * `players` (everyone when absent). */
export function flipsSince(
  state: GameState,
  what: FlipThisWay,
  since: number,
  players?: readonly PlayerId[],
): number {
  let count = 0;
  for (const entry of entriesOf(state)) {
    const flip = entry.flip;
    if (entry.kind !== "flipped" || flip === undefined || (entry.seq ?? -1) < since) continue;
    if (players !== undefined && (entry.player === undefined || !players.includes(entry.player))) continue;
    if (
      (what === "flips-won" && flip.won === true) ||
      (what === "flips-lost" && flip.won === false) ||
      (what === "coins-heads" && flip.came === "heads") ||
      (what === "coins-tails" && flip.came === "tails")
    ) {
      count += 1;
    }
  }
  return count;
}

/** Whether `player` has flipped a coin this turn: "the first time you flip
 * one or more coins each turn". */
export function hasFlippedThisTurn(state: GameState, player: PlayerId): boolean {
  const turn = state.turn.number;
  return entriesOf(state).some((entry) => entry.kind === "flipped" && entry.player === player && entry.turn === turn);
}
