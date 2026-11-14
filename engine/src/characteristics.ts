/**
 * Current (as opposed to printed) characteristics of an object, computed from
 * the continuous-effects layer system (rule 613).
 *
 * Implemented: **layer 1** (copy — every read resolves through
 * `printedCardName`, so a Clone has the copied card's P/T / types / abilities),
 * **layer 3** (text-change — an exchange of text boxes, rule 612.5: its
 * abilities, keywords, statics and CDAs are read off `rulesTextName`, another
 * card's once `GameObject.textFrom` is set; a colour word or basic land
 * type changed for another, `PtModifier.textChange`, rule 612.1 — see
 * `text-change.ts`), **layer
 * 4** (type-change — `PtModifier.addTypes`/`setSubtypes`/`addSubtypes` from a
 * man-land or Turn to Frog, and statics' `addTypes`/`addSubtypes` granted to
 * other permanents; see `layerFour`), **layer 5** (colour-change —
 * `PtModifier.setColors`/`addColors`), **layer 6** (keyword grants, plus
 * `PtModifier.loseAbilities` removing a permanent's own abilities), **layer
 * 7b** (a `"self"` CDA sets base P/T, then a `PtModifier.setPt` from a
 * "becomes a N/N" and a static's `setBasePt`), **layer 7c** (counters, then
 * P/T bonuses + modifiers — rule 613.4c), **layer 7d** (`PtModifier.switchPt`
 * — 613.4d), timestamp-ordered within a layer.
 * NOT yet: a creature-type word's text change. Dependency ordering (rule
 * 613.8) is applied where a real card shows one (layer 4's grants, abilities
 * that lose abilities, keyword-scoped statics); no other layer has a pair. Layer 2
 * (control-change) is modeled in `game.ts` by reassigning
 * `GameObject.controller`, not here.
 */

import type { KeywordAbilityName } from "./characteristics-patch.js";
import type { StaticPt } from "./characteristics-patch.js";
import { isManaAbility, isTriggeredManaAbility } from "./abilities.js";
import type { ActivatedAbility } from "./abilities.js";
import type {
  AffectSpec,
  CardDefinition,
  CardRegistry,
  CardType,
  CombatRule,
  CombatWord,
  ConditionPlayer,
  CountSpec,
  StaticPlayerAggregate,
  CountersPutSpec,
  Keyword,
  LosableKeyword,
  LifeFromStarting,
  StaticAbility,
  StaticCondition,
  Supertype,
  TurnStat,
} from "./cards.js";
import { bestowedDefinition, printedHasAbility } from "./cards/define.js";
import {
  aggregateMatches,
  aggregateOver,
  aggregateValueOf,
  compareNum,
  distinctNameOf,
  liveReferenceObjects,
  manaValueOfObject,
  matchesFilter,
  printedManaCost,
  supertypesOf,
  weightedMatches,
} from "./filter.js";
import type { EffectAmount } from "./effects.js";
import type { AggregateSpec, CardFilter, DamageSourceClause } from "./filter.js";
import { COLORS, colorSymbols, manaValue, parseManaCost } from "./mana.js";
import type { Color, ManaType, SpendAs } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import {
  activePlayerOf,
  attackedYouDuringTheirLastTurn,
  hasCommander,
  isTokenNow,
  manaCostOverride,
  permanentCount,
  printedCardName,
  playerCountersHeld,
  rulesTextName,
  spellCaster,
  speedOf,
  textChangesOf,
} from "./state.js";
import { changeSubtypes } from "./text-change.js";
import type {
  EmblemState,
  GameObject,
  GameState,
  LastKnownInfo,
  PlayerEffect,
  PtModifier,
  SpellGrantThisTurn,
  JournalWhat,
  JournalOrigin,
  ZoneType,
} from "./state.js";
import {
  BASIC_LAND_TYPE_COLORS,
  EVERY_CREATURE_TYPE,
  EVERY_LAND_TYPE,
  hasSubtype,
  isBasicLandType,
  isCreatureType,
  isLandType,
  LANDWALK,
  subtypeFitsTypes,
  subtypeKind,
} from "./subtypes.js";
import { namesOf } from "./card-names.js";
import { CREATURE_TYPES } from "./creature-types.js";
import {
  JOURNAL_VIEWS,
  abilityCountThisTurn,
  combatDamagedByNamed,
  cycledNamedCount,
  entriesThisTurn,
  journalEntries,
  journalTotal,
  type JournalReader,
  type JournalWindow,
} from "./journal.js";
import type { TargetRef } from "./target.js";
import { PHASE_OF_STEP, isMainPhase } from "./turn.js";
import type { Step } from "./turn.js";

/** The steps of a combat phase (rule 506.1). */
const COMBAT_STEPS: ReadonlySet<Step> = new Set<Step>([
  "begin-combat",
  "declare-attackers",
  "declare-blockers",
  "combat-damage",
  "end-combat",
]);

/**
 * Ids whose static `condition` is currently being evaluated. A condition that
 * reads other permanents' *computed* characteristics (`controls` / `metalcraft`)
 * can loop back here — two Kird Apes each ask "does the other satisfy my
 * condition?". Re-entry for a condition already on this stack, for the same
 * id, returns `false` (conservative): the inner call resolves that permanent's
 * non-conditional characteristics (type / subtypes), which is all the outer
 * scan needs. A *different* condition of the same permanent is still asked: a
 * Spacecraft's "as long as this isn't a creature" folds its layer-4 types,
 * which its station band's own condition decides (rules 613.1d, 613.1f). The
 * conditions on one id's stack stop at {@link MAX_CONDITIONS_IN_PROGRESS}, for
 * a condition built afresh at each ask, whose identity never repeats.
 * Transient computation scaffolding — never part of `GameState`.
 */
const conditionInProgress = new Map<ObjectId, StaticCondition[]>();
const MAX_CONDITIONS_IN_PROGRESS = 8;

/**
 * Ids whose characteristic-defining count (`setBasePtFromCount`) is currently
 * being taken. A count whose filter reads computed characteristics ("creatures
 * you control with flying") asks about the CDA's own object, which would fold
 * its characteristics and take the count again. Re-entry for an id on this
 * stack skips the CDA and answers with the printed P/T — conservative, like
 * `conditionInProgress`, and likewise never cached. Transient scaffolding.
 */
const cdaInProgress = new Set<ObjectId>();

/**
 * Ids whose own token stack is being matched against their "each **other**
 * …" count bonus (`grantPtPerCount.excludeSelf` — see `othersInOwnStack`).
 * Matching the source can fold its characteristics, which reads the same
 * bonus; re-entry answers 0 (conservative) and is never cached.
 */
const ownStackInProgress = new Set<ObjectId>();

/**
 * Ids whose layer-4 fold ({@link layerFour}) is in progress. A type-granting
 * static's scope is matched against the types folded so far, never by asking
 * for the target's types again — but its condition, or a filter clause about
 * something attached, can read other permanents, whose own statics may ask
 * about this one. Re-entry for an id on this stack answers with the
 * permanent's own types (printed plus its modifiers, no external grants):
 * conservative, like the guards above, and likewise never cached. This is
 * what keeps two type-granting statics whose scopes read each other's grants
 * (a Kudo beside a Bello) from looping. Transient scaffolding.
 */
const layer4InProgress = new Set<ObjectId>();

/**
 * Ids whose granted abilities ({@link hasManaAbility}, {@link hasAnyAbility})
 * are being looked up. Whether a granting static reaches a permanent can mean
 * matching its scope's filter against that permanent — and a filter can ask
 * this same question about it. Re-entry for an id on this stack answers with
 * the permanent's printed abilities alone: conservative, like the guards
 * above, and likewise never cached. Transient scaffolding.
 */
const grantedAbilitiesInProgress = new Set<ObjectId>();

/**
 * Ids whose statics granted by other statics (`StaticAbility.grantsStatic`)
 * are being looked up. Whether a granting static reaches a permanent can mean
 * matching a filter against it, which folds its characteristics, which reads
 * its granted statics again. Re-entry for an id on this stack answers with
 * none of those: conservative, like the guards above, and likewise never
 * cached. Transient scaffolding.
 */
const staticGrantsInProgress = new Set<ObjectId>();

/**
 * Sources whose count-scaled bonus (`grantPtPerCount`) is counting the
 * battlefield. Counting matches the filter against each permanent, which
 * folds its characteristics — and if one of those carries the same kind of
 * bonus counting back (two Zinnia, Valley's Voice, each +1/+0 for every other
 * creature with base power 1), the fold re-enters this source's count. A
 * re-entered count answers 0: conservative, like the guards above, and
 * likewise never cached. Found by a deck autopsy's crash ("Maximum call stack
 * size exceeded", a copied Zinnia). Transient scaffolding.
 */
const countInProgress = new Set<ObjectId>();

/** Whether a value computed now may be the re-entrancy guards' conservative
 * answer rather than the true one — and so must neither be served from nor
 * stored in the computed cache. */
function guardActive(): boolean {
  return (
    conditionInProgress.size > 0 ||
    cdaInProgress.size > 0 ||
    layer4InProgress.size > 0 ||
    ownStackInProgress.size > 0 ||
    grantedAbilitiesInProgress.size > 0 ||
    staticGrantsInProgress.size > 0 ||
    countInProgress.size > 0 ||
    staticLossesInProgress
  );
}

/**
 * The other tokens in `source`'s own stack that an "each **other** …" count
 * bonus sees. The count skips the source permanent, but a token stack is
 * `stackCount` interchangeable tokens, and the rest of them are "other" to
 * each one — Minn, Wily Illusionist's Illusions, made one at a time, fold
 * into one stack, and each still gets +1/+0 for the others. They match the
 * filter exactly when the source does.
 */
function othersInOwnStack(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  filter: CardFilter,
  you: PlayerId = source.controller,
): number {
  const others = (source.stackCount ?? 1) - 1;
  if (others <= 0 || ownStackInProgress.has(source.id)) return 0;
  ownStackInProgress.add(source.id);
  try {
    return matchesFilter(state, registry, source.id, filter, { you }) ? others : 0;
  } finally {
    ownStackInProgress.delete(source.id);
  }
}

/**
 * A scoped memo for computed values that are pure functions of the current
 * `GameState` — {@link computeCharacteristics} results, the
 * {@link contributingStaticSources} battlefield pre-scan, and (via
 * {@link computedCacheMemo}) `Game`-side derivations like the mana-source
 * list. Purely a performance mechanism: with no region active every read
 * computes fresh, exactly as before.
 *
 * **Soundness contract**: a region ({@link withComputedCache}) may only wrap
 * code that does not change any input these computations read — or that calls
 * {@link invalidateComputedCache} at every point where it does (`Game`'s
 * `moveObject`, `recomputeControl`, `withFace`, …). A region never spans more
 * than one `Game`/state, and nesting reuses the outer region's cache.
 *
 * Values computed *during* a static-condition evaluation are deliberately
 * never cached (and the cache is not consulted): `conditionInProgress`'s
 * re-entrancy guard makes those reads conservative rather than true (see
 * above), and serving or storing them would change observable behaviour.
 *
 * `setComputedCacheCheck(true)` turns every cache hit into a recompute +
 * deep-compare that throws on divergence — the fuzzer runs with it to verify
 * the invalidation contract empirically (`MTG_CACHE_CHECK=1`).
 */
interface ComputedCache {
  chars: Map<ObjectId, Characteristics>;
  layer4: Map<ObjectId, LayerFour>;
  staticSources: readonly ContributingStatic[] | null;
  typeSources: readonly ContributingStatic[] | null;
  abilityGrantSources: readonly ContributingStatic[] | null;
  misc: Map<string, unknown>;
}

let activeCache: ComputedCache | null = null;
/** Bumped by every {@link invalidateComputedCache}, a region open or not:
 * what keys the few memos that must also hold outside a region
 * (`anyLoseAllSource`). */
let mutationEpoch = 0;
/** The one reusable cache box — regions open and close far too often (every
 * `legalActions` / SBA sweep / event) to allocate fresh Maps each time. */
const pooledCache: ComputedCache = {
  chars: new Map(),
  layer4: new Map(),
  staticSources: null,
  typeSources: null,
  abilityGrantSources: null,
  misc: new Map(),
};
let cacheCheck = false;

/** Enable/disable the differential self-check on every cache hit (slow —
 * fuzzing/debugging only). */
export function setComputedCacheCheck(on: boolean): void {
  cacheCheck = on;
}

/** Run `fn` with a computed-value cache active (see {@link ComputedCache} for
 * the soundness contract). Nested calls share the outermost region's cache. */
export function withComputedCache<T>(fn: () => T): T {
  if (activeCache !== null) return fn();
  pooledCache.chars.clear();
  pooledCache.layer4.clear();
  pooledCache.staticSources = null;
  pooledCache.typeSources = null;
  pooledCache.abilityGrantSources = null;
  pooledCache.misc.clear();
  activeCache = pooledCache;
  try {
    return fn();
  } finally {
    activeCache = null;
  }
}

/** Drop everything the active cache holds. Called by every state mutation that
 * can run inside a cache region; a no-op when none is active. */
export function invalidateComputedCache(): void {
  mutationEpoch += 1;
  if (activeCache === null) return;
  activeCache.chars.clear();
  activeCache.layer4.clear();
  activeCache.staticSources = null;
  activeCache.typeSources = null;
  activeCache.abilityGrantSources = null;
  activeCache.misc.clear();
}

/**
 * Move the mutation epoch alone, leaving an active region's cache as it is:
 * the broad safety net for what is kept per mutation *outside* a region
 * ({@link boardScan}, {@link staticAbilityLosses}). A region is cleared as it
 * opens, so a write between regions that calls no
 * {@link invalidateComputedCache} was always covered there; those memos
 * outlive a region, so each effect instruction and each dispatched action
 * ends with this. Inside a region the contract is unchanged: a mutation calls
 * `invalidateComputedCache`.
 */
export function noteStateMutation(): void {
  mutationEpoch += 1;
}

/**
 * Run `fn` with no cache region active, then restore the suspended region
 * *cleared*. For mutation-heavy code whose reads and writes interleave too
 * finely for point invalidation (`Game.moveObject`): inside, every read
 * computes fresh exactly as it did before caching existed; a nested
 * {@link withComputedCache} (an `emit` → `detectTriggers` mid-move) opens its
 * own consistent region.
 */
export function suspendComputedCache<T>(fn: () => T): T {
  const saved = activeCache;
  activeCache = null;
  try {
    return fn();
  } finally {
    activeCache = saved;
    invalidateComputedCache();
  }
}

/** Memoize an arbitrary state-derived value in the active cache region under
 * `key` — used by `Game` for its mana-source list. Computes fresh when no
 * region is active or a condition evaluation is in progress. */
export function computedCacheMemo<T>(key: string, compute: () => T): T {
  if (activeCache === null || guardActive()) return compute();
  if (activeCache.misc.has(key)) return activeCache.misc.get(key) as T;
  const value = compute();
  activeCache.misc.set(key, value);
  return value;
}

/** Options for {@link staticConditionMet}. */
export interface ConditionOptions {
  /**
   * Whether `source` itself counts toward a board-scanning condition
   * (`controls` / `opponent-controls` / `metalcraft`). A *static* ability's
   * condition leaves itself out (default) — the scan would otherwise recurse
   * straight back into the characteristics computation that asked. A
   * triggered ability's intervening-if clause (rule 603.4) is evaluated
   * outside the layer fold and *must* count the source ("When ~ enters, if
   * you control a Dragon …" on a Dragon counts itself), so it passes `true`.
   */
  readonly includeSelf?: boolean;
  /**
   * The source's timestamp when the ability triggered
   * (`GameObject.sourceTimestamp`), for a `source-zone` condition's
   * `sameObject`. Passed only by a triggered ability's resolution check.
   */
  readonly sourceTimestamp?: number;
  /**
   * The chosen targets of the ability resolving, for a `controls`
   * condition's `excludeTarget`. Passed only by a resolution context (a
   * `conditional` effect); a static ability has none.
   */
  readonly targets?: readonly (TargetRef | undefined)[];
  /**
   * The source as it last existed on the battlefield, when the ability
   * asking is about a permanent that has since left (rule 603.10a — a dies
   * trigger's "if it had no +1/+1 counters on it", "if it was equipped").
   * Supplied by a caller that knows which departure it means (see
   * `LastKnownRefs`); without it, a source off the battlefield falls back to
   * its latest snapshot.
   */
  readonly sourceLastKnown?: LastKnownInfo;
  /**
   * Permanents entering the battlefield in the same event as the one asking,
   * and so not there yet for it (rule 614.12): a check land put onto the
   * battlefield together with three Islands (Scapeshift, a mass reanimation)
   * doesn't see them — the Mystic Sanctuary and check-land rulings. The
   * board-scanning conditions skip them.
   */
  readonly notYetHere?: ReadonlySet<ObjectId>;
  /**
   * The condition of a triggered ability or a resolving effect, which the
   * layer fold never re-enters, so it takes no re-entrancy guard
   * (`conditionInProgress`): the source's own statics still apply to what it
   * reads. Historian's Wisdom's "if enchanted permanent is a creature with the
   * greatest power" sees the host with the Aura's +2/+1.
   */
  readonly outsideFold?: boolean;
  /**
   * The object whose event fired the triggered ability asking, for a
   * `controls` condition's `excludeTriggerObject`. Passed by the
   * intervening-if checks, as it triggers and as it resolves.
   */
  readonly triggerObject?: ObjectId;
  /**
   * Reads an amount as the ability asking does, for an `amounts` condition.
   * Passed by the intervening-if checks and a resolving `conditional`; a static
   * ability has none.
   */
  readonly amounts?: (amount: EffectAmount) => number;
  /**
   * Which stint on the stack of `triggerObject` — a spell whose casting fired
   * the ability — it means (`LastKnownRefs.triggerSpell`), for a
   * `trigger-spell-first` condition asked as it resolves. As it triggers, the
   * spell is on the stack, and its stint is the one there.
   */
  readonly triggerSpellStint?: number;
  /**
   * Which ability of which object is asking, as the per-turn records key it
   * (`ResolutionContext.abilityKey`) — for a `this-ability-did-this-turn`
   * condition. Passed by the intervening-if checks and a resolving
   * `conditional`.
   */
  readonly abilityKey?: string;
  /**
   * The X the triggered ability asking was put on the stack with — a
   * permanent's own enters trigger's (rule 107.3m) or a cast trigger's — for
   * an `x` condition: ravenous's "if X is 5 or more" (rule 702.156a). Passed
   * by the intervening-if checks only.
   */
  readonly x?: number;
  /**
   * "That player" — the player the trigger or effect asking is about (the
   * defending player of an attack trigger, the player a `for-each-player`
   * is on), for an `of-player` or `player-compare` naming `"that-player"`.
   * Passed by the intervening-if checks (from the trigger's refs) and by a
   * resolution; a static ability has none, and reads such a condition false.
   */
  readonly thatPlayer?: PlayerId;
  /**
   * The player a condition is read as — its "you" — in place of the
   * source's controller. Set only by `of-player` as it reads its inner
   * condition.
   */
  readonly asPlayer?: PlayerId;
}

/** Whether `life` is within a `life-total` condition's bounds, the
 * starting-life ones (rule 103.4) read off the game's rules. */
export function lifeWithinBounds(
  state: GameState,
  life: number,
  condition: Extract<StaticCondition, { kind: "life-total" }>,
): boolean {
  const start = state.rules.startingLife;
  const bound = (b: number | "half-starting" | LifeFromStarting | undefined): number | undefined =>
    b === undefined || typeof b === "number" ? b : b === "half-starting" ? Math.floor(start / 2) : start + b.startingPlus;
  const atLeast = bound(condition.atLeast);
  const atMost = bound(condition.atMost);
  return (atLeast === undefined || life >= atLeast) && (atMost === undefined || life <= atMost);
}

/** The one player a `ConditionPlayer` names as `opts` see it, or
 * `undefined` for nobody — no "that player" known, an empty or non-player
 * target slot, or a player who has left the game (unless `evenIfGone`: a
 * read of what happened to them — Ramses, Assassin Lord's "if they were
 * attacked this turn", asked as they lose the game). */
export function conditionPlayerOf(
  state: GameState,
  who: ConditionPlayer,
  opts: Pick<ConditionOptions, "thatPlayer" | "targets">,
  source?: GameObject,
  evenIfGone = false,
): PlayerId | undefined {
  let player: PlayerId | undefined;
  if (who === "that-player") player = opts.thatPlayer;
  else if (who === "host-controller") {
    const host = source?.zone === "battlefield" ? source.attachedTo : null;
    player = host === null || host === undefined ? undefined : state.objects[host]?.controller;
  } else if (who === "active-player") player = state.turnOrder[state.turn.activePlayerIndex];
  else if (who === "defending-player") {
    // Rule 802.2a: the player the source attacks, or who defends what it
    // attacks (`combat/eligibility.ts`'s `defendingPlayerOf`, not imported:
    // that module reads conditions from here).
    const at = source?.zone === "battlefield" ? source.attacking : null;
    if (at !== null && at !== undefined) {
      const attacked = state.objects[at as ObjectId];
      player = attacked === undefined ? (at as PlayerId) : (attacked.protector ?? attacked.controller);
    }
  }
  else if ("target" in who) {
    const ref = opts.targets?.[who.target];
    player = ref?.kind === "player" ? ref.player : undefined;
  } else {
    const ref = typeof who.controllerOf === "number" ? opts.targets?.[who.controllerOf] : undefined;
    player =
      ref?.kind === "player" ? ref.player : ref?.kind === "object" ? state.objects[ref.object]?.controller : undefined;
  }
  const seat = player === undefined ? undefined : state.players[player];
  return seat !== undefined && (evenIfGone || seat.hasLost === false) ? player : undefined;
}

/**
 * Objects a devotion count leaves out although they are in the battlefield
 * list: a permanent entering, and whatever enters with it, while the
 * replacements that apply as it enters are judged (rule 614.12 — "because
 * replacement effects are considered before the God is on the battlefield,
 * the mana symbols in its mana cost won't be counted", the Theros Gods'
 * ruling). Set only by {@link withDevotionUnseen}. Transient scaffolding.
 */
let devotionUnseen: ReadonlySet<ObjectId> | null = null;

/**
 * Run `fn` with `unseen` left out of every devotion count (see
 * {@link devotionUnseen}). The computed cache is dropped on the way in and
 * out, since types and P/T read through devotion differ inside.
 */
export function withDevotionUnseen<T>(unseen: ReadonlySet<ObjectId>, fn: () => T): T {
  const outer = devotionUnseen;
  devotionUnseen = unseen;
  invalidateComputedCache();
  try {
    return fn();
  } finally {
    devotionUnseen = outer;
    invalidateComputedCache();
  }
}

/**
 * A player's devotion to `colors` (rule 700.5): the mana symbols among the
 * mana costs of permanents they control that are any of those colours, each
 * symbol once — "devotion to white and black" counts a `{W/B}` once, a `{W}`
 * and a `{B}` once each. A hybrid or Phyrexian symbol counts for each of its
 * colours; generic, `{C}`, `{S}` and `{X}` for none.
 *
 * Read after copy, control and text-changing effects and before any other
 * (700.5a): each permanent's mana cost as copy effects leave it — a
 * prototype's (718.3b), none for an embalmed token, none for a transformed
 * back face — its current controller, and the `devotionBonus` of the statics
 * its text has (Altar of the Pantheon), whatever later layers do. A token
 * stack counts once per token.
 */
export function devotionOf(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  colors: readonly Color[],
): number {
  let total = 0;
  for (const id of state.zones.shared.battlefield) {
    const object = state.objects[id];
    if (object === undefined || object.controller !== player || devotionUnseen?.has(id) === true) continue;
    const copies = object.stackCount ?? 1;
    for (const ability of registry.get(rulesTextName(object)).static) {
      if (ability.devotionBonus !== undefined) total += ability.devotionBonus * copies;
    }
    // The face that's up: a transformed back face has no mana cost.
    const override = manaCostOverride(object);
    const manaCost = override !== undefined ? override : registry.get(printedCardName(object)).manaCost;
    if (manaCost === null) continue;
    total += colorSymbols(parseManaCost(manaCost), colors) * copies;
  }
  return total;
}

/**
 * Whether a {@link StaticCondition} is currently met, evaluated from the
 * perspective of `source`'s controller. A static / trigger with no condition
 * is always "met" — callers check that first.
 *
 * By default the battlefield scan skips `source` itself (see
 * {@link ConditionOptions.includeSelf}), and a re-entrant call for the same id
 * and condition short-circuits to `false` (see `conditionInProgress`). Full dependency
 * ordering between mutually-conditional permanents is not modeled (the same
 * gap noted for layers generally).
 * ROADMAP Phase 11 EG-3; extended to triggered abilities in needed-cards P7.
 */
export function staticConditionMet(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  condition: StaticCondition,
  opts: ConditionOptions = {},
): boolean {
  if (opts.outsideFold === true) return evalStaticCondition(state, registry, source, condition, opts);
  let asking = conditionInProgress.get(source.id);
  if (asking !== undefined && (asking.includes(condition) || asking.length >= MAX_CONDITIONS_IN_PROGRESS)) return false;
  if (asking === undefined) conditionInProgress.set(source.id, (asking = []));
  asking.push(condition);
  try {
    return evalStaticCondition(state, registry, source, condition, opts);
  } finally {
    asking.pop();
    if (asking.length === 0) conditionInProgress.delete(source.id);
  }
}

/**
 * A `most-common-color` condition (see its doc in `define.ts`). Colors are
 * read at layer 5 (`effectiveColors`), so a static in layer 7 asks without
 * folding anyone's power and toughness; the source counts itself.
 */
function mostCommonColorHolds(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  condition: Extract<StaticCondition, { kind: "most-common-color" }>,
  opts: ConditionOptions,
): boolean {
  const among = condition.among;
  const counts = new Map<Color, number>();
  for (const id of state.zones.shared.battlefield) {
    const object = state.objects[id];
    if (object === undefined || opts.notYetHere?.has(id) === true) continue;
    if (among?.nontoken === true && object.isToken === true) continue;
    if (among?.chosenPlayer === true && object.controller !== source.chosenPlayer) continue;
    const weight = object.stackCount ?? 1;
    for (const color of effectiveColors(state, registry, object)) {
      counts.set(color, (counts.get(color) ?? 0) + weight);
    }
  }
  const most = Math.max(0, ...counts.values());
  if (most === 0) return false;
  const tied = [...counts.values()].filter((n) => n === most).length > 1;
  if (condition.untied === true && tied) return false;
  const isMostCommon = (color: Color): boolean => counts.get(color) === most;
  if (condition.sharedBy !== undefined) {
    const ref = condition.sharedBy;
    let id: ObjectId | undefined;
    if (ref === "attached") {
      id = source.attachedTo ?? undefined;
    } else {
      const target = opts.targets?.[ref.target];
      if (target?.kind === "object") id = target.object;
    }
    const object = id === undefined ? undefined : state.objects[id];
    return object !== undefined && [...effectiveColors(state, registry, object)].some(isMostCommon);
  }
  const color = condition.color === "chosen" ? source.chosenOnEnter : condition.color;
  return typeof color === "string" && (COLORS as readonly string[]).includes(color) && isMostCommon(color as Color);
}

