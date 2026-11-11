/**
 * Who may attack whom, and who may block what — rules 508 and 509 as pure
 * predicates over `(state, registry, …)`.
 *
 * These were methods on `Game`, which meant the only way to ask "may this
 * creature attack that planeswalker?" was to hold the whole game. Two things
 * need to ask without one: the `attackers`/`blockers` decision modules (see
 * `decisions/`), and — through the engine's public seam — the client, which
 * today re-derives menace, Lure and goad by hand and gets goad wrong.
 *
 * Everything here is a **read**. Nothing mutates, so `Game` remains the only
 * writer of `GameState`, and `Game` keeps a one-line private delegate for each
 * of these so its ~40 non-decision callers (the `attacks` / `attacks-alone` /
 * `attack-with` trigger matchers, `endCombatStep`, `combatFirstStrikeInPlay`,
 * `dealCombatDamage`) are untouched.
 */

import type { CardDefinition, CardRegistry, Keyword } from "../cards.js";
import {
  combatPlayerEffects,
  computedCacheMemo,
  computeCharacteristics,
  effectiveTypes,
  withComputedCache,
  hasLostAbilities,
  objHasKeyword,
  restrictionsOf,
  canAttackDespiteDefender,
  staticAffects,
  staticConditionMet,
} from "../characteristics.js";
import type { StaticAbility } from "../cards.js";
import type { CardFilter } from "../filter.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { matchesFilter } from "../filter.js";
import { goadersOf, sourceAmount } from "../goad.js";
import { hasRingBearerDesignation } from "../ring.js";
import { printedCardName, rulesTextName } from "../state.js";
import type { GameObject, GameState } from "../state.js";
import { LANDWALK } from "../subtypes.js";
import { permanentSource, protectionBlocks } from "../targeting.js";
import { aimNames, playerTestHolds, recordsOfKind, recordsOn } from "./rules.js";
import { attackCovers } from "./tax.js";
import type { AttackAim, AttackerAim, CantAttack, CantBlock, MustAttack, RuleInForce } from "./rules.js";


/** The landwalk keywords some permanent's static says creatures "can be
 * blocked as though they didn't have" (Quagmire, Lord Magnus), `"landwalk"`
 * for every kind no named keyword covers (Staff of the Ages). */
function landwalkIgnoredForBlocks(state: GameState, registry: CardRegistry): Set<Keyword> {
  return computedCacheMemo("landwalk-ignored-for-blocks", () => {
    const out = new Set<Keyword>();
    for (const id of state.zones.shared.battlefield) {
      const source = state.objects[id];
      if (source === undefined || hasLostAbilities(state, registry, source)) continue;
      for (const ability of registry.get(rulesTextName(source)).static) {
        if (ability.blockableDespiteLandwalk === undefined) continue;
        if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) continue;
        for (const keyword of ability.blockableDespiteLandwalk) out.add(keyword);
      }
    }
    return out;
  });
}

/** Whether a static says `blocker` can block landwalkers as though they didn't
 * have landwalk (`StaticAbility.blocksDespiteLandwalk`, Street Savvy). Asked
 * only about a blocker facing a landwalker. */
export function blocksDespiteLandwalk(state: GameState, registry: CardRegistry, blocker: GameObject): boolean {
  const sources = computedCacheMemo("blocks-despite-landwalk", () => {
    const out: { readonly source: GameObject; readonly ability: StaticAbility }[] = [];
    for (const id of state.zones.shared.battlefield) {
      const source = state.objects[id];
      if (source === undefined || state.players[source.controller]?.hasLost === true) continue;
      if (hasLostAbilities(state, registry, source)) continue;
      for (const ability of registry.get(rulesTextName(source)).static) {
        if (ability.blocksDespiteLandwalk === true) out.push({ source, ability });
      }
    }
    return out;
  });
  return sources.some(
    ({ source, ability }) =>
      staticAffects(state, registry, ability.affects, source, blocker) &&
      (ability.condition === undefined || staticConditionMet(state, registry, source, ability.condition)),
  );
}

/** Whether a static lets `blocker` block creatures with shadow (Wall of
 * Diffusion, Aether Web): the statics carrying it, memoized per cache region. */
function blocksAsThoughShadow(state: GameState, registry: CardRegistry, blocker: GameObject): boolean {
  const sources = computedCacheMemo("blocks-as-though-shadow", () => {
    const out: { readonly source: GameObject; readonly ability: StaticAbility }[] = [];
    for (const id of state.zones.shared.battlefield) {
      const source = state.objects[id];
      if (source === undefined || state.players[source.controller]?.hasLost === true) continue;
      if (hasLostAbilities(state, registry, source)) continue;
      for (const ability of registry.get(rulesTextName(source)).static) {
        if (ability.blocksAsThoughShadow === true) out.push({ source, ability });
      }
    }
    return out;
  });
  return sources.some(
    ({ source, ability }) =>
      staticAffects(state, registry, ability.affects, source, blocker) &&
      (ability.condition === undefined || staticConditionMet(state, registry, source, ability.condition)),
  );
}

/** The land types among the lands `player` controls — what a landwalker
 * attacking them is checked against. */
