import { defineCard } from "../define.js";

export default defineCard({
  name: "Aboshan's Desire",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has flying.\nThreshold — Enchanted creature has shroud as long as there are seven or more cards in your graveyard. (It can't be the target of spells or abilities.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying.",
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "threshold" },
      grantKeywords: ["shroud"],
      text: "Threshold — Enchanted creature has shroud as long as there are seven or more cards in your graveyard.",
    },
  ],
});
