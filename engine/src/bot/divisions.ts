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
import { computeCharacteristics, lethalDamageLeft } from "../characteristics.js";
import type { GameState } from "../state.js";
import type { TargetRef } from "../target.js";

type Divide = {
  readonly total: number;
  readonly slot: number;
  readonly upTo?: true;
  readonly x?: true;
  readonly totalByX?: readonly number[];
};

/** The damage that kills `target`: what's left of a creature's lethal damage
 * (`lethalDamageLeft` — its toughness, or its power under Zilortha, less what
 * it has taken), a planeswalker's loyalty. `Infinity` for what a share can't kill (an
 * indestructible creature, anything else) and for a player, who is where
 * what's left over goes. */
function lethalTo(state: GameState, registry: CardRegistry, target: TargetRef): { readonly lethal: number; readonly player: boolean } {
  if (target.kind === "player") return { lethal: Infinity, player: true };
  const object = state.objects[target.object];
  if (object === undefined || object.zone !== "battlefield") return { lethal: Infinity, player: false };
  const c = computeCharacteristics(state, registry, target.object);
  if (c.types.includes("creature")) {
    return { lethal: c.keywords.has("indestructible") ? Infinity : Math.max(1, lethalDamageLeft(c, object.damageMarked)), player: false };
  }
  if (c.types.includes("planeswalker")) return { lethal: Math.max(1, object.counters.loyalty ?? 1), player: false };
  return { lethal: Infinity, player: false };
}

/** The damage that kills `target` outright, `Infinity` where none does (a
 * player, an indestructible creature): what v1 pays for in life (`lifeX`). */
export function lethalDamageTo(state: GameState, registry: CardRegistry, target: TargetRef): number {
  return lethalTo(state, registry, target).lethal;
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
  // An X paid in life (Fire Covenant): every point past what kills the
  // targets is life for nothing.
  const lifeX = legal.kind === "cast-spell" && legal.xCost?.paidInLife === true && divide.x === true && divide.totalByX === undefined;
  const trimmed = new Set<string>();
  const out: Action[] = [];
  for (const candidate of actions) {
    if (
      (candidate.type !== "cast-spell" && candidate.type !== "activate-ability" && candidate.type !== "choose-targets") ||
      candidate.targets === undefined ||
      candidate.division !== undefined
    ) {
      out.push(candidate);
      continue;
    }
    const members = candidate.targets
      .slice(divide.slot)
      .filter((t): t is TargetRef => t !== null && t !== undefined)
      .map((t) => lethalTo(state, registry, t));
    // The amount shared out is the X this candidate names, where the card
    // says so (rule 601.2d, X chosen first in 601.2b): read as the offer's
    // `total`, which is the X = 0 one, an X spell was never shared by what
    // kills, only evenly.
    let action = candidate;
    let x = candidate.type === "choose-targets" ? undefined : candidate.xValue;
    if (lifeX && candidate.type === "cast-spell" && x !== undefined && members.length > 0) {
      const kills = members.reduce((sum, member) => sum + member.lethal, 0);
      if (kills < x) {
        x = kills;
        action = { ...candidate, xValue: kills };
      }
      // The ladder's larger X's all come down to this one.
      const key = JSON.stringify([action.targets, x]);
      if (trimmed.has(key)) continue;
      trimmed.add(key);
    }
    const total = x === undefined ? divide.total : divide.totalByX !== undefined ? (divide.totalByX[x] ?? divide.total) : divide.x === true ? x : divide.total;
    if (members.length < 2 || members.length > total) {
      out.push(action);
      continue;
    }
    const split: Divide = { ...divide, total };
    const index = members.map((_, i) => i);
    // The cheapest kills first (the most of them), then the dearest first
    // (the biggest thing dead, whatever is left for the rest).
    const cheapest = shares(members, split, [...index].sort((a, b) => members[a].lethal - members[b].lethal));
    const dearest = shares(
      members,
      split,
      [...index].sort((a, b) => (Number.isFinite(members[b].lethal) ? members[b].lethal : -1) - (Number.isFinite(members[a].lethal) ? members[a].lethal : -1)),
    );
    out.push({ ...action, division: cheapest });
    if (dearest.some((n, i) => n !== cheapest[i])) out.push({ ...action, division: dearest });
  }
  return out;
}
