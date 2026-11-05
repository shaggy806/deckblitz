import { defineCard } from "../define.js";

// EDHREC rank 27536.

export default defineCard({
  name: "Lava-Field Overlord",
  manaCost: "{7}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  assist: true,
  text: "Assist (Another player can pay up to {7} of this spell's cost.)\nFlying\nWhen this creature enters, it deals 4 damage to target creature an opponent controls.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 4 damage to target creature an opponent controls.",
    },
  ],
});
