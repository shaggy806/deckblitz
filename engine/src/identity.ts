/**
 * Colour identity (rule 903.4 — ROADMAP Phase 9). A card's colour identity is
 * every colour in its mana cost *and* in any mana symbol in its rules text
 * (ability costs, CDAs), plus its colour indicator. Used for Commander deck
 * validation: every card must be within the commander's identity.
 *
 * This is a lexical scan — every `{…}` symbol anywhere in the card's declared
 * text and ability costs — which covers the cases that matter without a full
 * Oracle-text parser. **Reminder text is left out** (rule 903.4c): Crypt
 * Ghast's extort reminder shows {W/B} and the card is black alone, and
 * Trinisphere's example "{1}{B}" doesn't make it black. Reminder text is the
 * text in parentheses (rule 207.2a), so that is what the scan skips; a land
 * whose only mana symbols are its basic land types' reminder ("({T}: Add {R}
 * or {G}.)") has those abilities from its types (rule 305.6), which are
 * counted from the types themselves. `card:verify` checks every card's
 * result against Scryfall's.
 */

import type { CardDefinition } from "./cards.js";
import type { Color } from "./mana.js";
import { COLORS } from "./mana.js";

const SYMBOL = /\{([^}]*)\}/g;
/** Reminder text: what's in parentheses (rule 207.2a). */
const REMINDER = /\([^()]*\)/g;
/** The mana each basic land type's intrinsic ability makes (rule 305.6). */
const BASIC_LAND_TYPE_COLOR: Readonly<Record<string, Color>> = {
  Plains: "W",
  Island: "U",
  Swamp: "B",
  Mountain: "R",
  Forest: "G",
};

/** Pull the W/U/B/R/G letters out of every `{…}` symbol in `text`, its
 * reminder text aside (rule 903.4c). */
function colorsInText(text: string, into: Set<Color>): void {
  for (const match of text.replace(REMINDER, "").matchAll(SYMBOL)) {
    for (const ch of match[1].toUpperCase()) {
      if ((COLORS as readonly string[]).includes(ch)) into.add(ch as Color);
    }
  }
}

/** Where the other faces of a multi-face card are found by name — a
 * `CardRegistry` fits. */
export interface FaceLookup {
  has(name: string): boolean;
  get(name: string): CardDefinition;
}

/**
 * The colour identity of `def` — a set of `Color`s (rule 903.4). A card
 * with several faces has every face's (rule 903.4d — a double-faced card's
 * back face counts, and so does an adventurer's spell half, being part of
 * the same card), read through `faces`; without a lookup only `def` itself
 * is read, which is right for a single-faced card and nothing else. A
 * preparation card's prepare spell is printed in its text box (rule 722.1),
 * so its mana cost and text count too: Void Extrapolator is black with the
 * {U/B} Omit Variables inset, and blue-black.
 */
export function colorIdentityOf(def: CardDefinition, faces?: FaceLookup): Set<Color> {
  const identity = new Set<Color>();
  addIdentityOf(def, identity);
  if (faces !== undefined && def.faces !== null) {
    for (const name of def.faces) {
      if (name !== def.name && faces.has(name)) addIdentityOf(faces.get(name), identity);
    }
  }
  if (faces !== undefined && def.prepareSpell !== null && faces.has(def.prepareSpell)) {
    addIdentityOf(faces.get(def.prepareSpell), identity);
  }
  return identity;
}

/** One face's colours and mana symbols, into `identity`. */
function addIdentityOf(def: CardDefinition, identity: Set<Color>): void {
  // "This ability doesn't affect its color identity" (Fallaji Wayfarer): the
  // colours its characteristic-defining ability gives it don't count.
  if (def.colorsOutsideIdentity !== true) for (const c of def.colors) identity.add(c);
  colorsInText(def.manaCost ?? "", identity);
  colorsInText(def.text, identity);
  for (const ability of def.activated) {
    colorsInText(ability.cost.mana ?? "", identity);
    colorsInText(ability.text, identity);
  }
  for (const ability of def.triggered) colorsInText(ability.text, identity);
  for (const ability of def.static) colorsInText(ability.text, identity);
  // A land with a basic land type has that type's mana ability whether or
  // not it's printed (rule 305.6), usually as reminder text.
  if (def.types.includes("land")) {
    for (const subtype of def.subtypes) {
      const color = BASIC_LAND_TYPE_COLOR[subtype];
      if (color !== undefined) identity.add(color);
    }
  }
}

/** A colour chosen for each commander that chooses one before the game
 * begins, keyed by its name (`CardDefinition.chooseColorAsCommander`, rule
 * 903.4b). */
export type CommanderColors = Readonly<Record<string, Color>>;

/**
 * A deck's colour identity from its commanders (rule 903.4): each one's own,
 * a pair's together, and the colour chosen for a commander that chooses one
 * before the game begins (903.4b — Clara Oswald, The Prismatic Piper). A
 * colour named for a card without that ability, or for a name that isn't a
 * commander here, counts for nothing.
 */
export function commandersIdentity(
  commanders: readonly string[],
  registry: FaceLookup,
  chosen?: CommanderColors,
): Set<Color> {
  const identity = new Set<Color>();
  for (const name of commanders) {
    if (!registry.has(name)) continue;
    const def = registry.get(name);
    for (const c of colorIdentityOf(def, registry)) identity.add(c);
    const color = chosen?.[name];
    if (def.chooseColorAsCommander === true && color !== undefined && (COLORS as readonly string[]).includes(color)) {
      identity.add(color);
    }
  }
  return identity;
}

/** The commanders among `commanders` that choose a colour before the game
 * begins (`chooseColorAsCommander`, rule 903.4b) and have none in `chosen`. */
export function commandersWithoutColor(
  commanders: readonly string[],
  registry: FaceLookup,
  chosen?: CommanderColors,
): string[] {
  return commanders.filter(
    (name) => registry.has(name) && registry.get(name).chooseColorAsCommander === true && chosen?.[name] === undefined,
  );
}

/**
 * The colour a commander that chooses one (rule 903.4b) has to have chosen
 * for this deck, read off its cards: when exactly one such commander is
 * unchosen and the cards' identities (`identities`, one per card in the 99)
 * reach exactly one colour beyond the rest of the commanders' identity, that
 * colour. `chosen` comes back with it added, or as it was when the cards
 * don't settle it (none beyond — any colour is legal — or more than one).
 */
export function settleCommanderColors(
  commanders: readonly string[],
  identities: Iterable<Iterable<Color>>,
  registry: FaceLookup,
  chosen?: CommanderColors,
): CommanderColors {
  const open = commandersWithoutColor(commanders, registry, chosen);
  if (open.length !== 1) return { ...chosen };
  const base = commandersIdentity(commanders, registry, chosen);
  const beyond = new Set<Color>();
  for (const identity of identities) for (const c of identity) if (!base.has(c)) beyond.add(c);
  if (beyond.size !== 1) return { ...chosen };
  return { ...chosen, [open[0]]: [...beyond][0] };
}

/** Sorted WUBRG string form ("", "WU", "WUBRG") — handy for display / compare. */
export function identityString(identity: ReadonlySet<Color>): string {
  return COLORS.filter((c) => identity.has(c)).join("");
}

/** Is every colour of `card`'s identity within `commanderIdentity` (rule
 * 903.4)? Colourless cards are always legal. */
export function withinIdentity(
  card: ReadonlySet<Color>,
  commanderIdentity: ReadonlySet<Color>,
): boolean {
  for (const c of card) if (!commanderIdentity.has(c)) return false;
  return true;
}
