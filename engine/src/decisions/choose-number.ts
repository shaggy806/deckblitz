/**
 * Choosing a number as a spell or ability resolves — a `choose-value` effect
 * of `value: "number"`: Void's "choose a number. Destroy all artifacts and
 * creatures with mana value equal to that number", Squee's Revenge,
 * Mindblaze's "a number greater than 0". Any whole number from `min`, up to
 * `max` when the card bounds it.
 *
 * Raised by `Game`'s `chooseValue`; the answer resumes the resolution with
 * the effect's `then`, which reads it as `"x"`.
 */

import type { Action, LegalAction } from "../actions.js";
import { defineDecision } from "./define.js";

type Offer = Extract<LegalAction, { kind: "choose-number" }>;

/** How far past `min` an unbounded choice's search and random answer reach:
 * mana values and coin-flip counts that matter are all below it. */
export const NUMBER_CHOICE_SPAN = 11;

/** The numbers worth trying, lowest first: `min` up to `max`, or up to
 * {@link NUMBER_CHOICE_SPAN} of them when nothing bounds the choice. */
export function numberChoices(offer: Offer, limit: number): number[] {
  const top = Math.min(offer.max ?? offer.min + NUMBER_CHOICE_SPAN - 1, offer.min + limit - 1);
  const out: number[] = [];
  for (let n = offer.min; n <= top; n++) out.push(n);
  return out;
}

export const chooseNumber = defineDecision({
  kind: "choose-number",

  hasSource: true,

  legal: (_ctx, awaiting): LegalAction[] => [
    {
      kind: "choose-number",
      source: awaiting.source,
      min: awaiting.min,
      ...(awaiting.max !== undefined ? { max: awaiting.max } : {}),
      ...(awaiting.prompt !== undefined ? { prompt: awaiting.prompt } : {}),
    },
  ],

  whyCannot: (ctx, action, player): string | null => {
    const asked = `${player} is not being asked to choose a number`;
    if (action.type !== "choose-number") return asked;
    const awaiting = ctx.state.awaiting;
    if (awaiting === null || awaiting.kind !== "choose-number" || awaiting.player !== player) return asked;
    if (!Number.isSafeInteger(action.number)) return `${action.number} is not a whole number`;
    if (action.number < awaiting.min) return `${action.number} is less than ${awaiting.min}`;
    if (awaiting.max !== undefined && action.number > awaiting.max) {
      return `${action.number} is more than ${awaiting.max}`;
    }
    return null;
  },

  apply: (host, action): void => {
    if (action.type !== "choose-number") return;
    host.applyNumberChoice(action.player, action.number);
  },

  ask: (controller, view, _awaiting, player): Action => {
    const offer = view.legalActions().find((a): a is Offer => a.kind === "choose-number");
    if (offer === undefined) throw new Error(`${player} has no choose-number offer`);
    return { type: "choose-number", player, number: controller.chooseNumber(view, offer) };
  },

  /** Each number from `min` on: the search sees what the resolution does
   * with it (which mana value Void sweeps). */
  candidates: (legal, player, limit): Action[] => {
    if (legal.kind !== "choose-number") return [];
    return numberChoices(legal, limit).map((number) => ({ type: "choose-number", player, number }));
  },

  randomAnswer: (legal, player, rng): Action => {
    const choices = numberChoices(legal, NUMBER_CHOICE_SPAN);
    return { type: "choose-number", player, number: choices[rng.pickIndex(choices.length)] };
  },
});