export function landTypesControlledBy(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
): Set<string> {
  const types = new Set<string>();
  for (const [, landType] of LANDWALK) {
    // Whose it is first: the filter's type clause folds layer 4, and this
    // runs once per land type over the whole battlefield.
    const controls = state.zones.shared.battlefield.some(
      (id) =>
        state.objects[id]?.controller === player &&
        matchesFilter(
          state,
          registry,
          id,
          { type: "land", subtype: landType, controlledBy: "you" },
          { you: player },
        ),
    );
    if (controls) types.add(landType);
  }
  return types;
}

/** Whether a landwalk of a kind no named keyword covers (`walks`, off
 * `Characteristics.landwalk` — rule 702.14c) stops `player` blocking: they
 * control a land one of them walks, and nothing says it can be blocked as
 * though it didn't have it (Staff of the Ages). */
export function landwalkStopsBlocksBy(
  state: GameState,
  registry: CardRegistry,
  walks: readonly CardFilter[],
  player: PlayerId,
): boolean {
  if (walks.length === 0 || landwalkIgnoredForBlocks(state, registry).has("landwalk")) return false;
  return state.zones.shared.battlefield.some(
    (id) =>
      // Whose it is first, as in `landTypesControlledBy`.
      state.objects[id]?.controller === player &&
      walks.some((land) =>
        matchesFilter(state, registry, id, { ...land, type: "land", controlledBy: "you" }, { you: player }),
      ),
  );
}

/** {@link legalDefendersUncached} inside a computed-value cache region (a pure read
 * of the board: its characteristics reads share one cache — see
 * `withComputedCache`). */
export function legalDefenders(...args: Parameters<typeof legalDefendersUncached>): (PlayerId | ObjectId)[] {
  return withComputedCache(() => legalDefendersUncached(...args));
}

/** Everything the active player's attackers may be declared against: each
 * non-eliminated opponent, every planeswalker those opponents control, and
 * every battle one of them protects (rule 508.1b; a battle can be attacked
 * by any player its protector defends against — 310.9b — so a Siege by its
 * own controller). A planeswalker or battle is identified by its `ObjectId`. */
function legalDefendersUncached(
  state: GameState,
  registry: CardRegistry,
  attacker: PlayerId,
): (PlayerId | ObjectId)[] {
  const opponents = state.turnOrder.filter(
    (player) => player !== attacker && !state.players[player].hasLost,
  );
  const planeswalkers = state.zones.shared.battlefield.filter((id) => {
    const object = state.objects[id];
    const types = computeCharacteristics(state, registry, id).types;
    if (types.includes("battle")) return object.protector !== undefined && opponents.includes(object.protector);
    return opponents.includes(object.controller) && types.includes("planeswalker");
  });
  return [...opponents, ...planeswalkers];
}

/** Whether attackers may be declared against `target`: every player may be, and
 * every permanent but one with the `cant-be-attacked` restriction (The
 * Aetherspark, rule 508.1c). Kept out of {@link legalDefenders}, which also
 * answers what a creature put onto the battlefield attacking may choose, and
 * that isn't bound by it (rule 508.4c). */
export function canBeAttacked(state: GameState, registry: CardRegistry, target: PlayerId | ObjectId): boolean {
  return !isPlaneswalkerTarget(state, target) || !restrictionsOf(state, registry, target).has("cant-be-attacked");
}

/** True if an attack target `id` is a planeswalker (an `ObjectId`) rather
 * than a player. */
export function isPlaneswalkerTarget(
  state: GameState,
  id: PlayerId | ObjectId,
): id is ObjectId {
  return state.objects[id as ObjectId] !== undefined;
}

/** The player who defends against an attack aimed at `target` — the target
 * itself if it's a player, the controller of an attacked planeswalker, or an
 * attacked battle's protector (rule 310.9d). */
export function defendingPlayerOf(
  state: GameState,
  target: PlayerId | ObjectId,
): PlayerId {
  if (!isPlaneswalkerTarget(state, target)) return target as PlayerId;
  const object = state.objects[target];
  return object.protector ?? object.controller;
}

/** Battlefield creatures currently declared as attackers. */
export function currentAttackers(state: GameState): ObjectId[] {
  return state.zones.shared.battlefield.filter(
    (id) => state.objects[id].attacking != null,
  );
}

export function creatureDef(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
): CardDefinition | null {
  const object = state.objects[id];
  if (object === undefined || object.zone !== "battlefield") return null;
  const def = registry.get(printedCardName(object));
  // Currently a creature after layer 4: a man-land animated this turn is one,
  // and a reconfigured Equipment creature attached to a creature isn't
  // (702.151b), nor is anything a type-setting effect made noncreature. The
  // returned def is still the printed one — it's used for the permanent's
  // name and ability list, while its live P/T / keywords come from
  // `computeCharacteristics`.
  return effectiveTypes(state, registry, object).includes("creature") ? def : null;
}

export function hasSummoningSickness(object: GameObject): boolean {
  // A permanent cast from suspend "has haste" until it leaves the
  // battlefield (rule 702.62e) — it's never summoning sick.
  if (object.hastyUntilItLeaves) return false;
  return object.summoningSick;
}

