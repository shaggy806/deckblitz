/**
 * Which colours a bot's mana can't make yet, and which lands would fix that —
 * what a fetch land, a Cultivate or a Farseek should go and find.
 *
 * Both bots used to take lands in library order: v1 the first ones offered,
 * v2 the same once its search scored every land alike (the evaluation counts
 * lands, not their colours), so a three-colour deck cracked its fetches for a
 * third Forest while a blue card sat stuck in hand. `newColorsFirst` orders
 * the lands that make a colour the bot needs and can't yet produce ahead of
 * the rest, for v1's pick and for the front of v2's capped candidate list,
 * where ties fall to v1's answer.
 *
 * "Needs" is the commander's colour identity, or — with no commander — the
 * colours of the mana costs in hand. "Can produce" is read off the printed
 * mana abilities and basic land types of the permanents the bot controls: a
 * coarse reading (an animated or type-changed land reads as printed) that
 * only has to order a handful of lands. Pure over the state; no `bot/` import.
 */

import type { CardRegistry } from "./cards.js";
import type { CardDefinition } from "./cards/define.js";
import { intrinsicManaColors, staticConditionMet } from "./characteristics.js";
import { matchesFilter } from "./filter.js";
import type { EffectSpec } from "./effects.js";
import { COLORS, manaValue, parseManaCost } from "./mana.js";
import type { Color } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type { GameState } from "./state.js";

const isColor = (m: string): m is Color => (COLORS as readonly string[]).includes(m);

/** The colours one `add-mana` effect can make, for a player whose commander
 * identity is `identity`, on a permanent that named `chosen` as it entered
 * (Valgavoth's Lair) — any colour while it hasn't. */
function addManaColors(
  effect: EffectSpec | null | undefined,
  identity: readonly Color[],
  chosen: Color | null,
): Color[] {
  if (effect === null || effect === undefined) return [];
  if (effect.kind === "sequence") return effect.effects.flatMap((e) => addManaColors(e, identity, chosen));
  if (effect.kind !== "add-mana") return [];
  const mana = effect.mana;
  if (typeof mana === "string") {
    if (mana === "chosen" && chosen !== null) return [chosen];
    if (mana === "any-color" || mana === "chosen") return [...COLORS];
    if (mana === "commander-identity") return [...identity];
    return isColor(mana) ? [mana] : [];
  }
  if ("oneOf" in mana) return mana.oneOf.filter(isColor);
  if ("all" in mana) return mana.all.filter(isColor);
  return [];
}

/** The colours `def`'s printed mana abilities make. */
function printedManaColors(def: CardDefinition, identity: readonly Color[], chosen: Color | null): Color[] {
  return (def.activated ?? []).flatMap((ability) => addManaColors(ability.effect, identity, chosen));
}

/** The colours permanent or card `id` could make mana of. */
function colorsOf(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  identity: readonly Color[],
): Set<Color> {
  const object = state.objects[id];
  if (object === undefined || !registry.has(object.cardName)) return new Set();
  return new Set([
    ...intrinsicManaColors(state, registry, object),
    ...printedManaColors(
      registry.get(object.cardName),
      identity,
      object.chosenOnEnter != null && isColor(object.chosenOnEnter) ? object.chosenOnEnter : null,
    ),
  ]);
}

/** The colours permanents `me` controls can make mana of. */
function colorsOnBattlefield(state: GameState, registry: CardRegistry, me: PlayerId): Set<Color> {
  const identity = state.players[me]?.commanderIdentity ?? [];
  const have = new Set<Color>();
  for (const id of state.zones.shared.battlefield) {
    if (state.objects[id]?.controller !== me) continue;
    for (const c of colorsOf(state, registry, id, identity)) have.add(c);
  }
  return have;
}

/**
 * The colour to name for "as this enters, choose a colour" (Valgavoth's
 * Lair, the Thriving lands) out of `options`: within the commander's colour
 * identity whenever an option is, the one the spells in hand and the
 * commanders waiting in the command zone want most by mana symbol — ten
 * times over when nothing we control makes it yet. With nothing wanted, one
 * we can't make yet. Ties keep `options`' order.
 *
 * Reported from a live game (2026-10-05): a Temur bot named white for
 * Valgavoth's Lair, as every controller answered the choice with
 * `options[0]`.
 */
