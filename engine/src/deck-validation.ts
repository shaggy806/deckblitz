/**
 * Commander-format deck validation (rule 903 — ROADMAP Phase 9). Pure and
 * synchronous: it only checks cards the engine already implements (an
 * unimplemented card is reported by the server's `/import-deck` feasibility
 * audit, not here). Returns a flat list of human-readable violations.
 *
 * Lives in the engine (not the server, where it originated) because it's
 * pure logic over `CardRegistry` data with no I/O — the client's deck
 * builder needs the exact same rules, synchronously, with no network round-
 * trip, so duplicating this between client and server would just invite
 * drift.
 */

import { colorIdentityOf, identityString, withinIdentity } from "./identity.js";
import { isCardFront, isTokenCard } from "./cards/classify.js";
import { COMMANDER_BANNED } from "./cards/generated-index.js";
import { manaValue, parseManaCost } from "./mana.js";
import type { Color } from "./mana.js";
import { hasSubtype, isCreatureType } from "./subtypes.js";
import type { CardDefinition, CardRegistry } from "./cards.js";
import type { Rulebreaker, RulebreakerCards } from "./cards/define.js";

export interface DeckToValidate {
  /** One or two commander card names (two = Partner / Background). */
  readonly commanders: readonly string[];
  /** Every other card in the 99, by name (repeats allowed for basics). */
  readonly cards: readonly string[];
  /** Total deck size the format wants, including commanders (100 for
   * Commander). */
  readonly size?: number;
}

export interface DeckValidationResult {
  readonly legal: boolean;
  readonly violations: readonly string[];
  /** The deck's cards banned in Commander (`COMMANDER_BANNED`), each once,
   * commanders first. Not a violation: the pool has them for casual play
   * among friends (the user's call, 2026-10-11), so the deck stays `legal`
   * to play here and the deck builder says what a real table would refuse. */
  readonly banned: readonly string[];
  /** The combined colour identity of the commander(s), as a WUBRG string. */
  readonly identity: string;
}

/** Names exempt from the singleton rule (903.5b) by being basic lands. */
export const BASIC_LANDS: ReadonlySet<string> = new Set([
  "Plains",
  "Island",
  "Swamp",
  "Mountain",
  "Forest",
  "Wastes",
  "Snow-Covered Plains",
  "Snow-Covered Island",
  "Snow-Covered Swamp",
  "Snow-Covered Mountain",
  "Snow-Covered Forest",
]);

/**
 * How many copies of a card a singleton deck may hold (rule 903.5b): one, any
 * number of a basic land, and whatever a card says of itself — "A deck can have
 * any number of cards named ~" (Rat Colony) or "up to seven" (Seven Dwarves),
 * which the card's text sets over the rule (101.1). `Infinity` means no limit.
 * A commander is one of those copies: this bounds the deck as a whole.
 */
export function copiesAllowed(name: string, registry: CardRegistry): number {
  if (BASIC_LANDS.has(name)) return Infinity;
  if (!registry.has(name)) return 1;
  const copies = registry.get(name).deckCopies;
  if (copies === null) return 1;
  return copies === "any" ? Infinity : copies;
}

/** A deck's commanders: none for a deck that isn't a Commander deck. */
export function commandersOf(deck: { readonly commanders?: readonly string[] }): readonly string[] {
  return deck.commanders ?? [];
}

/**
 * Whether `def` may be a deck's commander on its own. Rule 903.3: a
 * legendary card that is a creature card, a Vehicle card, or a Spacecraft
 * card with power/toughness — or, rule 903.3a, one that says it "can be your
 * commander", which is how a planeswalker commands (Lord Windgrace, but not
 * Garruk Wildspeaker). A Background isn't one: it commands only as the second
 * half of a pair ({@link isBackground}).
 */
export function canCommandAlone(def: CardDefinition): boolean {
  if (!def.supertypes.includes("legendary")) return false;
  return (
    def.canBeCommander ||
    def.types.includes("creature") ||
    // A creature card off the battlefield (Grist, the Hunger Tide) is a
    // legendary creature in the command zone (rule 903.3).
    def.static?.some((a) => a.selfOutsideBattlefield?.addTypes.includes("creature")) === true ||
    def.subtypes.includes("Vehicle") ||
    (def.subtypes.includes("Spacecraft") && def.power !== null)
  );
}

