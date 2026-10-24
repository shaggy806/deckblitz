import { defineCard } from "../define.js";

export default defineCard({
  name: "Spontaneous Mutation",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nEnchanted creature gets -X/-0, where X is the number of cards in your graveyard.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { inGraveyard: { ownedBy: "you" }, pt: [-1, 0] },
      text: "Enchanted creature gets -X/-0, where X is the number of cards in your graveyard.",
    },
  ],
});