export function colorToName(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  options: readonly Color[],
): Color {
  const identity = state.players[me]?.commanderIdentity ?? [];
  const inIdentity = options.filter((c) => identity.includes(c));
  const allowed = inIdentity.length > 0 ? inIdentity : options;
  const have = colorsOnBattlefield(state, registry, me);
  const pips = new Map<Color, number>();
  const waiting = state.zones.shared.command.filter((id) => state.objects[id]?.owner === me);
  for (const id of [...(state.zones.perPlayer[me]?.hand ?? []), ...waiting]) {
    const name = state.objects[id]?.cardName;
    if (name === undefined || !registry.has(name)) continue;
    const def = registry.get(name);
    if (def.types.includes("land")) continue;
    const cost = parseManaCost(def.manaCost);
    for (const c of COLORS) pips.set(c, (pips.get(c) ?? 0) + cost.colored[c]);
  }
  const score = (c: Color): number => (pips.get(c) ?? 0) * (have.has(c) ? 1 : 10) + (have.has(c) ? 0 : 1);
  return allowed.reduce((best, c) => (score(c) > score(best) ? c : best));
}

/** Whether every option of a choice is a colour — a "choose a colour". */
export function allColors(options: readonly string[]): options is readonly Color[] {
  return options.length > 0 && options.every(isColor);
}

/** The colours `me` needs and has no permanent to make. */
export function missingColors(state: GameState, registry: CardRegistry, me: PlayerId): Set<Color> {
  const identity = state.players[me]?.commanderIdentity ?? [];
  const needed = new Set<Color>(identity);
  if (needed.size === 0) {
    for (const id of state.zones.perPlayer[me]?.hand ?? []) {
      const name = state.objects[id]?.cardName;
      if (name === undefined || !registry.has(name)) continue;
      const cost = parseManaCost(registry.get(name).manaCost);
      for (const c of COLORS) if (cost.colored[c] > 0) needed.add(c);
    }
  }
  for (const id of state.zones.shared.battlefield) {
    if (needed.size === 0) break;
    if (state.objects[id]?.controller !== me) continue;
    for (const c of colorsOf(state, registry, id, identity)) needed.delete(c);
  }
  return needed;
}

/**
 * How much each missing colour is wanted: one, plus a point for each of its
 * mana symbols among the spells in hand and the commanders waiting in the
 * command zone — and a quarter of that when a land in hand already makes it.
 * The Sultai autopsy (seed 73): two colours missing, a fetch took a Swamp
 * with Sunken Hollow in hand and five green spells waiting, and the deck sat
 * six turns with no green source.
 */
function colorWants(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  missing: ReadonlySet<Color>,
  identity: readonly Color[],
): Map<Color, number> {
  const want = new Map<Color, number>([...missing].map((c) => [c, 1]));
  const inHand = new Set<Color>();
  const zones = state.zones.perPlayer[me];
  const waiting = state.zones.shared.command.filter((id) => state.objects[id]?.owner === me);
  for (const id of [...(zones?.hand ?? []), ...waiting]) {
    const name = state.objects[id]?.cardName;
    if (name === undefined || !registry.has(name)) continue;
    const def = registry.get(name);
    if (def.types.includes("land")) {
      for (const c of colorsOf(state, registry, id, identity)) inHand.add(c);
      continue;
    }
    const cost = parseManaCost(def.manaCost);
    for (const c of missing) want.set(c, (want.get(c) ?? 1) + cost.colored[c]);
  }
  for (const c of inHand) if (want.has(c)) want.set(c, (want.get(c) ?? 1) / 4);
  return want;
}

/**
 * `ids` — cards a search or a "look at" may take — best first: the lands that
 * make the most wanted missing colours (`colorWants`), then the ones that make
 * the colours we have the fewest sources of, counting each land as it's taken,
 * so a search for two takes two different basics. Ties keep the order given.
 * Only reorders a choice among lands alone: a tutor that could take anything
 * is left to whatever ranks it.
 *
 * Reported from a live game (2026-10-04): Encroaching Dragonstorm found two
 * Forests for a Temur deck with an Island and a Mountain on offer — Command
 * Tower already made every colour, so nothing was "missing" and library order
 * stood.
 */
