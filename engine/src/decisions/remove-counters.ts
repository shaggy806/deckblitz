/**
 * Removing counters chosen by the player — "Remove a +1/+1 counter from a
 * creature you control" as a cost (Ghave, Guru of Spores), "remove three
 * counters from among creatures you control" (Tayam, Luminous Enigma),
 * "remove up to four charge counters from target artifact" (Gremlin Mine).
 * Which objects give them up, and which kinds, is the player's to choose
 * (rules 602.2b, 601.2h for a cost; 608.2c for an effect), all at once.
 *
 * The answer is a list of removals — an object, a kind, how many — adding up
 * to between `min` and `max`, never more of a kind than an object has. The
 * raise is `Game.beginRemoveCounters`; the answer is applied by
 * `Game.applyCounterRemovals`.
 */

import type { Action, LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";
import { defineDecision } from "./define.js";

type Offer = Extract<LegalAction, { kind: "remove-counters" }>;
type Removal = { readonly object: ObjectId; readonly kind: string; readonly count: number };
/** A `remove-counters` offer, as a controller is asked it. */
export type CounterRemovalOffer = Offer;
/** One entry of a `remove-counters` answer. */
export type CounterRemoval = Removal;

type Awaiting = Extract<NonNullable<GameState["awaiting"]>, { kind: "remove-counters" }>;

/** The offer `awaiting` makes: each eligible object's counters of the
 * allowed kinds, as `state` has them now. */
export function removalOffer(state: GameState, awaiting: Awaiting): Offer {
  const eligible = awaiting.eligible.flatMap((object) => {
    const here = state.objects[object];
    if (here === undefined) return [];
    // A token stack gives every token's, unless they all come from one
    // permanent; a suspended card only its time counters.
    const tokens = awaiting.single === true ? 1 : (here.stackCount ?? 1);
    const suspended = here.zone === "exile";
    const allowed = Object.fromEntries(
      Object.entries(here.counters)
        .filter(
          ([kind, n]) =>
            n > 0 && (suspended ? kind === "time" : true) && (awaiting.kinds === null || awaiting.kinds.includes(kind)),
        )
        .map(([kind, n]) => [kind, n * tokens]),
    );
    return Object.keys(allowed).length > 0 ? [{ object, counters: allowed }] : [];
  });
  return {
    kind: "remove-counters",
    prompt: awaiting.prompt,
    eligible,
    min: awaiting.min,
    max: awaiting.max,
    ...(awaiting.single === true ? { single: true as const } : {}),
    ...(awaiting.perObject !== undefined ? { perObject: awaiting.perObject } : {}),
  };
}

/** Why `removals` doesn't answer `offer`, or `null`. Shared with the client
 * and the bots' answers, which build one. */
export function whyRemovalsInvalid(offer: Offer, removals: readonly Removal[]): string | null {
  const byObject = new Map(offer.eligible.map((e) => [e.object, e.counters]));
  const taken = new Map<string, number>();
  const perObject = new Map<ObjectId, number>();
  let total = 0;
  for (const { object, kind, count } of removals) {
    if (!Number.isInteger(count) || count < 0) return `can't remove ${count} counters`;
    if (count === 0) continue;
    const has = byObject.get(object);
    if (has === undefined) return `${object} can't give up counters here`;
    const key = `${object}|${kind}`;
    const now = (taken.get(key) ?? 0) + count;
    if (now > (has[kind] ?? 0)) return `${object} doesn't have ${now} ${kind} counter(s)`;
    taken.set(key, now);
    perObject.set(object, (perObject.get(object) ?? 0) + count);
    total += count;
  }
  if (offer.perObject !== undefined && [...perObject.values()].some((n) => n > offer.perObject!)) {
    return `at most ${offer.perObject} from each`;
  }
  if (offer.single === true && perObject.size > 1) return "they must all come from one permanent";
  if (total < offer.min || total > offer.max) {
    return offer.min === offer.max
      ? `must remove exactly ${offer.max} counter(s), removed ${total}`
      : `must remove from ${offer.min} to ${offer.max} counters, removed ${total}`;
  }
  return null;
}

/** How willingly a counter of `kind` is given up: -1/-1 counters first (on
 * your own permanents they only hurt), loyalty, +1/+1 and shield counters
 * last. */
function keepScore(kind: string): number {
  if (kind === "-1/-1" || kind === "stun") return 0;
  if (kind === "+1/+1" || kind === "loyalty" || kind === "shield" || kind === "defense") return 2;
  return 1;
}

/**
 * The plain answer: as many as it may (`max`), the cheapest counters first —
 * see {@link keepScore} — from the object that has the most of a kind, and
 * for `single` all from the one object that can give them.
 */
export function defaultCounterRemovals(offer: Offer): Removal[] {
  const fill = (entries: Offer["eligible"]): Removal[] | null => {
    const pairs = entries
      .flatMap((e) => Object.entries(e.counters).map(([kind, n]) => ({ object: e.object, kind, n })))
      .sort((a, b) => keepScore(a.kind) - keepScore(b.kind) || b.n - a.n);
    const out: Removal[] = [];
    const share = new Map<ObjectId, number>();
    let left = offer.max;
    for (const { object, kind, n } of pairs) {
      if (left === 0) break;
      const room = offer.perObject === undefined ? n : Math.min(n, offer.perObject - (share.get(object) ?? 0));
      const count = Math.min(room, left);
      if (count <= 0) continue;
      out.push({ object, kind, count });
      share.set(object, (share.get(object) ?? 0) + count);
      left -= count;
    }
    return offer.max - left >= offer.min ? out : null;
  };
  if (offer.single !== true) return fill(offer.eligible) ?? [];
  for (const e of [...offer.eligible].sort((a, b) => sum(a.counters) - sum(b.counters))) {
    const one = fill([e]);
    if (one !== null && one.reduce((n, r) => n + r.count, 0) >= offer.min) return one;
  }
  return [];
}

const sum = (counters: Readonly<Record<string, number>>): number => Object.values(counters).reduce((a, b) => a + b, 0);

export const removeCounters = defineDecision({
  kind: "remove-counters",

  hasSource: true,

  legal: (ctx, awaiting): LegalAction[] => [removalOffer(ctx.state, awaiting)],

  whyCannot: (ctx, action, player): string | null => {
    const asked = `${player} is not being asked to remove counters`;
    if (action.type !== "remove-counters") return asked;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "remove-counters" || awaiting.player !== player) return asked;
    return whyRemovalsInvalid(removalOffer(ctx.state, awaiting), action.removals);
  },

  apply: (host, action): void => {
    if (action.type !== "remove-counters") return;
    host.applyCounterRemovals(action.player, action.removals);
  },

  ask: (controller, view, awaiting, player): Action => ({
    type: "remove-counters",
    player,
    removals: controller.chooseCounterRemovals(view, removalOffer(view.state, awaiting)),
  }),

  // The plain answer and, where there's a range, the fewest it may: whether
  // to give up more is worth a look (Gremlin Mine on your own artifact).
  candidates: (legal, player): Action[] => {
    if (legal.kind !== "remove-counters") return [];
    const most = defaultCounterRemovals(legal);
    const out: Action[] = [{ type: "remove-counters", player, removals: most }];
    if (legal.min < legal.max) {
      const fewest = defaultCounterRemovals({ ...legal, max: legal.min });
      out.push({ type: "remove-counters", player, removals: fewest });
    }
    return out;
  },

  // A random total in range, a counter at a time from random eligible kinds.
  randomAnswer: (legal, player, rng): Action => {
    if (legal.kind !== "remove-counters") return { type: "remove-counters", player, removals: [] };
    const target = legal.min + Math.floor(rng.random() * (legal.max - legal.min + 1));
    const pool = legal.single === true
      ? (() => {
          const fits = legal.eligible.filter((e) => Math.min(sum(e.counters), legal.perObject ?? Infinity) >= target);
          return fits.length === 0 ? [] : [fits[Math.floor(rng.random() * fits.length)]];
        })()
      : legal.eligible;
    const left = new Map(pool.flatMap((e) => Object.entries(e.counters).map(([k, n]) => [`${e.object}|${k}`, n] as const)));
    const share = new Map<ObjectId, number>();
    const removals: Removal[] = [];
    for (let i = 0; i < target; i += 1) {
      const open = [...left.entries()].filter(([key, n]) => {
        const object = key.split("|")[0] as ObjectId;
        return n > 0 && (legal.perObject === undefined || (share.get(object) ?? 0) < legal.perObject);
      });
      if (open.length === 0) break;
      const [key] = open[Math.floor(rng.random() * open.length)];
      const [object, kind] = [key.slice(0, key.indexOf("|")) as ObjectId, key.slice(key.indexOf("|") + 1)];
      left.set(key, (left.get(key) ?? 0) - 1);
      share.set(object, (share.get(object) ?? 0) + 1);
      const prior = removals.find((r) => r.object === object && r.kind === kind);
      if (prior !== undefined) removals.splice(removals.indexOf(prior), 1, { ...prior, count: prior.count + 1 });
      else removals.push({ object, kind, count: 1 });
    }
    // A pick that fell short of `min` (a `perObject` cap) is the plain one.
    const got = removals.reduce((n, r) => n + r.count, 0);
    return { type: "remove-counters", player, removals: got >= legal.min ? removals : defaultCounterRemovals(legal) };
  },
});
