import { defineCard } from "../define.js";

// "All creatures able to block it do so" forces only creatures already able
// to block it (the rulings): the `must-be-blocked` requirement.
const STATIC_TEXT = "Enchanted creature gets +4/+4 and has first strike, and all creatures able to block it do so.";

export default defineCard({
  name: "Indrik Umbra",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: `Enchant creature\n${STATIC_TEXT}\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [4, 4],
      grantKeywords: ["first-strike"],
      restrictions: ["must-be-blocked"],
      text: STATIC_TEXT,
    },
  ],
});
