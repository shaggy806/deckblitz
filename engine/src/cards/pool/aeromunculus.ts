import { defineCard } from "../define.js";

// EDHREC rank 26809.

export default defineCard({
  name: "Aeromunculus",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Homunculus", "Mutant"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{2}{G}{U}: Adapt 1. (If this creature has no +1/+1 counters on it, put a +1/+1 counter on it.)",
  activated: [
    {
      cost: { mana: "{2}{G}{U}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "{2}{G}{U}: Adapt 1.",
    },
  ],
});
