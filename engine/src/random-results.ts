/**
 * What a coin flip or a die roll came to (rules 705, 706): one record each,
 * carried by the `coin-flipped` and `dice-rolled` events and kept in the
 * journal, so a resolution, a trigger or a later instruction can ask. See
 * docs/plans/need-key-themes.md, theme 12's design note.
 */

import type { EffectSpec } from "./effects.js";
import type { JournalEntry } from "./journal.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type { GameState, ResolutionResume } from "./state.js";

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
  /** Die by die, as `results`, what modifiers from other sources added after
   * the roll (rule 706.2): "after you roll a die, you may pay 1 life. If you
   * do, increase or decrease the result by 1" (Night Shift of the Living
   * Dead — {@link RollShift}). Absent when nothing was shifted. */
  readonly shifts?: readonly number[];
  /** The natural results' sum plus `modifier` and the `shifts`: the roll's
   * result (706.2). */
  readonly total: number;
  readonly ignored?: readonly number[];
}

/** The `dice-rolled` event's fields, as a record. */
export function rollOfEvent(event: {
  readonly player: PlayerId;
  readonly sides: number;
  readonly results: readonly number[];
  readonly modifier?: number;
  readonly shifts?: readonly number[];
}): RollRecord {
  const modifier = event.modifier ?? 0;
  const shifted = event.shifts?.reduce((n, s) => n + s, 0) ?? 0;
  return {
    player: event.player,
    sides: event.sides,
    results: event.results,
    modifier,
    ...(event.shifts !== undefined ? { shifts: event.shifts } : {}),
    total: event.results.reduce((n, r) => n + r, 0) + modifier + shifted,
  };
}

/**
 * Each die's result, in the order rolled: its natural result with every
 * modifier (rule 706.2) — the instruction's, and what a shift after the roll
 * added to that die. What "for each odd result", "doubles" (706.5) and "choose
 * one result" read.
 */
export function dieResults(roll: RollRecord): readonly number[] {
  if (roll.modifier === 0 && roll.shifts === undefined) return roll.results;
  return roll.results.map((natural, i) => natural + roll.modifier + (roll.shifts?.[i] ?? 0));
}

/**
 * "After you roll a die, you may pay 1 life. If you do, increase or decrease
 * the result by 1. Do this only once each turn" (Night Shift of the Living
 * Dead); "… you may remove a +1/+1 counter from this creature. If you do, …"
 * (Xenosquirrels) — a static ability's `shiftsRoll`. A modifier from another
 * source (rule 706.2), optional and with a cost (706.2a): after each die its
 * controller rolls, before anything reads the result, they may pay the cost
 * to move that die's result up or down by `by`. Each die is "a die" rolled
 * (The Space Family Goblinson's ruling), so each gives it one chance; seeing
 * every result first, they choose which die and which way (Night Shift's
 * ruling). Asked as a `choose-modes` of every shift on offer
 * (`Game.askRollShift`), the player choosing the order they apply in (706.2b).
 * There is no lower or upper bound: a 1 decreased is 0 (706.2).
 */
export interface RollShift {
  /** How far either way: "increase or decrease the result by 1". */
  readonly by: number;
  /** "You may pay N life" (rule 119.4: only with at least that much). */
  readonly payLife?: number;
  /** "You may remove a +1/+1 counter from this creature": one counter of
   * this kind off the permanent with the ability. */
  readonly removeCounter?: string;
  /** "Do this only once each turn": done, it's done for the turn — for this
   * object (rule 400.7), journaled as the ability's `done`. Declining isn't
   * doing it. */
  readonly oncePerTurn?: true;
}

/** One shift on offer: the permanent `by` (in `stint`) pays to move die
 * `die` by `delta`; `key` is the ability's, for its once each turn. */
export interface RollShiftOption {
  readonly by: ObjectId;
  readonly stint: number;
  readonly key: string;
  readonly die: number;
  readonly delta: number;
  readonly payLife?: number;
  readonly removeCounter?: string;
  readonly oncePerTurn?: true;
}

/**
 * A shift on offer as its mode reads: "Pay 1 life: 5 → 6", "Remove a +1/+1
 * counter: die 2, 3 → 2" — `dice` the results so far — led by the
 * permanent's `name` when more than one offers.
 */
export function rollShiftText(option: RollShiftOption, dice: readonly number[], name?: string): string {
  const cost =
    option.payLife !== undefined
      ? `Pay ${option.payLife} life`
      : option.removeCounter !== undefined
        ? `Remove a ${option.removeCounter} counter`
        : "Shift";
  const from = dice[option.die];
  const which = dice.length > 1 ? `die ${option.die + 1}, ` : "";
  return `${name !== undefined ? `${name}: ` : ""}${cost}: ${which}${from} → ${from + option.delta}`;
}

/**
 * What a roll carries on with once its result is final (`Game.finishRoll`),
 * when a shift was asked between: the rest of the `roll-dice` effect (`then`,
 * with the result as its `rolled`) under the resolution it was part of; the
 * visit a roll to visit makes (rule 701.52a); the stored results a reroll
 * replaces (Centaur of Attention, `into` die by die, then the rerolls of the
 * other kinds of die, `rest`); or the permanent about to enter that rolled as
 * it enters (Neverwinter Hydra — `enterChoice.rolledAsEnters`).
 */
