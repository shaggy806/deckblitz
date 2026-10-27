import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 26373.

const TEXT = "Sorcery spells cost {3} more to cast.";

export default defineCard({
  name: "Squeeze",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "sorcery" }, increaseGeneric: 3 },
      text: TEXT,
    },
  ],
});
