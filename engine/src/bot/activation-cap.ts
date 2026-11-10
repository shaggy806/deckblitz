/**
 * A backstop on how often v2 activates one ability of one permanent in a turn.
 *
 * An ability with no real cost can be activated for ever, and a bot that never
 * passes priority hangs the game it's in. `EvalBotController` refuses a tie
 * with passing, but a free activation can also measure *better* than passing
 * each time: real decks at a late board had it move Lightning Greaves' equip
 * {0} between General Kreat and Grenzo, Havoc Raiser, for as long as the game
 * ran (`docs/plans/strong-bot-decks.md`). v1 has its own limit
 * (`MAX_ACTIVATIONS_PER_TURN`), which its picks count, not v2's.
 *
 * Not a strategy: it only ends a repetition nothing else ends. A paid ability
 * stops when its cost runs out, so its limit is far above any honest turn (an
 * outlet sacrificing a board of tokens), there for a loop that pays for itself.
 */

import type { AbilityCost } from "../abilities.js";
import type { ObjectId } from "../primitives.js";

export const MAX_FREE_ACTIVATIONS_PER_TURN = 4;
export const MAX_PAID_ACTIVATIONS_PER_TURN = 40;

/**
 * Whether paying `cost` gives up nothing: no mana beyond {0}, no tap, and none
 * of the other costs. Any field this doesn't know counts as a cost, so a new
 * kind of cost is limited as a paid one.
 */
export function isFreeCost(cost: AbilityCost): boolean {
  return Object.entries(cost).every(([field, value]) => {
    if (field === "mana") return value === null || value === "{0}";
    return value === undefined || value === false;
  });
}

export class ActivationCap {
  private turn = -1;
  private readonly counts = new Map<string, number>();

  private roll(turn: number): void {
    if (turn === this.turn) return;
    this.turn = turn;
    this.counts.clear();
  }

  /** Whether this ability may be activated again on `turn`. */
  allows(turn: number, source: ObjectId, abilityIndex: number, free: boolean): boolean {
    this.roll(turn);
    const limit = free ? MAX_FREE_ACTIVATIONS_PER_TURN : MAX_PAID_ACTIVATIONS_PER_TURN;
    return (this.counts.get(`${source}:${abilityIndex}`) ?? 0) < limit;
  }

  note(turn: number, source: ObjectId, abilityIndex: number): void {
    this.roll(turn);
    const key = `${source}:${abilityIndex}`;
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1);
  }
}