export function newColorsFirst(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  ids: readonly ObjectId[],
): ObjectId[] {
  const lands = ids.every((id) => {
    const name = state.objects[id]?.cardName;
    return name !== undefined && registry.has(name) && registry.get(name).types.includes("land");
  });
  if (!lands || ids.length < 2) return [...ids];
  const identity = state.players[me]?.commanderIdentity ?? [];
  const missing = missingColors(state, registry, me);
  const want = missing.size === 0 ? new Map<Color, number>() : colorWants(state, registry, me, missing, identity);
  // What each colour the deck uses is made by now: the permanents we control.
  const useful = new Set<Color>(identity.length > 0 ? identity : COLORS);
  const sources = new Map<Color, number>([...useful].map((c) => [c, 0]));
  for (const id of state.zones.shared.battlefield) {
    if (state.objects[id]?.controller !== me) continue;
    for (const c of colorsOf(state, registry, id, identity)) {
      if (sources.has(c)) sources.set(c, (sources.get(c) ?? 0) + 1);
    }
  }
  const colors = new Map(ids.map((id) => [id, colorsOf(state, registry, id, identity)]));
  const score = (id: ObjectId): number => {
    let missingGain = 0;
    let spread = 0;
    for (const c of colors.get(id) ?? []) {
      missingGain += want.get(c) ?? 0;
      if (sources.has(c)) spread += 1 / (1 + (sources.get(c) ?? 0));
    }
    // A missing colour outranks any spread.
    return missingGain * 100 + spread;
  };
  const left = [...ids];
  const out: ObjectId[] = [];
  while (left.length > 0) {
    let best = 0;
    for (let i = 1; i < left.length; i += 1) if (score(left[i]) > score(left[best])) best = i;
    const [id] = left.splice(best, 1);
    out.push(id);
    for (const c of colors.get(id) ?? []) {
      if (sources.has(c)) sources.set(c, (sources.get(c) ?? 0) + 1);
      want.delete(c);
    }
  }
  return out;
}

/** The colours a land card in hand could make next turn if it were the land
 * drop: its own mana abilities and basic land types, or — a land that
 * fetches untapped (Windswept Heath, Prismatic Vista) — those of the lands in
 * our library its search can find. A land that enters tapped,
 * always or as the board stands (a Moor with its condition unmet), is
 * `null`: no mana next turn. An empty set is a colourless source. */
function nextDropColors(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  id: ObjectId,
  identity: readonly Color[],
): Set<Color> | null {
  const object = state.objects[id];
  if (object === undefined || !registry.has(object.cardName)) return null;
  const def = registry.get(object.cardName);
  const tapped = def.static.some((ability) => {
    const r = ability.replacement;
    if (r?.event !== "enters-battlefield" || r.tappedUnlessRevealFromHand !== undefined || r.mayPayLife !== undefined) return false;
    if (r.tapped === true) return true;
    return r.tappedUnless !== undefined && !staticConditionMet(state, registry, object, r.tappedUnless);
  });
  if (tapped) return null;
  const own = colorsOf(state, registry, id, identity);
  if (own.size > 0) return own;
  const found = new Set<Color>();
  let fetches = false;
  for (const ability of def.activated ?? []) {
    const effect = ability.effect;
    if (effect?.kind !== "search-library" || effect.destination !== "battlefield" || effect.enterTapped === true) continue;
    if (ability.cost.mana !== null && ability.cost.mana !== undefined) continue;
    fetches = true;
    for (const card of state.zones.perPlayer[me]?.library ?? []) {
      if (!matchesFilter(state, registry, card, effect.filter, { you: me })) continue;
      for (const c of colorsOf(state, registry, card, identity)) found.add(c);
    }
  }
  // A land with only colourless mana is still a source for generic.
  return fetches ? found : own;
}

/** Whether `pips` (one colour each) can be paid one a source, by sources
 * making `sources`' colours: the most of them that can, by augmenting paths. */
function payablePips(pips: readonly Color[], sources: readonly ReadonlySet<Color>[]): number {
  const owner: number[] = sources.map(() => -1);
  const tryPip = (pip: number, seen: boolean[]): boolean => {
    for (let s = 0; s < sources.length; s += 1) {
      if (seen[s] || !sources[s].has(pips[pip])) continue;
      seen[s] = true;
      if (owner[s] === -1 || tryPip(owner[s], seen)) {
        owner[s] = pip;
        return true;
      }
    }
    return false;
  };
  let paid = 0;
  for (let pip = 0; pip < pips.length; pip += 1) if (tryPip(pip, sources.map(() => false))) paid += 1;
  return paid;
}

