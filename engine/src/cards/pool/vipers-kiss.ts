import { defineCard } from "../define.js";

// EDHREC rank 18695.

export default defineCard({
  name: "Viper's Kiss",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets -1/-1, and its activated abilities can't be activated.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-1, -1],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted creature gets -1/-1, and its activated abilities can't be activated.",
    },
  ],
});
