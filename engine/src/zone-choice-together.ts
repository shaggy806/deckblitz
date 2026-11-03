/**
 * A rule over the chosen cards of a `choose-from-zone` decision *as a set* —
 * what a `CardFilter` can't say, since it checks each card on its own.
 *
 * - `"share"`: every chosen card has some tag in common with every other —
 *   Myriad Landscape's "up to two basic land cards **that share a land
 *   type**", where a card's tags are its land types (rule 205.3i). One card
 *   alone always passes (the card's ruling: "You can choose to find one basic
 *   land card").
 * - `"one-each"`: the chosen cards can be matched to different slots, one
 *   card per slot — Krosan Verge's "a Forest card and a Plains card", where a
 *   card's tags are the slots it could fill (a Forest Plains fills either, so
 *   two of them are both finds). Finding fewer than every slot is allowed —
 *   a search of a hidden zone may fail to find (rule 701.23b).
 * - `"total"`: the chosen cards' numbers — each card's one tag, its mana
 *   value — add up to `atLeast` or more: collect evidence N (rule 701.59a,
 *   "exile any number of cards from your graveyard with total mana value N
 *   or greater"); or to `atMost` or less — Lively Dirge's "up to two
 *   creature cards with total mana value 4 or less". With `orNone`, choosing
 *   nothing passes too (a "you may").
 * - `"distinct"`: no two chosen cards share a tag — Tiamat's "Dragon cards
 *   … that each have different names", a card's tags its names; Sigarda's
 *   Vanguard's "creatures with different powers", its one tag its power. A
 *   card with no tag has no name, so no different one (rule 201.2b).
 * - `"variety"`: the chosen cards' tags, all together, number `atLeast` or
 *   more — Winter, Cynical Opportunist's "any number of cards … with four or
 *   more card types among them", a card's tags its card types. With
 *   `orNone`, choosing nothing passes too.
 * - `"one-of-each"`: one chosen for each slot any eligible card can fill, and
 *   a card may stand for several ("a land of each basic land type": Global
 *   Ruin's ruling, a dual for both or either). So every slot with a candidate
 *   is covered, and every chosen card is the one chosen for some slot of its
 *   own — two Forests can't both be the Forest. `fitsSoFar` is the second half
 *   alone, for a set still being built.
 *
 * The tags are worked out as the decision is raised, so checking a set is
 * pure and needs neither the registry nor the layer fold: the validator
 * (`decisions/choose-from-zone.ts`), the bots and the client all use these
 * same functions. The tags say what kind of card each library card is, so
 * `view.ts` hides them from every player but the chooser.
 */

import type { ObjectId } from "./primitives.js";

export interface ZoneChoiceTogether {
  readonly rule: "share" | "one-each" | "total" | "distinct" | "variety" | "one-of-each";
  /** Each eligible card's tags: its land types (`share`), or the slots it
   * could fill (`one-each`, `one-of-each`). */
  readonly tags: Readonly<Record<string, readonly string[]>>;
  /** What a client tells the chooser — "that share a land type", "a Forest
   * card and a Plains card". */
  readonly text: string;
  /** `"total"`: the sum the chosen cards' tags must reach; `"variety"`: how
   * many different tags they must have among them. */
  readonly atLeast?: number;
  /** `"total"`: the sum the chosen cards' tags may not pass. */
  readonly atMost?: number;
  /** `"total"`, `"variety"`: choosing no card at all is allowed too. */
  readonly orNone?: boolean;
}

/** The card types a card outside the command zone can have (rule 205.2a):
 * what "each card type" and "a card type among" range over. */
export const EVERY_CARD_TYPE = [
  "artifact",
  "battle",
  "creature",
  "enchantment",
  "instant",
  "kindred",
  "land",
  "planeswalker",
  "sorcery",
] as const;

/** `"one-each"`: the most of `eligible` that can be chosen at once, a card a
 * slot — a bipartite matching, by augmenting paths. */
export function largestOneEach(together: ZoneChoiceTogether, eligible: readonly ObjectId[]): number {
  const holder = new Map<string, ObjectId>();
  const place = (id: ObjectId, seen: Set<string>): boolean => {
    for (const slot of together.tags[id] ?? []) {
      if (seen.has(slot)) continue;
      seen.add(slot);
      const other = holder.get(slot);
      if (other === undefined || place(other, seen)) {
        holder.set(slot, id);
        return true;
      }
    }
    return false;
  };
  let matched = 0;
  for (const id of eligible) if (place(id, new Set())) matched += 1;
  return matched;
}

/** `"total"`: the chosen cards' tags, as numbers, summed. */
const totalOf = (together: ZoneChoiceTogether, chosen: readonly ObjectId[]): number =>
  chosen.reduce((n, id) => n + Number(together.tags[id]?.[0] ?? 0), 0);

/** Why `chosen` breaks `together`, or `null` when it doesn't. Assumes each
 * card is already eligible and none is chosen twice (checked before this). */
export function togetherViolation(
  together: ZoneChoiceTogether,
  chosen: readonly ObjectId[],
): string | null {
  if (fitsTogether(together, chosen)) return null;
  if (together.rule === "one-of-each") return `the choice must be one for each of: ${oneOfEachSlots(together).join(", ")}`;
  if (together.rule === "total" || together.rule === "variety") return `the chosen cards must have ${together.text}`;
  return `the chosen cards must be ${together.rule === "share" || together.rule === "distinct" ? "cards " : ""}${together.text}`;
}

