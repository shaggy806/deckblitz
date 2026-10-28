/**
 * Splitting an attacker's combat damage among its blockers — rule 510.1c and
 * the "standard" split every automatic answer uses.
 *
 * There is no damage assignment order any more: *Magic: The Gathering
 * Foundations* removed it, so a creature blocked by several others divides
 * its damage among them however its controller likes (510.1c), and only
 * trample asks for lethal on each before any goes over (702.19b). See
 * `docs/plans/damage-assignment-order.md`.
 *
 * This module exists because the split had two implementations. `Game`'s
 * `autoAssignForAttacker` derived the blockers and their lethal amounts off
 * the board; `controller.ts`'s `standardDamageAssignment` took them
 * pre-computed from the `assign-combat-damage` offer. Below the derivation
 * the two loops were byte-identical, so a rules fix to either one would have
 * silently disagreed with the other — the engine auto-assigning one way and
 * every controller answering another.
 *
 * {@link standardAssignment} is now the one copy, and
 * {@link autoAssignForAttacker} is the board-reading wrapper over it.
 *
 * Everything here is a read; applying an assignment stays on `Game`.
 */

import type { CardRegistry } from "../cards.js";
import { assignedCombatDamage, computeCharacteristics, objHasKeyword } from "../characteristics.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import { blockedAttackersOf, damageAssigner, opposedAssignment } from "./banding.js";

/** The blockers of `attackerId` that are still on the battlefield and still
 * blocking — one may have been removed in response after blocks were
 * declared — in the order they were declared, which means nothing to the
 * rules but keeps every per-blocker list lined up. "Still blocking" because
 * an id outlives its object: a blocker that died and came back before damage
 * (Reassembling Skeleton) is a new object on the battlefield that blocks
 * nothing (rules 400.7, 506.4). */
export function liveBlockersOf(state: GameState, attackerId: ObjectId): ObjectId[] {
  return state.objects[attackerId].blockedBy.filter((id) => {
    const blocker = state.objects[id];
    return blocker?.zone === "battlefield" && blocker.blocking !== null;
  });
}

/** How much damage counts as lethal to `blockerId` right now: its remaining
 * toughness, or 1 from a deathtouch attacker (rule 702.2b). */
export function lethalFor(
  state: GameState,
  registry: CardRegistry,
  attackerId: ObjectId,
  blockerId: ObjectId,
): number {
  if (objHasKeyword(state, registry, attackerId, "deathtouch")) return 1;
  const marked = state.objects[blockerId].damageMarked;
  const toughness = computeCharacteristics(state, registry, blockerId).toughness;
  return Math.max(0, toughness - marked);
}

/**
 * Whether the attacker's controller actually has a choice to make, or whether
 * the split is forced and can be auto-assigned without asking.
 *
 * Any two blockers make it a choice, since any division among them is legal.
 * A lone blocker takes everything, unless trample leaves room past its lethal.
 */
export function needsDamageAssignmentChoice(
  state: GameState,
  registry: CardRegistry,
  attackerId: ObjectId,
): boolean {
  const live = liveBlockersOf(state, attackerId);
  if (live.length === 0) return false;
  const power = assignedCombatDamage(state, registry, attackerId);
  if (power <= 0) return false;
  if (live.length >= 2) return true;
  if (!objHasKeyword(state, registry, attackerId, "trample")) return false;
  return power > lethalFor(state, registry, attackerId, live[0]);
}

/** What an attacker's damage assignment is being decided against: how much
 * there is to assign, what counts as lethal to each blocker (in declaration
 * order), and whether the excess may trample over. */
export interface DamageAssignmentOffer {
  /** How much combat damage the attacker assigns (rule 510.1a): its power,
   * or its toughness under a `combatDamageByToughness` static
   * (`combatDamageOf`). Named for the usual case. */
  readonly power: number;
  readonly lethal: readonly number[];
  readonly trample: boolean;
  /** Which blockers lethal damage won't destroy, in the same order. Trample
   * still needs lethal on them first (702.19b); they just don't die of it.
   * Absent means none of them. */
  readonly indestructible?: readonly boolean[];
}

/**
 * The standard combat-damage assignment: kill as many blockers as possible,
 * the ones needing least first (ties in declaration order). Indestructible
 * blockers come after all the rest, since lethal damage on one kills nothing:
 * they get it only once everything that can die has, which is what trampling
 * over needs. Whatever is left tramples over if every blocker got lethal, and
 * otherwise goes on the cheapest blocker still short of it — or, with every
 * blocker dead and no trample, on the last one killed.
 *
 * **The one copy.** `Game` reaches it through {@link autoAssignForAttacker}
 * when nobody is asked; every controller reaches it directly as its default
 * answer when somebody is, and the client starts its damage bar from it.
 */
export function standardAssignment(offer: DamageAssignmentOffer): number[] {
  const { power, lethal, trample } = offer;
  const survives = (index: number): number => (offer.indestructible?.[index] ? 1 : 0);
  const amounts = lethal.map(() => 0);
  if (lethal.length === 0) return amounts;
  const cheapestFirst = lethal
    .map((_, index) => index)
    .sort((a, b) => survives(a) - survives(b) || lethal[a] - lethal[b] || a - b);
  let remaining = power;
  let killed = 0;
  for (const index of cheapestFirst) {
    if (lethal[index] > remaining) break;
    amounts[index] = lethal[index];
    remaining -= lethal[index];
    killed += 1;
  }
  if (remaining > 0 && !(trample && killed === lethal.length)) {
    amounts[cheapestFirst[Math.min(killed, lethal.length - 1)]] += remaining;
  }
  return amounts;
}

