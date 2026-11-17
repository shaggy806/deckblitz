/**
 * Discarding from hand — the cleanup step's hand-size trim, a Mind Rot, a
 * cost that says "discard a card".
 *
 * **This kind used to have no arm at all.** It was the implicit fallthrough
 * that both `legalActions`' awaiting block and `answerAwaited` landed on
 * after every other kind had been checked, reading `awaiting.count` off
 * whatever was left. That accident was the engine's only compile-time
 * guarantee that a new `AwaitingDecision` variant had been handled — it broke
 * the build, several hundred lines from the variant, with an error about a
 * missing `count`. `DECISION_ACTIONS` is the chosen canary now, and this is
 * an ordinary module like the rest.
 *
 * `awaiting.fromEffect` is the one field that isn't about the choice: it
 * distinguishes the cleanup-step trim (the turn's own bookkeeping, no card
 * behind it) from a discard an effect caused, which is why this kind's
 * `hasSource` is conditional where every other kind's is a constant.
 */

import type { Action, LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import { defineDecision } from "./define.js";
import { exactCount, noDuplicates, subsetOf } from "./shared/picks.js";
import { combinations } from "./shared/subsets.js";

export const discard = defineDecision({
  kind: "discard",

  // The one kind where this genuinely varies: the cleanup-step hand-size
  // trim is the turn's own bookkeeping with no card behind it, while a
  // discard an effect caused has one.
  hasSource: (awaiting) => awaiting.fromEffect === true,

  legal: (ctx, awaiting, player): LegalAction[] => {
    // The whole hand, unless a cost names a kind of card ("Discard a
    // creature card") — then only those.
    const from = [...(awaiting.eligible ?? ctx.state.zones.perPlayer[player].hand)];
    return [
      {
        kind: "discard",
        count: awaiting.count,
        from,
        ...(awaiting.orOneOf !== undefined ? { orOneOf: [...awaiting.orOneOf] } : {}),
        ...(awaiting.orOneKind !== undefined ? { orOneKind: awaiting.orOneKind } : {}),
        ...(awaiting.upTo === true ? { upTo: true as const } : {}),
        ...(awaiting.differentNames === true
          ? { differentNames: from.map((id) => nameOf(ctx.state.objects[id])) }
          : {}),
      },
    ];
  },

  whyCannot: (ctx, action, player): string | null => {
    if (action.type !== "discard") return `${player} is not being asked to discard`;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "discard" || awaiting.player !== player) {
      return `${player} is not being asked to discard`;
    }
    const cards = action.cards;
    // "Unless they discard a land card": that one card is a whole answer.
    if (cards.length === 1 && awaiting.orOneOf?.includes(cards[0]) === true) return null;
    // Count before duplicates here, unlike `sacrifice`, which checks the
    // other way round. Preserved rather than harmonised: both orders are
    // reachable and the messages are asserted.
    return (
      // "Discard any number of cards": none to `count`.
      (awaiting.upTo === true
        ? cards.length > awaiting.count
          ? `${player} can discard at most ${awaiting.count} card(s), chose ${cards.length}`
          : null
        : exactCount(
            cards,
            awaiting.count,
            (got, want) => `${player} must discard exactly ${want} card(s), chose ${got}`,
          )) ??
      noDuplicates(cards, `${player} chose the same card twice to discard`) ??
      subsetOf(
        cards,
        ctx.state.zones.perPlayer[player].hand,
        (id) => `${player} tried to discard ${id}, not in hand`,
      ) ??
      (awaiting.eligible === undefined
        ? null
        : subsetOf(cards, awaiting.eligible, (id) => `${id} can't be discarded to pay this cost`)) ??
      // "With different names".
      (awaiting.differentNames === true &&
      new Set(cards.map((id) => nameOf(ctx.state.objects[id]))).size < cards.length
        ? `${player} must discard cards with different names`
        : null)
    );
  },

  apply: (host, action): void => {
    if (action.type !== "discard") return;
    host.applyDiscard(action.player, action.cards);
  },

  ask: (controller, view, awaiting, player): Action => {
    let hand = (awaiting.eligible ?? view.state.zones.perPlayer[player].hand).map((id) => view.state.objects[id]);
    // "With different names": the controller chooses among one card of
    // each name.
    if (awaiting.differentNames === true) {
      const seen = new Set<string>();
      hand = hand.filter((object) => {
        const name = nameOf(object);
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
    }
    return { type: "discard", player, cards: controller.chooseDiscards(hand, awaiting.count, view) };
  },

  /** Combinations of exactly `count`, cheapest first — `order` reversed, for
   * the same reason as `sacrifice`: what you throw away should be your worst
   * card, and a capped list should keep the cheap ones. */
  candidates: (legal, player, limit, helpers): Action[] => {
    if (legal.kind !== "discard") return [];
    let worstFirst = [...helpers.order(legal.from)].reverse();
    // "With different names": the worst card of each name.
    const names = legal.differentNames;
    if (names !== undefined) {
      const seen = new Set<string>();
      worstFirst = worstFirst.filter((id) => {
        const name = names[legal.from.indexOf(id)];
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
    }
    // "Any number": every size, smallest first, the cap shared out in order.
    const sizes = legal.upTo === true ? Array.from({ length: legal.count + 1 }, (_, n) => n) : [legal.count];
    const out: Action[] = [];
    // "…unless they discard a land card": one such card alone is an answer,
    // the cheapest there is — offered first, in at most half the cap.
    const singles = Math.min(limit, Math.max(1, Math.floor(limit / 2)));
    for (const id of worstFirst) {
      if (out.length >= singles) break;
      if (legal.orOneOf?.includes(id) === true) out.push({ type: "discard", player, cards: [id] });
    }
    for (const size of sizes) {
      if (out.length >= limit) break;
      for (const cards of combinations(worstFirst, size, limit - out.length)) out.push({ type: "discard", player, cards });
    }
    return out;
  },

  randomAnswer: (legal, player, rng): Action => {
    // "…unless they discard a land card": half the time, one of those alone.
    const orOneOf = legal.orOneOf ?? [];
    if (orOneOf.length > 0 && rng.pickIndex(2) === 0) {
      return { type: "discard", player, cards: [orOneOf[rng.pickIndex(orOneOf.length)]] };
    }
    let pool = [...legal.from];
    const cards: ObjectId[] = [];
    // "Any number": how many is drawn too.
    const count = legal.upTo === true ? rng.pickIndex(legal.count + 1) : legal.count;
    const names = legal.differentNames;
    for (let i = 0; i < count && pool.length > 0; i += 1) {
      const card = pool.splice(rng.pickIndex(pool.length), 1)[0];
      cards.push(card);
      // "With different names": none of its name left to draw.
      if (names !== undefined) {
        const name = names[legal.from.indexOf(card)];
        pool = pool.filter((id) => names[legal.from.indexOf(id)] !== name);
      }
    }
    return { type: "discard", player, cards };
  },
});
