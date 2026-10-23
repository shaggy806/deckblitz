import { defineCard } from "../define.js";

// EDHREC rank 8197.
//
// Rulings:
//   [2008-08-01] If the enchanted creature is both of the listed colors, it will get both bonuses.

const GREEN_TEXT = "As long as enchanted creature is green, it gets +1/+1 and has vigilance.";
const BLUE_TEXT = "As long as enchanted creature is blue, it gets +1/+1 and has flying.";

export default defineCard({
  name: "Favor of the Overbeing",
  manaCost: "{1}{G/U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GREEN_TEXT}\n${BLUE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["G"] } } },
      grantPt: [1, 1],
      grantKeywords: ["vigilance"],
      text: GREEN_TEXT,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { colors: ["U"] } } },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: BLUE_TEXT,
    },
  ],
});
