/**
 * One combat rule (rules 508.1c, 508.1d, 509.1b, 509.1c): the vocabulary every
 * requirement and restriction on attacking and blocking is written in, and the
 * one read of what binds a creature now. See docs/plans/need-key-themes.md,
 * theme 11's design note.
 *
 * A rule is kept in one of three places, the same split as rule 611.2c's:
 * - `StaticAbility.restrictions`: while the permanent has the ability, over
 *   whatever its `affects` reaches;
 * - `PtModifier.restrictions`: on the one object, its set fixed as the effect
 *   resolved, for as long as modifiers last;
 * - `PlayerEffect.combat`: a rule over the game, reaching creatures that
 *   arrive later.
 *
 * Whatever makes a resolved one is the `restrict` effect.
 */

import { attackCovers } from "./tax.js";
import {
  combatPlayerEffects,
  computedCacheMemo,
  grantedStatics,
  hasLostAbilities,
  playerEffectCovers,
  sourceAmount,
  staticConditionMet,
  staticReaches,
} from "../characteristics.js";
import { matchesFilter, weightedMatches } from "../filter.js";
import { rulesTextName } from "../state.js";
import type { CardFilter } from "../filter.js";
import type { CardRegistry } from "../cards.js";
import type { PlayerTest, StaticAbility } from "../cards.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { ObjectRef, PlayerRef } from "../refs.js";
import type { GameObject, GameState } from "../state.js";
import type { TargetRef } from "../target.js";

/**
 * A rule with no parameters, the only spelling of one (a pool test refuses a
 * record that says no more than its `kind`).
 *
 * The combat ones are read through `restrictionsOf`. Three aren't about combat
 * but are the same kind of thing on a permanent, and live in the same field:
 * `doesnt-untap` (rule 502.3), `cant-turn-face-up` (708.7), `cant-crew`
 * (702.122d).
 */
export type CombatWord =
  | "cant-attack"
  | "cant-block"
  /** "Can't be attacked" on a planeswalker or battle (The Aetherspark): a
   * restriction on declaring attackers (rule 508.1c), so one already being
   * attacked stays attacked (the ruling), and a creature put onto the
   * battlefield attacking may still choose it (rule 508.4c). */
  | "cant-be-attacked"
  /** "Can't be blocked": the `unblockable` keyword's rule as a restriction,
   * so a `restrict` over a filter reaches creatures that match it later this
   * turn (rule 611.2c). */
  | "cant-be-blocked"
  | "must-attack"
  /** "Blocks each combat if able" (rule 509.1c). */
  | "must-block"
  /** Lure: **every** creature able to block it must do so. */
  | "must-be-blocked"
  /** "Must be blocked if able" (Anzrag, the Quake-Mole): the defending player
   * has to block it with at least one creature (two, with menace) when they
   * can. */
  | "must-be-blocked-if-able"
  /** "Each player may attack only the nearest opponent in a direction":
   * always the {@link AttackOnlyNearest} record, which says which. */
  | "attack-only-nearest"
  /** The restrictions keyed to the other creatures declared with it (rules
   * 508.1c, 509.1b, `combat/company.ts`): those of its controller's creatures,
   * whatever they attack or block. */
  | "cant-attack-alone"
  | "cant-block-alone"
  | "can-only-attack-alone"
  | "cant-attack-unless-two-others"
  | "cant-block-unless-two-others"
  /** "Doesn't untap during its controller's untap step" (rule 502.3) on what
   * the static reaches. Only that untap step: something that untaps it at
   * another time still does. */
  | "doesnt-untap"
  /** "Can't be turned face up" (rule 708.7). */
  | "cant-turn-face-up"
  /** "Can't crew Vehicles" (rule 702.122d): it can't be tapped to pay a crew
   * cost. A saddle cost, or any other "tap an untapped creature" cost, still
   * can. */
  | "cant-crew";

/**
 * Who's being attacked, read from the rule's `you` (a static's controller, or
 * the controller of the effect that made it). As a restriction, the defenders
 * refused; as a requirement, the ones that obey it — one requirement however
 * many that is (rule 508.1d).
 *
 * - `"you"`: the player only, so a creature may still attack a planeswalker
 *   they control (rule 508.1b).
 * - `"you-and-planeswalkers"`: names no battle (rule 310.5).
 * - `"you-and-permanents"`: "you or permanents you control", a battle too.
 * - `"owner"`, `"owner-planeswalkers"`: the attacker's owner's.
 * - `"attacked-this-turn"`: a player this object has already attacked this
 *   turn (rule 400.7: a new object starts afresh).
 * - `"source"`: the permanent the rule comes from (Gideon Jura).
 * - any other {@link PlayerRef}, read as an effect resolves, or as a static is
 *   read: `{ controllerOf: "attached" }` (Public Enemy).
 * - `{ playerAndPlaneswalkers }`: that player and the planeswalkers they
 *   control ("can't attack those players or planeswalkers they control" —
 *   Chaos Dragon), read as an effect resolves.
 * - `{ defender }`: every player that passes the test ("an opponent with the
 *   most life among your opponents"). Planeswalkers are never in it.
 * - `{ planeswalkers }`: planeswalkers matching this from `you`'s side.
 * - `{ player }`, `{ object, stint }`: what a reference became as it was
 *   bound. Never authored.
 */
