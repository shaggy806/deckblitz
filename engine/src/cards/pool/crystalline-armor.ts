import { defineCard } from "../define.js";

const TEXT = "Enchanted creature gets +1/+1 for each land you control and has trample.";

export default defineCard({
  name: "Crystalline Armor",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { type: "land", controlledBy: "you" }, pt: [1, 1] },
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
