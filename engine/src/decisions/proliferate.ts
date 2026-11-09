/**
 * Proliferate (rule 701.27) — choose any number of players and permanents
 * that already have a counter, and give each one more of each kind it has.
 *
 * It is a *choice*, not something done to you: the proliferating player picks
 * the set, and picking nothing is a legal answer. That is why the validator
 * has no length check, and why the bot's candidate list includes the empty
 * set explicitly.
 */

import type { Action, LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";
import type { TargetRef } from "../target.js";
import { defineDecision } from "./define.js";

/** A `TargetRef` as a comparable string — proliferate is the one decision
 * whose picks are players *or* objects, so neither id alone is a key. */
const refKey = (t: TargetRef): string =>
  t.kind === "player" ? `p:${t.player}` : `o:${t.object}`;

/** The size of each compacted token stack among `eligible`. A stack is many
 * permanents, so it can be chosen in part (701.34a): named once per token. */
function stackSizes(
  ctx: { readonly state: GameState },
  eligible: readonly TargetRef[],
): Readonly<Record<ObjectId, number>> {
  const copies: Record<ObjectId, number> = {};
  for (const target of eligible) {
    if (target.kind !== "object") continue;
    const n = ctx.state.objects[target.object]?.stackCount ?? 1;
    if (n > 1) copies[target.object] = n;
  }
  return copies;
}

/** `eligible` with a stack repeated once per token. */
function expand(eligible: readonly TargetRef[], copies: Readonly<Record<ObjectId, number>>): TargetRef[] {
  return eligible.flatMap((t) =>
    Array<TargetRef>(t.kind === "object" ? (copies[t.object] ?? 1) : 1).fill(t),
  );
}

export const proliferate = defineDecision({
  kind: "proliferate",

  hasSource: true,

  legal: (ctx, awaiting): LegalAction[] => {
    const copies = stackSizes(ctx, awaiting.eligible);
    return [
      {
        kind: "proliferate",
        eligible: [...awaiting.eligible],
        ...(Object.keys(copies).length > 0 ? { copies } : {}),
      },
    ];
  },

  whyCannot: (ctx, action, player): string | null => {
    if (action.type !== "proliferate") return `${player} is not being asked to proliferate`;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "proliferate" || awaiting.player !== player) {
      return `${player} is not being asked to proliferate`;
    }
    const eligible = new Set(awaiting.eligible.map(refKey));
    const copies = stackSizes(ctx, awaiting.eligible);
    const seen = new Map<string, number>();
    for (const target of action.chosen) {
      const k = refKey(target);
      if (!eligible.has(k)) return `${k} has no counters to proliferate`;
      const named = (seen.get(k) ?? 0) + 1;
      const limit = target.kind === "object" ? (copies[target.object] ?? 1) : 1;
      if (named > limit) return limit > 1 ? `${k} is only ${limit} tokens` : `${player} chose ${k} twice`;
      seen.set(k, named);
    }
    // No length check on purpose: zero is a legal answer (rule 701.27a).
    return null;
  },

  apply: (host, action): void => {
    if (action.type !== "proliferate") return;
    host.applyProliferate(action.player, action.chosen);
  },

  ask: (controller, view, awaiting, player): Action => ({
    type: "proliferate",
    player,
    // A controller picks from one entry per token, so "everything of mine"
    // reaches a whole stack.
    chosen: controller.chooseProliferate(view, expand(awaiting.eligible, stackSizes(view, awaiting.eligible))),
  }),

  /**
   * Three answers, not the 2^n subsets: proliferate is worth searching
   * precisely because *whose* permanent gets the counter matters, and the
   * interesting cut is "mine" vs "everything" vs "nothing". Anything finer is
   * a rollout spent distinguishing two of your own creatures.
   *
   * The three are de-duplicated, because on a board where every eligible
   * permanent is yours "mine" and "everything" are the same answer and
   * scoring it twice is wasted search.
   */
  candidates: (legal, player, _limit, helpers): Action[] => {
    if (legal.kind !== "proliferate") return [];
    const units = expand(legal.eligible, legal.copies ?? {});
    const mine = units.filter((t) =>
      t.kind === "player" ? t.player === player : helpers.controllerOf(t.object) === player,
    );
    // What the default answer picks: your permanents, poison on an opponent
    // who has some, and yourself only while unpoisoned. Without it the search
    // never singled out an opponent's poison.
    const poisonOf = helpers.poisonOf;
    const owned =
      poisonOf === undefined
        ? mine
        : units.filter((t) =>
            t.kind === "player"
              ? t.player === player
                ? poisonOf(t.player) === 0
                : poisonOf(t.player) > 0
              : helpers.controllerOf(t.object) === player,
          );
    const seen = new Set<string>();
    return [owned, mine, units, []]
      .filter((chosen) => {
        const key = chosen.map((t) => (t.kind === "player" ? t.player : t.object)).join(",");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((chosen) => ({ type: "proliferate", player, chosen }));
  },

  // A random subset, empty included — "any number" has no count to hit, so
  // this is the one decision where the fuzzer should regularly answer with
  // nothing at all.
  randomAnswer: (legal, player, rng): Action => ({
    type: "proliferate",
    player,
    chosen: expand(legal.eligible, legal.copies ?? {}).filter(() => rng.random() < 0.5),
  }),
});
