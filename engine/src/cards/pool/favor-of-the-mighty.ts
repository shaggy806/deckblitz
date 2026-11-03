import { defineCard } from "../define.js";

// Every creature tied for the greatest mana value has it, whoever controls them.
export default defineCard({
  name: "Favor of the Mighty",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["kindred", "enchantment"],
  subtypes: ["Giant"],
  text: "Each creature with the greatest mana value has protection from each color.",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", greatestInZone: { of: "mana-value", among: { type: "creature" } } },
      },
      protection: { colors: ["W", "U", "B", "R", "G"] },
      text: "Each creature with the greatest mana value has protection from each color.",
    },
  ],
});
