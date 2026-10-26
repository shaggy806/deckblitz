import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 19025. Every creature, not just yours (the
// ruling).

export default defineCard({
  name: "Absolute Grace",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "All creatures have protection from black.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      protection: { colors: ["B"] },
      text: "All creatures have protection from black.",
    },
  ],
});
