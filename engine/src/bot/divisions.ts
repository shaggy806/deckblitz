/**
 * How a divided amount is shared out among the targets a candidate names.
 *
 * "5 damage divided as you choose among any number of targets" is two
 * choices, the targets and the shares (rules 601.2d and 603.3d). The bots
 * made the first and never the second: an action with no `division` is split
 * as evenly as it goes (`divisionOf`), so Dragonlord Atarka over a 4/4 and a
 * 1/1 dealt 3 and 2, which kills the 1/1 alone, and the search rightly put
 * all 5 on the 4/4 instead (a live game, 2026-11-15; BACKLOG since
 * 2026-10-18). Here each candidate that names two targets or more gets the
 * shares worth trying: every target what is lethal to it, the cheapest kills
 * first, and the same with the dearest first. The search plays them out and
 * keeps the best, as it does any other candidate.
 */

import type { Action, LegalAction } from "../actions.js";
import type { CardRegistry } from "../cards.js";
import { computeCharacteristics } from "../characteristics.js";
import type { GameState } from "../state.js";
import type { TargetRef } from "../target.js";

type Divide = { readonly total: number; readonly slot: number; readonly upTo?: true };

/** The damage that kills `target`: a creature's toughness less what it has
 * taken, a planeswalker's loyalty. `Infinity` for what a share can't kill (an
 * indestructible creature, anything else) and for a player, who is where
 * what's left over goes. */
function lethalTo(state: GameState, registry: CardRegistry, target: TargetRef): { readonly lethal: number; readonly player: boolean } {
  if (target.kind === "player") return { lethal: Infinity, player: true };
  const object = state.objects[target.object];
  if (object === undefined || object.zone !== "battlefield") return { lethal: Infinity, player: false };
  const c = computeCharacteristics(state, registry, target.object);
  if (c.types.includes("creature")) {
    return { lethal: c.keywords.has("indestructible") ? Infinity : Math.max(1, c.toughness - object.damageMarked), player: false };
  }
  if (c.types.includes("planeswalker")) return { lethal: Math.max(1, object.counters.loyalty ?? 1), player: false };
  return { lethal: Infinity, player: false };
}

/**
 * The shares for `members` taken in `order`: one each (the least a target may
 * get), then each in turn made lethal while the amount lasts. What's over
 * goes to a player among them, or toward the first target not yet killed, or
 * on the first; an "up to" amount leaves it undealt.
 */
function shares(
  members: readonly { readonly lethal: number; readonly player: boolean }[],
  divide: Divide,
  order: readonly number[],
): number[] {
  const share = members.map(() => 1);
  let left = divide.total - members.length;
  for (const i of order) {
    const need = members[i].lethal - 1;
    if (Number.isFinite(need) && need <= left) {
      share[i] += need;
      left -= need;
    }
  }
  if (left > 0 && divide.upTo !== true) {
    const sink = order.find((i) => members[i].player) ?? order.find((i) => share[i] < members[i].lethal) ?? order[0];
    share[sink] += left;
  }
  return share;
}

/**
 * `actions`, each that divides an amount over two targets or more replaced by
 * one candidate per way of sharing it worth trying. Any other action, and any
 * offer that divides nothing, comes back as it was.
 */
export function withDivisions(state: GameState, registry: CardRegistry, legal: LegalAction, actions: readonly Action[]): Action[] {
  const divide: Divide | undefined =
    legal.kind === "cast-spell" || legal.kind === "activate-ability" || legal.kind === "choose-targets" ? legal.divide : undefined;
  if (divide === undefined) return [...actions];
  const out: Action[] = [];
  for (const action of actions) {
    if (
      (action.type !== "cast-spell" && action.type !== "activate-ability" && action.type !== "choose-targets") ||
      action.targets === undefined ||
      action.division !== undefined
    ) {
      out.push(action);
      continue;
    }
    const members = action.targets
      .slice(divide.slot)
      .filter((t): t is TargetRef => t !== null && t !== undefined)
      .map((t) => lethalTo(state, registry, t));
    if (members.length < 2 || members.length > divide.total) {
      out.push(action);
      continue;
    }
    const index = members.map((_, i) => i);
    // The cheapest kills first (the most of them), then the dearest first
    // (the biggest thing dead, whatever is left for the rest).
    const cheapest = shares(members, divide, [...index].sort((a, b) => members[a].lethal - members[b].lethal));
    const dearest = shares(
      members,
      divide,
      [...index].sort((a, b) => (Number.isFinite(members[b].lethal) ? members[b].lethal : -1) - (Number.isFinite(members[a].lethal) ? members[a].lethal : -1)),
    );
    out.push({ ...action, division: cheapest });
    if (dearest.some((n, i) => n !== cheapest[i])) out.push({ ...action, division: dearest });
  }
  return out;
}
