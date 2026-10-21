import { defineCard } from "../define.js";

// EDHREC rank 7595.

export default defineCard({
  name: "Fanatical Firebrand",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Pirate"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste (This creature can attack and {T} as soon as it comes under your control.)\n{T}, Sacrifice this creature: It deals 1 damage to any target.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}, Sacrifice this creature: It deals 1 damage to any target.",
    },
  ],
});
