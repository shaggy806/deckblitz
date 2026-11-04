/**
 * Subset enumeration for bot candidate lists.
 *
 * Lives here rather than in `bot/decisions.ts` because a decision module's
 * `candidates` needs it and nothing under `decisions/` may reach into `bot/`.
 * `bot/decisions.ts` re-exports both, so `bot/candidates.ts` and
 * `eval-bot-combat.test.ts` import exactly what they imported before.
 *
 * **Order is load-bearing.** `Game.fromSnapshot` rollouts replay candidates in
 * the order these emit them, so a reordering shifts every `bot:bench` number
 * and silently re-points the frozen champions in `bot/champions/`.
 */

/** Every `k`-element subset of `items`, in order, stopping at `limit`. */
export function combinations<T>(items: readonly T[], k: number, limit: number): T[][] {
  const out: T[][] = [];
  const pick = (start: number, chosen: T[]): void => {
    if (out.length >= limit) return;
    if (chosen.length === k) {
      out.push([...chosen]);
      return;
    }
    for (let i = start; i <= items.length - (k - chosen.length); i += 1) {
      chosen.push(items[i]);
      pick(i + 1, chosen);
      chosen.pop();
      if (out.length >= limit) return;
    }
  };
  if (k >= 0 && k <= items.length) pick(0, []);
  return out;
}

/** Every `k`-element multiset of `items` (an item may repeat), each in
 * `items`' order, stopping at `limit`. */
export function multisets<T>(items: readonly T[], k: number, limit: number): T[][] {
  const out: T[][] = [];
  const pick = (start: number, chosen: T[]): void => {
    if (out.length >= limit) return;
    if (chosen.length === k) {
      out.push([...chosen]);
      return;
    }
    for (let i = start; i < items.length; i += 1) {
      chosen.push(items[i]);
      pick(i, chosen);
      chosen.pop();
      if (out.length >= limit) return;
    }
  };
  if (k >= 0 && (k === 0 || items.length > 0)) pick(0, []);
  return out;
}

/** The modes a modal choice may take, smallest first, stopping at `limit`:
 * subsets of size `min`..`max`, or multisets when a mode may be chosen more
 * than once (rule 700.2d). */
export function modeChoicesBetween<T>(
  items: readonly T[],
  min: number,
  max: number,
  repeat: boolean,
  limit: number,
): T[][] {
  if (!repeat) return subsetsBetween(items, min, max, limit);
  const out: T[][] = [];
  for (let k = Math.max(0, min); k <= max; k += 1) {
    out.push(...multisets(items, k, limit - out.length));
    if (out.length >= limit || items.length === 0) break;
  }
  return out;
}

/**
 * Every multiset of modes whose `costs` add up to at most `budget`, the empty
 * one first and fewer modes before more: "Choose up to five {P} worth of
 * modes" (rule 700.2i) with a mode repeatable (700.2d). Only the indices in
 * `usable` are taken. Every cost must be at least 1, so the walk ends.
 */
export function budgetedModeSets(
  costs: readonly number[],
  budget: number,
  usable: readonly number[],
): number[][] {
  const out: number[][] = [];
  const walk = (start: number, left: number, chosen: number[]): void => {
    out.push([...chosen]);
    for (let i = start; i < usable.length; i += 1) {
      const cost = costs[usable[i]];
      if (cost > left) continue;
      chosen.push(usable[i]);
      walk(i, left - cost, chosen);
      chosen.pop();
    }
  };
  walk(0, budget, []);
  return out.sort((a, b) => a.length - b.length);
}

/** Subsets of size `min`..`max`, smallest first, stopping at `limit`. */
export function subsetsBetween<T>(
  items: readonly T[],
  min: number,
  max: number,
  limit: number,
): T[][] {
  const out: T[][] = [];
  for (let k = Math.max(0, min); k <= Math.min(max, items.length); k += 1) {
    out.push(...combinations(items, k, limit - out.length));
    if (out.length >= limit) break;
  }
  return out;
}
