import { defineCard } from "../define.js";

const UPKEEP =
  "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
const LEAVES = "When this creature leaves the battlefield, you gain life equal to the number of age counters on it.";

export default defineCard({
  name: "Revered Unicorn",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 2,
  toughness: 3,
  text: `${UPKEEP}\n${LEAVES}`,
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
      text: UPKEEP,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      // The age counters it left with (last-known information, rule 608.2h).
      effect: { kind: "gain-life", amount: { countersOn: "source", counter: "age" } },
      resolve: null,
      text: LEAVES,
    },
  ],
});
