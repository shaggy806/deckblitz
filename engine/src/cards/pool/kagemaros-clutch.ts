import { defineCard } from "../define.js";

// EDHREC rank 30698.

export default defineCard({
  name: "Kagemaro's Clutch",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets -X/-X, where X is the number of cards in your hand.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { cardsInHand: true, pt: [-1, -1] },
      text: "Enchanted creature gets -X/-X, where X is the number of cards in your hand.",
    },
  ],
});