/** `nextTurn`: ask as of its controller's next combat rather than now —
 * being tapped or summoning sick will have worn off by then, and nothing
 * else is assumed to change. What the bots' `threat` term asks. */
export interface AttackAsOf {
  readonly nextTurn?: boolean;
}

/** {@link whyCannotAttackUncached} inside a computed-value cache region (a pure read
 * of the board: its characteristics reads share one cache — see
 * `withComputedCache`). */
export function whyCannotAttack(...args: Parameters<typeof whyCannotAttackUncached>): string | null {
  return withComputedCache(() => whyCannotAttackUncached(...args));
}

function whyCannotAttackUncached(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  creatureId: ObjectId,
  target: PlayerId | ObjectId,
  asOf: AttackAsOf = {},
): string | null {
  const object = state.objects[creatureId];
  const def = creatureDef(state, registry, creatureId);
  if (object === undefined || def === null) {
    return `${creatureId} is not a creature on the battlefield`;
  }
  if (object.controller !== player) {
    return `${def.name} is not controlled by the active player`;
  }
  // A battle can't attack, even one that's a creature too (rule 310's
  // rulings: battles can't attack or block).
  if (computeCharacteristics(state, registry, creatureId).types.includes("battle")) {
    return `${def.name} is a battle and cannot attack`;
  }
  if (object.tapped && asOf.nextTurn !== true) return `${def.name} is tapped and cannot attack`;
  // Defender (rule 702.3b), unless something lets it "attack as though it
  // didn't have defender" (Arcades, the Strategist) — which lifts only this
  // — perhaps against this defender alone (Weathered Sentinels).
  if (
    objHasKeyword(state, registry, creatureId, "defender") &&
    !canAttackDespiteDefender(state, registry, creatureId, target)
  ) {
    return `${def.name} has defender and cannot attack`;
  }
  if (restrictionsOf(state, registry, creatureId).has("cant-attack")) {
    return `${def.name} can't attack`;
  }
  if (
    asOf.nextTurn !== true &&
    hasSummoningSickness(object) &&
    !objHasKeyword(state, registry, creatureId, "haste")
  ) {
    return `${def.name} has summoning sickness`;
  }
  if (!legalDefenders(state, registry, player).includes(target)) {
    return isPlaneswalkerTarget(state, target)
      ? `${def.name} can't attack that planeswalker`
      : "attackers can only attack an opponent who hasn't already lost";
  }
  if (!canBeAttacked(state, registry, target)) return `${def.name} can't attack that permanent: it can't be attacked`;
  const defendingPlayer = defendingPlayerOf(state, target);
  const nearest = nearestOpponentRule(state, registry, player);
  // The opponent and planeswalkers they control: never a battle, whoever
  // protects it (rule 310.5 has battles attacked in their own right).
  if (
    nearest !== null &&
    (!nearest.includes(defendingPlayer) || !attackCovers(state, registry, "you-and-planeswalkers", defendingPlayer, target))
  ) {
    return nearest.length === 0
      ? `${def.name} can't attack: the directions chosen disagree, so there's no opponent to attack`
      : `${def.name} may attack only ${nearest[0]} (the nearest opponent in the chosen direction)`;
  }
  // "Can't attack you or planeswalkers you control" (Vow of Duty), "can't
  // attack unless defending player controls an Island" (rule 508.1c, asked of
  // the player this attack would defend against), "until your next turn,
  // creatures can't attack you" (Chronomantic Escape): every record.
  for (const force of recordsOfKind(state, registry, creatureId, "cant-attack")) {
    if (attackRefused(state, registry, force, object, target, defendingPlayer)) {
      const { at } = force.rule;
      if (at === "owner") return `${def.name} can't attack its owner`;
      if (at === "owner-planeswalkers") return `${def.name} can't attack a planeswalker its owner controls`;
      if (at === "attacked-this-turn") return `${def.name} can't attack a player it has already attacked this turn`;
      return `${def.name} can't attack ${defendingPlayer}`;
    }
  }
  return null;
}

/** Whether a "can't attack" record refuses this attack (rule 508.1c). */
function attackRefused(
  state: GameState,
  registry: CardRegistry,
  { rule, you, source }: RuleInForce<CantAttack>,
  object: GameObject,
  target: PlayerId | ObjectId,
  defendingPlayer: PlayerId,
): boolean {
  return (
    (rule.at === undefined || aimNames(state, registry, rule.at, you, object, target, source)) &&
    (rule.unlessDefender === undefined || !playerTestHolds(state, registry, rule.unlessDefender, defendingPlayer, source)) &&
    (rule.ifDefender === undefined || playerTestHolds(state, registry, rule.ifDefender, defendingPlayer, source))
  );
}

/** {@link whyCannotBlockUncached} inside a computed-value cache region (a pure read
 * of the board: its characteristics reads share one cache — see
 * `withComputedCache`). */
export function whyCannotBlock(...args: Parameters<typeof whyCannotBlockUncached>): string | null {
  return withComputedCache(() => whyCannotBlockUncached(...args));
}

