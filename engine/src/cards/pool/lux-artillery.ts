import { defineCard } from "../define.js";

// Top-5000 #3689. Each instance of sunburst works separately (the ruling): the
// spell gains its own from each trigger.
const SUNBURST_TEXT =
  "Whenever you cast an artifact creature spell, it gains sunburst. (It enters with a +1/+1 counter on it for each color of mana spent to cast it.)";
const END_TEXT =
  "At the beginning of your end step, if there are thirty or more counters among artifacts and creatures you control, this artifact deals 10 damage to each opponent.";

export default defineCard({
  name: "Lux Artillery",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${SUNBURST_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { types: ["artifact", "creature"] } },
      targets: [],
      effect: { kind: "enters-with-counters", target: "trigger-object", counter: "sunburst", amount: 0 },
      resolve: null,
      text: SUNBURST_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "aggregate",
        value: {
          aggregate: "sum",
          of: "counters",
          filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" },
        },
        compare: { op: "gte", n: 30 },
        countsSelf: true,
      },
      targets: [],
      effect: { kind: "damage", amount: 10, who: "each-opponent" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
