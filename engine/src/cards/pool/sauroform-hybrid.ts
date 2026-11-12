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
      effect: { kind: "adapt", amount: 4 },
      resolve: null,
      text: "{4}{G}{G}: Adapt 4.",
    },
  ],
});
