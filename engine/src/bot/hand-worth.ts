/**
 * What each card in a hand is worth, relative to an average card — the
 * `handQuality` feature (`features.ts`), the bot audit's Q2.
 *
 * `hand` counts a card as a card, whatever it is, so every play that trades
 * one card for another scored a wash: Opt for the card it draws, Demonic
 * Tutor for the card it finds. Each of those got a rule that cast it anyway
 * (`isCantripDue` and its tutor branch, gone now). This prices the card
 * instead. A
 * card's **quality** is 1 for an average card and runs from
 * {@link QUALITY_MIN} to {@link QUALITY_MAX}; the feature is the sum of
 * `quality - 1` over our own hand, under the same weight as `hand`, so an
 * average card is still worth what it was.
 *
 * - **A land** is {@link NEXT_LAND} for the first one in hand while the
 *   board wants lands (it is the next land drop), an average card for the
 *   ones behind it, and {@link SURPLUS_LAND} once the board has
 *   `landsWanted` of them.
 * - **A creature** is read off the board terms a body gets (`creatures` 2.5,
 *   `power` and `toughness` 0.5 each): a Grizzly Bears 0.9, a Craw Wurm the
 *   cap. One with any ability is never below average: what the ability does
 *   isn't read, and unknown is average, not bad.
 * - **A spell that only draws and filters** (`card-flow.ts`) is
 *   {@link FLOW_CARD} for each card it leaves us up — just under the least
 *   any card can be — less the cards a discard cost throws: Opt 0.4,
 *   Divination 0.8, Harmonize 1.2. So casting one is a gain whatever it
 *   draws. The bot
 *   reads the real library, and priced at an average card each, a cantrip
 *   was held whenever the top card was a poor one: Preordain on turn two
 *   with a six-drop on top.
 * - **A tutor** is {@link CONVERT} of the best card in the library its
 *   filter allows: it finds that card, so casting it is a gain exactly when
 *   there is something better than itself to find.
 * - **Any other instant or sorcery with no target** is `CONVERT` of what
 *   `effect-worth.ts` reads off its effect, where a card is 2.
 * - **Anything else** — a spell with targets or a cost beyond mana, a
 *   noncreature permanent — is 1. Its worth depends on a board this doesn't
 *   read; pricing removal in hand is the interaction sub-step's.
 *
 * Then **reach**: a nonland card costing more than one past the lands in play
 * loses {@link OUT_OF_REACH} for each further mana, down to half — the read
 * `chooseBottomOfHand` makes mid-game (`mulligan.ts`). Lands only, tapped or
 * not, so nothing the turn spends changes it; and by a card's cheapest face
 * or half, so Expansion // Explosion costs two. A cost the card reduces
 * itself (Blasphemous Act) isn't read: it counts as out of reach until the
 * lands are there.
 *
 * Never more than the board gives the card deployed: a creature's quality is
 * a fifth of its board terms against the half that would equal them, and a
 * noncreature permanent stays at 1, which `otherPermanents` matches.
 *
 * Only ever asked about the bot's own hand (`isMe` in `features.ts`). Pure
 * over the state and the card definitions, so the same position reads the
 * same in every process.
 */

import { cardFlowGain } from "../card-flow.js";
import type { CardRegistry } from "../cards.js";
import type { CardDefinition } from "../cards/define.js";
import { effectWorth } from "../effect-worth.js";
import type { EffectSpec } from "../effects.js";
import { matchesFilter } from "../filter.js";
import { manaValue, parseManaCost } from "../mana.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";

/** The least and most a card's quality can be: half a card, a card and a half. */
export const QUALITY_MIN = 0.5;
export const QUALITY_MAX = 1.5;
/** What a spell in hand is worth, of what casting it makes. */
const CONVERT = 0.85;
/** Each card a card-flow spell leaves us up: under the least a card can be
 * ({@link QUALITY_MIN}), so drawing even that is a gain and not a tie, which
 * goes to passing. Deep Analysis was held on a surplus land and an Opt. */
