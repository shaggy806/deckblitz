/**
 * What particular creatures cost to attack and to block (rules 508.1h,
 * 509.1d): `StaticAbility.combatTax` and the `blockTax` player effect, read
 * off the board. `Game.attackTaxOn` is the other half, what attacking a
 * defender costs whatever attacks it.
 *
 * Reads only. The arithmetic over a declaration, which the client can run too,
 * is in `attacking.ts` and `blocking.ts`; `Game` pays.
 */

import type { AttackCost, AttackPermanentCost, BlockTaxRates, BlockerTax, CombatCost } from "../actions.js";
import type { CardRegistry, CombatPermanentTax, CombatTax, StaticAbility } from "../cards.js";
import {
  cantBeSacrificed,
  computeCharacteristics,
  countValue,
  hasLostAbilities,
  staticConditionMet,
  staticReaches,
} from "../characteristics.js";
import { matchesFilter } from "../filter.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { rulesTextName } from "../state.js";
import type { GameObject, GameState } from "../state.js";

/** Who an attack tax covers: `owner` and, by what `covers` says, the
 * planeswalkers they control. A planeswalker isn't "you" (Ghostly Prison's
 * ruling); a battle is neither; `"all"` is every attack on anything. */
export function attackCovers(
  state: GameState,
  registry: CardRegistry,
  covers: "you" | "you-and-planeswalkers" | "planeswalkers" | "all",
  owner: PlayerId,
  defender: PlayerId | ObjectId,
): boolean {
  if (covers === "all") return true;
  const isPlayer = state.players[defender as PlayerId] !== undefined;
  const object = isPlayer ? undefined : state.objects[defender as ObjectId];
  if ((isPlayer ? (defender as PlayerId) : object?.controller) !== owner) return false;
  if (isPlayer) return covers !== "planeswalkers";
  if (covers === "you" || object === undefined) return false;
  return computeCharacteristics(state, registry, object.id).types.includes("planeswalker");
}

interface TaxSource {
  readonly source: GameObject;
  readonly ability: StaticAbility;
  readonly tax: CombatTax;
}

/** Every `combatTax` static that applies now: its permanent's controller is
 * still in the game, it hasn't lost its abilities, its condition holds. */
function taxSources(state: GameState, registry: CardRegistry, on: CombatTax["on"][number]): TaxSource[] {
  const out: TaxSource[] = [];
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined) continue;
    const statics = registry.get(rulesTextName(source)).static;
    if (!statics.some((a) => a.combatTax?.on.includes(on) === true)) continue;
    if (state.players[source.controller]?.hasLost !== false || hasLostAbilities(state, registry, source)) continue;
    for (const ability of statics) {
      if (ability.combatTax?.on.includes(on) !== true) continue;
      if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) continue;
      out.push({ source, ability, tax: ability.combatTax });
    }
  }
  return out;
}

/** What `tax` costs one creature, `taxed`. */
function costOf(state: GameState, registry: CardRegistry, { source, tax }: TaxSource, taxed: GameObject): CombatCost {
  const amount = tax.generic ?? 0;
  const generic = typeof amount === "number" ? amount : countValue(amount, state, registry, source.controller);
  const counters =
    tax.perCounter === undefined
      ? 1
      : tax.perCounter === "any"
        ? Object.values(taxed.counters).reduce((n, c) => n + c, 0)
        : (taxed.counters[tax.perCounter] ?? 0);
  return { generic: generic * counters, life: tax.life ?? 0 };
}

/**
 * What each of `attackers` costs on its own to attack each of its defenders,
 * on top of what the defender costs anyone (`Game.attackTaxOn`): only the
 * pairs that cost something. Empty with no such static in play.
 */
export function creatureAttackTaxes(
  state: GameState,
  registry: CardRegistry,
  defendersFor: Readonly<Record<ObjectId, readonly (PlayerId | ObjectId)[]>>,
): Record<ObjectId, Record<string, AttackCost>> {
  const out: Record<ObjectId, Record<string, AttackCost>> = {};
  const sources = taxSources(state, registry, "attack");
  if (sources.length === 0) return out;
  for (const attacker of Object.keys(defendersFor) as ObjectId[]) {
    for (const defender of defendersFor[attacker]) {
      const cost = creatureAttackTaxFrom(state, registry, sources, attacker, defender);
      if (cost.generic > 0 || cost.life > 0 || cost.permanents !== undefined) (out[attacker] ??= {})[defender] = cost;
    }
  }
  return out;
}

/** What `attacker` costs on its own to attack `defender` (rule 508.1h). */
export function creatureAttackTax(
  state: GameState,
  registry: CardRegistry,
  attacker: ObjectId,
  defender: PlayerId | ObjectId,
): AttackCost {
  return creatureAttackTaxFrom(state, registry, taxSources(state, registry, "attack"), attacker, defender);
}