function whyCannotBlockUncached(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  blockerId: ObjectId,
  attackerId: ObjectId,
): string | null {
  const alone = whyThisCannotBlock(state, registry, player, blockerId, attackerId);
  if (alone !== null) return alone;
  // "Can't be blocked unless all creatures defending player controls block
  // it" (Tromokratis — rule 509.1b): one of theirs that can't block it
  // leaves it unblockable by any. That every one *does* is the
  // declaration's check (`blockingViolations`' `blocked-by-all`).
  if (blockedOnlyByAll(state, registry, attackerId)) {
    for (const id of state.zones.shared.battlefield) {
      if (id === blockerId || state.objects[id].controller !== player) continue;
      if (!effectiveTypes(state, registry, state.objects[id]).includes("creature")) continue;
      if (whyThisCannotBlock(state, registry, player, id, attackerId) !== null) {
        const attackerDef = registry.get(printedCardName(state.objects[attackerId]));
        return `${attackerDef.name} can't be blocked unless all your creatures block it, and not all can`;
      }
    }
  }
  return null;
}

/** Whether `blockerId` can block `attackerId` judged on its own — every
 * restriction but the one that asks about all the defender's creatures. */
function whyThisCannotBlock(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  blockerId: ObjectId,
  attackerId: ObjectId,
): string | null {
  const blocker = state.objects[blockerId];
  const blockerDef = creatureDef(state, registry, blockerId);
  if (blocker === undefined || blockerDef === null) {
    return `${blockerId} is not a creature on the battlefield`;
  }
  if (blocker.controller !== player) {
    return `${blockerDef.name} is not controlled by the defender`;
  }
  if (blocker.tapped) return `${blockerDef.name} is tapped and cannot block`;
  if (computeCharacteristics(state, registry, blockerId).types.includes("battle")) {
    return `${blockerDef.name} is a battle and cannot block`;
  }
  if (restrictionsOf(state, registry, blockerId).has("cant-block")) {
    return `${blockerDef.name} can't block`;
  }

  const attacker = state.objects[attackerId];
  if (attacker === undefined || attacker.attacking === null) {
    return `${attackerId} is not attacking`;
  }
  if (
    objHasKeyword(state, registry, attackerId, "unblockable") ||
    restrictionsOf(state, registry, attackerId).has("cant-be-blocked")
  ) {
    const attackerDef = registry.get(printedCardName(attacker));
    return `${blockerDef.name} can't block ${attackerDef.name} (can't be blocked)`;
  }
  // Protection (rule 702.16) — can't be blocked by a matching creature.
  if (
    protectionBlocks(state, registry, attackerId, permanentSource(state, registry, blockerId))
  ) {
    const attackerDef = registry.get(printedCardName(attacker));
    return `${blockerDef.name} can't block ${attackerDef.name} (protection)`;
  }
  if (defendingPlayerOf(state, attacker.attacking) !== player) {
    const attackerDef = registry.get(printedCardName(attacker));
    return `${blockerDef.name} can't block ${attackerDef.name} — it isn't attacking ${player}`;
  }
  // "Can't block unless you control more lands than attacking player" (rule
  // 509.1b), "can't block this creature this turn" (Kozilek's Pathfinder, the
  // object it was then, 400.7), "can't block creatures you control" (Immortal
  // Obligation), "can block only creatures with flying", on the blocker;
  // "can't be blocked by [filter]" on the attacker (Delney, Streetwise Lookout).
  for (const force of recordsOfKind(state, registry, blockerId, "cant-block")) {
    if (blockRefused(state, registry, force, attacker)) {
      const attackerDef = registry.get(printedCardName(attacker));
      return `${blockerDef.name} can't block ${attackerDef.name}`;
    }
  }
  for (const { rule, you, source } of recordsOfKind(state, registry, attackerId, "cant-be-blocked")) {
    if (rule.by === undefined) continue;
    if (matchesFilter(state, registry, blockerId, rule.by, { you, amount: sourceAmount(state, registry, source) })) {
      const attackerDef = registry.get(printedCardName(attacker));
      return `${blockerDef.name} can't block ${attackerDef.name}`;
    }
  }
  // The Ring emblem: "your Ring-bearer … can't be blocked by creatures with
  // greater power" (rule 701.54c), the powers compared as blocks are declared.
  if (
    hasRingBearerDesignation(attacker) &&
    computeCharacteristics(state, registry, blockerId).power > computeCharacteristics(state, registry, attackerId).power
  ) {
    const attackerDef = registry.get(printedCardName(attacker));
    return `${blockerDef.name} can't block ${attackerDef.name}, a Ring-bearer with less power`;
  }
  // Fear (702.36) / Intimidate (702.13) — blockable only by an artifact
  // creature, plus black creatures (fear) or colour-sharers (intimidate).
  const fear = objHasKeyword(state, registry, attackerId, "fear");
  const intimidate = objHasKeyword(state, registry, attackerId, "intimidate");
  if (fear || intimidate) {
    const blockerChars = computeCharacteristics(state, registry, blockerId);
    let ok = blockerChars.types.includes("artifact");
    if (!ok && fear) ok = blockerChars.colors.has("B");
    if (!ok && intimidate) {
      const attackerColors = computeCharacteristics(state, registry, attackerId).colors;
      // A colourless attacker shares no colour with anything, so only an
      // artifact creature can block it.
      for (const color of attackerColors) {
        if (blockerChars.colors.has(color)) ok = true;
      }
    }
    if (!ok) {
      const attackerDef = registry.get(printedCardName(attacker));
      return `${blockerDef.name} can't block ${attackerDef.name} (${fear ? "fear" : "intimidate"})`;
    }
  }
  // Shadow (rule 702.28b): a creature with it is blocked only by creatures
  // with it, and one without it isn't blocked by them.
  const attackerShadow = objHasKeyword(state, registry, attackerId, "shadow");
  if (
    attackerShadow !== objHasKeyword(state, registry, blockerId, "shadow") &&
    !(attackerShadow && blocksAsThoughShadow(state, registry, blocker))
  ) {
    const attackerDef = registry.get(printedCardName(attacker));
    return `${blockerDef.name} can't block ${attackerDef.name} (shadow)`;
  }
  // Horsemanship (rule 702.31b): only by a creature with horsemanship; one
  // with it blocks anything.
  if (
    objHasKeyword(state, registry, attackerId, "horsemanship") &&
    !objHasKeyword(state, registry, blockerId, "horsemanship")
  ) {
    const attackerDef = registry.get(printedCardName(attacker));
    return `${blockerDef.name} can't block ${attackerDef.name} (horsemanship)`;
  }
  // Skulk (rule 702.118b): not by a creature with greater power, compared as
  // the block is declared — a change afterwards undoes nothing (the ruling).
  if (
    objHasKeyword(state, registry, attackerId, "skulk") &&
    computeCharacteristics(state, registry, blockerId).power > computeCharacteristics(state, registry, attackerId).power
  ) {
    const attackerDef = registry.get(printedCardName(attacker));
    return `${blockerDef.name} can't block ${attackerDef.name} (skulk)`;
  }
  // Landwalk (rule 702.14c): unblockable as long as the defending player —
  // the one declaring this block — controls a land of that type.
  const walked = LANDWALK.filter(([keyword]) => objHasKeyword(state, registry, attackerId, keyword));
  if (walked.length > 0 && !blocksDespiteLandwalk(state, registry, blocker)) {
    // "…can be blocked as though they didn't have swampwalk" (Quagmire).
    const ignored = landwalkIgnoredForBlocks(state, registry);
    const counted = walked.filter(([keyword]) => !ignored.has(keyword));
    const lands = landTypesControlledBy(state, registry, player);
    const walk = counted.find(([, landType]) => lands.has(landType));
    if (walk !== undefined) {
      const attackerDef = registry.get(printedCardName(attacker));
      return `${blockerDef.name} can't block ${attackerDef.name} (${walk[0]})`;
    }
  }
  // Landwalk of another kind — nonbasic, artifact, a chosen land type other
  // than those six (rule 702.14a, c): its land as a filter.
  if (
    landwalkStopsBlocksBy(state, registry, computeCharacteristics(state, registry, attackerId).landwalk, player) &&
    !blocksDespiteLandwalk(state, registry, blocker)
  ) {
    const attackerDef = registry.get(printedCardName(attacker));
    return `${blockerDef.name} can't block ${attackerDef.name} (landwalk)`;
  }
  if (
    objHasKeyword(state, registry, attackerId, "flying") &&
    !objHasKeyword(state, registry, blockerId, "flying") &&
    !objHasKeyword(state, registry, blockerId, "reach")
  ) {
    const attackerDef = registry.get(printedCardName(attacker));
    return `${blockerDef.name} can't block ${attackerDef.name} (flying)`;
  }
  return null;
}

