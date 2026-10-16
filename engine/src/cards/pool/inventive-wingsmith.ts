import { defineCard } from "../define.js";

// EDHREC rank 28846. Both halves of the intervening "if" (rule 603.4) are
// asked as the end step begins and again as it resolves (the ruling).
const END_TEXT =
  "At the beginning of your end step, if you haven't cast a spell from your hand this turn and this creature doesn't have a flying counter on it, put a flying counter on it.";

export default defineCard({
  name: "Inventive Wingsmith",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 2,
  toughness: 4,
  text: END_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "cast-this-turn", filter: { castFrom: "hand" }, atLeast: 0, atMost: 0 },
          { kind: "self-counters", counter: "flying", compare: { op: "eq", n: 0 } },
        ],
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "flying", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
