/**
 * Text-changing effects (rule 612, layer 3 — 613.1c): "change the text of
 * target spell or permanent by replacing all instances of one color word with
 * another" (Sleight of Mind), "one basic land type with another" (Magical
 * Hack) or "one creature type with another" (Artificial Evolution, New
 * Blood). A change is one word for another, `PtModifier.textChange`; an
 * object's changes, in timestamp order, make its rules text a definition of
 * its own, which the registry builds under a key (`textChangedKey`) that
 * `rulesTextName` returns — so every read of its abilities, keywords,
 * statics, filters and costs sees the changed words, as every read of an
 * exchanged text box sees the other card's (612.5).
 *
 * What changes (612.2 — only words used as a colour word or as a land type):
 *
 * - a colour word is a colour in a field that names one in the text:
 *   `colors`, `notColors`, `setColors`, `addColors`, `devotionTo`,
 *   `keepsUnspentMana`, `unspentManaBecomes`, a mana-spent clause's `colorWord` — "nonblack
 *   creature", "protection from red", "becomes white", "devotion to black", "unspent green
 *   mana", "three white mana was spent". A mana
 *   symbol is no word (`mana`, `oneOf`, `all`, `xColor`, every cost string),
 *   and neither is a choice's list of options (`chooseOnEnter`) or a chosen
 *   value;
 * - a basic land type is any string that is one (`subtypes`, `subtype`,
 *   `addSubtypes`, `setSubtypes`, a reveal-a-card cost's type...), and every
 *   landwalk or landcycling keyword — "swampwalk" to "plainswalk";
 * - a creature type is a string in a field that names one as a creature type
 *   ({@link CREATURE_TYPE_WORD_KEYS}: a filter's `subtype`, "non-Human"'s
 *   `notSubtypes`, "becomes a Zombie"'s `addSubtypes`, amass's
 *   `creatureType`, "other than Wall"'s `exclude`…) — **where the text
 *   prints it**. A creature type a keyword or a batch word stands for is no
 *   word on the card: afterlife's Spirits, embalm's Zombie, mutate's
 *   "non-Human", soulshift's Spirit, "outlaw"'s five types live in reminder
 *   text or in the rules, and stay. So a creature type changes in a node
 *   only when the nearest text over it (its ability's, its mode's, else the
 *   card's), reminder text left out, has the word: "Goblin", "Goblins",
 *   "non-Goblin", "Goblincycling" ({@link printsCreatureType});
 * - its type line's land types and creature types (612.1): `characteristics.ts`'s
 *   `printedSubtypes` applies {@link changeSubtypes} before layer 4, so a
 *   Forest made an Island taps for {U} (305.6) and is no Forest, and a
 *   Goblin made a Vampire is no Goblin;
 * - the words its client text, prompts and labels show (display only).
 *
 * Never a name (612.2): a card's name, a token's, "a card named Forest". A
 * face's printed colours and subtypes (an object with a `manaCost` — an
 * Adventure, a split half) are characteristics, not text, and stay. Nor what
 * a granted ability says (612.3): only the definition's own text changes.
 *
 * A token a changed ability creates takes the changed colour words ("create a
 * 1/1 white Soldier" made a blue one, rule 111.3: `create-token`'s
 * `tokenTextChanges`, a copiable colour on the token), and its changed
 * creature type words — its subtypes and its own text (612.4), and its name
 * where that is its creature types (612.2a: "create a 1/1 red Goblin creature
 * token" made a Vampire makes a "Vampire Token"). The same goes for every
 * other way a text names a token it makes: a gift's Fish (`gift`'s
 * `tokenTextChanges`) and a would-create-token replacement's tokens
 * (Chatterfang's Squirrels — the name carries the changes,
 * {@link changedTokenName}). A face-down permanent an effect lists the
 * characteristics of ("It's a 2/2 Cyberman artifact creature") has that
 * effect's changed creature type or land type (`faceDownTextChanges`, kept
 * on `GameObject.faceDown`). A token's land types stay. NOT yet: a static
 * that changes every object's text (Swirl the Mists).
 */