/**
 * The opponents `player` may attack under `attackOnlyNearestOpponent` statics
 * (Pramikon, Sky Rampart), or `null` when none is in force: the nearest one
 * in the direction chosen for each such permanent — left is onward in turn
 * order, right is back — skipping players who have lost. Every one applies
 * at once, so two that disagree, with three or more players left, leave
 * nobody to attack (the Pramikon ruling) and this is empty.
 */
export function nearestOpponentRule(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
): readonly PlayerId[] | null {
  const directions = new Set<"left" | "right">();
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (hasLostAbilities(state, registry, source) || state.players[source.controller]?.hasLost === true) continue;
    // No direction chosen (it entered some way that didn't ask): no effect.
    if (source.chosenOnEnter !== "left" && source.chosenOnEnter !== "right") continue;
    const governs = registry
      .get(rulesTextName(source))
      .static.some(
        (ability) =>
          ability.attackOnlyNearestOpponent === true &&
          (ability.condition === undefined || staticConditionMet(state, registry, source, ability.condition)),
      );
    if (governs) directions.add(source.chosenOnEnter);
  }
  // The resolved ones (Teyo, Geometric Tactician): of several one permanent's
  // ability made, the last chosen direction; each permanent's applies.
  const chosen = new Map<string, "left" | "right">();
  for (const effect of combatPlayerEffects(state)) {
    for (const rule of effect.combat?.rules ?? []) {
      if (typeof rule === "string" || rule.kind !== "attack-only-nearest") continue;
      const key = rule.from === undefined ? `effect ${chosen.size}` : `${rule.from.object} ${rule.from.stint}`;
      chosen.set(key, rule.direction);
    }
  }
  for (const direction of chosen.values()) directions.add(direction);
  if (directions.size === 0) return null;
  const order = state.turnOrder;
  const from = order.indexOf(player);
  const nearest = (step: number): PlayerId | null => {
    for (let i = 1; i < order.length; i += 1) {
      const other = order[(((from + step * i) % order.length) + order.length) % order.length];
      if (other !== player && state.players[other]?.hasLost !== true) return other;
    }
    return null;
  };
  const allowed = [...directions].map((direction) => nearest(direction === "left" ? 1 : -1));
  const first = allowed[0];
  return first !== null && allowed.every((p) => p === first) ? [first] : [];
}

