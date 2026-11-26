/**
 * The evaluation's *features*, split out from its weights.
 *
 * `evaluate.ts` used to compute a feature and multiply it by its weight in the
 * same expression, which is fine for scoring and useless for fitting: to learn
 * the weights from real games you need the raw feature vector of a position,
 * unweighted, so a regression can be run over it. This module produces exactly
 * that, and `evaluateState` is now a dot product over what it returns.
 *
 * ## Why only some of `EvalWeights` lives here
 *
 * These are the terms the score is *linear* in, and they're the only ones a
 * linear fit can speak about. Three weights are deliberately absent:
 *
 * - `landCap` is a threshold *inside* a feature (it decides where `lands`
 *   stops and `extraLands` begins), not a coefficient. It's a hyperparameter
 *   here, passed in.
 * - `opponent` and `otherOpponents` are how per-player scores are *aggregated*
 *   across a table, above this layer. Fitting happens on two-player positions,
 *   where there is exactly one opponent and the aggregation is a free scale.
 * - `crackbackParanoia`, `crackbackMargin`, `crackbackGrowth` and
 *   `crackbackKillShot` aren't
 *   evaluation terms at all — they're knobs on the attack builder's combat
 *   arithmetic (`combat-math.ts`).
 *
 * Those six stay hand-set or tuned by the (1+1)-ES in `tune-bot.mjs`. See
 * `docs/plans/smarter-bots.md`, "Fitting the weights from self-play".
 *
 * ## Sign convention
 *
 * Every weight in `EvalWeights` is positive, and terms that are a *cost*
 * (commander damage taken, commander tax) are subtracted rather than carrying
 * a negative weight — so the tuner's multiplicative mutation can never flip a
 * term's meaning. Features here are raw magnitudes and {@link featureSign}
 * carries that convention, which keeps one useful property for the fit: with
 * the sign folded in, a fitted coefficient is positive exactly when the
 * feature is good for you.
 */

import { costLosesSource, isManaAbility } from "../abilities.js";
import { journalTotal } from "../journal.js";
import type { TriggeredAbility } from "../abilities.js";
import {
  combatDamageOf,
  computeCharacteristics,
  hasLostAbilities,
  lethalDamageOf,
  playerProtectedFrom,
  staticConditionMet,
  withComputedCache,
} from "../characteristics.js";
import type { Characteristics } from "../characteristics.js";
import type { CardRegistry } from "../cards.js";
import type { CardDefinition, Keyword } from "../cards/define.js";
import { entersToCounter } from "../effect-worth.js";
import type { EffectSpec } from "../effects.js";
import { matchesFilter } from "../filter.js";
import { handedRound } from "../handed-round.js";
import { manaValue, parseManaCost } from "../mana.js";
import type { StaticPlay } from "../play-permission.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { POISON_LETHAL, printedCardName, rulesTextName, settledTally } from "../state.js";
import { HARMFUL_COUNTERS } from "../target-polarity.js";
import { playersAttackableNextTurn, readyToBlock } from "../combat/eligibility.js";
import { attackTaxAt, canBlock, combatCreatures, manaToAttackWith } from "./combat-math.js";
import { handCardQuality, handQuality as handQualityOf } from "./hand-worth.js";
import type { CombatCreature } from "./combat-math.js";
import { goneAtEndStep } from "./gone-at-end-step.js";
import { hasColouredLinkedCard, manaOnlyFromLinkedCards } from "./linked-mana.js";
import { COMMANDER_DAMAGE_LETHAL } from "../view.js";
import type { GameObject, GameState } from "../state.js";

/** The terms the score is linear in — the vector a fit operates on. Order is
 * load-bearing: `scripts/fit-weights.mjs` and the fitted-weight files index
 * by it. */
export const FEATURE_KEYS = [
  "life",
  "lifeDanger",
  "commanderDamage",
  "hand",
  "handManaValue",
  "creatures",
  "power",
  "toughness",
  "evasivePower",
  "combatKeywords",
  "untappedCreatures",
  "lands",
  "extraLands",
  "untappedMana",
  "otherPermanents",
  "guards",
  "permanentManaValue",
  "loyalty",
  "counters",
  "library",
  "libraryDanger",
  "graveyard",
  "graveyardCastable",
  "energy",
  "monarch",
  "initiative",
  "emblems",
  "commanderTax",
  "nonlandMana",
  "drawEngines",
  "commanderOnBoard",
  "idlePower",
  "extraTokens",
  "threat",
  "answers",
  "resourceTokens",
  "tokenEngines",
  "earlyRemoval",
  "earlyMana",
  "smallTokens",
  "lifeSurplus",
  "trackRecord",
  "handQuality",
  "valueEngines",
  "standingEffects",
  "libraryTop",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];
export type PlayerFeatures = Readonly<Record<FeatureKey, number>>;

/** Features the score subtracts: a cost, held as a positive magnitude under a
 * positive weight. */
const SUBTRACTED: ReadonlySet<string> = new Set([
  "commanderDamage",
  "commanderTax",
  "lifeDanger",
  "libraryDanger",
  "idlePower",
  "threat",
  "smallTokens",
  "lifeSurplus",
]);

/**
 * Where life stops being a resource and starts being the game.
 *
 * `life` is linear, and `bot:audit`'s curve check has always said so: losing
 * five at 8 life and at 40 score identically, ratio 1.00. No weight fixes
 * that — a weight scales a curve, it cannot bend one — so the bend has to be
 * a feature.
 *
 * It's expressed as *distance below a threshold* rather than as a transform of
 * `life` (a `sqrt`, say) for one property worth more than elegance: the term is
 * strictly additive, so `lifeDanger: 0` reproduces the old evaluation exactly.
 * A new feature that can't regress the old one is a much easier thing to
 * measure, and the sweep can say "zero was right" without anything else having
 * moved.
 *
 * 15 of Commander's 40, i.e. the point at which one more good attack is
 * plausibly lethal.
 */
const LIFE_DANGER_AT = 15;

/**
 * The other end of `life`'s curve: past this, a point of life buys less. At a
 * flat 0.5 a point, six life at 35 cost 3 — a card and a half — so a 1/1
 * token that chumped a Craw Wurm there was worth keeping only if worth more
 * than that, while Deadly Dispute trades one for about a card and a Treasure
 * (2.5). `lifeSurplus` takes some of each point above this back — of our own
 * life only. The user's call (2026-10-04): life above 30 counts for less.
 */
const LIFE_SURPLUS_ABOVE = 30;

/** The most toughness one creature counts for (`toughness`). Its combat
 * damage is a separate term, so a Felothar wall that hits with its toughness
 * keeps that in full. */
const TOUGHNESS_CAP = 10;

/**
 * What losing `damage` life from `life` costs the evaluation: `life` a
 * point, plus `lifeDanger` for each point that lands below
 * {@link LIFE_DANGER_AT} — the evaluation's own bend, for the cheap
 * arithmetic that ranks combat moves before any is simulated. Priced
 * linearly, a block at 8 life looked as cheap as one at 40.
 */
export function lifeCost(
  life: number,
  damage: number,
  w: { readonly life: number; readonly lifeDanger: number; readonly lifeSurplus: number },
): number {
  const below = (at: number): number => Math.max(0, LIFE_DANGER_AT - at);
  const above = (at: number): number => Math.max(0, at - LIFE_SURPLUS_ABOVE);
  return (
    damage * w.life +
    (below(life - damage) - below(life)) * w.lifeDanger -
    (above(life) - above(life - damage)) * w.lifeSurplus
  );
}

/**
 * Where a library stops being a resource and starts being a clock.
 *
 * Same shape and same reasoning as {@link LIFE_DANGER_AT}: milling ten off a
 * 12-card library and off a 52-card one score identically today (ratio 1.00),
 * and drawing from an empty library loses the game outright (rule 104.3c).
 */
const LIBRARY_DANGER_AT = 15;

/** `commanderDamage` from the worst damage taken: `d²/21`, so 21 is still
 * 21 and a hit weighs more the nearer the loss. */
const commanderDamageCurve = (taken: number): number => (taken * taken) / COMMANDER_DAMAGE_LETHAL;

/** The opponents' average hand size at which a counterspell in hand is
 * worth exactly `answers`' weight. */
const ANSWER_HAND = 3;
/** The most the opponents' hands can scale `answers` by. */
const ANSWER_HAND_SCALE_MAX = 2;

/** How much of `answers` a counterspell held now is worth: the living
 * opponents' average hand size over `ANSWER_HAND`, capped at
 * `ANSWER_HAND_SCALE_MAX`. Hand sizes are public. */
function answerHandScale(state: GameState, player: PlayerId): number {
  const opponents = state.turnOrder.filter((p) => p !== player && !state.players[p].hasLost);
  if (opponents.length === 0) return 0;
  const cards = opponents.reduce((n, p) => n + state.zones.perPlayer[p].hand.length, 0);
  return Math.min(ANSWER_HAND_SCALE_MAX, cards / opponents.length / ANSWER_HAND);
}

/** The rounds of the game in which removal in hand counts `earlyRemoval` in
 * full: every player's first two turns… */
const EARLY_REMOVAL_ROUNDS = 2;
/** …fading to nothing by this one (the user's report, 2026-11-11: it fell
 * off a cliff at round 3, and the bots spent Swords on a fresh two-mana
 * commander on their third turn). */
const EARLY_REMOVAL_END = 6;

/** `earlyMana` counts a permanent's mana in full through this round… */
const EARLY_MANA_FULL = 2;
/** …and fades to nothing by this one: a Sol Ring on turn one is a third of
 * a player's mana and two turns ahead, by turn six one source among many. */
const EARLY_MANA_END = 6;

/** The round of the game: every player's first turn is round 1. */
export function roundOf(state: GameState): number {
  return Math.ceil(state.turn.number / Math.max(1, state.turnOrder.length));
}

/** How many land drops `player` has had: one a turn begun (the round, less
 * one while their seat hasn't come round yet this round), less this turn's
 * while it's theirs and no land is down yet — a rollout stops as the next
 * turn begins, before its land drop, and a ramped player read there as
 * behind. Extra turns aren't counted. */
function landDropsHad(state: GameState, player: PlayerId): number {
  const seats = Math.max(1, state.turnOrder.length);
  const round = roundOf(state);
  const offset = (state.turnOrder.indexOf(player) - state.turn.activePlayerIndex + seats) % seats;
  if (offset === 0) return Math.max(0, journalTotal(state, "land-played", player, "count") > 0 ? round : round - 1);
  const activeAt = (state.turn.number - 1) % seats;
  return activeAt + offset >= seats ? round : Math.max(0, round - 1);
}

/** How much of `nonlandMana` counts as `earlyMana` this round: 1 through
 * `EARLY_MANA_FULL`, falling in a line to 0 at `EARLY_MANA_END`. */
function earlyManaShare(state: GameState): number {
  const round = roundOf(state);
  if (round <= EARLY_MANA_FULL) return 1;
  return Math.max(0, (EARLY_MANA_END - round) / (EARLY_MANA_END - EARLY_MANA_FULL));
}

/** `threat` weighs damage against what's left to lose: at this much life a
 * point counts as one, at twice it as a half. */
const THREAT_LIFE = 20;
/** The most one point of damage can count for in `threat`, however close
 * to lethal. */
const MAX_THREAT_SCALE = 10;

/**
 * How many identical noncreature tokens (Treasures, Clues, Food) count in
 * full towards `otherPermanents`; the rest are `extraTokens`. The same shape
 * as `landCap`/`extraLands`, and for a sharper reason: counted in full, a
 * pile was worth 2 points a Treasure without end, so on seed 50 a bot with
 * Old Gnawbone and Atarka pumped its Dragons again and again after the only
 * player it was hitting had died — eighteen Treasures a pump, +640 a batch —
 * and never finished the turn. A turn rarely spends more than a few.
 */
