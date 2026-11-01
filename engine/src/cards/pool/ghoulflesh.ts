import { defineCard } from "../define.js";

// EDHREC rank 28989. Black and Zombie added to the creature's own (layers 5
// and 4), as Deep Freeze's blue Wall.

const TEXT = "Enchanted creature gets -1/-1 and is a black Zombie in addition to its other colors and types.";

export default defineCard({
  name: "Ghoulflesh",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-1, -1],
      addColors: ["B"],
      addSubtypes: ["Zombie"],
      text: TEXT,
    },
  ],
});
