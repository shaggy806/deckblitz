import { defineCard } from "../define.js";

// EDHREC rank 10438. Beastmaster Ascension's shape: a counter per life gain
// event, and an anthem gated on the counters.
const COUNTER_TEXT = "Whenever you gain life, put a growth counter on this enchantment.";
const ANTHEM_TEXT =
  "As long as there are five or more growth counters on this enchantment, creatures you control get +3/+3.";

export default defineCard({
  name: "Comforting Counsel",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${COUNTER_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "growth", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "self-counters", counter: "growth", compare: { op: "gte", n: 5 } },
      grantPt: [3, 3],
      text: ANTHEM_TEXT,
    },
  ],
});