/** What a commander's cost all but paid is worth against all of it: a
 * quarter of the share paid. Being castable next turn is what a land line
 * buys; four colours of five buy little. At a half, Moldering Gym's line
 * (four of five) still beat Krosan Verge's (all five) on the HK3Z2 board. */
const PARTLY_READY = 0.25;

/**
 * How near `me`'s commanders are to being cast on our next turn, each by its
 * mana value: for one waiting in the command zone, 1 when the permanents we
 * control and one land drop from hand pay its whole cost, tax included (each
 * coloured symbol by a source of its colour, one a source, the rest by any
 * source), and otherwise {@link PARTLY_READY} of the share of its symbols
 * they pay; for one anywhere else (cast, on the battlefield), 1, so casting
 * it gives nothing up. Summed over our commanders, each times its mana value:
 * a five-drop a round late is a bigger loss than a two-drop.
 *
 * Each source is one mana, as `lands` counts them: a Sol Ring is one, not
 * two. Tapped permanents count (they untap first). The land drop is the one
 * of the lands in hand that pays most, a fetch by what it can find.
 *
 * Reported from a live game (2026-11-27, kept game HK3Z2-1): a five-colour
 * First Sliver deck with Polluted Delta and Windswept Heath in hand fetched a
 * Forest and cast Moldering Gym on turn 12, where an Island and Krosan
 * Verge's two lands made all five colours by turn 16. Nothing in the
 * evaluation read the commander's colours, so the Gym's permanent won, and
 * The First Sliver came a round late.
 */
export function commanderReadiness(state: GameState, registry: CardRegistry, me: PlayerId): number {
  // Our commanders by name: as dealt, and any marked on the board (a board
  // built by hand has no list).
  const names = new Set<string>(state.players[me]?.commanders ?? []);
  const waiting = new Map<string, ObjectId>();
  for (const zone of [state.zones.shared.command, state.zones.shared.battlefield, state.zones.shared.stack]) {
    for (const id of zone) {
      const object = state.objects[id];
      if (object === undefined || object.owner !== me || object.isCommander !== true || object.kind !== "card") continue;
      names.add(object.cardName);
      if (zone === state.zones.shared.command) waiting.set(object.cardName, id);
    }
  }
  if (names.size === 0) return 0;
  let total = 0;
  let sources: Set<Color>[] | null = null;
  let drops: (Set<Color> | null)[] = [];
  for (const name of names) {
    if (!registry.has(name)) continue;
    const def = registry.get(name);
    const cost = parseManaCost(def.manaCost);
    const value = manaValue(cost);
    if (!waiting.has(name)) {
      total += value;
      continue;
    }
    if (sources === null) {
      const identity = state.players[me]?.commanderIdentity ?? [];
      sources = [];
      for (const id of state.zones.shared.battlefield) {
        const object = state.objects[id];
        if (object?.controller !== me || !registry.has(object.cardName)) continue;
        const colors = colorsOf(state, registry, id, identity);
        if (colors.size > 0 || registry.get(object.cardName).types.includes("land")) sources.push(colors);
      }
      drops = [null];
      for (const id of state.zones.perPlayer[me]?.hand ?? []) {
        const card = state.objects[id]?.cardName;
        if (card === undefined || !registry.has(card) || !registry.get(card).types.includes("land")) continue;
        const colors = nextDropColors(state, registry, me, id, identity);
        if (colors !== null) drops.push(colors);
      }
    }
    const pips = COLORS.flatMap((c) => Array<Color>(cost.colored[c]).fill(c));
    const generic = cost.generic + cost.colorless + 2 * (state.players[me]?.commanderCastCounts[name] ?? 0);
    const owed = pips.length + generic;
    let ready = owed === 0 ? 1 : 0;
    for (const drop of drops) {
      const all = drop === null ? sources : [...sources, drop];
      const colored = payablePips(pips, all);
      const paid = colored + Math.min(generic, all.length - colored);
      ready = Math.max(ready, paid >= owed ? 1 : (PARTLY_READY * paid) / owed);
    }
    total += ready * value;
  }
  return total;
}
