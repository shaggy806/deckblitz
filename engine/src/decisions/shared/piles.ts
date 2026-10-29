/**
 * Separating objects into two piles and choosing one (rule 700.3) — what the
 * `separate-piles` and `choose-pile` decisions share: each object's rough
 * worth, whose it is, and a bot's read of which split and which pile are
 * best for it.
 */

import { effectiveTypes } from "../../characteristics.js";
import type { PileFateWord } from "../../effects.js";
import { manaValueOfObject } from "../../filter.js";
import type { ObjectId, PlayerId } from "../../primitives.js";
import type { DecisionReadCtx } from "../contract.js";

/** How much an object is worth to whoever has it, roughly: a land 1.5, a
 * token half its mana value plus a half, anything else its mana value, at
 * least 1. Only a bot's yardstick for weighing piles. */
export function pileWorth(ctx: DecisionReadCtx, ids: readonly ObjectId[]): Record<ObjectId, number> {
  const worth: Record<ObjectId, number> = {};
  for (const id of ids) {
    const object = ctx.state.objects[id];
    if (object === undefined) continue;
    if (effectiveTypes(ctx.state, ctx.registry, object).includes("land")) {
      worth[id] = 1.5;
      continue;
    }
    const mv = manaValueOfObject(ctx.registry, object);
    worth[id] = object.isToken === true ? 0.5 + mv / 2 : Math.max(1, mv);
  }
  return worth;
}

/** Who each object is about: a permanent's controller, a card's owner. */
export function pileWhose(ctx: DecisionReadCtx, ids: readonly ObjectId[]): Record<ObjectId, PlayerId> {
  const whose: Record<ObjectId, PlayerId> = {};
  for (const id of ids) {
    const object = ctx.state.objects[id];
    if (object === undefined) continue;
    whose[id] = object.zone === "battlefield" ? object.controller : object.owner;
  }
  return whose;
}

/** Why `piles` isn't a separation of `objects` into two piles, or `null`. */
export function whyNotTwoPiles(
  objects: readonly ObjectId[],
  piles: readonly (readonly ObjectId[])[],
  player: PlayerId,
): string | null {
  if (piles.length !== 2) return `${player} must separate them into two piles, not ${piles.length}`;
  const offered = new Set(objects);
  const seen = new Set<ObjectId>();
  for (const id of piles.flat()) {
    if (!offered.has(id)) return `${id} isn't one of the objects being separated`;
    if (seen.has(id)) return `${player} put ${id} into more than one pile`;
    seen.add(id);
  }
  // Rule 700.3a: each object goes into exactly one pile.
  return seen.size === offered.size ? null : `${player} must put every object into a pile`;
}

/** What one pile's fate is worth to `who` (positive is good for them). A
 * card going to its owner's hand or onto the battlefield is a gain for that
 * player; a permanent lost is a loss; a card from a library or graveyard put
 * into a graveyard or exile is roughly nothing. Another player's gain is
 * `who`'s loss. Objects missing from `worth` (a face-down card `who` can't
 * see) count `unseen` each. */
export function pileFateValue(
  pile: readonly ObjectId[],
  fate: PileFateWord | undefined,
  worth: Readonly<Record<ObjectId, number>>,
  whose: Readonly<Record<ObjectId, PlayerId>>,
  who: PlayerId,
  unseen = 2,
): number {
  if (fate === undefined) return 0;
  const sign = fate === "hand" || fate === "battlefield" ? 1 : fate === "lose" ? -1 : 0;
  if (sign === 0) return 0;
  let value = 0;
  for (const id of pile) {
    const w = worth[id] ?? unseen;
    value += whose[id] === who ? sign * w : -sign * w;
  }
  return value;
}

/** The index of the pile best for `chooser` to choose — the first on a tie. */
export function bestPileFor(
  piles: readonly (readonly ObjectId[])[],
  fates: { readonly chosen: PileFateWord; readonly rest?: PileFateWord },
  worth: Readonly<Record<ObjectId, number>>,
  whose: Readonly<Record<ObjectId, PlayerId>>,
  chooser: PlayerId,
): number {
  let best = 0;
  let bestValue = -Infinity;
  piles.forEach((pile, i) => {
    const others = piles.flatMap((p, j) => (j === i ? [] : p));
    const value =
      pileFateValue(pile, fates.chosen, worth, whose, chooser) +
      pileFateValue(others, fates.rest, worth, whose, chooser);
    if (value > bestValue) {
      bestValue = value;
      best = i;
    }
  });
  return best;
}

/** Past this many objects a separator balances the piles greedily instead
 * of weighing every split. */
const EXHAUSTIVE_UP_TO = 12;

/**
 * The split best for `separator`, expecting `chooser` to take the pile best
 * for them: every split of a dozen or fewer objects weighed, more than that
 * balanced greedily (most worth first, each into the lighter pile), which is
 * what a split against an opponent wants. Deterministic.
 */
export function bestSplitFor(
  objects: readonly ObjectId[],
  fates: { readonly chosen: PileFateWord; readonly rest?: PileFateWord },
  worth: Readonly<Record<ObjectId, number>>,
  whose: Readonly<Record<ObjectId, PlayerId>>,
  separator: PlayerId,
  chooser: PlayerId,
): ObjectId[][] {
  const outcome = (piles: ObjectId[][]): number => {
    const chosen = bestPileFor(piles, fates, worth, whose, chooser);
    const others = piles.flatMap((p, j) => (j === chosen ? [] : p));
    return (
      pileFateValue(piles[chosen], fates.chosen, worth, whose, separator) +
      pileFateValue(others, fates.rest, worth, whose, separator)
    );
  };
  if (objects.length <= EXHAUSTIVE_UP_TO) {
    let best: ObjectId[][] = [[], [...objects]];
    let bestValue = -Infinity;
    for (let mask = 0; mask < 1 << objects.length; mask += 1) {
      const piles: ObjectId[][] = [[], []];
      objects.forEach((id, i) => piles[(mask >> i) & 1].push(id));
      const value = outcome(piles);
      if (value > bestValue) {
        bestValue = value;
        best = piles;
      }
    }
    return best;
  }
  const piles: ObjectId[][] = [[], []];
  const totals = [0, 0];
  for (const id of [...objects].sort((a, b) => (worth[b] ?? 0) - (worth[a] ?? 0))) {
    const lighter = totals[0] <= totals[1] ? 0 : 1;
    piles[lighter].push(id);
    totals[lighter] += worth[id] ?? 0;
  }
  return piles;
}