function evalStaticCondition(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  condition: StaticCondition,
  opts: ConditionOptions,
): boolean {
  const you = opts.asPlayer ?? source.controller;
  const skipsSelf = (id: ObjectId): boolean =>
    opts.includeSelf !== true && id === source.id;
  const notYetHere = (id: ObjectId): boolean => opts.notYetHere?.has(id) === true;
  // Counts are of permanents, not objects (`permanentCount`). The source is
  // skipped *before* its filter is asked, never matched and subtracted:
  // asking whether the source matches can mean folding its characteristics,
  // which evaluates this very condition again.
  const matchesWhere = (
    keep: (id: ObjectId) => boolean,
    except: readonly ObjectId[] = [],
    countSelf = false,
  ) =>
    weightedMatches(
      state,
      state.zones.shared.battlefield,
      (id) => !notYetHere(id) && (countSelf || !skipsSelf(id)) && keep(id),
      except,
    );
  const countWhere = (
    keep: (id: ObjectId) => boolean,
    except: readonly ObjectId[] = [],
    countSelf = false,
  ): number => matchesWhere(keep, except, countSelf).reduce((n, m) => n + m.weight, 0);
  // `countWhere(...) >= atLeast`, stopping at the permanent that reaches it:
  // "as long as you control your commander" needn't read past the commander
  // (Tyrant's Familiar, asked on every event).
  const reaches = (
    atLeast: number,
    keep: (id: ObjectId) => boolean,
    except: readonly ObjectId[] = [],
    countSelf = false,
  ): boolean => {
    if (atLeast <= 0) return true;
    let n = 0;
    for (const id of state.zones.shared.battlefield) {
      const object = state.objects[id];
      if (object === undefined || notYetHere(id) || !(countSelf || !skipsSelf(id)) || !keep(id)) continue;
      n += (object.stackCount ?? 1) - (except.includes(id) ? 1 : 0);
      if (n >= atLeast) return true;
    }
    return false;
  };
  switch (condition.kind) {
    case "most-common-color":
      return mostCommonColorHolds(state, registry, source, condition, opts);
    case "your-turn":
      return state.turnOrder[state.turn.activePlayerIndex] === you;
    case "turns-taken":
      return (state.players[you]?.turnsTaken ?? 0) <= condition.atMost;
    case "extra-turn":
      return state.turn.isExtra;
    case "enduring-story":
      return state.players[you]?.enduringStory === true;
    case "citys-blessing":
      return state.players[you]?.citysBlessing === true;
    case "committed-crime-this-turn":
      return journalTotal(state, "crime", you, "count") > 0;
    case "cast-this-turn": {
      const who = condition.who ?? "you";
      let n = 0;
      for (const p of state.turnOrder) {
        if (who === "you" ? p !== you : who === "opponent" ? p === you : false) continue;
        for (const { id, spell } of state.players[p]?.spellsCastThisTurnAs ?? []) {
          const filter = condition.filter;
          if (filter === undefined || matchesFilter(state, registry, id, filter, { you, snapshot: spell })) n += 1;
        }
      }
      return n >= (condition.atLeast ?? 1) && (condition.atMost === undefined || n <= condition.atMost);
    }
    case "this-ability-did-this-turn": {
      // Recorded as it did it (the journal's `done` entries).
      const key = opts.abilityKey;
      return key !== undefined && abilityCountThisTurn(state, "done", key) > 0;
    }
    case "trigger-spell-first": {
      // Its own record — which cast of that card, by its stint on the stack —
      // and every spell its caster cast before it this turn, each as it was
      // cast.
      const id = opts.triggerObject;
      if (id === undefined) return false;
      const spell = state.objects[id];
      const stint =
        opts.triggerSpellStint ?? (spell?.zone === "stack" ? (spell.zoneChangeCount ?? 0) : undefined);
      if (stint === undefined) return false;
      for (const p of state.turnOrder) {
        const records = state.players[p]?.spellsCastThisTurnAs ?? [];
        const at = records.findIndex((r) => r.id === id && r.spell.zoneChangeCount === stint);
        if (at < 0) continue;
        const matches = (r: (typeof records)[number], filter: CardFilter): boolean =>
          matchesFilter(state, registry, r.id, filter, { you, snapshot: r.spell });
        return condition.anyOf.some(
          ({ filter, otherThanSource }) =>
            matches(records[at], filter) &&
            !records
              .slice(0, at)
              .some((r) => !(otherThanSource === true && r.id === source.id) && matches(r, filter)),
        );
      }
      return false;
    }
    case "increment": {
      const id = opts.triggerObject;
      if (id === undefined || source.zone !== "battlefield") return false;
      if (opts.sourceTimestamp !== undefined && source.timestamp !== opts.sourceTimestamp) return false;
      const spell = state.objects[id];
      if (spell === undefined) return false;
      const stint = opts.triggerSpellStint;
      const onStack = spell.zone === "stack" && (stint === undefined || (spell.zoneChangeCount ?? 0) === stint);
      const spent = (onStack ? spell.manaSpent : spell.lastStackManaSpent)?.length ?? 0;
      const self = computeCharacteristics(state, registry, source.id);
      return self.types.includes("creature") && (spent > self.power || spent > self.toughness);
    }
    case "monarch":
      return condition.who === "you"
        ? state.monarch === you
        : condition.who === "nobody"
          ? state.monarch === null
          : state.monarch !== null && state.monarch !== you;
    case "starting-deck-size":
      return (state.players[you]?.startingDeckSize ?? 0) >= condition.atLeast;
    case "spells-cast-last-turn": {
      const last = state.spellsCastLastTurn ?? { total: 0, mostByOnePlayer: 0 };
      if (condition.none === true && last.total !== 0) return false;
      if (condition.byOnePlayerAtLeast !== undefined && last.mostByOnePlayer < condition.byOnePlayerAtLeast) return false;
      return true;
    }
    case "initiative": {
      const holder = state.initiative ?? null;
      return condition.who === "you" ? holder === you : holder !== null && holder !== you;
    }
    case "completed-dungeon": {
      const done = state.players[you]?.completedDungeons ?? [];
      return condition.name === undefined ? done.length > 0 : done.includes(condition.name);
    }
    case "impending":
      // Rule 702.176a: cast for its impending cost, and a time counter on it.
      return source.castVia === "impending" && (source.counters.time ?? 0) > 0;
    case "devotion": {
      // The source's own mana cost counts (the Gods' rulings), so this reads
      // the battlefield itself rather than through `skipsSelf`.
      const n = devotionOf(state, registry, you, condition.colors);
      return (
        (condition.atLeast === undefined || n >= condition.atLeast) &&
        (condition.atMost === undefined || n <= condition.atMost)
      );
    }
    case "speed": {
      // "That player" is known only to a resolution, as for player-counters.
      if (condition.who === "that-player") return false;
      return speedWithin(speedOf(state, you), condition);
    }
    case "player-counters": {
      const has = (p: PlayerId): boolean => playerCountersHeld(state, p, condition.counter) >= condition.atLeast;
      // "That player" is known only to a trigger or a resolution
      // (`thatPlayer`); a static has nobody it's about.
      if (condition.who === "that-player") {
        // `asTheyLeave`: the player losing the game, read as they lose it.
        const that = condition.asTheyLeave === true ? opts.thatPlayer : conditionPlayerOf(state, "that-player", opts);
        return that !== undefined && has(that);
      }
      return condition.who === "you"
        ? has(you)
        : state.turnOrder.some((p) => p !== you && state.players[p]?.hasLost !== true && has(p));
    }
    case "life-total": {
      const within = (p: PlayerId): boolean => lifeWithinBounds(state, state.players[p]?.life ?? 0, condition);
      if (condition.who === undefined || condition.who === "you") return within(you);
      if (condition.who === "that-player") {
        const that = conditionPlayerOf(state, "that-player", opts);
        return that !== undefined && within(that);
      }
      const opponents = state.turnOrder.filter((p) => p !== you && state.players[p]?.hasLost !== true);
      return condition.who === "opponent" ? opponents.some(within) : opponents.length > 0 && opponents.every(within);
    }
    case "cards-in-exile": {
      let n = 0;
      for (const id of state.zones.shared.exile) {
        const card = state.objects[id];
        // A "card" (rule 108.2): not a token, nor a copy of a card — a
        // prepared spell's copy waiting in exile (`becomePrepared`).
        if (card === undefined || card.isToken || card.isCopy === true) continue;
        if (condition.filter !== undefined && !matchesFilter(state, registry, id, condition.filter, { you })) continue;
        n += 1;
      }
      return n >= condition.atLeast;
    }
    case "hand-size": {
      const inBounds = (n: number): boolean =>
        (condition.atMost === undefined || n <= condition.atMost) &&
        (condition.atLeast === undefined || n >= condition.atLeast);
      // "If you have no **land** cards in hand" (Land Grant): only the
      // cards matching `filter` count.
      const handCount = (p: PlayerId): number => {
        const cards = state.zones.perPlayer[p]?.hand ?? [];
        const filter = condition.filter;
        return filter === undefined ? cards.length : cards.filter((id) => matchesFilter(state, registry, id, filter, { you: p })).length;
      };
      if (condition.who === "each-player") {
        return state.turnOrder.filter((p) => state.players[p]?.hasLost !== true).every((p) => inBounds(handCount(p)));
      }
      return inBounds(handCount(you));
    }
    case "spells-cast-this-game":
      return (state.players[you]?.spellNamesCastThisGame?.[condition.named] ?? 0) >= condition.atLeast;
    case "combat-damaged-this-game":
      return combatDamagedByNamed(state, you, condition.byCreatureNamed);
    case "cycled-this-game":
      return cycledNamedCount(state, you, condition.named) >= condition.atLeast;
    case "library-size": {
      const inBounds = (n: number): boolean =>
        (condition.atMost === undefined || n <= condition.atMost) &&
        (condition.atLeast === undefined || n >= condition.atLeast) &&
        (condition.compare === undefined || compareNum(n, condition.compare));
      const seats =
        condition.who === "you" ? [you] : state.turnOrder.filter((p) => state.players[p]?.hasLost !== true);
      return seats.some((p) => inBounds(state.zones.perPlayer[p]?.library.length ?? 0));
    }
    case "threshold":
      return state.zones.perPlayer[you].graveyard.length >= 7;
    case "day-night":
      return state.dayNight === condition.is;
    case "coven": {
      const powers = new Set<number>();
      for (const id of state.zones.shared.battlefield) {
        const object = state.objects[id];
        if (object === undefined || object.controller !== you) continue;
        const chars = computeCharacteristics(state, registry, id);
        if (!chars.types.includes("creature")) continue;
        powers.add(chars.power);
        if (powers.size >= 3) return true;
      }
      return false;
    }
    case "cards-in-graveyard": {
      const countIn = (player: PlayerId): number => {
        let n = 0;
        for (const id of state.zones.perPlayer[player]?.graveyard ?? []) {
          if (state.objects[id] === undefined) continue;
          if (condition.excludeSelf === true && id === source.id) continue;
          if (condition.filter !== undefined && !matchesFilter(state, registry, id, condition.filter, { you, source: source.id })) continue;
          n += 1;
        }
        return n;
      };
      if (condition.whose !== undefined) {
        // A player who has left the game took their graveyard with them (800.4a).
        return state.turnOrder.some(
          (p) =>
            (condition.whose === "any-player" || p !== you) &&
            state.players[p]?.hasLost !== true &&
            countIn(p) >= condition.atLeast,
        );
      }
      return countIn(you) >= condition.atLeast;
    }
    case "delirium": {
      // Distinct card *types*, not cards — one artifact creature is two of
      // the four. Printed types: layer effects don't reach a graveyard.
      const types = new Set<string>();
      for (const id of state.zones.perPlayer[you].graveyard) {
        const object = state.objects[id];
        if (object === undefined) continue;
        for (const t of registry.get(printedCardName(object)).types) types.add(t);
      }
      return types.size >= 4;
    }
    case "full-party":
      // Rule 700.8c: a party of four.
      return partySizeOf(state, registry, you) === 4;
    case "players-lost":
      return state.turnOrder.filter((player) => state.players[player].hasLost === true).length >= condition.atLeast;
    case "metalcraft":
      // "You control three or more artifacts" counts the source itself when
      // it's one (Chrome Steed, Rusted Relic): a static's scan puts it back,
      // as a `controls` condition's `countsSelf` does.
      return reaches(
        3,
        (id) => {
          const o = state.objects[id];
          return o.controller === you && effectiveTypes(state, registry, o).includes("artifact");
        },
        [],
        true,
      );
    case "controls": {
      // A static ability's scan has already skipped the source whole.
      const except: ObjectId[] = [];
      if (condition.excludeSelf === true && opts.includeSelf === true) except.push(source.id);
      if (condition.excludeHost === true && source.attachedTo !== null && source.attachedTo !== undefined) {
        except.push(source.attachedTo);
      }
      if (condition.excludeTarget !== undefined) {
        const ref = opts.targets?.[condition.excludeTarget];
        if (ref?.kind === "object") except.push(ref.object);
      }
      if (condition.excludeTriggerObject === true && opts.triggerObject !== undefined) {
        except.push(opts.triggerObject);
      }
      if (condition.distinctNames === true) {
        const names = new Set<string>();
        for (const { id } of matchesWhere(
          (id) => state.objects[id].controller === you && matchesFilter(state, registry, id, condition.filter, { you }),
          except,
          condition.countsSelf === true,
        )) {
          // Rule 201.2: a Room's unlocked doors, each a name (Promising Stairs'
          // ruling), a split card's halves; none face down or fully locked.
          for (const name of namesForComparing(registry, state.objects[id])) names.add(name);
        }
        return names.size >= condition.atLeast;
      }
      if (condition.sharingAName === true) {
        // The most of them with any one name (rule 201.2): a permanent with two
        // names is in both groups, one with none in neither.
        const groups = new Map<string, number>();
        for (const { id, weight } of matchesWhere(
          (id) => state.objects[id].controller === you && matchesFilter(state, registry, id, condition.filter, { you }),
          except,
          condition.countsSelf === true,
        )) {
          for (const name of namesForComparing(registry, state.objects[id])) {
            groups.set(name, (groups.get(name) ?? 0) + weight);
          }
        }
        return [...groups.values()].some((n) => n >= condition.atLeast);
      }
      if (condition.sharingACreatureType === true) {
        // The most of them with any one creature type (Graxiplon): each type
        // some of them have, a changeling counting toward every one — and
        // changelings alone sharing any (rule 702.73a).
        const found = matchesWhere(
          (id) => state.objects[id].controller === you && matchesFilter(state, registry, id, condition.filter, { you }),
          except,
          condition.countsSelf === true,
        ).map(({ id, weight }) => ({ subtypes: effectiveSubtypes(state, registry, state.objects[id]), weight }));
        const types = new Set(found.flatMap((f) => f.subtypes.filter(isCreatureType)));
        if (types.size === 0 && found.length > 0) types.add(CREATURE_TYPES[0]);
        return [...types].some(
          (type) => found.reduce((n, f) => n + (hasSubtype(f.subtypes, type) ? f.weight : 0), 0) >= condition.atLeast,
        );
      }
      return reaches(
        condition.atLeast,
        (id) =>
          (condition.anyController === true || state.objects[id].controller === you) &&
          // With the source, for a clause read against it: Sting, the Glinting
          // Dagger's "blocking or blocked by a Goblin" (`blockingRelation`).
          matchesFilter(state, registry, id, condition.filter, { you, source: source.id }),
        except,
        condition.countsSelf === true,
      );
    }
    case "of-player": {
      // The inner condition with that player as its "you" (see `of-player`).
      if (condition.player === "an-opponent") {
        return state.turnOrder.some(
          (p) =>
            p !== you &&
            state.players[p]?.hasLost !== true &&
            evalStaticCondition(state, registry, source, condition.condition, { ...opts, asPlayer: p }),
        );
      }
      if (condition.player === "a-player") {
        return state.turnOrder.some(
          (p) =>
            state.players[p]?.hasLost !== true &&
            evalStaticCondition(state, registry, source, condition.condition, { ...opts, asPlayer: p }),
        );
      }
      const player = conditionPlayerOf(state, condition.player, opts, source);
      return (
        player !== undefined && evalStaticCondition(state, registry, source, condition.condition, { ...opts, asPlayer: player })
      );
    }
    case "player-compare": {
      const { stat } = condition;
      const statOf = (p: PlayerId): number =>
        stat === "life"
          ? (state.players[p]?.life ?? 0)
          : stat === "hand"
            ? (state.zones.perPlayer[p]?.hand.length ?? 0)
            : // The source counts on its controller's side, a static's too
              // (Hooded Horror is one of "the most creatures"): keep the
              // filter to type/subtype/colour clauses, as `countsSelf` does.
              countWhere(
                (id) =>
                  state.objects[id].controller === p &&
                  matchesFilter(state, registry, id, stat.controls, { you: p }),
                [],
                true,
              );
      const mine = statOf(you);
      const holds = (p: PlayerId): boolean => {
        const theirs = statOf(p);
        if (condition.compare === "within") return Math.abs(mine - theirs) <= (condition.by ?? 0);
        return condition.compare === "more" ? mine > theirs : condition.compare === "fewer" ? mine < theirs : mine >= theirs;
      };
      if (condition.than !== "each-opponent" && condition.than !== "an-opponent") {
        const other = conditionPlayerOf(state, condition.than, opts, source);
        return other !== undefined && other !== you && holds(other);
      }
      const others = state.turnOrder.filter((p) => p !== you && state.players[p]?.hasLost !== true);
      return condition.than === "an-opponent" ? others.some(holds) : others.length > 0 && others.every(holds);
    }
    case "aggregate": {
      const { value } = condition;
      const except =
        value.excludeSelf === true && opts.includeSelf === true ? [source.id] : [];
      // The battlefield's half skips what isn't here yet and, unless asked
      // to count it, the source (as every count of a condition does).
      const matches = aggregateMatches(state, registry, value, you, {
        except,
        source: source.id,
        battlefieldMatch: (id, filter) =>
          !notYetHere(id) && (condition.countsSelf === true || !skipsSelf(id)) && matchesFilter(state, registry, id, filter, { you }),
      });
      const total = aggregateOver(state, registry, matches, value);
      return condition.compare === "prime" ? isPrime(total) : compareNum(total, condition.compare);
    }
    case "source-greatest": {
      if (source.zone !== "battlefield") return false;
      const mine = aggregateValueOf(state, registry, source.id, condition.of);
      // The source's own stack-mates are other permanents with its value.
      const others = weightedMatches(
        state,
        state.zones.shared.battlefield,
        (id) =>
          (id !== source.id || (source.stackCount ?? 1) > 1) &&
          matchesFilter(state, registry, id, condition.filter, { you }),
        [source.id],
      );
      return others.every((m) => {
        const theirs = aggregateValueOf(state, registry, m.id, condition.of);
        return condition.strict === true ? mine > theirs : mine >= theirs;
      });
    }
    case "controls-greatest": {
      // "The creature with the greatest power or tied for it": the best of
      // yours is no worse than the best of all of them.
      let best = Number.NEGATIVE_INFINITY;
      let mine = Number.NEGATIVE_INFINITY;
      for (const m of matchesWhere((id) => matchesFilter(state, registry, id, condition.filter, { you }))) {
        const value = aggregateValueOf(state, registry, m.id, condition.of);
        best = Math.max(best, value);
        if (state.objects[m.id].controller === you) mine = Math.max(mine, value);
      }
      return mine !== Number.NEGATIVE_INFINITY && mine >= best;
    }
    case "opponent-controls":
      // "an opponent controls three or more creatures" — one opponent must
      // meet the count on their own, so count per player and take the best.
      return state.turnOrder.some((p) => {
        if (p === you || state.players[p].hasLost) return false;
        const theirs = (id: ObjectId): boolean =>
          state.objects[id].controller === p && matchesFilter(state, registry, id, condition.filter, { you: p });
        if (condition.atMost !== undefined) {
          const n = countWhere(theirs);
          return n >= condition.atLeast && n <= condition.atMost;
        }
        return reaches(condition.atLeast, theirs);
      });
    case "opponent-controls-more": {
      const mine = countWhere(
        (id) =>
          state.objects[id].controller === you &&
          matchesFilter(state, registry, id, condition.filter, { you }),
      );
      return state.turnOrder.some(
        (p) =>
          p !== you &&
          !state.players[p].hasLost &&
          (condition.activePlayerOnly !== true || p === activePlayerOf(state)) &&
          countWhere(
            (id) =>
              state.objects[id].controller === p &&
              matchesFilter(state, registry, id, condition.filter, { you: p }),
          ) > mine,
      );
    }
    case "opponents-control-total":
      return reaches(condition.atLeast, (id) => {
        const controller = state.objects[id].controller;
        return (
          controller !== you &&
          !state.players[controller].hasLost &&
          matchesFilter(state, registry, id, condition.filter, { you: controller })
        );
      });
    case "opponent-count":
      // Counted live: a table that has shrunk to a duel no longer has "two or
      // more opponents", and an eliminated player is not one.
      return (
        state.turnOrder.filter((p) => p !== you && !state.players[p].hasLost).length >=
        condition.atLeast
      );
    case "meld-ready":
      return meldPartners(state, registry, source.id, you, condition.partner) !== null;
    case "source":
      return matchesFilter(state, registry, source.id, condition.filter, {
        you,
        // "Another Aura": `attachments`' `otherThanSource`.
        source: source.id,
        ...(opts.sourceLastKnown !== undefined ? { snapshot: opts.sourceLastKnown } : {}),
      });
    case "source-came-under-control-since-last-upkeep": {
      // Echo (rule 702.30a): under `you`'s control since before the
      // upkeep ahead of this one began — or since the game began.
      if (source.zone !== "battlefield" || source.controller !== you) return false;
      const previous = state.players[you].previousUpkeepSeq;
      return previous === undefined || (source.controlSinceSeq ?? -1) >= previous;
    }
    case "source-zone":
      return (
        condition.zones.includes(source.zone) &&
        (condition.sameObject !== true ||
          opts.sourceTimestamp === undefined ||
          source.timestamp === opts.sourceTimestamp)
      );
    case "chosen-on-enter":
      // Which of its abilities the permanent has (a Siege's, Mirrodin
      // Besieged's), not an "if" of the ability's own. One that has triggered
      // exists independently of its source (rule 113.7a): asked again as it
      // resolves (`sourceTimestamp`, given only then) once the source has
      // left the battlefield, or left and come back as a new object, it holds.
      if (
        opts.sourceTimestamp !== undefined &&
        (source.zone !== "battlefield" || source.timestamp !== opts.sourceTimestamp)
      ) {
        return true;
      }
      // A leaves-the-battlefield trigger of a Siege leaving along with the
      // creatures looks back at it (603.10a): the side it had chosen then,
      // since the move cleared it.
      return (
        (source.zone !== "battlefield" && opts.sourceLastKnown !== undefined
          ? opts.sourceLastKnown.chosenOnEnter
          : source.chosenOnEnter) === condition.value
      );
    case "self-devoured":
      return (source.enteredDevoured ?? opts.sourceLastKnown?.enteredDevoured ?? []).length > 0;
    case "self-spectacle-paid":
      return (
        source.enteredSpectacle === true ||
        source.spectaclePaid === true ||
        opts.sourceLastKnown?.enteredSpectacle === true
      );
    case "tribute-not-paid":
      return source.tributeUnpaid === true || opts.sourceLastKnown?.tributeUnpaid === true;
    case "self-surge-paid":
      return (
        source.enteredSurge === true ||
        source.surgePaid === true ||
        opts.sourceLastKnown?.enteredSurge === true
      );
    case "self-prowl-paid":
      return (
        source.enteredProwl === true ||
        source.prowlPaid === true ||
        opts.sourceLastKnown?.enteredProwl === true
      );
    case "self-alternative-cost-paid":
      return source.alternativeCostPaid === (condition.madness === true ? "madness" : "printed");
    case "prowl": {
      // Rule 702.76a: any of the source's creature types against those
      // recorded as each source dealt its combat damage. `hasSubtype` reads
      // a changeling's marker on either side as every creature type.
      const dealtWith = state.players[you]?.combatDamageCreatureTypesThisTurn ?? [];
      if (dealtWith.length === 0) return false;
      return effectiveSubtypes(state, registry, source).some(
        (s) => (s === EVERY_CREATURE_TYPE || isCreatureType(s)) && hasSubtype(dealtWith, s),
      );
    }
    case "as-cast":
      return (source.asCastFacts?.[condition.fact] ?? 0) > 0;
    // A resolving ability's alone (`makeResolutionContext`'s `conditionMet`).
    case "those-attackers-at-you":
      return false;
    case "self-kicked":
      // Which of two kicker costs (rule 702.33f): the stack's `kickedWith`
      // (cleared as it leaves the stack), or `enteredKickedWith` once it has
      // entered (or as it last existed).
      if (condition.with !== undefined) {
        const mask = source.kickedWith ?? source.enteredKickedWith ?? opts.sourceLastKnown?.enteredKickedWith ?? 0;
        const want = condition.with === "first" ? 1 : condition.with === "second" ? 2 : 3;
        return (mask & want) === want;
      }
      // On the battlefield it's `enteredKicked` (the stack flag is cleared by
      // the move that put the permanent here); `kicked` still answers for a
      // source that is itself on the stack.
      // A source that has left since is asked as it last existed there: the
      // spell was still kicked (Offspring's ruling — the copy is made even if
      // the creature has left).
      return (
        source.enteredKicked === true ||
        source.kicked === true ||
        opts.sourceLastKnown?.enteredKicked === true
      );
    case "creature-died-this-turn":
      return journalCount(state, registry, state.turnOrder, "died", undefined, you) > 0;
    case "created-token-this-turn":
      return journalTotal(state, "token-created", you, "count") > 0;
    case "attacked-with-commander-this-turn":
      return state.players[you]?.attackedWithCommanderOnTurn === state.turn.number;
    case "used-graveyard-this-turn":
      return state.players[you]?.usedGraveyardThisTurn === true;
    case "exiled-with-source": {
      // "If a card is exiled with it" (Redemptor Dreadnought): in exile now,
      // and of the filter's kind, rather than ever (rule 607.2a).
      if (condition.now === true) {
        const cards = liveReferenceObjects(state, registry, "exiled-with-source", { you, source: source.id }) ?? [];
        const { filter } = condition;
        if (condition.cardTypes === true) {
          const types = new Set<string>();
          for (const id of cards) {
            const card = state.objects[id];
            if (card.exiledFaceDown !== undefined || card.foretold === true) continue;
            for (const type of registry.get(printedCardName(card)).types) types.add(type);
          }
          return types.size >= condition.atLeast;
        }
        // A card exiled face down has no characteristics (rule 406.3a): it's of no kind.
        const n = cards.filter(
          (id) =>
            filter === undefined ||
            (state.objects[id].exiledFaceDown === undefined && matchesFilter(state, registry, id, filter, { you })),
        ).length;
        return n >= condition.atLeast;
      }
      const stint = source.zoneChangeCount ?? 0;
      const record = source.exiledWithCount;
      const n = source.zone === "battlefield" && record?.stint === stint ? record.count : 0;
      return n >= condition.atLeast;
    }
    case "not":
      // `evalStaticCondition`, not `staticConditionMet`: the re-entrancy guard
      // keys on `source.id`, and this is still the *same* source — routing
      // back through it would short-circuit to false and make every `not`
      // read true. The guard exists for mutually-conditional permanents, not
      // for a composite condition on one of them.
      return !evalStaticCondition(state, registry, source, condition.of, opts);
    case "all":
      return condition.of.every((each) => evalStaticCondition(state, registry, source, each, opts));
    case "any":
      return condition.of.some((each) => evalStaticCondition(state, registry, source, each, opts));
    case "opponent-lost-life-this-turn":
      return state.turnOrder.some(
        (p) => p !== you && journalTotal(state, "life-lost", p, "amount") > 0,
      );
    case "before-attackers-declared": {
      const combats = state.turn.combatPhases ?? 0;
      return combats === 0 || (combats === 1 && state.turn.step === "begin-combat");
    }
    case "attacked-this-step": {
      const attacked = state.players[you]?.attackedInCombat;
      return (
        state.turn.step === "declare-attackers" &&
        attacked !== undefined &&
        attacked.turn === state.turn.number &&
        attacked.combat === (state.turn.combatPhases ?? 1)
      );
    }
    case "turn-structure": {
      const step = state.turn.step;
      const inCombat = COMBAT_STEPS.has(step);
      if (condition.steps !== undefined && !condition.steps.includes(step)) return false;
      if (condition.duringCombat === true && !inCombat) return false;
      if (condition.afterCombat === true) {
        const combats = state.turn.combatPhases ?? 0;
        if (combats === 0 || (combats === 1 && inCombat)) return false;
      }
      if (
        condition.combatPhase !== undefined &&
        (!inCombat || (state.turn.combatPhases ?? 0) !== condition.combatPhase)
      ) {
        return false;
      }
      if (
        condition.mainPhase !== undefined &&
        (!isMainPhase(step) || (state.turn.mainPhases ?? 0) !== condition.mainPhase)
      ) {
        return false;
      }
      if (condition.endStep !== undefined && (step !== "end" || (state.turn.endSteps ?? 0) !== condition.endStep)) {
        return false;
      }
      return true;
    }
    case "damage-dealt-this-turn": {
      const seats =
        condition.who === undefined || condition.who === "you"
          ? [you]
          : condition.who === "opponent"
            ? state.turnOrder.filter((p) => p !== you)
            : state.turnOrder;
      // "Dealt to it this turn": this permanent in its stint, as it last
      // existed once it has left (a dies trigger's intervening if — 603.10).
      const stint =
        opts.sourceLastKnown?.zoneChangeCount ??
        (source.zone === "battlefield" ? (source.zoneChangeCount ?? 0) : source.lastKnown?.zoneChangeCount);
      return (
        damageDealtThisTurn(
          state,
          seats,
          condition.combat,
          condition.colors,
          condition.toSelf === true ? { to: { kind: "object", object: source.id }, toStint: stint } : {},
        ) >= condition.atLeast
      );
    }
    case "turn-history": {
      const seats =
        condition.who === undefined || condition.who === "you"
          ? [you]
          : condition.who === "opponent"
            ? state.turnOrder.filter((p) => p !== you)
            : state.turnOrder;
      // "… if they were attacked by …": only what was done to that player,
      // who may have left the game since (Ramses, Assassin Lord).
      const toPlayer = condition.against === undefined ? undefined : conditionPlayerOf(state, condition.against, opts, source, true);
      if (condition.against !== undefined && toPlayer === undefined) return false;
      const n = journalCount(
        state,
        registry,
        seats,
        condition.what,
        condition.filter,
        you,
        condition.excludeSelf === true ? { id: source.id, stint: source.zoneChangeCount ?? 0 } : undefined,
        toPlayer !== undefined ? { ...condition, toPlayer } : condition,
        // "If it dealt …": this object, in its stint, as it last existed once gone.
        condition.selfOnly === true
          ? { id: source.id, stint: opts.sourceLastKnown?.zoneChangeCount ?? source.zoneChangeCount ?? 0 }
          : undefined,
      );
      return n >= (condition.atLeast ?? 1);
    }
    case "attacked-you-last-turn": {
      // Each player's own most recent turn: `them` declared a creature attacking
      // you then, not only a planeswalker of yours (`attackedYouDuringTheirLastTurn`).
      if (condition.by !== undefined) {
        const them = conditionPlayerOf(state, condition.by, opts, source);
        return them !== undefined && them !== you && attackedYouDuringTheirLastTurn(state, you, them);
      }
      return state.turnOrder.some(
        (p) => p !== you && state.players[p]?.hasLost !== true && attackedYouDuringTheirLastTurn(state, you, p),
      );
    }
    case "unattacked-opponent": {
      // "Being attacked" is now: a creature attacking that player (rule
      // 506.3), not one of their planeswalkers or battles (Suppressor
      // Skyguard's ruling), asked as it triggers and as it resolves (603.4).
      const them = conditionPlayerOf(state, condition.of, opts, source);
      if (them === undefined) return false;
      const attacked = new Set<string>();
      for (const id of state.zones.shared.battlefield) {
        const at = state.objects[id]?.attacking;
        if (at !== null && at !== undefined) attacked.add(at);
      }
      return state.turnOrder.some(
        (p) =>
          p !== them &&
          (condition.another !== true || p !== you) &&
          state.players[p]?.hasLost !== true &&
          !attacked.has(p),
      );
    }
    case "counters-put-this-turn":
      return countersPutThisTurn(state, condition, you) >= (condition.atLeast ?? 1);
    case "unspent-mana":
      return unspentManaOf(state, you, condition.type) >= condition.atLeast;
    case "ability-mana-spent":
      // Only an effect's condition, which `Game` reads before this.
      return false;
    case "turn-stat": {
      // Per player, never summed: "an opponent lost 4 or more life this
      // turn" is satisfied by one opponent reaching 4, not by two reaching
      // 2 apiece. `any-player` includes `you` (Y'shtola).
      const seats =
        condition.who === "you"
          ? [you]
          : condition.who === "opponent"
            ? state.turnOrder.filter((p) => p !== you)
            : state.turnOrder;
      return seats.some((p) => turnStatOf(state, p, condition.stat) >= condition.atLeast);
    }
    case "ring-tempted":
      return (state.players[you]?.ringTemptations ?? 0) >= condition.atLeast;
    case "class-level": {
      // No level is level 1 (rule 716.2d); a source that has left is asked
      // as it last was on the battlefield.
      const level =
        (source.zone === "battlefield" ? source.classLevel : source.lastKnown?.classLevel) ?? 1;
      return (
        (condition.atLeast === undefined || level >= condition.atLeast) &&
        (condition.exactly === undefined || level === condition.exactly)
      );
    }
    case "solved":
      return source.zone === "battlefield" && source.solved === true;
    case "self-hasnt-dealt-damage":
      return (
        source.zone === "battlefield" &&
        (source.dealtDamage === undefined || (condition.combat === true && !source.dealtDamage.combat))
      );
    case "self-counters": {
      // Last-known information once the source has left the battlefield
      // (603.10) — `moveObject` clears `counters`, so a dies-trigger asking
      // "did it have counters" has only the snapshot to go on.
      const held =
        opts.sourceLastKnown?.counters ??
        (source.zone === "battlefield" ? source.counters : (source.lastKnown?.counters ?? {}));
      const n =
        condition.counter === undefined
          ? Object.values(held).reduce((sum, v) => sum + (v ?? 0), 0)
          : (held[condition.counter] ?? 0);
      if ("parity" in condition) return (n % 2 === 0) === (condition.parity === "even");
      return compareNum(n, condition.compare);
    }
    case "x":
      // An intervening-if's "if X is 5 or more" (ravenous, rule 702.156a):
      // the X a permanent was cast with, which its own enters trigger knows
      // (rule 107.3m) and passes in. Anywhere else there is no X to read.
      return opts.x !== undefined && compareNum(opts.x, condition.compare);
    case "trigger-value":
      // Only a resolving triggered ability knows its trigger's value.
      return false;
    case "trigger-object": {
      // A triggered ability's intervening-if (rule 603.4), asked about the
      // object whose event fired it — passed in as it triggers and as it
      // resolves, read as it last existed if it has left (608.2h). A static
      // ability has none, and this is false there.
      const id = opts.triggerObject;
      if (id === undefined) return false;
      // A spell on the stack (a cast trigger's) is read as it is.
      return matchesFilter(state, registry, id, condition.filter, {
        you,
        source: source.id,
        lastKnown: state.objects[id]?.zone !== "stack",
      });
    }
    case "amounts":
      return (
        opts.amounts !== undefined &&
        compareNum(opts.amounts(condition.left), { op: condition.op, n: opts.amounts(condition.right) })
      );
    case "target":
    case "target-chosen":
    case "object-matches":
    case "resolved-this-turn":
    case "activated-this-turn":
    case "this-way":
    case "excess-damage-this-way":
    case "damage-dealt-this-way":
    case "source-on-battlefield":
    case "vote-won":
    case "votes-cast":
    case "voted-number":
    case "target-is-source":
    case "host-now":
    case "target-controlled-by-you":
    case "target-is-you":
    case "target-legal":
      // A static ability has no triggering object, no chosen targets and no
      // resolution in progress — these kinds are only meaningful inside a
      // `conditional` effect, where the resolution context answers them
      // instead (see `Game`'s `conditionMet`).
      return false;
  }
}

/**
 * A meld card's "if you both own and control ~ and a [type] named [its
 * counterpart]" (rule 701.42): the permanents matching `partner` that `you`
 * own and control, other than `source` — or `null` when there's none, or
 * `source` isn't a permanent `you` own and control. More than one is a
 * choice for the player melding (the ruling: "if you control more than one
 * object with one of those names, you select one object with that name to
 * exile"). The `meld-ready` condition and the `meld` effect both ask this.
 */
export function meldPartners(
  state: GameState,
  registry: CardRegistry,
  source: ObjectId,
  you: PlayerId,
  partner: CardFilter,
): ObjectId[] | null {
  const self = state.objects[source];
  if (self === undefined || self.zone !== "battlefield" || self.owner !== you || self.controller !== you) return null;
  const found = state.zones.shared.battlefield.filter((id) => {
    const object = state.objects[id];
    return (
      id !== source &&
      object !== undefined &&
      object.owner === you &&
      object.controller === you &&
      matchesFilter(state, registry, id, partner, { you })
    );
  });
  return found.length > 0 ? found : null;
}

export interface Characteristics {
  readonly power: number;
  readonly toughness: number;
  /**
   * Base power and toughness (rule 613.4b): the printed values, or what a
   * characteristic-defining ability (layer 7a) or an effect that *sets* them
   * (layer 7b — "becomes a 4/4", "has base power and toughness 2/2") made
   * them, before counters and every "gets +N/+N" (layer 7c). Duskana, the
   * Rage Mother's rulings: a 0/0 that "gets +1/+1 for each …" still has base
   * 0/0, and one whose CDA counts to 2 has base 2.
   */
  readonly basePower: number;
  readonly baseToughness: number;
  readonly keywords: ReadonlySet<Keyword>;
  /** Its total toxic value (rule 702.164b): the N of every toxic ability it
   * has, summed — a printed one (`CardDefinition.toxic`) unless it has lost
   * its abilities, and each `grantToxic` static reaching it. 0 for none.
   * Combat damage it deals a player gives that player this many poison
   * counters (rule 120.3g). */
  readonly toxic: number;
  readonly types: readonly CardType[];
  readonly subtypes: readonly string[];
  readonly colors: ReadonlySet<Color>;
  readonly controller: PlayerId;
  /** Combat restrictions from static abilities (Pacifism, Juggernaut) and
   * from `restrict` effects' modifiers. */
  readonly restrictions: ReadonlySet<CombatWord>;
  /** It assigns combat damage equal to its toughness rather than its power
   * (a `combatDamageByToughness` static — Doran, the Siege Tower), already
   * resolved against its final P/T for the `"if-toughness-greater"` form.
   * Read it through {@link combatDamageOf}, never directly. */
  readonly damageByToughness: boolean;
  /** It assigns no combat damage this turn (an `assigns-no-combat-damage`
   * effect — Farrel's Zealot). Read it through {@link combatDamageOf}. */
  readonly assignsNoCombatDamage?: boolean;
  /** How many more creatures than one it can block (`blockAdditional` — an
   * ability, layer 6): their sum, or `"any"`. Absent for none. Read
   * through {@link blockLimitOf}. */
  readonly extraBlocks?: number | "any";
  /** It "can attack as though it didn't have defender" (a
   * `canAttackAsThoughNoDefender` static — Arcades, the Strategist). */
  readonly canAttackAsThoughNoDefender: boolean;
  /** It can attack *players who attacked its controller during their last
   * turn* as though it didn't have defender (a `canAttackAsThoughNoDefender:
   * "players-who-attacked-you"` static — Weathered Sentinels). Read through
   * {@link canAttackDespiteDefender} with the defender. */
  readonly canAttackAttackersDespiteDefender: boolean;
  /** It assigns its combat damage as though it weren't blocked: `"may"` by
   * an `assignAsThoughUnblocked` static or a may-effect on it, `"must"` by a
   * mandatory effect (Outmaneuver). Read through
   * {@link unblockedAssignmentOf}, which adds the turn-wide rules. */
  readonly assignAsThoughUnblocked?: "may" | "must";
  /** It can't be sacrificed (a `cantBeSacrificed` static, or the ability
   * granted by the `"cant-be-sacrificed"` effect) — rule 701.21a. Read it
   * through {@link cantBeSacrificed}, which skips the fold on the boards
   * where nothing grants it. */
  readonly cantBeSacrificed: boolean;
  /** Protection (rule 702.16): the union of every "protection from …" clause
   * — a source matching any of these colours, types or filters can't target /
   * block / enchant / damage this object. */
  readonly protectionFrom: {
    readonly colors: ReadonlySet<Color>;
    readonly types: ReadonlySet<CardType>;
    /** Qualities no colour or card type can name — a subtype, multicoloured,
     * spells, or (an empty filter) everything. Evaluated only against a source
     * the engine can identify as an object, but for everything (702.16j); see
     * `protectionBlocks`. */
    readonly filters: readonly CardFilter[];
    /** A static's filters, each read with its own source as the filter's
     * ("creatures of the chosen type" — Riders of Gavony). */
    readonly boundFilters: readonly { readonly filter: CardFilter; readonly source: ObjectId }[];
    /** Protection from these players (rule 702.16k). */
    readonly players: ReadonlySet<PlayerId>;
    /** Set only where some instance "doesn't remove" its Aura (rule
     * 702.16n): the colours and card types every other instance names, and
     * each sparing instance's own — which `protectionBlocks` reads for an
     * Aura's attachment alone. `colors` and `types` above hold them all. */
    readonly sparing?: {
      readonly otherColors: ReadonlySet<Color>;
      readonly otherTypes: ReadonlySet<CardType>;
      readonly instances: readonly {
        /** The Aura it spares, or `"all"` of them (Spectra Ward), or the
         * Auras and Equipment `controller` controls that became attached no
         * later than timestamp `by` (rule 702.16p — Benevolent Blessing). */
        readonly aura: SparedAttachments;
        readonly colors: readonly Color[];
        readonly types: readonly CardType[];
      }[];
    };
  };
  /** Hexproof from a quality (rule 702.11d-e): the union of every "hexproof
   * from …" clause — a matching spell, or an ability from a matching source,
   * an opponent of this permanent's controller controls can't target it.
   * The same three clauses as `protectionFrom`, evaluated the same way. */
  readonly hexproofFrom: {
    readonly colors: ReadonlySet<Color>;
    readonly types: ReadonlySet<CardType>;
    readonly filters: readonly CardFilter[];
    /** The printed "can't be the target of …" instances that aren't the
     * keyword — spells only, abilities only, any player's, or every spell
     * or ability (no quality) — each judged alone (`hexproofFromBlocks`). */
    readonly qualified: readonly NonNullable<StaticAbility["hexproofFrom"]>[];
  };
  /** Each "bands with other [quality]" it has (rule 702.22b), the quality as
   * a filter — none lost to a later loss of banding or of "bands with
   * other" (Tolaria, Shelkin Brownie). Read by `combat/banding.ts`. */
  readonly bandsWithOther: readonly CardFilter[];
  /** Each landwalk of a kind no named keyword covers (rule 702.14a), the
   * land as a filter — "nonbasic landwalk", "artifact landwalk", "landwalk of
   * the chosen type" (`StaticAbility.landwalk`), none lost to a later loss of
   * landwalk. Read by `combat/eligibility.ts` as a block is declared. */
  readonly landwalk: readonly CardFilter[];
}

/** Whether a "hexproof from" instance has to be judged alone rather than
 * merged into the keyword's union: it's limited to spells or abilities, it
 * stops every player and not only opponents, or it names no quality at all
 * (every spell or ability — "can't be the target of spells"). */
function isQualifiedHexproof(h: NonNullable<StaticAbility["hexproofFrom"]>): boolean {
  return (
    h.spellsOnly === true ||
    h.abilitiesOnly === true ||
    h.anyController === true ||
    h.notHexproof === true ||
    ((h.colors ?? []).length === 0 && (h.types ?? []).length === 0 && h.filter === undefined && h.ownColors !== true)
  );
}

/** The colours and card types a protection names, "the chosen color" and
 * "the chosen card type" read off `source`'s `chosenOnEnter` — nothing for
 * either while none was chosen. Shared by a permanent's protection and a
 * player's (`playerProtection`). */
export function chosenProtectionQualities(
  p: {
    readonly colors?: readonly Color[];
    readonly types?: readonly CardType[];
    readonly chosenColor?: true;
    readonly chosenCardType?: true;
  },
  source: GameObject,
): { colors: Color[]; types: CardType[] | undefined } {
  const chosen = source.chosenOnEnter;
  const colors = [
    ...(p.colors ?? []),
    ...(p.chosenColor === true && chosen != null && (COLORS as readonly string[]).includes(chosen) ? [chosen as Color] : []),
  ];
  // A chosen word that isn't a colour is the card type (rule 205.2a — the
  // menu `chooseOnEnter` offered was `CARD_TYPE_CHOICES`).
  const chosenType = p.chosenCardType === true && chosen != null && !(COLORS as readonly string[]).includes(chosen);
  const types = chosenType ? [...(p.types ?? []), chosen as CardType] : p.types !== undefined ? [...p.types] : undefined;
  return { colors, types };
}

/** What an instance of protection that "doesn't remove" attachments spares:
 * one Aura, `"all"` Auras (rule 702.16n), or the Auras and Equipment
 * `controller` controls that became attached no later than timestamp `by`
 * (rule 702.16p). */
export type SparedAttachments = ObjectId | "all" | { readonly controller: PlayerId; readonly by: number };

/** The players a protection from players names (rule 702.16k): "each of your
 * opponents", `source`'s controller's as things are now, or the player chosen
 * for `source` as it entered. Shared by a permanent's protection and a
 * player's (`playerProtection`). */
export function protectionPlayers(
  state: GameState,
  fromPlayers: "opponents" | "chosen" | undefined,
  source: GameObject,
): readonly PlayerId[] {
  if (fromPlayers === "opponents") return state.turnOrder.filter((p) => p !== source.controller);
  if (fromPlayers === "chosen") return source.chosenPlayer === undefined ? [] : [source.chosenPlayer];
  return [];
}

/** A static's protection as it applies now: "the chosen color" read off the
 * source (its `chosenOnEnter`, if a colour), its filter read with the source
 * as the filter's, the players it names, the exiled card's card types, and
 * the Aura a "doesn't remove this Aura" instance spares (rule 702.16n). */
function staticProtection(
  state: GameState,
  registry: CardRegistry,
  ability: StaticAbility,
  source: GameObject,
): AppliedEffect["protection"] {
  const p = ability.protection;
  if (p === undefined) return null;
  if (
    p.chosenColor !== true &&
    p.chosenCardType !== true &&
    p.doesntRemoveSource !== true &&
    p.doesntRemoveAuras !== true &&
    p.doesntRemoveAttached !== true &&
    p.colorsAmong === undefined &&
    p.filter === undefined &&
    p.fromPlayers === undefined &&
    p.exiledCardTypes !== true &&
    p.outsideCommanderIdentity !== true
  ) {
    return p;
  }
  const { colors, types } = chosenProtectionQualities(p, source);
  // "That's not in your commander's color identity" (rule 903.4f: with no
  // commander, that quality is undefined and this part does nothing).
  if (p.outsideCommanderIdentity === true && hasCommander(state, source.controller)) {
    const identity = state.players[source.controller]?.commanderIdentity ?? [];
    colors.push(...COLORS.filter((c) => !identity.includes(c)));
  }
  // Colours are layer 5, so protection (layer 6) reads them finished.
  if (p.colorsAmong !== undefined) {
    colors.push(...colorSetAmongPermanents(state, registry, source.controller, p.colorsAmong));
  }
  const exiledTypes =
    p.exiledCardTypes === true
      ? (liveReferenceObjects(state, registry, "exiled-with-source", { you: source.controller, source: source.id }) ?? []).flatMap(
          (card) => registry.get(printedCardName(state.objects[card]!)).types,
        )
      : [];
  return {
    colors,
    ...(types !== undefined || exiledTypes.length > 0 ? { types: [...(types ?? []), ...exiledTypes] } : {}),
    ...(p.filter !== undefined ? { filter: p.filter, filterSource: source.id } : {}),
    ...(p.fromPlayers !== undefined ? { players: protectionPlayers(state, p.fromPlayers, source) } : {}),
    ...(p.doesntRemoveSource === true ? { sparesAura: source.id } : {}),
    ...(p.doesntRemoveAuras === true ? { sparesAura: "all" as const } : {}),
    // "Already attached": no later than this protection began, which is the
    // source's own timestamp (rules 613.7e, 702.16p).
    ...(p.doesntRemoveAttached === true
      ? { sparesAura: { controller: source.controller, by: source.timestamp } }
      : {}),
  };
}