export const TOKEN_CAP = 4;

/**
 * How many more of a pile count as `extraTokens`, past `TOKEN_CAP`; beyond
 * that a token counts for nothing. Bounded so that making them is never a
 * gain without end (seed 50, above), and not zero so that spending them
 * isn't free: with every Treasure past the fourth worth nothing, nineteen
 * Scion of the Ur-Dragon activations paid for with 31 of them scored the
 * same as one (reported from a live game, 2026-11-14).
 */
export const EXTRA_TOKEN_CAP = 8;

export const featureSign = (key: FeatureKey): number => (SUBTRACTED.has(key) ? -1 : 1);

const resourceMemo = new Map<string, boolean>();

/**
 * A token that's spent by sacrificing itself: Treasure, Clue, Food, Blood,
 * Gold. One use and it's gone, so it's `resourceTokens`, not a permanent
 * counted like a Sol Ring — counted as one, "spend a Treasure to cast Sol
 * Ring" scored as giving up a card for nothing, and v2 held its Sol Ring for
 * three turns with the spells it would have cast stuck in hand (seed 20).
 */
function isResourceToken(registry: CardRegistry, name: string): boolean {
  let found = resourceMemo.get(name);
  if (found === undefined) {
    found = registry.has(name) && (registry.get(name).activated ?? []).some((a) => a.cost.sacrifice === "self");
    resourceMemo.set(name, found);
  }
  return found;
}

const EVASION: readonly Keyword[] = [
  "flying",
  "menace",
  "trample",
  "fear",
  "intimidate",
  "skulk",
  "shadow",
  "horsemanship",
  "unblockable",
];

const COMBAT_KEYWORDS: readonly Keyword[] = [
  "first-strike",
  "double-strike",
  "deathtouch",
  "lifelink",
  "vigilance",
  "indestructible",
  "hexproof",
  "shroud",
];

/** Counter kinds another feature already accounts for, or that measure
 * progress rather than value — or that are no good to whoever has them
 * (`HARMFUL_COUNTERS`: stun, blight, flood; and age, a cumulative upkeep's
 * growing bill). Each used to score 0.5 for its controller, so stunning an
 * opponent's creature lowered our score (the bot audit's Q5, 2026-11-10). */
const UNSCORED_COUNTERS: ReadonlySet<string> = new Set([
  "+1/+1",
  "loyalty",
  "lore",
  "time",
  "age",
  ...HARMFUL_COUNTERS,
]);

/** A +X/+Y or -X/-Y counter (rule 122.1a), which the P/T already counts. */
const PT_COUNTER = /^[+-]\d+\/[+-]\d+$/;

const stationCaps = new WeakMap<CardDefinition, number>();

/**
 * The most charge counters worth counting on a station card (rule
 * 702.184b): its highest station symbol's threshold (721.2), past which more
 * counters give it nothing — so stationing it further only taps a creature,
 * a blocker or an attacker lost (a live misplay, 2026-10-07: Hearthhull at 10
 * counters stationed with a Craw Wurm, read as +3). Infinite for a card that
 * isn't one, or that reads its charge counters itself (The Eternity
 * Elevator's X mana).
 */
function chargeCap(def: CardDefinition): number {
  const known = stationCaps.get(def);
  if (known !== undefined) return known;
  let cap = Infinity;
  if (def.activated.some((ability) => ability.station === true) && !readsChargeCounters(def)) {
    const thresholds = def.static.flatMap((s) => {
      const condition = s.condition;
      if (condition?.kind !== "source") return [];
      const counters = condition.filter.counters;
      const n = counters?.kind === "charge" && counters.compare.op === "gte" ? counters.compare.n : null;
      return typeof n === "number" ? [n] : [];
    });
    if (thresholds.length > 0) cap = Math.max(...thresholds);
  }
  stationCaps.set(def, cap);
  return cap;
}

/** Whether something on `def` counts its own charge counters (a
 * `countersOn` amount naming them), so more always matter. */
function readsChargeCounters(def: CardDefinition): boolean {
  const seen = (value: unknown): boolean => {
    if (value === null || typeof value !== "object") return false;
    if (Array.isArray(value)) return value.some(seen);
    const record = value as Record<string, unknown>;
    if ("countersOn" in record && record.counter === "charge") return true;
    return Object.values(record).some(seen);
  };
  return seen(def.activated) || seen(def.triggered) || seen(def.static);
}

function manaValueOf(registry: CardRegistry, name: string): number {
  return registry.has(name) ? manaValue(parseManaCost(registry.get(name).manaCost)) : 0;
}

function hasTapManaAbility(registry: CardRegistry, object: GameObject): boolean {
  const name = rulesTextName(object);
  if (!registry.has(name)) return false;
  return (registry.get(name).activated ?? []).some((a) => a.cost.tap && isManaAbility(a));
}

/** Cards whose abilities put the cards exiled with them back onto the
 * battlefield (`return-exiled-by-source` with `linked: "battlefield"` —
 * Colfenor's Urn), by name, read once. */
const returnsExiledToBattlefield = new Map<string, boolean>();

function returnsExiledCards(registry: CardRegistry, name: string): boolean {
  let known = returnsExiledToBattlefield.get(name);
  if (known === undefined) {
    const def = registry.has(name) ? registry.get(name) : undefined;
    const text = def === undefined ? "" : JSON.stringify([def.triggered, def.activated]);
    known = text.includes('"return-exiled-by-source"') && text.includes('"linked":"battlefield"');
    returnsExiledToBattlefield.set(name, known);
  }
  return known;
}

/**
 * Whether `object`, one of `player`'s cards in exile, waits there to come
 * back: exiled *with* a permanent of theirs, still in the stint it was
 * exiled by (rule 607.2a), that returns its cards to the battlefield — a
 * creature under Colfenor's Urn. Counted as a card still in reach, like one
 * castable from the graveyard; without it a card under the Urn was worth
 * nothing, less than one in the graveyard, and the bot never took the Urn's
 * "you may exile it" (capture 9M59N t22).
 */
function waitsToReturn(state: GameState, registry: CardRegistry, player: PlayerId, object: GameObject): boolean {
  const link = object.exiledWith;
  if (link === undefined || object.owner !== player) return false;
  const source = state.objects[link.source];
  return (
    source !== undefined &&
    source.zone === "battlefield" &&
    source.controller === player &&
    (source.zoneChangeCount ?? 0) === link.zoneChangeCount &&
    returnsExiledCards(registry, rulesTextName(source))
  );
}

function castableFromGraveyard(registry: CardRegistry, object: GameObject): boolean {
  if (object.grantedFlashback) return true;
  if ((object.grantedGraveyardKeywords?.length ?? 0) > 0) return true;
  if (!registry.has(object.cardName)) return false;
  const def = registry.get(object.cardName);
  return (
    def.flashback !== null ||
    def.retrace ||
    def.escape !== null ||
    def.disturb !== null ||
    def.mayPlaySelf?.from.includes("graveyard") === true ||
    (def.activated ?? []).some((a) => a.zone === "graveyard")
  );
}

/** A permanent's static "you may play … from your graveyard"
 * (`StaticAbility.mayPlay`, `play-permission.ts`). */
interface GraveyardPlay {
  readonly source: GameObject;
  readonly play: StaticPlay;
}

const graveyardPlayMemo = new WeakMap<CardDefinition, readonly StaticPlay[]>();

/** The permissions to play cards from a graveyard among `def`'s statics.
 * Nearly always none, which is all the board's loop pays to know. */
function graveyardPlaysOf(def: CardDefinition): readonly StaticPlay[] {
  let found = graveyardPlayMemo.get(def);
  if (found === undefined) {
    found = def.static.flatMap((ability) => (ability.mayPlay?.from === "graveyard" ? [ability.mayPlay] : []));
    graveyardPlayMemo.set(def, found);
  }
  return found;
}

/** `source`'s graveyard permissions in force: its statics not lost, each
 * one's "as long as" met (rule 604.3). */
function graveyardPlaysInForce(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  def: CardDefinition,
  into: GraveyardPlay[],
): void {
  if (graveyardPlaysOf(def).length === 0 || hasLostAbilities(state, registry, source)) return;
  for (const ability of def.static) {
    const play = ability.mayPlay;
    if (play === undefined || play.from !== "graveyard") continue;
    if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) continue;
    into.push({ source, play });
  }
}

/**
 * How many of `cards`, graveyard cards of `player`'s that nothing of their
 * own makes castable, the permissions of `player`'s permanents reach
 * (`plays`): Gisa and Geralf's Zombies, Muldrotha's permanents, the lands
 * under a Crucible of Worlds. Before this they were plain graveyard cards,
 * worth nothing, and a mill that filled the graveyard for them scored as one
 * that didn't.
 *
 * Each permission counts as many cards as it lets its controller play in a
 * turn, since that many are in reach as a hand's cards are: one for "once
 * each turn" (`oncePerTurn`), one of each permanent type for Muldrotha
 * (`perType`), a land and a spell for Coram (`landAndSpell`), every card for
 * one with no limit (Yawgmoth's Agenda) — and one land among them all, the
 * turn's land drop. Which cards: the permission's `filter` and `spell`, read
 * from the card as it lies (the engine judges the face cast, with any
 * `{ amount }` counted from the source — Arcade Gannon's fails closed here).
 *
 * Not read: whose turn it is and whether this turn's use is spent
 * (`yourTurnOnly`, `GameObject.playUses`) — the count is what stays in reach
 * from turn to turn, as a flashback card counts though it can't be cast
 * now, and reading the use would price a cast from the graveyard as the
 * loss of the permission. Nor what the play costs besides mana (`payLife`,
 * `sacrifice`, `exileOthers`), nor another player's graveyard
 * (`anyGraveyard`).
 */
function reachedFromGraveyard(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  plays: readonly GraveyardPlay[],
  cards: readonly ObjectId[],
): number {
  const room = plays.map(({ play }) => ({
    left: play.oncePerTurn === true ? 1 : (play.upTo ?? Infinity),
    types: play.perType === undefined ? null : new Set<string>(play.perType),
    land: play.landAndSpell === true ? 1 : Infinity,
    spell: play.landAndSpell === true ? 1 : Infinity,
  }));
  let reached = 0;
  let landReached = false;
  for (const id of cards) {
    const object = state.objects[id];
    if (object === undefined || !registry.has(object.cardName)) continue;
    const types: readonly string[] = registry.get(object.cardName).types;
    const isLand = types.includes("land");
    if (isLand && landReached) continue;
    for (let i = 0; i < plays.length; i += 1) {
      const { source, play } = plays[i];
      const left = room[i];
      if (left.left <= 0 || (isLand ? left.land : left.spell) <= 0) continue;
      // "You may cast" leaves a land where it is (rule 305.9).
      if (isLand && play.play !== true && play.perType?.includes("land") !== true) continue;
      const slot = left.types === null ? undefined : types.find((type) => left.types?.has(type));
      if (left.types !== null && slot === undefined) continue;
      const context = { you: player, source: source.id };
      if (play.filter !== undefined && !matchesFilter(state, registry, id, play.filter, context)) continue;
      if (!isLand && play.spell !== undefined && !matchesFilter(state, registry, id, play.spell, context)) continue;
      left.left -= 1;
      if (isLand) left.land -= 1;
      else left.spell -= 1;
      if (slot !== undefined) left.types?.delete(slot);
      if (isLand) landReached = true;
      reached += 1;
      break;
    }
  }
  return reached;
}

const count = (c: Characteristics, keywords: readonly Keyword[]): number =>
  keywords.filter((k) => c.keywords.has(k)).length;

/** Mana one activation of an `add-mana` effect makes: Sol Ring's `{C}` twice
 * is 2, a Signet's `{W}{U}` is 2. A live amount (Gaea's Cradle) counts 1 —
 * enough to say it makes mana without guessing how much. */
