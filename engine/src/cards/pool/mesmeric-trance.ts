import { defineCard } from "../define.js";

// Ice Age. Cumulative upkeep {1} (rule 702.24, the `unless` option's `times`)
// and a looting ability.

const CU_TEXT =
  "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";

export default defineCard({
  name: "Mesmeric Trance",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${CU_TEXT}\n{U}, Discard a card: Draw a card.`,
  activated: [
    {
      cost: { mana: "{U}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{U}, Discard a card: Draw a card.",
    },
  ],
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
      text: CU_TEXT,
    },
  ],
});
