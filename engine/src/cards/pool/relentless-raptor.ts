import { defineCard } from "../define.js";

// EDHREC rank 24211.

export default defineCard({
  name: "Relentless Raptor",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nThis creature attacks or blocks each combat if able.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack", "must-block"],
      text: "This creature attacks or blocks each combat if able.",
    },
  ],
});