function manaMade(effect: EffectSpec | null | undefined): number {
  if (effect === null || effect === undefined) return 0;
  if (effect.kind === "sequence") return effect.effects.reduce((sum, e) => sum + manaMade(e), 0);
  if (effect.kind !== "add-mana") return 0;
  const units = typeof effect.amount === "number" ? effect.amount : 1;
  const mana = effect.mana;
  return units * (typeof mana === "object" && "all" in mana ? mana.all.length : 1);
}

const manaMemo = new WeakMap<CardDefinition, number>();

/**
 * The mana a permanent adds each turn, net of what the ability costs: Sol
 * Ring 2, a Signet 1 (two for `{1}`), a dork 1. Its best `{T}` mana ability,
 * since it taps once a turn; a sacrifice (a Treasure) is one mana once, not a
 * mana source.
 */
function manaPerTurn(def: CardDefinition): number {
  let found = manaMemo.get(def);
  if (found === undefined) {
    found = 0;
    for (const ability of def.activated) {
      if (!ability.cost.tap || ability.cost.sacrifice !== undefined || !isManaAbility(ability)) continue;
      const cost = ability.cost.mana === null ? 0 : manaValue(parseManaCost(ability.cost.mana));
      found = Math.max(found, manaMade(ability.effect) - cost);
    }
    manaMemo.set(def, found);
  }
  return found;
}

/**
 * The mana permanent `id` adds each turn ({@link manaPerTurn}), but none
 * where all of it is the colours of the cards exiled with it and none is: a
 * Chrome Mox with nothing imprinted, or a colourless card, makes no mana
 * (the rulings; `linked-mana.ts`).
 * Counted from the definition alone, an empty Mox was the same mana rock as
 * an imprinted one, and v2 cast one and kept the card (a report from a live
 * game, 2026-11-23: `docs/bot-misplays.md`).
 */
function manaPerTurnOf(state: GameState, registry: CardRegistry, id: ObjectId, def: CardDefinition): number {
  const made = manaPerTurn(def);
  if (made <= 0 || !manaOnlyFromLinkedCards(def)) return made;
  return hasColouredLinkedCard(state, registry, id) ? made : 0;
}

/**
 * How much of its mana a turn a tapped permanent still counts for when it
 * doesn't untap during its controller's untap step ({@link staysTapped}).
 * Its mana is gone until something untaps it, and counted in full it was the
 * same rock tapped or not: in a live game (kept game B8NWK, 2026-11-24,
 * `docs/bot-misplays.md`) "{3}: Untap this artifact" scored the same as
 * passing to the last digit at the end of the turn before the bot's own,
 * three lands spare, and Basalt Monolith stayed tapped from turn 20 to the
 * end. Half, not none: it is still one activation from a mana rock, and what
 * is taken off is what tapping it for a spell now costs — 0.75 for the
 * Monolith at `nonlandMana` 0.5, under what any spell is worth. `earlyMana`
 * keeps the full count: at its 6 a mana, tapping the rock on turn four would
 * read as nine points lost.
 */
const STUCK_MANA_SHARE = 0.5;

/** "This permanent doesn't untap during your untap step", said by itself with
 * no condition: Basalt Monolith, Grim Monolith, Mana Vault. Not the lands
 * that stay down only while they hold a depletion counter. */
function staysTapped(def: CardDefinition): boolean {
  return def.static.some((a) => a.doesntUntap === true && a.affects.scope === "self" && a.condition === undefined);
}

const reductionMemo = new WeakMap<CardDefinition, number>();

/**
 * The mana a permanent saves its controller each turn: the generic mana its
 * best static takes off spells they cast (Goblin Electromancer 1, Urza's
 * Incubator 2; 1 for a counted amount), once, as for one spell a turn.
 * Counted with {@link manaPerTurn} in `nonlandMana`, so a reducer is a mana
 * rock for the spells it reaches. The audit's Q4 ("cost reduction as mana").
 *
 * Not one that reaches only a way of casting (`SpellCastClause.via`:
 * Catalyst Stone's "flashback costs you pay cost {2} less"): it takes
 * nothing off a spell cast from the hand, so it is no mana rock, and is
 * priced as the standing effect it is (`standingWorth`, which takes off only
 * what this counted). The engine prices such a cast exactly in the offer
 * (`Game.pricedVia`); this estimate, made off the board, read the clause's
 * caster and nothing else, and counted the Stone as two mana a turn.
 */
function reductionPerTurn(def: CardDefinition): number {
  let found = reductionMemo.get(def);
  if (found === undefined) {
    found = 0;
    for (const ability of def.static) {
      const mod = ability.costModification;
      if (mod?.reduceGeneric === undefined || mod.when?.caster === "opponent" || mod.when?.via !== undefined) continue;
      found = Math.max(found, typeof mod.reduceGeneric === "number" ? Math.max(0, mod.reduceGeneric) : 1);
    }
    reductionMemo.set(def, found);
  }
  return found;
}

/** A trigger that fires once in a permanent's life — its own entering, dying,
 * leaving, being cast — draws once, not every turn. */
function isOneShot(trigger: TriggeredAbility["trigger"]): boolean {
  if (trigger.on === "this-cast" || trigger.on === "this-cycled" || trigger.on === "this-discarded") return true;
  const who = (trigger as { readonly who?: unknown }).who;
  // A generic trigger event that happens to its own permanent at most once
  // in its life: it becomes monstrous or renowned once (rules 701.37b,
  // 702.112b), and stays so.
  if (trigger.on === "event") {
    return who === "self" && (trigger.event === "becomes-monstrous" || trigger.event === "becomes-renowned");
  }
  return (
    who === "self" &&
    (trigger.on === "enters-battlefield" ||
      trigger.on === "dies" ||
      trigger.on === "leaves-battlefield" ||
      trigger.on === "put-into-graveyard" ||
      trigger.on === "transforms")
  );
}

/** Does this effect counter a spell? Anywhere in the tree. */
function counters(effect: unknown): boolean {
  if (effect === null || typeof effect !== "object") return false;
  if (Array.isArray(effect)) return effect.some(counters);
  if ((effect as { readonly kind?: unknown }).kind === "counter") return true;
  return Object.values(effect).some((value) => value !== null && typeof value === "object" && counters(value));
}

/** Whether `effect` destroys, exiles or deals damage to a target. */
function removes(effect: unknown): boolean {
  if (effect === null || typeof effect !== "object") return false;
  if (Array.isArray(effect)) return effect.some(removes);
  const node = effect as { readonly kind?: unknown; readonly target?: unknown };
  if ((node.kind === "destroy" || node.kind === "exile" || node.kind === "damage") && typeof node.target === "number") {
    return true;
  }
  return Object.values(effect).some((value) => value !== null && typeof value === "object" && removes(value));
}

/** Target specs that can name an opponent's creature. */
function aimsAtCreatures(specs: readonly unknown[]): boolean {
  return specs.some((spec) => {
    const text = JSON.stringify(spec);
    return (
      text.includes("any-target") ||
      (text.includes("creature") && !text.includes("you-control") && !text.includes("spell"))
    );
  });
}

const removalMemo = new WeakMap<CardDefinition, boolean>();

/** An instant or sorcery that kills a target creature: Swords to Plowshares,
 * Murder, Lightning Bolt — the cards `earlyRemoval` holds back. */
function isRemoval(def: CardDefinition): boolean {
  let found = removalMemo.get(def);
  if (found === undefined) {
    // A mode of a modal spell counts on its own: Abrade's "3 damage to
    // target creature".
    const ways = [
      { targets: def.targets ?? [], effect: def.effect },
      ...(def.castModal?.modes ?? []).map((mode) => ({ targets: mode.targets ?? [], effect: mode.effect })),
    ];
    found =
      (def.types.includes("instant") || def.types.includes("sorcery")) &&
      ways.some((way) => aimsAtCreatures(way.targets) && removes(way.effect));
    removalMemo.set(def, found);
  }
  return found;
}

const answerMemo = new WeakMap<CardDefinition, boolean>();

/** A card held to counter something: its spell (or one of its modes) counters
 * a spell, or it's a creature that counters one as it enters. Counterspell,
 * Negate, Cryptic Command, Transcendent Dragon. */
export function isAnswer(def: CardDefinition): boolean {
  let found = answerMemo.get(def);
  if (found === undefined) {
    found = counters(def.effect) || counters(def.castModal) || entersToCounter(def);
    answerMemo.set(def, found);
  }
  return found;
}

/**
 * The most a draw engine is credited a round: past it the estimate below is
 * guessing (Consecrated Sphinx at four players would be six), and one engine
 * shouldn't outweigh a board.
 */
const DRAW_RATE_CAP = 3;

/** Cards one firing of `effect` draws its controller: the largest fixed
 * `draw` in it (1 for a counted one), halved under an `unless` an opponent
 * can pay to stop it (Rhystic Study, Esper Sentinel). 0 if it draws none. */
function drawsPerFiring(effect: unknown, unless = false): number {
  if (effect === null || typeof effect !== "object") return 0;
  if (Array.isArray(effect)) return Math.max(0, ...effect.map((e) => drawsPerFiring(e, unless)));
  const node = effect as {
    readonly kind?: unknown;
    readonly target?: unknown;
    readonly who?: unknown;
    readonly amount?: unknown;
  };
  if (node.kind === "draw" && node.target === undefined && (node.who === undefined || node.who === "you")) {
    const cards = typeof node.amount === "number" ? Math.max(1, node.amount) : 1;
    return unless ? cards / 2 : cards;
  }
  const inner = unless || node.kind === "unless";
  return Math.max(
    0,
    ...Object.values(effect).map((value) =>
      value !== null && typeof value === "object" ? drawsPerFiring(value, inner) : 0,
    ),
  );
}

/** An engine's output a round of the table, as `fixed + perOpponent` × the
 * opponents still in: see {@link engineRate}. */
interface EngineRate {
  readonly fixed: number;
  readonly perOpponent: number;
}

/**
 * What a permanent keeps making each round of the table, one firing making
 * what `perFiring` says. A trigger on what an opponent does fires once per
 * opponent a round (half that when only their second draw or spell a turn
 * counts, and once in all when it's their attack on us); one on anyone's
 * spell, draw or step once per player; anything else — our own upkeep, our
 * own spells, combat, a creature entering or dying — about once. Not a
 * one-shot (`isOneShot`). Activated abilities `repeatable` keeps, which
 * usually share a tap or the mana, count the best of them once.
 */
function engineRate(
  def: CardDefinition,
  perFiring: (effect: unknown) => number,
  repeatable: (ability: CardDefinition["activated"][number]) => boolean,
): EngineRate {
  let fixed = 0;
  let perOpponent = 0;
  for (const t of def.triggered) {
    if (isOneShot(t.trigger)) continue;
    const made = perFiring(t.effect);
    if (made === 0) continue;
    const trigger = t.trigger as {
      readonly on: string;
      readonly who?: unknown;
      readonly nthEachTurn?: unknown;
      readonly attackingYou?: unknown;
    };
    // An intervening "if" (rule 603.4) gates every firing — Ophiomancer
    // makes a Snake each upkeep only while it has none — so it's about once,
    // however many players' steps it watches. An opponent attacking *us*
    // (Ever-Watching Threshold, Isperia) is one of their targets, not every
    // opponent's every turn: about once too.
    if (t.condition !== undefined) {
      fixed += made;
    } else if (trigger.who === "opponent" && trigger.attackingYou !== true) {
      perOpponent += made * (typeof trigger.nthEachTurn === "number" && trigger.nthEachTurn > 1 ? 0.5 : 1);
    } else if (
      trigger.who === "any" &&
      (trigger.on === "cast-spell" || trigger.on === "draws" || trigger.on === "step-begins")
    ) {
      fixed += made;
      perOpponent += made;
    } else {
      fixed += made;
    }
  }
  let activated = 0;
  for (const a of def.activated) {
    if (repeatable(a)) activated = Math.max(activated, perFiring(a.effect));
  }
  return { fixed: fixed + activated, perOpponent };
}

