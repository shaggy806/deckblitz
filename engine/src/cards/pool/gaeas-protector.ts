import { defineCard } from "../define.js";

// EDHREC rank 27784.

export default defineCard({
  name: "Gaea's Protector",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 4,
  toughness: 2,
  text: "This creature must be blocked if able.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked-if-able"],
      text: "This creature must be blocked if able.",
    },
  ],
});