export type AttackAim =
  | "you-and-planeswalkers"
  | "you-and-permanents"
  | "owner"
  | "owner-planeswalkers"
  | "attacked-this-turn"
  | "source"
  | PlayerRef
  | { readonly playerAndPlaneswalkers: PlayerRef }
  | { readonly defender: PlayerTest }
  | { readonly planeswalkers: CardFilter }
  | { readonly player: PlayerId; readonly andPlaneswalkers?: true }
  | { readonly object: ObjectId; readonly stint: number };

/** The one attacker a rule names — a reference as authored, the object it was
 * as it was bound (rule 400.7). */
export type AttackerAim = ObjectRef | { readonly object: ObjectId; readonly stint: number };

/** "Can't attack" narrowed: only at `at`; unless, or only if, the defending
 * player passes a test (rule 508.1c, asked of the player this attack would
 * defend against — a planeswalker's or a battle's player, rule 506.2 — so in
 * multiplayer it may attack one opponent and not another). */
export interface CantAttack {
  readonly kind: "cant-attack";
  readonly at?: AttackAim;
  /** "This creature can't attack unless defending player controls an Island"
   * (Sea Serpent), "… is the monarch" (Crown-Hunter Hireling), "… unless you
   * control more creatures than defending player" (Mogg Toady). */
  readonly unlessDefender?: PlayerTest;
  /** "Can't attack if defending player controls an untapped creature with
   * power 3 or greater" (Orgg). */
  readonly ifDefender?: PlayerTest;
  readonly you?: PlayerId;
}

/** "Attacks if able" narrowed (rule 508.1d). */
export interface MustAttack {
  readonly kind: "must-attack";
  /** Obeyed only by attacking one of these, so it binds only while one can
   * be attacked. */
  readonly at?: AttackAim;
  /** "… and attacks a player other than you if able": "attacks each combat
   * if able" as well, and obeyed by attacking a **player** other than `you`
   * (goad's second requirement as a continuous effect — Kardur, Doomscourge). */
  readonly otherThan?: "you";
  /** "If [a creature matching this] attacks, this attacks if able" (Viashino
   * Bey): read as the declaration is checked. */
  readonly ifAttacks?: CardFilter;
  readonly you?: PlayerId;
}

/** "Can't block" narrowed (rule 509.1b). Every field given must hold for the
 * restriction to apply. */
export interface CantBlock {
  readonly kind: "cant-block";
  /** Only this one creature ("can't block this creature this turn"). */
  readonly attacker?: AttackerAim;
  /** Only attackers matching this, read from `you`'s side: "can block only
   * creatures with flying" is `{ not: … }`. */
  readonly attackers?: CardFilter;
  /** "Can't block unless you control more lands than attacking player",
   * asked of the attacker's controller. */
  readonly unlessAttacking?: PlayerTest;
  readonly you?: PlayerId;
}

/** "Blocks [this attacker] if able" (rule 509.1c). */
export interface MustBlock {
  readonly kind: "must-block";
  readonly attacker?: AttackerAim;
  readonly you?: PlayerId;
}

/** "Can't be blocked" narrowed (rule 509.1b, an evasion ability's restriction
 * — a change after blocks undoes nothing). */
export interface CantBeBlocked {
  readonly kind: "cant-be-blocked";
  /** By creatures matching this, from `you`'s side: "except by" is `{ not: … }`. */
  readonly by?: CardFilter;
  /** By more than this many creatures. */
  readonly byMoreThan?: number;
  /** "Can't be blocked except by N or more creatures". */
  readonly byFewerThan?: number;
  /** "Can't be blocked unless all creatures defending player controls block
   * it" (Tromokratis). */
  readonly unlessAllBlock?: true;
  readonly you?: PlayerId;
}

/** "All [creatures matching this] able to block this creature do so" (Marble
 * Priest): each its own requirement (rule 509.1c). */