/** Whether a "can't block" record refuses `attacker`, every field it gives
 * holding (rule 509.1b); its `attackers` and any `{ amount }` operand read as
 * blockers are declared (Champion of Lambholt's ruling). */
function blockRefused(
  state: GameState,
  registry: CardRegistry,
  { rule, you, source }: RuleInForce<CantBlock>,
  attacker: GameObject,
): boolean {
  if (rule.attacker !== undefined && !namesAttacker(rule.attacker, attacker, source)) return false;
  if (
    rule.attackers !== undefined &&
    !matchesFilter(state, registry, attacker.id, rule.attackers, { you, amount: sourceAmount(state, registry, source) })
  ) {
    return false;
  }
  return rule.unlessAttacking === undefined || !playerTestHolds(state, registry, rule.unlessAttacking, attacker.controller, source);
}

/** Whether a rule's named attacker is this one: the object it was as the
 * effect resolved (rule 400.7), or a static's own source. */
function namesAttacker(aim: AttackerAim, attacker: GameObject, source: GameObject): boolean {
  if (typeof aim === "object" && "stint" in aim) {
    return aim.object === attacker.id && aim.stint === (attacker.zoneChangeCount ?? 0);
  }
  return aim === "source" && attacker.id === source.id;
}

/**
 * Whether `attacker` "can't be blocked by more than one creature" right now
 * (rule 509.1b — Challenger Troll): read as blocks are declared, so a scope
 * reading power sees it now.
 */
export function blockedByAtMostOne(state: GameState, registry: CardRegistry, attacker: ObjectId): boolean {
  return recordsOfKind(state, registry, attacker, "cant-be-blocked").some(({ rule }) => rule.byMoreThan === 1);
}

/**
 * The fewest creatures that may block `attacker` right now, if any do: 2 for
 * menace (rule 702.111b), N for "can't be blocked except by N or more
 * creatures" (Pathrazer of Ulamog), the largest when several apply; 1
 * otherwise. Read as blocks are declared (rule 509.1b).
 */
export function minimumBlockers(state: GameState, registry: CardRegistry, attacker: ObjectId): number {
  if (state.objects[attacker] === undefined) return 1;
  let least = objHasKeyword(state, registry, attacker, "menace") ? 2 : 1;
  for (const { rule } of recordsOfKind(state, registry, attacker, "cant-be-blocked")) {
    if (rule.byFewerThan !== undefined && rule.byFewerThan > least) least = rule.byFewerThan;
  }
  return least;
}

/** Whether `attacker` "can't be blocked unless all creatures defending
 * player controls block it" right now (Tromokratis). */
export function blockedOnlyByAll(state: GameState, registry: CardRegistry, attacker: ObjectId): boolean {
  return recordsOfKind(state, registry, attacker, "cant-be-blocked").some(({ rule }) => rule.unlessAllBlock === true);
}

/**
 * Who `attacker` must be blocked by (rule 509.1c) out of `blockers`, read as
 * blocks are declared: each record that names some, `all` when every one of
 * them able must (Marble Priest), else one of them (Slayer's Cleaver).
 */
export function blockersRequiredBy(
  state: GameState,
  registry: CardRegistry,
  attacker: ObjectId,
  blockers: readonly ObjectId[],
): readonly { readonly all: boolean; readonly by: readonly ObjectId[] }[] {
  const out: { all: boolean; by: ObjectId[] }[] = [];
  for (const { rule, you, source } of recordsOn(state, registry, attacker)) {
    if ((rule.kind !== "must-be-blocked" && rule.kind !== "must-be-blocked-if-able") || rule.by === undefined) continue;
    const amount = sourceAmount(state, registry, source);
    const wanted = rule.by;
    out.push({
      all: rule.kind === "must-be-blocked",
      by: blockers.filter((id) => matchesFilter(state, registry, id, wanted, { you, amount })),
    });
  }
  return out;
}

/** Whether "must be blocked by exactly one creature if able" binds `attacker`
 * (Nacatl War-Pride, rule 509.1c). */
export function mustBeBlockedByExactlyOne(state: GameState, registry: CardRegistry, attacker: ObjectId): boolean {
  return recordsOfKind(state, registry, attacker, "must-be-blocked-if-able").some(({ rule }) => rule.exactlyOne === true);
}

