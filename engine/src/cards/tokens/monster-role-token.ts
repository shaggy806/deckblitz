import { defineCard } from "../define.js";

// Rule 111.10k: a colorless Aura Role enchantment token named Monster.
export default defineCard({
  name: "Monster Role Token",
  art: "https://cards.scryfall.io/art_crop/front/6/b/6b8a810b-8538-41c3-a792-dbd1a1845faa.jpg",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Aura", "Role"],
  text: "Enchant creature\nEnchanted creature gets +1/+1 and has trample.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: "Enchanted creature gets +1/+1 and has trample.",
    },
  ],
});
