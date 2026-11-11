/**
 * Card flow: spells that only draw and filter their caster's own cards.
 * What a sacrifice for cards is checked against (`controller.ts`) and what a card
 * in hand is priced by (`bot/hand-worth.ts`). Pure over a definition.
 */

import type { CardRegistry } from "./cards/card-registry.js";
import type { EffectSpec } from "./effects.js";

/**
 * How many cards up `effect` leaves us, if it only draws and filters our own cards — draws, scries,
 * surveils, looks that keep or put back, a discard after a draw — and leaves
 * us at least a card up for the spell spent on it: cards drawn or put into
 * hand, less cards discarded or put back, one or more. Opt and Ponder (+1),
 * Brainstorm (3 - 2), Compulsive Research (3 - 2, at worst), Expressive
 * Iteration (one into hand) qualify; Faithless Looting (2 - 2) doesn't — a
 * card down outside a graveyard deck. A draw aimed at a player counts only
 * when the bot aims it at itself (`aimedOnlyAt` in `bot/eval-bot.ts`).
 */
export function cardFlowGain(effect: EffectSpec | null | undefined, registry: CardRegistry, given = 0): number | null {
  let gained = -given;
  const count = (a: unknown): number | null => (typeof a === "number" ? a : null);
  const walk = (e: EffectSpec | null | undefined): boolean => {
    if (e === null || e === undefined) return true;
    switch (e.kind) {
      case "draw": {
        if (e.who !== undefined) return false;
        const n = count(e.amount);
        if (n === null) return false;
        gained += n;
        return true;
      }
      case "discard": {
        // Ours: "you", or the slot a draw aimed at us.
        if (e.target !== "you" && typeof e.target !== "number") return false;
        const n = count(e.amount);
        if (n === null || e.random === true) return false;
        gained -= n;
        return true;
      }
      case "scry":
      case "surveil":
        return walk(e.then);
      case "look-and-choose": {
        if (e.then !== undefined) return false;
        const n = count(e.max);
        if (n === null) return false;
        if (e.zone === "library" && e.destination === "hand") gained += n;
        else if (e.zone === "hand" && e.destination === "library-top") gained -= n;
        else if (!(e.zone === "library" && e.destination === "library-top")) return false;
        // A second pick back into the library (Expressive Iteration's "one on
        // the bottom") moves no card into or out of a hand.
        if (e.secondPick !== undefined && e.secondPick.destination !== "library-bottom" && e.secondPick.destination !== "graveyard") {
          return false;
        }
        return e.leftover !== "hand";
      }
      // A tutor into hand (Demonic Tutor, Dina's Guidance, Dig Up's land) is
      // a card for a card too, and what it's for — the right card — leaves
      // nothing in the state to score either: v2 held Dina's Guidance with
      // nothing else to do (2026-11-09). One onto the library's top
      // (Vampiric, Worldly) puts nothing in hand and stays out.
      case "search-library": {
        if (e.destination !== "hand") return false;
        const n = count(e.max);
        if (n === null) return false;
        gained += n;
        return true;
      }
      // A Treasure, Clue or Food beside the cards (Deadly Dispute's): spent
      // by sacrificing itself, it adds a use, never a cost.
      case "create-token": {
        const token = typeof e.token === "string" && registry.has(e.token) ? registry.get(e.token) : null;
        return token !== null && (token.activated ?? []).some((a) => a.cost.sacrifice === "self");
      }
      case "sequence":
        return e.effects.every(walk);
      case "may":
        return walk(e.effect);
      case "shuffle-library":
        return true;
      // An extra land drop (Explore, Urban Evolution) leaves nothing in the
      // state either until a land is played off it, which the search's
      // rollouts never do — they pass our seat for the rest of the turn —
      // so v2 held Explore on turn two with two lands in hand (reported
      // from a live game, 2026-10-05). Cast, the bot plays the land.
      case "additional-land-drop":
        return true;
      default:
        return false;
    }
  };
  return walk(effect) && gained >= 1 ? gained : null;
}

/** Whether `effect` is card flow: see {@link cardFlowGain}. */
export function isCardFlow(effect: EffectSpec | null | undefined, registry: CardRegistry, given = 0): boolean {
  return cardFlowGain(effect, registry, given) !== null;
}
