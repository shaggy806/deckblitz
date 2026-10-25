import { defineCard } from "../define.js";

// EDHREC rank 28372.

export default defineCard({
  name: "Aven Tactician",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, bolster 1. (Choose a creature with the least toughness among creatures you control and put a +1/+1 counter on it.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "bolster", amount: 1 },
      resolve: null,
      text: "When this creature enters, bolster 1.",
    },
  ],
});