import type { CardDefinition } from "./cards/define.js";
import { CREATURE_TYPES } from "./creature-types.js";
import type { Color } from "./mana.js";
import { isCreatureType } from "./subtypes.js";

/** Rule 105.1's colour words, by colour. */
export const COLOR_WORDS: Readonly<Record<Color, string>> = {
  W: "white",
  U: "blue",
  B: "black",
  R: "red",
  G: "green",
};

/** Rule 205.3i's basic land types, in WUBRG order. */
export const BASIC_LAND_TYPE_WORDS: readonly string[] = ["Plains", "Island", "Swamp", "Mountain", "Forest"];

/** One text change: every instance of `from` becomes `to` — both colour
 * words ("black"), both basic land types ("Island") or both creature types
 * ("Goblin" — rule 205.3m). */
export interface TextChange {
  readonly from: string;
  readonly to: string;
}

export type TextWordKind = "color" | "land-type" | "creature-type";

/** What a "replace one [kind] with another" may replace: `change-text`'s
 * `words`. */
export type TextWords = "color" | "land-type" | "color-or-land-type" | "creature-type";

/** What a word is to a text change, or `undefined` for none of them. */
export function textWordKind(word: string): TextWordKind | undefined {
  if ((Object.values(COLOR_WORDS) as string[]).includes(word)) return "color";
  if (BASIC_LAND_TYPE_WORDS.includes(word)) return "land-type";
  if (isCreatureType(word)) return "creature-type";
  return undefined;
}

/** The words a "replace one [kind] with another" offers: every creature
 * type of rule 205.3m's list for a creature type ("You must choose an
 * existing creature type" — New Blood's ruling). */
export function textWords(kind: TextWords): readonly string[] {
  const colors = Object.values(COLOR_WORDS);
  if (kind === "color") return colors;
  if (kind === "land-type") return BASIC_LAND_TYPE_WORDS;
  if (kind === "creature-type") return CREATURE_TYPES;
  return [...colors, ...BASIC_LAND_TYPE_WORDS];
}

/** Creature types whose plural isn't "-s" / "-es" / "-ies", as rules text
 * spells them ("Elves", "Mice", "Oxen", "Heroes"). */
const IRREGULAR_PLURALS: Readonly<Record<string, string>> = {
  Child: "Children",
  Cyclops: "Cyclopes",
  Dwarf: "Dwarves",
  Elf: "Elves",
  Fungus: "Fungi",
  Hero: "Heroes",
  Homunculus: "Homunculi",
  Mouse: "Mice",
  Ox: "Oxen",
  Pegasus: "Pegasi",
  Werewolf: "Werewolves",
  Wolf: "Wolves",
};

/** Creature types whose plural is the word itself ("three Merfolk"). */
const SAME_PLURAL: ReadonlySet<string> = new Set([
  "Aetherborn",
  "Astartes",
  "Aurochs",
  "Bison",
  "Custodes",
  "Eldrazi",
  "Elk",
  "Fish",
  "Jellyfish",
  "Kavu",
  "Kithkin",
  "Kor",
  "Merfolk",
  "Moonfolk",
  "Samurai",
  "Sheep",
  "Starfish",
  "Thalakos",
  "Vedalken",
]);

/** A creature type's plural, as rules text writes it ("Goblins", "Allies",
 * "Sphinxes", "Elves"). */
export function creatureTypePlural(type: string): string {
  const irregular = IRREGULAR_PLURALS[type];
  if (irregular !== undefined) return irregular;
  if (SAME_PLURAL.has(type)) return type;
  if (/(s|x|z|ch|sh)$/.test(type)) return `${type}es`;
  if (/[^aeiou]y$/.test(type)) return `${type.slice(0, -1)}ies`;
  return `${type}s`;
}

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

const creatureTypePatterns = new Map<string, RegExp>();

/**
 * Where `type` is written as a creature type in a text: the word or its
 * plural, alone ("Goblin", "Goblins") or after "non-" ("non-Goblin" — the
 * ruling's "part of a word"), or as typecycling's word ("Goblincycling",
 * "slivercycling"). Groups: 1 "non-", 2 the plural, 3 the word, 4 the
 * typecycling word's first letter and 5 the rest of it. Not inside another
 * word or a hyphenated one ("Power-Plant" is no Plant).
 */
