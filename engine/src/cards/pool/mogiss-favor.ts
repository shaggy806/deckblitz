import { defineCard } from "../define.js";

export default defineCard({
  name: "Mogis's Favor",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/-1.\nEscape—{2}{B}, Exile two other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  targets: ["creature"],
  escape: { cost: "{2}{B}", exileCount: 2 },
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, -1],
      text: "Enchanted creature gets +2/-1.",
    },
  ],
});