/** A legendary Background enchantment — the second commander a "Choose a
 * Background" commander may have (rule 702.124). */
export function isBackground(def: CardDefinition): boolean {
  return (
    def.supertypes.includes("legendary") &&
    def.types.includes("enchantment") &&
    def.subtypes.includes("Background")
  );
}

/** A legendary Time Lord Doctor creature with no other creature types — what
 * "Doctor's companion" pairs with (rule 702.124). */
function isLoneDoctor(def: CardDefinition): boolean {
  return (
    def.supertypes.includes("legendary") &&
    def.types.includes("creature") &&
    def.subtypes.length === 2 &&
    def.subtypes.includes("Time Lord") &&
    def.subtypes.includes("Doctor")
  );
}

/** How a pairing reads in a violation — the ability as printed. */
function pairingName(def: CardDefinition): string {
  const p = def.pairing;
  if (p === null) return "no partner ability";
  switch (p.kind) {
    case "partner":
      return "Partner";
    case "partner-with":
      return `Partner with ${p.name}`;
    case "partner-group":
      return `Partner—${p.group}`;
    case "choose-a-background":
      return "Choose a Background";
    case "doctors-companion":
      return "Doctor's companion";
  }
}

/** Does `a`'s pairing ability, on its own, let `b` be its partner? The
 * one-directional half of {@link pairingProblem}. */
function pairsWith(a: CardDefinition, b: CardDefinition): boolean {
  const p = a.pairing;
  const q = b.pairing;
  if (p === null) return false;
  switch (p.kind) {
    case "partner":
      return q?.kind === "partner";
    case "partner-with":
      return q?.kind === "partner-with" && p.name === b.name && q.name === a.name;
    case "partner-group":
      return q?.kind === "partner-group" && q.group === p.group;
    case "choose-a-background":
      return isBackground(b);
    case "doctors-companion":
      return isLoneDoctor(b);
  }
}

/**
 * Why `a` and `b` can't be one deck's two commanders, or `null` if they can
 * (rule 702.124). Every partner-family ability pairs only with its own kind:
 * two plain Partners, two "Partner with"s that name each other, two
 * "Partner—[text]"s with the same text, a "Choose a Background" commander and
 * a Background, a "Doctor's companion" and a Time Lord Doctor. The check
 * {@link validateCommanderDeck} applies, shared (as {@link canPairCommanders})
 * so the deck builder's commander toggle makes the same call.
 */
export function pairingProblem(registry: CardRegistry, a: string, b: string): string | null {
  const cant = `"${a}" and "${b}" can't be paired`;
  if (!registry.has(a) || !registry.has(b)) return `${cant}: not implemented`;
  if (a === b) return `${cant}: a deck can't have two copies of one commander`;
  const da = registry.get(a);
  const db = registry.get(b);
  if (pairsWith(da, db) || pairsWith(db, da)) return null;
  const pa = da.pairing;
  const pb = db.pairing;
  for (const [self, other, p] of [
    [a, b, pa],
    [b, a, pb],
  ] as const) {
    if (p?.kind !== "partner-with") continue;
    return p.name === other
      ? `${cant}: "${other}" doesn't have "Partner with ${self}"`
      : `${cant}: "${self}" can only be paired with "${p.name}"`;
  }
  if (pa?.kind === "choose-a-background") return `${cant}: "${a}" can only be paired with a Background`;
  if (pb?.kind === "choose-a-background") return `${cant}: "${b}" can only be paired with a Background`;
  if (pa?.kind === "doctors-companion") return `${cant}: "${a}" can only be paired with a Time Lord Doctor`;
  if (pb?.kind === "doctors-companion") return `${cant}: "${b}" can only be paired with a Time Lord Doctor`;
  if (isBackground(da) || isBackground(db)) {
    return `${cant}: a Background needs a commander with "Choose a Background"`;
  }
  if (pa !== null && pb !== null) {
    // Both have one, and not the same one (rule 702.124: different partner
    // abilities can't be combined).
    return `${cant}: ${pairingName(da)} and ${pairingName(db)} don't combine`;
  }
  return `${cant}: both commanders need Partner`;
}

