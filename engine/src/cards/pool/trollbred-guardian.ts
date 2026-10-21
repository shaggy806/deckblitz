import { defineCard } from "../define.js";

// Ravnica Allegiance.
const ADAPT_TEXT = "{2}{G}: Adapt 2. (If this creature has no +1/+1 counters on it, put two +1/+1 counters on it.)";
const TRAMPLE_TEXT = "Each creature you control with a +1/+1 counter on it has trample.";

export default defineCard({
  name: "Trollbred Guardian",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Frog", "Warrior"],
  power: 5,
  toughness: 5,
  text: `${ADAPT_TEXT}\n${TRAMPLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
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
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
});
