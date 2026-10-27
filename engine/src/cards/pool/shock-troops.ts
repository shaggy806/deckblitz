import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 31275.

const TEXT = "Sacrifice this creature: It deals 2 damage to any target.";

export default defineCard({
  name: "Shock Troops",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