/** Whether `a` and `b` may be one deck's two commanders — see
 * {@link pairingProblem}. */
export function canPairCommanders(registry: CardRegistry, a: string, b: string): boolean {
  return pairingProblem(registry, a, b) === null;
}

/** Whether `name` has a partner-family ability — any of them — and so could
 * take a second commander, given the right one ({@link canPairCommanders}). */
export function hasPartner(registry: CardRegistry, name: string): boolean {
  return registry.has(name) && registry.get(name).pairing !== null;
}

/**
 * Why `name` can't be a decklist entry at all, or `null` if it can. Tokens
 * aren't cards (rule 111.1), and a multi-face card is deck-listed under its
 * front face only (rule 712.3) — both are registered definitions, so without
 * this they'd pass every other check here silently.
 */
function notACardReason(name: string, def: CardDefinition): string | null {
  if (isTokenCard(def)) return `"${name}" is a token, not a card`;
  if (!isCardFront(def)) {
    return `"${name}" is the back face of ${def.faces?.[0] ?? def.meldOf?.join(" and ") ?? "another card"} — list the front face instead`;
  }
  return null;
}

/** The Rulebreaker abilities of a deck's commanders (the implemented ones). */
export function rulebreakersOf(commanders: readonly string[], registry: CardRegistry): readonly Rulebreaker[] {
  const out: Rulebreaker[] = [];
  for (const name of commanders) {
    if (!registry.has(name)) continue;
    const r = registry.get(name).rulebreaker;
    if (r !== null) out.push(r);
  }
  return out;
}

/** Whether `def` is one of the cards a {@link RulebreakerCards} names. A
 * changeling is every creature type in every zone (702.73a). */
function isRulebreakerCard(def: CardDefinition, cards: RulebreakerCards): boolean {
  if (cards.types?.some((t) => !def.types.includes(t))) return false;
  if (cards.supertypes?.some((t) => !def.supertypes.includes(t))) return false;
  const changeling = def.keywords.includes("changeling");
  if (cards.subtypes?.some((t) => !hasSubtype(def.subtypes, t) && !(changeling && isCreatureType(t)))) return false;
  if (cards.minManaValue !== undefined && manaValue(parseManaCost(def.manaCost)) < cards.minManaValue) return false;
  return true;
}

/** The colours of `def`'s identity outside `identity`. */
function colorsOutside(def: CardDefinition, identity: ReadonlySet<Color>, registry: CardRegistry): Color[] {
  return [...colorIdentityOf(def, registry)].filter((c) => !identity.has(c));
}

/**
 * Whether a deck commanded by `identity` with these Rulebreakers may hold
 * `def` as far as colour identity goes (903.5c and the Rulebreakers'
 * exceptions), one card at a time: a Tolabow-style extra colour is allowed
 * here for any one colour, since which one is the deck's choice — the deck
 * as a whole is held to one by {@link validateCommanderDeck}. The deck
 * builder's "in identity" filter reads this.
 */
export function fitsDeckIdentity(
  def: CardDefinition,
  identity: ReadonlySet<Color>,
  rulebreakers: readonly Rulebreaker[],
  registry: CardRegistry,
): boolean {
  if (withinIdentity(colorIdentityOf(def, registry), identity)) return true;
  for (const r of rulebreakers) {
    if (r.anyIdentity?.some((cards) => isRulebreakerCard(def, cards))) return true;
    if (r.extraColorFor?.some((t) => def.types.includes(t)) && colorsOutside(def, identity, registry).length <= 1) {
      return true;
    }
  }
  return false;
}