/** The creature each "blocks [this attacker] if able" on `blocker` names, or
 * `undefined` for a bare "blocks if able" with parameters elsewhere (rule
 * 509.1c), each the same object it was when the requirement was made (400.7). */
export function blockRequirementsOf(
  state: GameState,
  registry: CardRegistry,
  blocker: ObjectId,
): readonly { readonly attacker?: ObjectId }[] {
  return recordsOfKind(state, registry, blocker, "must-block").flatMap(({ rule }) => {
    if (rule.attacker === undefined) return [{}];
    if (typeof rule.attacker !== "object" || !("stint" in rule.attacker)) return [];
    const named = state.objects[rule.attacker.object];
    return named?.zone === "battlefield" && (named.zoneChangeCount ?? 0) === rule.attacker.stint ? [{ attacker: rule.attacker.object }] : [];
  });
}

/**
 * "If [a creature matching it] attacks, this attacks if able" (rule 508.1d):
 * for each of `able` such a record binds, the creatures of `eligible` whose
 * attacking would bind it. Empty almost always.
 */
export function attacksIfOthersAttack(
  state: GameState,
  registry: CardRegistry,
  able: readonly ObjectId[],
  eligible: readonly ObjectId[],
): readonly { readonly attacker: ObjectId; readonly when: readonly ObjectId[] }[] {
  const out: { attacker: ObjectId; when: readonly ObjectId[] }[] = [];
  for (const attacker of able) {
    const when = new Set<ObjectId>();
    for (const { rule, you, source } of recordsOfKind(state, registry, attacker, "must-attack")) {
      const filter = rule.ifAttacks;
      if (filter === undefined) continue;
      for (const id of eligible) {
        if (matchesFilter(state, registry, id, filter, { you, source: source.id })) when.add(id);
      }
    }
    if (when.size > 0) out.push({ attacker, when: [...when] });
  }
  return out;
}

/**
 * The requirements on `attacker` that care *where* it attacks and are obeyed
 * only by attacking what they name (rule 508.1d): encore's opponent, Alluring
 * Siren's "attacks you", Gideon Jura's "attack Gideon Jura", Galactus's "an
 * opponent with the most life". One requirement each, however many it names.
 */
function aimedRequirements(state: GameState, registry: CardRegistry, attacker: ObjectId): readonly RuleInForce<MustAttack>[] {
  return recordsOfKind(state, registry, attacker, "must-attack").filter(({ rule }) => rule.at !== undefined);
}

/**
 * The players `attacker` must attack "a player other than" if able — one
 * entry per requirement, since rule 508.1d counts requirements: each player
 * who has goaded it (rule 701.15b — once each, 701.15d), and whoever made
 * each "other than you" record binding it.
 */
function otherThanRequirements(state: GameState, registry: CardRegistry, attacker: ObjectId): PlayerId[] {
  return [
    ...goadersOf(state, registry, attacker),
    ...recordsOfKind(state, registry, attacker, "must-attack")
      .filter(({ rule }) => rule.otherThan !== undefined)
      .map(({ you }) => you),
  ];
}

/**
 * How many of `attacker`'s attack requirements that care *where* it attacks
 * are obeyed by attacking `defender` (rule 508.1d). "Attacks a player other
 * than [them] if able" (goad, rule 701.15b) is obeyed only by attacking a
 * **player** — a planeswalker isn't one — other than them; an aimed one only
 * by attacking what it names. The "attacks each combat if able" every one of
 * them also carries is obeyed wherever it attacks, so it doesn't tell
 * defenders apart.
 */
function aimedRequirementsObeyed(
  state: GameState,
  registry: CardRegistry,
  others: readonly PlayerId[],
  aimed: readonly RuleInForce<MustAttack>[],
  object: GameObject,
  defender: PlayerId | ObjectId,
): number {
  let obeyed = aimed.filter(({ rule, you, source }) => aimNames(state, registry, rule.at as AttackAim, you, object, defender, source)).length;
  if (!isPlaneswalkerTarget(state, defender)) {
    for (const other of others) if (other !== defender) obeyed += 1;
  }
  return obeyed;
}

/**
 * Whether sending `attacker` at `defender` obeys fewer of its attack
 * requirements than sending it at another defender it may attack — which
 * rule 508.1d forbids: the number obeyed must be the most possible without
 * breaking a restriction. No restriction the engine models ties one
 * creature's attack to another's, so the most for each creature is the most
 * for the declaration.
 *
 * What that comes to (the goad rulings): goaded by one player, it attacks a
 * *player* other than them while one can be attacked, and only failing that
 * the goader or a planeswalker. Goaded by each opponent, it attacks one of
 * them — any — rather than a planeswalker. Goaded by two of three opponents,
 * the third. Encore alone (`mustAttackPlayer`) sends it at that opponent
 * while it can be attacked. And a requirement that can't be obeyed — only
 * the goader left, an encore opponent it can't attack — rules nothing out.
 *
 * Shared between the `attackers` decision's validator and
 * {@link defendersForAttacker}: enumerating defenders without it is what let
 * the fuzzer propose a declaration that `dispatch` then refused.
 */
