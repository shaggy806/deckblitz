import { defineCard } from "../define.js";

// EDHREC rank 10750. Adapt asks as it resolves (rule 701.46); modified is
// rule 700.9 — any counter, any Equipment, an Aura its controller controls.
const ADAPT_TEXT = "{2}{G}: Adapt 2. (If this creature has no +1/+1 counters on it, put two +1/+1 counters on it.)";
const TRAMPLE_TEXT =
  "Modified creatures you control have trample. (Equipment, Auras you control, and counters are modifications.)";

export default defineCard({
  name: "Temperamental Oozewagg",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze", "Brushwagg"],
  power: 4,
  toughness: 4,
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
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", modified: true } },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
});