function creatureTypePattern(type: string): RegExp {
  const known = creatureTypePatterns.get(type);
  if (known !== undefined) return known;
  const plural = creatureTypePlural(type);
  // "Merfolk" is its own plural: read as the word.
  const pluralForm = plural === type ? "(?!)" : escapeRegExp(plural);
  const pattern = new RegExp(
    `(?<![\\p{L}\\-’'])(?:([Nn]on-)?(?:(${pluralForm})|(${escapeRegExp(type)}))(?![\\p{L}\\-])` +
      `|([${type[0].toUpperCase()}${type[0].toLowerCase()}])(${escapeRegExp(type.slice(1))}cycling)(?!\\p{L}))`,
    "gu",
  );
  creatureTypePatterns.set(type, pattern);
  return pattern;
}

/** `text` without its reminder text (rule 207.2a — not rules text). */
export function withoutReminderText(text: string): string {
  return text.replace(/\([^)]*\)/g, "");
}

/** Whether `text` (reminder text and all) writes `type` as a creature type
 * outside its reminder text — see {@link creatureTypePattern}. */
export function printsCreatureType(text: string, type: string): boolean {
  const pattern = creatureTypePattern(type);
  pattern.lastIndex = 0;
  return pattern.test(withoutReminderText(text));
}

const COLOR_OF_WORD: Readonly<Record<string, Color>> = Object.fromEntries(
  (Object.entries(COLOR_WORDS) as [Color, string][]).map(([c, w]) => [w, c]),
);

/** The prefix of a text-changed definition's key. `\u0002`, not the merged
 * key's `\u0001`, so the base it wraps may be a merged key. */
export const TEXT_CHANGED_PREFIX = "\u0002text\u0002";
const SEPARATOR = "\u0002";

/** The registry key of `base`'s rules text with `changes` applied in order. */
export function textChangedKey(base: string, changes: readonly TextChange[]): string {
  return TEXT_CHANGED_PREFIX + changes.map((c) => `${c.from}>${c.to}`).join(";") + SEPARATOR + base;
}

/** A {@link textChangedKey}'s base name and changes. */
export function parseTextChangedKey(key: string): { readonly base: string; readonly changes: readonly TextChange[] } {
  const rest = key.slice(TEXT_CHANGED_PREFIX.length);
  const at = rest.indexOf(SEPARATOR);
  const changes = rest
    .slice(0, at)
    .split(";")
    .map((pair) => {
      const [from, to] = pair.split(">");
      return { from, to };
    });
  return { base: rest.slice(at + 1), changes };
}

/** The prefix of a token name a text change reached ({@link changedTokenName}). */
const CHANGED_TOKEN_PREFIX = "\u0002token\u0002";

/**
 * A would-create-token replacement's token, named in a changed text: `base`
 * (a token definition's name) with `change` added to what its maker's text
 * changed (rules 111.3, 612.2a — Chatterfang's "1/1 green Squirrel" made a
 * Vampire). Only `Game`'s token event reads these names, through
 * {@link splitChangedTokenName}; what it mints is `base`, with the changes
 * on it as copiable values.
 */
export function changedTokenName(base: string, change: TextChange): string {
  const known = splitChangedTokenName(base);
  return textChangedKey(known.base, [...known.changes, change]).replace(TEXT_CHANGED_PREFIX, CHANGED_TOKEN_PREFIX);
}

/** `base` with each of `changes` added ({@link changedTokenName}); `base`
 * itself for none. */
export function tokenNameWithChanges(base: string, changes: readonly TextChange[] | undefined): string {
  return (changes ?? []).reduce(changedTokenName, base);
}

/** A token name's definition and the text changes its maker's text made to
 * it — none for a plain name. */
export function splitChangedTokenName(name: string): { readonly base: string; readonly changes: readonly TextChange[] } {
  if (!name.startsWith(CHANGED_TOKEN_PREFIX)) return { base: name, changes: [] };
  return parseTextChangedKey(TEXT_CHANGED_PREFIX + name.slice(CHANGED_TOKEN_PREFIX.length));
}

