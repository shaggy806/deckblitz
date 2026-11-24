/**
 * A mana source whose mana is the colours of the cards exiled with it (rule
 * 607.2a, linked abilities: Chrome Mox's "{T}: Add one mana of any of the
 * exiled card's colors"). With none of those cards coloured it makes no mana
 * (the rulings), and the card under it is worth only its colour. Read as the
 * engine reads it: `Game`'s `colorAmong` over `exiled-with-source`, the cards
 * linked to the permanent in the stint it's in now.
 *
 * The evaluation counts such a source's mana only with a coloured card under
 * it (`features.ts`), and v1 gives up the hand's least useful coloured card
 * to one (`HeuristicBotController.chooseFromZone`): a report from a live game,
 * 2026-11-23, of a Chrome Mox cast with nothing imprinted
 * (`docs/bot-misplays.md`).
 */

import { isManaAbility } from "../abilities.js";
import type { CardRegistry } from "../cards/card-registry.js";
import type { CardDefinition } from "../cards/define.js";
import { effectiveColors } from "../characteristics.js";
import type { EffectSpec } from "../effects.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import type { GameObject, GameState } from "../state.js";

const memo = new WeakMap<CardDefinition, boolean>();

function linked(effect: EffectSpec | null | undefined): boolean {
  if (effect === null || effect === undefined) return false;
  if (effect.kind === "sequence") return effect.effects.every(linked);
  if (effect.kind !== "add-mana") return false;
  const mana = effect.mana;
  return (
    typeof mana === "object" && ("colorAmong" in mana || "eachColorAmong" in mana) && mana.zone === "exiled-with-source"
  );
}

/** Whether every `{T}` mana ability of `def` makes mana only of the colours
 * of the cards exiled with it. */
export function manaOnlyFromLinkedCards(def: CardDefinition): boolean {
  let found = memo.get(def);
  if (found === undefined) {
    const abilities = def.activated.filter((a) => a.cost.tap && isManaAbility(a));
    found = abilities.length > 0 && abilities.every((a) => linked(a.effect));
    memo.set(def, found);
  }
  return found;
}

/** Whether `object`, a card, has a colour to lend. */
export function isColoured(state: GameState, registry: CardRegistry, object: GameObject): boolean {
  return registry.has(printedCardName(object)) && effectiveColors(state, registry, object).size > 0;
}

/** Whether a coloured card is exiled with permanent `id` in its current stint. */
export function hasColouredLinkedCard(state: GameState, registry: CardRegistry, id: ObjectId): boolean {
  const stint = state.objects[id]?.zoneChangeCount ?? 0;
  return state.zones.shared.exile.some((card) => {
    const object = state.objects[card];
    const link = object?.exiledWith;
    return (
      object !== undefined &&
      link !== undefined &&
      link.source === id &&
      link.zoneChangeCount === stint &&
      isColoured(state, registry, object)
    );
  });
}