const FLOW_CARD = 0.4;
/** What `effect-worth.ts` calls one card. */
const CARD = 2;
/** The first land in hand while the board wants lands: the next land drop. */
const NEXT_LAND = 1.25;
/** A land in hand once the board has the lands it wants. */
const SURPLUS_LAND = 0.5;
/** Lost per mana a card costs past one more than the lands in play. */
const OUT_OF_REACH = 0.15;
/** The most reach takes off. */
const REACH_FLOOR = 0.5;
/** A body's board terms (`evaluate.ts`' defaults), and the share of them a
 * creature in hand is worth: a 3/3 comes to 1.1. */
const BODY = 2.5;
const STAT = 0.5;
const BODY_SHARE = 0.2;

type SearchToHand = Extract<EffectSpec, { readonly kind: "search-library" }>;

/** The search of our own library into hand that `effect` is, alone or as a
 * step of a sequence (the shuffle after it is the search's own). */
function tutorOf(effect: EffectSpec | null | undefined): SearchToHand | null {
  if (effect === null || effect === undefined) return null;
  if (effect.kind === "search-library") {
    return effect.destination === "hand" && effect.who === undefined && effect.whose === undefined ? effect : null;
  }
  if (effect.kind === "sequence") {
    for (const step of effect.effects) {
      const found = tutorOf(step);
      if (found !== null) return found;
    }
  }
  return null;
}

function hasAbilities(def: CardDefinition): boolean {
  return (
    def.keywords.length > 0 ||
    (def.static ?? []).length > 0 ||
    (def.triggered ?? []).length > 0 ||
    (def.activated ?? []).length > 0
  );
}

interface Reader {
  readonly state: GameState;
  readonly registry: CardRegistry;
  readonly player: PlayerId;
  readonly lands: number;
  readonly landsWanted: number;
  /** Lands in the hand ahead of the card being read: for a card that isn't
   * in the hand (a tutor's find), all of the hand's. */
  readonly landsAhead: number;
}

function isLand(state: GameState, registry: CardRegistry, id: ObjectId): boolean {
  const name = state.objects[id]?.cardName;
  return name !== undefined && registry.has(name) && registry.get(name).types.includes("land");
}

/** A tutor's quality: `CONVERT` of the best cards it could find. A tutor
 * found by a tutor reads as an average card, so this never recurses. */
function tutorQuality(reader: Reader, search: SearchToHand): number {
  const { state, registry, player } = reader;
  const take = typeof search.max === "number" ? Math.max(1, search.max) : 1;
  const found: number[] = [];
  for (const id of state.zones.perPlayer[player].library) {
    if (!matchesFilter(state, registry, id, search.filter, { you: player })) continue;
    found.push(qualityOf(reader, id, false));
  }
  if (found.length === 0) return QUALITY_MIN;
  found.sort((a, b) => b - a);
  let total = 0;
  for (const quality of found.slice(0, take)) total += quality;
  return CONVERT * total;
}

/** The cards card flow leaves us up, for a spell that is nothing else: its
 * draws less what a discard cost throws, at least one. `null` otherwise. */
function flowOf(registry: CardRegistry, def: CardDefinition): number | null {
  if (def.effect === null || def.effect === undefined) return null;
  let thrown = 0;
  if (def.additionalCost !== null) {
    const { discard, ...rest } = def.additionalCost;
    if (typeof discard !== "number" || Object.keys(rest).length > 0) return null;
    thrown = discard;
  }
  if (thrown === 0 && def.targets.length === 0 && tutorOf(def.effect) !== null) return null;
  const flow = cardFlowGain(def.effect, registry);
  return flow === null ? null : Math.max(1, flow - thrown);
}

