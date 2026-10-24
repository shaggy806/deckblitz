import { defineCard } from "../define.js";

// EDHREC rank 25704.
//
// "Loses flying" is a layer-6 effect with the Aura's timestamp: flying
// granted after it attached wins (the ruling).

const STATIC_TEXT = "Enchanted creature gets -6/-0 and loses flying.";

export default defineCard({
  name: "Tightening Coils",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-6, 0],
      loseKeywords: ["flying"],
      text: STATIC_TEXT,
    },
  ],
});