/** `subtypes` with `changes`' land types and creature types applied in order
 * (a type line's words, rule 612.1). Duplicates fold: a Forest Island whose
 * Forest became an Island is an Island. */
export function changeSubtypes(subtypes: readonly string[], changes: readonly TextChange[]): readonly string[] {
  let out = subtypes;
  for (const change of changes) {
    const kind = textWordKind(change.from);
    if ((kind !== "land-type" && kind !== "creature-type") || !out.includes(change.from)) continue;
    out = [...new Set(out.map((t) => (t === change.from ? change.to : t)))];
  }
  return out;
}

/**
 * Whether a token definition's name is its creature types — rule 111.4's
 * name for a token its maker didn't name ("Goblin Token", the pool's "1/1
 * Blue Bird Token") — rather than one it was given ("Marit Lage", "Storm
 * Crow", "Walker"). Only such a name is a creature type word a text change
 * reaches (rule 612.2a).
 */
export function tokenNamedByTypes(def: CardDefinition): boolean {
  const name = (def.tokenName ?? def.name).replace(/\s*\([^)]*\)$/, "");
  const types = def.subtypes.filter(isCreatureType);
  if (types.length === 0) return false;
  if (name === types.join(" ")) return true;
  if (!name.endsWith(" Token")) return false;
  const words = name.slice(0, -" Token".length).split(" ");
  return types.every((type) => type.split(" ").every((word) => words.includes(word)));
}

/**
 * What a token its maker's changed text creates is, beside its definition:
 * the changes that reach it (rules 111.3, 612.4 — a colour it has, a creature
 * type it has or its own text names) and the name they give it (612.2a — a
 * Goblin Token made a Vampire is a "Vampire Token"; a token with a name of its
 * own keeps it). `Game` makes copiable values of these as it mints the token.
 */
export function tokenTextChangesFor(
  def: CardDefinition,
  changes: readonly TextChange[] | undefined,
): { readonly colors?: readonly Color[]; readonly textChanges: readonly TextChange[]; readonly name?: string } {
  if (changes === undefined || changes.length === 0) return { textChanges: [] };
  const colors = tokenColorsAfter(def.colors, changes);
  const textChanges: TextChange[] = [];
  let subtypes = def.subtypes;
  for (const change of changes) {
    if (textWordKind(change.from) !== "creature-type") continue;
    if (!subtypes.includes(change.from) && !printsCreatureType(changeDefinitionText(def, textChanges).text, change.from)) continue;
    textChanges.push(change);
    subtypes = changeSubtypes(subtypes, [change]);
  }
  const renamed = subtypes !== def.subtypes && tokenNamedByTypes(def);
  return {
    ...(colors !== undefined ? { colors } : {}),
    textChanges,
    ...(renamed ? { name: `${subtypes.filter(isCreatureType).join(" ")} Token` } : {}),
  };
}

/** Fields that name a creature type as a creature type ("a Goblin you
 * control", "non-Human", "becomes a Zombie", "amass Orcs", "other than Wall",
 * "reveal a Giant card", Dawn-Blessed Pennant's "choose Elemental, Elf,
 * Faerie, or Giant", A Killer Among Us's "Human, Merfolk, or Goblin"): what a
 * creature type change reaches where the text prints the word. The pool
 * audit (`test/text-change-creature-types.test.ts`) holds that no other
 * field holds a creature type but a name or a choice's value. */
export const CREATURE_TYPE_WORD_KEYS: ReadonlySet<string> = new Set([
  "subtype",
  "subtypes",
  "notSubtypes",
  "addSubtypes",
  "setSubtypes",
  "removeSubtypes",
  "subtypesAnyOf",
  "alsoSubtypes",
  "keepCreatureTypes",
  "creatureType",
  "exclude",
  "tappedUnlessRevealFromHand",
  "subtypeAmong",
  "chooseCreatureTypeMenu",
  "options",
  // A text change's own words: New Blood's "with Vampire", Artificial
  // Evolution's "can't be Wall" (`change-text`'s `to` and `notTo`).
  "to",
  "notTo",
]);

/** A definition's lists of abilities, each with a printed line of its own
 * (`text`): what {@link textBelow} reads in place of the card's whole text. */
