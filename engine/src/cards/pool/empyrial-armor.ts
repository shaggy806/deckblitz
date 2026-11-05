import { defineCard } from "../define.js";

// EDHREC rank 13826.

export default defineCard({
  name: "Empyrial Armor",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +1/+1 for each card in your hand.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { cardsInHand: true, pt: [1, 1] },
      text: "Enchanted creature gets +1/+1 for each card in your hand.",
    },
  ],
});
