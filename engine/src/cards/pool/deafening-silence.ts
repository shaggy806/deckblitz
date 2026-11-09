import { defineCard } from "../define.js";

const TEXT = "Each player can't cast more than one noncreature spell each turn.";

export default defineCard({
  name: "Deafening Silence",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "each-player", filter: { notTypes: ["creature"] }, limit: 1 }],
      text: TEXT,
    },
  ],
});
