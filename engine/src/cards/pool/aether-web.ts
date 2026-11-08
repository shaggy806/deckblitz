import { defineCard } from "../define.js";

const WEB_TEXT =
  "Enchanted creature gets +1/+1, has reach, and can block creatures with shadow as though they didn't have shadow.";

export default defineCard({
  name: "Aether Web",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\nEnchant creature\n" + WEB_TEXT + " (Creatures with reach can block creatures with flying.)",
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 1], grantKeywords: ["reach"], blocksAsThoughShadow: true, text: WEB_TEXT },
  ],
});
