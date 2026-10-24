import { defineCard } from "../define.js";

// EDHREC rank 28898.

export default defineCard({
  name: "Sandsteppe Scavenger",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog", "Scout"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, bolster 2. (Choose a creature with the least toughness among creatures you control and put two +1/+1 counters on it.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "bolster", amount: 2 },
      resolve: null,
      text: "When this creature enters, bolster 2.",
    },
  ],
});
