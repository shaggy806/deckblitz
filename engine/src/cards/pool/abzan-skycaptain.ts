import { defineCard } from "../define.js";

// EDHREC rank 24144. Fate Reforged.

export default defineCard({
  name: "Abzan Skycaptain",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, bolster 2. (Choose a creature with the least toughness among creatures you control and put two +1/+1 counters on it.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "bolster", amount: 2 },
      resolve: null,
      text: "When this creature dies, bolster 2.",
    },
  ],
});
