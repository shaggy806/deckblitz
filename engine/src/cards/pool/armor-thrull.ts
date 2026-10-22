import { defineCard } from "../define.js";

// EDHREC rank 27149.

export default defineCard({
  name: "Armor Thrull",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 1,
  toughness: 3,
  text: "{T}, Sacrifice this creature: Put a +1/+2 counter on target creature.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+2", amount: 1 },
      resolve: null,
      text: "{T}, Sacrifice this creature: Put a +1/+2 counter on target creature.",
    },
  ],
});
