import { defineCard } from "../define.js";

// EDHREC rank 16686.
export default defineCard({
  name: "Fear of Being Hunted",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 4,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nThis creature must be blocked if able.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked-if-able"],
      text: "This creature must be blocked if able.",
    },
  ],
});
