import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 14917. Every Wall on the battlefield,
// whoever controls it.

export default defineCard({
  name: "Rolling Stones",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Wall creatures can attack as though they didn't have defender.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Wall" } },
      canAttackAsThoughNoDefender: true,
      text: "Wall creatures can attack as though they didn't have defender.",
    },
  ],
});