const drawMemo = new WeakMap<CardDefinition, EngineRate>();

/**
 * How many cards a permanent keeps drawing its controller each round of the
 * table — 0 for one that doesn't. An upkeep draw (Phyrexian Arena), a draw on
 * others entering, dying or being cast, a repeatable activated or loyalty
 * ability that draws. Not a one-shot: a Solemn Simulacrum draws once, when it
 * dies, and a Mind Stone once, when it's sacrificed. The audit priced
 * Phyrexian Arena at a quarter of a Grizzly Bears, because nothing counted
 * what it keeps doing.
 *
 * By rate ({@link engineRate}), so Rhystic Study, which draws off every
 * opponent's spell, isn't scored the same as Phyrexian Arena's one card a
 * turn. Each firing draws what {@link drawsPerFiring} says. Arena is 1 by
 * construction, so `drawEngines` prices a card a round.
 */
function drawRate(def: CardDefinition, opponents: number): number {
  let rate = drawMemo.get(def);
  if (rate === undefined) {
    rate = engineRate(
      def,
      (effect) => drawsPerFiring(effect),
      (a) => !costLosesSource(a.cost) && !isManaAbility(a),
    );
    drawMemo.set(def, rate);
  }
  return Math.min(DRAW_RATE_CAP, rate.fixed + rate.perOpponent * opponents);
}

/** The most creature tokens one engine is credited a round, for the same
 * reasons as {@link DRAW_RATE_CAP}. */
const TOKEN_RATE_CAP = 3;

/** Creature tokens one firing of `effect` makes its controller: the largest
 * fixed `create-token` count in it (1 for a counted one), of a token that's
 * a creature. 0 if it makes none, or makes them for someone else. */
function tokensPerFiring(registry: CardRegistry, effect: unknown): number {
  if (effect === null || typeof effect !== "object") return 0;
  if (Array.isArray(effect)) return Math.max(0, ...effect.map((e) => tokensPerFiring(registry, e)));
  const node = effect as {
    readonly kind?: unknown;
    readonly token?: unknown;
    readonly count?: unknown;
    readonly who?: unknown;
  };
  if (node.kind === "create-token" && (node.who === undefined || node.who === "you")) {
    if (typeof node.token !== "string" || !registry.has(node.token)) return 0;
    if (!registry.get(node.token).types.includes("creature")) return 0;
    return typeof node.count === "number" ? node.count : 1;
  }
  return Math.max(
    0,
    ...Object.values(effect).map((value) =>
      value !== null && typeof value === "object" ? tokensPerFiring(registry, value) : 0,
    ),
  );
}

const tokenMemo = new WeakMap<CardDefinition, EngineRate>();

/**
 * How many creature tokens a permanent keeps making its controller each
 * round of the table — 0 for one that doesn't. Hero of Bladehold's two
 * Soldiers each attack, Young Pyromancer's Elemental off our instants and
 * sorceries, Elspeth, Sun's Champion's +1, Twilight Drover's activation. Not
 * a one-shot: Beetleback Chief makes its Goblins once, as it enters; nor an
 * ability that costs loyalty (Lord Windgrace's ultimate). The deck autopsies found the token decks' engines cast far less by
 * v2 than by v1 — Hero of Bladehold priced as a 3/4 — because nothing counted
 * what they keep making. Rated like {@link drawRate}.
 */
export function tokenRate(registry: CardRegistry, def: CardDefinition, opponents: number): number {
  let rate = tokenMemo.get(def);
  if (rate === undefined) {
    rate = engineRate(
      def,
      (effect) => tokensPerFiring(registry, effect),
      (a) => !costLosesSource(a.cost) && !isManaAbility(a) && a.loyaltyCost !== "-x" && (a.loyaltyCost ?? 0) >= 0,
    );
    tokenMemo.set(def, rate);
  }
  return Math.min(TOKEN_RATE_CAP, rate.fixed + rate.perOpponent * opponents);
}

/** Life taken from opponents counted as a card: 4 life is a card in the
 * evaluation (`life` 0.5 against `hand` 2). */
const LIFE_PER_CARD = 4;
/** Resource tokens counted as a card: a Treasure is about a mana, a quarter
 * of a card (`resourceTokens` 0.5 against `hand` 2). */
const RESOURCE_TOKENS_PER_CARD = 4;
/** The most one value engine is credited a round, in cards: six Treasures or
 * six life. Below {@link DRAW_RATE_CAP}, as neither is a card. */
const VALUE_RATE_CAP = 1.5;

/**
 * The most `leaf` reads off any one instruction of a firing of `effect`.
 * `leaf` answers for a node it prices (0 for one of its kind that makes
 * nothing for us) and `null` for any other, which is searched. Halved under
 * an `unless` an opponent can pay to stop it (Smothering Tithe), as
 * {@link drawsPerFiring} halves Rhystic Study.
 */
function mostPerFiring(
  effect: unknown,
  leaf: (node: Readonly<Record<string, unknown>>) => number | null,
  unless = false,
): number {
  if (effect === null || typeof effect !== "object") return 0;
  if (Array.isArray(effect)) return Math.max(0, ...effect.map((e) => mostPerFiring(e, leaf, unless)));
  const node = effect as Readonly<Record<string, unknown>>;
  const made = leaf(node);
  if (made !== null) return unless ? made / 2 : made;
  const inner = unless || node.kind === "unless";
  return Math.max(
    0,
    ...Object.values(node).map((value) =>
      value !== null && typeof value === "object" ? mostPerFiring(value, leaf, inner) : 0,
    ),
  );
}

/** Resource tokens (Treasure, Clue, Food: {@link isResourceToken}) one
 * firing of `effect` makes its controller. */
function resourcesPerFiring(registry: CardRegistry, effect: unknown): number {
  return mostPerFiring(effect, (node) => {
    if (node.kind !== "create-token") return null;
    if (node.who !== undefined && node.who !== "you") return 0;
    if (typeof node.token !== "string" || !isResourceToken(registry, node.token)) return 0;
    return typeof node.count === "number" ? node.count : 1;
  });
}

/** Life one firing of `effect` takes from opponents: from each of them
 * (`each`: Zulaport Cutthroat's loss, Purphoros's damage) or from one, a
 * targeted player's loss (Blood Artist). 1 for a counted amount. Damage aimed
 * at a target isn't counted: it may be a creature's. */
function drainPerFiring(effect: unknown, each: boolean): number {
  return mostPerFiring(effect, (node) => {
    if (node.kind !== "lose-life" && node.kind !== "damage") return null;
    const hitsEach = node.who === "each-opponent";
    const hitsOne = node.kind === "lose-life" && node.who === undefined && typeof node.target === "number";
    if (each ? !hitsEach : !hitsOne) return 0;
    return typeof node.amount === "number" ? Math.max(0, node.amount) : 1;
  });
}

interface ValueRates {
  readonly resources: EngineRate;
  readonly drainEach: EngineRate;
  readonly drainOne: EngineRate;
}

const valueMemo = new WeakMap<CardDefinition, ValueRates>();

function valueRates(registry: CardRegistry, def: CardDefinition): ValueRates {
  let rates = valueMemo.get(def);
  if (rates === undefined) {
    const repeatable = (a: CardDefinition["activated"][number]): boolean =>
      !costLosesSource(a.cost) && !isManaAbility(a) && a.loyaltyCost !== "-x" && (a.loyaltyCost ?? 0) >= 0;
    rates = {
      resources: engineRate(def, (effect) => resourcesPerFiring(registry, effect), repeatable),
      drainEach: engineRate(def, (effect) => drainPerFiring(effect, true), repeatable),
      drainOne: engineRate(def, (effect) => drainPerFiring(effect, false), repeatable),
    };
    valueMemo.set(def, rates);
  }
  return rates;
}

const perRound = (rate: EngineRate, opponents: number): number => rate.fixed + rate.perOpponent * opponents;

/** Life a permanent's printed abilities take from opponents each round of
 * the table: see {@link valueRate}. */
function drainRate(registry: CardRegistry, def: CardDefinition, opponents: number): number {
  const rates = valueRates(registry, def);
  return perRound(rates.drainEach, opponents) * opponents + perRound(rates.drainOne, opponents);
}

/**
 * What an engine that makes neither cards nor creatures keeps paying its
 * controller each round of the table, in cards — 0 for one that doesn't.
 * Resource tokens at {@link RESOURCE_TOKENS_PER_CARD} (Smothering Tithe's
 * Treasures, Tireless Tracker's Clues) and life taken from opponents at
 * {@link LIFE_PER_CARD} (Zulaport Cutthroat, Purphoros, Blood Artist), each
 * by {@link engineRate}. The audit's Q4: Smothering Tithe was a blank
 * four-mana permanent, worth less than a Grizzly Bears, and was never
 * countered or aimed at. A cost reduction is mana, not this:
 * {@link reductionPerTurn}.
 */
function valueRate(registry: CardRegistry, def: CardDefinition, opponents: number): number {
  const resources = perRound(valueRates(registry, def).resources, opponents) / RESOURCE_TOKENS_PER_CARD;
  return Math.min(VALUE_RATE_CAP, resources + drainRate(registry, def, opponents) / LIFE_PER_CARD);
}
/** What a vanilla creature scores over a noncreature permanent of the same
 * mana value before either does anything, less the mana value itself: on the
 * shared weights a creature of mana value N with N power and N toughness is
 * `creatures` 2.5 + its stats N + `untappedCreatures` 0.5 against
 * `otherPermanents`' 2, both with `permanentManaValue`. Half a point over,
 * so that on a quiet board the permanent that keeps working goes first. */
const STANDING_BASE = 1.5;
/** What the engine terms already score a permanent, in points a unit of each
 * rate: the shipped weights of `drawEngines`, `valueEngines`, `tokenEngines`
 * and `nonlandMana`. Constants, not the live weights: a feature is a count,
 * and this one is the points those terms leave short. */
const PRICED = { draw: 4, value: 4, token: 2, mana: 0.5 } as const;

/**
 * What a passive permanent is worth beyond what the engine terms price, in
 * points: 0 for one they already bring up to a creature of its mana value.
 *
 * A noncreature permanent scored `otherPermanents` + half its mana value,
 * less than half a vanilla creature of the same cost, so v2 cast every
 * creature in hand first and an enchantment only with mana left over: in the
 * upgraded decks' games Ghostly Prison was cast in 0 of 8 it could have been,
 * Smothering Tithe in 1 of 11, Parallel Lives in 0 of 4 (2026-11-11). The
 * rates price the engines they know (cards, tokens, Treasures, drain, mana);
 * the long tail (a token doubler, an attack tax, a trigger doubler, a free
 * cast) has no rate. This is the floor under all of them: a card costs about
 * what it is worth, so a permanent that keeps doing something is taken to be
 * worth a creature of its mana value until a rate says more.
 *
 * Only a permanent with a static ability, a trigger that can fire again, or
 * a Saga's chapters: one with only activated abilities is a mana rock or a
 * tool, priced where its use shows, and one whose only trigger is its own
 * entering has done its work (Bitter Reunion). Not an Aura or an Equipment,
 * whose worth is its host's, nor a planeswalker, which `loyalty` prices.
 */
