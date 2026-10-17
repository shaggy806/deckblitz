import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// Rule 111.10m: a colorless Aura Role enchantment token named Royal.
export default defineCard({
  name: "Royal Role Token",
  art: "https://cards.scryfall.io/art_crop/front/c/f/cff8ef48-2988-4d21-837e-01f1459e07c5.jpg",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Aura", "Role"],
  text: "Enchant creature\nEnchanted creature gets +1/+1 and has ward {1}.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [ward({ mana: "{1}" })],
      text: "Enchanted creature gets +1/+1 and has ward {1}.",
    },
  ],
});