const ABILITY_LIST_KEYS: ReadonlySet<string> = new Set(["triggered", "activated", "static", "chapters"]);

/** A would-create-token replacement's token names ({@link changedTokenName}). */
const REPLACEMENT_TOKEN_KEYS: ReadonlySet<string> = new Set([
  "plusTokens",
  "plusOneToken",
  "tokensInstead",
  "oneOfEach",
  "creatureTokensInstead",
]);

/** The creature type a gift's token is ("Gift a tapped Fish", rule 702.174). */
const GIFT_TOKEN_TYPES: Readonly<Record<string, string>> = { "tapped-fish": "Fish", octopus: "Octopus" };

/** Fields whose colours are colour words in the text. Every other field a
 * colour sits in is a mana symbol or a choice's value — the pool audit
 * (`test/text-change.test.ts`) holds the list of those. */
export const COLOR_WORD_KEYS: ReadonlySet<string> = new Set([
  // Sunglasses of Urza's "white mana as though it were red mana" (`SpendUnitAs`):
  // both are words, and rule 612.2 reaches them, unlike a mana symbol.
  "unit",
  "as",
  // Ruham Djinn's "as long as white is the most common color" (`most-common-color`).
  "color",
  "colors",
  "notColors",
  "setColors",
  "addColors",
  "devotionTo",
  // "Spend only black mana on X" (Crypt Rats — `AbilityCost.xSpendOnly`).
  "xSpendOnly",
  // Adamant's "at least three white mana was spent" (`ManaSpentQuery.colorWord`);
  // a mana-spent clause's `type` is a symbol, {U}{B} (Mythos of Brokkos), and stays.
  "colorWord",
  // Chroma's "each white mana symbol": the word names the colour (Light from
  // Within), though a symbol in a cost is no word.
  "manaSymbols",
  "keepsUnspentMana",
  // Omnath, Locus of All's "that mana becomes black instead".
  "unspentManaBecomes",
]);

/** Fields holding a name or a choice's options, never changed (612.2). */
const NAME_KEYS: ReadonlySet<string> = new Set([
  "name",
  "tokenName",
  "cardName",
  "hasName",
  "named",
  "token",
  "faces",
  "options",
  "chooseOnEnter",
  "value",
  "art",
  // Garth One-Eye's "Black Lotus".
  "copyOfCardNamed",
]);

/** Fields holding words the client shows. */
const DISPLAY_KEYS: ReadonlySet<string> = new Set(["text", "prompt", "label"]);

/** A face's printed characteristics (an object with its own `manaCost`). */
const FACE_KEYS: ReadonlySet<string> = new Set(["colors", "subtypes", "types", "supertypes", "manaCost", "name"]);

/** The definition's own printed characteristics: layer 4 changes its type
 * line's land types and creature types (`changeSubtypes`), and nothing
 * changes the rest. (`alsoSubtypes` — "is also a Cleric, Rogue, Warrior, and
 * Wizard" — is a text box's words, and changes.) */
const TOP_KEYS: ReadonlySet<string> = new Set([
  "name",
  "tokenName",
  "art",
  "manaCost",
  "colors",
  "supertypes",
  "types",
  "subtypes",
  "power",
  "toughness",
  "loyalty",
  "defense",
  "faces",
]);

const LAND_KEYWORD = /^(plains|island|swamp|mountain|forest)(walk|cycling)$/;

/** `text` with each of `names` (longest first) held out of a change. */
function maskNames(text: string, names: readonly string[]): { readonly masked: string; readonly held: readonly string[] } {
  const held: string[] = [];
  let masked = text;
  for (const name of names) {
    if (name.length === 0) continue;
    masked = masked.split(name).join(`\u0003${held.length}\u0003`);
    held.push(name);
  }
  return { masked, held };
}

const unmaskNames = (text: string, held: readonly string[]): string =>
  text.replace(/\u0003(\d+)\u0003/g, (_, i: string) => held[Number(i)]);

/** A creature type changed in a display string: "Goblin", "Goblins",
 * "non-Goblin", "Goblincycling", each in its own form. Inside a line's
 * reminder text only where that line's rules text has the word too:
 * soulshift's reminder keeps its Spirit, whatever becomes of a Spirit the
 * card's other lines name. */
