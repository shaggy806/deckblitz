import { defineCard } from "../define.js";

// EDHREC rank 11499.

export default defineCard({
  name: "Needletooth Raptor",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 2,
  text: "Enrage — Whenever this creature is dealt damage, it deals 5 damage to target creature an opponent controls.",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: "Enrage — Whenever this creature is dealt damage, it deals 5 damage to target creature an opponent controls.",
    },
  ],
});
