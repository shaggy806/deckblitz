import { defineCard } from "../define.js";

// Apocalypse (APC). Mind Control's control, Armadillo Cloak's grant.
export default defineCard({
  name: "Yavimaya's Embrace",
  manaCost: "{5}{G}{U}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nYou control enchanted creature.\nEnchanted creature gets +2/+2 and has trample.",
  targets: ["creature"],
  controlEnchanted: true,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["trample"],
      text: "Enchanted creature gets +2/+2 and has trample.",
    },
  ],
});
