import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 20367.
//
// Encase in Ice's enchant restriction, Control Magic's control, and the plain
// self cumulative upkeep (Arnjlot's Ascent's shape).

const CUMULATIVE_TEXT =
  "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";

export default defineCard({
  name: "Mind Harness",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant red or green creature\n${CUMULATIVE_TEXT}\nYou control enchanted creature.`,
  targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] } }],
  controlEnchanted: true,
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
  ],
});
