import { defineCard } from "../define.js";

// EDHREC rank 13513.

const TEXT = "Enchanted creature has flying, first strike, and vigilance.";

export default defineCard({
  name: "Asha's Favor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantKeywords: ["flying", "first-strike", "vigilance"], text: TEXT }],
});
