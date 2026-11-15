/**
 * The card pool as a catalog: every definition with its behaviour taken out,
 * as plain data, for the pages that browse the pool rather than play it.
 *
 * The library and the deck builder search, sort, draw and validate over every
 * card, and used to load every definition to do it: all the shards
 * (`card-shards.ts`), about 39 MB of modules at 33,000 definitions, each
 * running `defineCard` as it loads. What those pages read is a card's printed
 * fields, its text, its keyword costs and the few fields the deck rules look
 * at. What makes a definition big is what a *game* reads: the effect trees
 * under its abilities. So the catalog is the pool with those cut away, about
 * 11 MB of JSON (1.3 MB compressed), parsed rather than run.
 *
 * What a catalog card keeps, and what it doesn't:
 *
 * - Every field of the definition as it is, **except** `effect` (a spell's
 *   effect tree), which reads as the default, and anything that isn't data (a
 *   function, which JSON drops).
 * - Each activated, triggered and static ability is there, in order, but only
 *   as its `text` — plus an activated ability's mana cost (colour identity,
 *   rule 903.4, reads it) and a static's `selfOutsideBattlefield` (the deck
 *   rules read it). Nothing else about an ability is in the catalog: a page
 *   that needs one whole asks for the card's shard.
 * - The tokens it makes (`tokensCreatedBy`, which walks the effect trees) are
 *   worked out as the catalog is made and kept beside the card:
 *   {@link tokensMadeBy} answers for a catalog card and a whole one alike.
 *
 * `test/card-catalog.test.ts` checks, over the whole pool, that every kept
 * field is unchanged and that the deck rules and the colour identity give the
 * same answers on the catalog as on the definitions. A page or rule that
 * starts reading something the catalog cuts fails there.
 *
 * Made by `buildCardCatalog` wherever the whole pool is at hand (the client's
 * build, through its Vite plugin), and read back by `readCatalogChunk`.
 */

import type { CardDefinition } from "./define.js";
import { tokensCreatedBy } from "./classify.js";

/** A card as the catalog holds it: the fields that differ from
 * {@link CatalogChunk.defaults}, its abilities as {@link CatalogAbility}s. */
export type CatalogEntry = Readonly<Record<string, unknown>>;

/**
 * An ability in the catalog. Its text is nearly always a piece of the card's
 * own text, so it's kept as where that piece is (`x`: start and length) and
 * spelled out only when it isn't.
 */
export interface CatalogAbility {
  readonly x?: readonly [number, number];
  readonly text?: string;
  /** An activated ability's mana cost. */
  readonly m?: string;
  /** A static ability's `selfOutsideBattlefield`. */
  readonly o?: unknown;
}

/** One piece of the catalog, whole in itself: a page fetches the pieces side
 * by side and reads each as it arrives. */
export interface CatalogChunk {
  /** Each field's most common value across the pool. A card lists only the
   * fields where it differs, which is what makes 139 fields a card small. */
  readonly defaults: Readonly<Record<string, unknown>>;
  /** Real cards (`pool/`), each face of a double-faced card its own entry. */
  readonly pool: readonly CatalogEntry[];
  readonly tokens: readonly CatalogEntry[];
}

/** How many pieces the catalog is cut into: enough to fetch side by side and
 * to show a loading bar moving, few enough that each is worth a request. */
export const CARD_CATALOG_CHUNKS = 8;

/** The ability lists a catalog card keeps only the text of. */
const ABILITY_LISTS = ["activated", "triggered", "static"] as const;
type AbilityList = (typeof ABILITY_LISTS)[number];
const isAbilityList = (key: string): key is AbilityList => (ABILITY_LISTS as readonly string[]).includes(key);

/** The fields the catalog leaves out: they read as the pool's default. */
const CUT_FIELDS: ReadonlySet<string> = new Set(["effect"]);

/** The field a catalog entry keeps a card's tokens under. Not a definition
 * field: read back into {@link tokensMadeBy}'s table, never onto the card. */
const MAKES = "~makes";

/** The field an entry lists the fields under that the card leaves `undefined`
 * where the pool's default is a value: JSON has no way to say so in place. */
const UNSET = "~unset";

/** A field left `undefined`, in the tally of each field's values. */
const UNDEFINED = "undefined";

/** A value as JSON, functions dropped — or `undefined` for one that isn't
 * data at all. */
const asJson = (value: unknown): string | undefined =>
  JSON.stringify(value, (_key, inner: unknown) => (typeof inner === "function" ? undefined : inner));

function catalogAbility(list: AbilityList, ability: Record<string, unknown>, cardText: string): CatalogAbility {
  const text = typeof ability.text === "string" ? ability.text : "";
  const at = text === "" ? -1 : cardText.indexOf(text);
  const cost = ability.cost as { readonly mana?: string | null } | undefined;
  return {
    ...(at >= 0 ? { x: [at, text.length] as const } : text !== "" ? { text } : {}),
    ...(list === "activated" && typeof cost?.mana === "string" ? { m: cost.mana } : {}),
    ...(list === "static" && ability.selfOutsideBattlefield !== undefined ? { o: ability.selfOutsideBattlefield } : {}),
  };
}

/**
 * The whole pool as catalog chunks. `pool` and `tokens` are every definition
 * (`POOL_CARDS`, `TOKEN_CARDS`); the chunks hold them in the order given,
 * dealt round the chunks so each is about the same size.
 */
