import { defineCard } from "../define.js";

// Cumulative upkeep (rule 702.24a) whose cost is "Add {R}": one option, the whole
// payment, {R} for each age counter (the ruling: "add {R}" is a cost; the mana
// empties at the end of the step like any other).
const TEXT =
  "Cumulative upkeep—Add {R}. (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";

export default defineCard({
  name: "Braid of Fire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
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
                  doing: { kind: "add-mana", mana: "R", amount: { countersOn: "source", counter: "age" } },
                  text: "Add {R} for each age counter on it",
                },
              ],
              otherwise: { kind: "sacrifice-source" },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
