import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Return to Ravnica. EDHREC rank 20275.
//
// The opponent goes first and makes their own choice (an `as-player` of the
// target), then you do the same with your library. "Those creatures" are the
// one each player put onto the battlefield this way — the opponent's, under
// their control, and yours — and they fight only if both were put there.

/** Reveal the top three, may put a creature card from among them onto the
 * battlefield, the rest into the graveyard — done by whoever "you" is. */
const feud: EffectSpec = {
  kind: "look-and-choose",
  zone: "library",
  count: 3,
  reveal: true,
  min: 0,
  max: 1,
  filter: { type: "creature" },
  destination: "battlefield",
  leftover: "graveyard",
};

const TEXT =
  "At the beginning of your upkeep, target opponent reveals the top three cards of their library, may put a creature card from among them onto the battlefield, then puts the rest into their graveyard. You do the same with the top three cards of your library. If two creatures are put onto the battlefield this way, those creatures fight each other.";

export default defineCard({
  name: "Guild Feud",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "as-player", who: { target: 0 }, effect: feud },
          feud,
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield", atLeast: 2 },
            then: {
              kind: "fight",
              a: { thisWay: "put-onto-battlefield", who: "each-opponent" },
              b: { thisWay: "put-onto-battlefield", who: "you" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