export interface MustBeBlockedByAll {
  readonly kind: "must-be-blocked";
  readonly by: CardFilter;
  readonly you?: PlayerId;
}

/** "Must be blocked if able" narrowed: by one of these (Slayer's Cleaver), or
 * by exactly one creature (Nacatl War-Pride). */
export interface MustBeBlockedIfAble {
  readonly kind: "must-be-blocked-if-able";
  readonly by?: CardFilter;
  readonly exactlyOne?: true;
  readonly you?: PlayerId;
}

/**
 * "Each player may attack only the nearest opponent in the last chosen
 * direction and planeswalkers controlled by that opponent", as a resolved
 * effect (Teyo, Geometric Tactician's "choose left or right. Until your next
 * turn, …": a `restrict` over `filter: {}` per mode, lasting
 * `"until-your-next-turn"`). A rule for every player (rule 508.1c), whatever
 * the filter says: left is the next player in turn order, right the one
 * before, skipping anyone who has left the game. Read by
 * `nearestOpponentRule` beside the static form (Pramikon's
 * `attackOnlyNearestOpponent`); all of them apply at once, so two that
 * disagree leave nobody to attack while three or more players are left (the
 * ruling). `from` is the permanent whose ability chose, set as the rule is
 * bound: of several from one permanent only the **last** chosen direction
 * counts.
 */
export interface AttackOnlyNearest {
  readonly kind: "attack-only-nearest";
  readonly direction: "left" | "right";
  readonly from?: { readonly object: ObjectId; readonly stint: number };
  readonly you?: PlayerId;
}

/** A rule with parameters. `you`: whose side it's read from, set as it's bound
 * by an effect; a static's is its controller's, as it's read. */
export type CombatRecord =
  | AttackOnlyNearest
  | CantAttack
  | MustAttack
  | CantBlock
  | MustBlock
  | CantBeBlocked
  | MustBeBlockedByAll
  | MustBeBlockedIfAble;

/** One combat requirement or restriction. */
export type CombatRule = CombatWord | CombatRecord;

/** Whether a rule is good for what it's on: a creature that must be blocked
 * or can't be blocked (or only awkwardly). The bots read a `restrict` by it. */
export function combatRuleHelps(rule: CombatRule): boolean {
  const word = typeof rule === "string" ? rule : rule.kind;
  return word === "must-be-blocked" || word === "must-be-blocked-if-able" || word === "cant-be-blocked";
}

/** The target slots a rule aims at (the player or planeswalker it's attacking),
 * which the bots read as what's being aimed at. */
export function combatRuleSlots(rule: CombatRule): readonly number[] {
  if (typeof rule === "string" || (rule.kind !== "cant-attack" && rule.kind !== "must-attack")) return [];
  const at = rule.at;
  return typeof at === "object" && "target" in at ? [at.target] : [];
}

/** The word a rule shows as (a log line, `restrictions-imposed`). */
export function combatRuleWord(rule: CombatRule): CombatWord {
  return typeof rule === "string" ? rule : rule.kind;
}

/** A rule's references, read as an effect resolves. */
export interface CombatRuleRefs {
  readonly you: PlayerId;
  /** The player a {@link PlayerRef} names now, if any. */
  player(ref: PlayerRef): PlayerId | undefined;
  /** What an {@link ObjectRef} names now: a target slot may hold a player. */
  object(ref: ObjectRef): TargetRef | undefined;
  /** How many zone changes the object has made (rule 400.7). */
  stint(object: ObjectId): number;
  /** The object whose spell or ability is making the rule. */
  readonly source?: ObjectId;
}

function boundObject(target: TargetRef | undefined, refs: CombatRuleRefs): { readonly object: ObjectId; readonly stint: number } | undefined {
  return target?.kind === "object" ? { object: target.object, stint: refs.stint(target.object) } : undefined;
}

/** `aim` as it's bound: a reference becomes the player or object it names, or
 * `undefined` when it names nothing (rule 608.2b). The words stay words. */
function bindAim(aim: AttackAim, refs: CombatRuleRefs): AttackAim | undefined {
  if (typeof aim === "string") {
    switch (aim) {
      case "you":
      case "you-and-planeswalkers":
      case "you-and-permanents":
      case "owner":
      case "owner-planeswalkers":
      case "attacked-this-turn":
        return aim;
      case "source":
        return boundObject(refs.object("source"), refs);
      default: {
        const player = refs.player(aim);
        return player === undefined ? undefined : { player };
      }
    }
  }
  if ("defender" in aim || "planeswalkers" in aim || "player" in aim || "object" in aim) return aim;
  if ("playerAndPlaneswalkers" in aim) {
    const player = refs.player(aim.playerAndPlaneswalkers);
    return player === undefined ? undefined : { player, andPlaneswalkers: true };
  }
  if ("target" in aim) {
    const held = refs.object(aim.target);
    return held?.kind === "player" ? { player: held.player } : boundObject(held, refs);
  }
  const player = refs.player(aim);
  return player === undefined ? undefined : { player };
}

