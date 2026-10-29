import { defineCard } from "../define.js";

// Rulings: damage dealt to several things is divided first, and only the
// damage to you loses 1 — a prevention effect, per source (rule 615.10).

export default defineCard({
  name: "Urza's Armor",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: "If a source would deal damage to you, prevent 1 of that damage.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", preventAmount: 1 },
      text: "If a source would deal damage to you, prevent 1 of that damage.",
    },
  ],
});
