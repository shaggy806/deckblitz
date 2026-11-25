/**
 * The X that is enough for a delve spell that counters "unless its controller
 * pays {X}" (Logic Knot).
 *
 * A bot casts an {X} spell at the largest X it can pay (`candidates.ts`), and
 * delve pays X too (rule 702.66a), so the largest X counts every card in the
 * graveyard. For most {X} spells more X does more (Empty the Pits), and a
 * graveyard spent on it is well spent. For this one, X past what the spell's
 * controller could pay does nothing: a bot with 43 cards in its graveyard and
 * five mana cast Logic Knot at X = 46 against a Swan Song, and exiled all 43
 * (a live game, 2026-11-24).
 *
 * So the X is capped at one more than that player could pay, counted
 * generously, and never below the largest X mana alone pays: mana held up on
 * another player's turn is spent on nothing else, and the margin covers mana
 * the count missed. Only a delve offer is capped, where X can pass what mana
 * pays; Syncopate's X is as it was.
 */

import { isManaAbility } from "../abilities.js";
import type { LegalAction } from "../actions.js";
import type { CardRegistry } from "../cards.js";
import { computeCharacteristics } from "../characteristics.js";
import type { EffectSpec } from "../effects.js";
import type { PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";

type CastSpellLegal = Extract<LegalAction, { kind: "cast-spell" }>;

/** The target slot whose controller pays {X} or has the spell countered:
 * the `unless` in `effect` an X is paid under, chosen by a target's
 * controller. */
function payerSlot(effect: EffectSpec | null | undefined): number | undefined {
  if (effect === null || effect === undefined) return undefined;
  if (effect.kind === "sequence") {
    for (const each of effect.effects) {
      const slot = payerSlot(each);
      if (slot !== undefined) return slot;
    }
    return undefined;
  }
  if (effect.kind !== "unless" || typeof effect.chooser !== "number") return undefined;
  return effect.options.some((o) => "payGeneric" in o && o.payGeneric === "x") ? effect.chooser : undefined;
}

/** Mana one activation of an `add-mana` effect makes, as `features.ts` counts
 * it: Sol Ring 2, a live amount 1. */
function manaMade(effect: EffectSpec | null | undefined): number {
  if (effect === null || effect === undefined) return 0;
  if (effect.kind === "sequence") return effect.effects.reduce((sum, e) => sum + manaMade(e), 0);
  if (effect.kind !== "add-mana") return 0;
  const units = typeof effect.amount === "number" ? effect.amount : 1;
  const mana = effect.mana;
  return units * (typeof mana === "object" && "all" in mana ? mana.all.length : 1);
}

/** The mana `player` could pay with now, counted generously: what is in the
 * pool, and for each untapped land or permanent with a mana ability the most
 * one of its abilities makes (at least one). */
export function manaPayableNow(state: GameState, registry: CardRegistry, player: PlayerId): number {
  let mana = state.players[player]?.manaPool.length ?? 0;
  for (const id of state.zones.shared.battlefield) {
    const object = state.objects[id];
    if (object === undefined || object.controller !== player || object.tapped) continue;
    let most = computeCharacteristics(state, registry, id).types.includes("land") ? 1 : 0;
    if (registry.has(object.cardName)) {
      for (const ability of registry.get(object.cardName).activated) {
        if (isManaAbility(ability)) most = Math.max(most, 1, manaMade(ability.effect));
      }
    }
    mana += most * (object.stackCount ?? 1);
  }
  return mana;
}

/**
 * The largest X worth casting `legal` at, or `undefined` where its own
 * largest stands: every {X} spell but a delve one whose X a target's
 * controller pays to stop it. The most any offered target's controller could
 * pay, plus one; at least what mana alone pays.
 */
export function enoughX(state: GameState, registry: CardRegistry, legal: CastSpellLegal): number | undefined {
  const xCost = legal.xCost;
  const byX = legal.delve?.byX;
  if (xCost === undefined || byX === undefined || legal.delve?.fromHand !== undefined) return undefined;
  if (legal.castModal !== undefined || !registry.has(legal.cardName)) return undefined;
  const def = registry.get(legal.cardName);
  const face = legal.face !== undefined ? def.faces?.[legal.face] : undefined;
  const effect = face !== undefined && face !== def.name ? (registry.has(face) ? registry.get(face).effect : null) : def.effect;
  const slot = payerSlot(effect);
  const options = slot === undefined ? undefined : legal.targetOptions[slot];
  if (options === undefined || options.length === 0) return undefined;
  let payable = 0;
  for (const ref of options) {
    if (ref.kind !== "object") return undefined;
    const controller = state.objects[ref.object]?.controller;
    if (controller === undefined) return undefined;
    payable = Math.max(payable, manaPayableNow(state, registry, controller));
  }
  // The largest X no card need be exiled for.
  let byMana = xCost.minX ?? 0;
  for (let x = 0; x < byX.length && x <= xCost.maxX; x += 1) if (byX[x].minCards <= 0) byMana = Math.max(byMana, x);
  const enough = Math.max(payable + 1, byMana);
  return enough < xCost.maxX ? enough : undefined;
}

/** `legal` with its X capped at {@link enoughX}: what the bots' candidates
 * are built from. */
export function withEnoughX(state: GameState, registry: CardRegistry, legal: CastSpellLegal): CastSpellLegal {
  const enough = enoughX(state, registry, legal);
  return enough === undefined || legal.xCost === undefined ? legal : { ...legal, xCost: { ...legal.xCost, maxX: enough } };
}