function standingWorth(registry: CardRegistry, def: CardDefinition, opponents: number): number {
  const keepsWorking =
    def.static.length > 0 || def.triggered.some((t) => !isOneShot(t.trigger)) || (def.chapters?.length ?? 0) > 0;
  if (!keepsWorking || def.types.includes("planeswalker")) return 0;
  if (def.subtypes.includes("Aura") || def.subtypes.includes("Equipment")) return 0;
  const priced =
    PRICED.draw * drawRate(def, opponents) +
    PRICED.value * valueRate(registry, def, opponents) +
    PRICED.token * tokenRate(registry, def, opponents) +
    PRICED.mana * (manaPerTurn(def) + reductionPerTurn(def));
  return Math.max(0, manaValue(parseManaCost(def.manaCost)) + STANDING_BASE - priced);
}

/** One "deals double that damage instead" a card's static makes: how many
 * times over, from whose sources and to whose side. */
interface DamageMultiplier {
  readonly times: number;
  readonly from: "any" | "controller";
  readonly to: "any" | "controller" | "opponents";
}

const multipliersByDef = new WeakMap<CardDefinition, readonly DamageMultiplier[]>();

/**
 * The damage multipliers `def` prints as plain statics: Dictate of the Twin
 * Gods and Furnace of Rath (every source, everyone), Fiery Emancipation and
 * Angrath's Marauders (sources you control), Gisela (to an opponent's side).
 * One with a condition, or a filter this doesn't read, is left out: unread,
 * it counts as it did before, for nothing.
 */
function damageMultipliersOf(def: CardDefinition): readonly DamageMultiplier[] {
  const known = multipliersByDef.get(def);
  if (known !== undefined) return known;
  const out: DamageMultiplier[] = [];
  for (const s of def.static) {
    const r = s.replacement as
      | {
          readonly event?: unknown;
          readonly instead?: { readonly modify?: { readonly times?: unknown } };
          readonly source?: Readonly<Record<string, unknown>>;
          readonly to?: unknown;
        }
      | undefined;
    if (r === undefined || r.event !== "would-deal-damage" || s.condition !== undefined) continue;
    const times = r.instead?.modify?.times;
    if (typeof times !== "number" || times <= 1) continue;
    if (Object.keys(r).some((key) => key !== "event" && key !== "instead" && key !== "source" && key !== "to")) continue;
    const sourceKeys = Object.keys(r.source ?? {});
    if (sourceKeys.some((key) => key !== "controlledBy" && key !== "type")) continue;
    if (r.source !== undefined && (r.source.controlledBy !== "you" || (r.source.type ?? "creature") !== "creature")) continue;
    const to = r.to === undefined ? "any" : r.to === "opponent-side" ? "opponents" : r.to === "your-side" ? "controller" : null;
    if (to === null) continue;
    out.push({ times, from: r.source === undefined ? "any" : "controller", to });
  }
  multipliersByDef.set(def, out);
  return out;
}

/** Whether `def` doubles damage for everyone alike (Dictate of the Twin
 * Gods): worth what the two sides' damage makes it, not a creature of its
 * cost (`standingEffects`). */
const multipliesEveryonesDamage = (def: CardDefinition): boolean =>
  damageMultipliersOf(def).some((m) => m.from === "any" && m.to === "any");

/**
 * How many times over the combat damage of `from`'s creatures to `to` is
 * dealt, by the multipliers on the battlefield ({@link damageMultipliersOf}).
 * 1 on nearly every board.
 *
 * The evaluation read damage at its printed size, so a doubler was a
 * permanent like any other, worth a creature of its cost: Kardur's bot cast
 * Dictate of the Twin Gods at 6 commander damage from a Slicer that then hit
 * for 12 and for 6, and with the weakest board of four, where one swing of
 * 15 became its 30 life (three kept live games, 2026-11-22).
 */
function damageTimes(state: GameState, registry: CardRegistry): (from: PlayerId, to: PlayerId) => number {
  const live: { readonly controller: PlayerId; readonly m: DamageMultiplier }[] = [];
  for (const id of state.zones.shared.battlefield) {
    const object = state.objects[id];
    if (object === undefined || state.players[object.controller]?.hasLost !== false) continue;
    const name = rulesTextName(object);
    if (!registry.has(name)) continue;
    for (const m of damageMultipliersOf(registry.get(name))) live.push({ controller: object.controller, m });
  }
  if (live.length === 0) return () => 1;
  return (from, to) => {
    let times = 1;
    for (const { controller, m } of live) {
      if (m.from === "controller" && from !== controller) continue;
      if (m.to === "controller" && to !== controller) continue;
      if (m.to === "opponents" && to === controller) continue;
      times *= m.times;
    }
    return times;
  };
}

/** The card types a regeneration target word reaches among our own
 * permanents (`guardsAnother`); empty for any permanent. A word for an
 * opponent's permanent isn't here. */
const GUARDED_TYPES: Readonly<Record<string, readonly CardDefinition["types"][number][]>> = {
  creature: ["creature"],
  "creature-you-control": ["creature"],
  artifact: ["artifact"],
  enchantment: ["enchantment"],
  "artifact-or-creature": ["artifact", "creature"],
  "artifact-or-enchantment": ["artifact", "enchantment"],
  "creature-or-enchantment": ["creature", "enchantment"],
  permanent: [],
  "nonland-permanent": [],
};

/**
 * Whether noncreature permanent `id` (`def`) can regenerate another
 * permanent of `player`'s worth keeping — a nonland, nontoken one of mana
 * value 1 or more — through an activated ability aimed at it (Welding Jar's
 * "Sacrifice this artifact: Regenerate target artifact", Jhoira's Toolbox,
 * Loxodon Mender). Such a permanent is worth more on the battlefield than in
 * hand only while it has something to protect: before that it only waits for
 * a wipe. Without it a {0} Welding Jar scored exactly as much on the
 * battlefield as in hand (`otherPermanents` against `hand`), and the tie went
 * to passing for three turns with Lost Jitte, Kusari-Gama and Mithril Coat out
 * (a live game, TPGJ6-2, 2026-11-22). The user's call: cast it when there's
 * stuff to protect, not earlier.
 */
function guardsAnother(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  def: CardDefinition,
  player: PlayerId,
): boolean {
  const specs = def.activated.flatMap((a) => {
    const effect = a.effect as EffectSpec | null | undefined;
    if (effect?.kind !== "regenerate" || effect.target !== 0) return [];
    const spec = a.targets?.[0];
    return spec === undefined ? [] : [spec];
  });
  if (specs.length === 0) return false;
  for (const other of state.zones.shared.battlefield) {
    if (other === id) continue;
    const object = state.objects[other];
    if (object === undefined || object.controller !== player || object.isToken === true) continue;
    const c = computeCharacteristics(state, registry, other);
    if (c.types.includes("land") || manaValueOf(registry, printedCardName(object)) < 1) continue;
    for (const spec of specs) {
      if (typeof spec === "string") {
        const types = GUARDED_TYPES[spec];
        if (types !== undefined && (types.length === 0 || types.some((t) => c.types.includes(t)))) return true;
      } else if (spec.kind === "permanent" && matchesFilter(state, registry, other, spec.filter ?? {}, { you: player, source: id })) {
        return true;
      }
    }
  }
  return false;
}

/**
 * What `def`'s engine scores once it is on the battlefield, in points beside
 * its body: its draw, value and token rates at the shipped weights
 * (`PRICED`), and for a noncreature permanent the standing floor under them
 * (`standingWorth`). What a card in hand is read as an engine by
 * (`hand-worth.ts`): never the mana a rock makes, which the hand's reach
 * already wants, nor a track record, which a card in hand has none of.
 */
export function engineWorthDeployed(registry: CardRegistry, def: CardDefinition, opponents: number): number {
  const rates =
    PRICED.draw * drawRate(def, opponents) +
    PRICED.value * valueRate(registry, def, opponents) +
    PRICED.token * tokenRate(registry, def, opponents);
  return def.types.includes("creature") ? rates : rates + standingWorth(registry, def, opponents);
}

/** What an instant or sorcery that removes a creature or counters a spell is
 * worth to keep, in the points {@link engineWorthDeployed} counts in: a
 * point and a half, which reads as 1.3 of a card (`hand-worth.ts`) — over
 * the fifth land and an average card, under an engine. */
const INTERACTION_KEPT = 1.5;

/**
 * What `def` is worth keeping in hand for, in points beside an average card:
 * a permanent's engine ({@link engineWorthDeployed}), and for an instant or
 * sorcery, {@link INTERACTION_KEPT} if it is removal or a counterspell
 * (`isRemoval`, `isAnswer`: the cards `earlyRemoval` and `answers` hold
 * back). What a discard is chosen by ({@link withHandReadForKeeps}): read as
 * an average card, Fierce Guardianship went ahead of a vanilla 2/2.
 */
export function worthKeeping(registry: CardRegistry, def: CardDefinition, opponents: number): number {
  if (def.types.includes("instant") || def.types.includes("sorcery")) {
    return isRemoval(def) || isAnswer(def) ? INTERACTION_KEPT : 0;
  }
  return engineWorthDeployed(registry, def, opponents);
}

/** Whether `handQuality` is being read for what to keep — see
 * {@link withHandReadForKeeps}. */
let handReadForKeeps = false;

/**
 * Run `decide` — a bot choosing which of its cards to discard — with the
 * hand read for what to keep (`hand-worth.ts`): an engine for what it does
 * once it is out, the next land for what it casts. Module state, like
 * {@link withTrackRecordEvidence}: the search's rollouts evaluate inside
 * `decide`, and the engine is synchronous, so one decision is under way at a
 * time. Outside it the evaluation reads the hand as it always has.
 */
export function withHandReadForKeeps<T>(decide: () => T): T {
  const was = handReadForKeeps;
  handReadForKeeps = true;
  try {
    return decide();
  } finally {
    handReadForKeeps = was;
  }
}

/**
 * The decision a bot is making, as the `libraryTop` feature reads it — see
 * {@link withLibraryTop}.
 */
export interface LibraryTop {
  readonly player: PlayerId;
  /** The run of cards from the top whose places the seat knows
   * (`seat-memory.ts`'s `knownEnds`: scried, put back, a top card in sight). */
  readonly known: ReadonlySet<ObjectId>;
  /** Each card then in the library, with its `zoneChangeCount`: a card whose
   * count has moved since left the library in a line we played (drawn and
   * put back, found by a tutor) and is known where it lies now. */
  readonly stints: ReadonlyMap<ObjectId, number>;
  /** The event sequence number as the decision began: a `library-shuffled`
   * of this library after it means every remembered place is gone. */
  readonly since: number;
  /** The quality (`hand-worth.ts`) of an average card of the rest of the
   * library as the decision began — what a draw the seat can't name is
   * worth — read in `state` (whose hand says what a land is worth: the next
   * land drop, or one behind a land in hand) with `lands` lands in play and
   * `landsWanted` wanted. Kept per reading. */
  readonly average: (state: GameState, lands: number, landsWanted: number) => number;
}

/** The decision under way's {@link LibraryTop}, if any. */
let libraryTop: LibraryTop | null = null;

/**
 * Run `decide` — one of the bot's own decisions — with `context` read by the
 * `libraryTop` feature. Module state, like {@link withTrackRecordEvidence},
 * and the outermost call wins.
 */
export function withLibraryTop<T>(context: LibraryTop | null, decide: () => T): T {
  if (libraryTop !== null || context === null) return decide();
  libraryTop = context;
  try {
    return decide();
  } finally {
    libraryTop = null;
  }
}

/** How much each of the top cards counts, from the top: the next draw is
 * next turn's card (or this turn's, past which it is in the hand), the ones
 * under it later and less surely. */
const LIBRARY_TOP_SHARE = [0.75, 0.5, 0.25] as const;

/**
 * How far a known top card's quality must be from the average draw before
 * it counts, and is counted only past: closer than this, `hand-worth.ts`
 * can't tell them apart. It reads a creature with an ability as exactly
 * average whatever the ability, and a land as 1.25 while the hand holds none
 * and the board wants more, which lifts the average of a library of lands
 * and spells over 1. Without it a scry bottomed Multani, Yavimaya's Avatar
 * and Archmage Emeritus with six lands in play for a chance at a seventh
 * (`bot:diff`, 2026-11-24).
 */
