import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 13254.

const TEXT = "Creatures without flying can't attack.";

export default defineCard({
  name: "Moat",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "all-creatures", withoutKeyword: "flying" },
      restrictions: ["cant-attack"],
      text: TEXT,
    },
  ],
});
