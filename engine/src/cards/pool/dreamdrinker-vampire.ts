import { defineCard } from "../define.js";

// EDHREC rank 18379.
//
// Menace gained once it's blocked doesn't unblock it (the ruling): blocks
// are checked only as they're declared.
const ADAPT_TEXT = "{1}{B}: Adapt 1. (If this creature has no +1/+1 counters on it, put a +1/+1 counter on it.)";
const MENACE_TEXT = "Whenever one or more +1/+1 counters are put on this creature, it gains menace until end of turn.";

export default defineCard({
  name: "Dreamdrinker Vampire",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${ADAPT_TEXT}\n${MENACE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: ADAPT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1" },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
      resolve: null,
      text: MENACE_TEXT,
    },
  ],
});
