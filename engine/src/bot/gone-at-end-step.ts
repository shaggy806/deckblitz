/**
 * Which permanents the end step of the turn under way takes, whatever is
 * done with them first: a creature that is worth what it does this turn and
 * nothing after it.
 *
 * Three ways a card says it, and the bots read all three:
 *
 * - the per-object flags a token is made with (`sacrificeAtEndStep`,
 *   `exileAtEndStep`: Kiki-Jiki's copy, mobilize's Warriors, blitz, encore);
 * - its own "At the beginning of the end step, sacrifice this" (Ball
 *   Lightning, Rite of the Raging Storm's Lightning Rager);
 * - a delayed ability set up as it arrived (Sneak Attack, Through the
 *   Breach: "sacrifice it at the beginning of the next end step").
 *
 * Only the flags were read at first, by the evaluation alone. A seat with a
 * 5/1 Lightning Rager it would sacrifice that turn kept it home as a blocker
 * in 13 declarations of 16, one of them in front of a player with no
 * untapped creature (a kept live game, 7LSU2-1, 2026-11-23: "bots seem to
 * treat temporary creatures that get sacrificed at the end of turn as worth
 * keeping home as blockers").
 */

import { hasLostAbilities } from "../characteristics.js";
import type { CardRegistry } from "../cards.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameObject, GameState } from "../state.js";
import { rulesTextName } from "../state.js";

/** `"any"`: at every end step. `"you"`: at its controller's. */
type Printed = "any" | "you" | null;

const printedByName = new WeakMap<CardRegistry, Map<string, Printed>>();

/** Whether the card named `name` sacrifices itself at the beginning of an
 * end step, with no "if" and no choice about it. */
function printedSacrifice(registry: CardRegistry, name: string): Printed {
  let known = printedByName.get(registry);
  if (known === undefined) {
    known = new Map();
    printedByName.set(registry, known);
  }
  const cached = known.get(name);
  if (cached !== undefined) return cached;
  let found: Printed = null;
  if (registry.has(name)) {
    for (const ability of registry.get(name).triggered) {
      const trigger = ability.trigger as { readonly on?: unknown; readonly step?: unknown; readonly who?: unknown };
      if (trigger.on !== "step-begins" || trigger.step !== "end") continue;
      if (ability.condition !== undefined || ability.whileCondition !== undefined) continue;
      if ((ability.effect as { readonly kind?: unknown } | null)?.kind !== "sacrifice-source") continue;
      if (trigger.who === "any") found = "any";
      else if (trigger.who === "you" && found === null) found = "you";
    }
  }
  known.set(name, found);
  return found;
}

/** The effects of a delayed ability that take the permanent they name off
 * the battlefield. */
const REMOVES = new Set(["sacrifice-target", "exile", "destroy", "return-to-hand"]);

/**
 * Whether `object`, on the battlefield, is gone at the end step of the turn
 * under way. Not once that end step has begun: what is still there then was
 * made after its trigger, and waits for the next one.
 */
export function goneAtEndStep(state: GameState, registry: CardRegistry, object: GameObject): boolean {
  if (object.sacrificeAtEndStep === true || object.exileAtEndStep === true) return true;
  if (state.turn.step === "end" || state.turn.step === "cleanup") return false;
  const active: PlayerId | undefined = state.turnOrder[state.turn.activePlayerIndex];
  const printed = printedSacrifice(registry, rulesTextName(object));
  if (
    printed !== null &&
    (printed === "any" || object.controller === active) &&
    !hasLostAbilities(state, registry, object)
  ) {
    return true;
  }
  if (state.delayedTriggers.length === 0) return false;
  const stint = object.zoneChangeCount ?? 0;
  for (const delayed of state.delayedTriggers) {
    const at = delayed.at as { readonly step?: unknown; readonly whose?: unknown; readonly which?: unknown };
    if (at.step !== "end" || at.which === "next-turn" || delayed.if !== undefined) continue;
    if (at.whose !== "any" && at.whose !== active) continue;
    const effect = delayed.effect as { readonly kind?: unknown; readonly target?: unknown; readonly from?: unknown };
    if (effect.from !== undefined) continue;
    let named: ObjectId | undefined;
    let namedStint: number | null | undefined;
    if (effect.kind === "sacrifice-source" || (REMOVES.has(effect.kind as string) && effect.target === "source")) {
      named = delayed.source;
      namedStint = delayed.sourceStint;
    } else if (REMOVES.has(effect.kind as string) && typeof effect.target === "number") {
      const target = delayed.targets[effect.target];
      if (target !== undefined && target !== null && !Array.isArray(target) && (target as { kind?: unknown }).kind === "object") {
        named = (target as { readonly object: ObjectId }).object;
        namedStint = delayed.targetStints?.[effect.target];
      }
    }
    if (named !== object.id) continue;
    if (namedStint !== undefined && namedStint !== null && namedStint !== stint) continue;
    return true;
  }
  return false;
}
