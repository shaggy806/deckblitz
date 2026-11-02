/**
 * Limits on how many creatures may attack or block, read off the board: "No more
 * than two creatures can attack you each combat" (Crawlspace), "No more than one
 * creature can attack each combat" and the same for blocks (Silent Arbiter), "this
 * planeswalker" (Tomik, The Eternal Wanderer), and for one combat by an effect
 * (Mirri, Weatherlight Duelist). `StaticAbility.attackLimit` and `blockLimit`, the
 * `limit-blockers` effect.
 *
 * Each is a restriction on the declaration (rules 508.1c, 509.1b), so it's read as
 * attackers or blockers are declared and never again: the rulings on Tomik and
 * Mirri let a creature put onto the battlefield attacking, or one that stays
 * attacking after the limit changes, past it. Reads only. The checks of a
 * declaration against these, which the client can run too, are `attacking.ts`'s
 * and `blocking.ts`'s, against their offers.
 */

import type { CardRegistry, StaticAbility } from "../cards.js";
import { grantedStatics, hasLostAbilities, staticConditionMet } from "../characteristics.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { rulesTextName } from "../state.js";
import type { GameObject, GameState } from "../state.js";

/** The limits on a declaration of attackers. */
export interface AttackCaps {
  /** The most creatures that may attack, whatever each attacks. */
  readonly most?: number;
  /** The most that may attack each of these: a player or a planeswalker. An
   * attack on a player's planeswalker isn't an attack on them (the rulings). */
  readonly perDefender?: Readonly<Record<string, number>>;
}

/** Every active static of a permanent matching `wanted`, those granted too. */
function limitStatics(
  state: GameState,
  registry: CardRegistry,
  wanted: (ability: StaticAbility) => boolean,
): { readonly source: GameObject; readonly ability: StaticAbility }[] {
  const out: { source: GameObject; ability: StaticAbility }[] = [];
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined || state.players[source.controller]?.hasLost !== false) continue;
    const statics = [
      ...registry.get(rulesTextName(source)).static.filter(wanted),
      ...grantedStatics(state, registry, source, wanted).filter(wanted),
    ];
    if (statics.length === 0 || hasLostAbilities(state, registry, source)) continue;
    for (const ability of statics) {
      if (ability.condition === undefined || staticConditionMet(state, registry, source, ability.condition)) {
        out.push({ source, ability });
      }
    }
  }
  return out;
}

/** The limits on attacking now, or `null` for none. */
export function attackCaps(state: GameState, registry: CardRegistry): AttackCaps | null {
  let most: number | undefined;
  const perDefender: Record<string, number> = {};
  for (const { source, ability } of limitStatics(state, registry, (a) => a.attackLimit !== undefined)) {
    const { most: n, covers } = ability.attackLimit!;
    if (covers === "all") {
      most = Math.min(most ?? n, n);
    } else {
      const defender: PlayerId | ObjectId = covers === "you" ? source.controller : source.id;
      perDefender[defender] = Math.min(perDefender[defender] ?? n, n);
    }
  }
  const capped = Object.keys(perDefender).length > 0;
  if (most === undefined && !capped) return null;
  return { ...(most !== undefined ? { most } : {}), ...(capped ? { perDefender } : {}) };
}

/**
 * How many more creatures `player` may declare as blockers now, or `null` for no
 * limit: "no more than N creatures can block each combat", less those another
 * defending player has already declared this step (the engine asks them one after
 * another), and "`player` can't block with more than N creatures this combat".
 */
export function blockersLeft(state: GameState, registry: CardRegistry, player: PlayerId): number | null {
  let left: number | null = null;
  const statics = limitStatics(state, registry, (a) => a.blockLimit !== undefined);
  if (statics.length > 0) {
    let blocking = 0;
    for (const id of state.zones.shared.battlefield) {
      const object = state.objects[id];
      if (object?.blocking !== null && object?.blocking !== undefined) blocking += object.stackCount ?? 1;
    }
    const most = Math.min(...statics.map(({ ability }) => ability.blockLimit!.most));
    left = Math.max(0, most - blocking);
  }
  for (const limit of state.combatBlockLimits ?? []) {
    if (limit.player === player && limit.combat === state.turn.combatPhases) {
      left = Math.min(left ?? limit.most, limit.most);
    }
  }
  return left;
}
