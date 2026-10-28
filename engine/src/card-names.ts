/**
 * Choosing a card name (rule 201.4) — Pithing Needle, Meddling Mage,
 * Memoricide — and asking whether an object has the name chosen.
 *
 * Three things live here, all pure:
 *
 * - **The catalogue** ({@link nameableCardNames}): every name a player may
 *   choose. Rule 201.4 allows the name of any card in the Oracle card
 *   reference; the engine offers every card in its registry. A name the
 *   registry doesn't know is a card no game here can contain, so naming it
 *   would do exactly what naming any absent card does — nothing — and leaving
 *   it out changes no outcome. Tokens aren't cards (201.4); each half of a
 *   split card, each face of a double-faced card and an adventurer's
 *   adventure are names of their own (201.4b–f), and the whole of a split
 *   card is not one (709.4a: "one of those names and not both").
 * - **The test** ({@link hasCardName}): an object has the chosen name if one
 *   of its names is (709.4a) — either half's, for a split card anywhere but
 *   the stack; a face-down object has none (708.2a).
 * - **The suggestions** ({@link suggestedCardNames}): which names to offer
 *   first, by what the choice is for. Out of ~5,000 names a chooser needs a
 *   head start, and a bot answers with the first.
 */

import { isManaAbility } from "./abilities.js";
import type { CardRegistry } from "./cards/card-registry.js";
import { isTokenCard } from "./cards/classify.js";
import type { CardDefinition, CardType } from "./cards/define.js";
import { manaValue, parseManaCost } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import { LOCKED_ROOM, nameOf, printedCardName } from "./state.js";
import type { GameObject, GameState } from "./state.js";

/**
 * "Choose a **nonland** card name": the characteristics the named card must
 * have (rule 201.4a), judged on the definition of the name — one half's
 * alone for a split card, the back face's for a back face (201.4b–d).
 * Every clause must hold.
 */
export interface CardNameFilter {
  /** Has every one of these card types — "a creature card name" is
   * `["creature"]`, Dispossess's "an artifact card name" `["artifact"]`. */
  readonly types?: readonly CardType[];
  /** Has none of these — "a nonland card name" is `["land"]`, Council of
   * the Absolute's "noncreature, nonland" `["creature", "land"]`. */
  readonly notTypes?: readonly CardType[];
  /** "A **nonbasic** land card name" (Alpine Moon): no basic supertype. */
  readonly nonbasic?: true;
  /** "A card name **other than a basic land card name**" (Necromentia,
   * Null Chamber): anything but a basic land. */
  readonly notBasicLand?: true;
}

/**
 * What a name is chosen for, which decides the names suggested first (and a
 * bot's answer, the first of them):
 *
 * - `"opponent-spells"` — to stop or tax an opponent's spells (Meddling Mage,
 *   Memoricide): their commanders, then the cards they've shown — on the
 *   battlefield, in graveyards and exile — dearest first.
 * - `"opponent-permanents"` — to shut off or tax a permanent's abilities
 *   (Pithing Needle, Runed Halo): their permanents with activated abilities
 *   that aren't mana abilities, then their other permanents and commanders.
 * - `"own-hand"` — to match a card from the chooser's hand (Cursed Scroll):
 *   the name they hold most.
 * - `"own-library"` — to find a card in the chooser's library (Wood Sage,
 *   Desperate Research): the name it holds most.
 * - `"opponent-library"` — to guess an opponent's top card (Foreshadow): the
 *   names their shown cards repeat most, their basics included.
 */
export type CardNameAim =
  | "opponent-spells"
  | "opponent-permanents"
  | "own-hand"
  | "own-library"
  | "opponent-library";

/** "Choose a card name", as a card says it — as it enters or as it resolves. */
export interface CardNameChoice {
  readonly filter?: CardNameFilter;
  /** Defaults to `"opponent-spells"`. */
  readonly aim?: CardNameAim;
}

/** How the choice reads, for a prompt: "a nonland card name". */
export function cardNameLabel(filter: CardNameFilter | undefined): string {
  if (filter === undefined) return "a card name";
  const words: string[] = [];
  for (const t of filter.notTypes ?? []) words.push(`non${t}`);
  if (filter.nonbasic === true) words.push("nonbasic");
  words.push(...(filter.types ?? []));
  const named = words.length === 0 ? "card name" : `${words.join(", ")} card name`;
  const article = /^[aeiou]/.test(named) ? "an" : "a";
  return `${article} ${named}${filter.notBasicLand === true ? " other than a basic land card name" : ""}`;
}

/** Whether the name `def` is one a choice limited by `filter` may name. */
export function nameMatchesFilter(def: CardDefinition, filter: CardNameFilter | undefined): boolean {
  if (filter === undefined) return true;
  if (filter.types !== undefined && !filter.types.every((t) => def.types.includes(t))) return false;
  if (filter.notTypes !== undefined && filter.notTypes.some((t) => def.types.includes(t))) return false;
  const basic = def.supertypes.includes("basic");
  if (filter.nonbasic === true && basic) return false;
  if (filter.notBasicLand === true && basic && def.types.includes("land")) return false;
  return true;
}

/** Whether `def` is a name of its own (rule 201.4): not a token, not the
 * whole of a split card, not a spell that is only part of another card. */
function isNameable(def: CardDefinition): boolean {
  if (isTokenCard(def) || def.prepareSpellOnly || def.name === LOCKED_ROOM) return false;
  return !(def.split && def.faces !== null && def.faces[0] === def.name);
}

const catalogues = new WeakMap<CardRegistry, Map<string, readonly string[]>>();

/**
 * Every name a choice limited by `filter` may name, alphabetical. Built once
 * per registry and filter, so asking again is free.
 */
