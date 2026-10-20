import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 16297. "Is every creature type" is Omo, Queen
// of Vesuva's layer-4 grant, on the enchanted creature.
const TEXT = "Enchanted creature gets +2/+2, has reach, and is every creature type.";

export default defineCard({
  name: "Arachnoform",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["reach"],
      addSubtypes: ["(every creature type)"],
      text: TEXT,
    },
  ],
});
