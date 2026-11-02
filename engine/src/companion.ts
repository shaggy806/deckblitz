/**
 * Companion's deck conditions (rule 702.139): "Companion—[Condition]" reads the
 * player's starting deck, the deck after sideboard cards are set aside and, in
 * a Commander game, before the commander is (702.139b), so a commander counts.
 *
 * Pure over the registry and a list of names, because three places ask before
 * or apart from a game: `Game` as it offers the reveal (rule 103.2b), the deck
 * builder beside a sideboard card, and the tests. The condition is plain data
 * on `CardDefinition.companion`; the ten printed ones are four shapes.
 */

import { colorIdentityOf, identityString, withinIdentity } from "./identity.js";
import { manaValue, parseManaCost } from "./mana.js";
import type { Color } from "./mana.js";
import { hasSubtype, EVERY_CREATURE_TYPE } from "./subtypes.js";
import type { CardDefinition, CardType } from "./cards/define.js";
import type { CardRegistry } from "./cards/card-registry.js";

/** Which of the deck's cards a condition is about: a "permanent card" is an
 * artifact, battle, creature, enchantment, land or planeswalker card (rule
 * 110.4a); "and land cards" in a condition makes its scope `"nonland"`. */
export type CompanionScope = "card" | "nonland" | "creature" | "permanent";

/** What each card in scope must be. A card in a library has its front face's
 * characteristics, and `{X}` counts 0 there (rule 202.3e). */
export type CompanionCardTest =
  /** "with even mana values" (Gyruda), "odd" (Obosh). */
  | { readonly manaValueIs: "even" | "odd" }
  /** "mana value 3 or greater" (Keruga). */
  | { readonly manaValueAtLeast: number }
  /** "mana value 2 or less" (Lurrus). */
  | { readonly manaValueAtMost: number }
  /** "is a Cat, Elemental, Nightmare, Dinosaur, or Beast card" (Kaheera). */
  | { readonly subtypeAmong: readonly string[] }
  /** "has an activated ability" (Zirda): a mana ability is one, and so is the
   * intrinsic one a basic land type gives (rule 305.6, the card's ruling). */
  | { readonly hasActivatedAbility: true }
  /** "more than one of the same mana symbol in its mana cost" (Jegantha):
   * the exact symbols, so `{X}{X}{R}` and `{R/G}{R/G}` both fail (the rulings). */
  | { readonly noRepeatedManaSymbol: true };

export type CompanionCondition =
  /** Each card in `of` passes `test`. */
  | { readonly kind: "each-card"; readonly of: CompanionScope; readonly test: CompanionCardTest }
  /** "Each nonland card … has a different name" (Lutri). */
  | { readonly kind: "different-names"; readonly of: CompanionScope }
  /** "Each nonland card … shares a card type" (Umori): one card type that every
   * one of them has (the card's ruling), not a chain of pairs. */
  | { readonly kind: "shared-card-type"; readonly of: CompanionScope }
  /** "At least twenty cards more than the minimum deck size" (Yorion): a
   * constructed deck's minimum is sixty (100.2a). A Commander deck is exactly a
   * hundred (903.5a), so it never has more (the card's ruling). */
  | { readonly kind: "deck-size-over-minimum"; readonly atLeast: number };

/** A starting deck by name: the library's cards, and any commanders beside
 * them (702.139b). The companion itself isn't in it. */
export interface StartingDeck {
  readonly cards: readonly string[];
  readonly commanders?: readonly string[];
}

/** Rule 100.2a. */
const CONSTRUCTED_MINIMUM_DECK_SIZE = 60;

const PERMANENT_TYPES: readonly CardType[] = ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"];
const BASIC_LAND_TYPES: readonly string[] = ["Plains", "Island", "Swamp", "Mountain", "Forest"];

function inScope(def: CardDefinition, of: CompanionScope): boolean {
  switch (of) {
    case "card":
      return true;
    case "nonland":
      return !def.types.includes("land");
    case "creature":
      return def.types.includes("creature");
    case "permanent":
      return def.types.some((t) => PERMANENT_TYPES.includes(t));
  }
}

/**
 * Whether a card as it lies in a deck has an activated ability (rule 602): a
 * printed one, wherever it's activated from (cycling from the hand, unearth
 * from a graveyard), or the mana ability a basic land type gives (305.6). A
 * special action isn't one (suspend, morph, foretell: rule 116). "Max speed —
 * {T}: …" is printed on the card, though authored as a static that grants it
 * (`maxSpeed`). An ability the card gets only as it's kicked ("enters with 'Pay
 * 3 life: Regenerate this creature'", Anavolver) is authored on `activated` too,
 * and counts here though a strict read wouldn't: see the family's report.
 */