export function nameableCardNames(registry: CardRegistry, filter?: CardNameFilter): readonly string[] {
  let byFilter = catalogues.get(registry);
  if (byFilter === undefined) {
    byFilter = new Map();
    catalogues.set(registry, byFilter);
  }
  const key = JSON.stringify(filter ?? {});
  const known = byFilter.get(key);
  if (known !== undefined) return known;
  const names: string[] = [];
  for (const def of registry.definitions()) {
    if (isNameable(def) && nameMatchesFilter(def, filter)) names.push(def.name);
  }
  names.sort((a, b) => a.localeCompare(b));
  byFilter.set(key, names);
  return names;
}

/** Whether `name` may be chosen under `filter` (rule 201.4a). */
export function isNameableAs(registry: CardRegistry, name: string, filter?: CardNameFilter): boolean {
  if (!registry.has(name)) return false;
  const def = registry.get(name);
  return isNameable(def) && nameMatchesFilter(def, filter);
}

/**
 * The names `object` has (rule 201.2): either half's for a split card
 * anywhere but the stack (709.4a — on the stack only the half cast exists,
 * and it is its own definition), none for a face-down one (708.2a), and
 * otherwise the one it has now ({@link nameOf} — a copy's, a flipped card's,
 * the face that's up).
 */
export function namesOf(registry: CardRegistry, object: GameObject): readonly string[] {
  if (object.faceDown !== undefined || printedCardName(object) === LOCKED_ROOM) return [];
  const name = nameOf(object);
  if (registry.has(name)) {
    const def = registry.get(name);
    if (def.split && def.faces !== null && def.faces[0] === name) return def.faces.slice(1);
  }
  return [name];
}

/** The names a card or permanent had as it last existed (`lastKnown`): its
 * name then, both halves' for a split card, none face down. */
export function lastKnownNames(
  registry: CardRegistry,
  lki: { readonly name: string; readonly renamed?: string; readonly faceDown?: boolean },
): readonly string[] {
  if (lki.faceDown === true || lki.name === LOCKED_ROOM) return [];
  const name = lki.renamed ?? lki.name;
  if (registry.has(name)) {
    const def = registry.get(name);
    if (def.split && def.faces !== null && def.faces[0] === name) return def.faces.slice(1);
  }
  return [name];
}

/** Whether `object` has the name `name` — one of its names (709.4a). */
export function hasCardName(registry: CardRegistry, object: GameObject, name: string): boolean {
  return namesOf(registry, object).includes(name);
}

/** How many names a choice suggests up front. */
const SUGGESTED_CARD_NAMES = 8;

/**
 * The names to offer first for a choice by `player` aimed at `aim`, best
 * first, each one nameable under `filter`. Computed only for the chooser, in
 * `legalActions`, because it reads their own library and hand.
 *
 * `seen` puts first the cards a player has just looked at or revealed for
 * the choice (Sorcerous Spyglass's look, Alhammarret's reveal) — those are
 * what such a choice is about.
 */
export function suggestedCardNames(
  state: Readonly<GameState>,
  registry: CardRegistry,
  player: PlayerId,
  aim: CardNameAim,
  filter: CardNameFilter | undefined,
  seen: readonly string[] = [],
): string[] {
  const out: string[] = [];
  const add = (name: string): void => {
    if (out.includes(name) || !isNameableAs(registry, name, filter)) return;
    out.push(name);
  };
  for (const name of seen) add(name);
  const objects = (ids: readonly ObjectId[]): GameObject[] =>
    ids.map((id) => state.objects[id]).filter((o): o is GameObject => o !== undefined);
  const opponents = state.turnOrder.filter((p) => p !== player && state.players[p]?.hasLost !== true);
  const theirs = (o: GameObject): boolean => opponents.includes(o.controller);
  const valueOf = (o: GameObject): number => {
    const name = printedCardName(o);
    return registry.has(name) ? manaValue(parseManaCost(registry.get(name).manaCost)) : 0;
  };
  const byValue = (list: GameObject[]): GameObject[] => [...list].sort((a, b) => valueOf(b) - valueOf(a));
  const mostCommon = (list: readonly GameObject[]): string[] => {
    const counts = new Map<string, number>();
    for (const o of list) for (const n of namesOf(registry, o)) counts.set(n, (counts.get(n) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([n]) => n);
  };
  const commanders = objects(state.zones.shared.command).filter((o) => o.isCommander && opponents.includes(o.owner));
  const battlefield = objects(state.zones.shared.battlefield).filter(theirs);
  const shown = opponents.flatMap((p) =>
    objects([...state.zones.perPlayer[p].graveyard, ...state.zones.shared.exile.filter((id) => state.objects[id]?.owner === p)]),
  );
  const visit = (list: readonly GameObject[]): void => {
    for (const o of list) for (const n of namesOf(registry, o)) add(n);
  };
  switch (aim) {
    case "opponent-spells":
      visit(commanders);
      visit(byValue(shown));
      visit(byValue(battlefield));
      break;
    case "opponent-permanents": {
      const activates = (o: GameObject): boolean => {
        const name = printedCardName(o);
        return registry.has(name) && registry.get(name).activated.some((a) => !isManaAbility(a));
      };
      visit(byValue(battlefield.filter(activates)));
      visit(byValue(battlefield));
      visit(commanders);
      break;
    }
    case "own-hand":
      for (const n of mostCommon(objects(state.zones.perPlayer[player].hand))) add(n);
      break;
    case "own-library":
      for (const n of mostCommon(objects(state.zones.perPlayer[player].library))) add(n);
      break;
    case "opponent-library":
      for (const n of mostCommon([...battlefield, ...shown])) add(n);
      break;
  }
  return out.slice(0, SUGGESTED_CARD_NAMES);
}