function changeCreatureTypeDisplay(text: string, change: TextChange, names: readonly string[]): string {
  const { masked, held } = maskNames(text, names);
  const pattern = creatureTypePattern(change.from);
  const replace = (s: string): string =>
    s.replace(pattern, (_word: string, non?: string, plural?: string, _single?: string, first?: string) => {
      if (first !== undefined) {
        const to = first === first.toUpperCase() ? change.to : change.to.toLowerCase();
        return `${to.replace(/ /g, "")}cycling`;
      }
      return (non ?? "") + (plural !== undefined ? creatureTypePlural(change.to) : change.to);
    });
  const out = masked
    .split("\n")
    .map((line) => {
      const inReminders = printsCreatureType(line, change.from);
      return line.replace(/(\([^)]*\))|[^(]+|\(/g, (segment: string, reminder?: string) =>
        reminder !== undefined && !inReminders ? segment : replace(segment),
      );
    })
    .join("\n");
  return unmaskNames(out, held);
}

/** One word changed in a display string, its case kept; never inside the
 * card's own name. */
function changeDisplay(text: string, change: TextChange, names: readonly string[]): string {
  const kind = textWordKind(change.from);
  if (kind === undefined) return text;
  if (kind === "creature-type") return changeCreatureTypeDisplay(text, change, names);
  const { masked, held } = maskNames(text, names);
  const from = change.from.toLowerCase();
  const pattern =
    kind === "color"
      ? /\b(white|blue|black|red|green)\b/gi
      : /\b(plains|islands?|swamps?|mountains?|forests?)(walk|cycling)?\b/gi;
  const replaced = masked.replace(pattern, (word: string, base: string, group: unknown) => {
    // The colour pattern has one group, so its third argument is an offset.
    const suffix = typeof group === "string" ? group : undefined;
    const lower = base.toLowerCase();
    const singular = lower === "plains" || !lower.endsWith("s") ? lower : lower.slice(0, -1);
    if (singular !== from) return word;
    let to = change.to + (lower !== singular && change.to !== "Plains" ? "s" : "");
    if (kind === "color" || suffix !== undefined) to = to.toLowerCase();
    if (word[0] === word[0].toUpperCase()) to = to[0].toUpperCase() + to.slice(1);
    else to = to[0].toLowerCase() + to.slice(1);
    return to + (suffix ?? "");
  });
  return unmaskNames(replaced, held);
}

/** One change's walk over a definition. */
interface ChangeWalk {
  readonly change: TextChange;
  readonly kind: TextWordKind | undefined;
  readonly names: readonly string[];
}

/** `list` (a `TextChange[]` field, or nothing) with `change` added. */
const withChange = (list: unknown, change: TextChange): readonly TextChange[] => [
  ...((list as readonly TextChange[] | undefined) ?? []),
  change,
];

/**
 * The text over a node, for {@link printsCreatureType}: an ability's own
 * text (a top-level `triggered`, `activated` or `static` entry — "Soulshift
 * 4 (…)", not the card's other lines) in place of the card's, and below it
 * every text on the way down added to it — a mode's bullet, a choice's label,
 * a delayed or granted ability's words are all part of the line that prints
 * them. `top` says the next text starts a new line rather than adding to
 * this one.
 */
function textBelow(printed: string, own: unknown, top: boolean): string {
  if (typeof own !== "string" || own.trim().length === 0) return printed;
  return top ? own : `${own}\n${printed}`;
}

/**
 * `value` (under `key`) with the walk's change made. `printed` is the text
 * over it ({@link textBelow}): a creature type changes only where that
 * prints it (see the module doc).
 */
function changeValue(value: unknown, key: string | null, walk: ChangeWalk, printed: string, top = false): unknown {
  if (typeof value === "function") return value;
  const { change, kind, names } = walk;
  const creature = kind === "creature-type";
  if (key !== null && NAME_KEYS.has(key) && !(creature && CREATURE_TYPE_WORD_KEYS.has(key))) return value;
  if (Array.isArray(value)) {
    const out = value.map((v) => changeValue(v, key, walk, printed, top));
    // "white and/or blue" made "blue and/or blue" is one colour.
    return key !== null && (COLOR_WORD_KEYS.has(key) || key.toLowerCase().includes("subtype") || key.toLowerCase().includes("keyword") || (creature && CREATURE_TYPE_WORD_KEYS.has(key)))
      ? [...new Set(out)]
      : out;
  }
  if (value !== null && typeof value === "object") {
    const face = "manaCost" in value;
    const here = textBelow(printed, (value as { readonly text?: unknown }).text, top);
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = face && FACE_KEYS.has(k) ? v : changeValue(v, k, walk, here);
    }
    const prints = creature && printsCreatureType(here, change.from);
    // "Create a 1/1 white Soldier": the token's colour is one of this text's
    // words (rule 111.3), read off the token's definition as it's made; so
    // is "a 1/1 red Goblin", its creature type and its name (612.2a).
    if (out.kind === "create-token" && (kind === "color" || prints)) {
      out.tokenTextChanges = withChange(out.tokenTextChanges, change);
    }
    // "Gift a tapped Fish": the gift's token (rule 702.174).
    if (out.kind === "gift" && prints && GIFT_TOKEN_TYPES[out.gift as string] === change.from) {
      out.tokenTextChanges = withChange(out.tokenTextChanges, change);
    }
    // A would-create-token replacement's tokens (Chatterfang's Squirrels,
    // Jinnie Fay's "Cat or Dog" choice): their names carry the change.
    if (kind === "color" || prints) {
      for (const k of Object.keys(out)) {
        const v = out[k];
        const named = REPLACEMENT_TOKEN_KEYS.has(k) || (k === "token" && out.kind !== "create-token");
        if (!named) continue;
        if (typeof v === "string") out[k] = changedTokenName(v, change);
        else if (Array.isArray(v)) out[k] = v.map((name: unknown) => (typeof name === "string" ? changedTokenName(name, change) : name));
      }
    }
    // "It's a 2/2 Cyberman artifact creature", "It's a Forest land": what an
    // effect lists a face-down permanent as (rule 708.2), a text of its own.
    for (const k of ["faceDown", "as"] as const) {
      const listed = out[k];
      if (typeof listed !== "string" || !listed.includes(" ")) continue;
      const listsWord = kind === "land-type" ? listed.split(" ").includes(change.from) : prints && printsCreatureType(listed, change.from);
      if (listsWord) out.faceDownTextChanges = withChange(out.faceDownTextChanges, change);
    }
    return out;
  }
  if (typeof value !== "string") return value;
  if (key !== null && DISPLAY_KEYS.has(key)) return changeDisplay(value, change, names);
  if (creature) {
    return key !== null && CREATURE_TYPE_WORD_KEYS.has(key) && value === change.from && printsCreatureType(printed, change.from)
      ? change.to
      : value;
  }
  if (kind === "color") {
    if (key !== null && COLOR_WORD_KEYS.has(key) && value === COLOR_OF_WORD[change.from]) return COLOR_OF_WORD[change.to];
    // The one target shorthand that names a colour (Doom Blade's), as the
    // filter it stands for.
    if (value === "nonblack-creature" && change.from === "black") {
      return { kind: "permanent", filter: { type: "creature", notColors: [COLOR_OF_WORD[change.to]] } };
    }
    return value;
  }
  if (value === change.from) return change.to;
  const keyword = LAND_KEYWORD.exec(value);
  if (keyword !== null && keyword[1] === change.from.toLowerCase()) return change.to.toLowerCase() + keyword[2];
  return value;
}