/**
 * What a `sharesKeywords` static gives now ("~ has flying as long as an
 * exiled card used to craft it has flying. The same is true for …"): the
 * listed keywords some card in the set has, each "hexproof from [quality]"
 * ability of theirs when hexproof is listed (rule 702.11d-e), and each
 * protection ability when protection is (702.16a). A card has what its text
 * gives itself without condition; its protection is read as `source`'s own.
 */
function sharedKeywordsOf(
  state: GameState,
  registry: CardRegistry,
  ability: StaticAbility,
  source: GameObject,
): {
  readonly keywords: readonly Keyword[];
  readonly protections: readonly NonNullable<AppliedEffect["protection"]>[];
  readonly hexproofs: readonly NonNullable<StaticAbility["hexproofFrom"]>[];
} | null {
  const shared = ability.sharesKeywords;
  if (shared === undefined) return null;
  const ctx = { you: source.controller, source: source.id };
  const cards = (liveReferenceObjects(state, registry, shared.from, ctx) ?? []).filter(
    (id) =>
      state.objects[id] !== undefined &&
      (shared.filter === undefined || matchesFilter(state, registry, id, shared.filter, ctx)),
  );
  const keywords = new Set<Keyword>();
  const protections: NonNullable<AppliedEffect["protection"]>[] = [];
  const hexproofs: NonNullable<StaticAbility["hexproofFrom"]>[] = [];
  for (const id of cards) {
    const has = computeCharacteristics(state, registry, id).keywords;
    for (const keyword of shared.keywords) if (has.has(keyword)) keywords.add(keyword);
    for (const own of registry.get(rulesTextName(state.objects[id]!)).static) {
      if (own.affects.scope !== "self" || own.condition !== undefined) continue;
      if (shared.keywords.includes("hexproof") && own.hexproofFrom !== undefined && own.hexproofFrom.notHexproof !== true) {
        hexproofs.push(own.hexproofFrom);
      }
      if (shared.protection === true) {
        const protection = staticProtection(state, registry, own, source);
        if (protection !== null) protections.push(protection);
      }
    }
  }
  return { keywords: [...keywords], protections, hexproofs };
}

/**
 * Keyword counters (rule 122.1b): a permanent with a flying, lifelink,
 * vigilance… counter on it has that keyword, in layer 6 alongside every other
 * ability-adding effect. The counter's kind is the keyword's own name here
 * (`"first-strike"`, not "first strike"). Exalted counters aren't among
 * them: the engine has no such keyword.
 */
export const KEYWORD_COUNTERS: ReadonlySet<Keyword> = new Set<Keyword>([
  "flying",
  "first-strike",
  "double-strike",
  "deathtouch",
  "decayed",
  "haste",
  "hexproof",
  "indestructible",
  "lifelink",
  "menace",
  "reach",
  "shadow",
  "trample",
  "vigilance",
]);

/** The keywords `object`'s keyword counters give it — see
 * {@link KEYWORD_COUNTERS}. Like the other layer-6 grants that come from
 * outside its own text, they stay through a loss of its own abilities. */
export function keywordCountersOn(object: GameObject): Keyword[] {
  if (object.zone !== "battlefield") return [];
  const out: Keyword[] = [];
  for (const [kind, n] of Object.entries(object.counters)) {
    if ((n ?? 0) > 0 && KEYWORD_COUNTERS.has(kind as Keyword)) out.push(kind as Keyword);
  }
  return out;
}

/** Whether a speed (rule 702.179 — 0 for none) is within a `speed`
 * condition's bounds. */
export function speedWithin(
  speed: number,
  bounds: { readonly atLeast?: number; readonly atMost?: number },
): boolean {
  return (bounds.atLeast === undefined || speed >= bounds.atLeast) && (bounds.atMost === undefined || speed <= bounds.atMost);
}

/** The journal's reader for `state`: its views' type reads are layer 4's. */
export function journalReader(state: GameState, registry: CardRegistry): JournalReader {
  return {
    state,
    typesOf: (id) => {
      const object = state.objects[id];
      return object === undefined ? [] : effectiveTypes(state, registry, object);
    },
  };
}

/** Damage dealt to `player` this turn, all of it or (with `combat`) only
 * combat or noncombat damage. Damage, not life lost: prevented damage isn't
 * dealt. */
function damageTakenThisTurn(state: GameState, player: PlayerId, combat: boolean | undefined): number {
  let n = 0;
  for (const entry of entriesThisTurn(state, "damage")) {
    if (entry.target?.kind !== "player" || entry.target.player !== player) continue;
    if (combat !== undefined && (entry.combat !== undefined) !== combat) continue;
    n += entry.amount ?? 0;
  }
  return n;
}

/** The creatures `player` declared as attackers this turn, each once in
 * each stint however many combats it attacked in, a stack as every token in
 * it — never one put onto the battlefield attacking (rule 508.4). */
function attackersThisTurn(state: GameState, player: PlayerId): number {
  const seen = new Set<string>();
  let n = 0;
  for (const entry of entriesThisTurn(state, "attacked")) {
    if (entry.player !== player) continue;
    const key = `${entry.object}@${entry.stint}`;
    if (seen.has(key)) continue;
    seen.add(key);
    n += entry.count ?? 1;
  }
  return n;
}

/** The total power of the creatures `player` declared as attackers in
 * combat phase `combat`, each as it was declared, a stack as every token in
 * it (a negative power counts as itself, rule 107.1b). */
export function powerAttackedWith(state: GameState, player: PlayerId, combat: number): number {
  let n = 0;
  for (const entry of entriesThisTurn(state, "attacked")) {
    if (entry.player === player && entry.combat === combat) n += (entry.was?.power ?? 0) * (entry.count ?? 1);
  }
  return n;
}

/**
 * Each `TurnStat` word as a read of the journal (`journal.ts`) for one player
 * this turn: no state stands behind any of them, and a new stat is a new row,
 * never a new field.
 */
const TURN_STAT_READS: { readonly [S in TurnStat]: (state: GameState, player: PlayerId) => number } = {
  "life-lost": (state, player) => journalTotal(state, "life-lost", player, "amount"),
  "life-gained": (state, player) => journalTotal(state, "life-gained", player, "amount"),
  "cards-drawn": (state, player) => journalTotal(state, "card-drawn", player, "count"),
  "spells-cast": (state, player) => state.players[player]?.spellsCastThisTurn ?? 0,
  "damage-taken": (state, player) => damageTakenThisTurn(state, player, undefined),
  "combat-damage-taken": (state, player) => damageTakenThisTurn(state, player, true),
  "noncombat-damage-taken": (state, player) => damageTakenThisTurn(state, player, false),
  attacked: (state, player) => (journalTotal(state, "attacked", player, "count") > 0 ? 1 : 0),
  attackers: (state, player) => attackersThisTurn(state, player),
  "cards-to-graveyard-from-hand-or-library": (state, player) =>
    entriesThisTurn(state, "to-graveyard").filter(
      (e) => e.player === player && (e.from === "hand" || e.from === "library"),
    ).length,
  "cards-left-graveyard": (state, player) => journalTotal(state, "left-graveyard", player, "count"),
  "lands-tapped-for-mana": (state, player) => journalTotal(state, "tapped-for-mana", player, "count"),
  "scried-or-surveilled": (state, player) => journalTotal(state, "scried", player, "count"),
  surveilled: (state, player) =>
    entriesThisTurn(state, "scried").filter((e) => e.player === player && e.how === "surveil").length,
  "own-library-searched": (state, player) => journalTotal(state, "library-searched", player, "count"),
  "cards-put-into-exile": (state, player) => journalTotal(state, "put-into-exile", player, "count"),
  "mana-spent-on-spells": (state, player) => journalTotal(state, "mana-spent", player, "amount"),
  "opponents-attacked": (state, player) =>
    new Set(
      entriesThisTurn(state, "attacked").flatMap((e) =>
        e.player === player && e.target?.kind === "player" && e.target.player !== player ? [e.target.player] : [],
      ),
    ).size,
  "power-attacked-with-this-combat": (state, player) =>
    PHASE_OF_STEP[state.turn.step] !== "combat" ? 0 : powerAttackedWith(state, player, state.turn.combatPhases ?? 1),
  "energy-paid-or-lost": (state, player) => journalTotal(state, "energy-lost", player, "amount"),
};

/** How many units of mana are unspent in `player`'s pool (rule 106.4), of
 * `type` if given. */
export function unspentManaOf(state: GameState, player: PlayerId, type?: ManaType): number {
  const pool = state.players[player]?.manaPool ?? [];
  return type === undefined ? pool.length : pool.filter((unit) => unit.type === type).length;
}

/** One player's running total for `stat` this turn: a read of the journal
 * (`TURN_STAT_READS`). */
export function turnStatOf(state: GameState, player: PlayerId, stat: TurnStat): number {
  if (state.players[player] === undefined) return 0;
  return TURN_STAT_READS[stat](state, player);
}

/**
 * How many counters were put on permanents this turn, as `spec` narrows them,
 * from `you`'s side — the `countersPutThisTurn` amount and the
 * `counters-put-this-turn` condition. Each permanent as the counters went on.
 */
export function countersPutThisTurn(state: GameState, spec: CountersPutSpec, you: PlayerId): number {
  let n = 0;
  for (const put of entriesThisTurn(state, "counters-put")) {
    if (spec.by !== "any-player" && put.player !== you) continue;
    if (spec.counter !== undefined && put.counter !== spec.counter) continue;
    if (spec.onType !== undefined && put.was?.types.includes(spec.onType) !== true) continue;
    if (spec.onYours === true && put.was?.controller !== you) continue;
    n += put.amount ?? 0;
  }
  return n;
}

/**
 * How much damage sources `players` controlled dealt this turn — combat or
 * noncombat only if `combat` says, and only from sources that were one of
 * `colors` as they dealt it if that's given — the `damage-dealt-this-turn`
 * condition and amount.
 */
export function damageDealtThisTurn(
  state: GameState,
  players: readonly PlayerId[],
  combat: boolean | undefined,
  colors: readonly Color[] | undefined,
  read: {
    readonly to?: TargetRef;
    /** With a permanent `to`: which of its stints (rule 400.7). */
    readonly toStint?: number;
    readonly by?: DamageSourceClause;
    /** Who "other" is, with `by.other`. */
    readonly source?: ObjectId;
  } = {},
): number {
  let n = 0;
  for (const dealt of entriesThisTurn(state, "damage")) {
    if (dealt.player === undefined || !players.includes(dealt.player)) continue;
    if (combat !== undefined && (dealt.combat !== undefined) !== combat) continue;
    if (colors !== undefined && dealt.was?.colors.some((c) => colors.includes(c)) !== true) continue;
    const to = read.to;
    if (to?.kind === "player" && (dealt.target?.kind !== "player" || dealt.target.player !== to.player)) continue;
    if (
      to?.kind === "object" &&
      (dealt.target?.kind !== "object" || dealt.target.object !== to.object || dealt.targetStint !== read.toStint)
    ) {
      continue;
    }
    const by = read.by;
    if (by?.type !== undefined && dealt.was?.types.includes(by.type) !== true) continue;
    if (by?.name !== undefined && dealt.was?.name !== by.name) continue;
    if (by?.other === true && dealt.object === read.source) continue;
    n += dealt.amount ?? 0;
  }
  return n;
}

/** How a {@link journalCount} reads beyond its list: the zones a
 * `to-graveyard` arrival came from, the window (default this turn), and
 * `toPlayer`, only the entries done to that player (an entry's `target`), and
 * `sumOf: "power"`, their total power rather than how many. */
export type JournalReadOptions = JournalOrigin & {
  readonly window?: JournalWindow;
  readonly toPlayer?: PlayerId;
  readonly sumOf?: "power";
};

/**
 * How many things of one journal word (`JournalWhat`, `journal.ts`'s
 * `JOURNAL_VIEWS`) `players` have in `window` (default this turn), matching
 * `filter` from `you`'s side — a token stack counting as every token in it.
 * Each is matched as it was (its entry's `was`: as it entered, left, attacked
 * or dealt damage, rule 603.10a); a card discarded or put into a graveyard
 * from anywhere but the battlefield, as it is now (a descend too, the card it became). `except` leaves one object
 * out in one stint ("another Human" — the source as it is now): the same card
 * in an earlier stint was a different object (rule 400.7) and counts. `only`
 * counts one object in one stint ("if **it** …"). `options` narrows
 * `to-graveyard` by the zone each came from.
 */
export function journalCount(
  state: GameState,
  registry: CardRegistry,
  players: readonly PlayerId[],
  what: JournalWhat,
  filter: CardFilter | undefined,
  you: PlayerId,
  except?: { readonly id: ObjectId; readonly stint: number },
  options?: JournalReadOptions,
  only?: { readonly id: ObjectId; readonly stint: number },
): number {
  let n = 0;
  const view = JOURNAL_VIEWS[what];
  const entries = journalEntries(journalReader(state, registry), view, players, options?.window ?? "this-turn", you);
  // `oncePerList`: the objects already counted, each per stint and list.
  const counted = view.oncePerList === true ? new Set<string>() : undefined;
  // A view about what the entry's act was done to reads that instead.
  const aboutRecipient = view.whose === "recipient";
  for (const entry of entries) {
    if (options?.from !== undefined && (entry.from === undefined || !options.from.includes(entry.from))) continue;
    if (options?.notFrom !== undefined && entry.from !== undefined && options.notFrom.includes(entry.from)) continue;
    if (options?.toPlayer !== undefined && (entry.target?.kind !== "player" || entry.target.player !== options.toPlayer)) continue;
    const object = aboutRecipient ? (entry.target?.kind === "object" ? entry.target.object : undefined) : entry.object;
    const stint = aboutRecipient ? entry.targetStint : entry.stint;
    const was = aboutRecipient ? entry.targetWas : entry.was;
    const at = stint ?? was?.zoneChangeCount;
    if (except !== undefined && object === except.id && (at === undefined || at === except.stint)) continue;
    if (only !== undefined && (object !== only.id || at !== only.stint)) continue;
    if (filter !== undefined && object !== undefined) {
      const asNow = what === "descended" || what === "discarded" || (what === "to-graveyard" && entry.from !== "battlefield");
      const snapshot = asNow
        ? undefined
        : (was ?? (stint === undefined ? undefined : snapshotOfStint(state, object, stint)));
      const matched = matchesFilter(
        state,
        registry,
        object,
        filter,
        snapshot !== undefined ? { you, snapshot } : { you, ...(asNow ? {} : { lastKnown: true }) },
      );
      if (!matched) continue;
    }
    if (counted !== undefined && entry.object !== undefined) {
      const list = view.whose === "target" ? (entry.target?.kind === "player" ? entry.target.player : "") : (entry.player ?? "");
      const key = `${entry.object}@${at ?? ""}@${list}`;
      if (counted.has(key)) continue;
      counted.add(key);
    }
    // "The total power of …": each as its entry kept it (rule 603.10a).
    const each =
      options?.sumOf === "power"
        ? (was ?? (object !== undefined && stint !== undefined ? snapshotOfStint(state, object, stint) : undefined))?.power ?? 0
        : 1;
    n += (entry.count ?? 1) * each;
  }
  return n;
}

/** The names to tell a permanent by when comparing them (rule 201.2): its own
 * ({@link namesOf}), or a token's as its maker gave it (rule 111.4 — two "Elf
 * Token"s of different registry keys share a name; {@link distinctNameOf}). */
function namesForComparing(registry: CardRegistry, object: GameObject): readonly string[] {
  if (!object.isToken) return namesOf(registry, object);
  const name = distinctNameOf(registry, object);
  return name === undefined ? [] : [name];
}

/** Whether `n` is a prime number (Zimone, All-Questioning). */
function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}

/** Object `id` as it last existed on the battlefield in battlefield stint
 * `stint` — its `lastKnown`, one of its `earlierLastKnown`, or a ceased
 * token's snapshot — or nothing once that snapshot is no longer kept. */
function snapshotOfStint(state: GameState, id: ObjectId, stint: number): LastKnownInfo | undefined {
  const object = state.objects[id];
  if (object === undefined) {
    const ceased = state.ceasedTokens?.[id];
    return ceased?.zoneChangeCount === stint ? ceased : undefined;
  }
  return [object.lastKnown, ...(object.earlierLastKnown ?? [])].find(
    (known) => known !== undefined && known.zoneChangeCount === stint,
  );
}

/**
 * Whether `ability` — a `grantsToSpells` static of `source` — reaches
 * `spell`, a spell on the stack: its controller's spells matching `filter`,
 * cast from one of `castFrom`, while the static's condition holds. `amount`
 * answers a filter's `{ amount }` operand; without it such a compare fails
 * closed.
 */
export function spellGrantReaches(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  ability: StaticAbility,
  spell: GameObject,
  amount?: (amount: EffectAmount) => number,
): boolean {
  const grant = ability.grantsToSpells;
  if (grant === undefined || spell.zone !== "stack" || spell.kind !== "card") return false;
  // An emblem's works from the command zone (rule 113.6p).
  if ((source.zone !== "battlefield" && source.kind !== "emblem") || hasLostAbilities(state, registry, source)) return false;
  if (state.players[source.controller]?.hasLost === true) return false;
  // By its wording, once Commandeer has parted the two (rule 109.5: "you" is
  // this permanent's controller): "spells you **cast**" asks who cast it, the
  // filter's `castBy` or "the first … you cast each turn"; "spells you
  // **control**" who controls it now. A grant only read as the spell is cast
  // (cascade, casualty, conspire) can't tell them apart, so needn't say.
  const whose = grant.firstEachTurn === true || grant.filter?.castBy === "you" ? spellCaster(spell) : spell.controller;
  if (grant.allSpells !== true && whose !== source.controller) return false;
  if (grant.castFrom !== undefined && (spell.castFrom === undefined || !grant.castFrom.includes(spell.castFrom))) {
    return false;
  }
  if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) {
    return false;
  }
  if (
    grant.filter !== undefined &&
    !matchesFilter(state, registry, spell.id, grant.filter, {
      you: source.controller,
      ...(amount !== undefined ? { amount } : {}),
    })
  ) {
    return false;
  }
  // "The first [filter] spell you cast each turn" (Anhelo, the Painter): of
  // the spells its caster has cast this turn that matched as they were cast,
  // this is the first — this cast of it, not an earlier one of the same card.
  if (grant.firstEachTurn === true) {
    const filter = grant.filter;
    const first = (state.players[spellCaster(spell)]?.spellsCastThisTurnAs ?? []).find(
      (cast) =>
        filter === undefined ||
        matchesFilter(state, registry, cast.id, filter, { you: source.controller, snapshot: cast.spell }),
    );
    if (first === undefined || first.id !== spell.id) return false;
    if ((first.spell.zoneChangeCount ?? 0) !== (spell.zoneChangeCount ?? 0)) return false;
  }
  return true;
}

/**
 * Whether `ability` — a `grantsToSpells` static of `source` — reaches
 * `cardId` as `player` would cast it: an alternative cost it grants
 * (freerunning, web-slinging) is chosen before the card is a spell on the
 * stack (rule 601.2b), so the card is judged where it is, as the spell it
 * would become. The same conditions as `spellGrantReaches`, but for "the first
 * … each turn".
 */
export function castGrantReaches(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  ability: StaticAbility,
  cardId: ObjectId,
  player: PlayerId,
): boolean {
  const grant = ability.grantsToSpells;
  const card = state.objects[cardId];
  if (grant === undefined || card === undefined || card.kind !== "card") return false;
  if ((source.zone !== "battlefield" && source.kind !== "emblem") || hasLostAbilities(state, registry, source)) return false;
  if (state.players[source.controller]?.hasLost === true) return false;
  if (grant.allSpells !== true && player !== source.controller) return false;
  if (grant.castFrom !== undefined && !grant.castFrom.includes(card.zone)) return false;
  if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) {
    return false;
  }
  const filter = grant.filter;
  if (filter !== undefined && !matchesFilter(state, registry, cardId, filter, { you: source.controller })) return false;
  // "The first [filter] spell you cast each turn" (Peri Brown): no spell
  // that matched as it was cast has been cast this turn yet.
  if (grant.firstEachTurn === true) {
    const earlier = (state.players[player]?.spellsCastThisTurnAs ?? []).some(
      (cast) =>
        filter === undefined ||
        matchesFilter(state, registry, cast.id, filter, { you: source.controller, snapshot: cast.spell }),
    );
    if (earlier) return false;
  }
  return true;
}

/**
 * Whether `grant` — what a `grant-spells-this-turn` gave its controller's
 * spells this turn — reaches `spell`, a spell on the stack. A `next` grant is
 * the spell's that used it up (`usedBy`, this stint on the stack) and no
 * other's; any other reaches each of its controller's spells cast from one of
 * `castFrom` that matches `filter`.
 */
export function turnSpellGrantReaches(
  state: GameState,
  registry: CardRegistry,
  grant: SpellGrantThisTurn,
  spell: GameObject,
): boolean {
  // "The next spell you **cast** this turn" (Overmaster) asks who cast it;
  // "spells you **control** can't be countered this turn" (Veil of Summer) who
  // controls it now. Yidris's "as you cast" is only read as it's cast.
  const whose = grant.next === true ? spellCaster(spell) : spell.controller;
  if (spell.zone !== "stack" || spell.kind !== "card" || whose !== grant.player) return false;
  if (grant.next === true) {
    return grant.usedBy?.id === spell.id && grant.usedBy.zoneChangeCount === (spell.zoneChangeCount ?? 0);
  }
  if (grant.castFrom !== undefined && (spell.castFrom == null || !grant.castFrom.includes(spell.castFrom))) return false;
  return grant.filter === undefined || matchesFilter(state, registry, spell.id, grant.filter, { you: grant.player });
}

/**
 * Whether `grant` reaches `cardId` as `player` casts it, before it's cast
 * (rule 601.2b–h — convoke is paid then): their grant, from a zone of
 * `castFrom`, matching `filter`, and for a `next` grant one nothing has used
 * up yet — this spell would. `from` is where the card is cast from (the card
 * may already be on the stack, rule 601.2a).
 */
export function turnCastGrantReaches(
  state: GameState,
  registry: CardRegistry,
  grant: SpellGrantThisTurn,
  cardId: ObjectId,
  player: PlayerId,
  from: ZoneType | undefined,
): boolean {
  if (grant.player !== player || (grant.next === true && grant.usedBy !== undefined)) return false;
  if (grant.castFrom !== undefined && (from === undefined || !grant.castFrom.includes(from))) return false;
  return grant.filter === undefined || matchesFilter(state, registry, cardId, grant.filter, { you: player });
}

/** Whether `spell`, on the stack, has split second (rule 702.61): printed, or
 * given by a `grantsToSpells` static on the battlefield. */
export function spellHasSplitSecond(state: GameState, registry: CardRegistry, spell: GameObject): boolean {
  if (spell.kind !== "card") return false;
  if (registry.get(rulesTextName(spell)).splitSecond) return true;
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined) continue;
    for (const ability of registry.get(rulesTextName(source)).static) {
      if (ability.grantsToSpells?.splitSecond === true && spellGrantReaches(state, registry, source, ability, spell)) {
        return true;
      }
    }
  }
  for (const { source, ability } of emblemStatics(state)) {
    if (ability.grantsToSpells?.splitSecond === true && spellGrantReaches(state, registry, source, ability, spell)) {
      return true;
    }
  }
  return false;
}

/** Whether an ability on the stack can't be countered (rule 701.5f): a
 * `grantsToSpells` static with `cantBeCountered` and `andAbilities` on the
 * battlefield or an emblem — Spider-Punk's "spells and abilities can't be
 * countered" — reaching every player's (`allSpells`) or its controller's. */
function abilityCantBeCountered(state: GameState, registry: CardRegistry, ability: GameObject): boolean {
  if (ability.zone !== "stack") return false;
  const reaches = (source: GameObject, granting: StaticAbility): boolean => {
    const grant = granting.grantsToSpells;
    if (grant?.cantBeCountered !== true || grant.andAbilities !== true) return false;
    if ((source.zone !== "battlefield" && source.kind !== "emblem") || hasLostAbilities(state, registry, source)) return false;
    if (state.players[source.controller]?.hasLost === true) return false;
    if (grant.allSpells !== true && ability.controller !== source.controller) return false;
    return granting.condition === undefined || staticConditionMet(state, registry, source, granting.condition);
  };
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined) continue;
    if (registry.get(rulesTextName(source)).static.some((granting) => reaches(source, granting))) return true;
  }
  return emblemStatics(state).some(({ source, ability: granting }) => reaches(source, granting));
}

/** Whether `spell`, on the stack, can't be countered (rule 701.5f): printed
 * ("this spell can't be countered"), or given by a `grantsToSpells` static
 * on the battlefield ("creature spells you control can't be countered").
 * How it was paid for (Cavern of Souls) is `GameObject.uncounterable`, read
 * alongside this. `by` is what would counter it, where that matters: a turn
 * grant's `cantBeCounteredBy` (Autumn's Veil's "by blue or black spells")
 * stops only a matching spell, judged as it resolves. */
export function spellCantBeCountered(
  state: GameState,
  registry: CardRegistry,
  spell: GameObject,
  by?: GameObject,
): boolean {
  if (spell.kind === "ability") return abilityCantBeCountered(state, registry, spell);
  if (spell.kind !== "card") return false;
  const printed = registry.get(rulesTextName(spell)).cantBeCountered;
  if (printed === true) return true;
  if (printed !== false && staticConditionMet(state, registry, spell, printed)) return true;
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined) continue;
    for (const ability of registry.get(rulesTextName(source)).static) {
      if (ability.grantsToSpells?.cantBeCountered === true && spellGrantReaches(state, registry, source, ability, spell)) {
        return true;
      }
    }
  }
  for (const { source, ability } of emblemStatics(state)) {
    if (ability.grantsToSpells?.cantBeCountered === true && spellGrantReaches(state, registry, source, ability, spell)) {
      return true;
    }
  }
  // "The next instant or sorcery spell you cast this turn can't be
  // countered" (Overmaster — `grant-spells-this-turn`).
  return (state.spellGrantsThisTurn ?? []).some(
    (grant) =>
      (grant.cantBeCountered === true ||
        (grant.cantBeCounteredBy !== undefined &&
          by !== undefined &&
          by.kind === "card" &&
          by.zone === "stack" &&
          matchesFilter(state, registry, by.id, grant.cantBeCounteredBy, { you: grant.player }))) &&
      turnSpellGrantReaches(state, registry, grant, spell),
  );
}

/** Whether `player` has this keyword: hexproof (rule 702.11d) or shroud
 * (702.18), from a `playerKeywords` static of a permanent they control or a
 * timed static of theirs, or hexproof from an effect that gave it to them
 * (`GameState.hexproofPlayers`). */
export function playerHasKeyword(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  keyword: "hexproof" | "shroud",
): boolean {
  if (keyword === "hexproof" && state.hexproofPlayers?.includes(player) === true) return true;
  const has = (source: GameObject, ability: StaticAbility): boolean =>
    ability.playerKeywords?.includes(keyword) === true &&
    (ability.condition === undefined || staticConditionMet(state, registry, source, ability.condition));
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined || source.controller !== player || hasLostAbilities(state, registry, source)) continue;
    for (const ability of registry.get(rulesTextName(source)).static) {
      if (has(source, ability)) return true;
    }
  }
  return emblemStatics(state, player).some(({ source, ability }) => has(source, ability));
}

const NO_EMBLEM_STATICS: readonly { readonly source: GameObject; readonly ability: StaticAbility }[] = [];

/**
 * The static abilities of the emblems in play, each with its emblem's object
 * as its source — owned and controlled by the emblem's owner (rule 114.2), so
 * "you" reads as it does on a permanent. An emblem's abilities work from the
 * command zone (rules 113.6p, 114.4), and it has them for good: nothing can
 * remove them. Gone with its owner (rule 800.4a). `owner` narrows to one
 * player's. Only the readers that ask here hear of them: `test/emblem-statics
 * .test.ts` pins which static fields those cover against the pool's emblems.
 */
export function emblemStatics(
  state: GameState,
  owner?: PlayerId,
): readonly { readonly source: GameObject; readonly ability: StaticAbility }[] {
  if (state.emblems.length === 0) return NO_EMBLEM_STATICS;
  let out: { source: GameObject; ability: StaticAbility }[] | null = null;
  for (const emblem of state.emblems) {
    if (emblem.object === undefined || (owner !== undefined && emblem.owner !== owner)) continue;
    if (state.players[emblem.owner]?.hasLost === true && emblem.expires === undefined) continue;
    const source = state.objects[emblem.object];
    if (source === undefined) continue;
    for (const ability of staticsOfEmblem(emblem)) (out ??= []).push({ source, ability });
  }
  return out ?? NO_EMBLEM_STATICS;
}

/** One emblem's static abilities, in the order its text gives them. */
export function staticsOfEmblem(emblem: EmblemState): readonly StaticAbility[] {
  if (emblem.static === null) return emblem.moreStatics ?? [];
  return emblem.moreStatics === undefined ? [emblem.static] : [emblem.static, ...emblem.moreStatics];
}

/** Each static on the battlefield answering `test`, of a permanent controlled
 * by an opponent of `searcher` still in the game: a read of who is working on
 * `searcher`'s search. */
function opposingSearchStatics<T>(
  state: GameState,
  registry: CardRegistry,
  searcher: PlayerId,
  test: (ability: StaticAbility) => T | undefined,
): { readonly source: GameObject; readonly value: T }[] {
  const found: { readonly source: GameObject; readonly value: T }[] = [];
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined || source.controller === searcher || state.players[source.controller]?.hasLost !== false) continue;
    const own = hasLostAbilities(state, registry, source) ? [] : registry.get(rulesTextName(source)).static;
    for (const ability of [...own, ...grantedStatics(state, registry, source)]) {
      const value = test(ability);
      if (value === undefined) continue;
      if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) continue;
      found.push({ source, value });
    }
  }
  return found;
}

/** Who controls `searcher` while they search their own library, and the
 * permanent that says so: the most recently entered (Opposition Agent's
 * ruling; rule 723.1a). */
export function searchControlOver(
  state: GameState,
  registry: CardRegistry,
  searcher: PlayerId,
): { readonly controller: PlayerId; readonly source: GameObject } | null {
  const all = opposingSearchStatics(state, registry, searcher, (a) => a.controlsOpponentsSearching);
  if (all.length === 0) return null;
  const last = all.reduce((a, b) => (b.source.timestamp > a.source.timestamp ? b : a));
  return { controller: last.source.controller, source: last.source };
}

/** What exiles what `searcher` finds in their own library: one entry per player
 * it may give the permission to, the most recently entered permanent's first,
 * or nothing. Two of one player's say the same. */
export function searchExileFor(
  state: GameState,
  registry: CardRegistry,
  searcher: PlayerId,
): readonly { readonly player: PlayerId; readonly source: ObjectId; readonly spendAs?: SpendAs }[] {
  const all = opposingSearchStatics(state, registry, searcher, (a) => a.exilesOpponentsFinds);
  const seen = new Set<PlayerId>();
  const out: { readonly player: PlayerId; readonly source: ObjectId; readonly spendAs?: SpendAs }[] = [];
  for (const { source, value } of [...all].sort((a, b) => b.source.timestamp - a.source.timestamp)) {
    if (seen.has(source.controller)) continue;
    seen.add(source.controller);
    out.push({ player: source.controller, source: source.id, ...(value.spendAs !== undefined ? { spendAs: value.spendAs } : {}) });
  }
  return out;
}

/** How many cards from the top of a library `searcher` may look through, if an
 * opponent's effect limits it (Aven Mindcensor): the fewest named. */
export function librarySearchTop(state: GameState, registry: CardRegistry, searcher: PlayerId): number | null {
  const all = opposingSearchStatics(state, registry, searcher, (a) => a.opponentsSearchTop);
  return all.length === 0 ? null : Math.min(...all.map((s) => s.value.top));
}

/** Whether `player` has paid to ignore `source`'s static effect this turn
 * (rule 116.2d). A permanent that left and came back is a new one (400.7). */
export function playerIgnoresStatic(state: GameState, player: PlayerId, source: GameObject): boolean {
  return (state.playerEffects ?? []).some(
    (e) =>
      e.owner === player &&
      e.ignoresStatic?.source === source.id &&
      e.ignoresStatic.stint === (source.zoneChangeCount ?? 0),
  );
}

/** What it costs to ignore `source`'s effect (rule 116.2d — a `search` prohibition's
 * `ignoreCost`), while it has one that's on: `null` otherwise. */
export function staticIgnoreCost(state: GameState, registry: CardRegistry, source: GameObject): string | null {
  if (source.zone !== "battlefield" || hasLostAbilities(state, registry, source)) return null;
  for (const ability of registry.get(rulesTextName(source)).static) {
    const cost = ability.prohibits?.find((p) => p.act === "search" && p.ignoreCost !== undefined);
    const ignoreCost = cost?.act === "search" ? cost.ignoreCost : undefined;
    if (ignoreCost !== undefined && (ability.condition === undefined || staticConditionMet(state, registry, source, ability.condition))) {
      return ignoreCost;
    }
  }
  return null;
}

/** The floor under `player`'s life total against damage (`damageLifeFloor` —
 * Angel's Grace's until end of turn, Ali from Cairo's static): the highest of
 * them, or `null` for none. */
export function playerDamageLifeFloor(state: GameState, registry: CardRegistry, player: PlayerId): number | null {
  let floor: number | null = null;
  for (const effect of state.playerEffects ?? []) {
    const held = effect.damageLifeFloor;
    if (held !== undefined && held.players.includes(player)) floor = Math.max(floor ?? held.floor, held.floor);
  }
  const raise = (source: GameObject, ability: StaticAbility): void => {
    const at = ability.damageLifeFloor;
    if (at === undefined || (floor !== null && at <= floor)) return;
    if (ability.condition === undefined || staticConditionMet(state, registry, source, ability.condition)) floor = at;
  };
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined || source.controller !== player) continue;
    const own = hasLostAbilities(state, registry, source) ? [] : registry.get(rulesTextName(source)).static;
    for (const ability of [...own, ...grantedStatics(state, registry, source)]) raise(source, ability);
  }
  for (const { source, ability } of emblemStatics(state, player)) raise(source, ability);
  return floor;
}

/** Whether `player` has protection from everything (rule 702.16j — Teferi's
 * Protection's "you gain protection from everything"): no spell or ability
 * may target them, no Aura enchant them, and damage to them is prevented. */
export function playerHasProtectionFromEverything(state: GameState, player: PlayerId): boolean {
  return (state.playerEffects ?? []).some((e) => e.protectionFromEverything?.includes(player) === true);
}

/** The keywords `grantsToSpells` statics on the battlefield give `spell`. */
function spellGrantedKeywords(state: GameState, registry: CardRegistry, spell: GameObject): Keyword[] {
  const out: Keyword[] = [];
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined) continue;
    for (const ability of registry.get(rulesTextName(source)).static) {
      const keywords = ability.grantsToSpells?.keywords;
      if (keywords !== undefined && spellGrantReaches(state, registry, source, ability, spell)) {
        out.push(...keywords);
      }
    }
  }
  for (const { source, ability } of emblemStatics(state)) {
    const keywords = ability.grantsToSpells?.keywords;
    if (keywords !== undefined && spellGrantReaches(state, registry, source, ability, spell)) {
      out.push(...keywords);
    }
  }
  return out;
}

/**
 * The creature `object` is paired with by soulbond (rule 702.95b), or
 * undefined if it's unpaired: both on the battlefield, each naming the other,
 * under one controller (702.95e). That either stopped being a creature is
 * left to the state-based check (`Game.unpairBrokenPairs`), which ends the
 * pairing for good — reading types here would fold the very statics a
 * pairing grants.
 */
export function pairedPartner(state: GameState, object: GameObject): GameObject | undefined {
  if (object.zone !== "battlefield" || object.pairedWith === undefined) return undefined;
  const partner = state.objects[object.pairedWith];
  if (
    partner === undefined ||
    partner.zone !== "battlefield" ||
    partner.pairedWith !== object.id ||
    partner.controller !== object.controller
  ) {
    return undefined;
  }
  return partner;
}

/** True if this permanent has lost its own abilities (layer 6): to an effect
 * (Turn to Frog) or to a static ("Enchanted creature loses all abilities",
 * Humility — see {@link staticAbilityLosses}). */
export function hasLostAbilities(state: GameState, registry: CardRegistry, object: GameObject): boolean {
  return abilitiesLostAt(state, registry, object) !== null;
}

/** When `object` last lost all its abilities (layer 6), or `null` if nothing
 * has taken them: the latest of a modifier's timestamp (Turn to Frog — one
 * with no timestamp counts as the latest) and a static's (see
 * {@link staticAbilityLosses}). */
export function abilitiesLostAt(state: GameState, registry: CardRegistry, object: GameObject): number | null {
  const layerSix = layerSixLossAt(state, registry, object);
  if (layerSix !== null) return layerSix;
  // Rule 305.7: a land whose land types an effect set to basic ones has lost
  // every ability its rules text gave it, but none another effect granted —
  // a loss before every grant, whenever that came.
  return landTextLost(state, registry, object) ? Number.NEGATIVE_INFINITY : null;
}

/** {@link abilitiesLostAt} in layer 6 alone: a loss of all abilities, which
 * takes the intrinsic mana abilities too (unlike rule 305.7's). */