const LIBRARY_TOP_MARGIN = 0.2;

/**
 * The `libraryTop` feature: how far the cards on top of `player`'s library
 * that the seat knows are above or below an average card of the rest of it,
 * in cards, each counted by {@link LIBRARY_TOP_SHARE}. The cards on top were
 * worth nothing to the evaluation: Sylvan Library's free look at two more
 * cards (keep the best, the other two back on top) scored exactly as
 * declining it, a tutor to the top of the library as a card thrown away, and
 * every answer of a scry tied unless the draw came inside the rollout.
 *
 * A card counts when it is one the seat knew of where the decision began,
 * or one that has left the library and come back since (its
 * `zoneChangeCount` moved): put back from the hand, found and put on top.
 * Read from the top, stopping at the first card the seat can't name, which
 * is worth an average card exactly, as is every one under it. A shuffle in
 * the line forgets what was known before it: a remembered card lying under
 * one the seat can't name means the library was shuffled, and only the
 * cards moved since are read.
 *
 * Not every top card, read as the planning state dealt it (tried first,
 * 2026-11-24): a card the seat can't name is a sample there, and one sample
 * a decision made a scry's answer turn on the card dealt under the one
 * looked at, and Sylvan Library's on whether the Forests dealt to the top
 * were wanted.
 */
export function libraryTopWorth(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  lands: number,
  landsWanted: number,
): number {
  const context = libraryTop;
  if (context === null || context.player !== player) return 0;
  const library = state.zones.perPlayer[player]?.library ?? [];
  if (library.length === 0) return 0;
  const moved = (id: ObjectId): boolean => context.stints.get(id) !== (state.objects[id]?.zoneChangeCount ?? 0);
  const remembered = (id: ObjectId): boolean => context.known.has(id) && !moved(id);
  const run = (trustMemory: boolean): number => {
    let n = 0;
    while (n < library.length && (moved(library[n]) || (trustMemory && remembered(library[n])))) n += 1;
    return n;
  };
  // Shuffled in the line, the library's remembered places are gone, though
  // a remembered card may still lie just under the top by chance: Worldly
  // Tutor's "shuffle and put that card on top" left the Grizzly Bears the
  // seat had seen second, the pair read as a known top run (a deal of
  // 2026-11-25, `withHiddenCards`). The test after it catches only a
  // remembered card lying under one the seat can't name.
  const shuffled = state.eventLog.some(
    (event) => event.type === "library-shuffled" && event.player === player && event.seq > context.since,
  );
  let top = run(!shuffled);
  if (library.slice(top).some(remembered)) top = run(false);
  if (top === 0) return 0;
  const average = context.average(state, lands, landsWanted);
  let worth = 0;
  for (let i = 0; i < Math.min(top, LIBRARY_TOP_SHARE.length); i += 1) {
    const off = handCardQuality(state, registry, player, library[i], lands, landsWanted) - average;
    worth += LIBRARY_TOP_SHARE[i] * Math.sign(off) * Math.max(0, Math.abs(off) - LIBRARY_TOP_MARGIN);
  }
  return worth;
}

/**
 * The {@link LibraryTop} of `player`'s library in `state`, the position a
 * decision begins in, given the run of `known` cards from its top.
 */
export function libraryTopOf(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  known: readonly ObjectId[],
): LibraryTop {
  const all = state.zones.perPlayer[player]?.library ?? [];
  const knownSet = new Set(known);
  const stints = new Map(all.map((id) => [id, state.objects[id]?.zoneChangeCount ?? 0] as const));
  const library = all.filter((id) => !knownSet.has(id));
  const isLand = (at: GameState, id: ObjectId): boolean => {
    const object = at.objects[id];
    return object !== undefined && registry.has(object.cardName) && registry.get(object.cardName).types.includes("land");
  };
  const averages = new Map<string, number>();
  return {
    player,
    known: knownSet,
    stints,
    since: state.eventSeq,
    average: (at, lands, landsWanted) => {
      // A card's quality reads the hand only for whether a land is already
      // in it (`hand-worth.ts`'s `landsAhead`), so that is all the key needs.
      const landInHand = (at.zones.perPlayer[player]?.hand ?? []).some((id) => isLand(at, id));
      const key = `${lands}:${landsWanted}:${landInHand}`;
      const seen = averages.get(key);
      if (seen !== undefined) return seen;
      const cards = library.filter((id) => at.objects[id] !== undefined);
      const total = cards.reduce((sum, id) => sum + handCardQuality(at, registry, player, id, lands, landsWanted), 0);
      const average = cards.length === 0 ? 1 : total / cards.length;
      averages.set(key, average);
      return average;
    },
  };
}

/** The most a permanent's track record is credited a round, as for
 * {@link DRAW_RATE_CAP}: one that has drawn a hand in a turn shouldn't
 * outweigh the board. */
const TRACK_RECORD_CAP = 3;

/** The real position a decision is being made in, while a bot is making
 * one — see {@link withTrackRecordEvidence}. */
let evidence: GameState | null = null;

/**
 * Run `decide` with every track record read off `root`, the position the bot
 * is actually deciding in, rather than off whichever position its search is
 * scoring. A rollout that plays into the next turn makes the damage it only
 * simulated a "settled" turn of the tally, and Ob Nixilis, the Fallen's
 * controller turned down its drain because the line where it didn't grow
 * happened to simulate a hit. The outermost call wins: a search nested in a
 * rollout is still judged by the real board, not by the rollout's.
 */
export function withTrackRecordEvidence<T>(root: GameState, decide: () => T): T {
  if (evidence !== null) return decide();
  evidence = root;
  try {
    return decide();
  } finally {
    evidence = null;
  }
}

/**
 * What a permanent has shown it does, a round, past what its printed
 * abilities already say: the cards its controller drew off it beyond
 * {@link drawRate}, and the life it took from opponents (damage, or a drain
 * like Ob Nixilis, the Fallen's) at a card per {@link LIFE_PER_CARD}, over the rounds it has been on the battlefield
 * before this turn (`GameObject.tally`, public, as `settledTally` reads it). The printed rates price an engine from the
 * turn it lands; this is the evidence for one they can't read — a creature
 * wearing the equipment, one that connects every turn, a draw a static
 * grants it. 0 for one that has done neither.
 */
export function trackRecordOf(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  opponents: number,
): number {
  // The record as of the real board while a bot decides (a position its
  // search reached may have played on into later turns), and only turns
  // already over on it: a creature connecting in a combat being weighed
  // mustn't add to the evidence it's weighed by, or its damage would count
  // twice (in the life it costs, and again here). Nothing for one that
  // arrived this turn, or one not there in the real game.
  const real = evidence ?? state;
  const object = real.objects[id];
  if (object === undefined || object.tally === undefined || object.zone !== "battlefield") return 0;
  const now = real.turn.number;
  const turns = now - (object.enteredBattlefieldOnTurn ?? now);
  if (turns <= 0) return 0;
  const tally = settledTally(object, now);
  // Rounds of the table it has been here for, at least one.
  const rounds = Math.max(1, turns / Math.max(1, opponents + 1));
  const name = rulesTextName(object);
  const def = registry.has(name) ? registry.get(name) : undefined;
  const printed = def === undefined ? 0 : drawRate(def, opponents);
  const extraDraws = Math.max(0, tally.cardsDrawn - printed * rounds);
  // Less the drain its text already says it does, which `valueEngines` counts.
  const printedLife = def === undefined ? 0 : drainRate(registry, def, opponents);
  const life = Math.max(0, tally.lifeTaken - printedLife * rounds) / LIFE_PER_CARD;
  // Less than a card's worth isn't a record: one hit for 2 is a creature
  // doing what its power says, and a search that plays on past the turn
  // would otherwise credit the hits it only simulated.
  if (extraDraws + life < 1) return 0;
  return Math.min(TRACK_RECORD_CAP, (extraDraws + life) / rounds);
}

/**
 * How much of an engine a permanent is, in cards a round — its printed draw
 * rate, half its token rate (a token is about half a card, as `tokenEngines`
 * is weighted against `drawEngines`) and its track record — for ranking
 * targets (`bot/eval-bot.ts`'s `aimOffer`). The evaluation weighs the same
 * three with its own weights; this only has to put an engine among the
 * options the search gets to.
 */
export function engineScore(state: GameState, registry: CardRegistry, id: ObjectId): number {
  const object = state.objects[id];
  if (object === undefined || object.zone !== "battlefield") return 0;
  const opponents = state.turnOrder.filter((p) => p !== object.controller && !state.players[p].hasLost).length;
  const name = rulesTextName(object);
  if (!registry.has(name)) return 0;
  const def = registry.get(name);
  return (
    drawRate(def, opponents) +
    tokenRate(registry, def, opponents) / 2 +
    valueRate(registry, def, opponents) +
    trackRecordOf(state, registry, id, opponents)
  );
}

/**
 * One player's raw feature vector.
 *
 * `isMe` gates the terms that are hidden information: `handManaValue` reads
 * the *contents* of a hand, which only its owner may score. (The bot does in
 * fact have access to every hand — see "Known: the bot cheats" in the plan —
 * but scoring an opponent's hand contents would make the evaluation depend on
 * the cheat rather than merely tolerate it.)
 *
 * `landCap` is where lands stop paying full value and spill into
 * `extraLands`; it's a hyperparameter of the encoding, not a coefficient.
 */
export function playerFeatures(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  isMe: boolean,
  landCap: number,
): PlayerFeatures {
  // Pure read over one simulated state — cache the characteristics folds for
  // the scan (a no-op when a caller already holds a region open).
  return withComputedCache(() =>
    playerFeaturesUncached(state, registry, player, isMe, landCap),
  );
}

/**
 * How many of each of our untapped creatures (a token stack's, one by one)
 * would hold off an attack next turn: each can block a creature an opponent
 * could attack us with and kill it or survive it. A 2/2 kept home against
 * 3/3s can only chump, which the crackback check already prices where it
 * matters (lethal), and one kept home against no attacker at all blocks
 * nothing. Counted in full, they made tapping any creature to attack cost
 * `untappedCreatures`, and at three or four players chip damage to one of
 * several opponents scores less than that: v2 never swung a lone 2/2 even at
 * an empty table ("attacks the open player, not one with a blocker").
 *
 * Blockers too small to hold one off alone hold one off together — two 1/1s
 * kill a 2/2 between them — so each attacker takes one gang of them, the
 * fewest that kill it, biggest first. Opponents attack on their own turns,
 * and blocking taps nothing, so the gangs only have to cover the one
 * opponent who takes the most of them. Without the gangs a stack of
 * 1/1s deterred nothing against a table of 2/2s, and a bot sent eight of
 * thirteen past a planeswalker they had already killed instead of keeping
 * them home (reported from a live game, 2026-10-05).
 */
