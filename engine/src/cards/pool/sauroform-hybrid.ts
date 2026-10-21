import { defineCard } from "../define.js";

// EDHREC rank 29555.

export default defineCard({
  name: "Sauroform Hybrid",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Lizard", "Warrior"],
  power: 2,
  toughness: 2,
  text: "{4}{G}{G}: Adapt 4. (If this creature has no +1/+1 counters on it, put four +1/+1 counters on it.)",
  activated: [
    {
      cost: { mana: "{4}{G}{G}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 4 },
      },
      resolve: null,
      text: "{4}{G}{G}: Adapt 4.",
    },
  ],
});
