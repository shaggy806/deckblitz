import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 25005. Feroz's Ban's tax on creature
// spells that are red or green — a red-green one pays {1} once.

const TEXT = "Red creature spells and green creature spells cost {1} more to cast.";

export default defineCard({
  name: "High Seas",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { type: "creature", anyOf: [{ colors: ["R"] }, { colors: ["G"] }] },
        increaseGeneric: 1,
      },
      text: TEXT,
    },
  ],
});