function layerSixLossAt(state: GameState, registry: CardRegistry, object: GameObject): number | null {
  const own = modifierLossAt(object);
  if (object.zone !== "battlefield") return own;
  const fromStatic = staticAbilityLosses(state, registry).lost.get(object.id);
  if (fromStatic === undefined) return own;
  return own === null || fromStatic > own ? fromStatic : own;
}

/** Whether a static sets the land types of what it reaches to basic ones
 * (rule 305.7 — Blood Moon's "nonbasic lands are Mountains", Convincing
 * Mirage's chosen type), as opposed to adding one "in addition". */
export function setsBasicLandType(ability: StaticAbility): boolean {
  return ability.setsChosenLandType === true || (ability.setSubtypes ?? []).some(isBasicLandType);
}

function modifierSetsBasicLandType(modifier: PtModifier): boolean {
  return (modifier.setSubtypes ?? []).some(isBasicLandType);
}

/** The last {@link anyLandTypeSetter} answer, and what it was for. */
let landTypeSetterMemo: {
  readonly state: GameState;
  readonly registry: CardRegistry;
  readonly epoch: number;
  readonly any: boolean;
} | null = null;

/** Whether any battlefield static sets land types to basic ones — asked by
 * every ability check, and almost always "no"; answered once per mutation
 * like {@link anyLoseAllSource}. */
function anyLandTypeSetter(state: GameState, registry: CardRegistry): boolean {
  const memo = landTypeSetterMemo;
  if (memo !== null && memo.state === state && memo.registry === registry && memo.epoch === mutationEpoch) {
    return memo.any;
  }
  let any = false;
  for (const id of state.zones.shared.battlefield) {
    if (staticsOf(registry, rulesTextName(state.objects[id])).layer4.some(setsBasicLandType)) {
      any = true;
      break;
    }
  }
  landTypeSetterMemo = { state, registry, epoch: mutationEpoch, any };
  return any;
}

/**
 * Whether `object` has lost the abilities its rules text gave it to rule
 * 305.7: it's a land on the battlefield whose land types an effect set to
 * basic land types — its own modifier (Tideshaper Mystic's "becomes the
 * basic land type of your choice") or a static that applies to it (Blood
 * Moon, Spreading Seas). Abilities other effects granted it stay, and it
 * gains each new type's intrinsic mana ability (305.6).
 */
export function landTextLost(state: GameState, registry: CardRegistry, object: GameObject): boolean {
  if (object.zone !== "battlefield") return false;
  const own = object.modifiers.some(modifierSetsBasicLandType);
  if (!own && !anyLandTypeSetter(state, registry)) return false;
  const four = layerFour(state, registry, object);
  if (!four.types.includes("land")) return false;
  return own || four.applied.some((grant) => setsBasicLandType(grant.ability));
}

/** The latest timestamp of a modifier on `object` that took its abilities
 * away (an effect's — Turn to Frog), or `null`. */
function modifierLossAt(object: GameObject): number | null {
  let at: number | null = null;
  for (const m of object.modifiers) {
    if (m.loseAbilities !== true) continue;
    const t = m.timestamp ?? Infinity;
    if (at === null || t > at) at = t;
  }
  return at;
}

/** Set while {@link staticAbilityLosses} computes the board: a read that
 * re-enters it (a keyword-reading scope, a condition) sees no static losses
 * — conservative, never cached. */
let staticLossesInProgress = false;

/** What {@link staticAbilityLosses} works out. */
interface StaticLosses {
  /** Each permanent a loss reaches → the latest such loss's timestamp. */
  readonly lost: ReadonlyMap<ObjectId, number>;
  /** The `loseAllAbilities` statics that apply, by their permanent. */
  readonly applied: ReadonlyMap<ObjectId, ReadonlySet<StaticAbility>>;
}

const NO_LOSSES: StaticLosses = { lost: new Map(), applied: new Map() };

/**
 * Whether `source`'s static `ability` keeps applying though `source` has lost
 * its abilities: one with a layer-4 part applied before the loss (layer 4,
 * rule 613.1d), and a `loseAllAbilities` static that applied — Humility made
 * a creature takes its own abilities in layer 6 and still sets every
 * creature's base P/T in 7b — keeps the rest of its effect in the later
 * layers (rule 613.6; Humility and Opalescence's ruling).
 */
export function staticOutlivesLoss(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  ability: StaticAbility,
): boolean {
  // Not a loss in layer 4 itself (rule 305.7's), which the static depends on
  // (613.8a): then it never applied (`typeGrantSources`).
  if (hasLayerFourPart(ability)) return layerSixLossAt(state, registry, source) !== null || !landTextLost(state, registry, source);
  if (ability.loseAllAbilities !== true) return false;
  return staticAbilityLosses(state, registry).applied.get(source.id)?.has(ability) === true;
}

/**
 * Layer 6 — every battlefield permanent a `loseAllAbilities` static takes all
 * abilities from ("Enchanted creature loses all abilities", Humility's "All
 * creatures lose all abilities"), with the timestamp the loss applies at:
 * object id → the latest such loss. Memoized in the active cache region.
 *
 * A static whose own permanent has lost its abilities doesn't exist to apply
 * (rule 613.8a(b): an effect that removes it is one it depends on, so that
 * one applies first). So the statics apply in dependency order: an effect's
 * loss (a modifier) first, whatever its timestamp; then, round by round,
 * every static no other remaining one would reach, which may take another's
 * abilities away; and when every remaining one reaches another — a loop,
 * Humility's creature cousins facing each other — the earliest by timestamp
 * (rule 613.8b). A static with a layer-4 part outlives its source's loss
 * (rule 613.6, as in `typeGrantSources`).
 *
 * The loss is recorded half a step before the static's timestamp, so what
 * the same permanent grants at its own timestamp ("loses all abilities and
 * has '{T}: Add {C}'", Imprisoned in the Moon; "is a 0/1 with defender")
 * comes after it, as the text reads (`grantOutlastsLoss`).
 */
function staticAbilityLosses(state: GameState, registry: CardRegistry): StaticLosses {
  if (staticLossesInProgress || !anyLoseAllSource(state, registry)) return NO_LOSSES;
  const fresh = (): StaticLosses => {
    staticLossesInProgress = true;
    try {
      return computeStaticAbilityLosses(state, registry);
    } finally {
      staticLossesInProgress = false;
    }
  };
  // Asked from inside a guard, the reads it makes are conservative: answer,
  // never keep.
  if (guardActive()) return fresh();
  // Kept per mutation, as `anyLoseAllSource` is, region or not: every ability
  // check asks it, most of them outside a region (`moveObject`, an SBA
  // sweep's moves), and a board scan each time was 15% of a fuzzer game with
  // Humility out (2026-10-28).
  const memo = staticLossesMemo;
  if (memo !== null && memo.state === state && memo.registry === registry && memo.epoch === mutationEpoch) {
    // The cache check recomputes the first hit of each epoch and one in
    // every STATIC_LOSSES_CHECK_EVERY after it, not every hit: every ability
    // check asks this, and the whole board scan on each made one situation
    // fuzzer scenario (Trickster's Elk's "loses all abilities" beside its
    // token copy, 2026-11-06) take 66 s where it plays in 0.6 s, timing out.
    // A missed invalidation lasts until the next one, so it's still met.
    staticLossesHits += 1;
    if (cacheCheck && (memo.hits === 0 || staticLossesHits % STATIC_LOSSES_CHECK_EVERY === 0) && !sameLosses(memo.value, fresh())) {
      throw new Error("computed-cache divergence (static ability losses): a mutation is missing an invalidateComputedCache() call");
    }
    memo.hits += 1;
    return memo.value;
  }
  const value = fresh();
  staticLossesMemo = { state, registry, epoch: mutationEpoch, value, hits: 0 };
  return value;
}

/** The last {@link staticAbilityLosses} answer, and what it was for; `hits`
 * is how often it has been served. */
let staticLossesMemo: {
  readonly state: GameState;
  readonly registry: CardRegistry;
  readonly epoch: number;
  readonly value: StaticLosses;
  hits: number;
} | null = null;

/** Every memo hit of {@link staticAbilityLosses}, for the cache check's
 * sampling: one in this many is recomputed beside each epoch's first. */
let staticLossesHits = 0;
const STATIC_LOSSES_CHECK_EVERY = 16;

function sameLosses(a: StaticLosses, b: StaticLosses): boolean {
  if (a.lost.size !== b.lost.size || a.applied.size !== b.applied.size) return false;
  for (const [id, at] of a.lost) if (b.lost.get(id) !== at) return false;
  for (const [id, set] of a.applied) {
    const other = b.applied.get(id);
    if (other === undefined || other.size !== set.size || [...set].some((x) => !other.has(x))) return false;
  }
  return true;
}

/** The last {@link anyLoseAllSource} answer, and what it was for. */
let loseAllSourceMemo: {
  readonly state: GameState;
  readonly registry: CardRegistry;
  readonly epoch: number;
  readonly any: boolean;
} | null = null;

/**
 * Whether any battlefield permanent has a `loseAllAbilities` static — the
 * question every ability check asks first, and almost always "no". Answered
 * once per mutation: the board scan it saves ran inside loops over the
 * battlefield (a replacement scan for each token made) that run outside any
 * cache region (`moveObject` suspends it), which made a 500-token board 150
 * times slower. Every mutation that can change the answer — an entry, a leave,
 * a face or text change — calls {@link invalidateComputedCache}, which moves
 * the epoch; `setComputedCacheCheck` re-derives it on every hit.
 */
/** Whether any permanent's text has a static that grants statics
 * (`StaticAbility.grantsStatic`) — the cheap gate in front of
 * `staticGrantSources`, kept by mutation epoch like {@link anyLoseAllSource}
 * so the usual board, with none, pays one battlefield scan per mutation. */
let staticGrantSourceMemo: { state: GameState; registry: CardRegistry; epoch: number; any: boolean } | null = null;
function anyStaticGrantSource(state: GameState, registry: CardRegistry): boolean {
  const memo = staticGrantSourceMemo;
  if (memo !== null && memo.state === state && memo.registry === registry && memo.epoch === mutationEpoch) {
    return memo.any;
  }
  const any = state.zones.shared.battlefield.some((id) => {
    const object = state.objects[id];
    return object !== undefined && (staticsInfo(registry, rulesTextName(object))?.grantsStatic.length ?? 0) > 0;
  });
  staticGrantSourceMemo = { state, registry, epoch: mutationEpoch, any };
  return any;
}

function anyLoseAllSource(state: GameState, registry: CardRegistry): boolean {
  const memo = loseAllSourceMemo;
  if (memo !== null && memo.state === state && memo.registry === registry && memo.epoch === mutationEpoch) {
    if (cacheCheck && scanForLoseAllSource(state, registry) !== memo.any) {
      throw new Error("computed-cache divergence (lose-all sources): a mutation is missing an invalidateComputedCache() call");
    }
    return memo.any;
  }
  const any = scanForLoseAllSource(state, registry);
  loseAllSourceMemo = { state, registry, epoch: mutationEpoch, any };
  return any;
}

function scanForLoseAllSource(state: GameState, registry: CardRegistry): boolean {
  for (const id of state.zones.shared.battlefield) {
    if (staticsOf(registry, rulesTextName(state.objects[id])).loseAll.length > 0) return true;
  }
  return false;
}

/**
 * Whether `object`, about to enter the battlefield, would have lost all its
 * abilities there to a `loseAllAbilities` static that already applies (rule
 * 614.12: a permanent's own "enters tapped", "enters with counters" and "as
 * this enters" abilities are judged as it would exist on the battlefield,
 * with the continuous effects that would apply to it — a creature entering
 * under Humility makes no choice and gets no counters of its own, a land
 * under Toxicrene doesn't enter tapped). Matched as it is now, where it is:
 * its printed types (an Aura's or a pairing's scope can't reach it yet).
 */
export function entersWithoutAbilities(state: GameState, registry: CardRegistry, object: GameObject): boolean {
  // The effect putting it there says it has no abilities (Xu-Ifit,
  // Osteoharmonist): marked before its choices are asked, and on its
  // modifiers once it's there, before its replacements apply.
  if (object.enterChoice?.withoutAbilities === true) return true;
  if (object.zone === "battlefield" && modifierLossAt(object) !== null) return true;
  // A land a land-type setter would reach loses its rules text there too
  // (rule 305.7 — Blood Moon's ruling: a nonbasic land doesn't enter tapped).
  if (anyLandTypeSetter(state, registry) && printedDefinition(registry, object).types.includes("land")) {
    for (const id of state.zones.shared.battlefield) {
      const source = state.objects[id];
      if (source === undefined || source.id === object.id || state.players[source.controller]?.hasLost === true) continue;
      for (const ability of staticsOf(registry, rulesTextName(source)).layer4) {
        if (!setsBasicLandType(ability)) continue;
        if (ability.setsChosenLandType === true && !isBasicLandType(String(source.chosenOnEnter))) continue;
        if (ability.affects.scope === "attached" || ability.affects.scope === "paired" || ability.affects.scope === "chosen") continue;
        if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) continue;
        if (staticAffects(state, registry, ability.affects, source, object, { entering: true })) return true;
      }
    }
  }
  const applied = staticAbilityLosses(state, registry).applied;
  for (const [sourceId, abilities] of applied) {
    const source = state.objects[sourceId];
    if (source === undefined || source.id === object.id) continue;
    for (const ability of abilities) {
      if (ability.affects.scope === "attached" || ability.affects.scope === "paired" || ability.affects.scope === "chosen") continue;
      if (staticAffects(state, registry, ability.affects, source, object, { entering: true })) return true;
    }
  }
  return false;
}

/**
 * How many instances of `keyword` a card about to enter the battlefield under
 * `under` will have that its own text doesn't give it (rule 614.12): one for
 * each time it gained the keyword as a spell, which the permanent keeps (rule
 * 400.7a), and one for each static that will reach it there. Matched as
 * {@link entersWithoutAbilities} matches: as it is now, under that player.
 */
export function enteringKeywordInstances(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  keyword: Keyword,
  under: PlayerId,
): number {
  let instances = 0;
  for (const modifier of object.modifiers) {
    if (modifier.castRider === true && modifier.keywords.includes(keyword)) instances += 1;
  }
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined || source.id === object.id || state.players[source.controller]?.hasLost === true) continue;
    for (const ability of registry.get(rulesTextName(source)).static) {
      if (ability.grantKeywords?.includes(keyword) !== true) continue;
      if (hasLostAbilities(state, registry, source)) continue;
      if (ability.affects.scope === "attached" || ability.affects.scope === "paired" || ability.affects.scope === "chosen") continue;
      if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) continue;
      if (staticAffects(state, registry, ability.affects, source, object, { entering: true, enteringUnder: under })) instances += 1;
    }
  }
  return instances;
}

/**
 * The static abilities battlefield statics will grant a card about to enter
 * under `under` (rule 614.12): Master Chef's "commander creatures you own have
 * 'this creature enters with an additional +1/+1 counter on it'" applies as
 * the commander enters. Matched as {@link enteringKeywordInstances} matches.
 * Usually none, and then cheaply.
 */
export function enteringGrantedStatics(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  under: PlayerId,
): readonly StaticAbility[] {
  const granting = staticGrantSources(state, registry);
  const out: StaticAbility[] = [];
  for (const { source, ability } of granting) {
    if (source.id === object.id || state.players[source.controller]?.hasLost === true) continue;
    if (ability.affects.scope === "attached" || ability.affects.scope === "paired" || ability.affects.scope === "chosen") continue;
    if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) continue;
    if (!staticAffects(state, registry, ability.affects, source, object, { entering: true, enteringUnder: under })) continue;
    out.push(...(ability.grantsStatic ?? []));
  }
  return out;
}

/** The board scan behind {@link staticAbilityLosses}. */
function computeStaticAbilityLosses(state: GameState, registry: CardRegistry): StaticLosses {
  interface Pending {
    readonly source: GameObject;
    readonly ability: StaticAbility;
    /** The permanents it reaches. */
    readonly reaches: ReadonlySet<ObjectId>;
  }
  let pending: Pending[] = [];
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    const statics = staticsOf(registry, rulesTextName(source)).loseAll;
    if (statics.length === 0) continue;
    if (state.players[source.controller]?.hasLost === true) continue;
    for (const ability of statics) {
      // An effect's loss applies first (see above): the static is gone.
      if (!hasLayerFourPart(ability) && modifierLossAt(source) !== null) continue;
      if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) {
        continue;
      }
      const reaches = new Set<ObjectId>();
      for (const targetId of state.zones.shared.battlefield) {
        const target = state.objects[targetId];
        if (staticReaches(state, registry, source, ability, target)) reaches.add(targetId);
      }
      pending.push({ source, ability, reaches });
    }
  }
  const out = new Map<ObjectId, number>();
  const applied = new Map<ObjectId, Set<StaticAbility>>();
  const apply = (p: Pending): void => {
    let mine = applied.get(p.source.id);
    if (mine === undefined) applied.set(p.source.id, (mine = new Set()));
    mine.add(p.ability);
    const at = p.source.timestamp - 0.5;
    for (const id of p.reaches) {
      const was = out.get(id);
      if (was === undefined || at > was) out.set(id, at);
    }
  };
  // Whether `q` takes away the ability behind `p`: an effect doesn't depend
  // on itself, nor on its own permanent's other statics (Humility made a
  // creature still applies — its ruling).
  const takes = (q: Pending, p: Pending): boolean =>
    q.source.id !== p.source.id && !hasLayerFourPart(p.ability) && q.reaches.has(p.source.id);
  while (pending.length > 0) {
    const free = pending.filter((p) => !pending.some((q) => takes(q, p)));
    const round = free.length > 0 ? free : [pending.reduce((a, b) => (b.source.timestamp < a.source.timestamp ? b : a))];
    for (const p of round) apply(p);
    pending = pending.filter((p) => !round.includes(p) && !round.some((q) => takes(q, p)));
  }
  return { lost: out, applied };
}

/**
 * Whether an ability granted at `timestamp` — by another permanent's static,
 * an effect, a keyword counter — still gives it: layer 6 applies its effects
 * in timestamp order (rule 613.7), so losing all abilities takes away an
 * earlier grant but not a later one. `lostAt` is `abilitiesLostAt`, and
 * `null` means nothing took them. A grant with no timestamp counts as the
 * earliest.
 */
export function grantOutlastsLoss(lostAt: number | null, timestamp: number | undefined): boolean {
  return lostAt === null || (timestamp !== undefined && timestamp > lostAt);
}

/** One keyword taken away in layer 6 ("loses flying"), at its timestamp. */
interface KeywordLoss {
  readonly keyword: LosableKeyword;
  readonly timestamp: number;
}

/**
 * When `object` last lost ward (`loseKeywords: ["ward"]` — Shay Cormac), or
 * `null` when nothing took it: a ward ability it had before then, printed or
 * granted earlier, is gone, and one granted since stays (rule 613.7). Ward
 * is a triggered ability rather than a keyword in the fold, so
 * `Game.effectiveTriggeredEntries` asks this for each ward ability it lists.
 * Cheap where nothing on the board takes ward: the object's modifiers, and
 * the statics only when one of them names it.
 */
export function wardLostAt(state: GameState, registry: CardRegistry, object: GameObject): number | null {
  let at: number | null = null;
  for (const modifier of object.modifiers) {
    if (modifier.loseKeywords?.includes("ward") === true) at = Math.max(at ?? -Infinity, modifier.timestamp ?? Infinity);
  }
  if (
    object.zone === "battlefield" &&
    contributingStaticSources(state, registry).some(({ ability }) => ability.loseKeywords?.includes("ward") === true)
  ) {
    for (const effect of collectStaticEffects(state, registry, object)) {
      if (effect.loseKeywords.includes("ward")) at = Math.max(at ?? -Infinity, effect.timestamp);
    }
  }
  return at;
}

/** Every keyword loss reaching `object`: from the statics that reach it
 * (`effects`) and from its own modifiers. */
function keywordLosses(effects: readonly AppliedEffect[], object: GameObject): readonly KeywordLoss[] {
  const out: KeywordLoss[] = [];
  for (const effect of effects) for (const keyword of effect.loseKeywords) out.push({ keyword, timestamp: effect.timestamp });
  for (const modifier of object.modifiers) {
    for (const keyword of modifier.loseKeywords ?? []) out.push({ keyword, timestamp: modifier.timestamp ?? Infinity });
  }
  return out;
}

/** The keywords `object` can't have ("can't have or gain flying"), from the
 * statics that reach it (`effects`) and its own modifiers. Usually none. */
function keywordsForbiddenBy(effects: readonly AppliedEffect[], object: GameObject): ReadonlySet<Keyword> | null {
  let out: Set<Keyword> | null = null;
  for (const effect of effects) for (const keyword of effect.cantHaveKeywords) (out ??= new Set()).add(keyword);
  for (const modifier of object.modifiers) {
    for (const keyword of modifier.cantHaveKeywords ?? []) (out ??= new Set()).add(keyword);
  }
  return out;
}

/**
 * Of `keywords`, those a continuous effect created now by a resolving spell
 * or ability can give `object`. One that would give a keyword it can't have
 * isn't created, so it doesn't come back when what forbids it ends; a static
 * grant does (the Archetypes' and Arcane Lighthouse's rulings).
 */
export function grantableKeywords(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  keywords: readonly Keyword[],
): readonly Keyword[] {
  if (keywords.length === 0) return keywords;
  const effects = object.zone === "battlefield" ? collectStaticEffects(state, registry, object) : [];
  const forbidden = keywordsForbiddenBy(effects, object);
  return forbidden === null ? keywords : keywords.filter((keyword) => !forbidden.has(keyword));
}

/** Whether a keyword given at `timestamp` (printed: `-Infinity`) is taken
 * away by a loss after it (rule 613.7 — timestamp order within layer 6). */
function lostAfter(losses: readonly KeywordLoss[], keyword: LosableKeyword, timestamp: number | undefined): boolean {
  const at = timestamp ?? Infinity;
  return losses.some((loss) => loss.keyword === keyword && loss.timestamp > at);
}

/** {@link grantOutlastsLoss} for what a modifier grants — which, on the
 * modifier that itself took the abilities away ("loses all abilities and
 * has flying"), comes after that loss, as the one effect says. */
export function modifierGrantApplies(modifier: PtModifier, lostAt: number | null): boolean {
  if (grantOutlastsLoss(lostAt, modifier.timestamp)) return true;
  return modifier.loseAbilities === true && (modifier.timestamp ?? Infinity) === lostAt;
}

/** The static abilities modifiers grant `object` (`PtModifier.grantsStatic`
 * — the `grant-static` effect) that it still has: not taken away by a later
 * loss of all abilities (rule 613.7). Usually none, and then cheaply. */
export function grantedStatics(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  wanted?: (granted: StaticAbility) => boolean,
): readonly StaticAbility[] {
  const timed = grantedStaticsTimed(state, registry, object, wanted);
  return timed.length === 0 ? [] : timed.map((g) => g.ability);
}

/**
 * The timestamp the effects of `source`'s own static `ability` apply by (rule
 * 613.7a): the source's — or, for a static of a Room's door unlocked on the
 * battlefield (rules 709.5e, f), the time it was unlocked, when the ability
 * began to be the permanent's (`GameObject.doorUnlockedAt`). So "You have no
 * maximum hand size" on a door unlocked after a "your maximum hand size is
 * two" permanent entered applies after it (Steaming Sauna's ruling). With
 * both doors unlocked the left half's statics come first in the Room's list
 * (`roomCard`). Anything else of the source's — a granted static, another
 * card's text box — keeps the source's timestamp here.
 */
export function staticTimestamp(registry: CardRegistry, source: GameObject, ability: StaticAbility): number {
  const at = source.doorUnlockedAt;
  if (at === undefined || source.doors === undefined || source.textFrom !== undefined) return source.timestamp;
  const def = registry.get(rulesTextName(source));
  const index = def.static.indexOf(ability);
  if (index < 0) return source.timestamp;
  let door: "left" | "right";
  if (source.doors.left && source.doors.right) {
    const left = def.faces?.[1];
    if (left === undefined) return source.timestamp;
    door = index < registry.get(left).static.length ? "left" : "right";
  } else {
    door = source.doors.left ? "left" : "right";
  }
  return Math.max(source.timestamp, at[door] ?? source.timestamp);
}

/** A static ability an object has by a grant, with the timestamp its effects
 * take: the later of the object's and the grant's (rule 613.7a). */
interface GrantedStatic {
  readonly ability: StaticAbility;
  readonly timestamp: number;
}

/**
 * {@link grantedStatics} with each one's timestamp: those a `grant-static`
 * gave `object` (`PtModifier.grantsStatic`), then those a battlefield static
 * grants it (`StaticAbility.grantsStatic` — Inspiring Leader, Rune of Might,
 * Sedge Sliver): its scope reaches `object` (as {@link staticReaches}
 * decides) and its condition holds, read for the granting permanent. Either
 * is taken away by a loss of all abilities later than the grant (rule
 * 613.7). Guarded by `staticGrantsInProgress`.
 *
 * `wanted`: a battlefield grant holding nothing the caller reads isn't asked
 * about. The layer fold passes it, since a grant's scope can itself read the
 * fold ("creatures you control with flying have …" — Jubilant Skybonder), and
 * without it each object's fold asks about every other object's grants, nested
 * with no cache, so a board of them takes minutes.
 */
function grantedStaticsTimed(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  wanted?: (granted: StaticAbility) => boolean,
): readonly GrantedStatic[] {
  const fromModifiers = object.modifiers.some((m) => m.grantsStatic !== undefined);
  const granting = object.zone === "battlefield" ? staticGrantSources(state, registry) : NO_STATICS;
  if (!fromModifiers && granting.length === 0) return [];
  const lostAt = abilitiesLostAt(state, registry, object);
  const out: GrantedStatic[] = [];
  if (fromModifiers) {
    for (const m of object.modifiers) {
      if (m.grantsStatic === undefined || !modifierGrantApplies(m, lostAt)) continue;
      const timestamp = Math.max(object.timestamp, m.timestamp ?? object.timestamp);
      for (const ability of m.grantsStatic) out.push({ ability, timestamp });
    }
  }
  if (granting.length > 0 && !staticGrantsInProgress.has(object.id)) {
    staticGrantsInProgress.add(object.id);
    try {
      for (const { source, ability } of granting) {
        if (!grantOutlastsLoss(lostAt, source.timestamp)) continue;
        if (wanted !== undefined && !(ability.grantsStatic ?? []).some(wanted)) continue;
        if (!staticReaches(state, registry, source, ability, object)) continue;
        if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) continue;
        const timestamp = Math.max(object.timestamp, source.timestamp);
        for (const granted of ability.grantsStatic ?? []) out.push({ ability: granted, timestamp });
      }
    } finally {
      staticGrantsInProgress.delete(object.id);
    }
  }
  return out;
}

/**
 * Every battlefield static that grants static abilities
 * (`StaticAbility.grantsStatic`), in battlefield order — what
 * {@link grantedStaticsTimed} matches each object against. Usually none. A
 * permanent that has lost its abilities grants nothing (bar a static with a
 * layer-4 part — rule 613.6), and neither does one whose controller has left
 * the game. Memoized in the active cache region.
 */
function staticGrantSources(state: GameState, registry: CardRegistry): readonly ContributingStatic[] {
  if (!anyStaticGrantSource(state, registry)) return NO_STATICS;
  return computedCacheMemo("staticGrantSources", () => {
    let out: ContributingStatic[] | null = null;
    for (const sourceId of state.zones.shared.battlefield) {
      const source = state.objects[sourceId];
      if (source === undefined || state.players[source.controller]?.hasLost === true) continue;
      const grants = staticsOf(registry, rulesTextName(source)).grantsStatic;
      if (grants.length === 0) continue;
      const lost = hasLostAbilities(state, registry, source);
      for (const ability of grants) {
        if (lost && !staticOutlivesLoss(state, registry, source, ability)) continue;
        (out ??= []).push({ source, ability });
      }
    }
    return out ?? NO_STATICS;
  });
}

/** Whether `object` has the granted ability "If this creature would leave the
 * battlefield, exile it instead of putting it anywhere else" (see
 * `PtModifier.grantsExileIfLeaves`) — not lost to a later loss of all
 * abilities (rule 613.1f). */
export function hasExileIfLeavesAbility(state: GameState, registry: CardRegistry, object: GameObject): boolean {
  if (!object.modifiers.some((m) => m.grantsExileIfLeaves === true)) return false;
  const lostAt = abilitiesLostAt(state, registry, object);
  return object.modifiers.some((m) => m.grantsExileIfLeaves === true && modifierGrantApplies(m, lostAt));
}

/** The timestamp of `object`'s keyword counters of kind `keyword` (rule
 * 613.7c — every counter of a kind takes the newest one's), or the
 * permanent's own for one it entered with. */
export function keywordCounterTimestamp(object: GameObject, keyword: Keyword): number {
  return object.counterTimestamps?.[keyword] ?? object.timestamp;
}

/**
 * Whether a suspected permanent's menace and "This creature can't block"
 * (rule 701.60c) apply to it now. They are abilities it has, added in layer 6
 * as it became suspected, so an effect that removes all its abilities with a
 * later timestamp takes both away — though it stays suspected (the Nelly
 * Borca ruling) — while one from before it was suspected doesn't (rule
 * 613.7). A removal with no timestamp is taken as the later.
 */
export function suspectedGrantsApply(state: GameState, registry: CardRegistry, object: GameObject): boolean {
  const since = object.suspectedAt;
  if (since === undefined) return false;
  const lostAt = abilitiesLostAt(state, registry, object);
  return lostAt === null || lostAt < since;
}

/** Printed subtypes, then its changeling (see {@link withChangeling}) — the
 * subtypes layer 4 starts from. */
function printedSubtypes(registry: CardRegistry, object: GameObject): readonly string[] {
  const def = printedDefinition(registry, object);
  // A text change's land types reach its type line (rule 612.1), in layer 3
  // — before every layer-4 effect.
  const changes = textChangesOf(object);
  const subtypes = changes === undefined ? def.subtypes : changeSubtypes(def.subtypes, changes);
  return withChangeling(def, subtypes, registry.get(rulesTextName(object)));
}

/** The definition layer 4 starts from: its printed one, or — cast bestowed
 * (rule 702.103b, `GameObject.bestowed`) — that card as an Aura
 * enchantment, not a creature, which no layer effect undoes but those
 * that come later. */
function printedDefinition(registry: CardRegistry, object: GameObject): CardDefinition {
  const def = registry.get(printedCardName(object));
  return object.bestowed === true ? bestowedDefinition(def) : def;
}

/**
 * `subtypes` plus {@link EVERY_CREATURE_TYPE} when `def` has changeling (rule
 * 702.73a): a characteristic-defining ability, so it applies first in layer 4
 * (rule 613.3), in every zone (rule 604.3), and is read off the copiable
 * values — a copy of a changeling is every creature type too. Losing its
 * abilities doesn't undo it: that happens in layer 6, after layer 4 (the
 * changeling rulings). Only a creature or a kindred takes it: no other
 * object can have creature types (rules 205.3d, 205.3m) — Crib Swap, a
 * "Kindred Instant — Shapeshifter", is every creature type as a spell.
 * A card's `alsoSubtypes` (Veteran Adventurer's "is also a Cleric, Rogue,
 * Warrior, and Wizard") is the same kind of CDA and joins here too; on a
 * land it's land types (Planar Nexus's "this land is every nonbasic land
 * type" — only a land has them, rule 205.3d).
 */
export function withChangeling(
  def: CardDefinition,
  subtypes: readonly string[],
  /** Where its changeling would be printed: another card, when an exchange
   * of text boxes gave it that card's text (rule 612.5). */
  text: CardDefinition = def,
): readonly string[] {
  if (!def.types.includes("creature") && !def.types.includes("kindred")) {
    return def.types.includes("land") && text.alsoSubtypes !== undefined
      ? union(subtypes, text.alsoSubtypes.filter(isLandType))
      : subtypes;
  }
  // "~ is also a Cleric, Rogue, Warrior, and Wizard" — the same kind of CDA.
  const also = text.alsoSubtypes !== undefined ? union(subtypes, text.alsoSubtypes) : subtypes;
  return text.keywords.includes("changeling") ? union(also, [EVERY_CREATURE_TYPE]) : also;
}

/**
 * A permanent's types and subtypes after layer 4 (rule 613.1d), and which
 * type-granting statics reached it there.
 */
export interface LayerFour {
  readonly types: readonly CardType[];
  readonly subtypes: readonly string[];
  /** The supertypes statics add, over {@link supertypesWithEffects}'s, and
   * those they take away: {@link effectiveSupertypes}. */
  readonly addedSupertypes: readonly Supertype[];
  readonly removedSupertypes: readonly Supertype[];
  /**
   * The statics with a layer-4 part (`addTypes` / `addSubtypes`) that
   * applied to this permanent. Rule 613.6: an effect keeps applying to the
   * same set of objects in its later layers, so the rest of such a static
   * (Bello's keywords and 4/4, Ragost's granted ability) reaches exactly
   * these — see {@link staticReaches}.
   */
  readonly applied: readonly ContributingStatic[];
}

const NO_STATICS: readonly ContributingStatic[] = [];
const NO_SUPERTYPES: readonly Supertype[] = [];

/** One layer-4 step: an object's own modifier, or an external static. */
type LayerFourStep =
  | { readonly key: number; readonly modifier: PtModifier }
  | { readonly key: number; readonly grant: ContributingStatic };

/** The order key of a modifier's layer-4 / 7b part (see
 * `PtModifier.timestamp`): just after a static whose source has the same
 * timestamp, and after every static when it has none. */
/**
 * Reconfigure's "while attached, this isn't a creature" (rule 702.151b): an
 * effect of the attaching, not an ability, so it lasts while the Equipment is
 * still attached to the creature it was reconfigured onto, abilities lost or
 * not, at the timestamp it was attached (613.7). With the creature type go its
 * creature types (205.1a) and its power and toughness (208.3).
 */
function reconfiguredModifier(object: GameObject): PtModifier | null {
  if (object.reconfiguredOnto === undefined || object.attachedTo !== object.reconfiguredOnto) return null;
  const at = object.reconfiguredAt;
  return {
    power: 0,
    toughness: 0,
    keywords: [],
    untilEndOfTurn: false,
    removeTypes: ["creature"],
    ...(at !== undefined ? { timestamp: at } : {}),
  };
}

/**
 * A Licid's "becomes an Aura enchantment with enchant creature"
 * (`GameObject.licid`): an enchantment, no longer a creature (and so none of
 * its creature types, 205.1a), with the subtype Aura, at the timestamp its
 * ability resolved (613.7) — until the effect is ended or it leaves.
 */
function licidModifier(object: GameObject): PtModifier | null {
  if (object.licid === undefined) return null;
  return {
    power: 0,
    toughness: 0,
    keywords: [],
    untilEndOfTurn: false,
    setTypes: ["enchantment"],
    addSubtypes: ["Aura"],
    timestamp: object.licid.at,
  };
}

/**
 * Necromancy's "it becomes an Aura with 'enchant creature put onto the
 * battlefield with Necromancy'", Cloudform's "with enchant creature"
 * (`GameObject.enchantSwap`'s `becameAura`): the subtype Aura, at the timestamp its ability resolved
 * (613.7), for as long as it stays on the battlefield.
 */
function becameAuraModifier(object: GameObject): PtModifier | null {
  const swap = object.enchantSwap;
  if (swap?.becameAura !== true) return null;
  return {
    power: 0,
    toughness: 0,
    keywords: [],
    untilEndOfTurn: false,
    addSubtypes: ["Aura"],
    timestamp: swap.at,
  };
}

/** The object's layer-4 modifiers, reconfigure's, a Licid's and a
 * Necromancy's among them, in timestamp order. */
function typeModifiers(object: GameObject): readonly PtModifier[] {
  const reconfigured = reconfiguredModifier(object);
  const licid = licidModifier(object);
  const becameAura = becameAuraModifier(object);
  if (reconfigured === null && licid === null && becameAura === null) return object.modifiers;
  const extra = [reconfigured, licid, becameAura].filter((m): m is PtModifier => m !== null);
  return [...object.modifiers, ...extra].sort((a, b) => modifierKey(a) - modifierKey(b));
}

function modifierKey(modifier: PtModifier): number {
  return modifier.timestamp !== undefined ? modifier.timestamp + 0.5 : Infinity;
}

function applyModifierTypes(
  modifier: PtModifier,
  types: CardType[] | readonly CardType[],
  subtypes: readonly string[],
): { types: readonly CardType[]; subtypes: readonly string[] } {
  let t = types;
  let st = subtypes;
  if (modifier.setTypes) {
    // Rule 205.1a: a subtype tied only to card types it no longer has goes too.
    const set = [...modifier.setTypes];
    t = set;
    st = st.filter((s) => subtypeFitsTypes(s, set));
  }
  if (modifier.removeTypes) {
    const removed = modifier.removeTypes;
    const kept = t.filter((x) => !removed.includes(x));
    t = kept;
    st = st.filter((s) => subtypeFitsTypes(s, kept));
  }
  if (modifier.removeSubtypes) {
    const removed = modifier.removeSubtypes;
    st = st.filter((s) => !removed.includes(s));
  }
  if (modifier.setSubtypes) {
    // Rule 205.1a: the new subtypes replace the existing ones of their own
    // kind — creature types for creature types — and the rest stay.
    const kinds = new Set(modifier.setSubtypes.map(subtypeKind));
    st = [...st.filter((s) => !kinds.has(subtypeKind(s))), ...modifier.setSubtypes];
  }
  if (modifier.loseLandTypes) st = st.filter((s) => s !== EVERY_LAND_TYPE && !isLandType(s));
  if (modifier.loseCreatureTypes) st = st.filter((s) => subtypeKind(s) !== "creature");
  if (modifier.addTypes && modifier.addTypes.length > 0) t = union(t, modifier.addTypes);
  if (modifier.addSubtypes && modifier.addSubtypes.length > 0) {
    // A copy exception's subtypes are fixed with the copiable values (rule
    // 707.9b), and an object can't gain a subtype that doesn't go with one of
    // its types (205.3d): a Glasspool Mimic that copied something that's
    // only temporarily a creature isn't a Shapeshifter Rogue, even once it
    // becomes a creature later (its ruling).
    const added =
      modifier.copiable === true ? modifier.addSubtypes.filter((s) => subtypeFitsTypes(s, t)) : modifier.addSubtypes;
    if (added.length > 0) st = union(st, added);
  }
  return { types: t, subtypes: st };
}

