import { defineCard } from "../define.js";

// EDHREC rank 30083.

export default defineCard({
  name: "Magmatic Core",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nAt the beginning of your end step, this enchantment deals X damage divided as you choose among any number of target creatures, where X is the number of age counters on it.",
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
      text: "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "any-number", of: "creature" }],
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: "At the beginning of your end step, this enchantment deals X damage divided as you choose among any number of target creatures, where X is the number of age counters on it.",
      divided: { total: { countersOn: "source", counter: "age" }, slot: 0 },
    },
  ],
});
