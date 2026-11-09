/**
 * Text-changing effects (rule 612, layer 3 — 613.1c): "change the text of
 * target spell or permanent by replacing all instances of one color word with
 * another" (Sleight of Mind) or "one basic land type with another" (Magical
 * Hack). A change is one word for another, `PtModifier.textChange`; an
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
 * - its type line's land types (612.1): `characteristics.ts`'s
 *   `printedSubtypes` applies {@link changeSubtypes} before layer 4, so a
 *   Forest made an Island taps for {U} (305.6) and is no Forest;
 * - the words its client text, prompts and labels show (display only).
 *
 * Never a name (612.2): a card's name, a token's, "a card named Forest". A
 * face's printed colours and subtypes (an object with a `manaCost` — an
 * Adventure, a split half) are characteristics, not text, and stay. Nor what
 * a granted ability says (612.3): only the definition's own text changes.
 *
 * A token a changed ability creates takes the changed colour words ("create a
 * 1/1 white Soldier" made a blue one, rule 111.3: `create-token`'s
 * `tokenTextChanges`, a copiable colour on the token). Its land type words
 * and subtypes stay. NOT yet: a static that changes every object's text
 * (Swirl the Mists).
 */

import type { CardDefinition } from "./cards/define.js";
import type { Color } from "./mana.js";

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
 * words ("black") or both basic land types ("Island"). */
export interface TextChange {
  readonly from: string;
  readonly to: string;
}

export type TextWordKind = "color" | "land-type";

/** What a word is to a text change, or `undefined` for neither. */
export function textWordKind(word: string): TextWordKind | undefined {
  if ((Object.values(COLOR_WORDS) as string[]).includes(word)) return "color";
  if (BASIC_LAND_TYPE_WORDS.includes(word)) return "land-type";
  return undefined;
}

/** The words a "replace one [kind] with another" offers. */
export function textWords(kind: "color" | "land-type" | "color-or-land-type"): readonly string[] {
  const colors = Object.values(COLOR_WORDS);
  if (kind === "color") return colors;
  if (kind === "land-type") return BASIC_LAND_TYPE_WORDS;
  return [...colors, ...BASIC_LAND_TYPE_WORDS];
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

/** `subtypes` with `changes`' land types applied in order (a type line's
 * words, rule 612.1). Duplicates fold: a Forest Island whose Forest became an
 * Island is an Island. */
export function changeSubtypes(subtypes: readonly string[], changes: readonly TextChange[]): readonly string[] {
  let out = subtypes;
  for (const change of changes) {
    if (textWordKind(change.from) !== "land-type" || !out.includes(change.from)) continue;
    out = [...new Set(out.map((t) => (t === change.from ? change.to : t)))];
  }
  return out;
}

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
]);

/** Fields holding words the client shows. */
const DISPLAY_KEYS: ReadonlySet<string> = new Set(["text", "prompt", "label"]);

/** A face's printed characteristics (an object with its own `manaCost`). */
const FACE_KEYS: ReadonlySet<string> = new Set(["colors", "subtypes", "types", "supertypes", "manaCost", "name"]);

/** The definition's own printed characteristics: layer 4 changes its type
 * line's land types (`changeSubtypes`), and nothing changes the rest. */
const TOP_KEYS: ReadonlySet<string> = new Set([
  "name",
  "tokenName",
  "art",
  "manaCost",
  "colors",
  "supertypes",
  "types",
  "subtypes",
  "alsoSubtypes",
  "power",
  "toughness",
  "loyalty",
  "defense",
  "faces",
]);

const LAND_KEYWORD = /^(plains|island|swamp|mountain|forest)(walk|cycling)$/;

/** One word changed in a display string, its case kept; never inside the
 * card's own name. */
function changeDisplay(text: string, change: TextChange, names: readonly string[]): string {
  const kind = textWordKind(change.from);
  if (kind === undefined) return text;
  const held: string[] = [];
  let masked = text;
  for (const name of names) {
    if (name.length === 0) continue;
    masked = masked.split(name).join(`\u0003${held.length}\u0003`);
    held.push(name);
  }
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
  return replaced.replace(/\u0003(\d+)\u0003/g, (_, i: string) => held[Number(i)]);
}

function changeValue(value: unknown, key: string | null, change: TextChange, names: readonly string[]): unknown {
  if (typeof value === "function") return value;
  if (key !== null && NAME_KEYS.has(key)) return value;
  if (Array.isArray(value)) {
    const out = value.map((v) => changeValue(v, key, change, names));
    // "white and/or blue" made "blue and/or blue" is one colour.
    return key !== null && (COLOR_WORD_KEYS.has(key) || key.toLowerCase().includes("subtype") || key.toLowerCase().includes("keyword"))
      ? [...new Set(out)]
      : out;
  }
  if (value !== null && typeof value === "object") {
    const face = "manaCost" in value;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = face && FACE_KEYS.has(k) ? v : changeValue(v, k, change, names);
    }
    // "Create a 1/1 white Soldier": the token's colour is one of this text's
    // words (rule 111.3), read off the token's definition as it's made.
    if (out.kind === "create-token" && textWordKind(change.from) === "color") {
      out.tokenTextChanges = [...((out.tokenTextChanges as readonly TextChange[] | undefined) ?? []), change];
    }
    return out;
  }
  if (typeof value !== "string") return value;
  if (key !== null && DISPLAY_KEYS.has(key)) return changeDisplay(value, change, names);
  const kind = textWordKind(change.from);
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
 * audit (`test/text-change.test.ts`) holds that none of them reads a colour
 * word or a land type.
 */
export function changeDefinitionText(def: CardDefinition, changes: readonly TextChange[]): CardDefinition {
  const names = [def.name, ...(def.faces ?? [])].sort((a, b) => b.length - a.length);
  let out = def;
  for (const change of changes) {
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(out)) next[k] = TOP_KEYS.has(k) ? v : changeValue(v, k, change, names);
    out = next as unknown as CardDefinition;
  }
  return out;
}
