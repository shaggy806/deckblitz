import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 10549. Elvish Bard's shape.

export default defineCard({
  name: "Taunting Elf",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 0,
  toughness: 1,
  text: "All creatures able to block this creature do so.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked"],
      text: "All creatures able to block this creature do so.",
    },
  ],
});