function union<T>(a: readonly T[], b: readonly T[]): readonly T[] {
  let out: T[] | null = null;
  for (const x of b) {
    if ((out ?? a).includes(x)) continue;
    out ??= [...a];
    out.push(x);
  }
  return out ?? a;
}

/**
 * Layer 4 for one object: printed types and subtypes (subtypes after layer
 * 3), then every type-changing effect in timestamp order (rule 613.7) — the
 * object's own modifiers (an `become`, amass's "it's also a Zombie", Turn to
 * Frog's "becomes a Frog") and, on the battlefield, every static with an
 * `addTypes` / `addSubtypes` part whose scope reaches it (Kudo's Bears,
 * Ragost's Foods, Bello's creatures).
 *
 * Each static's scope is matched against the types folded so far plus what
 * earlier passes added, which approximates dependency order (rule 613.8) for
 * these additive effects — see `foldLayerFour`. See `layer4InProgress` for
 * why this can't loop.
 */
export function layerFour(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
): LayerFour {
  if (object.zone !== "battlefield") return outsideLayerFour(state, registry, object);
  const sources =
    object.zone === "battlefield" && !layer4InProgress.has(object.id)
      ? typeGrantSources(state, registry)
      : NO_STATICS;
  if (sources.length === 0) return ownLayerFour(registry, object);
  if (activeCache !== null && !guardActive()) {
    const hit = activeCache.layer4.get(object.id);
    if (hit !== undefined) {
      if (cacheCheck) assertSameLayerFour(hit, foldLayerFour(state, registry, object, sources), object.id);
      return hit;
    }
    const value = foldLayerFour(state, registry, object, sources);
    activeCache.layer4.set(object.id, value);
    return value;
  }
  return foldLayerFour(state, registry, object, sources);
}

/** Every battlefield static with a `outsideBattlefield` part, in
 * battlefield order — usually none. As {@link typeGrantSources} has it, one
 * that has lost its abilities still applies here, layer 6 coming after layer 4. */
function outsideTypeSources(state: GameState, registry: CardRegistry): readonly ContributingStatic[] {
  const memo = activeCache?.misc.get(OUTSIDE_TYPE_SOURCES);
  if (memo !== undefined) return memo as readonly ContributingStatic[];
  let out: ContributingStatic[] | null = null;
  for (const sourceId of state.zones.shared.battlefield) {
    const source = state.objects[sourceId];
    const statics = staticsOf(registry, rulesTextName(source)).outside;
    if (statics.length === 0 || state.players[source.controller]?.hasLost === true) continue;
    for (const ability of statics) (out ??= []).push({ source, ability });
  }
  const result = out ?? NO_STATICS;
  activeCache?.misc.set(OUTSIDE_TYPE_SOURCES, result);
  return result;
}
const OUTSIDE_TYPE_SOURCES = "outside-type-sources";

/** Whether card or spell `id`, off the battlefield, has `keyword` from an
 * `outsideBattlefield` static ("creature cards you own that aren't on the
 * battlefield have flash" — Teferi, Mage of Zhalfir). What a cast's timing
 * asks beside the card's printed keywords; folds the card only when some
 * static on the battlefield grants that keyword. */
export function hasKeywordOffBattlefield(state: GameState, registry: CardRegistry, id: ObjectId, keyword: Keyword): boolean {
  const object = state.objects[id];
  if (object === undefined || object.kind !== "card" || object.zone === "battlefield") return false;
  if (!outsideTypeSources(state, registry).some(({ ability }) => ability.outsideBattlefield!.keywords?.includes(keyword) === true)) {
    return false;
  }
  return computeCharacteristics(state, registry, id).keywords.has(keyword);
}

/** What this card's own text makes of it off the battlefield (see
 * `StaticAbility.selfOutsideBattlefield`), if it says anything. */
function selfOutsideBattlefield(
  registry: CardRegistry,
  object: GameObject,
): StaticAbility["selfOutsideBattlefield"] {
  if (object.kind !== "card" || object.zone === "battlefield" || object.zone === "phased-out") return undefined;
  if (object.faceDown !== undefined || object.foretold === true || object.exiledFaceDown !== undefined) return undefined;
  return staticsOf(registry, rulesTextName(object)).selfOutside[0]?.selfOutsideBattlefield;
}

/** Whether a static's `outsideBattlefield` reaches `object`, a card or a
 * spell off the battlefield whose card types as they stand without it are
 * `types`: yours (a spell's controller, a card's owner) unless it says
 * `whose: "all"`, of its card types, in its zones. */
function outsideReaches(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  ability: StaticAbility,
  object: GameObject,
  types: readonly CardType[],
): boolean {
  const grant = ability.outsideBattlefield!;
  if (grant.whose !== "all" && (object.zone === "stack" ? object.controller : object.owner) !== source.controller) return false;
  if (grant.ofType !== undefined && !grant.ofType.some((t) => types.includes(t))) return false;
  if (grant.notType !== undefined && types.includes(grant.notType)) return false;
  if (grant.zones !== undefined && !(grant.zones as readonly string[]).includes(object.zone)) return false;
  return ability.condition === undefined || staticConditionMet(state, registry, source, ability.condition);
}

/**
 * Layer 4 for an object off the battlefield: its own, then each
 * `outsideBattlefield` static that reaches it, in timestamp order (rule
 * 613.7) — a card its controller owns, a spell they control. The grants only
 * read its card type as it stands without them, so nothing here can loop. A
 * face-down card has no types to add to (rule 708.2), and an ability on the
 * stack is no card or spell.
 */
function outsideLayerFour(state: GameState, registry: CardRegistry, object: GameObject): LayerFour {
  const printed = ownLayerFour(registry, object);
  const self = selfOutsideBattlefield(registry, object);
  const own =
    self === undefined
      ? printed
      : { ...printed, types: union(printed.types, self.addTypes), subtypes: union(printed.subtypes, self.addSubtypes) };
  const sources = outsideTypeSources(state, registry);
  if (sources.length === 0) return own;
  if (object.kind !== "card" || object.faceDown !== undefined || object.foretold === true) return own;
  if (object.exiledFaceDown !== undefined) return own;
  let { types, subtypes } = own;
  let addedSupertypes = NO_SUPERTYPES;
  const ordered = sources.length === 1 ? sources : [...sources].sort((a, b) => a.source.timestamp - b.source.timestamp);
  for (const { source, ability } of ordered) {
    const grant = ability.outsideBattlefield!;
    if (!outsideReaches(state, registry, source, ability, object, own.types)) continue;
    if (grant.addTypes !== undefined) types = union(types, grant.addTypes);
    if (grant.addSubtypes !== undefined) subtypes = union(subtypes, grant.addSubtypes);
    if (grant.addSupertypes !== undefined) addedSupertypes = union(addedSupertypes, grant.addSupertypes);
    const chosen = source.chosenCreatureType;
    if (typeof chosen !== "string" || !isCreatureType(chosen)) continue;
    if (grant.addsChosenCreatureType === true) subtypes = union(subtypes, [chosen]);
    if (grant.setsChosenCreatureType === true) {
      subtypes = [...subtypes.filter((s) => subtypeKind(s) !== "creature"), chosen];
    }
  }
  return { types, subtypes, addedSupertypes, removedSupertypes: NO_SUPERTYPES, applied: NO_STATICS };
}

/** Layer 4 from the object's own modifiers alone — everything there was
 * before statics could grant types, and still the whole answer whenever no
 * type-granting static is on the battlefield. */
function ownLayerFour(registry: CardRegistry, object: GameObject): LayerFour {
  const printedTypes: readonly CardType[] = printedDefinition(registry, object).types;
  const printedSubs = printedSubtypes(registry, object);
  let types = printedTypes;
  let subtypes = printedSubs;
  for (const modifier of typeModifiers(object)) {
    ({ types, subtypes } = applyModifierTypes(modifier, types, subtypes));
  }
  if (types !== printedTypes || subtypes !== printedSubs) subtypes = subtypesFitting(subtypes, types);
  return { types, subtypes, addedSupertypes: NO_SUPERTYPES, removedSupertypes: NO_SUPERTYPES, applied: NO_STATICS };
}

/**
 * The subtypes an object has once every layer-4 effect has applied: only
 * those that go with a card type it has now (rule 205.3d — "An object can't
 * gain a subtype that doesn't correspond to one of that object's types").
 * An effect that gave a creature a creature type keeps applying after the
 * permanent stops being a creature, but gives it nothing until it's one
 * again (Archangel Elspeth's ruling: "it will also stop being an Angel until
 * it becomes a creature again") — so this is asked of the fold's end, not of
 * each effect as it applies. The same array when everything fits.
 */
function subtypesFitting(subtypes: readonly string[], types: readonly CardType[]): readonly string[] {
  for (const subtype of subtypes) {
    if (!subtypeFitsTypes(subtype, types)) return subtypes.filter((s) => subtypeFitsTypes(s, types));
  }
  return subtypes;
}

/**
 * The fold itself. Timestamp order alone gets dependency wrong in the common
 * case: Kudo's "other creatures are Bears" depends on anything that makes a
 * permanent a creature (rule 613.8a), so a Mishra's Factory animated after
 * Kudo arrived is still a Bear. Every layer-4 effect here only *adds* types
 * (bar a `setSubtypes`, a modifier's or a static's), so the fold is repeated with each scope
 * matched against the types it has so far *plus* everything the previous
 * pass added, until which statics apply stops changing — the dependency
 * order for additive effects. A pair that depend on each other (a loop,
 * 613.8k) settles in timestamp order, and the pass count is bounded.
 *
 * Supertypes are read differently. A scope can ask for what *lacks* one (Blood
 * Moon's "nonbasic lands"), and an effect that adds it changes what such a
 * scope applies to (Rootpath Purifier's ruling), so it depends on that effect
 * whatever their timestamps (rule 613.8a). So after the first pass every scope
 * sees the supertypes the pass before ended with, rather than those so far.
 */
interface LayerFourSeen {
  readonly types: readonly CardType[];
  readonly subtypes: readonly string[];
  readonly supertypes: readonly Supertype[];
}

function foldLayerFour(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  sources: readonly ContributingStatic[],
): LayerFour {
  const steps: LayerFourStep[] = [];
  for (const grant of sources) steps.push({ key: grant.source.timestamp, grant });
  for (const modifier of typeModifiers(object)) steps.push({ key: modifierKey(modifier), modifier });
  steps.sort((a, b) => a.key - b.key);
  layer4InProgress.add(object.id);
  try {
    let { four: result, seen } = foldLayerFourOnce(state, registry, object, steps, null);
    for (let pass = 0; pass < sources.length; pass += 1) {
      // Every type any pass has had at any point, not just where it ended: a
      // dependent setter's own change can hide what it depended on (Glaciers
      // made a Mountain a Plains), which would undo it on the next pass.
      const next = foldLayerFourOnce(state, registry, object, steps, seen);
      seen = {
        types: union(seen.types, next.seen.types),
        subtypes: union(seen.subtypes, next.seen.subtypes),
        supertypes: next.seen.supertypes,
      };
      const settled =
        next.four.applied.length === result.applied.length &&
        next.four.applied.every((a, i) => a === result.applied[i]);
      result = next.four;
      if (settled) break;
    }
    return result;
  } finally {
    layer4InProgress.delete(object.id);
  }
}

function foldLayerFourOnce(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  steps: readonly LayerFourStep[],
  /** Every type and subtype earlier passes had at any point, and the
   * supertypes the last pass ended with. */
  previous: LayerFourSeen | null,
): { four: LayerFour; seen: LayerFourSeen } {
  let types: readonly CardType[] = printedDefinition(registry, object).types;
  let subtypes = printedSubtypes(registry, object);
  let seenTypes = types;
  let seenSubtypes = subtypes;
  const baseSupertypes = supertypesWithEffects(registry, object);
  // Printed and copied, then every effect in timestamp order (rule 613.7).
  let supertypes = supertypesOf(registry, object);
  const applied: ContributingStatic[] = [];
  // Statics that reach `object` only through what a later step gives it
  // (Glaciers' "all Mountains are Plains" over a Forest a later effect made a
  // Mountain): each depends on that step (rule 613.8a) and applies after it —
  // after every step, in timestamp order among themselves, matched then
  // against the types as they are by that point.
  const deferred: ContributingStatic[] = [];
  const apply = (grant: ContributingStatic): void => {
    const { source, ability } = grant;
    if (
      ability.condition !== undefined &&
      !staticConditionMet(state, registry, source, ability.condition)
    ) {
      return;
    }
    if (ability.setTypes !== undefined || ability.removeTypes !== undefined) {
      // Arixmethes' "it's a land (it's not a creature)", a God's "isn't a
      // creature": the types replaced or taken away, and with them every
      // subtype that went only with a lost type (rule 205.1a — no God, no
      // Kraken). Supertypes aren't card types, and stay.
      const removed = ability.removeTypes ?? [];
      const kept = (ability.setTypes ?? types).filter((t) => !removed.includes(t));
      types = kept;
      subtypes = subtypes.filter((s) => subtypeFitsTypes(s, kept));
    }
    if (ability.addTypes !== undefined) types = union(types, ability.addTypes);
    if (ability.setSubtypes !== undefined) {
      // Rule 205.1a: they replace the existing subtypes of their own kind —
      // Goddric's "is a Dragon" takes every creature type — and the rest stay.
      const set = ability.setSubtypes;
      const kinds = new Set(set.map(subtypeKind));
      subtypes = [...subtypes.filter((s) => !kinds.has(subtypeKind(s))), ...set];
    }
    if (ability.removeSubtypes !== undefined) {
      const removed = ability.removeSubtypes;
      subtypes = subtypes.filter((s) => !removed.includes(s));
    }
    // Curse of Conformity's "lose all creature types" (205.1a).
    if (ability.loseCreatureTypes === true) subtypes = subtypes.filter((s) => subtypeKind(s) !== "creature");
    // Lithoform Blight's "loses all land types" (305.7).
    if (ability.loseLandTypes === true) subtypes = subtypes.filter((s) => s !== EVERY_LAND_TYPE && !isLandType(s));
    if (ability.setsChosenLandType === true) {
      // Convincing Mirage's "enchanted land is the chosen type": its
      // source's choice as it entered, replacing every land type (205.1a).
      const chosen = source.chosenOnEnter;
      if (typeof chosen !== "string" || !isBasicLandType(chosen)) return;
      subtypes = [...subtypes.filter((s) => s !== EVERY_LAND_TYPE && !isLandType(s)), chosen];
    }
    if (ability.addsChosenLandType === true) {
      // Thran Portal's "is the chosen type in addition to its other types".
      const chosen = source.chosenOnEnter;
      if (typeof chosen === "string" && isBasicLandType(chosen)) subtypes = union(subtypes, [chosen]);
    }
    if (ability.addSubtypes !== undefined) subtypes = union(subtypes, ability.addSubtypes);
    supertypes = patchedSupertypes(ability, supertypes);
    if (ability.addsChosenCreatureType === true) {
      // Titan of Littjara's "is the chosen type in addition": its source's
      // choice, a creature type (`chooseCreatureTypeOnEnter`).
      const chosen = source.chosenCreatureType;
      if (typeof chosen === "string" && isCreatureType(chosen)) subtypes = union(subtypes, [chosen]);
    }
    if (ability.setsChosenCreatureType === true) {
      // Conspiracy's "are the chosen type": every other creature type goes (205.1a).
      const chosen = source.chosenCreatureType;
      if (typeof chosen === "string" && isCreatureType(chosen)) {
        subtypes = [...subtypes.filter((s) => subtypeKind(s) !== "creature"), chosen];
      }
    }
    if (ability.takesLastExiledCard !== undefined) {
      // Duplicant: the last exiled creature card's creature types, in place
      // of its own (205.1a) — "it's still a Shapeshifter".
      const card = lastExiledCard(state, registry, source, ability.takesLastExiledCard.filter);
      if (card !== undefined) {
        const taken = layerFour(state, registry, state.objects[card]!).subtypes.filter((s) => subtypeKind(s) === "creature");
        subtypes = union(
          [...subtypes.filter((s) => subtypeKind(s) !== "creature"), ...taken],
          ability.takesLastExiledCard.keepCreatureTypes ?? [],
        );
      }
    }
    applied.push(grant);
  };
  const see = (): void => {
    seenTypes = union(seenTypes, types);
    seenSubtypes = union(seenSubtypes, subtypes);
  };
  const supertypesSeen = (): readonly Supertype[] =>
    previous !== null ? previous.supertypes : supertypes;
  for (const step of steps) {
    if ("modifier" in step) {
      ({ types, subtypes } = applyModifierTypes(step.modifier, types, subtypes));
      if (step.modifier.copiable !== true) supertypes = patchedSupertypes(step.modifier, supertypes);
      see();
      continue;
    }
    const { source, ability } = step.grant;
    const now = { types, subtypes, supertypes: supertypesSeen(), inFold: true };
    if (staticAffects(state, registry, ability.affects, source, object, now)) {
      apply(step.grant);
      see();
      continue;
    }
    if (previous === null) continue;
    const later = {
      types: union(types, previous.types),
      subtypes: union(subtypes, previous.subtypes),
      supertypes: supertypesSeen(),
      inFold: true,
    };
    if (staticAffects(state, registry, ability.affects, source, object, later)) deferred.push(step.grant);
  }
  for (const grant of deferred) {
    const view = { types, subtypes, supertypes: supertypesSeen(), inFold: true };
    if (staticAffects(state, registry, grant.ability.affects, grant.source, object, view)) {
      apply(grant);
      see();
    }
  }
  return {
    four: {
      types,
      subtypes: subtypesFitting(subtypes, types),
      addedSupertypes: supertypes.filter((s) => !baseSupertypes.includes(s)),
      removedSupertypes: baseSupertypes.filter((s) => !supertypes.includes(s)),
      applied,
    },
    seen: { types: seenTypes, subtypes: seenSubtypes, supertypes },
  };
}

/** Throw if a cached {@link LayerFour} diverges from a fresh fold — the
 * {@link setComputedCacheCheck} self-check for the layer-4 cache. */
function assertSameLayerFour(cached: LayerFour, fresh: LayerFour, id: ObjectId): void {
  const show = (l: LayerFour): string =>
    JSON.stringify({
      types: [...l.types].sort(),
      subtypes: [...l.subtypes].sort(),
      addedSupertypes: [...l.addedSupertypes].sort(),
      removedSupertypes: [...l.removedSupertypes].sort(),
      applied: l.applied.map((a) => `${a.source.id}:${a.ability.text}`),
    });
  const a = show(cached);
  const b = show(fresh);
  if (a !== b) {
    throw new Error(
      `computed-cache divergence (layer 4) for ${id}: cached ${a} vs fresh ${b} — a mutation inside a cache region is missing an invalidateComputedCache() call`,
    );
  }
}

/** Whether a static changes types in layer 4 — and so fixes, there, which
 * permanents the rest of it applies to (rule 613.6). */
export function hasLayerFourPart(ability: StaticAbility): boolean {
  return (
    ability.addTypes !== undefined ||
    ability.addSubtypes !== undefined ||
    ability.addSupertypes !== undefined ||
    ability.removeSupertypes !== undefined ||
    ability.setSubtypes !== undefined ||
    ability.removeSubtypes !== undefined ||
    ability.setTypes !== undefined ||
    ability.removeTypes !== undefined ||
    ability.loseLandTypes === true ||
    ability.loseCreatureTypes === true ||
    ability.addsChosenCreatureType === true ||
    ability.setsChosenCreatureType === true ||
    ability.setsChosenLandType === true ||
    ability.addsChosenLandType === true ||
    ability.takesLastExiledCard !== undefined
  );
}

/**
 * Every battlefield static with a layer-4 part, in battlefield order —
 * usually none, and then {@link layerFour} is exactly the old self-contained
 * read. Memoized in the active cache region like
 * {@link contributingStaticSources}.
 */
function typeGrantSources(
  state: GameState,
  registry: CardRegistry,
): readonly ContributingStatic[] {
  if (activeCache !== null && activeCache.typeSources !== null) return activeCache.typeSources;
  const result = boardScan("type", state, registry, scanTypeGrantSources);
  if (activeCache !== null) activeCache.typeSources = result;
  return result;
}

function scanTypeGrantSources(state: GameState, registry: CardRegistry): readonly ContributingStatic[] {
  let out: ContributingStatic[] | null = null;
  for (const sourceId of state.zones.shared.battlefield) {
    const source = state.objects[sourceId];
    const layer4 = staticsOf(registry, rulesTextName(source)).layer4;
    if (layer4.length === 0) continue;
    // As in `contributingStaticSources`: a permanent whose controller has
    // left the game grants nothing. One that has lost its abilities still
    // does here: that loss is a layer-6 effect, and layer 4 comes first
    // (rule 613.1d, 613.1f), so the ability is still there to apply — and
    // having started to apply, it keeps applying in the later layers
    // (rule 613.6; Goddric, Cloaked Reveler's ruling).
    if (state.players[source.controller]?.hasLost === true) continue;
    for (const ability of layer4) (out ??= []).push({ source, ability });
  }
  return out === null ? NO_STATICS : withoutTextLostSources(state, registry, out);
}

/** The three whole-board lists of statics, which every characteristics read
 * asks for: {@link typeGrantSources}, {@link contributingStaticSources} and
 * {@link abilityGrantSources}. */
type BoardScanKind = "type" | "contributing" | "abilityGrant";

/** The last answer of each board scan, and what it was for; `hits` is how
 * often it has been served. */
const boardScanMemos: Record<
  BoardScanKind,
  {
    readonly state: GameState;
    readonly registry: CardRegistry;
    readonly epoch: number;
    readonly value: readonly ContributingStatic[];
    hits: number;
  } | null
> = { type: null, contributing: null, abilityGrant: null };
let boardScanHits = 0;
/** Under the cache check, a hit in this many is recomputed beside each
 * epoch's first (as `STATIC_LOSSES_CHECK_EVERY`, and for its reason). */
const BOARD_SCAN_CHECK_EVERY = 16;

/**
 * One of the board scans, kept per mutation as {@link staticAbilityLosses}
 * is, region or not. A region keeps each list already, but most reads come
 * outside one (`moveObject`, combat damage, the journal's snapshots, what a
 * bot's stand-in reads), where every `layerFour` of every permanent walked the
 * whole battlefield again: 20% of a bot's simulation on a wide board (the bot
 * audit's S6, 2026-11-10). The key is the state itself, since a bot's copies
 * share object ids, and the epoch every {@link invalidateComputedCache}
 * moves. Asked from inside a guard, the scan's reads are conservative:
 * answered, never kept, and nothing kept is served.
 */
function boardScan(
  kind: BoardScanKind,
  state: GameState,
  registry: CardRegistry,
  scan: (state: GameState, registry: CardRegistry) => readonly ContributingStatic[],
): readonly ContributingStatic[] {
  if (guardActive()) return scan(state, registry);
  const memo = boardScanMemos[kind];
  if (memo !== null && memo.state === state && memo.registry === registry && memo.epoch === mutationEpoch) {
    boardScanHits += 1;
    if (
      cacheCheck &&
      (memo.hits === 0 || boardScanHits % BOARD_SCAN_CHECK_EVERY === 0) &&
      !sameSources(memo.value, scan(state, registry))
    ) {
      throw new Error(`computed-cache divergence (${kind} sources): a mutation is missing an invalidateComputedCache() call`);
    }
    memo.hits += 1;
    return memo.value;
  }
  const value = scan(state, registry);
  boardScanMemos[kind] = { state, registry, epoch: mutationEpoch, value, hits: 0 };
  return value;
}

function sameSources(a: readonly ContributingStatic[], b: readonly ContributingStatic[]): boolean {
  return (
    a.length === b.length &&
    a.every((x, i) => x.source === b[i].source && x.ability === b[i].ability && x.timestamp === b[i].timestamp)
  );
}

/**
 * `sources` less the statics of a land whose rules text a land-type setter
 * takes away (rule 305.7): Urborg, Tomb of Yawgmoth under Blood Moon is a
 * Mountain with no ability, so no land is a Swamp. Its static depends on the
 * setter's effect, which changes whether it exists (rule 613.8a), so the
 * setter applies first whatever their timestamps — and a setter itself
 * always applies (two that reach each other settle in timestamp order, rule
 * 613.8b, which their fold already does). A land's own modifier that set its
 * land types does the same. Which lands a setter reaches is matched against
 * their types before any static (their printed types and own modifiers).
 */
function withoutTextLostSources(
  state: GameState,
  registry: CardRegistry,
  sources: readonly ContributingStatic[],
): readonly ContributingStatic[] {
  const setters = sources.filter(
    (s) =>
      setsBasicLandType(s.ability) &&
      (s.ability.setsChosenLandType !== true || isBasicLandType(String(s.source.chosenOnEnter))),
  );
  if (setters.length === 0 && !sources.some((s) => s.source.modifiers.some(modifierSetsBasicLandType))) return sources;
  const textLost = new Map<ObjectId, boolean>();
  const lost = (source: GameObject): boolean => {
    const known = textLost.get(source.id);
    if (known !== undefined) return known;
    const own = ownLayerFour(registry, source);
    let view: TargetView = { types: own.types, subtypes: own.subtypes, supertypes: supertypesOf(registry, source), inFold: true };
    // Asked before any static applies, but a nonbasic land a static makes
    // basic is out of a "nonbasic lands" setter's reach (rule 613.8a): Rootpath
    // Purifier's ruling, and its lands keep their text under Blood Moon.
    for (const grant of sources) {
      if (grant.ability.addSupertypes === undefined) continue;
      if (!staticAffects(state, registry, grant.ability.affects, grant.source, source, view)) continue;
      if (grant.ability.condition !== undefined && !staticConditionMet(state, registry, grant.source, grant.ability.condition)) continue;
      view = { ...view, supertypes: union(view.supertypes ?? NO_SUPERTYPES, grant.ability.addSupertypes) };
    }
    const value =
      (own.types.includes("land") && source.modifiers.some(modifierSetsBasicLandType)) ||
      setters.some(
        (setter) =>
          setter.source.id !== source.id &&
          (own.types.includes("land") || setter.ability.setTypes?.includes("land") === true) &&
          staticAffects(state, registry, setter.ability.affects, setter.source, source, view) &&
          (setter.ability.condition === undefined ||
            staticConditionMet(state, registry, setter.source, setter.ability.condition)),
      );
    textLost.set(source.id, value);
    return value;
  };
  const kept = sources.filter((s) => setsBasicLandType(s.ability) || !lost(s.source));
  return kept.length === sources.length ? sources : kept;
}

/**
 * A permanent's current subtypes: printed → layer 3 (text substitution) →
 * layer 4 (its own `setSubtypes` / `addSubtypes` modifiers and every
 * subtype-granting static, in timestamp order — see {@link layerFour}).
 */
export function effectiveSubtypes(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
): readonly string[] {
  return layerFour(state, registry, object).subtypes;
}

/**
 * A permanent's current card types: printed → layer 4 (an `become` — a
 * man-land becoming a creature — and every type-granting static; see
 * {@link layerFour}). Answers without the rest of the layer fold, which is
 * what lets `matchesFilter` ask a type question without recursing into
 * {@link computeCharacteristics}.
 */
export function effectiveTypes(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
): readonly CardType[] {
  return layerFour(state, registry, object).types;
}

/**
 * An object's current supertypes: {@link supertypesOf} (printed, and what a
 * copy makes of them) and what layer 4's statics add (rule 613.1d). Adding
 * one leaves its others alone (rule 205.4b), and a static adds nothing to a
 * copy of the permanent, not being a copiable value.
 */
export function effectiveSupertypes(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
): readonly Supertype[] {
  const base = supertypesWithEffects(registry, object);
  const { addedSupertypes: added, removedSupertypes: removed } = layerFour(state, registry, object);
  const withAdded = added.length === 0 ? base : union(base, added);
  return removed.length === 0 ? withAdded : withAdded.filter((s) => !removed.includes(s));
}

/** `current` with what `patch` adds and takes away (rule 205.4). */
function patchedSupertypes(
  patch: { readonly addSupertypes?: readonly Supertype[]; readonly removeSupertypes?: readonly Supertype[] },
  current: readonly Supertype[],
): readonly Supertype[] {
  const added = patch.addSupertypes === undefined ? current : union(current, patch.addSupertypes);
  const removed = patch.removeSupertypes;
  return removed === undefined ? added : added.filter((s) => !removed.includes(s));
}

/** The card types `name`'s copiable values have, its printed ones and then
 * each copiable modifier's (rule 707.2): what an exception conditional on
 * what's copied reads. */
export function copiableTypesOf(
  registry: CardRegistry,
  name: string,
  modifiers: readonly PtModifier[],
): readonly CardType[] {
  let types: readonly CardType[] = registry.get(name).types;
  for (const modifier of modifiers) {
    if (modifier.copiable === true) ({ types } = applyModifierTypes(modifier, types, []));
  }
  return types;
}

/** The keywords printed as abilities (`keywordOf`) that copiable values have:
 * `name`'s, what its copiable modifiers add, less what they take. */
export function copiableKeywordAbilities(
  registry: CardRegistry,
  name: string,
  modifiers: readonly PtModifier[],
): readonly KeywordAbilityName[] {
  const def = registry.get(name);
  const out = new Set<KeywordAbilityName>();
  const add = (keyword: KeywordAbilityName | undefined): void => {
    if (keyword !== undefined) out.add(keyword);
  };
  for (const ability of def.triggered) add(ability.keywordOf);
  for (const ability of def.static) add(ability.keywordOf);
  for (const modifier of modifiers) {
    if (modifier.copiable !== true) continue;
    for (const ability of modifier.grantsTriggered ?? []) add(ability.keywordOf);
    for (const ability of modifier.grantsStatic ?? []) add(ability.keywordOf);
    for (const keyword of modifier.loseKeywordAbilities ?? []) out.delete(keyword);
  }
  return [...out];
}

/** `supertypesOf`, and an effect's "it becomes a legendary …" (Awakening of
 * Vitu-Ghazi), which isn't copiable. */
function supertypesWithEffects(registry: CardRegistry, object: GameObject): readonly Supertype[] {
  let out = supertypesOf(registry, object);
  for (const m of object.modifiers) if (m.copiable !== true) out = patchedSupertypes(m, out);
  return out;
}

/** Objects whose layer 5 is being folded — a colour static's scope or
 * condition that asks about colours again reads the object without statics
 * rather than looping (as `layer4InProgress` does for layer 4). */
const layer5InProgress = new Set<ObjectId>();

/** The `outsideBattlefield` statics with a colour part, in timestamp order. */
function orderedOutsideColors(state: GameState, registry: CardRegistry): readonly ContributingStatic[] {
  const sources = outsideTypeSources(state, registry);
  if (sources.length === 0) return sources;
  return sources
    .filter((s) => s.ability.outsideBattlefield!.setColors !== undefined || s.ability.outsideBattlefield!.addColors !== undefined)
    .sort((a, b) => a.source.timestamp - b.source.timestamp);
}

/** A permanent's current colours: printed → layer 5 (`setColors` replaces,
 * `addColors` unions), in timestamp order (rule 613.7) — its own modifiers
 * and, on the battlefield, every static with a `setColors` whose scope
 * reaches it (a Zendikon's "enchanted land is a 3/3 black Ooze creature").
 * `state` is what finds those statics; without it only the modifiers apply. */
export function effectiveColors(
  state: GameState | null,
  registry: CardRegistry,
  object: GameObject,
): Set<Color> {
  let colors = new Set<Color>(registry.get(printedCardName(object)).colors);
  if (state !== null && object.zone !== "battlefield" && object.zone !== "phased-out" && object.kind === "card") {
    for (const { source, ability } of orderedOutsideColors(state, registry)) {
      if (object.faceDown !== undefined || object.foretold === true || object.exiledFaceDown !== undefined) break;
      if (!outsideReaches(state, registry, source, ability, object, ownLayerFour(registry, object).types)) continue;
      const grant = ability.outsideBattlefield!;
      if (grant.setColors !== undefined) colors = new Set(grant.setColors);
      if (grant.addColors !== undefined) for (const c of grant.addColors) colors.add(c);
    }
  }
  const sources =
    state !== null && object.zone === "battlefield" && !layer5InProgress.has(object.id)
      ? colorSetSources(state, registry)
      : NO_STATICS;
  if (sources.length === 0) {
    for (const m of object.modifiers) {
      if (m.setColors) colors = new Set(m.setColors);
      if (m.addColors) for (const c of m.addColors) colors.add(c);
    }
    return colors;
  }
  const steps: LayerFourStep[] = [];
  for (const grant of sources) steps.push({ key: grant.source.timestamp, grant });
  for (const modifier of object.modifiers) steps.push({ key: modifierKey(modifier), modifier });
  steps.sort((a, b) => a.key - b.key);
  layer5InProgress.add(object.id);
  try {
    for (const step of steps) {
      if ("modifier" in step) {
        if (step.modifier.setColors) colors = new Set(step.modifier.setColors);
        if (step.modifier.addColors) for (const c of step.modifier.addColors) colors.add(c);
        continue;
      }
      const { source, ability } = step.grant;
      if (!staticAffects(state!, registry, ability.affects, source, object)) continue;
      if (ability.condition !== undefined && !staticConditionMet(state!, registry, source, ability.condition)) continue;
      if (ability.setColors !== undefined) colors = new Set(ability.setColors);
      if (ability.setsChosenColor === true) {
        // Alloy Golem: its own choice as it entered, once there is one.
        const chosen = source.chosenOnEnter;
        if (typeof chosen === "string" && (COLORS as readonly string[]).includes(chosen)) colors = new Set([chosen as Color]);
      }
      if (ability.addColors !== undefined) for (const c of ability.addColors) colors.add(c);
    }
  } finally {
    layer5InProgress.delete(object.id);
  }
  return colors;
}

/** Every battlefield static with a `setColors`, in battlefield order —
 * usually none. Memoized in the active cache region. */
function colorSetSources(state: GameState, registry: CardRegistry): readonly ContributingStatic[] {
  return computedCacheMemo("color-set-sources", () => {
    let out: ContributingStatic[] | null = null;
    for (const sourceId of state.zones.shared.battlefield) {
      const source = state.objects[sourceId];
      const layer5 = staticsOf(registry, rulesTextName(source)).layer5;
      if (layer5.length === 0) continue;
      // As in `typeGrantSources`: a departed controller's permanent grants nothing.
      if (state.players[source.controller]?.hasLost === true) continue;
      for (const ability of layer5) (out ??= []).push({ source, ability });
    }
    return out ?? NO_STATICS;
  });
}

/**
 * The greatest mana value among `player`'s commanders, wherever each one is
 * (Tangleweave Armor's ruling — the command zone, a hand, the battlefield):
 * as it is now, a copy effect's included, and on the stack with its {X}
 * (rule 202.3e); `{X}` is 0 everywhere else. 0 for a player with none. The
 * `grantPtPerCount.commanderManaValue` count. Memoized per cache region.
 */
export function greatestCommanderManaValue(state: GameState, registry: CardRegistry, player: PlayerId): number {
  return computedCacheMemo(`commander-mana-value:${player}`, () => {
    let best = 0;
    for (const object of Object.values(state.objects)) {
      if (object.isCommander !== true || object.owner !== player || object.kind !== "card") continue;
      if (!registry.has(printedCardName(object))) continue;
      const cost = parseManaCost(printedManaCost(registry, object));
      const value = manaValue(cost) + (object.zone === "stack" ? cost.x * Math.max(0, object.xValue ?? 0) : 0);
      if (value > best) best = value;
    }
    return best;
  });
}

/**
 * The commanders `player` owns on the battlefield or in the command zone — "a
 * commander you own on the battlefield or in the command zone" (Cloudkill, the
 * Visions cycle), not one in a graveyard, a hand or exile.
 */
export function commandersOnBattlefieldOrInCommandZone(state: GameState, player: PlayerId): ObjectId[] {
  return [...state.zones.shared.battlefield, ...state.zones.shared.command].filter((id) => {
    const object = state.objects[id];
    return object?.isCommander === true && object.owner === player;
  });
}

/**
 * How many colours there are among the battlefield permanents matching
 * `filter` from `you`'s perspective, each colour once — the `colorsAmong`
 * amount and P/T count. `except` leaves one permanent apiece out, as
 * `weightedMatches` does ("other legendary permanents you control").
 */
export function colorsAmongPermanents(
  state: GameState,
  registry: CardRegistry,
  you: PlayerId,
  filter: CardFilter,
  except: readonly ObjectId[] = [],
): number {
  return colorSetAmongPermanents(state, registry, you, filter, except).size;
}

/** The colours {@link colorsAmongPermanents} counts. */
function colorSetAmongPermanents(
  state: GameState,
  registry: CardRegistry,
  you: PlayerId,
  filter: CardFilter,
  except: readonly ObjectId[] = [],
): ReadonlySet<Color> {
  const colors = new Set<Color>();
  const matches = weightedMatches(
    state,
    state.zones.shared.battlefield,
    (id) => matchesFilter(state, registry, id, filter, { you }),
    except,
  );
  for (const { id } of matches) {
    for (const color of effectiveColors(state, registry, state.objects[id])) colors.add(color);
  }
  return colors;
}

/**
 * How many card types there are among the cards in graveyards matching
 * `filter` from `you`'s perspective, each type once (rule 205.2a lists them)
 * — Tarmogoyf, delirium. A card of two types gives both. Tokens aren't
 * cards.
 */
