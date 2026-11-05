import { defineCard } from "../define.js";

// EDHREC rank 9791.

export default defineCard({
  name: "Arcane Laboratory",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Each player can't cast more than one spell each turn.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", spells: true, castLimit: 1 },
      text: "Each player can't cast more than one spell each turn.",
    },
  ],
});