/** The answer nobody has to think about: {@link standardAssignment}, or —
 * when banding hands the division to the other side (rules 702.22j-k) —
 * theirs, killing as little as it can (`opposedAssignment`). Every
 * controller's default and the decision's random answer start from it. */
export function defaultAssignment(offer: DamageAssignmentOffer & { readonly forOpponent?: boolean }): number[] {
  return offer.forOpponent === true ? opposedAssignment(offer) : standardAssignment(offer);
}

/** {@link standardAssignment} with the offer read off the board — what the
 * engine assigns when {@link needsDamageAssignmentChoice} says there is no
 * choice worth asking about. */
export function autoAssignForAttacker(
  state: GameState,
  registry: CardRegistry,
  attackerId: ObjectId,
): number[] {
  return autoAssignFor(state, registry, attackerId);
}

/**
 * What a creature dealing combat damage divides it among: an attacker, the
 * creatures blocking it (rule 510.1c); a blocker, the attackers it blocks —
 * more than one only when it blocked a band (510.1d, 702.22h). In
 * declaration order.
 */
export function damageRecipientsOf(state: GameState, dealerId: ObjectId): ObjectId[] {
  return state.objects[dealerId]?.attacking !== null
    ? liveBlockersOf(state, dealerId)
    : blockedAttackersOf(state, dealerId);
}

/** The whole question of how `dealerId` divides its combat damage, read off
 * the board: who decides it (banding may hand it to the other side — rules
 * 702.22j-k), among what, and the numbers the answer is checked against. */
export interface DamageQuestion extends DamageAssignmentOffer {
  readonly player: PlayerId;
  readonly recipients: readonly ObjectId[];
  readonly indestructible: readonly boolean[];
  /** The dealer is a blocker (510.1d). */
  readonly blocking: boolean;
  /** `player` doesn't control the dealer. */
  readonly forOpponent: boolean;
}

export function damageQuestionFor(state: GameState, registry: CardRegistry, dealerId: ObjectId): DamageQuestion {
  const recipients = damageRecipientsOf(state, dealerId);
  const blocking = state.objects[dealerId].attacking === null;
  const player = damageAssigner(state, registry, dealerId, recipients);
  return {
    player,
    recipients,
    power: assignedCombatDamage(state, registry, dealerId),
    lethal: recipients.map((r) => lethalFor(state, registry, dealerId, r)),
    // Trample is an attacker's only (rule 702.19a).
    trample: !blocking && objHasKeyword(state, registry, dealerId, "trample"),
    indestructible: recipients.map((r) => objHasKeyword(state, registry, r, "indestructible")),
    blocking,
    forOpponent: player !== state.objects[dealerId].controller,
  };
}

/** The division made without asking: the standard one, or — when the other
 * side divides it (banding) — theirs ({@link opposedAssignment}). */
export function autoAssignFor(state: GameState, registry: CardRegistry, dealerId: ObjectId): number[] {
  const question = damageQuestionFor(state, registry, dealerId);
  return question.forOpponent ? opposedAssignment(question) : standardAssignment(question);
}

/** Whether a blocker blocking a band has a division to make: two or more
 * attackers left to deal its damage to (rule 510.1d). */
export function blockerNeedsDamageAssignmentChoice(
  state: GameState,
  registry: CardRegistry,
  blockerId: ObjectId,
): boolean {
  return blockedAttackersOf(state, blockerId).length >= 2 && assignedCombatDamage(state, registry, blockerId) > 0;
}

/**
 * Why `assignment` is not a legal answer to `offer`, or `null` if it is —
 * rules 510.1c and 702.19b, plus the arithmetic around them. Any division of
 * the attacker's power among its blockers is legal; only damage trampled over
 * needs every blocker to have lethal first (damage already marked counts,
 * and 1 is lethal from deathtouch — both folded into `lethal`).
 *
 * Deliberately says nothing about *who* is being asked: that guard, and its
 * "is not being asked to assign combat damage" wording, stay with the caller
 * (`Game.whyCannotAssignCombatDamage`), because two engine tests and the
 * client's error banner read it verbatim.
 */
export function damageAssignmentViolations(
  offer: DamageAssignmentOffer & { readonly blockers: readonly ObjectId[] },
  assignment: readonly number[],
): string | null {
  const { blockers, power, lethal, trample } = offer;
  if (assignment.length !== blockers.length) {
    return `expected an amount for each of ${blockers.length} blocker(s), got ${assignment.length}`;
  }
  if (assignment.some((n) => !Number.isInteger(n) || n < 0)) {
    return "combat damage assignments must be non-negative whole numbers";
  }
  const total = assignment.reduce((sum, n) => sum + n, 0);
  const over = power - total;
  if (over < 0) return "assigned more than the attacker's power";
  if (over > 0 && !trample) {
    return "only a trampling attacker can assign combat damage to the defending player";
  }
  if (over > 0) {
    for (let j = 0; j < blockers.length; j += 1) {
      if (assignment[j] < lethal[j]) {
        return "every blocker must be assigned lethal damage before trampling over";
      }
    }
  }
  return null;
}