export function cardTypesInGraveyards(
  state: GameState,
  registry: CardRegistry,
  you: PlayerId,
  filter: CardFilter,
): number {
  const types = new Set<CardType>();
  for (const player of state.turnOrder) {
    for (const id of state.zones.perPlayer[player]?.graveyard ?? []) {
      const object = state.objects[id];
      if (object === undefined || object.isToken) continue;
      if (!matchesFilter(state, registry, id, filter, { you })) continue;
      for (const type of effectiveTypes(state, registry, object)) types.add(type);
    }
  }
  return types.size;
}

/**
 * How many basic land types (rule 205.3i — Plains, Island, Swamp, Mountain,
 * Forest) there are among the lands `player` controls, each once: 0 to 5.
 * Domain's count (an ability word, rule 207.2c — "the number of basic land
 * types among lands you control"). A land's types are its current ones (a
 * Blood Moon'd dual is only a Mountain). Read through `matchesFilter`, as a
 * `countOf` is, so a characteristic-defining ability may read it (Nishoba
 * Brawler).
 */
export function basicLandTypesAmong(state: GameState, registry: CardRegistry, player: PlayerId): number {
  let n = 0;
  for (const [type] of BASIC_LAND_TYPE_COLORS) {
    const filter: CardFilter = { type: "land", subtype: type, controlledBy: "you" };
    if (state.zones.shared.battlefield.some((id) => matchesFilter(state, registry, id, filter, { you: player }))) n += 1;
  }
  return n;
}

/** The four roles of a party (rule 700.8), in the order its bits are kept. */
const PARTY_ROLES = ["Cleric", "Rogue", "Warrior", "Wizard"] as const;

/**
 * The number of creatures in `player`'s party, 0 to 4 (rule 700.8): up to one
 * Cleric, one Rogue, one Warrior and one Wizard they control. A creature with
 * more than one of those types fills only one role, chosen to make the count
 * as large as possible (700.8b) — a Cleric Wizard and a Wizard are a party of
 * two — so this is a maximum matching of creatures to the four roles, kept as
 * the set of reachable role masks. A creature's types are its current ones,
 * read through `matchesFilter` (a changeling fills any role). A compacted
 * token stack is that many creatures (`permanentCount`); more than four of
 * one can't add anything.
 */
export function partySizeOf(state: GameState, registry: CardRegistry, player: PlayerId): number {
  let reachable = new Set<number>([0]);
  for (const id of state.zones.shared.battlefield) {
    let roles = 0;
    PARTY_ROLES.forEach((subtype, bit) => {
      const filter: CardFilter = { type: "creature", subtype, controlledBy: "you" };
      if (matchesFilter(state, registry, id, filter, { you: player })) roles |= 1 << bit;
    });
    if (roles === 0) continue;
    const copies = Math.min(4, state.objects[id]?.stackCount ?? 1);
    for (let i = 0; i < copies; i++) {
      const next = new Set(reachable);
      for (const mask of reachable) {
        for (let bit = 0; bit < PARTY_ROLES.length; bit++) {
          if ((roles & (1 << bit)) !== 0 && (mask & (1 << bit)) === 0) next.add(mask | (1 << bit));
        }
      }
      reachable = next;
    }
    if (reachable.has(0b1111)) return 4;
  }
  let best = 0;
  for (const mask of reachable) {
    let n = 0;
    for (let m = mask; m !== 0; m &= m - 1) n += 1;
    best = Math.max(best, n);
  }
  return best;
}

/** The player a count on `object` reads "you" as: its controller, or with
 * `forChosenPlayer` the player chosen for it (`GameObject.chosenPlayer`) —
 * nobody when none was chosen or they've left the game (rule 800.4a), which
 * a count reads as 0. */
/** The number `object` chose (`chosenOnEnter`, a `"chosen-number"` count): 0
 * while it has none, as off the battlefield. */
function chosenNumberOf(object: GameObject): number {
  if (object.zone !== "battlefield") return 0;
  const n = Number(object.chosenOnEnter ?? 0);
  return Number.isInteger(n) ? n : 0;
}

function countSide(
  state: GameState,
  object: GameObject,
  forChosenPlayer: true | undefined,
  forDefendingPlayer?: true,
): PlayerId | undefined {
  // Elturel Survivors' "the number of lands defending player controls": the
  // player it's attacking, or the one defending the planeswalker or battle
  // it attacks (rules 506.2, 310.9d); nobody while it isn't attacking.
  if (forDefendingPlayer === true) {
    const at = object.zone === "battlefield" ? object.attacking : null;
    if (at === null) return undefined;
    const attacked = state.objects[at as ObjectId];
    const defender = attacked === undefined ? (at as PlayerId) : (attacked.protector ?? attacked.controller);
    return state.players[defender]?.hasLost !== true ? defender : undefined;
  }
  if (forChosenPlayer !== true) return object.controller;
  const chosen = object.chosenPlayer;
  return chosen !== undefined && state.players[chosen]?.hasLost !== true ? chosen : undefined;
}

/** The last card exiled with `source` (rule 607.2a) that matches `filter`,
 * if any — the shared exile zone keeps its cards in the order they arrived
 * (`takesLastExiledCard`, Duplicant). */
function lastExiledCard(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  filter: CardFilter,
): ObjectId | undefined {
  const ctx = { you: source.controller, source: source.id };
  const linked = liveReferenceObjects(state, registry, "exiled-with-source", ctx) ?? [];
  for (let i = linked.length - 1; i >= 0; i -= 1) {
    if (matchesFilter(state, registry, linked[i], filter, ctx)) return linked[i];
  }
  return undefined;
}

/** A `takesLastExiledCard`'s base P/T: that card's, as it is in exile —
 * null while there's none. */
function lastExiledCardPt(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  filter: CardFilter,
): { readonly power: number; readonly toughness: number } | null {
  const card = lastExiledCard(state, registry, source, filter);
  if (card === undefined) return null;
  const c = computeCharacteristics(state, registry, card);
  return { power: c.power, toughness: c.toughness };
}

/** A static's `setBasePt` as it reaches `target`: each value read live, the
 * permanent's own or from `source`'s side (rule 613.4b). */
function staticBasePt(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  value: NonNullable<StaticAbility["setBasePt"]>,
  target: GameObject,
): { readonly power?: number; readonly toughness?: number } {
  const read = (v: StaticPt<CountSpec>): number =>
    typeof v === "number"
      ? v
      : v === "its-mana-value"
        ? manaValueOfObject(registry, target)
        : "countersOnIt" in v
          ? (target.counters[v.countersOnIt] ?? 0)
          : basePtCount(state, registry, source, { countOf: v.sourceCount, plusPower: 0, plusToughness: 0 });
  return {
    ...(value.power !== undefined ? { power: read(value.power) } : {}),
    ...(value.toughness !== undefined ? { toughness: read(value.toughness) } : {}),
  };
}

/** A `setBasePtFromCount`'s count on `object`: the one permanent that knows
 * which number it chose and which counters are "on it". */
function basePtCount(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  from: NonNullable<StaticAbility["setBasePtFromCount"]>,
): number {
  const of = from.countOf;
  if (of === "chosen-number") return chosenNumberOf(object);
  if (typeof of === "object" && "countersOnThis" in of) return object.counters[of.countersOnThis] ?? 0;
  if (typeof of === "object" && "countersOnMaker" in of) {
    const link = object.createdWith;
    const maker = link === undefined ? undefined : state.objects[link.source];
    if (maker?.zone !== "battlefield" || (maker.zoneChangeCount ?? 0) !== link?.zoneChangeCount) return 0;
    return maker.counters[of.countersOnMaker] ?? 0;
  }
  const side = countSide(state, object, from.forChosenPlayer);
  return side === undefined ? 0 : countValue(of, state, registry, side, object.id);
}

/** The creature types `object` has, the every-type marker among them for a
 * changeling (rule 702.73a): what a filter's `subtypes` takes as "shares a
 * creature type with it" (`hasSubtype`). */
function creatureTypesOf(state: GameState, registry: CardRegistry, object: GameObject): readonly string[] {
  return effectiveSubtypes(state, registry, object).filter((s) => subtypeKind(s) === "creature");
}

/** What `grantPtPerCount.ofAffected` reads of the affected permanent: nothing
 * from layer 7, so the fold doesn't recurse. */
function affectedCharacteristicCount(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  what: "mana-value" | "colors" | "creature-types" | "times-attacked-this-turn" | { readonly manaSymbols: Color },
): number {
  if (typeof what === "object") return colorSymbols(parseManaCost(printedManaCost(registry, object)), [what.manaSymbols]);
  if (what === "times-attacked-this-turn") return object.attacksThisTurn ?? 0;
  if (what === "mana-value") return manaValueOfObject(registry, object);
  if (what === "colors") return effectiveColors(state, registry, object).size;
  const creatureTypes = creatureTypesOf(state, registry, object);
  return creatureTypes.includes(EVERY_CREATURE_TYPE) ? CREATURE_TYPES.length : creatureTypes.length;
}

/** The hand size a count-scaled bonus reads (`grantPtPerCount.cardsInHand`):
 * the counting player's own (`true`), their opponents' together, or the
 * affected creature's controller's. A player who has left the game has no
 * hand to count (rule 800.4a). */
function cardsInHandFor(
  state: GameState,
  whose: true | "opponents" | "affected-controller",
  side: PlayerId,
  affected: GameObject,
): number {
  const handOf = (p: PlayerId): number =>
    state.players[p]?.hasLost === true ? 0 : (state.zones.perPlayer[p]?.hand.length ?? 0);
  if (whose === true) return handOf(side);
  if (whose === "affected-controller") return handOf(affected.controller);
  return state.turnOrder.reduce((n, p) => (p === side ? n : n + handOf(p)), 0);
}

/** A CDA's player aggregate (`StaticPlayerAggregate`): the greatest or least
 * of a life total or a battlefield count over the players in `who` still in
 * the game, from `controller`'s side, then halved or taken from a number. */
function staticPlayerAggregate(
  state: GameState,
  registry: CardRegistry,
  controller: PlayerId,
  spec: StaticPlayerAggregate,
): number {
  const living = state.turnOrder.filter((p) => state.players[p]?.hasLost !== true);
  const players =
    spec.who === "each-opponent" ? living.filter((p) => p !== controller) : spec.who === "you" ? [controller] : living;
  if (players.length === 0) return spec.from ?? 0;
  const of = spec.of;
  const values = players.map((p) =>
    "lifeTotal" in of
      ? (state.players[p]?.life ?? 0)
      : permanentCount(
          state,
          state.zones.shared.battlefield.filter((id) => matchesFilter(state, registry, id, of.countOf, { you: p })),
        ),
  );
  const value = spec.amongPlayers === "greatest" ? Math.max(...values) : Math.min(...values);
  const halved = spec.half === undefined ? value : spec.half === "up" ? Math.ceil(value / 2) : Math.floor(value / 2);
  return spec.from === undefined ? halved : spec.from - halved;
}

/** The current value of a CDA's dynamic count (rule 604.3). */
export function countValue(
  spec: CountSpec,
  state: GameState,
  registry: CardRegistry,
  controller: PlayerId,
  /** The permanent whose CDA or static this is, for its own sets
   * (`"exiled-with-source"`, `"attached-to-source"`). */
  source?: ObjectId,
): number {
  // A player who has left the game took their graveyard with them (800.4a).
  const allGraveyards = (): ObjectId[] =>
    state.turnOrder.flatMap((p) =>
      state.players[p]?.hasLost === true ? [] : (state.zones.perPlayer[p]?.graveyard ?? []),
    );
  if (typeof spec === "object") {
    if ("countOf" in spec) {
      return permanentCount(
        state,
        state.zones.shared.battlefield.filter((id) =>
          matchesFilter(state, registry, id, spec.countOf, { you: controller }),
        ),
      );
    }
    if ("playerCounters" in spec) {
      return state.players[controller]?.counters[spec.playerCounters] ?? 0;
    }
    // Which permanent's is only known to a `setBasePtFromCount`.
    if ("countersOnThis" in spec || "countersOnMaker" in spec) return 0;
    if ("greatestManaValueOf" in spec) {
      let best = 0;
      for (const id of state.zones.shared.battlefield) {
        if (!matchesFilter(state, registry, id, spec.greatestManaValueOf, { you: controller })) continue;
        best = Math.max(best, aggregateValueOf(state, registry, id, "mana-value"));
      }
      return best;
    }
    if ("cardTypesInGraveyard" in spec) {
      return cardTypesInGraveyards(state, registry, controller, spec.cardTypesInGraveyard);
    }
    if ("amongPlayers" in spec) return staticPlayerAggregate(state, registry, controller, spec);
    if ("sum" in spec) return spec.sum.reduce((n, part) => n + countValue(part, state, registry, controller, source), 0);
    if ("aggregate" in spec) {
      return Math.max(0, aggregateOver(state, registry, aggregateMatches(state, registry, spec, controller, { source }), spec));
    }
    if ("devotionTo" in spec) return devotionOf(state, registry, controller, spec.devotionTo);
    if ("basicLandTypes" in spec) return basicLandTypesAmong(state, registry, controller);
    if ("partySize" in spec) return partySizeOf(state, registry, controller);
    return allGraveyards().filter((id) =>
      matchesFilter(state, registry, id, spec.countInGraveyard, { you: controller }),
    ).length;
  }
  switch (spec) {
    case "cards-in-all-graveyards":
      return allGraveyards().length;
    case "chosen-number":
      // Which permanent's is only known to a `setBasePtFromCount`.
      return 0;
    case "cards-in-your-hand":
      return state.zones.perPlayer[controller]?.hand.length ?? 0;
    case "your-life-total":
      return state.players[controller]?.life ?? 0;
    case "cards-in-all-hands":
      return Object.values(state.zones.perPlayer).reduce((n, zones) => n + zones.hand.length, 0);
    case "cards-in-largest-opponent-hand":
      // A player who has left the game has no hand to count (rule 800.4a).
      return state.turnOrder.reduce(
        (best, p) =>
          p === controller || state.players[p]?.hasLost === true
            ? best
            : Math.max(best, state.zones.perPlayer[p]?.hand.length ?? 0),
        0,
      );
    default:
      return 0;
  }
}

/** What one counter named `counter` adds to power and toughness: a +X/+Y or
 * -X/-Y counter (rule 122.1a) — "+1/+1", "-1/-1", Wall of Roots' "-0/-1",
 * "+1/+0" — and nothing for any other kind. */
function counterPtBonus(counter: string): { power: number; toughness: number } {
  if (counter === "+1/+1") return { power: 1, toughness: 1 };
  if (counter === "-1/-1") return { power: -1, toughness: -1 };
  const pt = /^([+-]\d+)\/([+-]\d+)$/.exec(counter);
  if (pt === null) return { power: 0, toughness: 0 };
  // `|| 0`: "-0" is no change, not a negative zero.
  return { power: Number(pt[1]) || 0, toughness: Number(pt[2]) || 0 };
}

/** Whether a filter reads keywords anywhere in it — a scope that has to
 * wait for layer 6 (rule 613.8a). "With a mana ability" counts: whether a
 * granted mana ability reaches a creature can turn on its keywords (a grant
 * to "creatures with flying"), so it's asked with the keywords pass one
 * produced. */
function filterReadsKeywords(filter: CardFilter): boolean {
  return (
    filter.keyword !== undefined ||
    filter.notKeyword !== undefined ||
    filter.hasManaAbility !== undefined ||
    // "Creatures you control with toxic" (Skrelv's Hive): toxic granted in
    // layer 6 counts too (rule 613.8).
    filter.hasToxic !== undefined ||
    filter.keywordVariant !== undefined ||
    (filter.anyOf?.some(filterReadsKeywords) ?? false) ||
    (filter.not !== undefined && filterReadsKeywords(filter.not))
  );
}

/** Whether an `AffectSpec` narrows its reach by keyword — the statics whose
 * scope has to wait for the target's layer-6 keywords (rule 613.8). */
function scopedByKeyword(affects: AffectSpec): boolean {
  if (affects.scope === "filter") return filterReadsKeywords(affects.filter);
  return (
    (affects.scope === "creatures-you-control" || affects.scope === "all-creatures") &&
    (affects.withKeyword !== undefined ||
      (affects.scope === "all-creatures" && affects.withoutKeyword !== undefined))
  );
}

/** Whether a `filter` scope asks if its target has any ability at all, which
 * has to wait until every other static has had its say (`layerStatics`). */
function scopedByAbilities(affects: AffectSpec): boolean {
  const reads = (filter: CardFilter): boolean =>
    filter.hasAbilities !== undefined || (filter.anyOf?.some(reads) ?? false) || (filter.not !== undefined && reads(filter.not));
  return affects.scope === "filter" && reads(affects.filter);
}

/** Whether a filter reads power or toughness, which nothing inside the fold
 * computing them can answer. */
function filterReadsPt(filter: CardFilter): boolean {
  return (
    filter.power !== undefined ||
    filter.toughness !== undefined ||
    filter.greatestInZone?.of === "power" ||
    filter.greatestInZone?.of === "toughness" ||
    (filter.anyOf?.some(filterReadsPt) ?? false) ||
    (filter.not !== undefined && filterReadsPt(filter.not))
  );
}

/**
 * A static putting a combat restriction on what its filter's power or toughness
 * picks out — Meekstone's "creatures with power 3 or greater don't untap", Tetsuko
 * Umezawa's "creatures you control with power or toughness 1 or less can't be
 * blocked". A restriction is no characteristic and the fold doesn't need it to
 * reach P/T, so `restrictionsOf` applies these after the fold rather than in it.
 */
function isPtScopedRestriction(ability: StaticAbility): boolean {
  return hasRestrictionWord(ability) && ability.affects.scope === "filter" && filterReadsPt(ability.affects.filter);
}

/**
 * What a scope check may know about its target beyond the object itself,
 * when the caller is partway through computing it.
 */
export interface TargetView {
  /** See `FilterContext.spellGrantAmount`. */
  readonly spellGrantAmount?: (source: GameObject) => (amount: EffectAmount) => number;
  /** The target's types / subtypes as folded so far — a type-granting
   * static's scope, matched inside layer 4. Omitted: the current ones
   * (`effectiveTypes`). */
  readonly types?: readonly CardType[];
  readonly subtypes?: readonly string[];
  /** Its supertypes as layer 4 has them so far. Omitted: the current ones
   * (`effectiveSupertypes`). */
  readonly supertypes?: readonly Supertype[];
  /**
   * The target's *current* keywords, for a keyword clause — flying from an
   * Aura or an anthem counts, and a creature that lost its abilities has
   * none. Answering it means folding layer 6, and the layer fold itself is
   * one caller; without one, printed keywords (less ability loss).
   */
  readonly keywords?: () => ReadonlySet<Keyword>;
  /** The target's total toxic (rule 702.164b) as the layer fold has it so far
   * — printed and granted — for a `hasToxic` clause ("creatures you control
   * with toxic", Skrelv's Hive). Without one, printed toxic. */
  readonly toxic?: () => number;
  /** Whether the layer fold has granted the target a protection so far, for a
   * scope asking whether it has any ability (`hasAnyAbility`). */
  readonly hasProtection?: () => boolean;
  /** The caller is the layer fold computing this target's characteristics:
   * a `filter` scope's clauses must not ask for them again (see
   * `FilterContext.layered`). */
  readonly inFold?: boolean;
  /** The target is about to enter the battlefield (rule 614.12 — see
   * `entersWithoutAbilities`): a `filter` scope is matched against it where
   * it is, as it would exist there. */
  readonly entering?: boolean;
  /** With `entering`: the player it will enter under. */
  readonly enteringUnder?: PlayerId;
  /** Answers a `filter` scope's `{ amount }` operand (`FilterContext.amount`)
   * — only a caller outside the fold has anything to answer it with (a
   * static goad: "power less than Baeloth Barrityl's power"). Without one,
   * such a comparison fails closed. */
  readonly amount?: (amount: EffectAmount) => number;
}

/**
 * Whether a static's `affects` reaches `target`. See {@link TargetView} for
 * what a caller partway through the layer fold supplies.
 */
export function staticAffects(
  state: GameState,
  registry: CardRegistry,
  affects: AffectSpec,
  source: GameObject,
  target: GameObject,
  view: TargetView = {},
): boolean {
  const targetKeywords = view.keywords;
  const hasKeyword = (keyword: Keyword): boolean =>
    targetKeywords !== undefined
      ? targetKeywords().has(keyword)
      : !(target.zone === "battlefield" && hasLostAbilities(state, registry, target)) &&
        registry.get(rulesTextName(target)).keywords.includes(keyword);
  // Current types, not printed (rule 613.1d puts type changes before every
  // layer a static works in): an animated land or an artifact that became a
  // creature is reached like a printed creature, and a creature that stopped
  // being one isn't.
  const isCreatureNow = (): boolean =>
    (view.types ?? effectiveTypes(state, registry, target)).includes("creature");
  const subtypesNow = (): readonly string[] =>
    view.subtypes ?? effectiveSubtypes(state, registry, target);
  if (affects.scope === "self") return source.id === target.id;
  // An Aura enchanting a card in a graveyard (Animate Dead, before its
  // ability returns it) gives that card nothing: statics reach permanents.
  if (affects.scope === "attached") return source.attachedTo === target.id && target.zone !== "graveyard";
  if (affects.scope === "chosen") {
    const chosen = source.chosenPermanent;
    return (
      chosen !== undefined &&
      chosen.id === target.id &&
      chosen.stint === (target.zoneChangeCount ?? 0) &&
      target.zone === "battlefield"
    );
  }
  if (affects.scope === "paired") {
    const partner = pairedPartner(state, source);
    return partner !== undefined && (target.id === source.id || target.id === partner.id);
  }
  if (affects.scope === "filter") {
    if (target.zone !== "battlefield" && view.entering !== true) return false;
    if (affects.excludeSelf === true && source.id === target.id) return false;
    return matchesFilter(state, registry, target.id, affects.filter, {
      you: source.controller,
      // What `ofChosenType` ("of the chosen type") reads the choice off.
      source: source.id,
      ...(view.inFold === true
        ? { layered: { types: view.types, subtypes: view.subtypes, supertypes: view.supertypes, keywords: view.keywords, toxic: view.toxic, hasProtection: view.hasProtection } }
        : {}),
      ...(view.amount !== undefined ? { amount: view.amount } : {}),
      ...(view.enteringUnder !== undefined ? { enteringUnder: view.enteringUnder } : {}),
    });
  }
  if (affects.scope === "lands-you-control") {
    return (
      (view.enteringUnder ?? target.controller) === source.controller &&
      (view.types ?? effectiveTypes(state, registry, target)).includes("land")
    );
  }
  if (affects.scope === "all-creatures") {
    // Every creature on the battlefield, whoever controls it.
    if (affects.excludeSelf === true && source.id === target.id) return false;
    if (!isCreatureNow()) return false;
    if (affects.subtype !== undefined && !hasSubtype(subtypesNow(), affects.subtype)) {
      return false;
    }
    if (affects.withKeyword !== undefined && !hasKeyword(affects.withKeyword)) return false;
    if (affects.withoutKeyword !== undefined && hasKeyword(affects.withoutKeyword)) return false;
    if (affects.chosenColorOnly === true) {
      const chosen = source.chosenOnEnter;
      if (chosen == null || !effectiveColors(state, registry, target).has(chosen as Color)) return false;
    }
    return true;
  }
  // "creatures-you-control"
  if (affects.excludeSelf && source.id === target.id) return false;
  if ((view.enteringUnder ?? target.controller) !== source.controller) return false;
  if (!isCreatureNow()) return false;
  if (affects.tokenOnly === true && !isTokenNow(target)) return false;
  if (affects.withKeyword !== undefined && !hasKeyword(affects.withKeyword)) return false;
  if (affects.chosenColorOnly === true) {
    const chosen = source.chosenOnEnter;
    if (chosen == null) return false;
    if (!effectiveColors(state, registry, target).has(chosen as Color)) return false;
  }
  if (affects.withCounter !== undefined) {
    const kind = affects.withCounter.kind;
    const held =
      kind === undefined
        ? Object.values(target.counters).reduce((n, v) => n + (v ?? 0), 0)
        : (target.counters[kind] ?? 0);
    if (held <= 0) return false;
  }
  if (affects.subtype !== undefined) {
    // The target is matched on its *current* subtypes (layer 4) — a
    // changeling is every one of them.
    if (!hasSubtype(subtypesNow(), affects.subtype)) return false;
  }
  return true;
}

/**
 * Whether `source`'s static `ability` applies to `target` right now — its
 * scope, and for a static with a layer-4 part, the permanents that part
 * reached (rule 613.6: an effect that starts applying in one layer keeps the
 * same set of objects in the later ones, so Bello's keywords and granted
 * trigger go to exactly the permanents it made creatures). A static with no
 * layer-4 part is just its scope; its condition is the caller's to check.
 */
export function staticReaches(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
  ability: StaticAbility,
  target: GameObject,
  view: TargetView = {},
): boolean {
  if (hasLayerFourPart(ability)) {
    if (target.zone !== "battlefield") return false;
    return layerFour(state, registry, target).applied.some(
      (a) => a.ability === ability && a.source.id === source.id,
    );
  }
  return staticAffects(state, registry, ability.affects, source, target, view);
}

/**
 * Every battlefield static that grants other objects an activated or
 * triggered ability (`grantsActivated` — Cryptolith Rite, Paradise Mantle;
 * `grantsTriggered`), in battlefield order: what {@link hasManaAbility} and
 * {@link hasAnyAbility} scan for grants. Granted keywords and protection are
 * read off the computed characteristics instead. Usually none. A permanent
 * that has lost its abilities grants nothing, and neither does one whose
 * controller has left the game. Memoized in the active cache region like
 * {@link typeGrantSources}.
 */
function abilityGrantSources(
  state: GameState,
  registry: CardRegistry,
): readonly ContributingStatic[] {
  if (activeCache !== null && activeCache.abilityGrantSources !== null) {
    return activeCache.abilityGrantSources;
  }
  const result = boardScan("abilityGrant", state, registry, scanAbilityGrantSources);
  if (activeCache !== null) activeCache.abilityGrantSources = result;
  return result;
}

function scanAbilityGrantSources(state: GameState, registry: CardRegistry): readonly ContributingStatic[] {
  let out: ContributingStatic[] | null = null;
  for (const sourceId of state.zones.shared.battlefield) {
    const source = state.objects[sourceId];
    if (source === undefined) continue;
    if (state.players[source.controller]?.hasLost === true) continue;
    const grants = staticsOf(registry, rulesTextName(source)).grants;
    // Roar of the Fifth People's chapter II: "This Saga gains 'Creatures you
    // control have …'" (a `grant-static`).
    const grantsAbilities = (ability: StaticAbility): boolean =>
      ability.grantsActivated !== undefined || ability.grantsTriggered !== undefined;
    for (const ability of grantedStatics(state, registry, source, grantsAbilities)) {
      if (grantsAbilities(ability)) (out ??= []).push({ source, ability });
    }
    if (grants.length === 0) continue;
    // A static with a layer-4 part outlives its source's loss of abilities
    // (rule 613.6 — see `typeGrantSources`); its grants then go against that
    // loss in timestamp order, like any (`grantOutlastsLoss`).
    const lost = hasLostAbilities(state, registry, source);
    for (const ability of grants) {
      if (lost && !staticOutlivesLoss(state, registry, source, ability)) continue;
      (out ??= []).push({ source, ability });
    }
  }
  // An emblem's: "Mountains you control have '{T}: …'" (Koth of the Hammer).
  for (const { source, ability } of emblemStatics(state)) {
    if (ability.grantsActivated !== undefined || ability.grantsTriggered !== undefined) {
      (out ??= []).push({ source, ability });
    }
  }
  return out ?? NO_STATICS;
}

/**
 * Whether a battlefield static that `grants` picks out gives `object` an
 * activated or triggered ability right now: its scope reaches it (see
 * {@link staticReaches}) and its condition holds.
 *
 * `view` is what the layer fold knows, when it's the one asking — a static
 * scoped by a question like this one, matched from inside the fold computing
 * `object` (`FilterContext.layered`): a grant's scope is then matched against
 * the types and keywords folded so far, never by folding `object` again.
 * Otherwise a keyword-scoped grant sees the permanent's computed keywords,
 * as `Game`'s own grant lookups do. Guarded by `grantedAbilitiesInProgress`.
 */
function hasGrantedAbility(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  view: TargetView,
  grants: (ability: StaticAbility) => boolean,
  lostAt: number | null,
): boolean {
  const sources = abilityGrantSources(state, registry);
  if (sources.length === 0 || grantedAbilitiesInProgress.has(object.id)) return false;
  const reach: TargetView =
    view.inFold === true
      ? view
      : { keywords: () => computeCharacteristics(state, registry, object.id).keywords };
  grantedAbilitiesInProgress.add(object.id);
  try {
    return sources.some(
      ({ source, ability }) =>
        grants(ability) &&
        grantOutlastsLoss(lostAt, source.timestamp) &&
        staticReaches(state, registry, source, ability, object, reach) &&
        (ability.condition === undefined ||
          staticConditionMet(state, registry, source, ability.condition)),
    );
  } finally {
    grantedAbilitiesInProgress.delete(object.id);
  }
}

/**
 * The colours of the intrinsic "{T}: Add [mana]" abilities `object` has
 * (rule 305.6): one for each basic land type it has now, as a land — a type
 * an effect gave it included (Omo, Queen of Vesuva's everything counter;
 * "every land type" is all five), none it no longer has (rule 305.7: a
 * Tropical Island made a Mountain taps only for {R}). They exist before layer
 * 6, so a permanent that has lost all its abilities has none of them,
 * whenever it got the type. WUBRG order.
 */
export function intrinsicManaColors(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
): readonly Color[] {
  const { types, subtypes } = layerFour(state, registry, object);
  if (!types.includes("land")) return [];
  // A loss of all abilities takes them; rule 305.7's loss of the rules text
  // doesn't — that's how a land made a Mountain gets "{T}: Add {R}".
  if (object.zone === "battlefield" && layerSixLossAt(state, registry, object) !== null) return [];
  return BASIC_LAND_TYPE_COLORS.filter(([type]) => hasSubtype(subtypes, type)).map(([, color]) => color);
}

const standInCache = new WeakMap<CardDefinition, readonly (readonly Color[] | null)[]>();

/**
 * Which of `def`'s printed activated abilities stand in for the intrinsic
 * mana abilities of its printed basic land types, with the colours each one
 * makes — a typed land's "({T}: Add {G} or {U}.)" is reminder text, and the
 * ability is its types' (rule 305.6): a plain "{T}: Add" of one of those
 * colours, or of "one of" several. `null` for every other ability. Such an
 * ability is the land's only while it has those types (`inactiveStandIn`).
 */
export function intrinsicStandIns(def: CardDefinition): readonly (readonly Color[] | null)[] {
  const cached = standInCache.get(def);
  if (cached !== undefined) return cached;
  const printed = def.types.includes("land")
    ? BASIC_LAND_TYPE_COLORS.filter(([type]) => def.subtypes.includes(type)).map(([, color]) => color)
    : [];
  const defined = (o: object): string[] =>
    Object.entries(o)
      .filter(([, v]) => v !== undefined)
      .map(([k]) => k);
  const out = def.activated.map((ability): readonly Color[] | null => {
    if (printed.length === 0) return null;
    const effect = ability.effect;
    if (effect === null || effect.kind !== "add-mana" || effect.amount !== 1 || ability.resolve !== null) return null;
    if (ability.cost.mana !== null || ability.cost.tap !== true || ability.targets.length > 0) return null;
    if (defined(ability.cost).some((k) => k !== "mana" && k !== "tap")) return null;
    if (defined(effect).some((k) => k !== "kind" && k !== "mana" && k !== "amount")) return null;
    if (defined(ability).some((k) => !["cost", "targets", "effect", "resolve", "text"].includes(k))) return null;
    const mana = effect.mana;
    const colors =
      typeof mana === "string"
        ? [mana]
        : "oneOf" in mana && mana.same !== true
          ? [...mana.oneOf]
          : null;
    if (colors === null || colors.some((c) => !printed.includes(c as Color))) return null;
    return colors as Color[];
  });
  standInCache.set(def, out);
  return out;
}

/** Whether nothing can have moved `object`'s land types or abilities off
 * its printed ones: no type-granting static on the battlefield, and no
 * modifier of its own that changes types, text or abilities. Then its
 * printed stand-ins are exactly its intrinsic mana abilities (the pool test
 * holds every typed land to that) — the case nearly every land is in, and
 * the one `Game.effectiveActivated` asks about for every permanent. */
function printedLandTypesHold(state: GameState, registry: CardRegistry, object: GameObject): boolean {
  if (object.textFrom !== undefined) return false;
  if (object.zone === "battlefield" && typeGrantSources(state, registry).length > 0) return false;
  if (object.zone === "battlefield" && staticAbilityLosses(state, registry).lost.has(object.id)) return false;
  return !object.modifiers.some(
    (m) =>
      m.setTypes !== undefined ||
      m.setSubtypes !== undefined ||
      (m.addTypes?.length ?? 0) > 0 ||
      (m.addSubtypes?.length ?? 0) > 0 ||
      m.loseLandTypes === true ||
      m.loseAbilities === true ||
      m.textChange !== undefined,
  );
}

/** Whether `object`'s printed activated ability at `index` stands in for an
 * intrinsic mana ability of a basic land type it no longer has (rule 305.7 —
 * a Tropical Island that's a Mountain has lost "{T}: Add {G} or {U}"). One
 * that came with another permanent's text box (rule 612.5) is that land's
 * reminder text, never an ability: the intrinsic one belongs to a type
 * (305.6), and stays with whatever has the type. */
export function inactiveStandIn(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  index: number,
): boolean {
  const colors = intrinsicStandIns(registry.get(rulesTextName(object)))[index];
  if (colors === null || colors === undefined) return false;
  if (object.textFrom !== undefined) return true;
  if (printedLandTypesHold(state, registry, object)) return false;
  const has = intrinsicManaColors(state, registry, object);
  return colors.some((c) => !has.includes(c));
}

/** The intrinsic mana abilities `object` has on top of its printed ones:
 * one per basic land type it has that no printed stand-in covers — a type an
 * effect gave it, or one whose combined stand-in went with another type. */
export function extraIntrinsicManaColors(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
): readonly Color[] {
  if (printedLandTypesHold(state, registry, object)) return [];
  const has = intrinsicManaColors(state, registry, object);
  if (has.length === 0) return has;
  // Its own stand-ins went with its text box (rule 612.5), or with its rules
  // text (305.7): every type's intrinsic ability is an extra.
  if (object.textFrom !== undefined || landTextLost(state, registry, object)) return has;
  const covered = new Set<Color>();
  for (const colors of intrinsicStandIns(registry.get(printedCardName(object)))) {
    if (colors !== null && colors.every((c) => has.includes(c))) for (const c of colors) covered.add(c);
  }
  return covered.size === 0 ? has : has.filter((c) => !covered.has(c));
}

const INTRINSIC_MANA: Partial<Record<Color, ActivatedAbility>> = {};

/** The intrinsic "{T}: Add [mana]" of a basic land type (rule 305.6). */
export function intrinsicManaAbility(color: Color): ActivatedAbility {
  return (INTRINSIC_MANA[color] ??= {
    cost: { mana: null, tap: true },
    targets: [],
    effect: { kind: "add-mana", mana: color, amount: 1 },
    resolve: null,
    text: `{T}: Add {${color}}.`,
  });
}

/**
 * The one mana `ability` makes when it is nothing but "{T}: Add [that
 * mana]" — a cost of only `{T}`, no targets, one mana of a single type
 * (`makes`, for a variant of an "any color" ability), no spend restriction
 * and no rider — or `undefined`. Two such abilities of one permanent making
 * the same mana are interchangeable: a City of Brass that's every basic land
 * type has its printed "any color" and the intrinsic "{T}: Add {W}" (rule
 * 305.6), and either one taps it for the same {W}. Mana Confluence's (a life
 * cost) or Plaza of Heroes' (a restriction) isn't plain, and stays its own
 * choice. The `activate-ability` offer's `plainMana`.
 */
export function plainTapMana(
  ability: ActivatedAbility,
  makes: readonly ManaType[] | undefined,
): ManaType | undefined {
  const effect = ability.effect;
  if (effect === null || effect.kind !== "add-mana" || effect.amount !== 1 || ability.resolve !== null) return undefined;
  if (ability.cost.mana !== null || ability.cost.tap !== true || ability.targets.length > 0) return undefined;
  const defined = (o: object): string[] =>
    Object.entries(o)
      .filter(([, v]) => v !== undefined)
      .map(([k]) => k);
  if (defined(ability.cost).some((k) => k !== "mana" && k !== "tap")) return undefined;
  if (defined(effect).some((k) => k !== "kind" && k !== "mana" && k !== "amount")) return undefined;
  if (defined(ability).some((k) => !["cost", "targets", "effect", "resolve", "text"].includes(k))) return undefined;
  const made = makes ?? (typeof effect.mana === "string" && MANA_TYPES.has(effect.mana) ? [effect.mana as ManaType] : []);
  return made.length === 1 ? made[0] : undefined;
}

const MANA_TYPES: ReadonlySet<string> = new Set<ManaType>(["W", "U", "B", "R", "G", "C"]);

/**
 * Whether `object` has a **mana ability** (rule 605.1) — Raggadragga, Goreguts
 * Boss's "each creature you control with a mana ability". An activated one
 * (605.1a — `isManaAbility`, so one that works from another zone counts
 * too) or a triggered one (605.1b — `isTriggeredManaAbility`, which
 * Raggadragga's ruling includes): printed, granted by a static that reaches it
 * (Cryptolith Rite, an Aura or Equipment), or granted by a one-shot modifier.
 * A permanent that has lost its abilities has only one granted it since (rule
 * 613.7), as everywhere else the engine asks (`Game.manaSources`).
 *
 * See {@link hasGrantedAbility} for `view`.
 */