export function hasActivatedAbility(def: CardDefinition): boolean {
  if (def.activated.length > 0 || def.cycling !== null) return true;
  if (def.static.some((s) => s.condition?.kind === "speed" && (s.grantsActivated?.length ?? 0) > 0)) return true;
  return def.types.includes("land") && def.subtypes.some((s) => BASIC_LAND_TYPES.includes(s));
}

function hasRepeatedManaSymbol(def: CardDefinition): boolean {
  const symbols = def.manaCost?.match(/\{[^}]+\}/g) ?? [];
  return new Set(symbols).size < symbols.length;
}

/** Why `def` fails `test`, in words, or `null` when it passes. */
function cardTestProblem(def: CardDefinition, test: CompanionCardTest): string | null {
  const mv = manaValue(parseManaCost(def.manaCost));
  if ("manaValueIs" in test) {
    const even = mv % 2 === 0;
    return even === (test.manaValueIs === "even") ? null : `"${def.name}" has mana value ${mv}`;
  }
  if ("manaValueAtLeast" in test) return mv >= test.manaValueAtLeast ? null : `"${def.name}" has mana value ${mv}`;
  if ("manaValueAtMost" in test) return mv <= test.manaValueAtMost ? null : `"${def.name}" has mana value ${mv}`;
  if ("subtypeAmong" in test) {
    // Changeling is every creature type wherever the card is (rule 702.73a).
    const subtypes = def.keywords.includes("changeling") ? [...def.subtypes, EVERY_CREATURE_TYPE] : def.subtypes;
    return test.subtypeAmong.some((s) => hasSubtype(subtypes, s)) ? null : `"${def.name}" is none of those types`;
  }
  if ("hasActivatedAbility" in test) {
    return hasActivatedAbility(def) ? null : `"${def.name}" has no activated ability`;
  }
  return hasRepeatedManaSymbol(def) ? `"${def.name}" repeats a mana symbol in its cost` : null;
}

/**
 * Why `deck` doesn't fulfil `condition`, in words, naming the first card that
 * breaks it, or `null` when it does. A name the registry doesn't know is the
 * deck's own problem, reported elsewhere.
 */
export function companionConditionProblem(
  condition: CompanionCondition,
  deck: StartingDeck,
  registry: CardRegistry,
): string | null {
  const names = [...(deck.commanders ?? []), ...deck.cards];
  if (condition.kind === "deck-size-over-minimum") {
    if ((deck.commanders?.length ?? 0) > 0) return "a Commander deck is exactly 100 cards";
    const wanted = CONSTRUCTED_MINIMUM_DECK_SIZE + condition.atLeast;
    return names.length >= wanted ? null : `the deck has ${names.length} cards, and this wants at least ${wanted}`;
  }
  const defs = names.filter((name) => registry.has(name)).map((name) => registry.get(name));
  const scoped = defs.filter((def) => inScope(def, condition.of));
  switch (condition.kind) {
    case "each-card":
      for (const def of scoped) {
        const problem = cardTestProblem(def, condition.test);
        if (problem !== null) return problem;
      }
      return null;
    case "different-names": {
      const seen = new Set<string>();
      for (const def of scoped) {
        if (seen.has(def.name)) return `the deck has more than one "${def.name}"`;
        seen.add(def.name);
      }
      return null;
    }
    case "shared-card-type": {
      const [first] = scoped;
      if (first === undefined) return null;
      const shared = first.types.some((t) => scoped.every((def) => def.types.includes(t)));
      return shared ? null : "no card type is shared by every one of those cards";
    }
  }
}

/** Why the card named `name` can't be revealed as a companion for `deck` (rule
 * 103.2b), or `null` if it can. Beside commanders it must also fall within their
 * colour identity, as a card of the deck must (903.5c), a pair's being the union
 * of both (903.4). The Comprehensive Rules leave this to the Commander format's
 * own rules, which is the user's call here (2026-11-01). */
export function companionProblem(name: string, deck: StartingDeck, registry: CardRegistry): string | null {
  if (!registry.has(name)) return `"${name}" is not implemented`;
  const def = registry.get(name);
  const condition = def.companion;
  if (condition === null) return `"${name}" has no companion ability`;
  const commanders = deck.commanders ?? [];
  if (commanders.length > 0) {
    const identity = new Set<Color>();
    for (const commander of commanders) {
      if (!registry.has(commander)) continue;
      for (const c of colorIdentityOf(registry.get(commander), registry)) identity.add(c);
    }
    if (!withinIdentity(colorIdentityOf(def, registry), identity)) {
      return `it's outside the commander's colour identity (${identityString(identity) || "colourless"})`;
    }
  }
  return companionConditionProblem(condition, deck, registry);
}
