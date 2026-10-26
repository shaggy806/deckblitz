import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 29796.
//
// Rulings:
//   [2012-05-01] The creature can later gain flying from another effect. That will override
//     Grounded's effect.
//
// A layer-6 removal, timestamp-ordered with later grants (rule 613.7).

export default defineCard({
  name: "Grounded",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature loses flying.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      loseKeywords: ["flying"],
      text: "Enchanted creature loses flying.",
    },
  ],
});