export function hasManaAbility(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  view: TargetView = {},
): boolean {
  const onBattlefield = object.zone === "battlefield";
  const lostAt = onBattlefield ? abilitiesLostAt(state, registry, object) : null;
  const def = registry.get(rulesTextName(object));
  if (
    lostAt === null &&
    (def.activated.some((a, i) => isManaAbility(a) && !inactiveStandIn(state, registry, object, i)) ||
      def.triggered.some(isTriggeredManaAbility))
  ) {
    return true;
  }
  if (intrinsicManaColors(state, registry, object).length > 0) return true;
  if (
    object.modifiers.some(
      (m) =>
        modifierGrantApplies(m, lostAt) &&
        (m.grantsTriggered?.some(isTriggeredManaAbility) === true ||
          m.grantsActivated?.some(isManaAbility) === true),
    )
  ) {
    return true;
  }
  if (!onBattlefield) return false;
  return hasGrantedAbility(
    state,
    registry,
    object,
    view,
    (ability) =>
      ability.grantsActivated?.some(isManaAbility) === true ||
      ability.grantsTriggered?.some(isTriggeredManaAbility) === true,
    lostAt,
  );
}

/**
 * Whether `object` has an activated ability (rule 602), printed or granted:
 * with `mana` given, only one that is or isn't a mana ability (rule 605.1a);
 * with `tapCost`, only one with the {T} symbol in its cost (rule 107.5) — a
 * basic land type's intrinsic "{T}: Add" (rule 305.6) among them.
 */
export function hasActivatedAbilityOf(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  want: { readonly mana?: boolean; readonly tapCost?: boolean },
  view: TargetView = {},
): boolean {
  const onBattlefield = object.zone === "battlefield";
  const lostAt = onBattlefield ? abilitiesLostAt(state, registry, object) : null;
  const mana = want.mana;
  const fits = (ability: ActivatedAbility): boolean =>
    (mana === undefined || isManaAbility(ability) === mana) && (want.tapCost !== true || ability.cost.tap === true);
  const def = registry.get(rulesTextName(object));
  if (lostAt === null && def.activated.some((a, i) => fits(a) && !inactiveStandIn(state, registry, object, i))) return true;
  // A basic land type's mana ability (rule 305.6).
  if (mana !== false && intrinsicManaColors(state, registry, object).length > 0) return true;
  if (object.modifiers.some((m) => modifierGrantApplies(m, lostAt) && m.grantsActivated?.some(fits) === true)) return true;
  if (!onBattlefield) return false;
  return hasGrantedAbility(state, registry, object, view, (ability) => ability.grantsActivated?.some(fits) === true, lostAt);
}

/**
 * Whether `object` has **any ability** at all (rule 113) — the other side of
 * "a creature with no abilities" (Jasmine Boreal of the Seven). Its own, as
 * printed (`printedHasAbility` — a keyword, an activated, triggered or static
 * ability, a spell's instructions, flashback, a partner ability, …), unless it
 * has lost them; or anything granted to it:
 *
 * - a keyword or protection — its computed characteristics, which fold in
 *   anthems, Auras and Equipment, emblems, keyword counters, `grant-keyword`,
 *   and on the stack what grants keywords to spells;
 * - an activated or triggered ability a static grants it, or a one-shot
 *   modifier's triggered ability (once it has lost its abilities, only one
 *   granted it since — rule 613.7 — as `Game` has it);
 * - on the stack, a triggered ability or split second a `grantsToSpells`
 *   static gives it;
 * - in a graveyard, a keyword a `grantsToGraveyard` static gives it (Iroh,
 *   Grand Lotus' flashback, Mishra, Tamer of Mak Fawa's unearth), or one a
 *   one-shot effect gave it;
 * - suspend's haste (rule 702.62).
 *
 * Asked from inside the layer fold (`view.inFold` — Muraganda Petroglyphs'
 * "creatures with no abilities get +2/+2"), a scope like this waits for the last
 * pass, and reads what the passes before it granted through `view`.
 */
export function hasAnyAbility(
  state: GameState,
  registry: CardRegistry,
  object: GameObject,
  view: TargetView = {},
): boolean {
  const onBattlefield = object.zone === "battlefield";
  const lostAt = onBattlefield ? abilitiesLostAt(state, registry, object) : null;
  const def = registry.get(rulesTextName(object));
  if (lostAt === null && printedHasAbility(def)) return true;
  if (intrinsicManaColors(state, registry, object).length > 0) return true;
  if (object.hastyUntilItLeaves === true) return true;
  if (view.inFold === true) {
    if ((view.keywords?.().size ?? 0) > 0 || view.hasProtection?.() === true) return true;
  } else {
    const c = computeCharacteristics(state, registry, object.id);
    if (c.keywords.size > 0) return true;
    const protection = c.protectionFrom;
    if (
      protection.colors.size > 0 ||
      protection.types.size > 0 ||
      protection.filters.length > 0 ||
      protection.boundFilters.length > 0 ||
      protection.players.size > 0
    ) {
      return true;
    }
  }
  if (
    object.modifiers.some(
      (m) =>
        modifierGrantApplies(m, lostAt) &&
        ((m.grantsTriggered?.length ?? 0) > 0 || (m.grantsActivated?.length ?? 0) > 0),
    )
  ) {
    return true;
  }
  if (onBattlefield) {
    return hasGrantedAbility(
      state,
      registry,
      object,
      view.inFold === true ? view : {},
      (ability) => (ability.grantsActivated?.length ?? 0) > 0 || (ability.grantsTriggered?.length ?? 0) > 0,
      lostAt,
    );
  }
  if (object.zone === "stack" && object.kind === "card") {
    for (const id of state.zones.shared.battlefield) {
      const source = state.objects[id];
      if (source === undefined) continue;
      for (const ability of registry.get(rulesTextName(source)).static) {
        const grant = ability.grantsToSpells;
        if (grant === undefined) continue;
        if ((grant.triggered?.length ?? 0) === 0 && grant.splitSecond !== true) continue;
        if (spellGrantReaches(state, registry, source, ability, object, view.spellGrantAmount?.(source))) return true;
      }
    }
    for (const { source, ability } of emblemStatics(state)) {
      const grant = ability.grantsToSpells;
      if (grant === undefined || ((grant.triggered?.length ?? 0) === 0 && grant.splitSecond !== true)) continue;
      if (spellGrantReaches(state, registry, source, ability, object, view.spellGrantAmount?.(source))) return true;
    }
    return false;
  }
  if (object.zone === "graveyard") {
    if (object.grantedFlashback != null) return true;
    if ((object.grantedGraveyardKeywords?.length ?? 0) > 0) return true;
    return graveyardGrantReaches(state, registry, object, def);
  }
  return false;
}

/** Whether a `grantsToGraveyard` static of a permanent `card`'s owner
 * controls gives it flashback or escape (see `Game.flashbacksOf` /
 * `escapesOf`): active, matching, and with a cost — a "mana cost" grant gives
 * a card with no mana cost nothing. */
function graveyardGrantReaches(
  state: GameState,
  registry: CardRegistry,
  card: GameObject,
  def: CardDefinition,
): boolean {
  const owner = card.owner;
  if (state.players[owner]?.hasLost !== false) return false;
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined || source.controller !== owner || hasLostAbilities(state, registry, source)) continue;
    for (const ability of registry.get(rulesTextName(source)).static) {
      const grant = ability.grantsToGraveyard;
      if (grant === undefined) continue;
      const costs = [
        grant.flashback?.cost,
        grant.escape?.cost,
        ...(grant.keywords ?? []).map((k) => (k.keyword === "retrace" ? "" : (k.cost ?? "mana-cost"))),
      ].filter((c) => c !== undefined);
      if (!costs.some((cost) => cost !== "mana-cost" || def.manaCost !== null)) continue;
      if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) {
        continue;
      }
      if (matchesFilter(state, registry, card.id, grant.filter, { you: owner })) return true;
    }
  }
  // An emblem's works from the command zone (rule 113.6p).
  for (const { ability } of emblemStatics(state, owner)) {
    const grant = ability.grantsToGraveyard;
    if ((grant?.keywords?.length ?? 0) === 0) continue;
    if (matchesFilter(state, registry, card.id, grant!.filter, { you: owner })) return true;
  }
  return false;
}

interface AppliedEffect {
  readonly timestamp: number;
  readonly power: number;
  readonly toughness: number;
  readonly keywords: readonly Keyword[];
  /** Keywords it takes away (`loseKeywords`). */
  readonly loseKeywords: readonly LosableKeyword[];
  /** Keywords it forbids (`cantHaveKeywords`). */
  readonly cantHaveKeywords: readonly Keyword[];
  /** When what it gives was given, against a loss of hexproof (a `hexproofFrom`
   * — rule 702.11e) or of landwalk (rule 702.14): `-Infinity` for the
   * permanent's own, which any such loss takes. */
  readonly ownAt: number;
  /** Toxic N it grants (`grantToxic`), 0 for none. */
  readonly toxic: number;
  readonly restrictions: readonly CombatRule[];
  readonly combatDamageByToughness: StaticAbility["combatDamageByToughness"];
  readonly canAttackAsThoughNoDefender: boolean;
  readonly canAttackAttackersDespiteDefender: boolean;
  readonly assignAsThoughUnblocked: boolean;
  readonly cantBeSacrificed: boolean;
  /** "Can block an additional creature" (`blockAdditional`), 0 for none. */
  readonly blockAdditional: number | "any";
  readonly protection: {
    colors?: readonly Color[];
    types?: readonly CardType[];
    filter?: CardFilter;
    /** The permanent whose static it is, for `filter`'s clauses about it. */
    filterSource?: ObjectId;
    /** Protection from these players (702.16k). */
    players?: readonly PlayerId[];
    /** The Aura this instance doesn't remove (702.16n), or the attachments
     * already there (702.16p). */
    sparesAura?: SparedAttachments;
  } | null;
  /** "Hexproof from …" it grants — the same shape as `protection`, with the
   * qualifiers of a printed "can't be the target of …". */
  readonly hexproofFrom: NonNullable<StaticAbility["hexproofFrom"]> | null;
  /** "Bands with other [quality]" it grants (rule 702.22b). */
  readonly bandsWithOther: CardFilter | null;
  /** The landwalk it grants (rule 702.14), "the chosen type" read off its
   * source; null while none was chosen. */
  readonly landwalk: CardFilter | null;
  /** Layer 7b — a `setBasePt`. */
  readonly setBase: { readonly power?: number; readonly toughness?: number } | null;
}

/** Whether a static carries anything {@link collectStaticEffects} folds into
 * a permanent's characteristics — the rest (a replacement, a CDA, a cost
 * change, a permission) modify nothing there. */
/**
 * A card's statics as each board scan wants them, worked out once per name:
 * the scans run every cache region over every permanent (and every card in
 * every graveyard), and filtering each card's statics each time — with the
 * lookups to reach them — was several percent of a bot game (2026-10-14).
 */
interface StaticsInfo {
  /** What {@link contributingStaticSources} takes from the battlefield. */
  readonly contributing: readonly StaticAbility[];
  /** What it takes from a graveyard (`fromGraveyard`). */
  readonly fromGraveyard: readonly StaticAbility[];
  /** What {@link typeGrantSources} takes (`hasLayerFourPart`). */
  readonly layer4: readonly StaticAbility[];
  /** What {@link selfOutsideBattlefield} takes. */
  readonly selfOutside: readonly StaticAbility[];
  /** What {@link outsideTypeSources} takes (`outsideBattlefield`). */
  readonly outside: readonly StaticAbility[];
  /** What {@link colorSetSources} takes (a `setColors`). */
  readonly layer5: readonly StaticAbility[];
  /** What {@link abilityGrantSources} takes. */
  readonly grants: readonly StaticAbility[];
  /** What {@link staticAbilityLosses} takes (`loseAllAbilities`). */
  readonly loseAll: readonly StaticAbility[];
  /** What {@link staticGrantSources} takes (`grantsStatic`). */
  readonly grantsStatic: readonly StaticAbility[];
  /** What {@link ptScopedRestrictionSources} takes. */
  readonly ptRestrictions: readonly StaticAbility[];
}

const staticsInfoByRegistry = new WeakMap<CardRegistry, Map<string, StaticsInfo>>();

/** {@link StaticsInfo} for the card `name`, `null` when `registry` doesn't
 * know it (not remembered: a registry may yet learn it). */
function staticsInfo(registry: CardRegistry, name: string): StaticsInfo | null {
  let byName = staticsInfoByRegistry.get(registry);
  if (byName === undefined) {
    byName = new Map();
    staticsInfoByRegistry.set(registry, byName);
  }
  const known = byName.get(name);
  if (known !== undefined) return known;
  if (!registry.has(name)) return null;
  const statics = registry.get(name).static;
  const info: StaticsInfo = {
    contributing: statics.filter((a) => a.fromGraveyard !== true && contributesToCharacteristics(a)),
    fromGraveyard: statics.filter((a) => a.fromGraveyard === true && contributesToCharacteristics(a)),
    layer4: statics.filter(hasLayerFourPart),
    outside: statics.filter((a) => a.outsideBattlefield !== undefined),
    selfOutside: statics.filter((a) => a.selfOutsideBattlefield !== undefined),
    layer5: statics.filter((a) => a.setColors !== undefined || a.addColors !== undefined || a.setsChosenColor === true),
    grants: statics.filter((a) => a.grantsActivated !== undefined || a.grantsTriggered !== undefined),
    loseAll: statics.filter((a) => a.loseAllAbilities === true),
    grantsStatic: statics.filter((a) => a.grantsStatic !== undefined),
    ptRestrictions: statics.filter((a) => a.fromGraveyard !== true && isPtScopedRestriction(a)),
  };
  byName.set(name, info);
  return info;
}

/** {@link staticsInfo} for a card that must be known — throwing as
 * `registry.get` does when it isn't. */
function staticsOf(registry: CardRegistry, name: string): StaticsInfo {
  const info = staticsInfo(registry, name);
  if (info === null) registry.get(name);
  return info as StaticsInfo;
}

const NO_LANDWALK = { keyword: null, land: null } as const;

/**
 * What a `StaticAbility.landwalk` gives: a land as a filter, or, when that's
 * just a land type with a keyword of its own, that keyword. Landwalk of the
 * chosen type with Island chosen *is* islandwalk (rule 702.14a): a Quagmire or
 * Hammerheim names it, a "creature with islandwalk" sees it. Nothing while no
 * type was chosen.
 */
function staticLandwalk(
  ability: StaticAbility,
  source: GameObject,
): { readonly keyword: Keyword | null; readonly land: CardFilter | null } {
  const spec = ability.landwalk;
  if (spec === undefined) return NO_LANDWALK;
  if (spec !== "chosen-land-type") {
    // Only the land type alone: "snow swampwalk" isn't swampwalk.
    const alone = Object.keys(spec).every((field) => field === "type" || field === "subtype");
    const named = alone && spec.type === "land" ? LANDWALK.find(([, landType]) => landType === spec.subtype) : undefined;
    return named !== undefined ? { keyword: named[0], land: null } : { keyword: null, land: spec };
  }
  const chosen = source.chosenOnEnter;
  if (typeof chosen !== "string") return NO_LANDWALK;
  const named = LANDWALK.find(([, landType]) => landType === chosen);
  return named !== undefined ? { keyword: named[0], land: null } : { keyword: null, land: { type: "land", subtype: chosen } };
}

function contributesToCharacteristics(ability: StaticAbility): boolean {
  return (
    ability.grantPt !== undefined ||
    ability.grantPtPerCount !== undefined ||
    ability.grantKeywords !== undefined ||
    ability.sharesKeywords !== undefined ||
    ability.loseKeywords !== undefined ||
    ability.cantHaveKeywords !== undefined ||
    ability.grantToxic !== undefined ||
    hasRestrictionWord(ability) ||
    ability.combatDamageByToughness !== undefined ||
    (ability.canAttackAsThoughNoDefender !== undefined && ability.canAttackAsThoughNoDefender !== false) ||
    ability.assignAsThoughUnblocked === true ||
    ability.cantBeSacrificed === true ||
    ability.blockAdditional !== undefined ||
    ability.protection !== undefined ||
    ability.hexproofFrom !== undefined ||
    ability.bandsWithOther !== undefined ||
    ability.landwalk !== undefined ||
    ability.setBasePt !== undefined ||
    ability.takesLastExiledCard !== undefined
  );
}

/** One battlefield static that *can* contribute P/T / keywords / restrictions
 * / protection to some permanent — the target-independent half of
 * {@link collectStaticEffects}'s scan, cacheable per region. */
interface ContributingStatic {
  readonly source: GameObject;
  readonly ability: StaticAbility;
  /** A granted static's (`grantedStatics`): its effects take the later of
   * its source's timestamp and the grant's (rule 613.7a). */
  readonly timestamp?: number;
}

/**
 * Every battlefield static that could modify *any* permanent, in battlefield
 * order. The scan (battlefield × each permanent's static list, with the
 * layer-6 ability-loss check) used to run once per **target** inside
 * {@link collectStaticEffects}, making every characteristics read O(board);
 * on most boards almost nothing contributes, so the shared pre-scan collapses
 * that to a short (usually empty) list matched per target. Memoized in the
 * active cache region; per-target matching and condition evaluation stay
 * live, exactly as before.
 */
function contributingStaticSources(
  state: GameState,
  registry: CardRegistry,
): readonly ContributingStatic[] {
  if (activeCache !== null && activeCache.staticSources !== null) {
    return activeCache.staticSources;
  }
  const out = boardScan("contributing", state, registry, scanContributingStaticSources);
  // Not while a granted static's lookup is in progress: what it found may
  // be the guard's conservative answer.
  if (activeCache !== null && staticGrantsInProgress.size === 0) activeCache.staticSources = out;
  return out;
}

function scanContributingStaticSources(state: GameState, registry: CardRegistry): readonly ContributingStatic[] {
  const out: ContributingStatic[] = [];
  for (const sourceId of state.zones.shared.battlefield) {
    const source = state.objects[sourceId];
    // Only P/T-bonus / keyword-grant / restriction statics contribute here,
    // and none that works from a graveyard ("as long as this card is in your
    // graveyard": not from here). A static that is purely a replacement (rule
    // 614 — "enters tapped") or a CDA (`setBasePtFromCount`, handled in its
    // own pass) modifies nothing. See `StaticsInfo`.
    const contributing = staticsOf(registry, rulesTextName(source)).contributing;
    if (
      contributing.length === 0 &&
      !source.modifiers.some((m) => m.grantsStatic !== undefined) &&
      staticGrantSources(state, registry).length === 0
    ) {
      continue;
    }
    // An eliminated player's permanents stay on the board to be looked at but
    // stop affecting the game — so their anthems and lords stop applying too.
    // See the note in `matchesFilter`: they leave play, not view — rule
    // 800.4a would have removed them from the game entirely.
    if (state.players[source.controller]?.hasLost === true) continue;
    // Layer 6 — a permanent that lost its abilities has no statics, bar one
    // with a layer-4 part: that part applied before the loss (layer 4), so
    // the rest of it keeps applying in the later layers (rule 613.6 — see
    // `typeGrantSources`), its layer-6 grants in timestamp order with the
    // loss (`grantOutlastsLoss`).
    const lost = hasLostAbilities(state, registry, source);
    for (const ability of contributing) {
      if (lost && !staticOutlivesLoss(state, registry, source, ability)) continue;
      // A Room's door unlocked on the battlefield: its statics apply from then.
      if (source.doorUnlockedAt === undefined) out.push({ source, ability });
      else out.push({ source, ability, timestamp: staticTimestamp(registry, source, ability) });
    }
    // What a `grant-static` gave it (Earthbind's "Enchanted creature loses
    // flying") or another permanent's static grants it (Inspiring Leader's
    // "commander creatures you own have 'Creature tokens you control get
    // +2/+2'"), timestamped by the later of it and the grant (613.7a).
    const contributes = (ability: StaticAbility): boolean =>
      contributesToCharacteristics(ability) && !hasLayerFourPart(ability);
    for (const { ability, timestamp } of grantedStaticsTimed(state, registry, source, contributes)) {
      if (contributes(ability)) out.push({ source, ability, timestamp });
    }
  }
  // A card's static that functions from its owner's graveyard (rule 113.6b
  // — Wonder's "as long as this card is in your graveyard and you control an
  // Island, creatures you control have flying"), "you" its owner, ordered
  // after the battlefield's by the timestamp it got going there (Anger's
  // ruling).
  for (const player of state.turnOrder) {
    if (state.players[player]?.hasLost === true) continue;
    for (const sourceId of state.zones.perPlayer[player]?.graveyard ?? []) {
      const source = state.objects[sourceId];
      if (source === undefined) continue;
      // One lookup a card: almost every one's text is its printed card's,
      // and an unknown card has none (`staticsInfo`).
      const printed = printedCardName(source);
      const text = rulesTextName(source);
      if (text !== printed && !registry.has(printed)) continue;
      const fromGraveyard = staticsInfo(registry, text)?.fromGraveyard;
      if (fromGraveyard === undefined) continue;
      for (const ability of fromGraveyard) out.push({ source, ability });
    }
  }
  // An emblem's, from the command zone (rules 113.6p, 114.4): any scope a
  // permanent's static has, read from its owner's side, after the
  // battlefield's as its timestamp says.
  for (const { source, ability } of emblemStatics(state)) {
    if (contributesToCharacteristics(ability) && !hasLayerFourPart(ability)) out.push({ source, ability });
  }
  return out;
}

/** Continuous effects from battlefield permanents that apply to `target`.
 *
 * Two passes, because a static scoped by keyword ("other creatures you
 * control **with flying** get +1/+0") depends on every effect that grants or
 * removes that keyword (rule 613.8a): first everything else — including every
 * layer-6 grant, from anthems, emblems and the target's own modifiers — then
 * the keyword-scoped statics, matched against the keywords that produced.
 * The keyword set is built from the pass-one effects themselves rather than
 * a recursive characteristics read, so nothing here re-enters the fold, and
 * it's only built at all when a keyword-scoped static is on the battlefield.
 * One level deep: a keyword-scoped static's *own* keyword grant (Sephara's
 * indestructible) isn't seen by another keyword-scoped static. */
function collectStaticEffects(
  state: GameState,
  registry: CardRegistry,
  target: GameObject,
): AppliedEffect[] {
  const out: AppliedEffect[] = [];
  const sources = contributingStaticSources(state, registry);
  const applied = (source: GameObject, ability: StaticAbility, timestamp = source.timestamp): AppliedEffect | null => {
    // "As long as …" gate (rule 604.3 — ROADMAP Phase 11 EG-3). Checked
    // *after* `staticAffects` so a static that can't reach `target` never
    // evaluates its condition (which may itself read other permanents'
    // characteristics — checking it eagerly would recurse).
    if (
      ability.condition !== undefined &&
      !staticConditionMet(state, registry, source, ability.condition)
    ) {
      return null;
    }
    // A count-scaled bonus is read live, from the source's controller's
    // perspective — the same way `setBasePtFromCount` reads its own.
    let scaledPower = 0;
    let scaledToughness = 0;
    // Whose side "you" is: the source's controller, or its chosen player.
    const side =
      ability.grantPtPerCount?.fromAffectedController === true
        ? target.controller
        : (countSide(state, source, ability.grantPtPerCount?.forChosenPlayer, ability.grantPtPerCount?.forDefendingPlayer) ?? source.controller);
    const nobody =
      (ability.grantPtPerCount?.forChosenPlayer === true || ability.grantPtPerCount?.forDefendingPlayer === true) &&
      countSide(state, source, ability.grantPtPerCount.forChosenPlayer, ability.grantPtPerCount.forDefendingPlayer) === undefined;
    // Cards in exile, which is one shared zone: "cards your opponents own
    // in exile" is `ownedBy`, read from the source's controller's side.
    const exiledMatching = (exiledFilter: CardFilter): number =>
      state.zones.shared.exile.filter(
        (id) =>
          state.objects[id]?.isToken !== true &&
          matchesFilter(state, registry, id, exiledFilter, { you: side }),
      ).length;
    // Cards in graveyards: "each creature card in your graveyard" is
    // `ownedBy`, read from the source's controller's side.
    const graveyardMatching = (graveyardFilter: CardFilter): number => {
      let n = 0;
      for (const player of state.turnOrder) {
        for (const id of state.zones.perPlayer[player]?.graveyard ?? []) {
          if (matchesFilter(state, registry, id, graveyardFilter, { you: side })) n += 1;
        }
      }
      return n;
    };
    if (ability.grantPtPerCount !== undefined) {
      const per = ability.grantPtPerCount;
      // Whose "it" and "other" the filter means: this permanent's, or each
      // affected one's (`relativeToAffected`).
      const countedFrom = per.relativeToAffected === true ? target : source;
      const filter =
        per.filter !== undefined && per.sharesCreatureTypeWithAffected === true
          ? { ...per.filter, subtypes: creatureTypesOf(state, registry, target) }
          : per.filter;
      // The permanents on the battlefield matching `f`, the guard held by the
      // caller — see `countInProgress`.
      const matchingIds = (f: CardFilter): readonly ObjectId[] =>
        // Skipping the source before `matchesFilter` is what keeps Skycat
        // Sovereign ("each *other* creature with flying") from folding its
        // own characteristics to answer its own bonus.
        state.zones.shared.battlefield.filter(
          (id) =>
            !(per.excludeSelf === true && id === countedFrom.id) &&
            matchesFilter(state, registry, id, f, { you: side, source: countedFrom.id }),
        );
      const battlefieldMatching = (f: CardFilter): number => {
        if (countInProgress.has(source.id)) return 0;
        countInProgress.add(source.id);
        try {
          return (
            permanentCount(state, matchingIds(f)) +
            (per.excludeSelf === true ? othersInOwnStack(state, registry, countedFrom, f, side) : 0)
          );
        } finally {
          countInProgress.delete(source.id);
        }
      };
      const countersAmong = (among: NonNullable<typeof per.countersAmong>): number => {
        if (countInProgress.has(source.id)) return 0;
        countInProgress.add(source.id);
        try {
          return matchingIds(among.filter).reduce((total, id) => {
            const object = state.objects[id];
            return total + (object.counters[among.counter] ?? 0) * (object.stackCount ?? 1);
          }, 0);
        } finally {
          countInProgress.delete(source.id);
        }
      };
      // A sum, greatest or count over a set (`AggregateSpec`), behind the
      // same guard: Carrion Grub's "the greatest power among creature cards
      // in your graveyard", Emissary Escort's "the greatest mana value among
      // other artifacts you control".
      const aggregateMatching = (spec: AggregateSpec): number => {
        if (countInProgress.has(source.id)) return 0;
        countInProgress.add(source.id);
        try {
          const except = spec.excludeSelf === true ? [source.id] : [];
          // A lone source left out is skipped before its filter is asked, as
          // `battlefieldMatching` does; a stack's other tokens still count.
          const skip = spec.excludeSelf === true && (source.stackCount ?? 1) === 1 ? source.id : undefined;
          const matches = aggregateMatches(state, registry, spec, side, {
            except,
            source: source.id,
            battlefieldMatch: (id, f) =>
              id !== skip && matchesFilter(state, registry, id, f, { you: side, source: source.id }),
          });
          return Math.max(0, aggregateOver(state, registry, matches, spec));
        } finally {
          countInProgress.delete(source.id);
        }
      };
      const counted = nobody
        ? 0
        : per.ofAffected !== undefined
          ? affectedCharacteristicCount(state, registry, target, per.ofAffected)
          : per.countersAmong !== undefined
          ? countersAmong(per.countersAmong)
          : per.anyCountersOnSource === true
          ? Object.values(source.counters).reduce((total, count) => total + (count ?? 0), 0)
          : per.anyCountersOnAffected === true
          ? Object.values(target.counters).reduce((total, count) => total + (count ?? 0), 0)
          : per.turnStat !== undefined
          ? turnStatOf(state, side, per.turnStat)
          : per.turnHistory !== undefined
          ? journalCount(state, registry, [side], per.turnHistory.what, per.turnHistory.filter, side)
          : per.unspentMana !== undefined
          ? unspentManaOf(state, side, per.unspentMana.type)
          : per.basicLandTypes === true
          ? basicLandTypesAmong(state, registry, side)
          : per.opponents === true
          ? state.turnOrder.filter((p) => p !== side && state.players[p]?.hasLost !== true).length
          : per.aggregate !== undefined
          ? aggregateMatching(per.aggregate)
          : per.cardsInHand !== undefined
          ? cardsInHandFor(state, per.cardsInHand, side, target)
          : per.lifeTotal === true
          ? (state.players[side]?.life ?? 0)
          : per.commanderCasts === true
          ? Object.values(state.players[side]?.commanderCastCounts ?? {}).reduce(
              (total, casts) => total + casts,
              0,
            )
          : per.playerCounters !== undefined
            ? per.playerCountersOf === "opponents"
              ? state.turnOrder.reduce(
                  (total, p) => (p === side ? total : total + (state.players[p]?.counters[per.playerCounters!] ?? 0)),
                  0,
                )
              : (state.players[side]?.counters[per.playerCounters] ?? 0)
            : per.speed === true
            ? speedOf(state, side)
            : per.partySize === true
            ? partySizeOf(state, registry, side)
            : per.countersOnAffected !== undefined
            ? (target.counters[per.countersOnAffected] ?? 0)
            : per.countersOnSource !== undefined
            ? (source.counters[per.countersOnSource] ?? 0)
            : per.exiled !== undefined
            ? exiledMatching(per.exiled)
            : per.inGraveyard !== undefined
            ? graveyardMatching(per.inGraveyard)
            : per.commanderManaValue === "greatest"
            ? greatestCommanderManaValue(state, registry, side)
            : per.colorsAmong !== undefined
            ? colorsAmongPermanents(
                state,
                registry,
                side,
                per.colorsAmong,
                per.excludeSelf === true ? [source.id] : [],
              )
            : filter === undefined
            ? 0
            : battlefieldMatching(filter);
      const stepped = per.step !== undefined ? Math.floor(counted / per.step) : counted;
      const n = per.max !== undefined ? Math.min(stepped, per.max) : stepped;
      scaledPower = n * per.pt[0];
      scaledToughness = n * per.pt[1];
    }
    const walk = staticLandwalk(ability, source);
    const granted = walk.keyword !== null ? [...(ability.grantKeywords ?? []), walk.keyword] : (ability.grantKeywords ?? []);
    return {
      timestamp,
      power: (ability.grantPt?.[0] ?? 0) + scaledPower,
      toughness: (ability.grantPt?.[1] ?? 0) + scaledToughness,
      // "… as long as an exiled card used to craft it has flying".
      keywords:
        ability.sharesKeywords !== undefined
          ? [...granted, ...(sharedKeywordsOf(state, registry, ability, source)?.keywords ?? [])]
          : granted,
      loseKeywords: ability.loseKeywords ?? [],
      cantHaveKeywords: ability.cantHaveKeywords ?? [],
      ownAt: source.id === target.id && timestamp === source.timestamp ? -Infinity : timestamp,
      toxic: ability.grantToxic ?? 0,
      restrictions: ability.restrictions ?? [],
      combatDamageByToughness: ability.combatDamageByToughness,
      canAttackAsThoughNoDefender: ability.canAttackAsThoughNoDefender === true,
      canAttackAttackersDespiteDefender: ability.canAttackAsThoughNoDefender === "players-who-attacked-you",
      assignAsThoughUnblocked: ability.assignAsThoughUnblocked === true,
      cantBeSacrificed: ability.cantBeSacrificed === true,
      blockAdditional: ability.blockAdditional ?? 0,
      protection: staticProtection(state, registry, ability, source),
      hexproofFrom: ability.hexproofFrom ?? null,
      bandsWithOther: ability.bandsWithOther ?? null,
      landwalk: walk.land,
      setBase:
        ability.setBasePt !== undefined
          ? staticBasePt(state, registry, source, ability.setBasePt, target)
          : ability.takesLastExiledCard !== undefined
            ? lastExiledCardPt(state, registry, source, ability.takesLastExiledCard.filter)
            : null,
    };
  };
  let keywordScoped = false;
  for (const { source, ability, timestamp } of sources) {
    if (isPtScopedRestriction(ability)) continue;
    if (scopedByKeyword(ability.affects) || scopedByAbilities(ability.affects)) {
      keywordScoped = true;
      continue;
    }
    if (!staticReaches(state, registry, source, ability, target, { inFold: true })) continue;
    const effect = applied(source, ability, timestamp);
    if (effect !== null) out.push(effect);
    // The protection and "hexproof from" abilities a `sharesKeywords` static
    // finds, each its own ability (rules 702.16a, 702.11f): one effect apiece,
    // at the static's timestamp.
    if (effect !== null && ability.sharesKeywords !== undefined) {
      const shared = sharedKeywordsOf(state, registry, ability, source);
      const bare: AppliedEffect = {
        timestamp: effect.timestamp,
        ownAt: effect.ownAt,
        power: 0,
        toughness: 0,
        keywords: [],
        loseKeywords: [],
        cantHaveKeywords: [],
        toxic: 0,
        restrictions: [],
        combatDamageByToughness: undefined,
        canAttackAsThoughNoDefender: false,
        canAttackAttackersDespiteDefender: false,
        assignAsThoughUnblocked: false,
        cantBeSacrificed: false,
        blockAdditional: 0,
        protection: null,
        hexproofFrom: null,
        bandsWithOther: null,
        landwalk: null,
        setBase: null,
      };
      for (const protection of shared?.protections ?? []) out.push({ ...bare, protection });
      for (const hexproofFrom of shared?.hexproofs ?? []) out.push({ ...bare, hexproofFrom });
    }
  }
  if (keywordScoped) {
    let keywords: Set<Keyword> | null = null;
    const targetKeywords = (): ReadonlySet<Keyword> => {
      if (keywords === null) {
        keywords = new Set(
          hasLostAbilities(state, registry, target) ? [] : registry.get(rulesTextName(target)).keywords,
        );
        const lostAt = target.zone === "battlefield" ? abilitiesLostAt(state, registry, target) : null;
        // The same timestamp order as the main fold's (rule 613.7).
        const losses = keywordLosses(out, target);
        for (const loss of losses) keywords.delete(loss.keyword as Keyword);
        for (const effect of out) {
          if (!grantOutlastsLoss(lostAt, effect.timestamp)) continue;
          for (const k of effect.keywords) if (!lostAfter(losses, k, effect.timestamp)) keywords.add(k);
        }
        for (const modifier of target.modifiers) {
          if (!modifierGrantApplies(modifier, lostAt)) continue;
          for (const k of modifier.keywords) if (!lostAfter(losses, k, modifier.timestamp)) keywords.add(k);
        }
        for (const k of keywordCountersOn(target)) {
          const at = keywordCounterTimestamp(target, k);
          if (grantOutlastsLoss(lostAt, at) && !lostAfter(losses, k, at)) keywords.add(k);
        }
        if (suspectedGrantsApply(state, registry, target) && !lostAfter(losses, "menace", -Infinity)) keywords.add("menace");
        for (const keyword of keywordsForbiddenBy(out, target) ?? []) keywords.delete(keyword);
      }
      return keywords;
    };
    // Its total toxic so far (rule 702.164b): printed, less ability loss, and
    // every instance granted by the first pass's statics and its own
    // modifiers, as the main fold adds them up — what "creatures you control
    // with toxic have lifelink" (Skrelv's Hive) reads (rule 613.8).
    let toxicSoFar: number | null = null;
    const targetToxic = (): number => {
      if (toxicSoFar === null) {
        const lostAt = target.zone === "battlefield" ? abilitiesLostAt(state, registry, target) : null;
        let toxic = hasLostAbilities(state, registry, target) ? 0 : registry.get(rulesTextName(target)).toxic;
        for (const effect of out) if (grantOutlastsLoss(lostAt, effect.timestamp)) toxic += effect.toxic;
        for (const modifier of target.modifiers) {
          if (modifier.toxic !== undefined && modifierGrantApplies(modifier, lostAt)) toxic += modifier.toxic;
        }
        toxicSoFar = toxic;
      }
      return toxicSoFar;
    };
    const second: AppliedEffect[] = [];
    for (const { source, ability, timestamp } of sources) {
      if (!scopedByKeyword(ability.affects) || scopedByAbilities(ability.affects) || isPtScopedRestriction(ability)) continue;
      if (
        !staticReaches(state, registry, source, ability, target, {
          inFold: true,
          keywords: targetKeywords,
          toxic: targetToxic,
        })
      ) {
        continue;
      }
      const effect = applied(source, ability, timestamp);
      if (effect !== null) second.push(effect);
    }
    out.push(...second);
    // "Creatures with no abilities" last, seeing what those keyword-scoped
    // statics just granted.
    keywords = null;
    const hasProtection = (): boolean => {
      const lostAt = target.zone === "battlefield" ? abilitiesLostAt(state, registry, target) : null;
      return (
        out.some((effect) => effect.protection !== null && grantOutlastsLoss(lostAt, effect.timestamp)) ||
        target.modifiers.some((modifier) => modifier.protection !== undefined && modifierGrantApplies(modifier, lostAt))
      );
    };
    const third: AppliedEffect[] = [];
    for (const { source, ability, timestamp } of sources) {
      if (!scopedByAbilities(ability.affects) || isPtScopedRestriction(ability)) continue;
      if (!staticReaches(state, registry, source, ability, target, { inFold: true, keywords: targetKeywords, toxic: targetToxic, hasProtection })) continue;
      const effect = applied(source, ability, timestamp);
      if (effect !== null) third.push(effect);
    }
    out.push(...third);
  }
  out.sort((a, b) => a.timestamp - b.timestamp);
  return out;
}

