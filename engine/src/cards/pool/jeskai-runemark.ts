import { defineCard } from "../define.js";

// EDHREC rank 24319.
//
// Rulings:
//   [2014-11-24] Whether a creature has flying is checked as blocking creatures are declared. Once
//     the enchanted creature blocks or is blocked, losing flying won’t change or undo that block.

export default defineCard({
  name: "Jeskai Runemark",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2.\nEnchanted creature has flying as long as you control a red or white permanent.",
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." },
    {
      affects: { scope: "attached" },
      condition: {
        kind: "controls",
        filter: { anyOf: [{ colors: ["R"] }, { colors: ["W"] }] },
        atLeast: 1,
        countsSelf: true,
      },
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying as long as you control a red or white permanent.",
    },
  ],
});