function deterringBlockers(state: GameState, registry: CardRegistry, player: PlayerId): Map<ObjectId, number> {
  const out = new Map<ObjectId, number>();
  const mine = combatCreatures(state, registry, player, true);
  if (mine.length === 0) return out;
  const attackersOf = new Map(
    state.turnOrder
      .filter((q) => q !== player && !state.players[q].hasLost)
      .map((q) => [
        q,
        combatCreatures(state, registry, q, false).filter(
          (a) => a.canAttack && playersAttackableNextTurn(state, registry, a.id).includes(player),
        ),
      ]),
  );
  const attackers = [...attackersOf.values()].flat();
  const deter = (blocker: CombatCreature): void => {
    out.set(blocker.id, (out.get(blocker.id) ?? 0) + 1);
  };
  const small: CombatCreature[] = [];
  for (const blocker of mine) {
    const holds = attackers.some(
      (attacker) =>
        canBlock(blocker, attacker) &&
        (blocker.damage >= attacker.lethal ||
          blocker.keywords.has("deathtouch") ||
          (attacker.damage < blocker.lethal && !attacker.keywords.has("deathtouch"))),
    );
    if (holds) deter(blocker);
    else if (blocker.damage > 0) small.push(blocker);
  }
  small.sort((a, b) => b.damage - a.damage);
  // The gangs `opponent`'s attackers would take, smallest attacker first.
  const gangsAgainst = (opponent: readonly CombatCreature[]): CombatCreature[] => {
    const left = [...small];
    const taken: CombatCreature[] = [];
    for (const attacker of [...opponent].sort((a, b) => a.lethal - b.lethal)) {
      const gang: CombatCreature[] = [];
      let damage = 0;
      for (const blocker of left) {
        if (damage >= attacker.lethal) break;
        if (!canBlock(blocker, attacker)) continue;
        gang.push(blocker);
        damage += blocker.damage;
      }
      if (gang.length < 2 || damage < attacker.lethal) continue;
      for (const blocker of gang) left.splice(left.indexOf(blocker), 1);
      taken.push(...gang);
    }
    return taken;
  };
  let most: CombatCreature[] = [];
  for (const opponent of attackersOf.values()) {
    const taken = gangsAgainst(opponent);
    if (taken.length > most.length) most = taken;
  }
  for (const blocker of most) deter(blocker);
  return out;
}