export function attackRequirementsForbid(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  attacker: ObjectId,
  defender: PlayerId | ObjectId,
  asOf: AttackAsOf = {},
): boolean {
  const object = state.objects[attacker];
  if (object === undefined) return false;
  const others = otherThanRequirements(state, registry, attacker);
  const aimed = aimedRequirements(state, registry, attacker);
  if (others.length === 0 && aimed.length === 0) return false;
  const here = aimedRequirementsObeyed(state, registry, others, aimed, object, defender);
  return legalDefenders(state, registry, player).some(
    (other) =>
      other !== defender &&
      aimedRequirementsObeyed(state, registry, others, aimed, object, other) > here &&
      whyCannotAttack(state, registry, player, attacker, other, asOf) === null,
  );
}

/** Why {@link attackRequirementsForbid} refuses `attacker`, for the
 * validator's message. */
export function attackRequirementsReason(state: GameState, registry: CardRegistry, attacker: ObjectId): string {
  const name = creatureDef(state, registry, attacker)?.name ?? attacker;
  if (goadersOf(state, registry, attacker).length > 0) {
    return `${name} is goaded and must attack a player other than its goader if able`;
  }
  if (otherThanRequirements(state, registry, attacker).length > 0) {
    return `${name} must attack a player other than ${otherThanRequirements(state, registry, attacker).join(", ")} if able`;
  }
  return `${name} must attack the player or planeswalker it was made to attack`;
}

/**
 * Which defenders *this* attacker may legally be sent at — the enumerator
 * half of the pair whose invariant {@link attackRequirementsForbid} records:
 * offer exactly what `whyCannotDeclareAttackers` will accept, or the fuzzer
 * proposes declarations `dispatch` refuses.
 *
 * Not the same as {@link legalDefenders}, which is the union across every
 * attacker. A goaded creature has to attack someone other than its goader
 * when it can, and a Vow of Duty forbids one defender to one creature — so
 * picking from the union builds a declaration the server rejects. The client
 * re-derives this by hand today and gets exactly that wrong.
 */
export function defendersForAttacker(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  attacker: ObjectId,
): (PlayerId | ObjectId)[] {
  return legalDefenders(state, registry, player).filter(
    (defender) =>
      whyCannotAttack(state, registry, player, attacker, defender) === null &&
      !attackRequirementsForbid(state, registry, player, attacker, defender),
  );
}

/**
 * The players `attacker` could attack at its controller's next combat: every
 * one {@link defendersForAttacker} would allow once it has untapped and lost
 * summoning sickness (`AttackAsOf.nextTurn`), with the board otherwise as it
 * is. A Vow of Duty, a goad pointing elsewhere, Pacifism or defender all
 * narrow it. Players only — a planeswalker's controller isn't attacked.
 */
export function playersAttackableNextTurn(
  state: GameState,
  registry: CardRegistry,
  attacker: ObjectId,
): PlayerId[] {
  const object = state.objects[attacker];
  if (object === undefined) return [];
  const player = object.controller;
  const asOf: AttackAsOf = { nextTurn: true };
  return legalDefenders(state, registry, player).filter(
    (defender): defender is PlayerId =>
      !isPlaneswalkerTarget(state, defender) &&
      whyCannotAttack(state, registry, player, attacker, defender, asOf) === null &&
      !attackRequirementsForbid(state, registry, player, attacker, defender, asOf),
  );
}

/** {@link mustAttackUncached} inside a computed-value cache region (a pure read
 * of the board: its characteristics reads share one cache — see
 * `withComputedCache`). */
export function mustAttack(...args: Parameters<typeof mustAttackUncached>): boolean {
  return withComputedCache(() => mustAttackUncached(...args));
}

/**
 * Whether `attacker` is under an attack requirement that attacking would
 * obey (rule 508.1d), so it must attack if it can. "Attacks each combat if
 * able" — its own (`"must-attack"`), a goad's (rule 701.15b, `goadersOf`), an
 * attack-requirement rule's — is obeyed by attacking anyone. Encore's
 * "attacks that opponent if able" (`GameObject.mustAttackPlayer`) only by
 * attacking that opponent, so it binds only while they can be attacked. Whether
 * it can attack at all is whether it has a legal defender; the
 * `declare-attackers` offer's `mustAttack` asks both.
 */
function mustAttackUncached(state: GameState, registry: CardRegistry, attacker: ObjectId): boolean {
  const object = state.objects[attacker];
  if (object === undefined) return false;
  if (goadersOf(state, registry, attacker).length > 0 || restrictionsOf(state, registry, attacker).has("must-attack")) {
    return true;
  }
  const records = recordsOfKind(state, registry, attacker, "must-attack");
  if (records.length === 0) return false;
  // "Attacks a player other than you if able" carries "attacks if able"; the
  // conditional one binds only through the declaration's check.
  if (records.some(({ rule }) => rule.at === undefined && rule.ifAttacks === undefined)) return true;
  const defenders = legalDefenders(state, registry, object.controller);
  return records.some(
    ({ rule, you, source }) =>
      rule.at !== undefined &&
      defenders.some(
        (defender) =>
          aimNames(state, registry, rule.at as AttackAim, you, object, defender, source) &&
          whyCannotAttack(state, registry, object.controller, attacker, defender) === null,
      ),
  );
}
