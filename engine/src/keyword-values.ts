/**
 * Keywords that carry a cost, as values a static can give a card or a spell.
 * See docs/plans/need-key-themes.md, theme 16's design note.
 *
 * A printed keyword stays where the card says it (`def.warp`, `def.madness`);
 * what a grant says is a {@link KeywordValue}, and `Game` folds the two into
 * one read for each keyword (`handKeywordValues`, `spellKeywordCosts`), so a
 * card with a printed keyword and a granted one has both, as the rules do.
 */

import type { CardDefinition, KickerAlsoCost } from "./cards/define.js";
import type { CardFilter } from "./filter.js";
import { reduceGenericInCost } from "./mana.js";

/**
 * A keyword's cost as a grant says it: a mana string; `"mana-cost"` ("the
 * replicate cost is equal to its mana cost", Djinn Illuminatus); or
 * `{ manaCostLess: N }` ("its foretell cost is equal to its mana cost reduced
 * by {2}", Dream Devourer, rule 118.7a: generic mana only).
 */
export type KeywordCost = string | "mana-cost" | { readonly manaCostLess: number };

/** One keyword with its cost. */
export type KeywordValue =
  | {
      readonly keyword:
        | "warp"
        | "ninjutsu"
        | "foretell"
        | "miracle"
        | "madness"
        | "blitz"
        | "evoke"
        | "offspring"
        | "emerge"
        | "freerunning"
        | "web-slinging"
        | "prowl";
      readonly cost: KeywordCost;
    }
  /** Cycling, or typecycling with `search` (702.29e). */
  | { readonly keyword: "cycling"; readonly cost: KeywordCost; readonly search?: CardFilter }
  /** Replicate (rule 702.56): paid any number of times, each a copy. */
  | { readonly keyword: "replicate"; readonly cost: KeywordCost; readonly also?: KickerAlsoCost };

/** A keyword a {@link KeywordValue} can name. */
export type KeywordValueName = KeywordValue["keyword"];

/**
 * The keyword costs a cast pays beyond kicker. Each is an additional cost of
 * its own (rules 702.56b, 702.175b), so a spell can have them beside a kicker,
 * and beside another instance of itself.
 */
export interface KeywordCostsPaid {
  /** A granted offspring cost, paid (702.175a). */
  readonly offspring?: true;
  /** How many times each replicate instance is paid, in
   * `Game.replicateInstancesOf`'s order (702.56b). */
  readonly replicate?: readonly number[];
}

/**
 * A granted cost as a mana string, read against the face being cast: `null`
 * for "its mana cost" on a card that has none. {@link KeywordCost}'s
 * `manaCostLess` takes generic mana only (118.7a).
 */
export function keywordCostString(cost: KeywordCost, def: Pick<CardDefinition, "manaCost">): string | null {
  if (cost === "mana-cost") return def.manaCost;
  if (typeof cost === "string") return cost;
  return def.manaCost === null ? null : reduceGenericInCost(def.manaCost, cost.manaCostLess);
}