/**
 * A created token's colours under its creating text's changes (rule 111.3),
 * or `undefined` if they stay its definition's: one word at a time, in order.
 */
export function tokenColorsAfter(
  colors: readonly Color[],
  changes: readonly TextChange[] | undefined,
): readonly Color[] | undefined {
  if (changes === undefined) return undefined;
  let out = colors;
  for (const change of changes) {
    const from = COLOR_OF_WORD[change.from];
    if (from !== undefined && out.includes(from)) {
      out = [...new Set(out.map((color) => (color === from ? COLOR_OF_WORD[change.to] : color)))];
    }
  }
  return out === colors ? undefined : out;
}

/**
 * `def` with its rules text changed by `changes`, in order (each one reads
 * the text the earlier ones left — layer 3 in timestamp order, 613.7). Its
 * printed characteristics stay (`TOP_KEYS`); see the module doc for what
 * changes. Functions (a `resolve` hatch) are kept as they are: the pool
 * audits (`test/text-change.test.ts`, `test/text-change-creature-types.test.ts`)
 * hold that none of them reads a colour word, a land type or a creature type.
 * `tokenNamed` gives the name of a token a card makes, by its definition's
 * name, so a token with a name of its own ("Llanowar Elves") keeps it in the
 * card's text (612.2).
 */
