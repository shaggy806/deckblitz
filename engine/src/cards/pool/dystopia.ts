import { defineCard } from "../define.js";

// EDHREC rank 25284.
//
// Rulings:
//   [2004-10-04] The permanent is chosen and sacrificed during resolution.

export default defineCard({
  name: "Dystopia",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Cumulative upkeep—Pay 1 life. (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nAt the beginning of each player's upkeep, that player sacrifices a green or white permanent of their choice.",
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
                  payLife: 1,
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay 1 life for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: "Cumulative upkeep—Pay 1 life (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "active-player",
        filter: { anyOf: [{ colors: ["G"] }, { colors: ["W"] }] },
        count: 1,
      },
      resolve: null,
      text: "At the beginning of each player's upkeep, that player sacrifices a green or white permanent of their choice.",
    },
  ],
});