export function computeCharacteristics(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
): Characteristics {
  // Cache only outside condition evaluation — a value computed while any
  // static condition is in progress may be the re-entrancy guard's
  // conservative answer, not the true one (see `conditionInProgress`).
  if (activeCache !== null && !guardActive()) {
    const hit = activeCache.chars.get(id);
    if (hit !== undefined) {
      if (cacheCheck) assertSameCharacteristics(hit, computeCharacteristicsUncached(state, registry, id), id);
      return hit;
    }
    const value = computeCharacteristicsUncached(state, registry, id);
    activeCache.chars.set(id, value);
    return value;
  }
  return computeCharacteristicsUncached(state, registry, id);
}

/** Throw if a cached {@link Characteristics} diverges from a fresh compute —
 * the {@link setComputedCacheCheck} self-check. */
function assertSameCharacteristics(
  cached: Characteristics,
  fresh: Characteristics,
  id: ObjectId,
): void {
  const show = (c: Characteristics): string =>
    JSON.stringify({
      power: c.power,
      toughness: c.toughness,
      basePower: c.basePower,
      baseToughness: c.baseToughness,
      keywords: [...c.keywords].sort(),
      toxic: c.toxic,
      types: [...c.types].sort(),
      subtypes: [...c.subtypes].sort(),
      colors: [...c.colors].sort(),
      controller: c.controller,
      restrictions: [...c.restrictions].sort(),
      damageByToughness: c.damageByToughness,
      assignsNoCombatDamage: c.assignsNoCombatDamage === true,
      extraBlocks: c.extraBlocks ?? 0,
      canAttackAsThoughNoDefender: c.canAttackAsThoughNoDefender,
      canAttackAttackersDespiteDefender: c.canAttackAttackersDespiteDefender,
      assignAsThoughUnblocked: c.assignAsThoughUnblocked ?? null,
      cantBeSacrificed: c.cantBeSacrificed,
      protColors: [...c.protectionFrom.colors].sort(),
      protTypes: [...c.protectionFrom.types].sort(),
      // Serialised whole: a filter is a plain object, and two of them
      // differing is exactly the divergence this check exists to catch.
      protFilters: c.protectionFrom.filters.map((f) => JSON.stringify(f)).sort(),
      protBoundFilters: c.protectionFrom.boundFilters.map((f) => JSON.stringify(f)).sort(),
      protPlayers: [...c.protectionFrom.players].sort(),
      protSparing: c.protectionFrom.sparing === undefined ? null : c.protectionFrom.sparing.instances.map((i) => `${typeof i.aura === "string" ? i.aura : JSON.stringify(i.aura)}:${[...i.colors].sort().join("")}:${[...i.types].sort().join("")}`).sort(),
      hexColors: [...c.hexproofFrom.colors].sort(),
      hexTypes: [...c.hexproofFrom.types].sort(),
      hexFilters: c.hexproofFrom.filters.map((f) => JSON.stringify(f)).sort(),
      hexQualified: c.hexproofFrom.qualified.map((q) => JSON.stringify(q)).sort(),
      bandsWithOther: c.bandsWithOther.map((f) => JSON.stringify(f)).sort(),
      landwalk: c.landwalk.map((f) => JSON.stringify(f)).sort(),
    });
  const a = show(cached);
  const b = show(fresh);
  if (a !== b) {
    throw new Error(
      `computed-cache divergence for ${id}: cached ${a} vs fresh ${b} — a mutation inside a cache region is missing an invalidateComputedCache() call`,
    );
  }
}

function computeCharacteristicsUncached(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
): Characteristics {
  const object = state.objects[id];
  const def = printedDefinition(registry, object);
  // Its abilities are its text's: another card's, after an exchange of text
  // boxes (layer 3, rule 612.5).
  const text = registry.get(rulesTextName(object));

  const onBattlefield = object.zone === "battlefield";
  const lostAbilities = onBattlefield && hasLostAbilities(state, registry, object);

  // A station card's printed power and toughness are a station symbol's
  // (rule 721.2b): it has them only through that symbol's static ability, so
  // never in another zone (721.2c) or below that symbol's threshold, and not
  // when something else makes it a creature (the station ruling).
  const printedPt = !def.activated.some((ability) => ability.station === true);
  let power = printedPt ? (def.power ?? 0) : 0;
  let toughness = printedPt ? (def.toughness ?? 0) : 0;
  // Layer 6 — a permanent that lost its abilities keeps no printed keywords,
  // nor its printed toxic.
  const keywords = new Set<Keyword>(lostAbilities ? [] : text.keywords);
  let toxic = lostAbilities ? 0 : text.toxic;
  // Layers 3 + 4 — text substitution, then every type-changing effect in
  // timestamp order: the object's own modifiers (a man-land's animation adds
  // `creature`) and type-granting statics. A spell's own count too, as
  // `effectiveTypes` already has them: The Tomb of Aclazotz's creature spell
  // "is a Vampire" on the stack (its ruling).
  const layer4 =
    onBattlefield ||
    (object.zone === "stack" && object.modifiers.length > 0) ||
    outsideTypeSources(state, registry).length > 0 ||
    selfOutsideBattlefield(registry, object) !== undefined
      ? layerFour(state, registry, object)
      : null;
  const types: readonly CardType[] = layer4?.types ?? def.types;
  // Off the battlefield, changeling still applies (rule 604.3): a changeling
  // card in a library is a Goblin card to a tutor.
  const subtypes: readonly string[] = layer4?.subtypes ?? withChangeling(def, def.subtypes, text);
  // Layer 5 — colour-changing effects.
  // A spell on the stack has any an effect gave it ("target spell becomes
  // black" — Deathlace, `become`) as well as copiable ones (a
  // prototyped spell's — rule 718.3b); elsewhere off the battlefield only
  // copiable values change them.
  const colors: ReadonlySet<Color> = onBattlefield || object.zone === "stack"
    ? effectiveColors(state, registry, object)
    : object.modifiers.some((m) => m.copiable === true)
      ? effectiveColors(null, registry, { ...object, modifiers: object.modifiers.filter((m) => m.copiable === true) })
      : new Set(def.colors);

  const staticEffects = onBattlefield
    ? collectStaticEffects(state, registry, object)
    : [];

  // Layer 6 — ability adds, each against a loss of all abilities in
  // timestamp order (below).
  // `collectStaticEffects` already includes a permanent's own `"self"`
  // restriction static (Juggernaut) as well as external ones (Pacifism).
  const restrictions = new Set<CombatWord>();
  const protColors = new Set<Color>();
  const protTypes = new Set<CardType>();
  const protFilters: CardFilter[] = [];
  const protBoundFilters: { filter: CardFilter; source: ObjectId }[] = [];
  const protPlayers = new Set<PlayerId>();
  // 702.16n's instances, and every other instance's qualities (`sparing`).
  const protSparing: { aura: SparedAttachments; colors: readonly Color[]; types: readonly CardType[] }[] = [];
  const protOtherColors = new Set<Color>();
  const protOtherTypes = new Set<CardType>();
  const hexColors = new Set<Color>();
  const hexTypes = new Set<CardType>();
  const hexFilters: CardFilter[] = [];
  const hexQualified: NonNullable<StaticAbility["hexproofFrom"]>[] = [];
  const bandsWithOther: CardFilter[] = [];
  const landwalk: CardFilter[] = [];
  let byToughness: StaticAbility["combatDamageByToughness"];
  let assignsNoCombatDamage = false;
  let canAttackAsThoughNoDefender = false;
  let canAttackAttackersDespiteDefender = false;
  let assignAsThoughUnblocked: "may" | "must" | undefined;
  let cantBeSacrificed = false;
  let extraBlocks: number | "any" = 0;
  const addBlocks = (more: number | "any"): void => {
    extraBlocks = extraBlocks === "any" || more === "any" ? "any" : extraBlocks + more;
  };
  // What another permanent's static or an effect grants it in layer 6 goes
  // with a loss of all its abilities that came after (rule 613.7); what they
  // merely stop it doing (Pacifism's "can't attack", "can't be sacrificed")
  // isn't an ability it has, and stays.
  const lostAt = onBattlefield ? abilitiesLostAt(state, registry, object) : null;
  // A keyword loss ("loses flying") takes away what had the keyword before
  // it — printed, or granted earlier — and a later grant gives it back (rule
  // 613.7).
  const losses = keywordLosses(staticEffects, object);
  // (`"protection"` and `"ward"` are never in the set: protection is gated
  // below, ward in `Game.effectiveTriggeredEntries`.)
  for (const loss of losses) keywords.delete(loss.keyword as Keyword);
  for (const effect of staticEffects) {
    const granted = grantOutlastsLoss(lostAt, effect.timestamp);
    if (granted) {
      for (const keyword of effect.keywords) if (!lostAfter(losses, keyword, effect.timestamp)) keywords.add(keyword);
    }
    // Each grant is one more instance of toxic, and instances add up (rule
    // 702.164b).
    if (granted) toxic += effect.toxic;
    for (const r of effect.restrictions) if (typeof r === "string") restrictions.add(r);
    if (effect.combatDamageByToughness !== undefined && byToughness !== "always") {
      byToughness = effect.combatDamageByToughness;
    }
    if (effect.canAttackAsThoughNoDefender) canAttackAsThoughNoDefender = true;
    if (effect.canAttackAttackersDespiteDefender) canAttackAttackersDespiteDefender = true;
    // A rule about how it assigns damage, not an ability it has (Indomitable
    // Might's "enchanted creature's controller may have it …"), so no loss
    // of abilities ends it.
    if (effect.assignAsThoughUnblocked) assignAsThoughUnblocked ??= "may";
    if (effect.cantBeSacrificed) cantBeSacrificed = true;
    if (granted && effect.blockAdditional !== 0) addBlocks(effect.blockAdditional);
    // Protection goes with a later loss of it (rule 613.7 — Shay Cormac), a
    // permanent's own printed instance with any.
    if (effect.protection && granted && !lostAfter(losses, "protection", effect.ownAt)) {
      if (effect.protection.sparesAura !== undefined) {
        protSparing.push({ aura: effect.protection.sparesAura, colors: effect.protection.colors ?? [], types: effect.protection.types ?? [] });
      } else {
        for (const c of effect.protection.colors ?? []) protOtherColors.add(c);
        for (const t of effect.protection.types ?? []) protOtherTypes.add(t);
      }
      for (const c of effect.protection.colors ?? []) protColors.add(c);
      for (const t of effect.protection.types ?? []) protTypes.add(t);
      if (effect.protection.filter !== undefined) {
        if (effect.protection.filterSource !== undefined) {
          protBoundFilters.push({ filter: effect.protection.filter, source: effect.protection.filterSource });
        } else {
          protFilters.push(effect.protection.filter);
        }
      }
      for (const p of effect.protection.players ?? []) protPlayers.add(p);
    }
    // A loss of hexproof takes every "hexproof from" with it (rule 702.11e).
    // A "can't be the target of …" that isn't the keyword (`notHexproof` —
    // Shanna, Sisay's Legacy) stays.
    const hexproofFromStays =
      granted && (effect.hexproofFrom?.notHexproof === true || !lostAfter(losses, "hexproof", effect.ownAt));
    if (effect.hexproofFrom && hexproofFromStays && isQualifiedHexproof(effect.hexproofFrom)) {
      hexQualified.push(effect.hexproofFrom);
    } else if (effect.hexproofFrom && hexproofFromStays) {
      for (const c of effect.hexproofFrom.colors ?? []) hexColors.add(c);
      // "Hexproof from each of its colors" (Tam): this permanent's own, as
      // layer 5 left them.
      if (effect.hexproofFrom.ownColors === true) for (const c of colors) hexColors.add(c);
      for (const t of effect.hexproofFrom.types ?? []) hexTypes.add(t);
      if (effect.hexproofFrom.filter !== undefined) hexFilters.push(effect.hexproofFrom.filter);
    }
    // "Bands with other" goes with a later loss of it, or of banding (rule
    // 702.22b).
    if (
      effect.bandsWithOther !== null &&
      granted &&
      !lostAfter(losses, "bands-with-other", effect.timestamp) &&
      !lostAfter(losses, "banding", effect.timestamp)
    ) {
      bandsWithOther.push(effect.bandsWithOther);
    }
    // Landwalk goes with a later loss of it (rule 702.14; a creature's own, with
    // any — Hammerheim).
    if (effect.landwalk !== null && granted && !lostAfter(losses, "landwalk", effect.ownAt)) {
      landwalk.push(effect.landwalk);
    }
  }
  // A spell's keywords from what grants them to spells (`grantsToSpells`).
  if (object.zone === "stack" && object.kind === "card") {
    for (const keyword of spellGrantedKeywords(state, registry, object)) keywords.add(keyword);
  }
  // Off the battlefield, a static reaching there (rule 604.1): "creature
  // cards you own that aren't on the battlefield have flash" (Teferi, Mage
  // of Zhalfir) — an ability the source has, so not while it has lost them.
  if (!onBattlefield && object.kind === "card") {
    for (const { source, ability } of outsideTypeSources(state, registry)) {
      const granted = ability.outsideBattlefield?.keywords;
      if (granted === undefined || hasLostAbilities(state, registry, source)) continue;
      if (!outsideReaches(state, registry, source, ability, object, types)) continue;
      for (const keyword of granted) keywords.add(keyword);
    }
  }
  for (const modifier of object.modifiers) {
    const granted = modifierGrantApplies(modifier, lostAt);
    if (granted) {
      for (const keyword of modifier.keywords) {
        if (!lostAfter(losses, keyword, modifier.timestamp)) keywords.add(keyword);
      }
    }
    for (const r of modifier.restrictions ?? []) if (typeof r === "string") restrictions.add(r);
    // A granted "This creature can't be sacrificed" is an ability, and goes
    // with a later loss like a granted keyword.
    if (granted && modifier.cantBeSacrificed === true) cantBeSacrificed = true;
    if (granted && modifier.blockAdditional !== undefined) addBlocks(modifier.blockAdditional);
    // Granted protection (the `grant-protection` effect) is an ability too.
    if (granted && modifier.protection !== undefined && !lostAfter(losses, "protection", modifier.timestamp)) {
      for (const c of modifier.protection.colors ?? []) {
        protColors.add(c);
        protOtherColors.add(c);
      }
      for (const t of modifier.protection.types ?? []) {
        protTypes.add(t);
        protOtherTypes.add(t);
      }
      if (modifier.protection.filter !== undefined) protFilters.push(modifier.protection.filter);
      // Fixed as it resolved; a static's own "opponents" is `protectionPlayers`'.
      const players = modifier.protection.fromPlayers;
      if (players !== undefined && players !== "opponents") for (const p of players) protPlayers.add(p);
    }
    // Granted hexproof from a quality, and a later loss of hexproof takes it
    // (rule 702.11e).
    if (granted && modifier.hexproofFrom !== undefined && !lostAfter(losses, "hexproof", modifier.timestamp)) {
      for (const c of modifier.hexproofFrom.colors ?? []) hexColors.add(c);
      for (const t of modifier.hexproofFrom.types ?? []) hexTypes.add(t);
      if (modifier.hexproofFrom.filter !== undefined) hexFilters.push(modifier.hexproofFrom.filter);
    }
    // Granted toxic adds an instance (rule 702.164b), lost the same way.
    if (granted && modifier.toxic !== undefined) toxic += modifier.toxic;
    // Rules about it rather than abilities it has: no loss of abilities
    // ends them.
    if (modifier.canAttackAsThoughNoDefender === true) canAttackAsThoughNoDefender = true;
    if (modifier.combatDamageByToughness === true) byToughness = "always";
    if (modifier.assignsNoCombatDamage === true) assignsNoCombatDamage = true;
    // "Must" outweighs "may": Outmaneuver leaves no choice.
    if (modifier.assignAsThoughUnblocked !== undefined && assignAsThoughUnblocked !== "must") {
      assignAsThoughUnblocked = modifier.assignAsThoughUnblocked;
    }
  }
  for (const keyword of keywordCountersOn(object)) {
    const at = keywordCounterTimestamp(object, keyword);
    if (grantOutlastsLoss(lostAt, at) && !lostAfter(losses, keyword, at)) keywords.add(keyword);
  }
  // Rule 701.60c — a suspected permanent has menace and "This creature can't
  // block" for as long as it's suspected.
  if (onBattlefield && suspectedGrantsApply(state, registry, object)) {
    if (!lostAfter(losses, "menace", -Infinity)) keywords.add("menace");
    restrictions.add("cant-block");
  }
  // "Can't have or gain flying": no timestamp beats it. Everything above that
  // gives a keyword has had its turn, so this comes last.
  const forbidden = keywordsForbiddenBy(staticEffects, object);
  if (forbidden !== null) {
    for (const keyword of forbidden) keywords.delete(keyword);
    if (forbidden.has("hexproof")) {
      hexColors.clear();
      hexTypes.clear();
      hexFilters.length = 0;
      hexQualified.length = 0;
    }
  }

  // Layer 7b — base P/T set by this object's own characteristic-defining
  // ability (rule 604.3 / 613.4b). Only a `"self"` static applies — and not
  // if the permanent has lost its abilities. A CDA works in every zone
  // (604.3), so a Psychosis Crawler in a library or graveyard is as big as
  // its owner's hand, which a "creature card with power 2 or less" search
  // has to see.
  if (!lostAbilities) {
    for (const ability of text.static) {
      if (ability.setBasePtFromCount === undefined) continue;
      if (cdaInProgress.has(object.id)) continue;
      if (
        ability.condition !== undefined &&
        !staticConditionMet(state, registry, object, ability.condition)
      ) {
        continue;
      }
      let n: number;
      cdaInProgress.add(object.id);
      try {
        n = basePtCount(state, registry, object, ability.setBasePtFromCount);
      } finally {
        cdaInProgress.delete(object.id);
      }
      // A CDA may define only one of the two, the other staying as printed
      // (Eluge, the Shoreless Sea's "*/5").
      const only = ability.setBasePtFromCount.only;
      if (only !== "toughness") power = n + ability.setBasePtFromCount.plusPower;
      if (only !== "power") {
        toughness =
          ability.setBasePtFromCount.toughnessMinusCount === true
            ? ability.setBasePtFromCount.plusToughness - n
            : n + ability.setBasePtFromCount.plusToughness;
      }
    }
  }
  // Layer 7b — a "becomes a N/N" (man-land animation, Turn to Frog) and a
  // static's "has base power and toughness N/N" (Kudo) *set* base P/T, in
  // timestamp order (rule 613.7): latest wins. The first is part of the
  // effect, not the permanent's own CDA, so it still applies when the same
  // effect also removed its abilities. Before counters (7c) and bonuses (7d).
  if (onBattlefield) {
    const sets: { key: number; power?: number; toughness?: number }[] = [];
    for (const effect of staticEffects) {
      if (effect.setBase !== null) sets.push({ key: effect.timestamp, ...effect.setBase });
    }
    for (const modifier of object.modifiers) {
      if (modifier.setPt) {
        sets.push({ key: modifierKey(modifier), power: modifier.setPt[0], toughness: modifier.setPt[1] });
      }
      // Toughness alone (an exchange with a life total — rule 701.12g — or
      // "has base toughness 1"), power alone ("has base power 0").
      if (modifier.setToughness !== undefined) {
        sets.push({ key: modifierKey(modifier), toughness: modifier.setToughness });
      }
      if (modifier.setPower !== undefined) {
        sets.push({ key: modifierKey(modifier), power: modifier.setPower });
      }
      // A granted "base power is equal to …" (Ms. Marvel, Kamala Khan): not a
      // characteristic-defining ability (rule 604.3a(2)), so a 7b set at the
      // grant's timestamp, read live like a CDA's count.
      if (modifier.grantsStatic !== undefined && !cdaInProgress.has(object.id)) {
        if (!modifierGrantApplies(modifier, abilitiesLostAt(state, registry, object))) continue;
        for (const ability of modifier.grantsStatic) {
          const from = ability.setBasePtFromCount;
          if (from === undefined) continue;
          let n: number;
          cdaInProgress.add(object.id);
          try {
            n = basePtCount(state, registry, object, from);
          } finally {
            cdaInProgress.delete(object.id);
          }
          sets.push({
            key: modifierKey(modifier),
            ...(from.only !== "toughness" ? { power: n + from.plusPower } : {}),
            ...(from.only !== "power" ? { toughness: n + from.plusToughness } : {}),
          });
        }
      }
    }
    sets.sort((a, b) => a.key - b.key);
    for (const set of sets) {
      if (set.power !== undefined) power = set.power;
      if (set.toughness !== undefined) toughness = set.toughness;
    }
  } else {
    // Off the battlefield only copiable values set it: a prototyped spell's
    // "1/1" on the stack (rule 718.3b). And "as long as it isn't on the
    // battlefield, it's a 1/1" (Grist).
    const outside = selfOutsideBattlefield(registry, object);
    if (outside !== undefined) {
      power = outside.power;
      toughness = outside.toughness;
    }
    for (const modifier of object.modifiers) {
      if (modifier.copiable === true && modifier.setPt) [power, toughness] = modifier.setPt;
    }
  }
  // Base power and toughness: everything up to here (rule 613.4b), nothing
  // after.
  const basePower = power;
  const baseToughness = toughness;

  // Layer 7c (rule 613.4c) — P/T counters, then the modifications.
  for (const [counter, count] of Object.entries(object.counters)) {
    const bonus = counterPtBonus(counter);
    power += bonus.power * count;
    toughness += bonus.toughness * count;
  }

  // P/T modifications (additive; order does not affect the result).
  for (const effect of staticEffects) {
    power += effect.power;
    toughness += effect.toughness;
  }
  for (const modifier of object.modifiers) {
    power += modifier.power;
    toughness += modifier.toughness;
  }
  // Off the battlefield, a static reaching there (rule 604.1): "creature
  // spells you control and creature cards you own in any zone other than the
  // battlefield or the stack get +3/+3" (The Muckslinger Gang).
  if (!onBattlefield && object.kind === "card") {
    for (const { source, ability } of outsideTypeSources(state, registry)) {
      const grant = ability.outsideBattlefield?.grantPt;
      if (grant === undefined || !outsideReaches(state, registry, source, ability, object, types)) continue;
      power += grant[0];
      toughness += grant[1];
    }
  }
  // Rule 613.4d — switches, after every other P/T effect and counter (the
  // 7c above). Each takes the power as it stands to the toughness and back.
  for (const modifier of object.modifiers) {
    if (modifier.switchPt === true) [power, toughness] = [toughness, power];
  }

  // "Assigns combat damage equal to its toughness" — resolved here, after
  // the whole P/T fold, since the "with toughness greater than its power"
  // form asks about the final values.
  const damageByToughness =
    byToughness === "always" || (byToughness === "if-toughness-greater" && toughness > power);

  // Decayed's static half (rule 702.147a): "This creature can't block" — for
  // as long as it has the keyword, however it got it.
  if (keywords.has("decayed")) restrictions.add("cant-block");
  // What "bands with other" shows as, and what a loss of it names (702.22b).
  if (bandsWithOther.length > 0) keywords.add("bands-with-other");
  if (landwalk.length > 0) keywords.add("landwalk");
  // Unleash's static half (rule 702.98a): "This permanent can't block as
  // long as it has a +1/+1 counter on it" — any +1/+1 counter, not only
  // the one unleash put there (the ruling).
  if (keywords.has("unleash") && (object.counters["+1/+1"] ?? 0) > 0) restrictions.add("cant-block");

  return {
    power,
    toughness,
    basePower,
    baseToughness,
    keywords,
    toxic,
    types,
    subtypes,
    colors,
    controller: object.controller,
    restrictions,
    damageByToughness,
    ...(assignsNoCombatDamage ? { assignsNoCombatDamage: true } : {}),
    ...(extraBlocks !== 0 ? { extraBlocks } : {}),
    canAttackAsThoughNoDefender,
    canAttackAttackersDespiteDefender,
    ...(assignAsThoughUnblocked !== undefined ? { assignAsThoughUnblocked } : {}),
    cantBeSacrificed,
    protectionFrom: {
      colors: protColors,
      types: protTypes,
      filters: protFilters,
      boundFilters: protBoundFilters,
      players: protPlayers,
      ...(protSparing.length > 0 ? { sparing: { otherColors: protOtherColors, otherTypes: protOtherTypes, instances: protSparing } } : {}),
    },
    hexproofFrom: { colors: hexColors, types: hexTypes, filters: hexFilters, qualified: hexQualified },
    bandsWithOther,
    landwalk,
  };
}

/**
 * How many attackers creature `id` may block at once (rule 509.1a: one) —
 * one more for each "can block an additional creature" it has, or
 * `Infinity` for "can block any number of creatures" (`blockAdditional`).
 */
export function blockLimitOf(state: GameState, registry: CardRegistry, id: ObjectId): number {
  const extra = computeCharacteristics(state, registry, id).extraBlocks ?? 0;
  return extra === "any" ? Infinity : 1 + extra;
}

/**
 * Whether permanent `id` can't be sacrificed (rule 701.21a) — a
 * `cantBeSacrificed` static reaching it (Alexios, Deimos of Kosmos), or the
 * ability granted by the `"cant-be-sacrificed"` effect. Every sacrifice the
 * engine makes or offers asks this: an edict's and a sacrifice cost's
 * choices, "Sacrifice ~" costs and effects, a Treasure's mana ability, a
 * completed Saga, encore's end-step sacrifice.
 *
 * Folds the permanent's characteristics only when something on the
 * battlefield could say so — the contributing-statics pre-scan is shared
 * with the fold and memoized per cache region — so the answer on nearly
 * every board is a short scan.
 */
export function cantBeSacrificed(state: GameState, registry: CardRegistry, id: ObjectId): boolean {
  const object = state.objects[id];
  if (object === undefined || object.zone !== "battlefield") return false;
  if (
    !object.modifiers.some((m) => m.cantBeSacrificed === true) &&
    !contributingStaticSources(state, registry).some(({ ability }) => ability.cantBeSacrificed === true)
  ) {
    return false;
  }
  return computeCharacteristics(state, registry, id).cantBeSacrificed;
}

/**
 * Whether the controller of permanent `id` is a player who can't sacrifice it
 * (`PtModifier.cantBeSacrificedBy` — Call for Aid's "you can't sacrifice
 * those creatures this turn"). Only a permanent's controller sacrifices it
 * (rule 701.21a), so this is the whole question. Not an ability: it isn't
 * lost with the permanent's abilities.
 */
export function sacrificeProhibitedByController(state: GameState, id: ObjectId): boolean {
  const object = state.objects[id];
  if (object === undefined || object.zone !== "battlefield") return false;
  return object.modifiers.some((m) => m.cantBeSacrificedBy === object.controller);
}

/**
 * Whether the legend rule (704.5j) passes over the permanent `id`: some
 * permanent on the battlefield has "the 'legend rule' doesn't apply to …"
 * and it reaches `id` — printed (`StaticAbility.legendRuleOff`, scoped by its
 * `affects` from that permanent's controller's side, gated by its condition)
 * or as a copy exception (`PtModifier.legendRuleOff` — Sakashima of a
 * Thousand Faces copying something). Read live: the rule applies again the
 * moment the last such permanent leaves or loses its abilities (layer 6,
 * timestamp order for a granted one), as Sakashima's ruling says. An
 * eliminated player's permanents affect nothing (see `matchesFilter`).
 */
export function exemptFromLegendRule(state: GameState, registry: CardRegistry, id: ObjectId): boolean {
  const target = state.objects[id];
  if (target === undefined || target.zone !== "battlefield") return false;
  for (const sourceId of state.zones.shared.battlefield) {
    const source = state.objects[sourceId];
    if (source === undefined || state.players[source.controller]?.hasLost === true) continue;
    const lostAt = abilitiesLostAt(state, registry, source);
    if (lostAt === null) {
      for (const ability of registry.get(rulesTextName(source)).static) {
        if (ability.legendRuleOff !== true) continue;
        if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) {
          continue;
        }
        if (staticAffects(state, registry, ability.affects, source, target)) return true;
      }
    }
    for (const modifier of source.modifiers) {
      if (modifier.legendRuleOff === undefined || !modifierGrantApplies(modifier, lostAt)) continue;
      if (staticAffects(state, registry, modifier.legendRuleOff, source, target)) return true;
    }
  }
  // An emblem's, or a timed static's — "the legend rule doesn't apply to
  // permanents you control this turn" (Hall of Echoes).
  for (const { source, ability } of emblemStatics(state)) {
    if (ability.legendRuleOff !== true) continue;
    if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) continue;
    if (staticAffects(state, registry, ability.affects, source, target)) return true;
  }
  return false;
}

/**
 * How much combat damage a creature with these characteristics assigns (rule
 * 510.1a): its power, or its toughness under a `combatDamageByToughness`
 * static (Doran, the Siege Tower). **Every** place that sizes combat damage
 * reads this rather than `power` — an unblocked attacker's damage, a
 * blocker's, the split across blockers and the trample excess, the
 * `assign-combat-damage` offer, and the bots' combat arithmetic — while
 * everything else that says "power" keeps reading `power` (the rulings: the
 * static changes no creature's power). May be zero or negative, which, as
 * with power, assigns no damage. Zero for a creature that "assigns no combat
 * damage this turn" (Farrel's Zealot), whatever its power.
 */
export function combatDamageOf(c: Characteristics): number {
  if (c.assignsNoCombatDamage === true) return 0;
  return c.damageByToughness ? c.toughness : c.power;
}

/** {@link combatDamageOf} for one object, read off the board. */
export function assignedCombatDamage(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
): number {
  return combatDamageOf(computeCharacteristics(state, registry, id));
}

/** Whether a static says a combat rule with no parameters (a `CombatWord`):
 * those are read in the fold; the records aren't (`combat/rules.ts`). */
function hasRestrictionWord(ability: StaticAbility): boolean {
  return ability.restrictions !== undefined && ability.restrictions.some((r) => typeof r === "string");
}

/** The player effects carrying a combat rule, memoized per cache region:
 * almost always none. */
export function combatPlayerEffects(state: GameState): readonly PlayerEffect[] {
  return computedCacheMemo("combat-player-effects", () => (state.playerEffects ?? []).filter((e) => e.combat !== undefined));
}

/** Whether a `PlayerEffect.combat` binds `id` now: it matches the filter from
 * `side`'s side, is controlled by whom it says, and isn't the permanent left
 * out (`except`, the same object only — rule 400.7). */
export function playerEffectCovers(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  combat: NonNullable<PlayerEffect["combat"]>,
): boolean {
  const object = state.objects[id];
  if (object === undefined || object.zone !== "battlefield") return false;
  if (combat.controlledBy !== undefined && object.controller !== combat.controlledBy) return false;
  const except = combat.except;
  if (except !== undefined && except.object === id && (object.zoneChangeCount ?? 0) === except.zoneChangeCount) return false;
  return matchesFilter(state, registry, id, combat.filter, { you: combat.side });
}

/**
 * What a static's scope may compare against, read outside the layer fold:
 * its own source's power, toughness or mana value as they are now —
 * Baeloth's static goad's "power less than Baeloth Barrityl's power" is
 * `{ amount: { powerOf: "source" } }`, and a static's block filter reads its
 * source the same way (Champion of Lambholt — `combat/eligibility.ts`) — a
 * plain `{ countOf }` of permanents from its controller's side (Kraken of the
 * Straits), and its controller's hand size, `{ cardsInHand: "you" }`, which
 * a P/T-scoped combat word's scope reads ({@link restrictionsOf}: Ensnaring
 * Bridge's "creatures with power greater than the number of cards in your
 * hand can't attack"), as does a combat record's (`recordsOn`). Nothing else
 * can be answered in a static, and `NaN` makes any comparison with it false
 * (fails closed, as a static's `{ amount }` does everywhere).
 */
export function sourceAmount(
  state: GameState,
  registry: CardRegistry,
  source: GameObject,
): (amount: EffectAmount) => number {
  return (amount) => {
    if (typeof amount === "number") return amount;
    if (typeof amount !== "object") return Number.NaN;
    if ("powerOf" in amount && amount.powerOf === "source" && amount.doubling === undefined) {
      return computeCharacteristics(state, registry, source.id).power;
    }
    if ("toughnessOf" in amount && amount.toughnessOf === "source" && amount.doubling === undefined) {
      return computeCharacteristics(state, registry, source.id).toughness;
    }
    if ("manaValueOf" in amount && amount.manaValueOf === "source") {
      return manaValue(parseManaCost(printedManaCost(registry, source)));
    }
    // "The number of cards in your hand" (Ensnaring Bridge): its
    // controller's hand as it is now.
    if ("cardsInHand" in amount && amount.cardsInHand === "you" && Object.keys(amount).length === 1) {
      return state.zones.perPlayer[source.controller]?.hand.length ?? 0;
    }
    // "The number of Islands you control" (Kraken of the Straits): a plain
    // count of permanents, from the source's controller's side.
    if ("countOf" in amount && Object.keys(amount).length === 1) {
      return weightedMatches(state, state.zones.shared.battlefield, (id) =>
        matchesFilter(state, registry, id, amount.countOf, { you: source.controller, source: source.id }),
      ).reduce((sum, match) => sum + match.weight, 0);
    }
    return Number.NaN;
  };
}

/**
 * The combat words on `id`: from static abilities (Pacifism, Juggernaut) and
 * modifiers — the characteristics' own — plus any rule over the game it
 * matches (`PlayerEffect.combat`). Every legality check reads the words
 * through here, and the records through `combat/rules.ts`'s `recordsOn`.
 *
 * A free function so the combat predicates can be lifted out of `Game`
 * without dragging `this` along — see `combat/eligibility.ts`.
 */
export function restrictionsOf(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
): ReadonlySet<CombatWord> {
  const own = computeCharacteristics(state, registry, id).restrictions;
  let out: Set<CombatWord> | null = null;
  const target = state.objects[id];
  for (const { source, ability } of ptScopedRestrictionSources(state, registry)) {
    // Its scope compares with an amount from the source's side, as it is now:
    // Ensnaring Bridge's "power greater than the number of cards in your
    // hand", read as attackers are declared (its ruling).
    if (
      target === undefined ||
      !staticAffects(state, registry, ability.affects, source, target, { amount: sourceAmount(state, registry, source) })
    ) {
      continue;
    }
    if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) continue;
    out ??= new Set(own);
    for (const r of ability.restrictions ?? []) if (typeof r === "string") out.add(r);
  }
  // A rule over the game ("creatures your opponents control can't block this
  // turn") binds whatever matches it now, so it's matched here, outside the
  // fold, rather than baked into the characteristics.
  for (const effect of combatPlayerEffects(state)) {
    const combat = effect.combat;
    if (combat === undefined || combat.rules.every((r) => typeof r !== "string")) continue;
    if (!playerEffectCovers(state, registry, id, combat)) continue;
    out ??= new Set(own);
    for (const r of combat.rules) if (typeof r === "string") out.add(r);
  }
  return out ?? own;
}

/** The battlefield's {@link isPtScopedRestriction} statics, whose controllers
 * are still in the game and whose sources still have them. */
function ptScopedRestrictionSources(state: GameState, registry: CardRegistry): readonly ContributingStatic[] {
  const key = "ptScopedRestrictionSources";
  const known = activeCache?.misc.get(key) as readonly ContributingStatic[] | undefined;
  if (known !== undefined) return known;
  let out: ContributingStatic[] | null = null;
  for (const sourceId of state.zones.shared.battlefield) {
    const source = state.objects[sourceId];
    if (source === undefined || state.players[source.controller]?.hasLost === true) continue;
    const statics = staticsOf(registry, rulesTextName(source)).ptRestrictions;
    if (statics.length === 0 || hasLostAbilities(state, registry, source)) continue;
    for (const ability of statics) (out ??= []).push({ source, ability });
  }
  const result = out ?? NO_STATICS;
  activeCache?.misc.set(key, result);
  return result;
}

/** Whether `id` may attack as though it didn't have defender (rule 702.3b):
 * by a static (Arcades, the Strategist) or an effect on it (its
 * characteristics), or a turn-wide `attack-despite-defender` rule it
 * matches (`GameState.turnDefenderAttacks`), matched here as
 * `restrictionsOf` matches turn-wide restrictions. Given `defender` — what
 * it would attack — also a permission that names only some defenders:
 * Weathered Sentinels' "players who attacked you during their last turn".
 * Without one, only a permission that holds against every defender. */
export function canAttackDespiteDefender(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  defender?: PlayerId | ObjectId,
): boolean {
  const c = computeCharacteristics(state, registry, id);
  if (c.canAttackAsThoughNoDefender) return true;
  if (
    c.canAttackAttackersDespiteDefender &&
    defender !== undefined &&
    state.players[defender as PlayerId] !== undefined &&
    attackedYouDuringTheirLastTurn(state, c.controller, defender as PlayerId)
  ) {
    return true;
  }
  return (state.turnDefenderAttacks ?? []).some((rule) =>
    matchesFilter(state, registry, id, rule.filter, { you: rule.you }),
  );
}

/** Whether blocked `id` assigns its combat damage as though it weren't
 * blocked — to what it's attacking (rule 510.1b) rather than its blockers
 * (510.1c): `"must"` (Outmaneuver), `"may"` (its controller's choice as
 * damage is assigned — Thorn Elemental), or `null`. Its characteristics',
 * plus any turn-wide `assign-as-though-unblocked` rule it matches
 * (`GameState.turnUnblockedAssignments` — Predatory Focus), matched here
 * as `restrictionsOf` matches turn-wide restrictions. */
export function unblockedAssignmentOf(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
): "may" | "must" | null {
  let out = computeCharacteristics(state, registry, id).assignAsThoughUnblocked ?? null;
  if (out === "must") return out;
  for (const rule of state.turnUnblockedAssignments ?? []) {
    if (!matchesFilter(state, registry, id, rule.filter, { you: rule.you })) continue;
    if (rule.must === true) return "must";
    out = "may";
  }
  return out;
}

/** Whether `id` currently has `keyword`, counting every layer-6 grant and
 * ability-loss. The free-function counterpart of {@link restrictionsOf}. */
export function objHasKeyword(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  keyword: Keyword,
): boolean {
  return computeCharacteristics(state, registry, id).keywords.has(keyword);
}
