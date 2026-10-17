import { defineCard } from "../define.js";

// Rule 111.10p: a colorless Aura Role enchantment token named Virtuous. "You"
// is the Role's controller; it counts itself, an enchantment too.
export default defineCard({
  name: "Virtuous Role Token",
  art: "https://cards.scryfall.io/art_crop/back/2/7/27927100-2587-4e05-9957-eb183d46c1f0.jpg",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Aura", "Role"],
  text: "Enchant creature\nEnchanted creature gets +1/+1 for each enchantment you control.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { type: "enchantment", controlledBy: "you" }, pt: [1, 1] },
      text: "Enchanted creature gets +1/+1 for each enchantment you control.",
    },
  ],
});