/** `"one-of-each"`: the slots some eligible card can fill, each to be covered. */
export function oneOfEachSlots(together: ZoneChoiceTogether): string[] {
  return [...new Set(Object.values(together.tags).flat())];
}

/** `"one-of-each"`: the slots `chosen` doesn't cover yet. */
export function slotsLeft(together: ZoneChoiceTogether, chosen: readonly ObjectId[]): string[] {
  const covered = new Set(chosen.flatMap((id) => together.tags[id] ?? []));
  return oneOfEachSlots(together).filter((slot) => !covered.has(slot));
}

/** Whether `chosen` can still grow into an answer: under `"one-of-each"`, that
 * each is the one chosen for a slot of its own, covered or not; under any other
 * rule, that it obeys the rule. */
export function fitsSoFar(together: ZoneChoiceTogether, chosen: readonly ObjectId[]): boolean {
  if (together.rule !== "one-of-each") return fitsTogether(together, chosen);
  return fitsTogether({ ...together, rule: "one-each" }, chosen);
}

/** Whether `chosen` obeys `together`. */
export function fitsTogether(together: ZoneChoiceTogether, chosen: readonly ObjectId[]): boolean {
  const tagsOf = (id: ObjectId): readonly string[] => together.tags[id] ?? [];
  if (together.rule === "one-of-each") return fitsSoFar(together, chosen) && slotsLeft(together, chosen).length === 0;
  if (together.rule === "total") {
    if (chosen.length === 0) return together.orNone === true;
    const total = totalOf(together, chosen);
    return total >= (together.atLeast ?? 0) && (together.atMost === undefined || total <= together.atMost);
  }
  if (together.rule === "variety") {
    if (chosen.length === 0) return together.orNone === true;
    return new Set(chosen.flatMap(tagsOf)).size >= (together.atLeast ?? 0);
  }
  if (together.rule === "distinct") {
    const seen = new Set<string>();
    for (const id of chosen) {
      if (tagsOf(id).length === 0) return false;
      for (const tag of tagsOf(id)) {
        if (seen.has(tag)) return false;
        seen.add(tag);
      }
    }
    return true;
  }
  if (together.rule === "share") {
    if (chosen.length < 2) return true;
    return tagsOf(chosen[0]).some((tag) => chosen.every((id) => tagsOf(id).includes(tag)));
  }
  // One card per slot: a matching that covers every chosen card. Nine slots
  // at most on a real card (Atraxa, Grand Unifier's card types), each card
  // fitting one or two, so plain backtracking is enough.
  const used = new Set<string>();
  const assign = (index: number): boolean => {
    if (index === chosen.length) return true;
    for (const tag of tagsOf(chosen[index])) {
      if (used.has(tag)) continue;
      used.add(tag);
      if (assign(index + 1)) return true;
      used.delete(tag);
    }
    return false;
  };
  return assign(0);
}

/**
 * A legal answer built from `preferred` — a chooser's pick that may not obey
 * `together` (a bot's ranking knows nothing of it). Keeps each preferred card
 * that still fits with the ones kept, in order, then tops up from `eligible`
 * (in order) to as many cards as were preferred, at least `min` and at most
 * `max`.
 */
export function completeTogether(
  together: ZoneChoiceTogether,
  preferred: readonly ObjectId[],
  eligible: readonly ObjectId[],
  min: number,
  max: number,
): ObjectId[] {
  // One for each slot: the preferred cards that still fit, then the first card
  // for each slot left. A slot left is free in any matching, so that card fits.
  if (together.rule === "one-of-each") {
    const kept: ObjectId[] = [];
    // Named twice is a stack's two tokens (`stackSizes`).
    for (const id of preferred) {
      if (eligible.includes(id) && fitsSoFar(together, [...kept, id])) kept.push(id);
    }
    for (const slot of slotsLeft(together, kept)) {
      if (slotsLeft(together, kept).includes(slot)) {
        const card = eligible.find((id) => (together.tags[id] ?? []).includes(slot));
        if (card !== undefined) kept.push(card);
      }
    }
    return kept;
  }
  // A sum to reach: the preferred cards first, then the rest in order, until
  // it is reached — nothing at all for a "you may" the chooser declined.
  // A cap to stay under: the preferred cards that still fit, in order, then
  // the rest, up to as many as were preferred.
  if (together.rule === "total" && together.atMost !== undefined) {
    const want = Math.min(max, Math.max(min, preferred.length));
    const kept: ObjectId[] = [];
    for (const id of [...preferred, ...eligible]) {
      if (kept.length >= want) break;
      if (kept.includes(id) || !eligible.includes(id)) continue;
      if (fitsTogether(together, [...kept, id])) kept.push(id);
    }
    return kept;
  }
  if (together.rule === "total" || together.rule === "variety") {
    if (preferred.length === 0 && together.orNone === true) return [];
    const kept: ObjectId[] = [];
    for (const id of [...preferred, ...eligible]) {
      if (fitsTogether(together, kept) && kept.length > 0) break;
      if (kept.includes(id) || !eligible.includes(id)) continue;
      kept.push(id);
    }
    return kept;
  }
  const want = Math.min(max, Math.max(min, preferred.length));
  const kept: ObjectId[] = [];
  for (const id of [...preferred, ...eligible]) {
    if (kept.length >= want) break;
    if (kept.includes(id) || !eligible.includes(id)) continue;
    if (fitsTogether(together, [...kept, id])) kept.push(id);
  }
  return kept;
}