function playerFeaturesUncached(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  isMe: boolean,
  landCap: number,
): PlayerFeatures {
  const p = state.players[player];
  const zones = state.zones.perPlayer[player];

  let creatures = 0;
  let power = 0;
  let toughness = 0;
  let evasivePower = 0;
  let combatKeywords = 0;
  let untappedCreatures = 0;
  let landCount = 0;
  let untappedMana = 0;
  let otherPermanents = 0;
  let guards = 0;
  let permanentManaValue = 0;
  let loyalty = 0;
  let counters = 0;
  let nonlandMana = 0;
  /** Of `nonlandMana`, the mana of tapped permanents that don't untap by
   * themselves ({@link STUCK_MANA_SHARE}). */
  let stuckMana = 0;
  let drawEngines = 0;
  let tokenEngines = 0;
  let valueEngines = 0;
  let standingEffects = 0;
  /** `standingWorth` of our permanents that double everyone's damage alike:
   * added to `standingEffects` by how far our damage outweighs what comes
   * at us (below), not in full. */
  let symmetricWorth = 0;
  const times = damageTimes(state, registry);
  let trackRecord = 0;
  const opponents = state.turnOrder.filter((p) => p !== player && !state.players[p].hasLost).length;
  let commanderOnBoard = 0;
  let idlePower = 0;
  let smallTokens = 0;
  /** Noncreature tokens by name — see `TOKEN_CAP` — and whether they're
   * one-shot resources (`isResourceToken`). */
  const tokenPiles = new Map<string, { count: number; resource: boolean }>();
  /** Our permanents' "you may play … from your graveyard" in force. */
  const graveyardPlays: GraveyardPlay[] = [];
  // Our own blockers count only where one would hold an attack off.
  const deterring = isMe ? deterringBlockers(state, registry, player) : null;

  for (const id of state.zones.shared.battlefield) {
    const object = state.objects[id];
    if (object === undefined) continue;
    // A creature handed round the table (`handedRound`: Slicer, Alexios) is
    // its owner's, whoever holds it this turn: it comes back, and it never
    // attacks them. Counted as the holder's, a borrowed Alexios was an 11/11
    // of our own, and Stroke of Midnight stayed in hand while it went on to
    // kill us (a kept live game, D75RS-7 turn 23, 2026-11-22).
    if ((handedRound(registry, rulesTextName(object)) ? object.owner : object.controller) !== player) continue;
    // Gone at the next end step (mobilize's Warriors, blitz, unearth, a
    // Lightning Rager, Sneak Attack's creature — `goneAtEndStep`): what
    // it does in a simulated combat shows in life totals, and as a body it's
    // worth nothing past this turn — counted, Zurgo's attack scored +5.5
    // where it's worth about +2 (the Mardu autopsy).
    if (goneAtEndStep(state, registry, object)) continue;
    // One object can stand in for many token copies — see "Token stacking" in
    // docs/architecture/engine.md. A stack of twenty Saprolings is twenty creatures, not one.
    const n = object.stackCount ?? 1;
    const c = computeCharacteristics(state, registry, id);
    const isCreature = c.types.includes("creature");
    const isLand = c.types.includes("land");

    if (isCreature) {
      creatures += n;
      // The damage it would deal in combat, which is its power except under
      // Doran, the Siege Tower and the like — what these two terms measure.
      const damage = combatDamageOf(c);
      power += damage * n;
      // Capped: a wall's toughness past anything on the table that could
      // hit it blocks no better. Uncapped, Tree of Redemption's swap of 40
      // life for a 0/40 scored as a gain (a live capture, 2026-10-04). What
      // the damage that kills it is (`lethalDamageOf`): its toughness, or its
      // power under Zilortha, Strength Incarnate.
      toughness += Math.min(lethalDamageOf(c), TOUGHNESS_CAP) * n;
      if (count(c, EVASION) > 0) evasivePower += damage * n;
      // A 1/1 token: `creatures` prices every body alike, so before this one
      // outweighed two cards and v2 wouldn't Skullclamp it or feed it to
      // Deadly Dispute. Tokens only — a 1/1 card (Sakura-Tribe Elder) usually
      // does something besides.
      if (object.isToken && damage <= 1 && c.toughness <= 1) smallTokens += n;
      combatKeywords += count(c, COMBAT_KEYWORDS) * n;
      if (readyToBlock(state, registry, object) && !c.restrictions.has("cant-block")) {
        untappedCreatures += deterring === null ? n : Math.min(n, deterring.get(id) ?? 0);
      }
      // A creature that can't attack deals none of its power: Pacifism, a
      // defender. `power` counts it all the same — and so, before this, did
      // the bot, which is how it came to pacify its own creatures for free.
      if (
        c.restrictions.has("cant-attack") ||
        (c.keywords.has("defender") && !c.canAttackAsThoughNoDefender)
      ) {
        idlePower += damage * n;
      }
    }
    if (isLand) landCount += n;
    else permanentManaValue += manaValueOf(registry, printedCardName(object)) * n;
    if (!isLand && !isCreature) {
      if (object.isToken) {
        const name = printedCardName(object);
        const pile = tokenPiles.get(name) ?? { count: 0, resource: isResourceToken(registry, name) };
        tokenPiles.set(name, { ...pile, count: pile.count + n });
      } else {
        otherPermanents += n;
      }
    }
    const name = rulesTextName(object);
    if (registry.has(name)) graveyardPlaysInForce(state, registry, object, registry.get(name), graveyardPlays);
    if (!isLand && registry.has(name)) {
      const def = registry.get(name);
      if (!isCreature && guardsAnother(state, registry, id, def, player)) guards += n;
      const made = manaPerTurnOf(state, registry, id, def);
      nonlandMana += (made + reductionPerTurn(def)) * n;
      if (object.tapped && made > 0 && staysTapped(def)) stuckMana += made * n;
      drawEngines += drawRate(def, opponents) * n;
      tokenEngines += tokenRate(registry, def, opponents) * n;
      valueEngines += valueRate(registry, def, opponents) * n;
      if (!isCreature && !object.isToken) {
        const worth = standingWorth(registry, def, opponents) * n;
        if (multipliesEveryonesDamage(def)) symmetricWorth += worth;
        else standingEffects += worth;
      }
    }
    trackRecord += trackRecordOf(state, registry, id, opponents);
    if (object.isCommander && object.owner === player) commanderOnBoard += 1;
    if (!object.tapped && hasTapManaAbility(registry, object)) untappedMana += n;
    if (c.types.includes("planeswalker")) loyalty += (object.counters.loyalty ?? 0) * n;
    for (const [kind, amount] of Object.entries(object.counters)) {
      // A P/T counter of any size (Wall of Roots' -0/-1) is in the P/T already.
      if (UNSCORED_COUNTERS.has(kind) || PT_COUNTER.test(kind)) continue;
      const counted =
        kind === "charge" && registry.has(name) ? Math.min(amount, chargeCap(registry.get(name))) : amount;
      counters += counted * n;
    }
  }

  // Subtracted: the combat damage opponents' creatures could turn on us —
  // each counted in full when its controller attacked us within the last
  // round (`PlayerState.lastAttackedBy`), else split across the players it
  // could attack. A search scores a move at the end of the turn, when nothing
  // is attacking any more, so the attack a trailing player just made at us was
  // invisible: v2 killed the leader's Craw Wurm and took six from the one
  // swinging at it ("kills the creature attacking it, not the leader's").
  let threat = 0;
  if (isMe) {
    let incoming = 0;
    /** `incoming` at its printed size, no multiplier counted. */
    let plainIncoming = 0;
    /** What each creature costs its controller to attack us, and under one,
     * the creatures that could, by controller. */
    const tax = attackTaxAt(state, registry, player);
    const taxed = new Map<
      PlayerId,
      { readonly each: number; readonly over: number; readonly scale: number; readonly count: number }[]
    >();
    const living = state.turnOrder.filter((q) => !state.players[q].hasLost);
    const attackedBy = p.lastAttackedBy ?? {};
    const lostThisTurn = journalTotal(state, "life-lost", p.id, "amount");
    for (const id of state.zones.shared.battlefield) {
      const object = state.objects[id];
      if (object === undefined) continue;
      // Handed round the table, it is a threat to everyone but its owner,
      // under whoever holds it (below).
      const roams = handedRound(registry, rulesTextName(object));
      const side = roams ? object.owner : object.controller;
      if (side === player) continue;
      if (state.players[object.controller]?.hasLost !== false || state.players[side]?.hasLost !== false) continue;
      const c = computeCharacteristics(state, registry, id);
      if (!c.types.includes("creature")) continue;
      // Who it could attack next turn, by the attack rules themselves: none
      // of it is a threat to us under our Vow of Duty, goaded by us with
      // someone else to hit, or pacified (v2 stopped casting Vow of Duty on
      // an opponent's creature, whose +2/+2 read as more threat).
      const targets = roams ? [] : playersAttackableNextTurn(state, registry, id);
      if (!roams && !targets.includes(player)) continue;
      const last = attackedBy[object.controller];
      const recent = last !== undefined && state.turn.number - last < living.length;
      // A handed-round creature attacks on every other player's turn, at
      // someone who isn't its owner: our share of each of those attacks,
      // added up (four players: a half, a half and a third).
      const share = roams
        ? living
            .filter((holder) => holder !== player)
            .reduce((sum, holder) => {
              const at = living.filter((q) => q !== holder && q !== side).length;
              return at > 0 ? sum + 1 / at : sum;
            }, 0)
        : recent
          ? 1
          : 1 / targets.length;
      // Damage against what's left to lose — our life, or for a commander
      // what's left of its 21, whichever is nearer: a 2/2 isn't a threat to
      // someone at 38 (v2 Fireballed a Cat token over casting Phyrexian
      // Arena), and Anafenza three short of lethal commander damage
      // outweighs a bigger Craw Wurm.
      const commanderLeft = object.isCommander
        ? (COMMANDER_DAMAGE_LETHAL - (p.commanderDamageTaken[id] ?? 0)) / times(object.controller, player)
        : Infinity;
      // What this turn has taken is credited back, as far as the life above
      // `THREAT_LIFE`: at high life the damage a simulated combat deals
      // doesn't also grow the threat of what dealt it — measured after the
      // combat, each point taken at 35 cost about 20×power/life² on top of
      // `life`, and v2 chump-blocked a Craw Wurm with a Soldier token at 35
      // (the Mardu autopsy) — while at 6 going to 1 every creature on the
      // table is still lethal.
      const life = p.life + Math.min(lostThisTurn, Math.max(0, p.life - THREAT_LIFE));
      const scale = Math.min(
        MAX_THREAT_SCALE,
        THREAT_LIFE / Math.max(1, Math.min(life, commanderLeft)),
      );
      // Doubled where a damage multiplier doubles it (`damageTimes`).
      const each = combatDamageOf(c) * share;
      const over = times(object.controller, player);
      const count = object.stackCount ?? 1;
      if (tax > 0) {
        taxed.set(side, [...(taxed.get(side) ?? []), { each, over, scale, count }]);
        continue;
      }
      threat += each * count * over * scale;
      incoming += each * count * over;
      plainIncoming += each * count;
    }
    // Behind an attack tax (Ghostly Prison's {2} a creature) only as many
    // come as their controller can pay for, the hardest hitters first. Read
    // without it, the tax changed nothing the evaluation counts, and a seat
    // facing eight creatures left Ghostly Prison and Windborn Muse in hand
    // for a creature (a kept live game, 2026-11-22).
    for (const [controller, creatures] of taxed) {
      let payable = Math.floor(manaToAttackWith(state, registry, controller) / tax);
      for (const c of creatures.sort((a, b) => b.each * b.over - a.each * a.over)) {
        const count = Math.min(c.count, payable);
        if (count <= 0) break;
        payable -= count;
        threat += c.each * count * c.over * c.scale;
        incoming += c.each * count * c.over;
        plainIncoming += c.each * count;
      }
    }
    // A permanent that doubles everyone's damage is ours to want only as far
    // as we are the one dealing it: whole with nothing coming at us, nothing
    // at an even board or a worse one.
    if (symmetricWorth > 0 && power + plainIncoming > 0) {
      standingEffects += symmetricWorth * Math.max(0, (power - plainIncoming) / (power + plainIncoming));
    }
    // A permanent that pays later is worth less to someone about to be hit:
    // the floor is whole while what could come at us is under a third of our
    // life and gone when it would kill us, so a blocker is cast first then.
    // Without this, at 6 life facing a Craw Wurm v2 cast Smothering Tithe
    // over the 4/4 beside it ("casts the blocker before a tax engine").
    standingEffects *= Math.min(1, Math.max(0, (p.life - incoming) / ((p.life * 2) / 3)));
  }

  // An opponent with protection from us (rule 702.16k: Noble Heritage's
  // "you gain protection from that player") takes no damage from anything we
  // control: that share of our power has nowhere to go, like a creature that
  // can't attack. Nothing priced it, so Teval's bot took Noble Heritage's two
  // counters twice with the player it was about to kill as the price, and
  // lost to her (a live game, 2026-11-21).
  if (opponents > 0 && power > 0 && (state.playerEffects?.length ?? 0) > 0) {
    const shut = state.turnOrder.filter(
      (o) => o !== player && !state.players[o].hasLost && playerProtectedFrom(state, o, player),
    ).length;
    idlePower += (power * shut) / opponents;
  }

  let handManaValue = 0;
  // Counterspells still in hand: what they could answer later, which `hand`
  // prices like any card. v2 countered bob's Arcane Signet with its only
  // Counterspell ("saves Counterspell for a threat"), and every weight that
  // would have held it also stopped the bot casting its rocks and draw spells.
  // Only those the mana left untapped could cast, cheapest first: the deck
  // autopsies (2026-10-02) found counterspells credited in full while the bot
  // tapped out, so tapping out looked free and they rotted in hand (Grave
  // Danger cast two in 53 games and ended 18 holding one).
  let answers = 0;
  // Removal still in hand in the first `EARLY_REMOVAL_ROUNDS` rounds
  // (`isRemoval`): on boards that early, whatever is out is rarely what the
  // removal will be wanted for. The deck autopsies' seed 116: Jeskai Striker
  // spent Swords to Plowshares on a Wall of Reverence on its second turn and
  // had nothing for Lathliss later. Later in the game `hand` prices it like
  // any card, as before.
  const round = roundOf(state);
  const early =
    round <= EARLY_REMOVAL_ROUNDS
      ? 1
      : Math.max(0, (EARLY_REMOVAL_END - round) / (EARLY_REMOVAL_END - EARLY_REMOVAL_ROUNDS));
  let earlyRemoval = 0;
  if (isMe) {
    const answerCosts: number[] = [];
    for (const id of zones.hand) {
      const object = state.objects[id];
      if (object === undefined || !registry.has(object.cardName)) continue;
      const def = registry.get(object.cardName);
      if (!def.types.includes("land")) handManaValue += manaValueOf(registry, def.name);
      if (isAnswer(def)) answerCosts.push(manaValueOf(registry, def.name));
      if (early > 0 && isRemoval(def)) earlyRemoval += early;
    }
    let open = untappedMana;
    for (const cost of answerCosts.sort((x, y) => x - y)) {
      if (cost > open) break;
      open -= cost;
      answers += 1;
    }
    // Scaled by what the opponents still hold: a counterspell is worth
    // keeping for the spells to come, and those are in their hands. At
    // `ANSWER_HAND` cards each it's the reserve it always was; with every
    // hand empty it's nothing, so the bot counters what's in front of it;
    // at full grip, up to twice as much, so a Grizzly Bears goes by.
    answers *= answerHandScale(state, player);
  }

  let graveyardCastable = 0;
  // The cards nothing of their own makes castable: a permanent of ours may
  // (`reachedFromGraveyard`).
  const plain: ObjectId[] = [];
  for (const id of zones.graveyard) {
    const object = state.objects[id];
    if (object === undefined) continue;
    if (castableFromGraveyard(registry, object)) graveyardCastable += 1;
    else if (graveyardPlays.length > 0) plain.push(id);
  }
  if (plain.length > 0) graveyardCastable += reachedFromGraveyard(state, registry, player, graveyardPlays, plain);
  // And a card of ours waiting under a permanent that returns it.
  let exiled = 0;
  for (const id of state.zones.shared.exile) {
    const object = state.objects[id];
    if (object === undefined) continue;
    if (waitsToReturn(state, registry, player, object)) graveyardCastable += 1;
    if (isMe && object.owner === player) exiled += 1;
  }

  const cap = Math.max(0, landCap);
  let extraTokens = 0;
  let resourceTokens = 0;
  for (const { count, resource } of tokenPiles.values()) {
    if (resource) resourceTokens += Math.min(count, TOKEN_CAP);
    else otherPermanents += Math.min(count, TOKEN_CAP);
    extraTokens += Math.min(Math.max(0, count - TOKEN_CAP), EXTRA_TOKEN_CAP);
  }

  return {
    life: p.life,
    lifeDanger: Math.max(0, LIFE_DANGER_AT - p.life),
    // Our own only: our spare life is a resource to spend, but an opponent's
    // is still the clock — discounting theirs too made chip damage at 40
    // worth less, and `bot:diff` showed v2 holding back a dozen attacks.
    lifeSurplus: isMe ? Math.max(0, p.life - LIFE_SURPLUS_ABOVE) : 0,
    trackRecord,
    // How far our own hand is from a hand of average cards (`hand-worth.ts`):
    // a tutor with something to find, a land past the ones we want, a spell
    // still out of reach. Ours only, like `handManaValue`.
    handQuality: isMe
      ? handQualityOf(
          state,
          registry,
          player,
          landCount,
          cap,
          handReadForKeeps ? (def) => worthKeeping(registry, def, opponents) : undefined,
        )
      : 0,
    // The cards on top of our library against an average draw
    // (`libraryTopWorth`). Ours only, and only inside one of our decisions.
    libraryTop: isMe ? libraryTopWorth(state, registry, player, landCount, cap) : 0,
    // The nearest loss that isn't life: the worst commander's damage, or
    // poison on the same scale (10 counters lose as 21 damage does). Folded
    // into one term, so the fitted weight reads poison too without a refit.
    // Squared over 21 — 21 still counts 21, but a hit counts more the nearer
    // it brings the loss: a commander's first 3 points cost 0.4 rather than
    // 3, its last 3 cost 5.6. Linear, the first hit of a 3-power commander
    // was worth chump-blocking with a token at 35 life.
    // Under a damage multiplier (`damageTimes`) what is left of the 21 goes
    // that many times faster: 6 taken with 15 to go is, doubled, 7.5 to go.
    // Read for our own seat only: the same speed-up of our commander's
    // clock on an opponent is real, but counted it paid for the doubler by
    // itself (one hit of Kardur's, doubled, outscored the Slicer that then
    // killed us), and we are the one seat we can't afford to misjudge.
    commanderDamage: commanderDamageCurve(
      Math.max(
        0,
        ...Object.entries(p.commanderDamageTaken).map(([commander, taken]) => {
          const source = isMe ? state.objects[commander as ObjectId] : undefined;
          const over = source === undefined ? 1 : times(source.zone === "battlefield" ? source.controller : source.owner, player);
          return over === 1 ? taken : COMMANDER_DAMAGE_LETHAL - (COMMANDER_DAMAGE_LETHAL - taken) / over;
        }),
        ((p.counters.poison ?? 0) * COMMANDER_DAMAGE_LETHAL) / POISON_LETHAL,
      ),
    ),
    hand: zones.hand.length,
    handManaValue,
    creatures,
    power,
    toughness,
    evasivePower,
    combatKeywords,
    untappedCreatures,
    lands: Math.min(landCount, cap),
    extraLands: Math.max(0, landCount - cap),
    untappedMana,
    otherPermanents,
    guards,
    permanentManaValue,
    loyalty,
    counters,
    // Our own cards in exile count as still there. `library`'s 0.05 a card
    // is the counterweight to `graveyard`'s (a mill at ourselves must not
    // read as a gift); what a short library really costs is `libraryDanger`,
    // which counts the library alone. A card exiled off our own library
    // fills no graveyard, and charged 0.05 each, a dig read as a loss:
    // Demonic Consultation for the best card in a sixty-card library exiles
    // half of it on average, a point and a half against the 0.7 the find was
    // worth, and the search never cast it (2026-11-23). An opponent's is
    // counted as it is: exiling their library is still a mill.
    library: zones.library.length + exiled,
    libraryDanger: Math.max(0, LIBRARY_DANGER_AT - zones.library.length),
    graveyard: zones.graveyard.length,
    graveyardCastable,
    energy: p.energy,
    monarch: state.monarch === player ? 1 : 0,
    initiative: state.initiative === player ? 1 : 0,
    // Only the emblems a player made for themselves: one an opponent gave
    // them (Ob Nixilis Reignited's) punishes them, it's no asset.
    emblems: state.emblems.filter((e) => e.owner === player && (e.createdBy ?? e.owner) === player && e.expires === undefined).length,
    commanderTax: Object.values(p.commanderCastCounts).reduce((a, b) => a + b, 0),
    nonlandMana: nonlandMana - stuckMana * (1 - STUCK_MANA_SHARE),
    drawEngines,
    commanderOnBoard,
    idlePower,
    extraTokens,
    threat,
    answers,
    resourceTokens,
    tokenEngines,
    valueEngines,
    standingEffects,
    earlyRemoval,
    // Mana from rocks and creatures in the opening rounds, on top of
    // `nonlandMana`: a turn-one Sol Ring is worth killing then and much less
    // by turn six (the user's ask, 2026-10-04). A land past one per land drop
    // the player has had is the same acceleration — a turn-two Rampant Growth
    // is the turn-two Arcane Signet — and counted as only rocks and
    // creatures, the bot looted with Roiling Dragonstorm over Rampant Growth
    // on turn two (a live game, 2026-10-12). A natural land drop never
    // counts, so a land-pass turn gains nothing.
    earlyMana: (nonlandMana + Math.max(0, landCount - landDropsHad(state, player))) * earlyManaShare(state),
    smallTokens,
  };
}
