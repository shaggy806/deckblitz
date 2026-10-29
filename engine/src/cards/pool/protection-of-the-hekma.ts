import { defineCard } from "../define.js";

// EDHREC rank 26036.
//
// 1 from each source (the ruling; rule 615.10); damage to your creatures is
// unaffected (the ruling).

export default defineCard({
  name: "Protection of the Hekma",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "If a source an opponent controls would deal damage to you, prevent 1 of that damage.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", source: { controlledBy: "opponent" }, preventAmount: 1 },
      text: "If a source an opponent controls would deal damage to you, prevent 1 of that damage.",
    },
  ],
});
