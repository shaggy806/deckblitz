import { defineCard } from "../define.js";

// EDHREC rank 20924. Fear of Death's static: X is live (the ruling), the
// Aura's controller's graveyard.
const PT_TEXT = "Enchanted creature gets -X/-0, where X is the number of cards in your graveyard.";

export default defineCard({
  name: "Spontaneous Mutation",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${PT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { inGraveyard: { ownedBy: "you" }, pt: [-1, 0] },
      text: PT_TEXT,
    },
  ],
});
