import { defineCard } from "../define.js";

// EDHREC rank 15200. Ixalan. Frilled Deathspitter's enrage, for 3.

export default defineCard({
  name: "Sun-Crowned Hunters",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 4,
  text: "Enrage — Whenever this creature is dealt damage, it deals 3 damage to target opponent or planeswalker.",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: ["opponent-or-planeswalker"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "Enrage — Whenever this creature is dealt damage, it deals 3 damage to target opponent or planeswalker.",
    },
  ],
});
