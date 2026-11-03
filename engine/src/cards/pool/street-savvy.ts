import { defineCard } from "../define.js";

const TEXT =
  "Enchanted creature gets +0/+2 and can block creatures with landwalk abilities as though they didn't have those abilities.";

export default defineCard({
  name: "Street Savvy",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 2],
      blocksDespiteLandwalk: true,
      text: TEXT,
    },
  ],
});
