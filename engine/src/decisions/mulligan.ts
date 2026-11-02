/**
 * The opening-hand phase — the London mulligan, plus the bottoming that pays
 * for it.
 *
 * **One decision kind, two actions.** Every other kind is answered by exactly
 * one `Action` type; this one is answered by `mulligan` while a player is
 * still deciding and by `put-on-bottom` once they have kept, switching on
 * that player's own `hands[player].step`. Both halves live in one
 * `AwaitingDecision` because they are one phase, and a player can be in
 * different halves of it from their opponents. (A third action,
 * `mulligan-hand-ability`, answers nothing: rule 103.5b's "any time you could
 * mulligan" lets a card in the hand act at a time its holder would declare,
 * and then they declare as before. Serum Powder.)
 *
 * **And it is the one parallel decision.** Every other kind asks
 * `awaiting.player`; this one asks everybody still in `hands` at once, which
 * is why {@link mulligan.mayAct} exists at all — it is the sole override of
 * the registry's default.
 */

import type { Action, LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { defineDecision } from "./define.js";
import { exactCount, noDuplicates, subsetOf } from "./shared/picks.js";
import { mayTakeMulligan, mulliganCardsOwed } from "./shared/mulligan-math.js";
import type { DecisionReadCtx } from "./contract.js";

/** A card in hand with an "any time you could mulligan" ability (rule 103.5b). */
const hasMulliganAbility = (ctx: DecisionReadCtx, id: ObjectId): boolean => {
  const name = ctx.state.objects[id]?.cardName;
  return name !== undefined && ctx.registry.has(name) && ctx.registry.get(name).mulliganHandAbility !== null;
};

export const mulligan = defineDecision({
  kind: "mulligan",

  // Before the game proper; no card is behind it.
  hasSource: false,

  /** The parallel phase: anyone still holding an undecided hand may act, not
   * just the `awaiting.player` pointer. The only `mayAct` override in the
   * engine — and it used to be written out identically in three files. */
  mayAct: (awaiting, player) => awaiting.hands[player] !== undefined,

  legal: (ctx, awaiting, player): LegalAction[] => {
    const hand = awaiting.hands[player];
    const held = ctx.state.zones.perPlayer[player].hand;
    if (hand.step === "bottom") {
      return [
        {
          kind: "put-on-bottom",
          count: Math.min(mulliganCardsOwed(hand.taken, ctx.state.rules.freeFirstMulligan), held.length),
          from: [...held],
        },
      ];
    }
    return [
      {
        kind: "mulligan",
        count: hand.taken,
        ...(mayTakeMulligan(hand.taken, ctx.state.rules) ? {} : { mustKeep: true as const }),
        ...(hand.redraws === undefined ? {} : { redraws: hand.redraws }),
      },
      ...held
        .filter((id) => hasMulliganAbility(ctx, id))
        .map((card): LegalAction => ({ kind: "mulligan-hand-ability", card })),
    ];
  },

  whyCannot: (ctx, action, player): string | null => {
    const awaiting = ctx.state.awaiting;
    const step = awaiting?.kind === "mulligan" ? awaiting.hands[player]?.step : undefined;

    if (action.type === "mulligan") {
      if (awaiting === null || awaiting.kind !== "mulligan" || step !== "decide") {
        return `${player} is not being asked about a mulligan`;
      }
      // Rule 103.5: nobody mulligans past an opening hand of zero cards.
      if (!action.keep && !mayTakeMulligan(awaiting.hands[player].taken, ctx.state.rules)) {
        return `${player} can't take another mulligan: their hand would be no cards`;
      }
      return null;
    }

    if (action.type === "mulligan-hand-ability") {
      if (awaiting === null || awaiting.kind !== "mulligan" || step !== "decide") {
        return `${player} could not mulligan now`;
      }
      if (!ctx.state.zones.perPlayer[player].hand.includes(action.card)) {
        return `${action.card} is not in ${player}'s hand`;
      }
      return hasMulliganAbility(ctx, action.card) ? null : `${action.card} has no such ability`;
    }

    if (action.type === "put-on-bottom") {
      if (awaiting === null || awaiting.kind !== "mulligan" || step !== "bottom") {
        return `${player} is not being asked to put cards on the bottom of their library`;
      }
      const cards = action.cards;
      // A hand a short library left smaller than what's owed gives what it has.
      const owed = Math.min(
        mulliganCardsOwed(awaiting.hands[player].taken, ctx.state.rules.freeFirstMulligan),
        ctx.state.zones.perPlayer[player].hand.length,
      );
      return (
        exactCount(
          cards,
          owed,
          (got, want) =>
            `${player} must put exactly ${want} card(s) on the bottom, chose ${got}`,
        ) ??
        noDuplicates(cards, `${player} chose the same card twice`) ??
        subsetOf(
          cards,
          ctx.state.zones.perPlayer[player].hand,
          (id) => `${player} tried to put ${id} on the bottom, not in hand`,
        )
      );
    }

    return `${player} is not being asked about a mulligan`;
  },

  apply: (host, action): void => {
    if (action.type === "mulligan") host.applyMulligan(action.player, action.keep);
    else if (action.type === "put-on-bottom") {
      host.applyPutOnBottom(action.player, action.cards);
    } else if (action.type === "mulligan-hand-ability") {
      host.applyMulliganHandAbility(action.player, action.card);
    }
  },

  ask: (controller, view, awaiting, player): Action => {
    const hand = awaiting.hands[player];
    if (hand.step === "bottom") {
      const held = view.state.zones.perPlayer[player].hand.map((id) => view.state.objects[id]);
      return {
        type: "put-on-bottom",
        player,
        cards: controller.chooseBottomOfLibrary(
          held,
          Math.min(mulliganCardsOwed(hand.taken, view.state.rules.freeFirstMulligan), held.length),
        ),
      };
    }
    const dissatisfied = controller.mulligan(view, hand.taken);
    if (dissatisfied) {
      // A hand it wouldn't keep: a card that replaces it for nothing comes
      // before a mulligan, which costs a card or a free one. Not a policy of
      // its own: the same scoring decides, whichever way it's thrown back.
      const ability = view.legalActions().find((a) => a.kind === "mulligan-hand-ability");
      if (ability?.kind === "mulligan-hand-ability") {
        return { type: "mulligan-hand-ability", player, card: ability.card };
      }
    }
    return {
      type: "mulligan",
      player,
      keep: !dissatisfied || !mayTakeMulligan(hand.taken, view.state.rules),
    };
  },

  // candidates: deliberately absent — the searching bots do not roll out
  // mulligan decisions. A rollout to the end of a turn means nothing before
  // the game has started, so the opening hand is scored by `bot/mulligan.ts`
  // instead, which all three bots share through v1.

  // The one kind answering several offers, so this switches where the others
  // destructure. `put-on-bottom` drains a pool the way `discard` does;
  // `mulligan` is capped at four so a fuzz game can't mulligan forever.
  randomAnswer: (legal, player, rng): Action => {
    if (legal.kind === "mulligan-hand-ability") {
      return { type: "mulligan-hand-ability", player, card: legal.card };
    }
    if (legal.kind === "put-on-bottom") {
      const pool = [...legal.from];
      const cards: ObjectId[] = [];
      for (let i = 0; i < legal.count && pool.length > 0; i += 1) {
        cards.push(pool.splice(rng.pickIndex(pool.length), 1)[0]);
      }
      return { type: "put-on-bottom", player, cards };
    }
    const takeMulligan = legal.count < 4 && legal.mustKeep !== true && rng.random() < 0.2;
    return { type: "mulligan", player, keep: !takeMulligan };
  },
});