export function changeDefinitionText(
  def: CardDefinition,
  changes: readonly TextChange[],
  tokenNamed?: (token: string) => string | undefined,
): CardDefinition {
  // A card its text names is a name too, kept in the display text (612.2):
  // Garth One-Eye's "Black Lotus" stays Black Lotus after black becomes white.
  const named = new Set<string>();
  const collect = (v: unknown, key: string | null): void => {
    if (Array.isArray(v)) for (const x of v) collect(x, key);
    else if (v !== null && typeof v === "object") for (const [k, x] of Object.entries(v)) collect(x, k);
    else if (typeof v === "string" && key === "copyOfCardNamed") named.add(v);
    else if (typeof v === "string" && tokenNamed !== undefined && (key === "token" || (key !== null && REPLACEMENT_TOKEN_KEYS.has(key)))) {
      const name = tokenNamed(splitChangedTokenName(v).base);
      if (name !== undefined) named.add(name);
    }
  };
  collect(def, null);
  const names = [def.name, ...(def.faces ?? []), ...named].sort((a, b) => b.length - a.length);
  let out = def;
  for (const change of changes) {
    const walk: ChangeWalk = { change, kind: textWordKind(change.from), names };
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(out)) {
      next[k] = TOP_KEYS.has(k) ? v : changeValue(v, k, walk, out.text, ABILITY_LIST_KEYS.has(k));
    }
    out = next as unknown as CardDefinition;
  }
  return out;
}

/**
 * The creature types `def`'s text names as creature types where it prints
 * them — its type line's first — for a "replace one creature type" choice to
 * offer first (New Blood's ruling: the creature becomes a Vampire only if
 * the type chosen is on its type line).
 */
export function creatureTypeWordsIn(def: CardDefinition): readonly string[] {
  const found = new Set<string>(def.subtypes.filter(isCreatureType));
  for (const { type, printed } of creatureTypeFields(def)) if (printed) found.add(type);
  return [...found];
}

/**
 * Every creature type in `def`'s creature-type word fields
 * ({@link CREATURE_TYPE_WORD_KEYS}), with the field and whether its line
 * prints it ({@link textBelow}) — whether a text change reaches it. One that
 * isn't printed is a keyword's or a batch word's (soulshift's Spirit,
 * "outlaw"'s Mercenary): `test/text-change-creature-types.test.ts` holds the
 * list of those the card's other lines do print.
 */
export function creatureTypeFields(
  def: CardDefinition,
): readonly { readonly type: string; readonly key: string; readonly printed: boolean }[] {
  const out: { type: string; key: string; printed: boolean }[] = [];
  const walk = (v: unknown, key: string | null, printed: string, top: boolean): void => {
    if (typeof v === "function") return;
    if (Array.isArray(v)) {
      for (const x of v) walk(x, key, printed, top);
    } else if (v !== null && typeof v === "object") {
      const here = textBelow(printed, (v as { readonly text?: unknown }).text, top);
      for (const [k, x] of Object.entries(v)) walk(x, k, here, false);
    } else if (typeof v === "string" && key !== null && CREATURE_TYPE_WORD_KEYS.has(key) && isCreatureType(v)) {
      out.push({ type: v, key, printed: printsCreatureType(printed, v) });
    }
  };
  for (const [k, v] of Object.entries(def)) if (!TOP_KEYS.has(k)) walk(v, k, def.text, ABILITY_LIST_KEYS.has(k));
  return out;
}
