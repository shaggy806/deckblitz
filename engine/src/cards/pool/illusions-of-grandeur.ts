import { defineCard } from "../define.js";

// EDHREC rank 10392.

export default defineCard({
  name: "Illusions of Grandeur",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nWhen this enchantment enters, you gain 20 life.\nWhen this enchantment leaves the battlefield, you lose 20 life.",
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
                  pay: "{2}",
                  times: { countersOn: "source", counter: "age" },
                  text: "Pay {2} for each age counter",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: "Cumulative upkeep {2} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 20 },
      resolve: null,
      text: "When this enchantment enters, you gain 20 life.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 20 },
      resolve: null,
      text: "When this enchantment leaves the battlefield, you lose 20 life.",
    },
  ],
});