function bindAttacker(aim: AttackerAim, refs: CombatRuleRefs): AttackerAim | undefined {
  return typeof aim === "object" && "stint" in aim ? aim : boundObject(refs.object(aim), refs);
}

/** The rule as a resolved effect keeps it, or `undefined` when it names
 * something that's gone, leaving nothing to obey (rule 608.2b). */
export function bindCombatRule(rule: CombatRule, refs: CombatRuleRefs): CombatRule | undefined {
  if (typeof rule === "string") return rule;
  if (rule.kind === "cant-attack" || rule.kind === "must-attack") {
    if (rule.at === undefined) return { ...rule, you: refs.you };
    const at = bindAim(rule.at, refs);
    return at === undefined ? undefined : { ...rule, at, you: refs.you };
  }
  if (rule.kind === "cant-block" || rule.kind === "must-block") {
    if (rule.attacker === undefined) return { ...rule, you: refs.you };
    const attacker = bindAttacker(rule.attacker, refs);
    return attacker === undefined ? undefined : { ...rule, attacker, you: refs.you };
  }
  if (rule.kind === "attack-only-nearest" && refs.source !== undefined) {
    return { ...rule, from: { object: refs.source, stint: refs.stint(refs.source) }, you: refs.you };
  }
  return { ...rule, you: refs.you };
}

/** The `restrictions` of a static that aren't words. */
function recordsIn(ability: StaticAbility): readonly CombatRecord[] {
  return (ability.restrictions ?? []).filter((r): r is CombatRecord => typeof r !== "string");
}

/** A rule binding one object now, with whose side it's read from and the
 * object that says so (a static's source, or the object itself). */
export interface RuleInForce<R extends CombatRecord = CombatRecord> {
  readonly rule: R;
  readonly you: PlayerId;
  readonly source: GameObject;
}

interface RecordSource {
  readonly source: GameObject;
  readonly ability: StaticAbility;
  readonly records: readonly CombatRecord[];
}

const NO_SOURCES: readonly RecordSource[] = [];
const NO_RULES: readonly RuleInForce[] = [];

/** The battlefield's statics carrying a record, memoized per cache region:
 * almost always none. Its own and any a `grant-static` gave it (Full Steam
 * Ahead's "This creature can't be blocked by more than one creature"). */
function recordSources(state: GameState, registry: CardRegistry): readonly RecordSource[] {
  return computedCacheMemo("combat-record-sources", () => {
    let out: RecordSource[] | null = null;
    for (const id of state.zones.shared.battlefield) {
      const source = state.objects[id];
      if (state.players[source.controller]?.hasLost === true) continue;
      const own = hasLostAbilities(state, registry, source) ? [] : registry.get(rulesTextName(source)).static;
      const granted = grantedStatics(state, registry, source);
      for (const ability of granted.length === 0 ? own : [...own, ...granted]) {
        const records = ability.restrictions === undefined ? [] : recordsIn(ability);
        if (records.length > 0) (out ??= []).push({ source, ability, records });
      }
    }
    return out ?? NO_SOURCES;
  });
}

/**
 * Every record binding `id` now: the statics reaching it, the modifiers on
 * it, and the rules over the game it matches. Read as attackers or blockers are
 * declared, outside the layer fold: a scope like Delney's "creatures you
 * control with power 2 or less" asks for the very power the fold computes.
 */
export function recordsOn(state: GameState, registry: CardRegistry, id: ObjectId): readonly RuleInForce[] {
  const object = state.objects[id];
  if (object === undefined) return NO_RULES;
  let out: RuleInForce[] | null = null;
  for (const { source, ability, records } of recordSources(state, registry)) {
    // A scope comparing with an amount reads it from the source's side, as
    // it is now, as the P/T-scoped words' does (`restrictionsOf`).
    if (!staticReaches(state, registry, source, ability, object, { amount: sourceAmount(state, registry, source) })) continue;
    if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) continue;
    for (const rule of records) (out ??= []).push({ rule, you: source.controller, source });
  }
  for (const modifier of object.modifiers) {
    for (const rule of modifier.restrictions ?? []) {
      if (typeof rule !== "string") (out ??= []).push({ rule, you: rule.you ?? object.controller, source: object });
    }
  }
  for (const effect of combatPlayerEffects(state)) {
    const combat = effect.combat;
    if (combat === undefined || !playerEffectCovers(state, registry, id, combat)) continue;
    for (const rule of combat.rules) {
      if (typeof rule !== "string") (out ??= []).push({ rule, you: rule.you ?? effect.owner, source: object });
    }
  }
  return out ?? NO_RULES;
}