export function buildCardCatalog(
  pool: readonly CardDefinition[],
  tokens: readonly CardDefinition[],
  chunks = CARD_CATALOG_CHUNKS,
): CatalogChunk[] {
  // Each field's most common value, as JSON: what a card needn't say. A
  // field a card leaves `undefined`, or doesn't have at all (a rare field is
  // set only on the cards that use it), counts as a value too: the few
  // Attractions' `attractionLights` mustn't become everyone's default.
  const everyone = [...pool, ...tokens];
  const tally = new Map<string, Map<string, number>>();
  for (const def of everyone) {
    for (const [key, value] of Object.entries(def)) {
      if (CUT_FIELDS.has(key) || isAbilityList(key)) continue;
      if (typeof value === "function") continue;
      const json = asJson(value) ?? UNDEFINED;
      let seen = tally.get(key);
      if (seen === undefined) tally.set(key, (seen = new Map()));
      seen.set(json, (seen.get(json) ?? 0) + 1);
    }
  }
  const commonest = new Map<string, string>();
  for (const [key, seen] of tally) {
    let counted = 0;
    for (const count of seen.values()) counted += count;
    if (counted < everyone.length) seen.set(UNDEFINED, (seen.get(UNDEFINED) ?? 0) + everyone.length - counted);
    let best = "";
    let most = -1;
    for (const [json, count] of seen) {
      if (count > most) {
        most = count;
        best = json;
      }
    }
    commonest.set(key, best);
  }
  const defaults: Record<string, unknown> = {};
  for (const [key, json] of commonest) if (json !== UNDEFINED) defaults[key] = JSON.parse(json) as unknown;

  const entryOf = (def: CardDefinition): CatalogEntry => {
    const entry: Record<string, unknown> = {};
    const unset: string[] = [];
    const text = def.text ?? "";
    const fields = def as unknown as Record<string, unknown>;
    for (const key of ABILITY_LISTS) {
      const list = (fields[key] as readonly Record<string, unknown>[] | undefined) ?? [];
      if (list.length > 0) entry[key] = list.map((ability) => catalogAbility(key, ability, text));
    }
    for (const [key, usual] of commonest) {
      const value = fields[key];
      if (typeof value === "function") continue;
      const json = asJson(value) ?? UNDEFINED;
      if (json === usual) continue;
      if (json === UNDEFINED) unset.push(key);
      else entry[key] = JSON.parse(json) as unknown;
    }
    if (unset.length > 0) entry[UNSET] = unset;
    const makes = tokensCreatedBy(def);
    if (makes.length > 0) entry[MAKES] = makes;
    return entry;
  };

  const out = Array.from({ length: chunks }, () => ({ pool: [] as CatalogEntry[], tokens: [] as CatalogEntry[] }));
  pool.forEach((def, i) => out[i % chunks].pool.push(entryOf(def)));
  tokens.forEach((def, i) => out[i % chunks].tokens.push(entryOf(def)));
  return out.map((piece) => ({ defaults, ...piece }));
}

/** The tokens each catalog card makes, kept off the card itself: a
 * definition has no field for them. */
const made = new WeakMap<CardDefinition, readonly string[]>();

/**
 * The tokens `def` can make ({@link tokensCreatedBy}), for a catalog card as
 * for a whole definition: the catalog has the answer worked out, since the
 * effect trees it's read from aren't there.
 */
export function tokensMadeBy(def: CardDefinition): readonly string[] {
  return made.get(def) ?? tokensCreatedBy(def);
}

/** Whether `def` came out of the catalog, so has no behaviour to it. */
export function isCatalogCard(def: CardDefinition): boolean {
  return made.has(def);
}

const NO_TOKENS: readonly string[] = [];

function readEntry(entry: CatalogEntry, defaults: Readonly<Record<string, unknown>>): CardDefinition {
  const card: Record<string, unknown> = { ...defaults, ...entry };
  delete card[MAKES];
  delete card[UNSET];
  for (const key of (entry[UNSET] as readonly string[] | undefined) ?? []) card[key] = undefined;
  const cardText = typeof card.text === "string" ? card.text : "";
  const textOf = (ability: CatalogAbility): string =>
    ability.x !== undefined ? cardText.slice(ability.x[0], ability.x[0] + ability.x[1]) : (ability.text ?? "");
  const listOf = (key: AbilityList): readonly CatalogAbility[] => (entry[key] as readonly CatalogAbility[] | undefined) ?? [];
  card.activated = listOf("activated").map((a) => ({ text: textOf(a), cost: { mana: a.m ?? null } }));
  card.triggered = listOf("triggered").map((a) => ({ text: textOf(a) }));
  card.static = listOf("static").map((a) => ({
    text: textOf(a),
    ...(a.o !== undefined ? { selfOutsideBattlefield: a.o } : {}),
  }));
  for (const key of CUT_FIELDS) card[key] ??= null;
  const def = card as unknown as CardDefinition;
  made.set(def, (entry[MAKES] as readonly string[] | undefined) ?? NO_TOKENS);
  return def;
}

/**
 * A chunk's cards as definitions: every kept field as it was, the abilities
 * as their text alone (see the module's doc). They're for reading — a page's
 * lists, its card tiles, the deck rules — never for a game: nothing here says
 * what a card does.
 */
export function readCatalogChunk(chunk: CatalogChunk): {
  readonly pool: readonly CardDefinition[];
  readonly tokens: readonly CardDefinition[];
} {
  return {
    pool: chunk.pool.map((entry) => readEntry(entry, chunk.defaults)),
    tokens: chunk.tokens.map((entry) => readEntry(entry, chunk.defaults)),
  };
}