export function validateCommanderDeck(
  deck: DeckToValidate,
  registry: CardRegistry,
): DeckValidationResult {
  const violations: string[] = [];
  const size = deck.size ?? 100;

  // --- commanders --------------------------------------------------------
  if (deck.commanders.length < 1 || deck.commanders.length > 2) {
    violations.push(`a Commander deck has 1 or 2 commanders, this has ${deck.commanders.length}`);
  }
  const commanderIdentity = new Set<Color>();
  const paired = deck.commanders.length === 2;
  for (const name of deck.commanders) {
    if (!registry.has(name)) {
      violations.push(`commander "${name}" is not implemented`);
      continue;
    }
    const def = registry.get(name);
    const notACard = notACardReason(name, def);
    if (notACard !== null) violations.push(notACard);
    if (isBackground(def)) {
      // A Background commands only beside a "Choose a Background" commander;
      // a pair that isn't one is reported by the pairing check below.
      if (!paired) {
        violations.push(
          `"${name}" can't be a commander on its own (a Background needs a commander with "Choose a Background")`,
        );
      }
    } else if (!canCommandAlone(def)) {
      violations.push(
        `"${name}" can't be a commander (not a legendary creature or Vehicle, and it doesn't say it can be your commander)`,
      );
    }
    // A pair's colour identity is the union of both (rule 903.4).
    for (const c of colorIdentityOf(def, registry)) commanderIdentity.add(c);
  }
  // An unimplemented commander is already a violation above, and whether it
  // can pair is exactly what the registry can't say.
  const [first, second] = deck.commanders;
  if (paired && registry.has(first) && registry.has(second)) {
    const problem = pairingProblem(registry, first, second);
    if (problem !== null) violations.push(problem);
  }

  // --- the 99 ----------------------------------------------------------
  const rulebreakers = rulebreakersOf(deck.commanders, registry);
  // A Tolabow-style extra colour: each colour some card needs, with them.
  const extraColors = new Map<Color, string[]>();
  const counts = new Map<string, number>();
  for (const name of deck.cards) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  for (const [name, n] of counts) {
    if (!registry.has(name)) continue; // feasibility audit's job, not ours
    const notACard = notACardReason(name, registry.get(name));
    if (notACard !== null) violations.push(notACard);
    // A commander is a copy too: the limit is the deck's, not the 99's.
    const copies = n + deck.commanders.filter((c) => c === name).length;
    const allowed = copiesAllowed(name, registry);
    if (copies > allowed) {
      violations.push(
        allowed === 1
          ? `${copies}× "${name}" — singleton format allows only 1`
          : `${copies}× "${name}" — a deck can have up to ${allowed} cards with that name`,
      );
    }
    const def = registry.get(name);
    if (!fitsDeckIdentity(def, commanderIdentity, rulebreakers, registry)) {
      violations.push(
        `"${name}" is outside the commander's colour identity (${identityString(commanderIdentity) || "colourless"})`,
      );
    } else if (
      !withinIdentity(colorIdentityOf(def, registry), commanderIdentity) &&
      !rulebreakers.some((r) => r.anyIdentity?.some((cards) => isRulebreakerCard(def, cards)))
    ) {
      // Allowed only by an extra colour: the deck chooses one for them all.
      for (const c of colorsOutside(def, commanderIdentity, registry)) {
        extraColors.set(c, [...(extraColors.get(c) ?? []), name]);
      }
    }
  }
  if (extraColors.size > 1) {
    violations.push(
      `the commander allows one colour outside its identity for instants and sorceries, this deck uses ${extraColors.size} (` +
        [...extraColors].map(([c, names]) => `${c}: ${names.map((n) => `"${n}"`).join(", ")}`).join("; ") +
        ")",
    );
  }

  const total = deck.commanders.length + deck.cards.length;
  if (rulebreakers.some((r) => r.noMaximumSize === true)) {
    if (total < size) violations.push(`deck has ${total} cards, the format wants at least ${size}`);
  } else if (total !== size) {
    violations.push(`deck has ${total} cards, the format wants ${size}`);
  }

  const bannedNames = new Set(COMMANDER_BANNED);
  return {
    legal: violations.length === 0,
    violations,
    banned: [...new Set([...deck.commanders, ...deck.cards])].filter((name) => bannedNames.has(name)),
    identity: identityString(commanderIdentity),
  };
}