export type RollThen =
  | { readonly kind: "effect"; readonly then: EffectSpec; readonly source: ObjectId; readonly resume: ResolutionResume }
  | { readonly kind: "visit" }
  | {
      readonly kind: "reroll-stored";
      readonly object: ObjectId;
      readonly stint: number;
      readonly into: readonly number[];
      readonly rest: readonly { readonly sides: number; readonly into: readonly number[] }[];
    }
  | { readonly kind: "enters"; readonly object: ObjectId };

/**
 * A roll thrown and not yet final: its dice are on the table and a shift is
 * being asked (the `choose-modes` decision's `shiftRoll`). `shifts` die by die
 * so far; `used` the shifts already made to it, as `key@die` — each ability
 * once a die.
 */
export interface RollInProgress {
  readonly player: PlayerId;
  readonly source?: ObjectId;
  readonly sides: number;
  readonly results: readonly number[];
  readonly modifier: number;
  readonly ignored?: readonly number[];
  readonly shifts: readonly number[];
  readonly used: readonly string[];
  readonly then: RollThen;
}

/** One die of a roll: "whenever you roll a 4 or higher", "a natural 20". */
export interface DieTest {
  /** The die's result, its modifier included (706.2), is at least this. */
  readonly atLeast?: number;
  /** Its result, its modifier included, is at most this: "whenever you roll
   * a 1" (Complaints Clerk) is `{ atMost: 1 }`. */
  readonly atMost?: number;
  /** Its natural result is this; `"highest"` is the die's top face. */
  readonly natural?: number | "highest";
}

/** Each die of the roll that passes `test`, as its result (706.2). */
export function matchingDice(roll: RollRecord, test: DieTest | undefined): readonly number[] {
  const out: number[] = [];
  const results = dieResults(roll);
  for (let i = 0; i < roll.results.length; i += 1) {
    const natural = roll.results[i];
    const result = results[i];
    if (test?.atLeast !== undefined && result < test.atLeast) continue;
    if (test?.atMost !== undefined && result > test.atMost) continue;
    if (test?.natural !== undefined && natural !== (test.natural === "highest" ? roll.sides : test.natural)) continue;
    out.push(result);
  }
  return out;
}

/** What a `{ roll }` amount asks about a roll. */
export type RollQuery =
  /** The result: natural results plus every modifier. */
  | "total"
  /** How many dice came up odd, or even. */
  | "odd"
  | "even"
  /** The results but the one chosen ({@link ChooseValue}'s `x`). */
  | "other"
  /** The highest result. */
  | "highest"
  /** How many different numbers came up: doubles is 1 over two dice (706.5). */
  | "distinct"
  /** How many dice came up exactly N. */
  | { readonly equals: number }
  /** How many dice came up N or higher. */
  | { readonly atLeast: number };

/** What `query` asks of `roll`, each die read by its result ({@link dieResults}). */
export function rollRead(roll: RollRecord, query: RollQuery, chosen: number): number {
  if (query === "total") return roll.total;
  const results = dieResults(roll);
  if (query === "odd") return results.filter((r) => Math.abs(r) % 2 === 1).length;
  if (query === "even") return results.filter((r) => r % 2 === 0).length;
  if (query === "other") return results.reduce((n, r) => n + r, 0) - chosen;
  if (query === "highest") return results.reduce((n, r) => Math.max(n, r), 0);
  if (query === "distinct") return new Set(results).size;
  if ("equals" in query) return results.filter((r) => r === query.equals).length;
  return results.filter((r) => r >= query.atLeast).length;
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

/** Every roll made since event `since`, oldest first: what one instruction's
 * players each rolled ("each player rolls a d20" — Chaos Dragon). */
export function rollsSince(state: GameState, since: number): RollRecord[] {
  const out: RollRecord[] = [];
  for (const entry of entriesOf(state)) {
    if (entry.kind === "rolled" && entry.roll !== undefined && (entry.seq ?? -1) >= since) out.push(entry.roll);
  }
  return out;
}

/**
 * Each die `player` has rolled this turn that passes `test`, as its result
 * (706.2), oldest first — die by die, so three dice rolled at once are three
 * (The Space Family Goblinson's ruling). Only the dice kept: an ignored die
 * never happened (706.6), and a rerolled one is the reroll alone (the
 * rulings). With `beforeSeq`, only the rolls made before that event: what a
 * roll's own dice come after ("your third die each turn" — Resolute
 * Veggiesaur). The planar die is never journaled (706.7).
 */
export function diceRolledThisTurn(
  state: GameState,
  player: PlayerId,
  test?: DieTest,
  beforeSeq?: number,
): readonly number[] {
  const turn = state.turn.number;
  const out: number[] = [];
  for (const entry of entriesOf(state)) {
    if (entry.kind !== "rolled" || entry.roll === undefined || entry.turn !== turn || entry.player !== player) continue;
    if (beforeSeq !== undefined && (entry.seq ?? -1) >= beforeSeq) continue;
    out.push(...matchingDice(entry.roll, test));
  }
  return out;
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