function spellQuality(reader: Reader, def: CardDefinition, tutors: boolean): number {
  if (def.effect === null || def.effect === undefined) return 1;
  // A cost beyond mana (Deadly Dispute's sacrifice) comes off what the spell
  // makes, by an amount only the board knows.
  if (def.additionalCost !== null || def.targets.length > 0) return 1;
  const search = tutorOf(def.effect);
  if (search !== null) return tutors ? tutorQuality(reader, search) : 1;
  const worth = effectWorth(def.effect, {
    state: reader.state,
    me: reader.player,
    controller: reader.player,
    targets: [],
    cards: reader.registry,
  });
  // Nothing read, or nothing good read: unknown, an average card.
  return worth > 0 ? (CONVERT * worth) / CARD : 1;
}

/** What `def` costs at its cheapest: a split card's cheaper half, a
 * double-faced card's cheaper spell face. */
function cheapestManaValue(registry: CardRegistry, def: CardDefinition): number {
  const whole = manaValue(parseManaCost(def.manaCost));
  if (def.faces === null || def.faces.length < 2) return whole;
  let least = whole;
  for (const name of def.faces) {
    if (name === def.name || !registry.has(name)) continue;
    const face = registry.get(name);
    if (face.types.includes("land")) continue;
    least = Math.min(least, manaValue(parseManaCost(face.manaCost)));
  }
  return least;
}

function qualityOf(reader: Reader, id: ObjectId, tutors: boolean): number {
  const object = reader.state.objects[id];
  if (object === undefined || !reader.registry.has(object.cardName)) return 1;
  const def = reader.registry.get(object.cardName);
  if (def.types.includes("land")) {
    if (reader.lands >= reader.landsWanted) return SURPLUS_LAND;
    return reader.landsAhead === 0 ? NEXT_LAND : 1;
  }
  let quality = 1;
  const spell = def.types.includes("instant") || def.types.includes("sorcery");
  // Card flow first, and outside the floor every other card has: a discard
  // cost comes off its draws (Thrill of Possibility), and Compulsive Research
  // aims its draw.
  const flow = spell ? flowOf(reader.registry, def) : null;
  if (flow !== null) return FLOW_CARD * flow;
  if (def.types.includes("creature")) {
    const body = BODY_SHARE * (BODY + STAT * ((def.power ?? 0) + (def.toughness ?? 0)));
    quality = hasAbilities(def) ? Math.max(1, body) : body;
  } else if (spell) {
    quality = spellQuality(reader, def, tutors);
  }
  const short = Math.max(0, cheapestManaValue(reader.registry, def) - (reader.lands + 1));
  quality *= Math.max(REACH_FLOOR, 1 - OUT_OF_REACH * short);
  return Math.min(QUALITY_MAX, Math.max(QUALITY_MIN, quality));
}

/** The quality of one card of `player`'s that isn't in their hand, were it
 * added to it, with `lands` lands in play — see the module comment. What a
 * search into hand is ranked by (`controller.ts`). */
export function handCardQuality(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  id: ObjectId,
  lands: number,
  landsWanted: number,
): number {
  const landsAhead = state.zones.perPlayer[player].hand.filter((card) => isLand(state, registry, card)).length;
  return qualityOf({ state, registry, player, lands, landsWanted, landsAhead }, id, true);
}

/** The `handQuality` feature: how far `player`'s hand is above or below a
 * hand of average cards, in cards. */
export function handQuality(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  lands: number,
  landsWanted: number,
): number {
  const hand = state.zones.perPlayer[player].hand;
  const base = { state, registry, player, lands, landsWanted };
  const landsInHand = hand.filter((id) => isLand(state, registry, id)).length;
  let total = 0;
  let landsAhead = 0;
  for (const id of hand) {
    const land = isLand(state, registry, id);
    // A tutor's find joins the whole hand; a hand card is read behind the
    // lands before it.
    total += qualityOf({ ...base, landsAhead: land ? landsAhead : landsInHand }, id, true) - 1;
    if (land) landsAhead += 1;
  }
  return total;
}
