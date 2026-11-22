import { defineCard } from "../define.js";

// EDHREC rank 20921.
// The second sentence ("You can divide that creature's combat damage as you
// choose among any of the creatures blocking it") is what rule 510.1c now
// lets whoever assigns the damage do anyway, so the one static carries both.

export default defineCard({
  name: "Defensive Formation",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Rather than the attacking player, you assign the combat damage of each creature attacking you. You can divide that creature's combat damage as you choose among any of the creatures blocking it.",
  static: [
    {
      affects: { scope: "self" },
      assignsAttackersCombatDamage: true,
      text: "Rather than the attacking player, you assign the combat damage of each creature attacking you. You can divide that creature's combat damage as you choose among any of the creatures blocking it.",
    },
  ],
});
