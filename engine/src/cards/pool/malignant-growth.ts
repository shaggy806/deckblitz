import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 28624.
//
// Rulings:
//   [2004-10-04] In multiplayer games it affects all opponents.
//   [2013-04-15] The triggered ability is put onto the stack after you have already drawn your
//   card for the turn.
// The damage is the number of cards actually drawn — fewer from a short library.

const CUMULATIVE_TEXT =
  "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const GROWTH_TEXT = "At the beginning of your upkeep, put a growth counter on this enchantment.";
const DRAW_TEXT =
  "At the beginning of each opponent's draw step, that player draws an additional card for each growth counter on this enchantment, then this enchantment deals damage to the player equal to the number of cards they drew this way.";

export default defineCard({
  name: "Malignant Growth",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  text: `${CUMULATIVE_TEXT}\n${GROWTH_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "age", amount: 1 },
            {
              kind: "unless",
              chooser: "you",
              options: [
                {
                  pay: "{1}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {1} for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: CUMULATIVE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "growth", amount: 1 },
      resolve: null,
      text: GROWTH_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "draw", who: "opponent" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { countersOn: "source", counter: "growth" }, who: "active-player" },
          { kind: "damage", amount: { thisWay: "drawn", who: "each-player" }, who: "active-player" },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