/** {@link recordsOn}, only those of one kind. */
export function recordsOfKind<K extends CombatRecord["kind"]>(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  kind: K,
): readonly RuleInForce<Extract<CombatRecord, { kind: K }>>[] {
  const all = recordsOn(state, registry, id);
  if (all.length === 0) return [];
  return all.filter((r): r is RuleInForce<Extract<CombatRecord, { kind: K }>> => r.rule.kind === kind);
}

/** Whether `defender` is what `aim` names, read from `you`'s side about the
 * attacking `object`. */
export function aimNames(
  state: GameState,
  registry: CardRegistry,
  aim: AttackAim,
  you: PlayerId,
  object: GameObject,
  defender: PlayerId | ObjectId,
  source: GameObject,
): boolean {
  const isPlayer = state.players[defender as PlayerId] !== undefined;
  const asObject = isPlayer ? undefined : state.objects[defender as ObjectId];
  if (typeof aim === "string") {
    switch (aim) {
      case "you":
        return defender === you;
      case "you-and-planeswalkers":
      case "you-and-permanents":
        return attackCovers(state, registry, aim, you, defender);
      case "owner":
        return defender === object.owner;
      case "owner-planeswalkers":
        return asObject !== undefined && asObject.controller === object.owner && isPlaneswalkerObject(state, registry, asObject);
      case "attacked-this-turn":
        return object.attackedPlayersThisTurn?.includes(defender as PlayerId) === true;
      case "source":
        return defender === source.id;
      default:
        return false;
    }
  }
  if ("player" in aim) {
    return (
      defender === aim.player ||
      (aim.andPlaneswalkers === true && asObject !== undefined && asObject.controller === aim.player && isPlaneswalkerObject(state, registry, asObject))
    );
  }
  // Only ever read bound (`bindAim`).
  if ("playerAndPlaneswalkers" in aim) return false;
  if ("object" in aim) return defender === aim.object && (asObject?.zoneChangeCount ?? 0) === aim.stint;
  if ("defender" in aim) return isPlayer && playerTestHolds(state, registry, aim.defender, defender as PlayerId, source);
  if ("planeswalkers" in aim) {
    return asObject !== undefined && isPlaneswalkerObject(state, registry, asObject) && matchesFilter(state, registry, defender as ObjectId, aim.planeswalkers, { you });
  }
  // A static's reference, read now.
  if ("controllerOf" in aim) {
    if (aim.controllerOf !== "attached") return false;
    const host = source.attachedTo === null || source.attachedTo === undefined ? undefined : state.objects[source.attachedTo];
    return host !== undefined && defender === host.controller;
  }
  return false;
}

/** Whether `player` passes a combat rule's {@link PlayerTest}, as `source`
 * (what the rule comes from) asks it: its "you" is the source's controller. */
export function playerTestHolds(
  state: GameState,
  registry: CardRegistry,
  test: PlayerTest,
  player: PlayerId,
  source: GameObject,
): boolean {
  const controlled = (who: PlayerId, filter: CardFilter): number =>
    weightedMatches(
      state,
      state.zones.shared.battlefield,
      (id) =>
        state.objects[id].controller === who &&
        matchesFilter(state, registry, id, filter, { you: who, source: source.id }),
    ).reduce((sum, match) => sum + match.weight, 0);
  if (test.controls !== undefined && controlled(player, test.controls) === 0) return false;
  if (test.holds !== undefined && !staticConditionMet(state, registry, source, test.holds, { asPlayer: player })) return false;
  if (
    test.youControlMore !== undefined &&
    controlled(source.controller, test.youControlMore) <= controlled(player, test.youControlMore)
  ) {
    return false;
  }
  if (test.mostLifeAmongYourOpponents === true) {
    if (player === source.controller || state.players[player]?.hasLost === true) return false;
    const life = state.players[player].life;
    for (const other of state.turnOrder) {
      if (other === source.controller || state.players[other]?.hasLost === true) continue;
      if (state.players[other].life > life) return false;
    }
  }
  return true;
}

function isPlaneswalkerObject(state: GameState, registry: CardRegistry, object: GameObject): boolean {
  return attackCovers(state, registry, "you-and-planeswalkers", object.controller, object.id);
}
