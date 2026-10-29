import { defineCard } from "../define.js";

// EDHREC rank 13250.
//
// Prevention of 1 per source (rule 615.10, Guardian Seraph's shape); two Orbs
// prevent 2 (the ruling).

export default defineCard({
  name: "Orbs of Warding",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "You have hexproof. (You can't be the target of spells or abilities your opponents control.)\nIf a creature would deal damage to you, prevent 1 of that damage.",
  static: [
    { affects: { scope: "self" }, playerHexproof: true, text: "You have hexproof." },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "you", source: { type: "creature" }, preventAmount: 1 },
      text: "If a creature would deal damage to you, prevent 1 of that damage.",
    },
  ],
});
