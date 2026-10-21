import { defineCard } from "../define.js";

const ADAPT_TEXT = "{5}{U}: Adapt 2. (If this creature has no +1/+1 counters on it, put two +1/+1 counters on it.)";
const FLYING_TEXT = "Each creature you control with a +1/+1 counter on it has flying.";

export default defineCard({
  name: "Skatewing Spy",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Rogue", "Mutant"],
  power: 2,
  toughness: 3,
  text: `${ADAPT_TEXT}\n${FLYING_TEXT}`,
  activated: [
    {
      cost: { mana: "{5}{U}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: ADAPT_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["flying"],
      text: FLYING_TEXT,
    },
  ],
});