function creatureAttackTaxFrom(
  state: GameState,
  registry: CardRegistry,
  sources: readonly TaxSource[],
  attacker: ObjectId,
  defender: PlayerId | ObjectId,
): AttackCost {
  const object = state.objects[attacker];
  let generic = 0;
  let life = 0;
  if (object === undefined) return { generic, life };
  const permanents: AttackPermanentCost[] = [];
  for (const entry of reachingTaxes(state, registry, sources, object, defender)) {
    const cost = costOf(state, registry, entry, object);
    generic += cost.generic;
    life += cost.life;
    const owed = entry.tax.permanents;
    if (owed !== undefined) {
      permanents.push({
        do: owed.do,
        count: owed.count ?? 1,
        noun: owed.noun,
        among: attackCostAmong(state, registry, object.controller, owed, entry.source.id),
      });
    }
  }
  return { generic, life, ...(permanents.length > 0 ? { permanents } : {}) };
}

/** The taxes among `sources` that reach `attacker` attacking `defender`. */
function reachingTaxes(
  state: GameState,
  registry: CardRegistry,
  sources: readonly TaxSource[],
  attacker: GameObject,
  defender: PlayerId | ObjectId,
): TaxSource[] {
  return sources.filter(
    ({ source, ability, tax }) =>
      (tax.covers === undefined || attackCovers(state, registry, tax.covers, source.controller, defender)) &&
      staticReaches(state, registry, source, ability, attacker),
  );
}

/** What `player` could pay `tax` with now: their own permanents matching its
 * filter, each one that can be sacrificed if that's the cost (rule 701.21a). */
export function attackCostAmong(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  tax: CombatPermanentTax,
  source: ObjectId,
): ObjectId[] {
  return state.zones.shared.battlefield.filter((id) => {
    const object = state.objects[id];
    return (
      object !== undefined &&
      object.controller === player &&
      matchesFilter(state, registry, id, tax.filter, { you: player, source }) &&
      (tax.do !== "sacrifice" || !cantBeSacrificed(state, registry, id))
    );
  });
}

/** One creature's costs to attack in permanents: `tax` to pay, and the
 * permanent whose static asks it, naming it in the prompt. */
export function creatureAttackPermanentTaxes(
  state: GameState,
  registry: CardRegistry,
  attacker: ObjectId,
  defender: PlayerId | ObjectId,
): readonly { readonly tax: CombatPermanentTax; readonly source: ObjectId }[] {
  const object = state.objects[attacker];
  if (object === undefined) return [];
  return reachingTaxes(state, registry, taxSources(state, registry, "attack"), object, defender).flatMap(
    ({ source, tax }) => (tax.permanents === undefined ? [] : [{ tax: tax.permanents, source: source.id }]),
  );
}

/**
 * What blocking costs among `blockers` and `attacking` (rule 509.1d), or
 * `null` when nothing taxes any of it: the `combatTax` statics reaching a
 * blocker or an attacker, and every `blockTax` player effect.
 */
export function blockTaxRates(
  state: GameState,
  registry: CardRegistry,
  blockers: readonly ObjectId[],
  attacking: readonly ObjectId[],
): BlockTaxRates | null {
  const onBlocker: Record<ObjectId, BlockerTax[]> = {};
  const add = (blocker: ObjectId, tax: BlockerTax): void => {
    if (tax.generic > 0 || tax.life > 0) (onBlocker[blocker] ??= []).push(tax);
  };
  for (const entry of taxSources(state, registry, "block")) {
    const { source, ability, tax } = entry;
    const only =
      tax.attacker === undefined
        ? undefined
        : attacking.filter((a) =>
            matchesFilter(state, registry, a, tax.attacker!, { you: source.controller, source: source.id }),
          );
    if (only?.length === 0) continue;
    for (const blocker of blockers) {
      const object = state.objects[blocker];
      if (object === undefined || !staticReaches(state, registry, source, ability, object)) continue;
      add(blocker, { ...costOf(state, registry, entry, object), ...(only !== undefined ? { attackers: only } : {}) });
    }
  }
  for (const { blockTax } of state.playerEffects ?? []) {
    if (blockTax === undefined) continue;
    for (const blocker of blockers) add(blocker, blockTax);
  }
  const onAttacker: Record<ObjectId, CombatCost> = {};
  for (const entry of taxSources(state, registry, "be-blocked")) {
    for (const attacker of attacking) {
      const object = state.objects[attacker];
      if (object === undefined || !staticReaches(state, registry, entry.source, entry.ability, object)) continue;
      const cost = costOf(state, registry, entry, object);
      if (cost.generic === 0 && cost.life === 0) continue;
      const had = onAttacker[attacker];
      onAttacker[attacker] = { generic: (had?.generic ?? 0) + cost.generic, life: (had?.life ?? 0) + cost.life };
    }
  }
  const blockerTaxed = Object.keys(onBlocker).length > 0;
  const attackerTaxed = Object.keys(onAttacker).length > 0;
  if (!blockerTaxed && !attackerTaxed) return null;
  return { ...(blockerTaxed ? { onBlocker } : {}), ...(attackerTaxed ? { onAttacker } : {}) };
}
